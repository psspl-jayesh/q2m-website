// Reads Q2M_Website_Home/index.html (READ-ONLY, never modified) and writes src/data/home.json + docs/CONTENT_GAPS.md.
// Every string comes from the folder. [TBC] placeholders are stripped and logged as gaps; nothing is invented.
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'

const SRC = 'Q2M_Website_Home'
const $ = cheerio.load(readFileSync(`${SRC}/index.html`, 'utf8'))
const gaps = { tbc: [], imageSlots: [], formNotConnected: true }
const clean = (s) => s.replace(/\s+/g, ' ').trim()

// Strip [TBC] spans, logging each with its section.
$('.tbc').each((_, el) => { gaps.tbc.push({ where: $(el).closest('section,footer').attr('id') || $(el).closest('section,footer').prop('tagName')?.toLowerCase() || '?', text: clean($(el).text()) }); $(el).attr('data-tbc', '1') })
const txt = (el) => { const c = $(el).clone(); c.find('[data-tbc]').remove(); return clean(c.text()) }

const head = (sec) => ({ eyebrow: txt($(sec).find('.eyebrow').first()), title: txt($(sec).find('h2').first()), intro: txt($(sec).find('.section-head > p, .faq-intro').first()) })

// meta
const meta = {
  title: clean($('title').text()),
  description: $('meta[name="description"]').attr('content') || '',
}

// hero
const h1 = $('.hero h1')
const heroLines = []; h1.contents().each((_, n) => { const t = clean($(n).text()); if (t) heroLines.push({ text: t, dim: n.type === 'tag' && $(n).hasClass('dim') }) })
const hero = {
  eyebrow: txt($('.hero .eyebrow')), lines: heroLines, lead: txt($('.hero .lead')),
  ctas: $('.hero-cta a').map((_, a) => ({ label: txt(a), href: $(a).attr('href'), primary: $(a).hasClass('btn-primary') })).get(),
  meta: $('.hero-meta > span').map((_, s) => txt(s)).get().filter((t) => t && !/^Stand$/.test(t)),
}

// BTS band
const bts = {
  eyebrow: txt($('.bts .eyebrow')), title: txt($('.bts h2')), paras: $('.bts p:not(.eyebrow)').map((_, p) => txt(p)).get(),
  facts: $('.bts dl dt').map((_, dt) => ({ k: txt(dt), v: txt($(dt).next('dd')) })).get().filter((f) => f.v),
}

// work tiles (images are slots only: record what is missing)
const work = { ...head('#work'), tiles: [] }
$('#work .tile').each((_, el) => {
  const cls = $(el).attr('class') || ''
  const label = clean($(el).find('.ph-label').text())
  const t = { w2: /\bw2\b/.test(cls), h2: /\bh2\b/.test(cls), dark: /\bdark\b/.test(cls), tag: txt($(el).find('.tag')), title: txt($(el).find('figcaption b')) }
  gaps.imageSlots.push({ where: 'See the work', slot: label, caption: t.title })
  work.tiles.push(t)
})

// services
const services = { ...head('#services'), items: $('#services .svc').map((_, el) => ({
  feature: $(el).hasClass('feature'), tag: txt($(el).find('.tag')), title: txt($(el).find('h3')), text: txt($(el).find('> p')), ticks: $(el).find('li').map((__, li) => txt(li)).get(),
})).get() }

// industries
const industries = { ...head('#industries'), items: $('#industries .card').map((_, el) => {
  const label = clean($(el).find('.ph-label').text()); const name = txt($(el).find('.name'))
  gaps.imageSlots.push({ where: 'Industries', slot: label, caption: name })
  return { name, text: txt($(el).find('.what')), refs: txt($(el).find('.svc-ref')) }
}).get() }

// about
const about = { eyebrow: txt($('#about .eyebrow')), title: txt($('#about h2')), paras: $('#about .about-copy p').map((_, p) => txt(p)).get() }

// team (all slots are placeholders)
const teamSlots = $('#team .person').length
const team = { ...head('#team'), people: $('#team .person').map((_, el) => ({ name: txt($(el).find('h3')), title: txt($(el).find('.role')), bio: txt($(el).find('.bio')) })).get().filter((p) => p.name) }
$('#team .person').each(() => gaps.imageSlots.push({ where: 'Team', slot: 'Photo slot 800x800 real headshot', caption: 'founder' }))

