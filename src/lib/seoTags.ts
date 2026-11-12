import { SITE_URL } from '@/lib/site'
import { LOCALE } from '@/config/locale'
import siteImages from '@/data/site-images.json'
import type { SeoInput } from '@/lib/ssr'

/**
 * The page head (title, description, canonical, hreflang, Open Graph, Twitter, robots, JSON-LD) as one list.
 * Used by <Seo> in the browser and by the pre-render build, so the static HTML and the live page carry the same tags.
 * `sel` finds an existing element to update in the browser.
 */
export type HeadTag =
  | { tag: 'title'; text: string }
  | { tag: 'meta' | 'link'; sel: string; attrs: Record<string, string> }
  | { tag: 'script'; id: string; attrs: Record<string, string>; text: string }

export function seoTags({ title, description, path, image, noindex, jsonLd }: SeoInput): HeadTag[] {
  const url = SITE_URL + path
  const img = image ? (image.startsWith('http') ? image : SITE_URL + image) : SITE_URL + siteImages.ogDefault
  const meta = (key: 'name' | 'property', k: string, content: string): HeadTag => ({ tag: 'meta', sel: `meta[${key}="${k}"]`, attrs: { [key]: k, content } })
  const out: HeadTag[] = [{ tag: 'title', text: title }]
  if (description) out.push(meta('name', 'description', description))
  out.push(
    { tag: 'link', sel: 'link[rel="canonical"]', attrs: { rel: 'canonical', href: url } },
    // hreflang: the site targets India only, so en-IN points at the canonical URL
    { tag: 'link', sel: 'link[rel="alternate"][hreflang]', attrs: { rel: 'alternate', hreflang: LOCALE.hreflang, href: url } },
    meta('property', 'og:title', title),
    meta('property', 'og:description', description ?? ''),
    meta('property', 'og:url', url),
    meta('property', 'og:image', img),
    meta('name', 'twitter:image', img),
    meta('property', 'og:image:alt', title),
  )
  if (img.endsWith(siteImages.ogDefault)) out.push(meta('property', 'og:image:width', '1200'), meta('property', 'og:image:height', '630'))
  out.push(
    meta('property', 'og:type', 'website'),
    meta('property', 'og:locale', LOCALE.ogLocale),
    meta('property', 'og:site_name', 'Q2M Solutions'),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow'),
    { tag: 'script', id: 'ld-json', attrs: { type: 'application/ld+json' }, text: jsonLd ? JSON.stringify(jsonLd) : '' },
  )
  return out
}

/** Browser: apply the tags to document.head (update in place, create when missing). */
export function applyHeadTags(tags: HeadTag[]) {
  for (const t of tags) {
    if (t.tag === 'title') { document.title = t.text; continue }
    if (t.tag === 'script') {
      let el = document.getElementById(t.id)
      if (!el) { el = document.createElement('script'); el.id = t.id; document.head.appendChild(el) }
      for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v)
      el.textContent = t.text
      continue
    }
    let el = document.head.querySelector(t.sel)
    if (!el) { el = document.createElement(t.tag); document.head.appendChild(el) }
    for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v)
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** Build: the tags as HTML for the <head> of a pre-rendered page. JSON-LD has "<" escaped so it cannot close the script. */
export function headTagsHtml(tags: HeadTag[]): string {
  return tags.map((t) => {
    if (t.tag === 'title') return `<title>${esc(t.text)}</title>`
    const attrs = Object.entries(t.attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')
    if (t.tag === 'script') return t.text ? `<script id="${t.id}" ${attrs}>${t.text.replace(/</g, '\\u003c')}</script>` : ''
    return `<${t.tag} ${attrs}>`
  }).filter(Boolean).join('\n    ')
}
