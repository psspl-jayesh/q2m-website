import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, Cpu, FileText, Glasses, MapPin, Video, X } from 'lucide-react'
import { BTS, btsDateRangeShort, useBtsPhase } from '@/config/bts'
import { Img } from '@/components/ui'
import siteImages from '@/data/site-images.json'

/**
 * Bengaluru Tech Summit 2026 announcement (content: BTS.popup in src/config/bts.ts).
 * - Real HTML in the site's look, laid out like the owner's banner. 1024px+: the photo fills the card at its 16:9 ratio (person,
 *   car and Damage Analysis panel uncropped), the text sits over its left side on a solid-to-clear gradient, and a blue bar with a
 *   curved top holds dates, venue and the button. Below 1024px: the photo in full on top, content below, the blue bar, scrollable
 *   if taller than the screen. Each layout's image is lazy, so a screen downloads only the one it shows.
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
/** The site's button (src/components/ui.tsx Button), light variant on the blue bar. */
const BUTTON = 'group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-2 text-[0.9375rem] font-medium text-[var(--q2m-action)] transition-[background-color,transform] duration-200 hover:bg-surface-raised active:translate-y-px'

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
  const logos = (
    <div className="flex items-center gap-3">
      <img className="logo-color h-9 w-auto lg:h-10" src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={66} height={40} />
      <img className="logo-reverse h-9 w-auto lg:h-10" src={siteImages.brand.logoReverse.file} alt={siteImages.brand.logoReverse.alt} width={66} height={40} />
      <span aria-hidden className="h-9 w-px bg-line" />
      <div className="leading-tight">
        <p className="font-display text-sm font-bold">{p.lockup}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{BTS.venue.short} · {date}</p>
      </div>
    </div>
  )
  const pill = (
    <p className="inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-action">
      <CalendarDays aria-hidden className="size-3.5 shrink-0" />{p.pill}
    </p>
  )
  const items = (cls: string) => (
    <ul className={cls}>
      {p.items.map((it) => { const Icon = ICON[it.icon as keyof typeof ICON]; return (
        <li key={it.text} className="flex items-center gap-2.5 text-[0.8125rem] font-medium leading-snug lg:text-[0.875rem]">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-md bg-tint text-action lg:size-8"><Icon className="size-[1.125rem] lg:size-4" /></span>{it.text}
        </li>
      ) })}
    </ul>
  )
  const facts = (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:flex-nowrap lg:gap-x-6">
      <div className="flex items-center gap-3"><dt className="contents"><CalendarDays aria-hidden className="size-6 shrink-0 lg:size-7" strokeWidth={1.75} /><span className="sr-only">Dates</span></dt><dd className="font-display text-base font-semibold lg:text-lg">{date}</dd></div>
      <span aria-hidden className="hidden h-8 w-px bg-white/40 lg:block" />
      <div className="flex items-center gap-3"><dt className="contents"><MapPin aria-hidden className="size-6 shrink-0 lg:size-7" strokeWidth={1.75} /><span className="sr-only">Venue</span></dt><dd className="font-display text-base font-semibold lg:text-lg">{BTS.venue.short}</dd></div>
    </dl>
  )
  const cta = (cls: string) => (
    <Link to={BTS.path} onClick={close} className={`${BUTTON} ${cls}`}>
      {p.cta}<ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  )

  return createPortal(
    <div className="btsp fixed inset-0 z-[60] flex items-end justify-center bg-black/60 lg:items-center lg:p-6">
      <div ref={box} role="dialog" aria-modal="true" aria-label={`${p.title}: ${desc}`}
        className="btsp-panel relative max-h-[calc(100dvh-3.5rem)] w-full overflow-y-auto overflow-x-hidden rounded-t-xl bg-surface text-ink shadow-2xl lg:max-h-none lg:max-w-[1000px] lg:overflow-hidden lg:rounded-xl">
        {closeBtn}

        {/* 1024px+: the photo fills the card at its own 16:9 ratio (nothing cropped); text sits over its left side */}
        <div className="relative hidden aspect-[1672/941] lg:block">
          <Img src={p.background.file} alt={p.background.alt} sizes="1000px" className="absolute inset-0 h-full w-full object-cover" />
          {/* solid behind the text, fading to clear by 55% (the light/dark surface colour, so contrast holds in both themes) */}
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,var(--surface)_0%,var(--surface)_41%,transparent_55%)]" />
          <div className="absolute left-0 top-0 w-[43%] px-9 pt-7">
            {logos}
            <div className="mt-4">{pill}</div>
            <h2 className="mt-2.5 font-display text-[1.875rem] font-bold leading-[1.1] tracking-[-0.01em]">{p.title}</h2>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">{desc}</p>
            {items('mt-3 grid grid-cols-1 gap-y-1.5')}
          </div>
          {/* blue bar over the bottom of the photo, with a gentle curved top edge like the banner */}
          <div className="absolute inset-x-0 bottom-0 h-[35%] text-white">
            <svg aria-hidden viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M0 56 C 380 52, 700 36, 1000 2 L1000 100 L0 100 Z" fill="var(--q2m-action)" />
              <path d="M0 56 C 380 52, 700 36, 1000 2" fill="none" stroke="#7cc4ff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-6 px-9 pb-6">
              {facts}
              {cta('ml-auto')}
            </div>
          </div>
        </div>

        {/* under 1024px: photo in full on top, the content below, then the blue bar with a full-width button. The sheet stops
            3.5rem below the top, so there is always some dimmed page to tap to close it; it scrolls if taller. */}
        <div className="lg:hidden">
          <Img src={p.photo.file} alt={p.photo.alt} sizes="100vw" className="block h-auto w-full" />
          <div className="px-5 pb-6 pt-5">
            {logos}
            <div className="mt-5">{pill}</div>
            <h2 className="display-md mt-3">{p.title}</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{desc}</p>
            {items('mt-5 grid grid-cols-2 gap-x-3 gap-y-3')}
          </div>
          <div className="bg-[var(--q2m-action)] px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white">
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
