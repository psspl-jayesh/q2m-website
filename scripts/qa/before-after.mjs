// Before/after crops of the most visible fixes: OLD build vs NEW build. Usage: node before-after.mjs <oldBase> <newBase>
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { CHROME, ROOT } from './config.mjs'
const [OLD, NEW] = process.argv.slice(2)
const dir = ROOT + 'scripts/qa/results/before-after/'
mkdirSync(dir, { recursive: true })
const shots = [
  // [name, path, width, theme, prepare(page) -> element selector to capture]
  ['1-service-logos-dark', '/ai-consulting-services/', 1440, 'dark', async (p) => { await p.evaluate(() => { const e = [...document.querySelectorAll('main .eyebrow')].find((x) => /global clients/i.test(x.textContent)); e.closest('section').id = 'qa-logos' }); return '#qa-logos' }],
  ['2-contact-errors-dark', '/contact/', 1440, 'dark', async (p) => { await p.evaluate(() => document.querySelector('form[aria-label="Contact form"] button[type="submit"]').click()); await new Promise((r) => setTimeout(r, 500)); return 'form[aria-label="Contact form"]' }],
  ['3-category-list-dark', '/category/development/', 1440, 'dark', async () => 'main'],
  ['4-form-focus-light', '/contact/', 1440, 'light', async (p) => { await p.focus('#full-name'); await p.keyboard.type('A'); await p.keyboard.press('Backspace'); return 'form[aria-label="Contact form"]' }],
  ['5-footer-mobile-light', '/contact/', 390, 'light', async () => '[data-back-to-top-avoid]'],
]
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const [name, path, w, th, prep] of shots) for (const [label, base] of [['before', OLD], ['after', NEW]]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768, deviceScaleFactor: 1 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(base + path, { waitUntil: 'networkidle0' })
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } await new Promise((r) => setTimeout(r, 1500)) })
  await p.addStyleTag({ content: 'header{position:relative!important}.btt{display:none!important}' })
  const sel = await prep(p)
  const el = await p.$(sel)
  await p.evaluate((e) => e.scrollIntoView({ block: 'center' }), el); await new Promise((r) => setTimeout(r, 500))
  await el.screenshot({ path: `${dir}${name}-${label}.png` })
  await p.close()
}
await b.close()
console.log('saved', dir)
