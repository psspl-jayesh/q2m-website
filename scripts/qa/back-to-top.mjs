// Back-to-top checks. node btt.mjs <base> [--shots]
import puppeteer from 'puppeteer-core'
import { BASE, CHROME, ROOT } from './config.mjs'
const base = process.argv[2] || BASE
const shots = process.argv.includes('--shots')
const PAGES = [['home', '/'], ['landing', '/bengaluru-tech-summit-2026/'], ['service', '/ai-consulting-services/'], ['contact', '/contact/']]
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const state = (p) => p.evaluate(() => {
  const el = document.querySelector('.btt'); const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
  const prog = document.querySelector('.btt-progress'); const C = +prog.getAttribute('stroke-dasharray')
  const max = document.documentElement.scrollHeight - innerHeight
  return { visible: cs.visibility === 'visible' && +cs.opacity > 0.9, y: Math.round(scrollY), ring: +(1 - parseFloat(prog.style.strokeDashoffset || C) / C).toFixed(3), expect: +(max > 0 ? scrollY / max : 0).toFixed(3),
    rect: [r.left, r.top, r.right, r.bottom].map(Math.round), vw: innerWidth, vh: innerHeight }
})
const rows = []
for (const [name, path] of PAGES.filter((x) => !process.env.ONLY || process.env.ONLY.split(',').includes(x[0]))) for (const w of (process.env.WIDTHS || '360,768,1440').split(',').map(Number)) for (const th of (process.env.THEMES || 'light,dark').split(',')) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: w < 768 ? 780 : 900, isMobile: w < 768, hasTouch: w < 768 })
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)) })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value }).observe({ type: 'layout-shift', buffered: true }) }, th)
  await p.goto(base + path, { waitUntil: 'networkidle0' }); await wait(500)
  const r = { name, w, th, errs }
  r.top = (await state(p)).visible
  await p.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' })); await wait(500); r.at400 = (await state(p)).visible
  await p.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' })); await wait(600); const s900 = await state(p); r.at900 = s900.visible
  await p.evaluate(() => { const y = Math.round((document.documentElement.scrollHeight - innerHeight) / 2); window.scrollTo({ top: y, behavior: 'instant' }); return y }); await wait(500)
  const sm = await state(p); r.ringMid = [sm.ring, sm.expect]
  // inside the viewport, 16/24px from the edges
  r.edges = [sm.vw - sm.rect[2], sm.vh - sm.rect[3]]
  // overlap scan: every 250px, the visible button must not cover a form control or the footer bottom bar
  r.overlaps = await p.evaluate(async () => {
    const hits = []; const H = document.documentElement.scrollHeight
    for (let y = 0; y < H; y += 250) {
      window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 550))
      const el = document.querySelector('.btt'); if (getComputedStyle(el).visibility !== 'visible') continue
      const b = el.getBoundingClientRect()
      const hit = [...document.querySelectorAll('input, select, textarea, form button, [data-back-to-top-avoid] a, [data-back-to-top-avoid] button')].filter((n) => { const r = n.getBoundingClientRect(); return !n.closest('details:not([open])') && r.width && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top })
      if (hit.length) hits.push(y + ':' + hit.map((n) => n.tagName + (n.getAttribute('aria-label') || n.name || '')).join('|'))
    }
    return hits
  })
  await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await wait(600)
  const sb = await state(p); r.ringBottom = sb.ring
  if (shots && (name === 'landing') && (w === 360 || w === 1440)) {
    await p.evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' })); await wait(700)
    await p.screenshot({ path: `${ROOT}scripts/qa/results/btt-${w}-${th}.png`, clip: { x: Math.max(0, sm.vw - 360), y: sm.vh - 260, width: Math.min(360, sm.vw), height: 260 } })
  }
  const spot = await p.evaluate(async () => { for (let y = 700; y < document.documentElement.scrollHeight; y += 150) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 550)); if (getComputedStyle(document.querySelector('.btt')).visibility === 'visible') return y } return -1 })
  r.spot = spot
  const sv = await state(p); r.edges = [sv.vw - sv.rect[2], sv.vh - sv.rect[3]]
  // click (mouse): smooth scroll to top, focus on <main>
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), spot); await wait(700)
  await p.click('.btt-button'); await wait(1800)
  r.click = await p.evaluate(() => ({ y: Math.round(scrollY), focus: document.activeElement?.id || document.activeElement?.tagName }))
  // keyboard: Tab to the button and press Enter -> focus on the skip link
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), spot); await wait(700)
  await p.evaluate(() => document.querySelector('.btt-button').focus()); await p.keyboard.press('Enter'); await wait(1800)
  r.key = await p.evaluate(() => ({ y: Math.round(scrollY), focus: document.activeElement?.textContent?.trim().slice(0, 20) }))
  // Space key
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), spot); await wait(700)
  await p.evaluate(() => document.querySelector('.btt-button').focus()); await p.keyboard.press('Space'); await wait(1800)
  r.space = await p.evaluate(() => Math.round(scrollY))
  // mobile menu open -> hidden
  if (w < 1024) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), spot); await wait(700)
    await p.click('button[aria-controls="mobile-nav"]'); await wait(500)
    r.menuHidden = !(await state(p)).visible
    await p.keyboard.press('Escape'); await wait(300)
  }
  r.a11y = await p.evaluate(() => { const bt = document.querySelector('.btt-button'); return [bt.tagName, bt.getAttribute('aria-label'), bt.type].join(' ') })
  r.cls = await p.evaluate(() => +window.__cls.toFixed(3))
  const ok = !r.top && !r.at400 && r.at900 && Math.abs(r.ringMid[0] - r.ringMid[1]) < 0.02 && r.ringBottom > 0.98 && !r.overlaps.length && r.click.y === 0 && r.click.focus === 'main' &&
    r.key.y === 0 && r.key.focus === 'Skip to content' && r.space === 0 && (r.menuHidden ?? true) && r.cls <= 0.01 && !errs.length && r.edges.every((e) => e >= 15)
  rows.push(r); console.log(ok ? 'ok' : 'ISSUE', name, w, th, ok ? `edges=${r.edges} ring=${r.ringMid} cls=${r.cls}` : JSON.stringify(r))
  await p.close()
}
// reduced motion: no animation, instant jump
{ const p = await b.newPage(); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await p.setViewport({ width: 1440, height: 900 })
  await p.goto(base + '/', { waitUntil: 'networkidle0' }); await p.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' })); await wait(400)
  const t = await p.evaluate(() => { const el = document.querySelector('.btt'); return getComputedStyle(el).transitionDuration })
  await p.click('.btt-button'); await wait(60)
  const y = await p.evaluate(() => scrollY)
  const anim = await p.evaluate(() => { const a = document.querySelector('.btt-arrow'); return getComputedStyle(a).animationName })
  console.log('reduced motion:', JSON.stringify({ transitionDuration: t, scrollYAfter60ms: y, arrowAnimation: anim })); await p.close() }
await b.close()
