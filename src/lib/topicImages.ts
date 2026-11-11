import config from '@/content/shared/topic-images.json'
import { imgMeta, type SiteImg } from '@/components/ui'
import type { ManifestImage } from './images'

type Entry = { file: string; alt: string }
const images = config.images as Record<string, Entry>
const pages = config.pages as Record<string, string[]>
const norm = (p: string) => (p.endsWith('/') ? p : p + '/')

/** Topic images for a page, in order, minus any the page already shows. Each is an image the live site uses elsewhere. */
export function topicImagesFor(path: string, shownOnPage: ManifestImage[]): SiteImg[] {
  const have = new Set(shownOnPage.map((i) => i.file))
  return (pages[norm(path)] ?? [])
    .map((k) => images[k])
    .filter((e): e is Entry => !!e && !have.has(e.file))
    .map((e) => ({ file: e.file, alt: e.alt, w: imgMeta(e.file)?.w ?? null, h: imgMeta(e.file)?.h ?? null }))
}
