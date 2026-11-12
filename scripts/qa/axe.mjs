// axe-core on every pre-rendered route (all default rules incl. best practices, WCAG 2.1 A/AA), light and dark, desktop and mobile.
// Resumable: results are appended to results/axe.jsonl; rows already there are skipped. Fresh run: delete that file.
// Filters: ONLY=/,/contact/  WIDTHS=1440,390  THEMES=light,dark
import puppeteer from 'puppeteer-core'
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { BASE, CHROME, ROOT } from './config.mjs'

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const OUT = new URL('./results/axe.jsonl', import.meta.url)
const done = new Set(existsSync(OUT) ? readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const r = JSON.parse(l); return `${r.route}|${r.w}|${r.th}` }) : [])
const routes = []
const walk = (d, p) => { for (const f of readdirSync(d)) { const full = `${d}/${f}`; if (statSync(full).isDirectory()) { if (f !== 'assets' && f !== 'images') walk(full, `${p}${f}/`) } else if (f === 'index.html') routes.push(p) } }
walk(ROOT + 'dist', '/')
const only = process.env.ONLY?.split(',')
const widths = (process.env.WIDTHS || '1440,390').split(',').map(Number)
const themes = (process.env.THEMES || 'light,dark').split(',')
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
let total = 0
for (const route of routes.filter((r) => !only || only.includes(r))) for (const w of widths) for (const th of themes) {
  if (done.has(`${route}|${w}|${th}`)) continue
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch { /* storage unavailable */ } }, th)
  await p.goto(BASE + encodeURI(route), { waitUntil: 'networkidle0' })
  // scroll through so every scroll-reveal has finished (no half-faded text when contrast is measured), then back to the top
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)) } await new Promise((r) => setTimeout(r, 1000)); window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 300)) })
  await p.addScriptTag({ content: axeSource })
  const res = await p.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { resultTypes: ['violations'] })
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(' '), summary: n.failureSummary?.slice(0, 200) })) }))
  })
  appendFileSync(OUT, JSON.stringify({ route, w, th, violations: res }) + '\n')
  total += res.length
  console.log(res.length ? 'VIOLATIONS' : 'ok', route, w, th, res.map((v) => `${v.id}(${v.nodes})`).join(' '))
  await p.close()
}
await b.close()
console.log('done, new violations this run:', total)
