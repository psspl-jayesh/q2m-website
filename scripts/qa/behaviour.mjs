// Behaviour on the pre-rendered production build (vite preview :4173).
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const B = BASE
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const fakeNow = (iso) => `(() => { const T = Date.parse(${JSON.stringify(iso)}); const off = T - Date.now(); const D = Date;
  class F extends D { constructor(...a) { if (a.length) super(...a); else super(D.now() + off) } static now() { return D.now() + off } }
  globalThis.Date = F })()`
async function open(path, { w = 1440, now, theme } = {}) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) })
  if (now) await p.evaluateOnNewDocument(fakeNow(now))
  if (theme) await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, theme)
  await p.evaluateOnNewDocument(() => { document.addEventListener('DOMContentLoaded', () => { window.__staleAtDcl = document.documentElement.classList.contains('bts-stale'); const el = document.querySelector('#root > *'); if (el) el.__ssrMark = true }) })
  await p.goto(B + path, { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 800))
  return { p, errs }
}
const out = {}
const AFTER = '2026-11-19T18:01:00+05:30', LIVE = '2026-11-18T10:00:00+05:30'

// 1. Landing before the event: countdown filled, booking form dates filled, hydrated
{ const { p, errs } = await open('/bengaluru-tech-summit-2026/')
  out.landingBefore = await p.evaluate(() => ({ hydrated: !!document.querySelector('#root > *').__ssrMark, h1: document.querySelector('h1').textContent,
    countdown: [...document.querySelectorAll('dl dd')].slice(0, 3).map((d) => d.textContent), dateOptions: document.querySelector('#b-date')?.options.length,
    dateValue: document.querySelector('#b-date')?.value, timeOptions: document.querySelector('#b-time')?.options.length, book: !!document.querySelector('#book') }))
  out.landingBefore.errs = errs; await p.close() }
// 2. Landing and home after the event (clock faked on a build made before it): stale guard, fresh client render, BTS items gone
for (const [k, path] of [['landingAfter', '/bengaluru-tech-summit-2026/'], ['homeAfter', '/']]) {
  const { p, errs } = await open(path, { now: AFTER })
  out[k] = await p.evaluate(() => ({ staleAtDcl: window.__staleAtDcl, staleNow: document.documentElement.classList.contains('bts-stale'), rerendered: !document.querySelector('#root > *').__ssrMark,
    h1: document.querySelector('h1').textContent, book: !!document.querySelector('#book'), band: !!document.querySelector('#bts'), countdown: document.body.innerText.includes('Starts in'),
    biec: document.querySelector('main').innerText.includes('Find us at BIEC'), mainVisible: getComputedStyle(document.querySelector('#main')).visibility }))
  out[k].errs = errs; await p.close()
}
// 3. Landing during the event: countdown hidden
{ const { p, errs } = await open('/bengaluru-tech-summit-2026/', { now: LIVE })
  out.landingLive = await p.evaluate(() => ({ rerendered: !document.querySelector('#root > *').__ssrMark, countdown: document.body.innerText.includes('Starts in'), book: !!document.querySelector('#book') })); out.landingLive.errs = errs; await p.close() }
// 4. Home: menu highlighting, theme toggle, sticky column, reveal below the fold, client navigation
{ const { p, errs } = await open('/ai-consulting-services/', { theme: 'dark' })
  const r = {}
  r.themeAttr = await p.evaluate(() => document.documentElement.dataset.theme)
  r.toggleLabel = await p.evaluate(() => [...document.querySelectorAll('footer button')].map((x) => x.textContent).find((t) => /theme/i.test(t)))
  r.ariaCurrent = await p.evaluate(() => [...document.querySelectorAll('header [aria-current]')].map((a) => a.textContent.trim()))
  r.stickyAsides = await p.evaluate(() => [...document.querySelectorAll('.split-aside')].filter((e) => getComputedStyle(e).position === 'sticky').length)
  // reveal: an element far below the fold is hidden until scrolled to, then shown
  r.belowFoldBefore = await p.evaluate(() => { const els = [...document.querySelectorAll('main [style*="opacity"]')].filter((e) => e.getBoundingClientRect().top > 2000); return els.length ? getComputedStyle(els[0]).opacity : 'n/a' })
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } await new Promise((r) => setTimeout(r, 1200)) })
  r.hiddenAfterScroll = await p.evaluate(() => [...document.querySelectorAll('main h2, main h3, main p')].filter((e) => { let o = 1; for (let n = e; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return e.offsetParent && o < 0.5 }).length)
  // client-side navigation to Contact via the header link
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.evaluate(() => [...document.querySelectorAll('header a')].find((a) => a.getAttribute('href') === '/contact/')?.click())
  await new Promise((r) => setTimeout(r, 1500))
  r.afterNav = await p.evaluate(() => ({ path: location.pathname, title: document.title, canon: document.querySelector('link[rel=canonical]').href, h1: document.querySelector('h1')?.textContent, ariaCurrent: [...document.querySelectorAll('header [aria-current]')].map((a) => a.textContent.trim()) }))
  r.errs = errs; out.service = r; await p.close() }
// 5. Toggle theme works after hydration
{ const { p, errs } = await open('/contact/', { theme: 'light' })
  const before = await p.evaluate(() => document.documentElement.dataset.theme)
  await p.evaluate(() => [...document.querySelectorAll('footer button')].find((x) => /theme/i.test(x.textContent)).click())
  const after = await p.evaluate(() => document.documentElement.dataset.theme)
  out.themeToggle = { before, after, errs }; await p.close() }
await b.close()
console.log(JSON.stringify(out, null, 1))
