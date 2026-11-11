// Step 4-7: live content (exact) -> final content. Applies ONLY: Step 6 fixes, Step 5 India overrides, locale spelling, shared stats.
//   input : src/content/live/*.json, src/content/live-shared/*.json, docs/_prev/content.before-live-sync.json (ids, dates, categories only)
//   output: src/content/pages/*.json, src/content/shared/*.json, src/data/content.json (generated, what the app loads), docs/CONTENT_CHANGES.md
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { fix as spell } from './lib-spelling.mjs'

mkdirSync('src/content/pages', { recursive: true }); mkdirSync('src/content/shared', { recursive: true })
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const live = readdirSync('src/content/live').map((f) => readJson(`src/content/live/${f}`))
const L = Object.fromEntries(readdirSync('src/content/live-shared').map((f) => [f.replace('.json', ''), readJson(`src/content/live-shared/${f}`)]))
const prev = readJson('docs/_prev/content.before-live-sync.json')
const meta = new Map([...prev.pages, ...prev.posts, ...prev.caseStudies].map((e) => [e.path, e]))

const log = { cyrillic: [], typos: [], overrides: [], spelling: 0, notRewritten: [], dropped: [], h1: [], statsDropped: [], titleLong: [], descLong: [], clutchKept: [] }
const HOMO = { 'е': 'e', 'а': 'a', 'о': 'o', 'с': 'c', 'р': 'p', 'х': 'x', 'і': 'i', 'ѕ': 's', 'ј': 'j', 'ԁ': 'd', 'ɡ': 'g' }
const hasNonLatin = (w) => /[Ѐ-ӿ]/.test(w) && /[A-Za-z]/.test(w)

/* ───────── Step 6: content errors on the live site (not copied) ───────── */
const TYPOS = [ // exact, clear errors only; each is logged with page and location
  { path: '/hire-generative-ai-developers/', find: 'Continous', to: 'Continuous', why: 'misspelling' },
  { path: '/hire-generative-ai-developers/', find: 'securty', to: 'security', why: 'misspelling' },
  { path: '/machine-learning-development-services/', find: 'TesnorFlow', to: 'TensorFlow', why: 'misspelling of a product name' },
  { path: '/ai-chatbot-development-company/', find: 'reversable', to: 'reversible', why: 'misspelling' },
  { path: '/ai-consulting-services/', find: 'dont just', to: 'don’t just', why: 'missing apostrophe' },
  { path: '/ai-chatbot-development-company/', find: 'results.Whether', to: 'results. Whether', why: 'missing space after full stop (meta description)' },
  { path: '*', find: 'Linkedln', to: 'LinkedIn', why: 'lower-case L typed instead of capital I' },
]
const fixText = (path, loc, t) => {
  if (typeof t !== 'string' || !t) return t
  let out = t
  out = out.replace(/[Ѐ-ӿ]/g, (ch) => HOMO[ch] ?? ch)
  if (out !== t) log.cyrillic.push({ path, loc, before: t, after: out })
  for (const f of TYPOS) if ((f.path === '*' || f.path === path) && out.includes(f.find)) { const b = out; out = out.split(f.find).join(f.to); log.typos.push({ path, loc, before: f.find, after: f.to, why: f.why, context: b.slice(Math.max(0, b.indexOf(f.find) - 30), b.indexOf(f.find) + f.find.length + 30) }) }
  return out
}
/* missing-apostrophe contractions anywhere else (reported, fixed when unambiguous) */
const CONTR = { dont: 'don’t', doesnt: 'doesn’t', cant: 'can’t', isnt: 'isn’t', wasnt: 'wasn’t', couldnt: 'couldn’t', shouldnt: 'shouldn’t', wouldnt: 'wouldn’t', havent: 'haven’t', hasnt: 'hasn’t', didnt: 'didn’t', youre: 'you’re', theyre: 'they’re', weve: 'we’ve' }

