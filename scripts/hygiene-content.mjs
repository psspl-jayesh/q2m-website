// Content hygiene (logged, never silent): Cyrillic lookalike letters and unfilled [X] placeholders. Idempotent.
import { readFileSync, writeFileSync } from 'node:fs'
const f = 'src/data/content.json'
const c = JSON.parse(readFileSync(f, 'utf8'))
const items = [...c.pages, ...c.posts, ...c.caseStudies]
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
c.hygiene = { ...(c.hygiene ?? {}), homoglyphFixes: fixed, droppedPlaceholders: dropped }
writeFileSync(f, JSON.stringify(c))
console.log('homoglyph fixes:', fixed.length, [...new Set(fixed.map((x) => x.split(' ')[0]))].join(', '))
console.log('dropped placeholders:', dropped)
