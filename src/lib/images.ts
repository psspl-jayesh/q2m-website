import type { Content } from './content'
import siteImages from '@/data/site-images.json'
import { IMAGES } from '@/config/locale'

/**
 * Image manifest helpers. The manifest (src/data/image-manifest.json, written by scripts/sync-images.mjs) is the single
 * source of truth for which image appears on which page, in which section, in which order, with which alt text.
 * Components never hold image URLs; they ask for them here.
 */
export type ManifestImage = {
  order: number; section: string; sectionKey: string; kind: string
  role: 'hero' | 'logo' | 'content' | 'icon' | 'background'
  file: string; w: number | null; h: number | null
  alt: string; altSource: 'live' | 'needs-review' | 'decorative'
  shared: boolean; original: string
}
export type Manifest = {
  generatedAt: string
  pages: Record<string, ManifestImage[]>
  shared: { chrome: { file: string; w: number | null; h: number | null; alt: string; role: string }[]; icons: { file: string }[] }
  brand: Record<string, { file: string; w: number; h: number; alt: string }>
}

/** Same normalisation the sync script uses for section keys. */
export const keyOf = (t: string) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const norm = (p: string) => (p.endsWith('/') ? p : p + '/')

export const pageImages = (c: Content, path: string): ManifestImage[] => c.manifest.pages[norm(path)] ?? []

/** The first hero image of a page (the banner shown under the page title on the live site). */
/** The page hero: when the live page lists several hero images, the widest one (never a low-resolution duplicate). */
export const heroImage = (c: Content, path: string) =>
  pageImages(c, path).filter((i) => i.role === 'hero').reduce<ManifestImage | undefined>((best, i) => (!best || (i.w ?? 0) > (best.w ?? 0) ? i : best), undefined)

/** Page images that belong to rendered content sections. Decorative theme backgrounds and icons are never returned. */
const shown = (i: ManifestImage) => i.role === 'content' || i.role === 'logo'

/**
 * Group a page's images by the section they appear in on the live site, preserving order.
 * An image whose live section has no counterpart on our page (e.g. a section we do not render) stays with the
 * closest preceding section that does exist, so no image is lost and the order is unchanged.
 */
export function imagesBySection(c: Content, path: string, renderedTitles: string[]): Map<string, ManifestImage[]> {
  const keys = new Set(renderedTitles.map(keyOf))
  const out = new Map<string, ManifestImage[]>()
  let last: string | null = null
  for (const i of pageImages(c, path)) {
    if (i.sectionKey === 'hero' || !shown(i)) continue
    const k: string | null = keys.has(i.sectionKey) ? i.sectionKey : last
    if (!k) continue
    last = k
    ;(out.get(k) ?? out.set(k, []).get(k)!).push(i)
  }
  return out
}

/** Thumbnail for a card: the entry's own hero image, otherwise the matching image on a listing page. */
export function thumbFor(c: Content, e: { path: string; featuredMedia: number }): { file: string; w: number | null; h: number | null; alt: string } | undefined {
  const own = heroImage(c, e.path)
  if (own) return own
  const m = c.media[e.featuredMedia]
  if (!m) return undefined
  const listing = ['/case-studies/', '/blogs/'].flatMap((p) => pageImages(c, p)).find((i) => i.file === m.src)
  return listing ?? { file: m.src, w: m.w ?? null, h: m.h ?? null, alt: m.alt || '' }
}

/** Alt text for a file as recorded in the manifest (used for images embedded in article text). */
export function altForFile(c: Content, file: string): string {
  for (const list of Object.values(c.manifest.pages)) { const f = list.find((i) => i.file === file); if (f) return f.alt }
  return ''
}

/**
 * og:image for a page: the page's own hero image when it is at least 1200px wide, otherwise the one default brand image.
 * Every page calls this, so the rule is identical everywhere.
 */
export function ogImageFor(c: Content, path: string): string {
  const h = heroImage(c, path)
  return h && (h.w ?? 0) >= IMAGES.ogMinWidth ? h.file : siteImages.ogDefault
}
