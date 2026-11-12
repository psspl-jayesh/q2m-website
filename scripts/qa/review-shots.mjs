// Full-page screenshots for a visual review: desktop (1440, dark) and phone (390, light) for each page, saved to
// results/review/<name>-1440-dark.jpg and -390-light.jpg. Pages: PAGES env "name=/path/,name=/path/" or the default set.
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { BASE, CHROME, ROOT } from './config.mjs'

const DEFAULT = 'home=/,bts=/bengaluru-tech-summit-2026/,about=/about/,contact=/contact/,privacy=/privacy-policy/,service=/ai-consulting-services/,service2=/cloud-applications/,service3=/microsoft-fabric-services/,blogs=/blogs/,article=/top-ai-agent-development-companies/,cases=/case-studies/,case=/case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/,category=/category/development/,notfound=/no-such-page/'
const pages = (process.env.PAGES || DEFAULT).split(',').map((x) => x.split('='))
const dir = ROOT + 'scripts/qa/results/review/'
mkdirSync(dir, { recursive: true })
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
for (const [name, path] of pages) for (const [w, th] of [[1440, 'dark'], [390, 'light']]) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(BASE + path, { waitUntil: 'networkidle0', timeout: 60000 })
  await p.evaluate(async () => { [...document.images].forEach((i) => (i.loading = 'eager')); for (let y = 0; y < document.documentElement.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } await new Promise((r) => setTimeout(r, 1200)); window.scrollTo(0, 0) })
  // the sticky header and the back-to-top button would repeat in a full-page capture: hide them for the shot
  await p.addStyleTag({ content: 'header{position:relative!important}.btt{display:none!important}' })
  await new Promise((r) => setTimeout(r, 300))
  await p.screenshot({ path: `${dir}${name}-${w}-${th}.jpg`, fullPage: true, type: 'jpeg', quality: 60 })
  await p.close()
}
await b.close()
console.log('saved to', dir)
