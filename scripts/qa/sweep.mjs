// Landing + home, before/after BTS, 6 widths x 2 themes. Checks overflow, broken images, hidden text, wrapped CTA buttons,
// clipped text, empty sections, layout shift, console errors, one H1. Appends JSON lines to sweep.jsonl.
import puppeteer from 'puppeteer-core'
import { appendFileSync, writeFileSync } from 'node:fs'
import { BASE, CHROME } from './config.mjs'
const OUT = new URL(process.env.SWOUT || './results/sweep.jsonl', import.meta.url); writeFileSync(OUT, '')
const AFTER = '2026-11-19T18:01:00+05:30'
const PAGES = [['landing', '/bengaluru-tech-summit-2026/'], ['landing-after', '/bengaluru-tech-summit-2026/', AFTER], ['home', '/'], ['home-after', '/', AFTER],
  ['service', '/ai-consulting-services/'], ['contact', '/contact/'], ['about', '/about/'], ['privacy', '/privacy-policy/']]
const fakeNow = (iso) => `(() => { const T = Date.parse(${JSON.stringify(iso)}); const off = T - Date.now(); const D = Date;
  class F extends D { constructor(...a) { if (a.length) super(...a); else super(D.now() + off) } static now() { return D.now() + off } }
  globalThis.Date = F })()`
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const [name, path, now] of PAGES.filter((x) => !process.env.ONLY || process.env.ONLY.split(',').includes(x[0]))) for (const w of (process.env.WIDTHS || '360,390,768,1024,1440,1920').split(',').map(Number)) for (const th of ['light', 'dark']) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 }); await p.bringToFront()
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) }, th)
  if (now) await p.evaluateOnNewDocument(fakeNow(now))
  await p.goto(BASE + path, { waitUntil: 'load' }); await new Promise((r) => setTimeout(r, 900))
  for (let pass = 0; pass < 2; pass++) await p.evaluate(async () => { [...document.images].forEach((i) => (i.loading = 'eager')); for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)) } await new Promise((r) => setTimeout(r, 800)) })
  const m = await p.evaluate(() => {
    const op = (e) => { let o = 1; for (let n = e; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o }
    const vw = document.documentElement.clientWidth
    const buttons = [...document.querySelectorAll('main a.inline-flex.min-h-12, main button.inline-flex, main a.inline-flex[href*="google.com/maps"]')].filter((e) => e.offsetParent)
    const wrap = buttons.filter((e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getClientRects().length && e.getBoundingClientRect().height > 56 }).map((e) => e.textContent.trim().slice(0, 40))
    const clipped = [...document.querySelectorAll('main h1, main h2, main h3, main dd, main b, main p')].filter((e) => e.offsetParent && (e.scrollWidth > e.clientWidth + 2) && getComputedStyle(e).overflow !== 'visible').map((e) => e.textContent.slice(0, 30))
    const offRight = [...document.querySelectorAll('main *')].filter((e) => { if (!e.offsetParent || e.closest('.logo-marquee, .marquee')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1 }).length
    const secs = [...document.querySelectorAll('main section')].filter((s) => !s.parentElement.closest('section'))
    return {
      h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - vw, offRight,
      broken: [...document.images].filter((i) => i.complete && !i.naturalWidth).length,
      hidden: [...document.querySelectorAll('main h2, main h3, main p, main form')].filter((e) => e.offsetParent && op(e) < 0.5).length,
      wrap, clipped, empty: secs.filter((s) => s.getBoundingClientRect().height < 40).length, cls: +window.__cls.toFixed(3), height: document.documentElement.scrollHeight,
      bts: { book: !!document.querySelector('#book'), band: !!document.querySelector('#bts'), biec: document.body.innerText.includes('BIEC'), countdown: document.body.innerText.includes('Starts in') },
    }
  })
  const row = { name, w, th, ...m, errs }
  appendFileSync(OUT, JSON.stringify(row) + '\n')
  const bad = m.overflow || m.offRight || m.broken || m.hidden || m.wrap.length || m.clipped.length || m.empty || m.h1 !== 1 || m.cls > 0.1 || errs.length
  console.log(bad ? 'ISSUE' : 'ok', name, w, th, bad ? JSON.stringify(row) : `h=${m.height} cls=${m.cls} ${JSON.stringify(m.bts)}`)
  await p.close()
}
await b.close()
