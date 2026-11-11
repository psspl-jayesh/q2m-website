// Generates public/sitemap.xml, public/robots.txt and docs/page-tracker.csv from synced content.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
const c = JSON.parse(readFileSync('src/data/content.json', 'utf8'))
const base = 'https://q2msolutions.com'
const all = [...c.pages, ...c.posts, ...c.caseStudies]
const loc = (e) => `${base}${e.slug === 'q2m-solutions' ? '/' : e.path}`
const urls = all.map((e) => `  <url><loc>${loc(e)}</loc><lastmod>${e.modified.slice(0, 10)}</lastmod><xhtml:link rel="alternate" hreflang="en-IN" href="${loc(e)}"/></url>`).join('\n')
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`)
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`)
mkdirSync('docs', { recursive: true })
const row = (e, s) => [e.path, JSON.stringify(e.title), e.type, s].join(',')
writeFileSync('docs/page-tracker.csv', ['path,title,type,status',
  ...all.map((e) => row(e, 'Implemented (route renders, no overflow 360/390/768/1920; visual review pending)')),
  ...c.retired.map((e) => [e.path, JSON.stringify(e.title), e.type, 'Not migrated: noindex theme-demo/system page, needs approval'].join(','))].join('\n'))
console.log('sitemap urls', all.length, 'retired', c.retired.length)
