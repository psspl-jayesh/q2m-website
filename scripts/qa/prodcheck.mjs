// Static production checks on the built site (dist/), no server needed:
// domain on canonical / og:url / og:image / JSON-LD / sitemap, no localhost, robots.txt, noindex only on the privacy page,
// 404 page, no visible TODO / placeholder / test text or Singapore / +65, no broken internal links, one <title> per page.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { ROOT } from './config.mjs'

const DIST = ROOT + 'dist'
const SITE = 'https://q2msolutions.com'
const files = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = `${d}/${f}`; statSync(p).isDirectory() ? walk(p) : files.push(p) } }
walk(DIST)
const html = files.filter((f) => f.endsWith('.html'))
const rel = (f) => f.slice(DIST.length)
const routeOf = (f) => rel(f).replace(/index\.html$/, '')
const out = { pages: html.length, fail: {} }
const fail = (k, v) => (out.fail[k] ??= []).push(v)
/** Deliberate exceptions (reported, not failures). */
const NOINDEX_OK = { '/privacy-policy/': 'draft policy until legal review', '/404.html': 'error page' }
const isCategory = (r) => r?.startsWith('/category/') // filtered views of /blogs/ (same title, not in the sitemap)
const NO_DESC_OK = { '/case-studies/': 'the live page has no text to describe it (pending: write a description)' }
out.exceptions = []

// 1. no localhost anywhere in text output (HTML, XML, TXT, JSON, JS, CSS)
for (const f of files.filter((x) => /\.(html|xml|txt|json|js|css|webmanifest)$/.test(x))) {
  const s = readFileSync(f, 'utf8')
  const m = s.match(/https?:\/\/(localhost|127\.0\.0\.1)[^"'\s)]*/g)
  if (!m) continue
  // React Router uses "http://localhost" internally as a dummy base when parsing URLs: library code, never a link or tag
  if (/\/assets\/react-[\w-]+\.js$/.test(f) && m.every((x) => x.startsWith('http://localhost`'))) { out.exceptions.push(`${rel(f)}: library-internal URL base (not a link)`); continue }
  fail('localhost', `${rel(f)}: ${[...new Set(m)].slice(0, 3).join(', ')}`)
}
// 2. per page: title, canonical, og:url, og:image, JSON-LD on the live domain; robots meta
const noindex = []
for (const f of html) {
  const s = readFileSync(f, 'utf8')
  const r = rel(f) === '/404.html' ? null : routeOf(f)
  if ((s.match(/<title>/g) || []).length !== 1) fail('title-count', rel(f))
  for (const [name, re] of [['canonical', /<link rel="canonical" href="([^"]+)"/], ['og:url', /property="og:url" content="([^"]+)"/], ['og:image', /property="og:image" content="([^"]+)"/]]) {
    const m = s.match(re)
    if (!m) fail(`missing ${name}`, rel(f))
    else if (!m[1].startsWith(SITE + '/')) fail(`${name} not on ${SITE}`, `${rel(f)}: ${m[1]}`)
    else if (r && name !== 'og:image' && m[1] !== SITE + r) fail(`${name} not this page`, `${rel(f)}: ${m[1]}`)
  }
  const isNoindex = /name="robots" content="noindex/.test(s)
  if (!/<meta name="description" content="[^"]+"/.test(s)) {
    if (isNoindex) { /* not indexed: no description needed */ } else if (NO_DESC_OK[r]) { out.exceptions.push(`${r}: no description, ${NO_DESC_OK[r]}`) } else { fail('missing description', rel(f)) }
  }
  for (const m of s.matchAll(/<script id="ld-[a-z]+" type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const urls = [...m[1].matchAll(/"(https?:\/\/[^"]+)"/g)].map((x) => x[1]).filter((u) => /q2msolutions|localhost|127\.0/.test(u))
    for (const u of urls) if (!u.startsWith(SITE)) fail('json-ld url', `${rel(f)}: ${u}`)
  }
  if (/name="robots" content="noindex/.test(s)) noindex.push(r ?? rel(f))
  // visible text only (scripts, styles and tags removed)
  const text = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ')
  for (const w of [/\bTODO\b/, /\blorem ipsum\b/i, /\bplaceholder\b/i, /\bSingapore\b/i, /\+65\b/, /\bdummy\b/i, /\btest content\b/i])
    if (w.test(text)) fail(`visible text ${w}`, `${rel(f)}: …${text.slice(Math.max(0, text.search(w) - 40), text.search(w) + 40).replace(/\s+/g, ' ')}…`)
  // internal links resolve to a built page or file
  for (const m of s.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)) {
    const h = decodeURIComponent(m[1])
    const ok = existsSync(DIST + h) && statSync(DIST + h).isFile() || existsSync(DIST + h + (h.endsWith('/') ? '' : '/') + 'index.html')
    if (!ok) fail('broken internal link', `${rel(f)} -> ${m[1]}`)
  }
}
out.noindex = noindex
for (const n of noindex) {
  if (NOINDEX_OK[n]) out.exceptions.push(`${n}: noindex (${NOINDEX_OK[n]})`)
  else if (isCategory(n)) continue
  else fail('unexpected noindex', n)
}
const cats = noindex.filter(isCategory)
if (cats.length) out.exceptions.push(`${cats.length} /category/ pages: noindex (filtered views of /blogs/ with the same title; not in the sitemap)`)
// 3. robots.txt, sitemap, 404
const robots = existsSync(DIST + '/robots.txt') ? readFileSync(DIST + '/robots.txt', 'utf8') : ''
out.robots = robots.trim().split(/\r?\n/)
if (!/Allow:\s*\/\s*$/m.test(robots) && /Disallow:\s*\/\s*$/m.test(robots)) fail('robots', 'disallows everything')
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots', 'no sitemap line')
const sm = existsSync(DIST + '/sitemap.xml') ? readFileSync(DIST + '/sitemap.xml', 'utf8') : ''
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
out.sitemapUrls = locs.length
for (const l of locs) {
  if (!l.startsWith(SITE + '/')) fail('sitemap url', l)
  const p = l.slice(SITE.length); if (!existsSync(DIST + decodeURIComponent(p) + 'index.html') && p !== '/') fail('sitemap url without page', l)
  if (p === '/privacy-policy/') fail('sitemap lists noindex page', l)
}
out.has404 = existsSync(DIST + '/404.html')
if (!out.has404) fail('404', 'dist/404.html missing')
// dedupe broken links
for (const k of Object.keys(out.fail)) out.fail[k] = [...new Set(out.fail[k])]
console.log(JSON.stringify(out, null, 1))
process.exit(Object.keys(out.fail).length ? 1 : 0)