/* ───────── Step 5: India overrides, applied after the sync ───────── */
const R = []
const ov = (path, loc, before, after, why) => R.push({ path, loc, before, after, why })
const rewriteText = (path, loc, t) => {
  let out = t
  const rules = [
    ["Singapore's Enterprise AI Development Company", 'Enterprise AI Development Company in India', 'required headline override'],
    ['As a specialist AI development company in Singapore,', 'As a specialist AI development company in India,', 'region'],
    // The live numbers count APAC/overall projects and clients, not Indian ones: labels are neutral so the number stays accurate
    ['Enterprise projects delivered across APAC', 'Enterprise projects delivered', 'neutral label: live number is not India-only'],
    ['Average reduction in manual processing time across APAC clients', 'Average reduction in manual processing time across clients', 'neutral label: live number is not India-only'],
    ['Singapore & APAC presence', 'Serving enterprises in India', 'neutral, true statement'],
    ['We are governed by the regulations of Singapore, and have Asia Pacific delivery capability.', 'Governance, security and compliance are built into how we deliver.', 'removed country-specific governance claim'],
    ['compliance with MAS TRM, PDPA, GDPR, and ISO 27001 when applicable', 'compliance with GDPR and ISO 27001 when applicable', 'removed Singapore regulation names (no DPDP claim added)'],
    ['How does one ensure data security and compliance in Singapore?', 'How does one ensure data security and compliance in India?', 'FAQ override'],
    ['Q2M Solutions is Singapore’s enterprise AI development company, delivering 150+ projects across the APAC region from', 'Q2M Solutions is an enterprise AI development company in India, delivering 150+ projects for enterprise clients from', 'region (article)'],
  ]
  for (const [a, b, why] of rules) if (out.includes(a)) { out = out.split(a).join(b); ov(path, loc, a, b, why) }
  return out
}
/* kept on purpose: award name and cited statistics */
const KEEP = [
  { re: /^APAC region$/, why: 'Part of the award "Clutch Top AI Developer — APAC region" (kept as instructed)', path: '/' },
  { re: /Top AI Developer in the APAC region/, why: 'Award wording kept as instructed', path: '/q2m-solutions-is-heading-to-ai4-2026/' },
  { re: /Asia Pacific is the fastest-growing market/, why: 'Cited third-party market statistic: changing the region would falsify the source claim. Needs your decision.', path: '/ai-agent-development-cost/' },
]

/* ───────── shared stats config ───────── */
const heroStat = L.stats.heroStat // "150+ Projects Delivered"
const stats = {
  projectsDelivered: { key: 'projectsDelivered', value: 150, prefix: '', suffix: '+', label: 'Projects Delivered', text: heroStat || '150+ Projects Delivered', source: 'live home hero: "150+ Projects Delivered"' },
  counters: L.stats.counters.map((c, i) => ({ key: `counter${i}`, value: Number(c.value), prefix: c.prefix || '', suffix: c.suffix || '', label: rewriteText('shared/stats', `counter${i}`, c.label), source: 'live home counter data-to-value' })),
}
const statFromBlock = (path, b, idx) => {
  const label = b.text || ''
  // 1) exact home counter (value comes from the counter's data-to-value attribute)
  const counter = stats.counters.find((c) => c.label.toLowerCase() === label.toLowerCase())
  if (counter) return { t: 'stat', value: counter.value, prefix: counter.prefix, suffix: counter.suffix, text: counter.label, matched: counter.key }
  // 2) "N Project(s) ... completed/delivered" on service pages and About -> the one approved projects stat
  if (/project/i.test(label)) return { t: 'stat', value: stats.projectsDelivered.value, prefix: '', suffix: stats.projectsDelivered.suffix, text: stats.projectsDelivered.label, matched: 'projectsDelivered' }
  log.statsDropped.push({ path, original: `${b.prefix || ''}${b.value ?? ''}${b.suffix || ''} ${label}`.trim(), reason: 'No matching value in the shared stats config (live values conflict across pages: 3/5 mins, 98/97/95%, 24 hrs, 120+/50/150 projects). Not shown until you approve a number.' })
  return null
}

/* ───────── Clutch widget: the "Review On" and "(N Reviews)" hero lines that sit next to the Clutch logo are removed ─────────
   Only these lines. The text "Clutch Top AI Developer ... APAC region" and every other certification or partnership text stays. */
