// Keyboard check: Tab through the first N focus stops of each page; every stop must be visible on screen and show a focus
// indicator (outline or ring). Also: the first stop is the skip link, and Enter on it moves focus to <main>.
// Usage: node keyboard.mjs "/,/contact/"   (N via STOPS, default 40)
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const paths = (process.argv[2] || '/,/contact/,/bengaluru-tech-summit-2026/,/ai-consulting-services/').split(',')
const N = +(process.env.STOPS || 40)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
let bad = 0
for (const path of paths) for (const th of ['light', 'dark']) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(BASE + path, { waitUntil: 'networkidle0' })
  const stops = []
  for (let i = 0; i < N; i++) {
    await p.keyboard.press('Tab'); await new Promise((r) => setTimeout(r, 1500)) // let smooth scrolling finish (long jumps take over a second)
    stops.push(await p.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return { none: true }
      const cs = getComputedStyle(e); const r = e.getBoundingClientRect()
      const shows = (x) => { const c = getComputedStyle(x); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || (/rgb/.test(c.boxShadow) && c.boxShadow !== 'none') }
      const ring = shows(e) || (e.parentElement && shows(e.parentElement)) // a wrapper may show the ring (phone field with +91)
      const header = document.querySelector('header'); const hb = header && !header.contains(e) ? header.getBoundingClientRect().bottom : 0
      void cs
      return { tag: e.tagName, name: (e.getAttribute('aria-label') || e.textContent || e.id || '').trim().slice(0, 28), ring, onScreen: r.width > 0 && r.height > 0 && r.top >= hb - 1 && r.top < innerHeight - 20, pos: [Math.round(r.top), Math.round(r.bottom), Math.round(hb)], hiddenParent: !!e.closest('[aria-hidden="true"], [inert]') }
    }))
  }
  const problems = stops.filter((s) => !s.none && (!s.ring || !s.onScreen || s.hiddenParent))
  const skip = stops[0]?.name?.startsWith('Skip')
  // skip link moves focus to main
  await p.goto(BASE + path, { waitUntil: 'networkidle0' }); await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 400))
  const afterSkip = await p.evaluate(() => document.activeElement?.id || document.activeElement?.tagName)
  if (problems.length || !skip || afterSkip !== 'main') bad++
  console.log(problems.length || !skip || afterSkip !== 'main' ? 'ISSUE' : 'ok', path, th, `stops=${stops.filter((s) => !s.none).length} firstIsSkip=${skip} skipTo=${afterSkip}`, problems.length ? JSON.stringify(problems.slice(0, 5)) : '')
  await p.close()
}
await b.close()
process.exit(bad ? 1 : 0)
