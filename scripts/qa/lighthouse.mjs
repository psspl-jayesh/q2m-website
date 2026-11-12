// Lighthouse on the production build served on :4173. FORM=mobile (default: emulated Moto G, simulated Slow 4G + 4x CPU)
// or FORM=desktop (Lighthouse's desktop preset: 1350x940, fast connection, no CPU slowdown). Usage: node lighthouse.mjs "/,/contact/"
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'
import { BASE, CHROME } from './config.mjs'
const base = BASE
const urls = (process.argv[2] || '/bengaluru-tech-summit-2026/').split(',')
const out = []
const desktop = process.env.FORM === 'desktop'
for (const u of urls) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
  const port = new URL(browser.wsEndpoint()).port
  const cats = ['performance', 'accessibility', 'best-practices', 'seo']
  const r = desktop
    ? await lighthouse(base + u, { port, output: 'json', logLevel: 'error', onlyCategories: cats }, desktopConfig)
    : await lighthouse(base + u, { port, output: 'json', logLevel: 'error', formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false }, throttlingMethod: 'simulate', onlyCategories: cats })
  const l = r.lhr; const a = l.audits
  const row = { url: u, form: desktop ? 'desktop' : 'mobile', performance: Math.round(l.categories.performance.score * 100), accessibility: Math.round(l.categories.accessibility.score * 100), bestPractices: Math.round(l.categories['best-practices'].score * 100), seo: Math.round(l.categories.seo.score * 100), fcp: a['first-contentful-paint'].displayValue, lcp: a['largest-contentful-paint'].displayValue, tbt: a['total-blocking-time'].displayValue, cls: a['cumulative-layout-shift'].displayValue, si: a['speed-index'].displayValue,
    failing: Object.values(a).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual').map((x) => `${x.id}(${Math.round(x.score * 100)})`).slice(0, 14) }
  out.push(row); console.log(JSON.stringify(row))
  await browser.close()
}
writeFileSync(new URL(process.env.LHOUT || './results/lighthouse.json', import.meta.url), JSON.stringify(out, null, 1))
