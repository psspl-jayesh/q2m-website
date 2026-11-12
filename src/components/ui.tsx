import { useContext, useEffect, useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import { IMAGES } from '@/config/locale'
import { HeadContext, type SeoInput } from '@/lib/ssr'
import { applyHeadTags, seoTags } from '@/lib/seoTags'

/* ───────── SEO: title, description, canonical, Open Graph, JSON-LD ───────── */
export function Seo(props: SeoInput) {
  // Server (pre-render): hand the head data to the build. Browser: update document.head after render.
  const head = useContext(HeadContext)
  if (head) head.seo = props
  const { title, description, path, image, noindex, jsonLd } = props
  useEffect(() => { applyHeadTags(seoTags({ title, description, path, image, noindex, jsonLd })) }, [title, description, path, image, noindex, jsonLd])
  return null
}

/* ───────── Buttons (one height, one radius; 3 variants) ───────── */
type BtnProps = { to?: string; href?: string; children: ReactNode; variant?: 'primary' | 'dark' | 'ghost' | 'light'; className?: string; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; arrow?: boolean }
const BTN: Record<string, string> = {
  primary: 'bg-action text-on-action hover:bg-block hover:text-ink-inverse',
  dark: 'bg-block text-ink-inverse hover:bg-action hover:text-on-action',
  light: 'bg-white text-black hover:bg-surface-raised',
  ghost: 'border border-current/30 hover:border-current hover:bg-current/5',
}
export function Button({ to, href, children, variant = 'primary', className = '', arrow = true, ...rest }: BtnProps) {
  const cls = `group inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 py-2 text-center text-sm sm:px-6 sm:text-[0.9375rem] font-medium transition-[background-color,color,transform] duration-200 active:translate-y-px disabled:opacity-60 ${BTN[variant]} ${className}`
  const icon = arrow && <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
  if (to) return <Link to={to} className={cls}>{children}{icon}</Link>
  if (href) {
    const ext = /^https?:/.test(href)
    return <a href={href} className={cls} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}{ext && <ArrowUpRight aria-hidden className="size-4" />}</a>
  }
  return <button className={cls} {...rest}>{children}{icon}</button>
}

export function TextLink({ to, children, className = '', label }: { to: string; children: ReactNode; className?: string; label?: string }) {
  return (
    <Link to={to} aria-label={label} className={`group inline-flex items-center gap-1.5 font-medium text-action hover:underline underline-offset-4 ${className}`}>
      {children}<ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  )
}

export { Reveal, StaggerGroup, StaggerItem, ImageFrame } from './motion'
import { Reveal, ImageFrame, DUR, EASE } from './motion'
import imageMeta from '@/data/images.json'

