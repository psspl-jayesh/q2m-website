// Step 1+2: crawl the live site and store EXACT page content, one file per page, plus the shared content.
//   output:  src/content/live/<slug>.json    exact text from the live HTML (no edits)
//            src/content/live-shared/*.json  menu, footer, stats, testimonials, ctas (exact)
//            docs/CONTENT_PAGE_MAP.md        page mapping (live vs local)
// Nothing here rewrites text. Fixes and India overrides happen in scripts/apply-content.mjs.
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { extractPage } from './lib-extract.mjs'

const BASE = 'https://q2msolutions.com'
const UA = { 'User-Agent': 'Mozilla/5.0 (Q2M-content-sync)' }
const get = async (u) => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { headers: UA }); if (r.ok) return await r.text() } catch { /* retry */ } await new Promise((r) => setTimeout(r, 500)) } return '' }
const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k) } })); return out }
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim()
const slugOf = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '--'))

mkdirSync('src/content/live', { recursive: true }); mkdirSync('src/content/live-shared', { recursive: true })
const prev = JSON.parse(readFileSync('docs/_prev/content.before-live-sync.json', 'utf8')) // local entries (path, type)
const entries = [...prev.pages, ...prev.posts, ...prev.caseStudies]

/* ── Step 1: page mapping (sitemap + menu) ── */
const idx = await get(`${BASE}/sitemap_index.xml`)
const sitemap = new Set(['/'])
for (const s of [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) for (const m of (await get(s)).matchAll(/<loc>([^<]+)<\/loc>/g)) if (!/\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(m[1])) sitemap.add(new URL(m[1]).pathname)
const homeHtml = await get(BASE + '/')

/* ── Step 2: extract every page ── */
const results = {}
await pool(entries, 6, async (e) => {
  const html = e.path === '/' ? homeHtml : await get(BASE + e.path)
  if (!html) { results[e.path] = { error: 'fetch failed' }; return }
  const r = extractPage(html)
  results[e.path] = { path: e.path, slug: slugOf(e.path), type: e.type, url: BASE + e.path, fetchedAt: new Date().toISOString(), ...r }
  writeFileSync(`src/content/live/${slugOf(e.path)}.json`, JSON.stringify(results[e.path], null, 1))
})
const failed = Object.entries(results).filter(([, v]) => v.error).map(([p]) => p)

/* ── shared content, exact, from the live home page ── */
const $ = cheerio.load(homeHtml); $('script,style,noscript').remove()
// header menu
const menu = []
$('header').first().find('ul').filter((_, u) => $(u).parents('ul').length === 0).first().children('li').each((_, li) => {
  const a = $(li).children('a').first()
  const item = { label: clean(a.text()), href: a.attr('href') || '', children: [] }
  $(li).find('ul li').each((__, c) => { const ca = $(c).children('a').first(); item.children.push({ label: clean(ca.text()), href: ca.attr('href') || '' }) })
  menu.push(item)
})
// footer
const f = $('footer').first()
const footer = {
  solutionsHeading: clean(f.find('h2,h3,h4,h5,h6').filter((_, e) => /our ai solutions/i.test($(e).text())).first().text()) || 'Our AI Solutions',
  links: f.find('a').map((_, a) => ({ label: clean($(a).text()), href: $(a).attr('href') || '' })).get().filter((l) => l.label && !/^(\+|tel:|mailto:|\d)/.test(l.href.replace(BASE, '')) && /q2msolutions\.com\/[a-z]/.test(l.href)),
  genericText: clean(f.text()).match(/THEY TOLD ABOUT[\s\S]*?(?=Call Any Time)/i)?.[0] ?? '',
  copyright: clean(f.text()).match(/Copyright[^$]*$/i)?.[0] ?? '',
  contactLabels: ['Call Any Time', 'Address', 'Say Hello'].filter((l) => clean(f.text()).includes(l)),
}
// stats, testimonials (home)
const home = results['/']
const blocksOf = (title) => { const b = home.blocks; const i = b.findIndex((x) => x.t === 'h2' && x.text.toLowerCase().startsWith(title.toLowerCase())); if (i < 0) return []; const j = b.findIndex((x, k) => k > i && x.t === 'h2'); return b.slice(i + 1, j < 0 ? undefined : j) }
const stats = home.blocks.filter((b) => b.t === 'stat').map((b) => ({ value: b.value, prefix: b.prefix, suffix: b.suffix, label: b.text }))
const heroStat = home.blocks.find((b) => b.t === 'h6' && /\d+\+?\s*Projects Delivered/i.test(b.text))?.text ?? null
const testimonials = home.blocks.filter((b) => b.t === 'quote').map((b) => ({ quote: b.text, name: b.name, role: b.role }))
const ctas = { home: home.blocks.filter((b) => b.t === 'btn').map((b) => ({ label: b.text, href: b.href })) }
const shared = { menu, footer, stats: { counters: stats, heroStat }, testimonials, ctas }
for (const [k, v] of Object.entries(shared)) writeFileSync(`src/content/live-shared/${k}.json`, JSON.stringify(v, null, 1))

/* page mapping doc */
const localPaths = new Set(entries.map((e) => e.path))
const menuLinks = new Set(); const hashItems = []
menu.forEach((m) => { if (m.href && m.href !== '#') menuLinks.add(new URL(m.href, BASE).pathname); m.children.forEach((c) => { if (c.href === '#') hashItems.push(`${m.label} > ${c.label}`); else if (c.href.startsWith(BASE)) menuLinks.add(new URL(c.href).pathname) }) })
const docs = ['# Content page mapping (live vs local)', '', `Live sitemap pages: ${sitemap.size}. Live menu links to pages: ${menuLinks.size}. Local routes: ${localPaths.size}. Crawled OK: ${entries.length - failed.length}.`, '',
  `## Live pages with a local route (${[...sitemap].filter((p) => localPaths.has(p)).length})`, ...[...sitemap].filter((p) => localPaths.has(p)).sort().map((p) => `- ${p}`), '',
  `## Live pages with NO local route (${[...sitemap].filter((p) => !localPaths.has(p)).length})`, ...[...sitemap].filter((p) => !localPaths.has(p)).sort().map((p) => `- ${p}`), '',
  `## Menu links that go to a page with no local route`, ...[...menuLinks].filter((p) => !localPaths.has(p) && !/campusclick/.test(p)).map((p) => `- ${p}`), '',
  `## Local routes with no live page`, ...[...localPaths].filter((p) => !sitemap.has(p)).map((p) => `- ${p}`), '- /privacy-policy/ (new, added for India/DPDP)', '',
  `## Menu items that link to "#" (placeholders on the live site; ${hashItems.length})`, ...hashItems.map((x) => `- ${x}`), '']
writeFileSync('docs/CONTENT_PAGE_MAP.md', docs.join('\n'))
console.log(JSON.stringify({ pages: entries.length, failed, menuTop: menu.length, hashItems: hashItems.length, counters: stats.length, testimonials: testimonials.length, footerLinks: footer.links.length }))
