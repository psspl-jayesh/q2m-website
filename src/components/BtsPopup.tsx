import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, Cpu, FileText, Glasses, MapPin, Video, X } from 'lucide-react'
import { BTS, btsDateRangeShort, useBtsPhase } from '@/config/bts'
import { imgMeta } from '@/components/ui'
import siteImages from '@/data/site-images.json'

/**
 * Bengaluru Tech Summit 2026 announcement (content: BTS.popup in src/config/bts.ts).
 * - Real HTML in the site's look. 1024px+: the owner's photo in full (16:9, uncropped) with a frosted text panel over the
 *   workshop on its left (Q2M logo | official BTS 2026 logo, pill, heading, text, four solution areas), and a blue bar below with
 *   dates, venue and the button. Below 1024px: the photo in full on top, content below, the blue bar, scrollable if taller than
 *   the screen. The photo loads only when the popup opens.
 * - Opens BTS.popup.delayMs after EVERY page load or refresh (owner's request): nothing is stored. Once closed it stays closed
 *   while the visitor moves between pages, until the next refresh or visit. Never on the BTS landing page, never in the
 *   pre-rendered HTML, switched off once the event has closed (BTS.end).
 * - Closes with the X, Esc or a click outside (phones also "Maybe later").
 * - A modal dialog: the page behind is made inert, focus moves into it (its close button), stays inside and returns afterwards.
 * - Fixed position over the page, so nothing shifts. The photo is fetched only when the popup opens. Reduced motion: no animation.
 */
/** Closed during this page load. A module variable, so a refresh (new page load) resets it and the popup opens again. */
let closedThisLoad = false
const markClosed = () => { closedThisLoad = true }
const ICON = { glasses: Glasses, chip: Cpu, video: Video, document: FileText } as const

/**
 * The popup photo (AVIF/WebP from the image manifest). It paints transparent and fades in once loaded: the popup opens seconds
 * after the page, and an image that first paints invisible is not counted as the page's largest paint (LCP), so the popup does
 * not lower Lighthouse on pages without a large image of their own.
 */
function Photo({ src, alt, sizes, className, position }: { src: string; alt: string; sizes: string; className: string; position?: string }) {
  const [loaded, setLoaded] = useState(false)
  const m = imgMeta(src)
  const set = (fmt: string) => m?.widths.map((w) => `${m.dir}/${m.name}-${w}.${fmt} ${w}w`).join(', ')
  return (
    <picture>
      {m && <source type="image/avif" srcSet={set('avif')} sizes={sizes} />}
      {m && <source type="image/webp" srcSet={set('webp')} sizes={sizes} />}
      <img src={src} alt={alt} width={m?.w} height={m?.h} loading="lazy" decoding="async" onLoad={() => setLoaded(true)}
        style={{ objectPosition: position, opacity: loaded ? 1 : 0, transition: 'opacity .35s ease' }} className={className} />
    </picture>
  )
}

