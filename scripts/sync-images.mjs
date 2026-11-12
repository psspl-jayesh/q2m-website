// Re-runnable image sync: crawls the LIVE site, downloads the exact originals into public/images, writes the manifest
// (src/data/image-manifest.json), rewrites src/data/content.json to the local files, and writes the reports in docs/.
//
//   pipeline:  npm run content   (fetch-content.mjs)      live WordPress REST -> content.json (images still point at the live site)
//              node scripts/hygiene-content.mjs
//              node scripts/localise-content.mjs
//              node scripts/sync-images.mjs                 <- this script
//              node scripts/optimize-images.mjs             AVIF/WebP variants
//
// Nothing is hotlinked at run time. Third-party and theme-demo images are flagged, never copied.
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { fix as spell } from './lib-spelling.mjs'

const BASE = 'https://q2msolutions.com'
const UA = { 'User-Agent': 'Mozilla/5.0 (Q2M-image-sync)' }
const OUT = 'public/images'
const MANIFEST = 'src/data/image-manifest.json'
const content = JSON.parse(readFileSync('src/data/content.json', 'utf8'))
/** Third-party images you approved: downloaded and served locally (never hotlinked). */
const APPROVED_THIRD_PARTY = new Set()
/** The Clutch logo and the Google reviews logo (footer badge) are never shown or downloaded. */
const CLUTCH_IMAGE = /clutch|google-review/i
const LOGO_ALTS = JSON.parse(readFileSync('src/content/shared/logo-alts.json', 'utf8'))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function http(url, opts = {}, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { return await fetch(url, { headers: UA, redirect: 'follow', ...opts }) } catch (e) { if (i === tries - 1) throw e; await sleep(400 * (i + 1)) }
  }
}
const text = async (u) => (await http(u)).text()
const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k) } })); return out }

