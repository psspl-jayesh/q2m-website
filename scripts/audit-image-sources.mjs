import * as cheerio from 'cheerio'
import { readFileSync } from 'node:fs'
const prev = JSON.parse(readFileSync('docs/_prev/content.before-live-sync.json', 'utf8'))
const paths = [...prev.pages, ...prev.posts, ...prev.caseStudies].map((e) => e.path)
const want = { 'clutch-logo.svg (egenslab)': /egenslab\.com\/.*clutch-logo\.svg/, 'clutch-logo-white.svg': /clutch-logo-white\.svg/, 'banner-img-4.jpg (egenslab)': /banner-img-4/, 'breadcrumb-bg.png (egenslab)': /breadcrumb-bg/, 'placeholder.png': /elementor\/assets\/images\/placeholder/ }
const out = {}
await Promise.all(paths.map(async (p) => {
  const html = await (await fetch('https://q2msolutions.com' + p, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
  const $ = cheerio.load(html); $('script,style,noscript').remove()
  let section = 'hero'; let inHero = true
  $('body *').each((_, el) => {
    const $el = $(el); const tag = el.tagName
    if ($el.closest('header,footer').length) return
    if (/^h[12]$/.test(tag)) { section = $el.text().replace(/\s+/g, ' ').trim(); inHero = tag === 'h1' }
    if (tag !== 'img' && !$el.attr('style')) return
    const u = (tag === 'img' ? ($el.attr('data-src') || $el.attr('src') || '') + ' ' + ($el.attr('srcset') || '') : $el.attr('style')) || ''
    for (const [k, re] of Object.entries(want)) if (re.test(u)) (out[k] ??= []).push(`${p} [${inHero ? 'hero (under the page title)' : section.slice(0, 55)}]`)
  })
}))
for (const [k, v] of Object.entries(out)) { console.log('\n##', k, v.length, 'places'); if (/banner-img-4|clutch-logo-white/.test(k) || v.length < 8) v.forEach((x) => console.log('  ', x)) }
console.log('\nbreadcrumb pages:', [...new Set((out['breadcrumb-bg.png (egenslab)'] || []).map((x) => x.split(' ')[0]))].join(' '))
console.log('\nclutch (egenslab) sample:', (out['clutch-logo.svg (egenslab)'] || []).slice(0, 3))
console.log('\nplaceholder total', (out['placeholder.png'] || []).length, 'pages', new Set((out['placeholder.png'] || []).map((x) => x.split(' ')[0])).size)
import { writeFileSync } from 'node:fs'; writeFileSync('docs/_prev/image-where.json', JSON.stringify(out, null, 1))
