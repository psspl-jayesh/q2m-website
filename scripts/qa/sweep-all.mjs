// Responsive sweep of EVERY pre-rendered route at 360/390/768/1024/1440/1920, light and dark (4 pages in parallel).
// Resumable: results go to results/sweep-all.jsonl and rows already there are skipped. Fresh run: delete that file.
// Per load: horizontal overflow, elements off the right edge, broken images, text hidden by a stuck reveal, wrapped buttons,
// clipped text, empty sections, H1 count, layout shift (CLS), console errors, tap targets under 44px on phones,
// images shown larger than their source.
import puppeteer from 'puppeteer-core'
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { BASE, CHROME, ROOT } from './config.mjs'

const OUT = new URL('./results/sweep-all.jsonl', import.meta.url)
const done = new Set(existsSync(OUT) ? readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const r = JSON.parse(l); return `${r.route}|${r.w}|${r.th}` }) : [])
const routes = []
const walk = (d, p) => { for (const f of readdirSync(d)) { const full = `${d}/${f}`; if (statSync(full).isDirectory()) { if (f !== 'assets' && f !== 'images') walk(full, `${p}${f}/`) } else if (f === 'index.html') routes.push(p) } }
walk(ROOT + 'dist', '/')
const only = process.env.ONLY?.split(',')
const widths = (process.env.WIDTHS || '360,390,768,1024,1440,1920').split(',').map(Number)
const themes = (process.env.THEMES || 'light,dark').split(',')
const jobs = []
for (const route of routes.filter((r) => !only || only.includes(r))) for (const w of widths) for (const th of themes) if (!done.has(`${route}|${w}|${th}`)) jobs.push({ route, w, th })
console.log(`${jobs.length} loads to do (${done.size} already done)`)

// one browser per worker: every page is the foreground tab, so animation frames and reveal timers run normally
async function run(b, { route, w, th }) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: w < 768 ? 800 : 900, isMobile: w < 768, hasTouch: w < 768 })
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') errs.push(`${m.type()}: ${m.text().slice(0, 160)}`) })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) }, th)
  await p.goto(BASE + encodeURI(route), { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(async () => { [...document.images].forEach((i) => (i.loading = 'eager')); for (let y = 0; y < document.documentElement.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } await new Promise((r) => setTimeout(r, 1200)) })
  const m = await p.evaluate((mobile) => {
    const op = (e) => { let o = 1; for (let n = e; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o }
    const vw = document.documentElement.clientWidth
    const vis = (e) => e.offsetParent && e.getBoundingClientRect().width > 0
    const btns = [...document.querySelectorAll('a.inline-flex.min-h-12, button.inline-flex.min-h-12')].filter(vis)
    const wrap = btns.filter((e) => e.getBoundingClientRect().height > 56).map((e) => e.textContent.trim().slice(0, 40))
    const clipped = [...document.querySelectorAll('h1, h2, h3, dd, b, p, a, button, label')].filter((e) => vis(e) && e.scrollWidth > e.clientWidth + 2 && /hidden|clip/.test(getComputedStyle(e).overflowX) && !e.closest('.logo-marquee, .marquee, .sr-only')).map((e) => e.textContent.trim().slice(0, 30))
    const offRight = [...document.querySelectorAll('body *')].filter((e) => { if (!vis(e) || e.closest('.logo-marquee, .marquee, .sr-only, [aria-hidden="true"]')) return false; const r = e.getBoundingClientRect(); return r.right > vw + 1 }).map((e) => e.tagName + '.' + String(e.className).slice(0, 30)).slice(0, 3)
    const secs = [...document.querySelectorAll('main section')].filter((s) => !s.parentElement.closest('section'))
    // tap targets on phones: visible links/buttons outside running text smaller than 44px in both directions
    const small = mobile ? [...document.querySelectorAll('a, button, input, select, textarea, summary')].filter((e) => {
      if (!vis(e) || e.closest('p, li p, .sr-only, [aria-hidden="true"]') && e.tagName === 'A') return false
      // a form control's label is part of its tap target: count the label's size when it is larger
      const lab = e.closest('label') || (e.id && document.querySelector(`label[for="${e.id}"]`))
      const r = (lab && lab.getBoundingClientRect().height >= 44) ? lab.getBoundingClientRect() : e.getBoundingClientRect()
      return r.height < 44 && r.width < 44 && !e.closest('.logo-marquee')
    }).map((e) => `${e.tagName}:${(e.getAttribute('aria-label') || e.textContent).trim().slice(0, 24)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`) : []
    // source pixel width of the file actually shown: the w-descriptor from srcset (naturalWidth is density-adjusted by sizes)
    const srcW = (i) => { const sets = [i.srcset, ...[...(i.parentElement?.querySelectorAll('source') ?? [])].map((x) => x.srcset)].join(','); const file = i.currentSrc.split('/').pop(); const m = sets.split(',').map((x) => x.trim().split(/\s+/)).find(([u]) => u && u.endsWith(file)); return m && /w$/.test(m[1] || '') ? parseInt(m[1]) : i.naturalWidth }
    const upscaled = [...document.images].filter((i) => vis(i) && i.complete && i.currentSrc && !/\.svg/.test(i.currentSrc) && getComputedStyle(i).objectFit !== 'cover' && i.getBoundingClientRect().width > srcW(i) * 1.05).map((i) => `${i.currentSrc.split('/').pop()} shown ${Math.round(i.getBoundingClientRect().width)}px from ${srcW(i)}px`)
    return {
      h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - vw, offRight,
      broken: [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src.split('/').pop()),
      hidden: [...document.querySelectorAll('main h2, main h3, main p, main form, footer p')].filter((e) => vis(e) && op(e) < 0.5).length,
      wrap, clipped, empty: secs.filter((s) => s.getBoundingClientRect().height < 40).length, cls: +window.__cls.toFixed(3), small: [...new Set(small)].slice(0, 6), upscaled,
    }
  }, w < 768)
  await p.close()
  const row = { route, w, th, ...m, errs }
  const issue = m.overflow > 0 || m.offRight.length || m.broken.length || m.hidden || m.wrap.length || m.clipped.length || m.empty || m.h1 !== 1 || m.cls > 0.01 || errs.length || m.small.length || m.upscaled.length
  appendFileSync(OUT, JSON.stringify(row) + '\n')
  if (issue) console.log('ISSUE', route, w, th, JSON.stringify({ ...m, errs }).slice(0, 400))
}
let i = 0
await Promise.all(Array.from({ length: +(process.env.CONC || 4) }, async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
  while (i < jobs.length) { const j = jobs[i++]; try { await run(b, j) } catch (e) { console.log('FAIL', j.route, j.w, j.th, String(e).slice(0, 120)) } }
  await b.close()
}))
console.log('done')
