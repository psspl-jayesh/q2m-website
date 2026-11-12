// Read-only audit of everything that is region-specific. Writes docs/LOCALE_AUDIT.md.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const walk = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p] })
const code = walk('src').filter((f) => /\.(tsx?|css)$/.test(f))
const c = JSON.parse(readFileSync('src/data/content.json', 'utf8'))
const home = JSON.parse(readFileSync('src/data/home.json', 'utf8'))

const content = []
for (const e of [...c.pages, ...c.posts, ...c.caseStudies]) {
  content.push({ where: e.path, kind: 'title', text: e.title }, { where: e.path, kind: 'meta', text: e.metaTitle + ' | ' + e.description })
  e.blocks.forEach((b) => b.text && content.push({ where: e.path, kind: b.t, text: b.text }))
  e.faqs.forEach((f) => content.push({ where: e.path, kind: 'faq', text: f.q + ' ' + f.a.join(' ') }))
}
const walkJson = (o, k = '', out = []) => { if (typeof o === 'string') out.push({ where: 'home.json:' + k, kind: 'home', text: o }); else if (o && typeof o === 'object') for (const [kk, v] of Object.entries(o)) walkJson(v, k + '.' + kk, out); return out }
content.push(...walkJson(home))

const P = {
  'currency symbols / codes': /(\$\s?\d|\bUSD\b|\bEUR\b|\bGBP\b|€|£|\bdollars?\b|\bINR\b|₹|\bRs\.?\s?\d)/i,
  'prices / cost figures': /\b(price|pricing|cost|costs|budget|fee|fees)\b[^.]{0,60}\d|\d[^.]{0,30}\b(per hour|\/hr|per month|\/month)\b/i,
  'dates': /\b(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(st|nd|rd|th)?,?\s*\d{0,4}|\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?(\s+\d{4})?)/i,
  'times / timezones': /\b(\d{1,2}:\d{2}\s?(am|pm)?|\b(EST|PST|CST|GMT|UTC|IST|SGT|BST|CET)\b|24\/7|business hours|time zones?)\b/i,
  'phone numbers': /(\+\d{1,3}[\s-]?\(?\d[\d\s-]{6,}|\btel:)/i,
  'addresses / venues': /\b(Cecil Street|GB Building|BIEC|Tumkur|Bengaluru|Bangalore|street|suite|floor)\b/i,
  'non-Indian regions': /\b(Singapore|APAC|Asia[- ]Pacific|USA|U\.S\.|US|United States|America|American|UK|United Kingdom|Britain|London|New York|Las Vegas|Denver|California|Texas|Europe|European|Australia|Dubai|UAE|Canada|Fortune 500)\b/,
  'privacy / legal frameworks': /\b(GDPR|CCPA|DPDP|privacy policy|cookie|consent|HIPAA|SOC ?2)\b/i,
}
const US = ['optimiz', 'organiz', 'moderniz', 'customiz', 'personaliz', 'utiliz', 'standardiz', 'minimiz', 'maximiz', 'prioritiz', 'categoriz', 'visualiz', 'summariz', 'recogniz', 'synchroniz', 'centraliz', 'digitiz', 'monetiz', 'analyz', 'color', 'behavior', 'favor', 'center', 'license', 'catalog', 'program(?!me)', 'labor', 'neighbor', 'defense', 'offense', 'fulfill', 'enrollment', 'artifact', 'gray', 'traveler', 'modeling', 'labeling', 'cancel(?:ed|ing)', 'judgment', 'aging', 'sizable', 'sceptic']
const usRe = new RegExp('\\b(' + US.join('|') + ')\\w*', 'ig')

const lines = []
const sec = (t) => lines.push('', '## ' + t)

lines.push('# India localisation audit', '', `Generated ${new Date().toISOString()} by scripts/audit-locale.mjs. Read-only; run before the localisation changes.`)

// 1. Code-level
sec('1. Hardcoded region details in source code')
const codeHits = []
code.forEach((f) => readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
  for (const [k, re] of Object.entries(P)) if (re.test(l) && !/^\s*(\/\/|\*|\/\*)/.test(l)) codeHits.push(`- \`${f.replace(/\\/g, '/')}:${i + 1}\` [${k}] ${l.trim().slice(0, 140)}`)
  if (/lang=|en-GB|en-US|toLocale|Intl\./.test(l)) codeHits.push(`- \`${f.replace(/\\/g, '/')}:${i + 1}\` [locale call] ${l.trim().slice(0, 140)}`)
}))
lines.push(codeHits.join('\n') || '(none)')

// 2. Content-level
const counts = {}
for (const [k, re] of Object.entries(P)) {
  const hits = content.filter((x) => re.test(x.text))
  counts[k] = hits.length
  sec(`2. Content: ${k} (${hits.length} text items on ${new Set(hits.map((h) => h.where)).size} pages)`)
  const byWhere = {}
  hits.forEach((h) => { const m = h.text.match(re)?.[0]; (byWhere[h.where] ??= new Set()).add(m) })
  lines.push(Object.entries(byWhere).slice(0, 60).map(([w, s]) => `- ${w}: ${[...s].slice(0, 6).map((x) => '`' + x.slice(0, 40) + '`').join(', ')}`).join('\n') || '(none)')
}

// 3. Spelling
sec('3. American spellings in content')
const us = {}
content.forEach((x) => { for (const m of x.text.matchAll(usRe)) { const w = m[0].toLowerCase(); (us[w] ??= { n: 0, pages: new Set() }).n++; us[w].pages.add(x.where) } })
lines.push('| word | occurrences | pages |', '|---|---|---|', ...Object.entries(us).sort((a, b) => b[1].n - a[1].n).slice(0, 80).map(([w, v]) => `| ${w} | ${v.n} | ${v.pages.size} |`))

// 4. Forms
sec('4. Forms and fields')
lines.push(
  '- `src/components/BookingForm.tsx`: name, company, role, work email, industry, preferred day (Day 1/2/3), topic. No phone, no consent checkbox, no timezone/slots. Delivery by mailto or `VITE_BOOKING_ENDPOINT`.',
  '- `src/pages/Company.tsx` (Contact): full-name, organization, tel-phone (generic 6+ chars), email-company, subject, message, consent. Posts to the live Contact Form 7 (id 18). No country field, no address fields.',
  '- Blog search box (`src/pages/Stories.tsx`): no personal data.',
)

// 5. SEO
sec('5. SEO / metadata')
lines.push(
  '- `index.html`: `<html lang="en">`, static title/description.',
  '- `src/components/ui.tsx` Seo(): sets title, description, canonical, og:title/description/url/image/type, twitter:card, robots, JSON-LD. No og:locale, no hreflang.',
  '- JSON-LD in `Home.tsx` (Organization, no address/phone/areaServed), `ServicePage.tsx` (Service, BreadcrumbList, FAQPage), `Stories.tsx` (Article/BlogPosting), `Company.tsx` (ContactPage).',
  '- `public/sitemap.xml`, `public/robots.txt`: generated by `scripts/generate-seo.mjs`.',
  `- Titles/meta from CMS: ${c.pages.length + c.posts.length + c.caseStudies.length} entries; mention of India in titles: ${[...c.pages, ...c.posts, ...c.caseStudies].filter((e) => /india/i.test(e.metaTitle + e.title)).length}.`,
)

sec('6. Summary counts (content)')
lines.push(Object.entries(counts).map(([k, v]) => `- ${k}: ${v}`).join('\n'))
writeFileSync('docs/LOCALE_AUDIT.md', lines.join('\n') + '\n')
console.log(lines.length, 'lines; counts', counts, 'codeHits', codeHits.length)