log.removals = []
const REVIEW_LINE = /^(review on|\(\d+ reviews?\))$/i
function stripClutchWidget(path, blocks) {
  return blocks.flatMap((x) => {
    if (x.eyebrow && REVIEW_LINE.test(x.eyebrow.trim())) { log.removals.push({ path, what: 'Clutch review eyebrow', before: x.eyebrow }); const { eyebrow, ...rest } = x; return [rest] }
    if (x.t === 'p' && REVIEW_LINE.test((x.text || '').trim())) { log.removals.push({ path, what: 'Clutch review line', before: x.text }); return [] }
    return [x]
  })
}

/* ───────── per-page processing ───────── */
const pages = []
for (const pg of live) {
  const path = pg.path
  const processed = []
  const furniture = { breadcrumb: [], meta: [], nav: [] }
  for (let i = 0; i < pg.blocks.length; i++) {
    const b0 = pg.blocks[i]
    if (['breadcrumb', 'meta', 'nav'].includes(b0.t)) { furniture[b0.t].push(b0.text); continue }
    const b = { ...b0 }
    for (const k of ['text', 'eyebrow', 'name', 'role']) if (b[k]) {
      b[k] = fixText(path, `${b.t}#${i} ${k}`, b[k])
      const rewritten = rewriteText(path, `${b.t}#${i} ${k}`, b[k]); b[k] = rewritten
      for (const kp of KEEP) if (kp.path === path && kp.re.test(b[k])) log.clutchKept.push({ path, text: b[k].slice(0, 100), why: kp.why })
    }
    if (b.t === 'stat') { const s = statFromBlock(path, b, i); if (!s) continue; processed.push(s); continue }
    processed.push(b)
  }
  // boilerplate contact blocks (phone / address) are never copied: contact data comes only from the shared locale config
  const noContact = []
  let skip = false
  for (const b of processed) {
    if (path !== '/contact/' && b.t === 'h2' && /^(connect with us!?|social (you just|just) connected us|your success starts here!?)$/i.test(b.text.replace(/\s+/g, ' ').trim())) { skip = true; log.dropped.push({ path, what: `section "${b.text}" (contains Singapore phone / social boilerplate)`, why: 'contact data comes from the locale config' }); continue }
    if (b.t === 'h2' || b.t === 'h1') skip = false
    if (skip) continue
    if (path === '/contact/' && b.t === 'h4' && /^Singapore$/i.test(b.text || '')) { log.dropped.push({ path, what: '"Singapore" office heading', why: 'office location comes from the locale config (India)' }); continue }
    if (/\+65|6587430992|143 Cecil|Cecil St/.test(b.text || '')) { log.dropped.push({ path, what: `"${b.text}"`, why: 'Singapore contact detail (not used)' }); continue }
    noContact.push(b)
  }
  const faqs = pg.faqs.map((f, i) => ({ q: rewriteText(path, `faq${i} q`, fixText(path, `faq${i} q`, f.q)), a: f.a.map((a, j) => rewriteText(path, `faq${i} a${j}`, fixText(path, `faq${i} a${j}`, a))) }))
  const seo = { title: rewriteText(path, 'seo title', fixText(path, 'seo title', pg.seo.title)), description: rewriteText(path, 'seo description', fixText(path, 'seo description', pg.seo.description)), h1: '' }
  // exactly one H1 per page
  let blocks = stripClutchWidget(path, noContact)
  const h1s = blocks.filter((b) => b.t === 'h1')
  if (h1s.length === 0) {
    const firstH2 = blocks.findIndex((b) => b.t === 'h2')
    if (firstH2 > -1) { blocks[firstH2] = { ...blocks[firstH2], t: 'h1' }; log.h1.push({ path, action: `no H1 on the live page; promoted first heading "${blocks[firstH2].text}" to H1` }) }
  } else if (h1s.length > 1) { let seen = false; blocks = blocks.map((b) => (b.t === 'h1' ? (seen ? (log.h1.push({ path, action: `extra H1 "${b.text}" demoted to H2` }), { ...b, t: 'h2' }) : ((seen = true), b)) : b)) }
  seo.h1 = blocks.find((b) => b.t === 'h1')?.text || ''
  if (pg.seo.h1Count > 1) log.h1.push({ path, action: `live HTML has ${pg.seo.h1Count} H1 elements; kept one H1 "${seo.h1.slice(0, 70)}"${pg.seo.h1 && pg.seo.h1 !== seo.h1 ? ` (the other, "${pg.seo.h1.slice(0, 60)}", is not shown as an H1)` : ''}` })
  // locale spelling (en-IN) on top of everything
  const sp = (t) => { if (!t) return t; const n = spell(t); if (n !== t) log.spelling++; return n }
  blocks = blocks.map((b) => ({ ...b, ...(b.text ? { text: sp(b.text) } : {}), ...(b.eyebrow ? { eyebrow: sp(b.eyebrow) } : {}) }))
  const faqsF = faqs.map((f) => ({ q: sp(f.q), a: f.a.map(sp) }))
  seo.title = sp(seo.title); seo.description = sp(seo.description)
  seo.h1 = sp(seo.h1)
  for (const k of Object.keys(furniture)) furniture[k] = furniture[k].map((t) => sp(rewriteText(path, `furniture ${k}`, fixText(path, `furniture ${k}`, t))))
  // missing-apostrophe contractions: report + fix
  const cfix = (t) => t && t.replace(new RegExp(`\\b(${Object.keys(CONTR).join('|')})\\b`, 'gi'), (m) => { const to = CONTR[m.toLowerCase()]; log.typos.push({ path, loc: 'contraction', before: m, after: to, why: 'missing apostrophe', context: t.slice(Math.max(0, t.indexOf(m) - 25), t.indexOf(m) + 35) }); return m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to })
  blocks = blocks.map((b) => (b.text ? { ...b, text: cfix(b.text) } : b))
  if (seo.title.length > 60) log.titleLong.push({ path, length: seo.title.length, title: seo.title })
  if (seo.description.length > 155) log.descLong.push({ path, length: seo.description.length })
  const out = { path, slug: pg.slug, type: pg.type, source: pg.url, syncedAt: pg.fetchedAt, seo, furniture, blocks, faqs: faqsF }
  writeFileSync(`src/content/pages/${pg.slug}.json`, JSON.stringify(out, null, 1))
  pages.push(out)
}
log.overrides = R

