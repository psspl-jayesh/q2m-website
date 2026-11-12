// Production build (vite preview :4173): load every pre-rendered route, check hydration (no React errors, the server DOM is
// kept: a marker node set before JS runs must survive), the page is not blank before JS, and the head tags are correct.
import puppeteer from 'puppeteer-core'
import { readdirSync, statSync } from 'node:fs'
import { BASE, CHROME, ROOT } from './config.mjs'
const R = ROOT + 'dist'
const routes = []
const walk = (d, p) => { for (const f of readdirSync(d)) { const full = `${d}/${f}`; if (statSync(full).isDirectory()) walk(full, `${p}${f}/`); else if (f === 'index.html' && !full.includes('/assets/')) routes.push(p) } }
walk(R, '/')
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const bad = []
let ok = 0
for (const route of routes) {
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 })
  const errs = []
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)))
  p.on('console', (m) => { if (m.type() === 'error' || /hydrat/i.test(m.text())) errs.push(m.text().slice(0, 200)) })
  // mark the server-rendered first element before any script runs; hydration keeps it, a client re-render replaces it
  await p.evaluateOnNewDocument(() => { document.addEventListener('DOMContentLoaded', () => { const el = document.querySelector('#root > *'); if (el) el.__ssrMark = true }) })
  await p.goto(BASE + encodeURI(route), { waitUntil: 'networkidle0' }); await new Promise((r) => setTimeout(r, 600))
  const r = await p.evaluate(() => ({
    kept: !!document.querySelector('#root > *')?.__ssrMark,
    title: document.title, canon: document.querySelector('link[rel=canonical]')?.href, titles: document.querySelectorAll('title').length,
    canons: document.querySelectorAll('link[rel=canonical]').length, h1: document.querySelectorAll('h1').length,
  }))
  const issue = !r.kept || errs.length || r.titles !== 1 || r.canons !== 1 || r.h1 !== 1 || !r.canon?.endsWith(route)
  if (issue) bad.push({ route, ...r, errs }); else ok++
  await p.close()
}
await b.close()
console.log(JSON.stringify({ routes: routes.length, ok, bad }, null, 1))
