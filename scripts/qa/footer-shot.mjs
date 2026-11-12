// node foot.mjs <base> <path> <width> <theme> <out>  — footer screenshot (header and back-to-top hidden), prints footer height
import puppeteer from 'puppeteer-core'
import { BASE, CHROME, ROOT } from './config.mjs'
const [base, path, w, th, out] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
const p = await b.newPage(); await p.setViewport({ width: +w, height: 900, isMobile: +w < 768, deviceScaleFactor: 1 })
await p.evaluateOnNewDocument((t) => { try { localStorage.setItem('q2m-theme', t) } catch {} }, th)
const e = []; p.on('console', (m) => { if (m.type() === 'error') e.push(m.text()) })
await p.goto(base + path, { waitUntil: 'networkidle0' })
await p.evaluate(() => { document.querySelector('header').style.visibility = 'hidden'; document.querySelector('.btt').style.display = 'none'; document.querySelector('footer').scrollIntoView() })
await new Promise((r) => setTimeout(r, 800))
const f = await p.$('footer'); const bb = await f.boundingBox()
await f.screenshot({ path: out })
console.log(JSON.stringify({ w, th, height: Math.round(bb.height), errs: e }))
await b.close()
