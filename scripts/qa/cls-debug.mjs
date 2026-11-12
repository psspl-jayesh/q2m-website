// Layout-shift sources on one page while scrolling through it. Usage: node cls-debug.mjs /path/ [width] [theme]
import puppeteer from 'puppeteer-core'
import { BASE, CHROME } from './config.mjs'
const [path, w = '1024', th = 'light'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (let run = 0; run < 3; run++) {
  const p = await b.newPage(); await p.setViewport({ width: +w, height: 900 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } window.__s = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), y: Math.round(scrollY), src: e.sources.map((s) => `${s.node?.nodeName}.${String(s.node?.className?.baseVal ?? s.node?.className ?? '').slice(0, 50)} ${Math.round(s.previousRect.y)}->${Math.round(s.currentRect.y)} h${Math.round(s.previousRect.height)}->${Math.round(s.currentRect.height)}`) }) }).observe({ type: 'layout-shift', buffered: true }) }, th)
  await p.goto(BASE + path, { waitUntil: 'networkidle0' })
  await p.evaluate(async () => { [...document.images].forEach((i) => (i.loading = 'eager')); for (let y = 0; y < document.documentElement.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } await new Promise((r) => setTimeout(r, 1200)) })
  const s = await p.evaluate(() => window.__s)
  console.log(`run ${run}: total ${s.reduce((a, x) => a + x.v, 0).toFixed(3)}`, JSON.stringify(s).slice(0, 700))
  await p.close()
}
await b.close()
