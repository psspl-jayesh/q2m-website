// Screenshot one element at several widths/themes. Usage: node section-shot.mjs <path> <selector> <outPrefix> [widths] [themes]
// e.g. node section-shot.mjs / "#bts" results/bts-card 390,768,1440 light,dark
import puppeteer from 'puppeteer-core'
import { BASE, CHROME, ROOT } from './config.mjs'
const [path, sel, out, widths = '390,768,1440', themes = 'light,dark'] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const w of widths.split(',').map(Number)) for (const th of themes.split(',')) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  const errs = []; p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warn') errs.push(m.text().slice(0, 120)) })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(BASE + path, { waitUntil: 'networkidle0' })
  await p.addStyleTag({ content: 'header{position:relative!important}.btt{display:none!important}' })
  const el = await p.$(sel)
  await p.evaluate((e) => e.scrollIntoView({ block: 'center' }), el); await new Promise((r) => setTimeout(r, 1500))
  const m = await p.evaluate((e) => ({ h: Math.round(e.getBoundingClientRect().height), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }), el)
  await el.screenshot({ path: `${ROOT}scripts/qa/${out}-${w}-${th}.png` })
  console.log(w, th, JSON.stringify({ ...m, errs }))
  await p.close()
}
await b.close()