/* ───────── Accordion (single-open, aria-compliant) ───────── */
export function Accordion({ items, dark = false }: { items: { q: string; a: string[] }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()
  const reduce = useReducedMotion()
  return (
    <div className={`border-t ${dark ? 'border-block-line' : 'hairline'}`}>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i} className={`border-b ${dark ? 'border-block-line' : 'hairline'}`}>
            <h3 className="font-sans text-base">
              <button id={`${base}-h${i}`} aria-expanded={isOpen} aria-controls={`${base}-p${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start justify-between gap-6 py-6 text-left font-display text-xl leading-snug md:text-2xl">
                <span>{it.q}</span>
                <Plus aria-hidden className={`mt-1.5 size-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div key="p" id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-h${i}`} style={{ overflow: 'hidden' }}
                  initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ duration: DUR.base, ease: EASE }}>
                  <div className="pb-7">{it.a.map((p, j) => <p key={j} className={`mb-3 max-w-[68ch] ${dark ? 'text-block-muted' : 'text-ink-muted'}`}>{p}</p>)}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((t, i) => (
          <li key={i} className="flex items-center gap-2">
            {t.to ? <Link className="hover:text-ink hover:underline underline-offset-4" to={t.to}>{t.label}</Link> : <span aria-current="page" className="text-ink">{t.label}</span>}
            {i < trail.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function SectionHead({ eyebrow, title, lede, dark }: { eyebrow?: string; title: ReactNode; lede?: ReactNode; dark?: boolean }) {
  return (
    <div className={`max-w-3xl ${dark ? 'on-dark' : ''}`}>
      <Reveal>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display-md">{title}</h2>
      </Reveal>
      {lede && <Reveal delay={0.1}><p className="lede mt-5 max-w-2xl">{lede}</p></Reveal>}
    </div>
  )
}

type Meta = { w: number; h: number; widths: number[]; name: string; dir: string }
const META = imageMeta as unknown as Record<string, Meta>
export const imgMeta = (src: string) => META[src]

/** Responsive <picture>: AVIF + WebP at native-or-smaller widths, intrinsic size set (no layout shift). */
export function Img({ src, alt = '', className = '', eager = false, ratio, sizes = '(min-width:1024px) 50vw, 100vw', position = 'center', width, height }: { src: string; alt?: string; className?: string; eager?: boolean; ratio?: string; sizes?: string; position?: string; width?: number; height?: number }) {
  const m = META[src]
  const style = { ...(ratio ? { aspectRatio: ratio } : {}), objectPosition: position }
  const img = (
    <img src={src} alt={alt} width={m?.w ?? width} height={m?.h ?? height} sizes={m ? sizes : undefined} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} className={className} style={style} />
  )
  if (!m) return img
  const set = (fmt: string) => m.widths.map((w) => `${m.dir}/${m.name}-${w}.${fmt} ${w}w`).join(', ')
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      {img}
    </picture>
  )
}

/** An image as recorded in the manifest (or any {file,w,h,alt}). */
export type SiteImg = { file: string; w?: number | null; h?: number | null; alt?: string }

/**
 * THE image component for the site. Every page image goes through it, so sizing, lazy loading, AVIF/WebP and fallbacks
 * behave the same everywhere. Only the hero / above-the-fold image passes `priority` (eager + fetchpriority high).
 * Alt text comes from the manifest; decorative images carry alt="".
 */
export function SiteImage({ image, className = '', priority = false, ratio, sizes, position }: { image: SiteImg; className?: string; priority?: boolean; ratio?: string; sizes?: string; position?: string }) {
  const natural = image.w && image.h ? `${image.w}/${image.h}` : undefined
  return <Img src={image.file} alt={image.alt ?? ''} eager={priority} ratio={ratio ?? natural} sizes={sizes} position={position} width={image.w ?? undefined} height={image.h ?? undefined} className={className || 'h-full w-full object-cover'} />
}

/** SiteImage inside the reveal frame (clip reveal, optional parallax). The frame keeps the live aspect ratio. */
export function SiteFrame({ image, ratio, parallax, sizes, position, priority, className = '' }: { image: SiteImg; ratio?: string; parallax?: boolean; sizes?: string; position?: string; priority?: boolean; className?: string }) {
  const r = ratio ?? (image.w && image.h ? `${image.w}/${image.h}` : '4/3')
  return (
    <ImageFrame ratio={r} parallax={parallax && (META[image.file]?.w ?? 0) >= 1600} className={className} maxWidth={image.w ?? undefined}>
      <SiteImage image={image} priority={priority} sizes={sizes} position={position} ratio="auto" className="h-full w-full object-cover" />
    </ImageFrame>
  )
}

/**
 * THE hero image for every page. Large sources fill the hero frame (with parallax); sources narrower than IMAGES.lowResHeroBelow
 * are never enlarged: they sit in a contained card at no more than their intrinsic size. One component, identical on all pages.
 */
export function HeroImage({ image, sizes = '(min-width:1024px) 520px, 100vw' }: { image: SiteImg; sizes?: string }) {
  const w = image.w ?? 0
  if (w >= IMAGES.lowResHeroBelow || !w) return <SiteFrame image={image} priority parallax sizes={sizes} />
  return (
    <div className="rounded-lg border border-line bg-surface-raised p-4 sm:p-6">
      <SiteImage image={image} priority sizes={`${w}px`} ratio="auto" className="mx-auto h-auto max-w-full rounded-md" />
    </div>
  )
}
