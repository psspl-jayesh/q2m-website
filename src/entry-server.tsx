import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import content from '@/data/content.json'
import manifest from '@/data/image-manifest.json'
import { ContentProvider, allEntries, type Content } from '@/lib/content'
import type { Manifest } from '@/lib/images'
import { HeadContext, type HeadData } from '@/lib/ssr'
import { headTagsHtml, seoTags } from '@/lib/seoTags'
import { organizationJsonLd } from '@/lib/seo'
import { LEGAL } from '@/config/locale'
import { BTS, btsPhase } from '@/config/bts'
import { AppRoutes } from '@/App'

/**
 * Build-time pre-render entry (used by scripts/prerender.mjs, never shipped to the browser).
 * Renders one route to HTML and returns its head tags, so every page is real HTML with its own title, description,
 * canonical, Open Graph and JSON-LD before any JavaScript runs.
 */
const c = { ...(content as unknown as Omit<Content, 'manifest'>), manifest: manifest as unknown as Manifest } as Content

/** Every route of the site: CMS pages, posts and case studies, category archives, privacy policy and the BTS page. */
export function routes(): string[] {
  const cats = c.categories.filter((x) => x.count > 0).map((x) => `/category/${x.slug}/`)
  return [...new Set([...allEntries(c).map((e) => e.path), ...cats, LEGAL.privacyPath, BTS.path])]
}

/** Pages whose content depends on the BTS dates (re-rendered in the browser if a date boundary has passed since the build). */
export const BTS_PAGES = ['/', BTS.path]

export function render(url: string) {
  const head: HeadData = {}
  const html = renderToString(
    <StrictMode>
      <HeadContext.Provider value={head}>
        <StaticRouter location={url}>
          <ContentProvider fallback={null} initial={c}><AppRoutes /></ContentProvider>
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  )
  const tags = head.seo ? headTagsHtml(seoTags(head.seo)) : ''
  const org = `<script id="ld-org" type="application/ld+json">${JSON.stringify(organizationJsonLd()).replace(/</g, '\\u003c')}</script>`
  return { html, head: `${tags}\n    ${org}`, hasSeo: !!head.seo }
}

/** BTS phase at build time and the date boundaries, for the page attributes and the inline stale-check script. */
export const bts = { phase: btsPhase(), start: BTS.start, end: BTS.end }
