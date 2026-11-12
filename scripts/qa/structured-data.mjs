// JSON-LD, sitemap.xml and robots.txt validity on the built site: every ld+json block parses, has a schema.org @context and
// an @type, and URLs use the live domain; sitemap is well-formed XML in the sitemap namespace with absolute https URLs.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { ROOT } from './config.mjs'
const DIST = ROOT + 'dist'
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = `${d}/${f}`; if (statSync(p).isDirectory()) { if (f !== 'assets' && f !== 'images') walk(p) } else if (f.endsWith('.html')) files.push(p) } }
walk(DIST)
const problems = []
const types = {}
let blocks = 0
for (const f of files) {
  const html = readFileSync(f, 'utf8')
  for (const m of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    blocks++
    let j
    try { j = JSON.parse(m[1]) } catch (e) { problems.push(`${f.slice(DIST.length)}: JSON parse error ${e.message.slice(0, 60)}`); continue }
    for (const node of Array.isArray(j) ? j : [j]) {
      if (!/schema\.org/.test(node['@context'] || '')) problems.push(`${f.slice(DIST.length)}: missing schema.org @context`)
      if (!node['@type']) problems.push(`${f.slice(DIST.length)}: missing @type`)
      for (const t of [].concat(node['@type'] || [])) types[t] = (types[t] || 0) + 1
    }
    for (const u of m[1].matchAll(/"(https?:\/\/[^"]+)"/g)) if (/localhost|127\.0|http:\/\//.test(u[1])) problems.push(`${f.slice(DIST.length)}: bad URL ${u[1]}`)
  }
}
const sm = readFileSync(DIST + '/sitemap.xml', 'utf8')
if (!/^<\?xml version="1\.0" encoding="UTF-8"\?>/.test(sm.trim())) problems.push('sitemap: missing XML declaration')
if (!sm.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) problems.push('sitemap: missing namespace')
const open = (sm.match(/<url>/g) || []).length, close = (sm.match(/<\/url>/g) || []).length
if (open !== close) problems.push('sitemap: unbalanced <url> tags')
for (const l of sm.matchAll(/<loc>([^<]*)<\/loc>/g)) if (!/^https:\/\/q2msolutions\.com\//.test(l[1]) || /[&<>]/.test(l[1])) problems.push(`sitemap: bad loc ${l[1]}`)
for (const d of sm.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) if (!/^\d{4}-\d{2}-\d{2}/.test(d[1])) problems.push(`sitemap: bad lastmod ${d[1]}`)
const robots = readFileSync(DIST + '/robots.txt', 'utf8')
if (!/^User-agent: \*/m.test(robots) || !/^Sitemap: https:\/\/q2msolutions\.com\/sitemap\.xml/m.test(robots)) problems.push('robots.txt: missing User-agent or Sitemap line')
console.log(JSON.stringify({ pages: files.length, jsonLdBlocks: blocks, types, sitemapUrls: open, problems }, null, 1))
process.exit(problems.length ? 1 : 0)
