// Side-by-side full-page screenshots: a design HTML file (left) vs a page of the built site (right).
// Usage: node design-compare.mjs <designHtmlPath> <sitePath> <outPrefix> [widths] [theme]
// e.g.   node design-compare.mjs design/home-new/index.html / results/home-compare 1440,390 light
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'
import { pathToFileURL } from 'node:url'
import { BASE, CHROME, ROOT } from './config.mjs'

const [design, sitePath = '/', out = 'results/design-compare', widths = '1440,390', theme = 'light'] = process.argv.slice(2)
const designUrl = pathToFileURL(ROOT + design).href
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })

async function shot(url, w) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: 900, isMobile: w < 768, deviceScaleFactor: 1 })
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }])
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, theme)
  await p.goto(url, { waitUntil: 'networkidle0' })
  // scroll through so scroll-reveal content is shown and lazy images load, then pause moving parts
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)) } window.scrollTo({ top: 0, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 1500)) })
  await p.addStyleTag({ content: '*{animation-play-state:paused!important} .hd,header{position:relative!important} .btt{display:none!important}' })
  const buf = await p.screenshot({ fullPage: true })
  const h = await p.evaluate(() => document.documentElement.scrollHeight)
  await p.close()
  return { buf, h }
}

for (const w of widths.split(',').map(Number)) {
  const [l, r] = [await shot(designUrl, w), await shot(BASE + sitePath, w)]
  const gap = 24, label = 56
  const H = Math.max(l.h, r.h) + label
  const text = (s, x) => ({ input: Buffer.from(`<svg width="${w}" height="${label}"><text x="16" y="36" font-family="Arial" font-size="24" font-weight="700" fill="#0b0c0c">${s}</text></svg>`), left: x, top: 0 })
  await sharp({ create: { width: w * 2 + gap, height: H, channels: 3, background: '#d9dde4' } })
    .composite([text(`Design HTML · ${w}px · ${l.h}px tall`, 0), text(`New page · ${w}px · ${r.h}px tall`, w + gap), { input: l.buf, left: 0, top: label }, { input: r.buf, left: w + gap, top: label }])
    .png().toFile(`${ROOT}scripts/qa/${out}-${w}-${theme}.png`)
  console.log(w, theme, 'design', l.h, 'site', r.h, '->', `${out}-${w}-${theme}.png`)
}
await b.close()