// approach, principles, stack, session
const approach = { ...head('#approach'), steps: $('#approach .phases li').map((_, li) => ({ num: txt($(li).find('.num')), title: txt($(li).find('h3')), text: txt($(li).find('p').first()), out: txt($(li).find('.out')) })).get() }
const principles = { ...head('.principles-band'), items: $('.principles > div').map((_, d) => ({ title: txt($(d).find('h3')), text: txt($(d).find('p')) })).get() }
const techSec = $('.stack').closest('section')
const stack = { eyebrow: txt(techSec.find('.eyebrow').first()), title: txt(techSec.find('h2').first()), intro: txt(techSec.find('.section-head > p').first()),
  groups: $('.stack > div').map((_, d) => ({ title: txt($(d).find('h3')), text: txt($(d).find('p')) })).get(),
  words: [...new Set($('.marquee-track span').map((_, s) => txt(s)).get())] }
const sessSec = $('.steps').closest('section')
const session = { eyebrow: txt(sessSec.find('.eyebrow').first()), title: txt(sessSec.find('h2').first()), intro: txt(sessSec.find('.section-head > p').first()),
  steps: $('.steps .step').map((_, s) => ({ min: txt($(s).find('.min')), title: txt($(s).find('h3')), text: txt($(s).find('p')) })).get() }

// faq
const faq = { eyebrow: txt($('#faq .eyebrow')), title: txt($('#faq h2')), intro: txt($('#faq .faq-intro')),
  items: $('#faq details').map((_, d) => ({ q: txt($(d).find('summary span')), a: [txt($(d).find('.ans p'))] })).get() }

// booking
const book = { eyebrow: txt($('#book .eyebrow')), title: txt($('#book h2')), intro: txt($('#book .book > div > p:not(.eyebrow)').first()),
  industries: $('#f-industry option').map((_, o) => txt(o)).get(), days: $('#f-day option').map((_, o) => txt(o)).get(),
  placeholder: $('#f-topic').attr('placeholder') || '', note: txt($('.form-note')),
  fields: $('#book-form .fld label').map((_, l) => txt(l)).get() }

// footer
const footer = { blurb: txt($('footer .foot > div p').first()), legal: txt($('footer .legal')) }

const home = { source: SRC, ingestedAt: new Date().toISOString(), meta, hero, bts, work, services, industries, about, team, approach, principles, stack, session, faq, book, footer }
writeFileSync('src/data/home.json', JSON.stringify(home, null, 1))
writeFileSync('src/data/site-copy.json', JSON.stringify({ footerBlurb: footer.blurb, legalName: 'Q2M Solutions Pvt Ltd' }))

// logos from the folder (originals are left untouched; copies go to public/brand)
mkdirSync('public/brand', { recursive: true })
for (const f of ['q2m-logo.png', 'q2m-logo-reverse.png']) copyFileSync(`${SRC}/images/${f}`, `public/brand/home-${f}`)

mkdirSync('docs', { recursive: true })
const gapDoc = `# Content gaps for the home page (from Q2M_Website_Home)

Generated by scripts/ingest-home.mjs. The source folder is never modified.

## Placeholders marked [TBC] in the source (not published; sections show only confirmed text)
${gaps.tbc.map((g) => `- ${g.where}: \`${g.text}\``).join('\n')}

## Image slots with no real image supplied (${gaps.imageSlots.length})
The folder contains only the two logo files. None of these images exist, so none were invented or replaced with stock.
They render as brand dot-pattern panels until real images are supplied.

| Section | Required image | Caption |
|---|---|---|
${gaps.imageSlots.map((g) => `| ${g.where} | ${g.slot.replace(/\|/g, '/')} | ${g.caption} |`).join('\n')}

## Other open items from Content_Review_Notes.txt
- Booking form is not connected to any booking tool or inbox.
- Claims to confirm before launch: device list (Meta, XREAL, Snap Spectacles, MentraOS), fixed-price discovery, client owns code and models, NDA and no-training policy, "follow up within a week".
- Copy was AI-assisted and needs Q2M approval (per the source notes).
`
writeFileSync('docs/CONTENT_GAPS.md', gapDoc)
console.log('services', services.items.length, 'industries', industries.items.length, 'faq', faq.items.length, 'tiles', work.tiles.length, 'tbc', gaps.tbc.length, 'slots', gaps.imageSlots.length, 'team people', team.people.length, 'of', teamSlots)
console.log(JSON.stringify({ hero: hero.lines, facts: bts.facts, heroMeta: hero.meta, footer, bookIntro: book.intro }, null, 1))
