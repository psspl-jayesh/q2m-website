import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Manifest } from './images'
import { SHOW_TESTIMONIALS } from '@/config/flags'
import contentUrl from '@/data/content.json?url'
import manifestUrl from '@/data/image-manifest.json?url'

/** One piece of page content, copied from the live site (src/content/pages/*.json). */
export type Block = {
  t: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li' | 'img' | 'blockquote' | 'btn' | 'stat' | 'quote'
  text?: string; src?: string; alt?: string
  eyebrow?: string                                   // small label above a heading
  href?: string                                      // btn: link target
  value?: number | string | null; prefix?: string; suffix?: string   // stat
  name?: string; role?: string                       // quote
}
export type Faq = { q: string; a: string[] }
export type Entry = {
  id: number; type: 'page' | 'post' | 'case-study'; path: string; slug: string; title: string; date: string; modified: string
  metaTitle: string; description: string; ogImage: string; excerpt: string; featuredMedia: number; categories: number[]
  blocks: Block[]; faqs: Faq[]
  furniture?: { breadcrumb: string[]; meta: string[]; nav: string[] }
}
export type Content = {
  syncedAt: string; pages: Entry[]; posts: Entry[]; caseStudies: Entry[]
  categories: { id: number; slug: string; name: string; count: number }[]
  media: Record<number, { src: string; alt: string; w?: number; h?: number }>
  retired: { path: string; title: string; type: string }[]
  manifest: Manifest
}

let cache: Promise<Content> | null = null
/**
 * Site content and image manifest, loaded as JSON files (fetch + JSON.parse is much faster to process than the same data as
 * a JavaScript module). Vite emits them as hashed assets; the pre-render build imports the JSON directly instead.
 */
export const loadContent = () => (cache ??= Promise.all([fetch(contentUrl).then((r) => r.json()), fetch(manifestUrl).then((r) => r.json())])
  .then(([c, m]) => ({ ...(c as Omit<Content, 'manifest'>), manifest: m as Manifest })))

const Ctx = createContext<Content | null>(null)
/** `initial`: content already loaded (server pre-render, or the browser hydrating a pre-rendered page), so no splash screen. */
export function ContentProvider({ children, fallback, initial = null }: { children: ReactNode; fallback: ReactNode; initial?: Content | null }) {
  const [c, setC] = useState<Content | null>(initial)
  useEffect(() => { if (!c) loadContent().then(setC) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return c ? <Ctx.Provider value={c}>{children}</Ctx.Provider> : <>{fallback}</>
}
export const useContent = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('Content not ready')
  return c
}

export const normPath = (p: string) => (p.endsWith('/') ? p : p + '/')
export const allEntries = (c: Content) => [...c.pages, ...c.posts, ...c.caseStudies]
export const findEntry = (c: Content, path: string) => allEntries(c).find((e) => e.path === normPath(path))
export const getPage = (c: Content, slug: string) => c.pages.find((p) => p.slug === slug)
export const mediaOf = (c: Content, e: Entry) => c.media[e.featuredMedia]

/** Split a flat block list into sections that start at each h1/h2. Content before the first heading is the lead. */
export type Section = { title: string; eyebrow?: string; level?: 'h1' | 'h2'; blocks: Block[] }
export function sectionize(blocks: Block[]): Section[] {
  const out: Section[] = [{ title: '', blocks: [] }]
  for (const b of blocks) {
    if (b.t === 'h1' || b.t === 'h2') out.push({ title: b.text ?? '', eyebrow: b.eyebrow, level: b.t, blocks: [] })
    else out[out.length - 1].blocks.push(b)
  }
  // Sections that hold client quotes are hidden as a whole while testimonials are not confirmed (src/config/flags.ts)
  return out.filter((s) => (s.title || s.blocks.length) && (SHOW_TESTIMONIALS || !s.blocks.some((b) => b.t === 'quote')))
}

/** Group a section's blocks into groups that start at each h3/h4/h5 */
export type Group = { title: string; level: string; label?: string; paras: string[]; items: string[]; labels: string[]; imgs: Block[]; btns: Block[]; stats: Block[]; quotes: Block[] }
export function groupify(blocks: Block[]): { lead: Group; groups: Group[] } {
  const mk = (title = '', level = '', label?: string): Group => ({ title, level, label, paras: [], items: [], labels: [], imgs: [], btns: [], stats: [], quotes: [] })
  const lead = mk()
  const groups: Group[] = []
  let cur = lead
  for (const b of blocks) {
    if (b.t === 'h3' || b.t === 'h4' || b.t === 'h5') { cur = mk(b.text, b.t, (b as Block & { label?: string }).label); groups.push(cur) }
    else if (b.t === 'p') cur.paras.push(b.text!)
    else if (b.t === 'li') cur.items.push(b.text!)
    else if (b.t === 'h6') cur.labels.push(b.text!)
    else if (b.t === 'btn') cur.btns.push(b)
    else if (b.t === 'stat') cur.stats.push(b)
    else if (b.t === 'quote') cur.quotes.push(b)
    else if (b.t === 'img') cur.imgs.push(b)
  }
  return { lead, groups }
}
export { formatDate as fmtDate } from '@/lib/format'
export const readingTime = (e: Entry) =>
  Math.max(1, Math.round(e.blocks.filter((b) => b.text).map((b) => b.text!.split(/\s+/).length).reduce((a, b) => a + b, 0) / 220))

/**
 * A very short paragraph straight before a heading ("Step 01") is that heading's label on the live page.
 * Move it onto the heading so it renders with the right card and nothing is dropped.
 */
export function attachLabels(blocks: Block[]): Block[] {
  const out: Block[] = []
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]; const n = blocks[i + 1]
    if (b.t === 'p' && b.text && n && /^h[3-5]$/.test(n.t) && (/^step\s*\d+$/i.test(b.text) || b.text.length <= 4)) { out.push({ ...n, label: b.text } as Block); i++; continue }
    out.push(b)
  }
  return out
}