/* ───────── shared content ───────── */
const menuOut = L.menu.map((m) => ({
  label: fixText('shared/menu', m.label, m.label),
  href: m.href === '#' ? '' : m.href.replace('https://q2msolutions.com', ''),
  children: m.children.map((c) => ({ label: fixText('shared/menu', c.label, c.label), href: c.href === '#' ? '' : c.href.replace(/^https:\/\/q2msolutions\.com/, ''), external: /^https?:\/\//.test(c.href) && !c.href.includes('q2msolutions.com'), placeholder: c.href === '#' })),
}))
const footerOut = { heading: L.footer.solutionsHeading, links: L.footer.links.map((l) => ({ label: fixText('shared/footer', l.label, l.label), href: l.href.replace('https://q2msolutions.com', '').replace('/agentic-ai-services/', '/ai-agent-development-services/'), liveHref: l.href })), copyright: L.footer.copyright, genericTextNotUsed: L.footer.genericText }
const certOut = L.certifications.map((c) => ({ title: c.title, detail: c.detail }))
const testimonialsOut = L.testimonials.map((t) => ({ quote: spell(fixText('shared/testimonials', 'quote', t.quote)), name: t.name, role: t.role }))
const ctasOut = { header: { label: 'Book a Discovery Call', href: '/contact/', source: 'live home hero CTA "Book a Discovery Call" -> /contact' }, hero: { label: 'Free Consultation', href: '/contact/', liveHref: '#', note: 'live service-page hero button links to "#"; linked to /contact/ (needs your confirmation)' } }
const sharedOut = { menu: menuOut, footer: footerOut, certifications: certOut, stats, testimonials: testimonialsOut, ctas: ctasOut }
for (const [k, v] of Object.entries(sharedOut)) writeFileSync(`src/content/shared/${k}.json`, JSON.stringify(v, null, 1))

/* ───────── build the file the app loads (metadata from the CMS, all copy from src/content) ───────── */
const toEntry = (pg) => {
  const m = meta.get(pg.path)
  return { id: m?.id ?? 0, type: pg.type, path: pg.path, slug: m?.slug ?? pg.slug, title: pg.seo.h1 || m?.title || '', date: m?.date, modified: m?.modified, metaTitle: pg.seo.title, description: pg.seo.description, ogImage: '', robots: m?.robots ?? '', excerpt: pg.type === 'page' ? '' : (m?.excerpt ?? ''), featuredMedia: m?.featuredMedia ?? 0, categories: m?.categories ?? [], blocks: pg.blocks, faqs: pg.faqs, furniture: pg.furniture }
}
const content = {
  syncedAt: new Date().toISOString(), source: 'https://q2msolutions.com', pages: pages.filter((p) => p.type === 'page').map(toEntry), posts: pages.filter((p) => p.type === 'post').map(toEntry), caseStudies: pages.filter((p) => p.type === 'case-study').map(toEntry),
  categories: prev.categories, media: prev.media, retired: prev.retired, hygiene: { ...(prev.hygiene ?? {}), liveContentSync: { cyrillicFixes: log.cyrillic.length, typoFixes: log.typos.length, indiaOverrides: log.overrides.length } },
}
writeFileSync('src/data/content.json', JSON.stringify(content))
writeFileSync('docs/_prev/apply-log.json', JSON.stringify(log, null, 1))

/* ───────── report ───────── */
const uniq = (a, f) => [...new Map(a.map((x) => [f(x), x])).values()]
const md = ['# Content changes applied on top of the live content', '', 'Everything else is copied exactly from https://q2msolutions.com/. Generated by `scripts/apply-content.mjs`.', '',
  `## India overrides (before -> after) (${log.overrides.length})`, ...log.overrides.map((o) => `- ${o.path} [${o.loc}] (${o.why}): "${o.before}" -> "${o.after}"`), '',
  `## Clutch logo removal (${log.removals.length} hero lines, before -> after)`, 'The Clutch logo images (light and dark), the footer Clutch badge and the Clutch profile link are removed in the components. In the content only the "Review On" / "(N Reviews)" lines next to the logo are removed. Nothing else about Clutch was changed.', ...log.removals.map((r) => `- ${r.path} [${r.what}]: "${r.before}" -> (removed)`), '',
  '## Kept as-is on purpose', ...uniq(log.clutchKept, (x) => x.path + x.text).map((k) => `- ${k.path}: "${k.text}" (${k.why})`), '',
  `## Cyrillic look-alike letters replaced with Latin (${log.cyrillic.length} text fields)`, ...log.cyrillic.map((c) => `- ${c.path} [${c.loc}]: "${c.before.slice(0, 80)}" -> "${c.after.slice(0, 80)}"`), '',
  `## Typos and grammar fixed (${log.typos.length})`, ...log.typos.map((t) => `- ${t.path} [${t.loc}]: "${t.before}" -> "${t.after}" (${t.why}) …${t.context}…`), '',
  `## Stats not shown (no approved value in the shared stats config) (${log.statsDropped.length})`, ...log.statsDropped.map((s) => `- ${s.path}: ${s.original}`), '',
  `## Removed because they carry Singapore contact data (${log.dropped.length})`, ...log.dropped.map((d) => `- ${d.path}: ${d.what} (${d.why})`), '',
  `## H1 fixes (${log.h1.length})`, ...log.h1.map((h) => `- ${h.path}: ${h.action}`), '',
  `## SEO length flags`, `Titles over 60 characters (${log.titleLong.length}):`, ...log.titleLong.map((t) => `- ${t.path} (${t.length}): ${t.title}`), '', `Descriptions over 155 characters (${log.descLong.length}):`, ...log.descLong.map((t) => `- ${t.path} (${t.length})`), '',
  `Spelling (en-IN) conversions applied: ${log.spelling} text fields.`]
writeFileSync('docs/CONTENT_CHANGES.md', md.join('\n') + '\n')
console.log(JSON.stringify({ pages: pages.length, overrides: log.overrides.length, cyrillic: log.cyrillic.length, typos: log.typos.length, statsDropped: log.statsDropped.length, dropped: log.dropped.length, h1: log.h1.length, titleLong: log.titleLong.length, descLong: log.descLong.length, spelling: log.spelling }))
