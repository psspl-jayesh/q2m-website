// Checks the pre-rendered dist: every sitemap URL has its own HTML with title, description, canonical (= its URL), og tags.
import { existsSync, readFileSync } from 'node:fs'
import { BASE, CHROME, ROOT } from './config.mjs'
const R = ROOT
const locs = [...readFileSync(R + 'public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/q2msolutions\.com([^<]*)<\/loc>/g)].map((m) => m[1])
const miss = [], bad = [], titles = new Map()
for (const p of locs) {
  const f = R + (p === '/' ? 'dist/index.html' : 'dist' + decodeURIComponent(p) + 'index.html')
  if (!existsSync(f)) { miss.push(p); continue }
  const h = readFileSync(f, 'utf8')
  const t = (h.match(/<title>([^<]*)/) || [])[1]
  titles.set(t, (titles.get(t) || 0) + 1)
  const ok = /<meta name="description" content="[^"]+"/.test(h) && h.includes(`<link rel="canonical" href="https://q2msolutions.com${p}">`) &&
    h.includes(`<meta property="og:url" content="https://q2msolutions.com${p}">`) && /og:title" content="[^"]+"/.test(h) && /og:image" content="https/.test(h) &&
    h.includes(`data-prerendered="${p}"`) && /<div id="root"><[a-z]/.test(h) && (h.match(/<title>/g) || []).length === 1
  if (!ok) bad.push(p)
}
console.log(JSON.stringify({ sitemapUrls: locs.length, missingFiles: miss, incomplete: bad, duplicateTitles: [...titles].filter(([, v]) => v > 1) }, null, 1))
