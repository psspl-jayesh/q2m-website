// Downloads every image referenced by shipped content into public/media and rewrites src to local paths.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
const f = 'src/data/content.json'
const c = JSON.parse(readFileSync(f, 'utf8'))
mkdirSync('public/media', { recursive: true })
const map = {}
const urls = new Set()
const items = [...c.pages, ...c.posts, ...c.caseStudies]
items.forEach((x) => { x.blocks.forEach((b) => b.t === 'img' && urls.add(b.src)); x.ogImage && urls.add(x.ogImage) })
Object.values(c.media).forEach((m) => urls.add(m.src))
const local = (u) => { const ext = path.extname(new URL(u).pathname) || '.bin'; const base = path.basename(new URL(u).pathname, ext).replace(/[^a-z0-9-]/gi, '-').slice(0, 50); return `/media/${base}-${createHash('md5').update(u).digest('hex').slice(0, 6)}${ext}` }
const list = [...urls].filter((u) => /^https?:/.test(u) && /q2msolutions\.com/.test(u))
let ok = 0, fail = []
for (let i = 0; i < list.length; i += 8) await Promise.all(list.slice(i, i + 8).map(async (u) => {
  const dest = local(u)
  try {
    if (!existsSync('public' + dest)) { const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (!r.ok) throw new Error(r.status); writeFileSync('public' + dest, Buffer.from(await r.arrayBuffer())) }
    map[u] = dest; ok++
  } catch (e) { fail.push(u + ' ' + e.message) }
}))
const rw = (u) => map[u] || u
items.forEach((x) => { x.blocks.forEach((b) => b.t === 'img' && (b.src = rw(b.src))); x.ogImage = rw(x.ogImage) })
Object.values(c.media).forEach((m) => (m.src = rw(m.src)))
writeFileSync(f, JSON.stringify(c))
console.log('mirrored', ok, 'failed', fail.length); fail.slice(0, 10).forEach((x) => console.log(' ', x))

// ── Content hygiene (logged, never silent) ──
const HOMO = { 'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x', 'і': 'i' }
const fixed = []
const clean = (s, where) => { const n = s.replace(/[еаосрхі]/g, (m) => HOMO[m]); if (n !== s) fixed.push(where); return n }
const dropped = []
items.forEach((x) => {
  x.title = clean(x.title, x.path + ' title'); x.metaTitle = clean(x.metaTitle, x.path + ' metaTitle'); x.description = clean(x.description, x.path + ' description')
  x.blocks = x.blocks.filter((b) => { if (b.text && /\[X\]/.test(b.text)) { dropped.push(x.path + ': ' + b.text.slice(0, 90)); return false } return true })
  x.blocks.forEach((b) => b.text && (b.text = clean(b.text, x.path + ' body')))
  x.faqs.forEach((q) => { q.q = clean(q.q, x.path + ' faq'); q.a = q.a.map((a) => clean(a, x.path + ' faq')) })
})
c.hygiene = { homoglyphFixes: fixed, droppedPlaceholders: dropped }
writeFileSync(f, JSON.stringify(c))
console.log('homoglyph fixes:', fixed.length, [...new Set(fixed.map((x) => x.split(' ')[0]))].join(', '))
console.log('dropped placeholders:', dropped)
