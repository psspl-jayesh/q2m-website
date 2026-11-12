// Pre-render every route to static HTML (runs after `vite build` and `vite build --ssr src/entry-server.tsx`).
// For each route: dist/<route>/index.html with the rendered page in #root and the page's own <head> tags
// (title, description, canonical, hreflang, Open Graph, Twitter, robots, JSON-LD). dist/404.html for unknown URLs.
// The browser then hydrates the HTML (src/main.tsx).
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const DIST = 'dist'
const SSR = 'dist-ssr/entry-server.js'
const { render, routes, bts, BTS_PAGES } = await import(pathToFileURL(SSR).href)

const template = readFileSync(join(DIST, 'index.html'), 'utf8')
// The template's default title and description are replaced by each page's own tags
const base = template
  .replace(/\s*<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta name="description"[^>]*>/, '')
  .replace(/\s*<meta property="og:locale"[^>]*>/, '')
if (base === template) throw new Error('index.html: default title/description not found')

// BTS pages: if a BTS date boundary has passed since the build, hide the out-of-date page body until the browser has
// re-rendered it (src/main.tsx removes the class). Tiny inline check, no network.
const btsGuard = `<style>.bts-stale #main{visibility:hidden}</style>
    <script>(function(){var n=Date.now(),p=n<${Date.parse(bts.start)}?"before":n<${Date.parse(bts.end)}?"live":"after";if(p!==document.documentElement.dataset.btsPhase)document.documentElement.classList.add("bts-stale")})()</script>`

// The app script starts after the page has loaded (or 2.5 s at most): the pre-rendered HTML is already complete, so the first
// paint and the hero image are not held back by script evaluation. The script still downloads early (modulepreload).
const entry = base.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!entry) throw new Error('index.html: app entry script not found')
const deferred = base.replace(entry[0], `<link rel="modulepreload" crossorigin href="${entry[1]}">
    <script>(function(){var go=function(){if(go.done)return;go.done=1;var s=document.createElement("script");s.type="module";s.crossOrigin="";s.src="${entry[1]}";document.head.appendChild(s)};addEventListener("load",go,{once:true});setTimeout(go,2500)})()</script>`)

// Pages in the smart glasses design: preload its two fonts (Hanken Grotesk, Inter; Latin subsets) so the hero text does not change
// size when they arrive (layout shift). Other pages do not use them, so they do not get these preloads.
const DESIGN_FONT_ROUTES = ['/', '/smart-glasses-ar-wearable-app-development-services/']
const designFonts = readdirSync(join(DIST, 'assets')).filter((f) => /^(hanken-grotesk|inter)-latin-wght-normal-.*\.woff2$/.test(f))
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin>\n    `).join('')

function page(route, { html, head }) {
  const btsPage = BTS_PAGES.includes(route)
  const attrs = ` data-prerendered="${route}"${btsPage ? ` data-bts-phase="${bts.phase}"` : ''}`
  return deferred
    .replace('<html lang="en-IN">', `<html lang="en-IN"${attrs}>`)
    .replace('</head>', `    ${DESIGN_FONT_ROUTES.includes(route) ? designFonts : ''}${head}\n${btsPage ? `    ${btsGuard}\n` : ''}  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

const all = routes()
let n = 0
const missing = []
for (const route of all) {
  const r = render(route)
  if (!r.hasSeo) missing.push(route)
  const file = route === '/' ? join(DIST, 'index.html') : join(DIST, decodeURIComponent(route), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page(route, r))
  n++
}
// 404 page for unknown URLs (hosts serve dist/404.html); the browser renders the not-found page
const nf = render('/404-not-found/')
writeFileSync(join(DIST, '404.html'), page('/404-not-found/', nf))
rmSync('dist-ssr', { recursive: true, force: true })
// Server files for the web root: Apache .htaccess and Netlify/Cloudflare _redirects (old URLs, 404, HTTPS); see docs/deploy/
const { writeRedirects } = await import(pathToFileURL('scripts/redirects.mjs').href)
writeRedirects(['docs/deploy', DIST])
console.log(`prerender: ${n} routes + 404.html, BTS phase at build: ${bts.phase}`)
if (missing.length) { console.error('Routes without <Seo>:', missing); process.exit(1) }