/* ───────────── helpers ───────────── */
const abs = (u, from) => { try { return new URL(u.trim(), from).href.split('#')[0] } catch { return null } }
const hostOf = (u) => new URL(u).hostname.replace(/^www\./, '')
const isInternal = (u) => hostOf(u) === 'q2msolutions.com'
/** Strip WordPress size suffix (-420x430) and -scaled to get the original file name. */
const originalOf = (u) => u.split('?')[0].replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1').replace(/-scaled(\.[a-z0-9]+)$/i, '$1')
const bestFromSrcset = (s) => (s || '').split(',').map((x) => x.trim().split(/\s+/)).filter((x) => x[0]).map(([u, d]) => ({ u, w: parseInt(d) || (d?.endsWith('x') ? parseFloat(d) * 100 : 0) })).sort((a, b) => b.w - a.w)[0]?.u
const slugOfPath = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').split('/').pop())
const keyOf = (t) => spell(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const SKIP_URL = /(s\.w\.org\/images\/core\/emoji|gravatar\.com|googletagmanager|google-analytics|facebook\.com\/tr|hcaptcha\.com|\/emoji\/|spacer\.gif|1x1\.|blank\.gif|pixel)/i
const UI_SPRITE = /(ui-icons_|flags(@2x)?\.png|ajax-loader|loading\.gif|sprite)/i
const GENERIC_ALT = /^(image|img|logo|photo|picture|banner|icon|placeholder|untitled|)\s*\d*$/i

/* ───────────── Step 1: page list (sitemap + menu) ───────────── */
async function livePageList() {
  const sm = new Set()
  const idx = await text(`${BASE}/sitemap_index.xml`).catch(() => '')
  const subs = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  for (const s of subs) { const x = await text(s).catch(() => ''); for (const m of x.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!/\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(m[1])) sm.add(new URL(m[1]).pathname) }
  sm.add('/')
  // main menu + footer links from the live home page
  const $ = cheerio.load(await text(BASE + '/'))
  const menu = new Set()
  $('header a[href], nav a[href], footer a[href]').each((_, a) => { const u = abs($(a).attr('href'), BASE + '/'); if (u && isInternal(u) && !/\.(jpe?g|png|pdf|webp|svg)$/i.test(u) && !/#/.test($(a).attr('href'))) menu.add(new URL(u).pathname) })
  return { sitemap: [...sm].sort(), menu: [...menu].sort() }
}

/* ───────────── Step 2: extract every image from a live page ───────────── */
let cssRules = null
async function loadCssRules(html$) {
  if (cssRules) return cssRules
  cssRules = []
  const hrefs = html$('link[rel=stylesheet]').map((_, l) => html$(l).attr('href')).get().map((h) => abs(h, BASE + '/')).filter((h) => h && isInternal(h))
  for (const h of hrefs) {
    const css = await text(h).catch(() => '')
    for (const m of css.matchAll(/([^{}]+)\{[^}]*background(?:-image)?:[^};]*url\(([^)]+)\)/g)) {
      const u = abs(m[2].replace(/^["']|["']$/g, ''), h)
      if (!u || /data:/.test(u) || !/\.(png|jpe?g|webp|svg|gif|avif)/i.test(u) || UI_SPRITE.test(u)) continue
      const sel = m[1].split(',').map((s) => s.trim().split('}').pop().trim()).filter((s) => s && !/[:@]/.test(s.replace(/::?(before|after)/, '#')) )
      cssRules.push({ sel, url: u })
    }
  }
  return cssRules
}

async function extract(pathname) {
  const html = await text(BASE + pathname)
  const $ = cheerio.load(html)
  const rules = await loadCssRules($)
  const bgByEl = new Map()
  for (const r of rules) for (const sel of r.sel) { try { $(sel).each((_, el) => { (bgByEl.get(el) ?? bgByEl.set(el, []).get(el)).push(r.url) }) } catch { /* unsupported selector */ } }
  $('noscript, script, style, template').remove()

  const items = []
  const extra = { icons: [] }
  let section = 'hero'
  let inHero = true // true before the first h2: the h1 block holds the hero image
  const seen = new Set()
  const push = (it) => { const k = `${it.region}|${it.section}|${originalOf(it.url)}`; if (seen.has(k)) return; seen.add(k); items.push({ ...it, order: items.length }) }
  $('link[rel~=icon], link[rel=apple-touch-icon], meta[property="og:image"]').each((_, el) => { const u = abs($(el).attr('href') || $(el).attr('content') || '', BASE + '/'); if (u) extra.icons.push({ url: u, what: el.tagName === 'meta' ? 'og:image' : 'icon' }) })

  $('body *').each((_, el) => {
    const $el = $(el); const tag = el.tagName
    const chrome = $el.closest('header, footer, .elementor-location-header, .elementor-location-footer').length > 0
    if (!chrome && /^h[12]$/.test(tag)) { section = $el.text().replace(/\s+/g, ' ').trim(); inHero = tag === 'h1' }
    const isSiteLogo = tag === 'img' && /q2m-logo-(light|dark)\.svg/i.test($el.attr('src') || $el.attr('data-src') || '')
    const reg = chrome || isSiteLogo ? 'chrome' : 'page'
    const sec = chrome || isSiteLogo ? 'chrome' : inHero ? 'hero' : section
    if (tag === 'img') {
      const raw = $el.attr('data-src') || $el.attr('data-lazy-src') || $el.attr('data-original') || $el.attr('src') || ''
      const srcset = $el.attr('data-srcset') || $el.attr('data-lazy-srcset') || $el.attr('srcset')
      const u = abs(bestFromSrcset(srcset) || (raw.startsWith('data:') ? '' : raw), BASE + '/')
      if (u && !SKIP_URL.test(u)) push({ region: reg, section: sec, kind: 'img', url: u, alt: ($el.attr('alt') || '').trim(), w: parseInt($el.attr('width')) || null, h: parseInt($el.attr('height')) || null })
    } else if (tag === 'video') {
      const p = $el.attr('poster'); if (p) push({ region: reg, section: sec, kind: 'poster', url: abs(p, BASE + '/'), alt: '' })
    }
    const st = $el.attr('style') || ''
    const m = st.match(/url\(["']?([^"')]+)["']?\)/); if (m && !m[1].startsWith('data:')) push({ region: reg, section: sec, kind: 'inline-bg', url: abs(m[1], BASE + '/'), alt: '' })
    ;(bgByEl.get(el) ?? []).forEach((u) => push({ region: reg, section: sec, kind: 'css-bg', url: u, alt: '' }))
  })
  return { items, extra }
}

/* ───────────── run ───────────── */
const { sitemap, menu } = await livePageList()
const localEntries = [...content.pages, ...content.posts, ...content.caseStudies]
const localPaths = new Set(localEntries.map((e) => e.path))
const EXTRA_LOCAL = ['/privacy-policy/'] // routes that exist only in the new site
console.log('live sitemap urls', sitemap.length, 'menu urls', menu.length, 'local entries', localEntries.length)

const crawlPaths = [...localPaths]
const crawled = {}
await pool(crawlPaths, 6, async (p) => {
  try { crawled[p] = await extract(p) } catch (e) { crawled[p] = { error: String(e) } }
})
const failedPages = Object.entries(crawled).filter(([, v]) => v.error).map(([p, v]) => `${p}: ${v.error}`)

/* classify */
const flags = { thirdParty: [], themeDemo: [], pluginPlaceholder: [], notFound: [], altReview: [], failedPages, lowRes: [], themeAsset: [] }
const DEMO_UPLOAD = /\/uploads\/2024\/03\/(portfolio-image|blog|team|client|brand|testimonial|service)[^/]*$/i
const unique = new Map() // original url -> { liveUrls:Set, pages:Set, chrome:bool, item }
for (const [p, v] of Object.entries(crawled)) {
  if (v.error) continue
  for (const it of v.items) {
    const o = originalOf(it.url)
    if (CLUTCH_IMAGE.test(o)) { it.skip = 'clutch'; continue }
    if (!isInternal(o) && !APPROVED_THIRD_PARTY.has(o)) { flags.thirdParty.push(`${p} [${it.section}] ${it.url}`); it.skip = 'third-party'; continue }
    if (/plugins\/elementor\/assets\/images\/placeholder/.test(o)) { flags.pluginPlaceholder.push(`${p} [${it.section}]`); it.skip = 'placeholder'; continue }
    if (DEMO_UPLOAD.test(o)) { flags.themeDemo.push(`${p} [${it.section}] ${o.replace(BASE, '')}`); it.skip = 'demo'; continue }
    const u = unique.get(o) ?? unique.set(o, { liveUrls: new Set(), pages: new Set(), chrome: false }).get(o)
    u.liveUrls.add(it.url); u.pages.add(p); if (it.region === 'chrome') u.chrome = true
  }
}

/* download originals */
mkdirSync(OUT, { recursive: true })
const slugFor = new Map()
const usedNames = new Map() // dir/filename -> original
const localFor = new Map() // original -> { file, w, h, bytes, from }
const cleanName = (o) => decodeURIComponent(path.basename(o)).toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9.-]/g, '')
for (const [o, u] of unique) {
  const shared = u.chrome || u.pages.size >= 2
  const dir = shared ? 'shared' : slugOfPath([...u.pages][0])
  let name = cleanName(o)
  const key = `${dir}/${name}`
  if (usedNames.has(key) && usedNames.get(key) !== o) { const ym = o.match(/uploads\/(\d{4})\/(\d{2})/); name = `${ym ? ym[1] + '-' + ym[2] + '-' : 'x-'}${name}` }
  usedNames.set(`${dir}/${name}`, o)
  slugFor.set(o, { dir, name, shared })
}
const dlStats = { ok: 0, fallback: 0, failed: 0 }
await pool([...unique.entries()], 8, async ([o, u]) => {
  const { dir, name } = slugFor.get(o)
  const dest = path.join(OUT, dir, name)
  mkdirSync(path.dirname(dest), { recursive: true })
  const candidates = [o, ...[...u.liveUrls].filter((x) => originalOf(x) === o && x !== o).sort((a, b) => b.length - a.length)]
  for (const [i, c] of candidates.entries()) {
    try {
      if (!existsSync(dest)) {
        const r = await http(c)
        if (!r.ok) { if (i === 0) continue; throw new Error(String(r.status)) }
        writeFileSync(dest, Buffer.from(await r.arrayBuffer()))
      }
      let w = null, h = null
      try { const m = await sharp(dest).metadata(); w = m.width; h = m.height } catch { /* svg without size */ }
      if (/\.svg$/i.test(name)) { const svg = readFileSync(dest, 'utf8'); const vb = svg.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/); const wa = svg.match(/<svg[^>]*\swidth=["']([\d.]+)/); const ha = svg.match(/<svg[^>]*\sheight=["']([\d.]+)/); w = w || Math.round(+(wa?.[1] ?? vb?.[1] ?? 0)) || null; h = h || Math.round(+(ha?.[1] ?? vb?.[2] ?? 0)) || null }
      localFor.set(o, { file: `/images/${dir}/${name}`, w, h, fromOriginal: i === 0 })
      i === 0 ? dlStats.ok++ : dlStats.fallback++
      return
    } catch (e) { /* try next candidate */ }
  }
  dlStats.failed++; flags.notFound.push(`${[...u.pages][0]} ${o.replace(BASE, '')}`)
})

/* ───────────── manifest ───────────── */
const roleOf = (it, loc) => {
  const f = (loc.file || '').toLowerCase()
  if (it.kind === 'css-bg' || it.kind === 'inline-bg') return 'background' // decorative theme backgrounds: downloaded, not rendered
  if (/\.svg$/.test(f) && (loc.w ?? 0) <= 200 || /arrow|play-btn|icon/.test(f)) return 'icon'
  if (/logo|badge|clutch|google-review/.test(f) || (it.section && /client|partner|trusted|backed|certif/i.test(it.section) && (loc.h ?? 999) <= 260)) return 'logo'
  if (it.section === 'hero' || it.order === 0) return 'hero'
  return 'content'
}
const humanise = (file) => path.basename(file).replace(/\.[a-z0-9]+$/i, '').replace(/-(img|image|banner|logo|\d{3,4}x\d{3,4})$/gi, '').replace(/[-_]+/g, ' ').trim()
const manifest = { generatedAt: new Date().toISOString(), source: BASE, pages: {}, shared: { chrome: [], icons: [] }, brand: {}, stats: {}, mapping: {} }
const altByFile = new Map()
for (const [p, v] of Object.entries(crawled)) {
  if (v.error) continue
  const list = []
  for (const it of v.items) {
    if (it.skip || it.region !== 'page') continue
    const o = originalOf(it.url); const loc = localFor.get(o); if (!loc) continue
    const role = roleOf(it, loc)
    let alt = it.alt, altSource = 'live'
    const curated = LOGO_ALTS[path.basename(loc.file)]
    if (role === 'icon') { alt = ''; altSource = 'decorative' }
    else if (curated) { alt = curated; altSource = 'curated' }
    else if (!alt || GENERIC_ALT.test(alt)) {
      alt = role === 'logo' ? `${humanise(loc.file)} logo` : role === 'hero' ? `${spell(it.section === 'hero' ? (localEntries.find((e) => e.path === p)?.title ?? humanise(loc.file)) : it.section)}: illustration` : `${humanise(loc.file)}`
      altSource = 'needs-review'; const prev = altByFile.get(loc.file); altByFile.set(loc.file, { alt, live: it.alt || '', pages: (prev?.pages ?? 0) + 1, role })
    }
    if (role === 'hero' && (loc.w ?? 9999) < 800) flags.lowRes.push(`${p} ${loc.file} ${loc.w}x${loc.h}`)
    list.push({ order: list.length, section: it.section === 'hero' ? 'hero' : spell(it.section), sectionKey: it.section === 'hero' ? 'hero' : keyOf(it.section), kind: it.kind, role, file: loc.file, w: loc.w, h: loc.h, alt: spell(alt), altSource, shared: slugFor.get(o).shared, original: o })
  }
  manifest.pages[p] = list
}
// chrome (header/footer) images, identical on every page: collected from the home crawl
const homeChrome = crawled['/']?.items.filter((i) => i.region === 'chrome' && !i.skip) ?? []
const seenChrome = new Set()
for (const it of homeChrome) {
  const o = originalOf(it.url); const loc = localFor.get(o); if (!loc || seenChrome.has(o)) continue; seenChrome.add(o)
  const f = loc.file.toLowerCase()
  const decorative = /footer-logo-bg|arrow-icon|bg/.test(f)
  manifest.shared.chrome.push({ file: loc.file, w: loc.w, h: loc.h, alt: decorative ? '' : spell(it.alt || humanise(loc.file)), altSource: decorative ? 'decorative' : it.alt ? 'live' : 'needs-review', role: /clutch|google-review/.test(f) ? 'badge' : /logo-(light|dark)/.test(f) ? 'logo' : 'decorative', variant: /light/.test(f) ? 'light' : /dark/.test(f) ? 'dark' : undefined, original: o })
  if (!decorative && !it.alt) altByFile.set(loc.file, { alt: humanise(loc.file), live: '', pages: 'all (footer)', role: 'badge' })
}
// favicon / og image
const icons = crawled['/']?.extra.icons ?? []
for (const ic of icons) { const o = originalOf(ic.url); if (!isInternal(o)) { flags.thirdParty.push(`/ ${ic.what} ${ic.url}`); continue } const dir = 'shared'; const name = cleanName(o); const dest = path.join(OUT, dir, name); mkdirSync(path.dirname(dest), { recursive: true }); try { if (!existsSync(dest)) { const r = await http(o); if (!r.ok) { flags.notFound.push(`/ ${ic.what} ${o}`); continue } writeFileSync(dest, Buffer.from(await r.arrayBuffer())) } manifest.shared.icons.push({ what: ic.what, file: `/images/${dir}/${name}`, original: o }) } catch { flags.notFound.push(`/ ${ic.what} ${o}`) } }
// brand kit logos (authoritative per the brand kit); the live SVG logos are kept under shared/ but not used for display
manifest.brand = { logoColor: { file: '/brand/Q2M_Logo_Color_Transparent.png', w: 826, h: 498, alt: 'Q2M Solutions' }, logoReverse: { file: '/brand/Q2M_Logo_Reverse_Transparent.png', w: 826, h: 498, alt: 'Q2M Solutions' } }

/* rewrite content.json: every image now points at the local original */
const resolve = (u) => { if (!u || typeof u !== 'string') return u; const a = abs(u, BASE + '/'); if (!a) return u; const l = localFor.get(originalOf(a)); return l ? l.file : u }
let rewritten = 0, unmapped = []
for (const e of localEntries) {
  for (const b of e.blocks) if (b.t === 'img') { const r = resolve(b.src); if (r !== b.src) { b.src = r; rewritten++ } else if (!b.src.startsWith('/images/')) unmapped.push(`${e.path} ${b.src}`) }
  e.ogImage = resolve(e.ogImage)
}
for (const m of Object.values(content.media)) { const r = resolve(m.src); if (r === m.src && !m.src.startsWith('/images/')) unmapped.push(`media ${m.src}`); m.src = r }
// drop block images that are flagged (third-party, theme demo, plugin placeholder) so nothing hotlinked remains
for (const e of localEntries) e.blocks = e.blocks.filter((b) => b.t !== 'img' || b.src.startsWith('/images/'))
content.hygiene = { ...(content.hygiene ?? {}), images: { syncedAt: manifest.generatedAt, rewritten, unmapped: unmapped.length } }
writeFileSync('src/data/content.json', JSON.stringify(content))

/* mapping (Step 1) */
const liveOnly = sitemap.filter((p) => !localPaths.has(p))
const mapping = { sitemap, menu, liveWithRoute: sitemap.filter((p) => localPaths.has(p)), liveWithoutRoute: liveOnly, menuWithoutRoute: menu.filter((p) => !localPaths.has(p) && !/^\/(category|tag|author|\d{4})/.test(p)), localWithoutLive: [...localPaths].filter((p) => !sitemap.includes(p)).concat(EXTRA_LOCAL) }
manifest.mapping = mapping

// counts: live page images (page region, after exclusions) vs manifest
const counts = {}
for (const [p, v] of Object.entries(crawled)) { if (v.error) continue; const raw = v.items.filter((i) => i.region === 'page').length; const kept = (manifest.pages[p] ?? []).length; counts[p] = { live: raw, excluded: v.items.filter((i) => i.region === 'page' && i.skip).length, manifest: kept } }
manifest.stats = { pages: Object.keys(manifest.pages).length, images: Object.values(manifest.pages).reduce((a, l) => a + l.length, 0), uniqueFiles: localFor.size, download: dlStats, counts }
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1))

/* small static file for components that need a few site-wide images without loading the full manifest */
writeFileSync('src/data/site-images.json', JSON.stringify({
  brand: manifest.brand,
  favicon: manifest.shared.icons[0]?.file ?? null,
  ogDefault: '/brand/og-default.png',
  liveLogosNotUsed: manifest.shared.chrome.filter((c) => c.role === 'logo').map((c) => c.file),
}, null, 1))

/* reports */
mkdirSync('docs', { recursive: true })
const md = []
md.push('# Image sync report', '', `Generated ${manifest.generatedAt} by scripts/sync-images.mjs. Source: ${BASE}.`, '',
  `- Live pages crawled: ${Object.keys(manifest.pages).length}. Unique image files downloaded: ${localFor.size} (originals ${dlStats.ok}, largest-available fallback ${dlStats.fallback}, failed ${dlStats.failed}).`, `- Block/media image references rewritten to local files: ${rewritten}. Still pointing at the live site: ${unmapped.length}.`, '',
  '## Flags', '',
  `### Third-party / theme demo domain images (not copied; ${flags.thirdParty.length})`, ...[...new Set(flags.thirdParty.map((x) => x.replace(/^\S+ \[[^\]]*\] /, '')))].map((x) => `- ${x} (on ${flags.thirdParty.filter((f) => f.endsWith(x)).length} places)`), '',
  `### Theme demo placeholders in /uploads/2024/03 (not copied, need your decision; ${flags.themeDemo.length})`, ...flags.themeDemo.map((x) => `- ${x}`), '',
  `### Page-builder placeholder.png still on live pages (not copied; ${new Set(flags.pluginPlaceholder.map((x) => x.split(' ')[0])).size} pages, ${flags.pluginPlaceholder.length} image placements)`, ...[...new Set(flags.pluginPlaceholder.map((x) => x.split(' ')[0]))].map((x) => `- ${x}`), '',
  `### Download failures / 404 (${flags.notFound.length})`, ...flags.notFound.map((x) => `- ${x}`), '',
  `### Pages that failed to crawl (${flags.failedPages.length})`, ...flags.failedPages.map((x) => `- ${x}`), '',
  `### Low resolution sources (< 800px wide, hero/media; ${flags.lowRes.length})`, ...flags.lowRes.map((x) => `- ${x}`), '',
  `### Alt text written by us because the live alt was empty or generic (${altByFile.size} unique files); please review`, ...[...altByFile].map(([f, v]) => `- ${f} (${v.role}, used on ${v.pages} pages) -> "${v.alt}"  [live alt: "${v.live}"]`))
writeFileSync('docs/IMAGE_SYNC_REPORT.md', md.join('\n') + '\n')
const pm = ['# Live page to local route mapping', '', `Sitemap URLs: ${sitemap.length}; menu/footer links: ${menu.length}.`, '', `## Live pages with a local route (${mapping.liveWithRoute.length})`, ...mapping.liveWithRoute.map((p) => `- ${p}`), '', `## Live sitemap pages with NO local route (${mapping.liveWithoutRoute.length})`, ...mapping.liveWithoutRoute.map((p) => `- ${p}`), '', `## Menu/footer links with no local route (${mapping.menuWithoutRoute.length})`, ...mapping.menuWithoutRoute.map((p) => `- ${p}`), '', `## Local routes with no live page (${mapping.localWithoutLive.length})`, ...mapping.localWithoutLive.map((p) => `- ${p}`)]
writeFileSync('docs/IMAGE_PAGE_MAP.md', pm.join('\n') + '\n')
console.log(JSON.stringify({ pages: manifest.stats.pages, images: manifest.stats.images, uniqueFiles: localFor.size, dlStats, rewritten, unmapped: unmapped.length, flags: Object.fromEntries(Object.entries(flags).map(([k, v]) => [k, v.length])), mapping: { liveWithRoute: mapping.liveWithRoute.length, liveWithoutRoute: mapping.liveWithoutRoute.length, localWithoutLive: mapping.localWithoutLive.length } }, null, 1))
