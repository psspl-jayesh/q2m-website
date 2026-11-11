// Pulls real content from the live WordPress REST API into src/data/content.json.
// Read-only. Nothing is invented: every string in the output comes from the CMS.
import * as cheerio from 'cheerio'
import { writeFileSync } from 'node:fs'
const BASE = 'https://q2msolutions.com'
const H = { 'User-Agent': 'Mozilla/5.0 (Q2M-content-sync)' }
const get = async (u) => { const r = await fetch(u, { headers: H }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json() }
const all = async (t) => { const o = []; for (let p = 1; ; p++) { try { const d = await get(`${BASE}/wp-json/wp/v2/${t}?per_page=100&page=${p}`); o.push(...d); if (d.length < 100) break } catch { break } } return o }
const dec = (s = '') => cheerio.load(`<p>${s}</p>`)('p').text().replace(/\s+/g, ' ').trim()
const rel = (u) => u.replace(BASE, '').replace(/^(?!\/)/, '/')

function parse(html) {
  const $ = cheerio.load(html || '')
  $('script,style,noscript,form,svg,button,nav').remove()
  const items = []
  $('h1,h2,h3,h4,h5,p,li,img,blockquote').each((_, el) => {
    const t = el.tagName
    if (t === 'img') {
      const src = $(el).attr('data-src') || $(el).attr('src') || ''
      if (src && !src.startsWith('data:')) items.push({ t: 'img', src, alt: $(el).attr('alt') || '' })
      return
    }
    if (t === 'p' && $(el).closest('li,blockquote').length) return
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (text) items.push({ t, text })
  })
  // Elementor renders desktop/mobile copies: drop repeats, numeric counter headings, theme-demo/placeholder images
  const seen = new Set()
  return items.filter((x) => {
    if (x.t === 'img' && /egenslab\.com|placeholder\.png/.test(x.src)) return false
    if (x.t === 'h5' && /^[\d.,+%]+$/.test(x.text)) return false
    const k = x.t === 'img' ? x.src : x.text
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const shape = (x, type) => {
  const y = x.yoast_head_json || {}
  return {
    id: x.id, type, path: rel(x.link), slug: x.slug, title: dec(x.title.rendered),
    date: x.date, modified: x.modified,
    metaTitle: y.title || '', description: y.description || '',
    ogImage: (y.og_image && y.og_image[0] && y.og_image[0].url) || '',
    robots: y.robots ? (y.robots.index === 'noindex' ? 'noindex' : 'index') : '',
    excerpt: dec(x.excerpt && x.excerpt.rendered).slice(0, 300),
    featuredMedia: x.featured_media || 0, categories: x.categories || [],
    blocks: parse(x.content && x.content.rendered), faqs: [],
  }
}

const [pages, posts, cases, cats, media] = await Promise.all([all('pages'), all('posts'), all('case-study'), all('categories'), Promise.resolve([])])
const mediaIds = [...pages, ...posts, ...cases].map((x) => x.featured_media).filter(Boolean)
const mediaMap = {}
for (let i = 0; i < mediaIds.length; i += 50) {
  const ids = mediaIds.slice(i, i + 50).join(',')
  try { (await get(`${BASE}/wp-json/wp/v2/media?include=${ids}&per_page=50&_fields=id,source_url,alt_text,media_details`)).forEach((m) => (mediaMap[m.id] = { src: m.source_url, alt: m.alt_text, w: m.media_details?.width, h: m.media_details?.height })) } catch {}
}
// FAQs are server-rendered Elementor widgets (not in REST content) -> read them from the live HTML
const faqOf = async (url) => {
  try {
    const html = await (await fetch(url, { headers: H })).text()
    const $ = cheerio.load(html)
    const f = []
    $('.accordion-item').each((_, el) => {
      const q = $(el).find('.accordion-button').first().text().replace(/\s+/g, ' ').replace(/^\s*\d+\.\s*/, '').trim()
      const a = $(el).find('.accordion-body').first().text().split(/\n\s*\n/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean)
      if (q && a.length) f.push({ q, a })
    })
    return f
  } catch { return [] }
}
const live = [...pages, ...posts, ...cases].filter((x) => !/noindex/.test(JSON.stringify(x.yoast_head_json?.robots || '')) || x.slug === 'q2m-solutions')
const faqMap = {}
for (let i = 0; i < live.length; i += 6) await Promise.all(live.slice(i, i + 6).map(async (x) => { const f = await faqOf(x.link); if (f.length) faqMap[x.id] = f }))
const out = {
  syncedAt: new Date().toISOString(), source: BASE,
  pages: pages.map((x) => shape(x, 'page')), posts: posts.map((x) => shape(x, 'post')), caseStudies: cases.map((x) => shape(x, 'case-study')),
  categories: cats.map((c) => ({ id: c.id, slug: c.slug, name: dec(c.name), count: c.count })),
  media: mediaMap,
}
// Ship only indexable content; record everything dropped so it can be reviewed (theme demos, test pages, carts...).
out.retired = [...out.pages, ...out.posts, ...out.caseStudies].filter((x) => x.robots === 'noindex' && x.slug !== 'q2m-solutions').map((x) => ({ path: x.path, title: x.title, type: x.type }))
const keep = (x) => x.robots !== 'noindex' || x.slug === 'q2m-solutions'
out.pages = out.pages.filter(keep); out.posts = out.posts.filter(keep); out.caseStudies = out.caseStudies.filter(keep)
for (const g of [out.pages, out.posts, out.caseStudies]) g.forEach((x) => { x.faqs = faqMap[x.id] || [] })
writeFileSync('src/data/content.json', JSON.stringify(out))
console.log(`pages ${out.pages.length} posts ${out.posts.length} case studies ${out.caseStudies.length} categories ${out.categories.length} media ${Object.keys(mediaMap).length}`)
