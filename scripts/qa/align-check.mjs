// Alignment check: every section's outer content box must line up with the header's (shared .container-page).
// For each page and width: the header container's content edges vs the content edges of each top-level centred container in
// <main> (an element with a max-width whose parent spans the full viewport). Usage: node align-check.mjs [widths] [routes]
import puppeteer from 'puppeteer-core'
import { readdirSync, statSync } from 'node:fs'
import { BASE, CHROME, ROOT } from './config.mjs'
const widths = (process.argv[2] || '1440,1920,390').split(',').map(Number)
const walk = (d, r = []) => { for (const f of readdirSync(d)) { const p = `${d}/${f}`; if (statSync(p).isDirectory()) { if (!['assets', 'images'].includes(f)) walk(p, r) } else if (f === 'index.html') r.push(p.slice((ROOT + 'dist').length).replace(/index\.html$/, '')) } return r }
const routes = process.argv[3] ? process.argv[3].split(',') : walk(ROOT + 'dist')
const b = await puppeteer.launch({ executablePath: CHROME, headless: true })
let bad = 0
for (const w of widths) for (const r of routes) {
  const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768 })
  await p.goto(BASE + r, { waitUntil: 'networkidle0' })
  const res = await p.evaluate(() => {
    const edge = (el) => { const s = getComputedStyle(el), b = el.getBoundingClientRect(); return [Math.round(b.left + parseFloat(s.paddingLeft)), Math.round(b.right - parseFloat(s.paddingRight))] }
    const head = document.querySelector('header .container-page'); if (!head) return { err: 'no header container' }
    const [hl, hr] = edge(head); const vw = document.documentElement.clientWidth
    const off = []
    for (const el of document.querySelectorAll('main *')) {
      const s = getComputedStyle(el); if (s.maxWidth === 'none' || s.display === 'none' || s.position === 'fixed' || s.position === 'absolute') continue
      const par = el.parentElement; if (!par || Math.abs(par.getBoundingClientRect().width - vw) > 2) continue
      if (s.marginLeft !== s.marginRight) continue
      const [l, rr] = edge(el); if (Math.abs(l - hl) > 1 || Math.abs(rr - hr) > 1) off.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} ${l}-${rr}`)
    }
    return { header: `${hl}-${hr}`, off: [...new Set(off)].slice(0, 4) }
  })
  if (res.err || res.off.length) { bad++; console.log(w, r, JSON.stringify(res)) }
  await p.close()
}
console.log('done:', routes.length, 'routes x', widths.length, 'widths; pages with misaligned sections:', bad)
await b.close()