export default function BtsPopup() {
  const { pathname } = useLocation()
  const over = useBtsPhase() === 'after'
  const onLanding = pathname.replace(/\/?$/, '/') === BTS.path
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (over || onLanding || closedThisLoad) return
    const t = window.setTimeout(() => setOpen(true), BTS.popup.delayMs)
    return () => window.clearTimeout(t)
  }, [over, onLanding])

  const visible = open && !over && !onLanding
  const close = useCallback(() => { markClosed(); setOpen(false) }, [])

  useEffect(() => {
    if (!visible) return
    const back = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    box.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab' || !box.current) return
      // only controls that are shown ("Maybe later" is hidden on larger screens)
      const f = [...box.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.getClientRects().length > 0)
      if (!f.length) return
      const [first, last] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    // a press outside the panel (on the dimmed backdrop) closes it
    const onDown = (e: PointerEvent) => { if (box.current && e.target instanceof Node && !box.current.contains(e.target)) close() }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); root?.removeAttribute('inert'); back?.focus({ preventScroll: true }) }
  }, [visible, close])

  if (!visible) return null
  const p = BTS.popup
  const date = btsDateRangeShort()
  const desc = BTS.liveDemos ? p.textLiveDemos : p.text
  const closeBtn = (
    <button type="button" onClick={close} aria-label="Close" data-autofocus
      className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-full bg-white text-[#0b0c0c] shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 lg:right-4 lg:top-4">
      <X aria-hidden className="size-5" />
    </button>
  )
  // Q2M logo | official event logo. The event logo is used unmodified; it is made for dark backgrounds, so it sits on a navy tile.
  const logos = (
    <div className="flex items-center gap-2">
      {/* the Q2M logo is about as tall as the event logo's tile */}
      <img className="logo-color h-14 w-auto shrink-0 lg:h-11" src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={73} height={44} />
      <img className="logo-reverse h-14 w-auto shrink-0 lg:h-11" src={siteImages.brand.logoReverse.file} alt={siteImages.brand.logoReverse.alt} width={73} height={44} />
      <span aria-hidden className="h-10 w-px shrink-0 bg-[var(--bp-ink)] opacity-30" />
      <span className="inline-block shrink-0 rounded-md bg-[#0b1430] px-1 py-0.5">
        <img src={p.logo.file} alt={p.logo.alt} width={p.logo.w} height={p.logo.h} loading="lazy" decoding="async" className="block h-12 w-auto lg:h-10" />
      </span>
    </div>
  )
  const pill = <p className="inline-block rounded-lg bg-[var(--bp-pill-bg)] px-3.5 py-1.5 text-[0.9375rem] font-bold text-[var(--bp-pill-ink)]">{p.pill}</p>
  const items = (cls: string) => (
    <ul className={cls}>
      {p.items.map((it) => { const Icon = ICON[it.icon as keyof typeof ICON]; return (
        <li key={it.text.join(' ')} className="flex items-center gap-3 text-[0.875rem] font-bold leading-[1.25] text-[var(--bp-ink)]">
          <Icon aria-hidden className="size-7 shrink-0 text-[var(--bp-icon)]" strokeWidth={1.6} />
          <span>{it.text.map((line, k) => <span key={k} className="block">{line}</span>)}</span>
        </li>
      ) })}
    </ul>
  )
  const facts = (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:flex-nowrap">
      <div className="flex items-center gap-3"><dt className="contents"><CalendarDays aria-hidden className="size-7 shrink-0" strokeWidth={1.6} /><span className="sr-only">Dates</span></dt><dd className="font-display text-base font-semibold leading-tight lg:text-lg">{date}</dd></div>
      <span aria-hidden className="hidden h-9 w-px bg-white/45 lg:block" />
      <div className="flex items-center gap-3"><dt className="contents"><MapPin aria-hidden className="size-7 shrink-0" strokeWidth={1.6} /><span className="sr-only">Venue</span></dt><dd className="font-display text-base font-semibold leading-tight lg:text-lg">{BTS.venue.short}</dd></div>
    </dl>
  )
  const cta = (cls: string) => (
    <Link to={BTS.path} onClick={close}
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-7 font-display text-base font-semibold text-[#1b2a6b] shadow-md transition-transform duration-200 hover:-translate-y-0.5 ${cls}`}>
      {p.cta}<ArrowRight aria-hidden className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  )
  const text = (title: string) => (
    <>
      {logos}
      <div className="mt-4">{pill}</div>
      <h2 className={title}>{p.title}</h2>
      <p className="mt-2.5 text-[0.9375rem] font-medium leading-snug text-[var(--bp-muted)]">{desc}</p>
    </>
  )

  return createPortal(
    <div className="btsp fixed inset-0 z-[60] flex items-end justify-center bg-black/60 lg:items-center lg:p-6">
      <div ref={box} role="dialog" aria-modal="true" aria-label={`${p.title}: ${desc}`}
        className="btsp-panel relative max-h-[calc(100dvh-3.5rem)] w-full overflow-y-auto overflow-x-hidden rounded-t-xl [background:var(--bp-col)] text-ink shadow-2xl lg:max-h-[calc(100dvh-3rem)] lg:max-w-[1000px] lg:rounded-xl">
        {closeBtn}

        {/* 1024px+: the photo in full at its own 16:9 ratio (nothing cropped). The text sits on a frosted panel over the workshop on
            the left (26% wide): it covers only the background, his back and legs, never his face, glasses, hands or the car.
            The blue bar sits below the photo. */}
        <div className="hidden lg:block">
          <div className="relative aspect-[1672/941]">
            <Photo src={p.photo.file} alt={p.photo.alt} sizes="1000px" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute left-0 top-0 w-[26%] rounded-br-2xl bg-[var(--bp-glass)] px-4 pb-6 pt-5 shadow-[8px_0_24px_-12px_rgb(0_0_0/0.25)] backdrop-blur-[8px]">
              {text('mt-3 font-display text-[1.75rem] font-bold leading-[1.08] tracking-[-0.015em] text-[var(--bp-ink)]')}
              {items('mt-5 grid gap-y-3.5')}
            </div>
          </div>
          <div className="btsp-bar relative text-white">
            <div className="flex items-center gap-6 px-8 py-5">
              {facts}
              {cta('ml-auto')}
            </div>
          </div>
        </div>

        {/* under 1024px: the photo in full on top, the content below, then the blue bar with a full-width button. The sheet stops
            3.5rem below the top, so there is always some dimmed page to tap to close it; it scrolls if taller. */}
        <div className="lg:hidden">
          <Photo src={p.photo.file} alt={p.photo.alt} sizes="100vw" className="block aspect-[1672/941] h-auto w-full" />
          <div className="px-5 pb-8 pt-5">
            {text('mt-2.5 font-display text-[1.75rem] font-bold leading-[1.1] tracking-[-0.01em] text-[var(--bp-ink)]')}
            {items('mt-5 grid grid-cols-2 gap-x-3 gap-y-4')}
          </div>
          <div className="btsp-bar relative px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white">
            <div className="flex flex-col gap-4">
              {facts}
              {cta('w-full')}
              <button type="button" onClick={close} className="-mt-2 min-h-11 text-sm font-medium text-white/90 underline underline-offset-4 hover:text-white">{p.later}</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
