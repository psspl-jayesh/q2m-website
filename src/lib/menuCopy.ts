import { findEntry, type Content } from './content'
import type { NavGroup } from './site'

/** Whole sentences only: as many as fit in `max` characters, but always at least the first one. */
export function trimSentences(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const parts = clean.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ?? [clean]
  let out = ''
  for (const s of parts) {
    const next = out ? `${out} ${s}` : s
    if (out && next.length > max) break
    out = next
  }
  return out
}

/**
 * Copy for a mega-menu panel, taken only from the live pages the menu links to (nothing written by us):
 * - intro: live meta description of the group's first page that has one, trimmed by whole sentences
 * - blurb: first paragraph of the featured (first) page, trimmed by whole sentences
 */
export function megaCopy(c: Content, g: NavGroup): { intro: string; blurb: string } {
  const e = findEntry(c, g.items[0].href)
  // intro: the first page in the group that has a live meta description (the featured page may have none, e.g. Case Studies)
  const withDesc = g.items.map((i) => findEntry(c, i.href)).find((x) => x?.description)
  const intro = trimSentences(withDesc?.description || '', 170)
  if (!e) return { intro, blurb: '' }
  const firstP = e.blocks.find((b) => b.t === 'p' && (b.text || '').length > 60)?.text ?? ''
  const blurb = trimSentences(firstP, 130)
  return { intro, blurb: blurb === intro ? '' : blurb }
}
