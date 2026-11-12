// axe-core on the forms with every validation error showing (submit empty), light and dark: error text contrast, labels, ARIA.
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { BASE, CHROME } from './config.mjs'
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
let total = 0
for (const [path, sel] of [['/contact/', 'form[aria-label="Contact form"]'], ['/', 'form[aria-label="Book a session"]'], ['/bengaluru-tech-summit-2026/', 'form[aria-label="Book a session"]']]) for (const th of ['light', 'dark']) for (const w of [1440, 390]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(BASE + path, { waitUntil: 'networkidle0' })
  await p.evaluate(async (s) => { const f = document.querySelector(s); f.scrollIntoView(); await new Promise((r) => setTimeout(r, 1200)); f.querySelector('button[type="submit"], button:not([type])').click(); await new Promise((r) => setTimeout(r, 600)) }, sel)
  await p.addScriptTag({ content: axeSource })
  const v = await p.evaluate(async (s) => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document.querySelector(s), { resultTypes: ['violations'] })
    return { errors: document.querySelectorAll(`${s} [aria-invalid="true"]`).length, violations: r.violations.map((x) => `${x.id}(${x.nodes.length}) ${x.nodes[0]?.failureSummary?.slice(0, 120)}`) }
  }, sel)
  total += v.violations.length
  console.log(v.violations.length ? 'VIOLATIONS' : 'ok', path, th, w, `fields in error: ${v.errors}`, v.violations.join(' | '))
  await p.close()
}
await b.close()
process.exit(total ? 1 : 0)
