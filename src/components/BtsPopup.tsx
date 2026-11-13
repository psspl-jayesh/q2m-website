import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, Cpu, FileText, Glasses, MapPin, Video, X } from 'lucide-react'
import { BTS, btsDateRangeShort, useBtsPhase } from '@/config/bts'
import { Img } from '@/components/ui'
import siteImages from '@/data/site-images.json'

/**
 * Bengaluru Tech Summit 2026 announcement (content: BTS.popup in src/config/bts.ts).
 * - Real HTML in the site's look, laid out like the owner's banner: logo and event lockup, heading, four solution areas beside
 *   the photo (which fades into the text side), and a blue bar with dates, venue and the button. Phones: the same content
 *   stacked as a bottom sheet (photo on top, items 2 × 2), scrollable if taller than the screen.
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
  return createPortal(
    <div className="btsp fixed inset-0 z-[60] flex items-end justify-center bg-black/60 md:items-center md:p-6">
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="btsp-title" aria-describedby="btsp-desc"
        className="btsp-panel relative max-h-[100dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-xl border border-line bg-surface text-ink shadow-2xl md:max-h-[calc(100dvh-3rem)] md:max-w-[1000px] md:rounded-xl">
        <button type="button" onClick={close} aria-label="Close" data-autofocus
          className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full border border-line bg-surface text-ink shadow-md transition-colors hover:bg-tint md:right-4 md:top-4">
          <X aria-hidden className="size-5" />
        </button>

        <div className="md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* photo: on top on phones; the right half on larger screens, fading into the text side like the banner */}
          <div className="relative h-44 sm:h-56 md:order-2 md:h-auto">
            <Img src={p.photo.file} alt={p.photo.alt} eager sizes="(min-width:768px) 540px, 100vw" position="46% 30%" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent md:inset-y-0 md:left-0 md:right-auto md:h-auto md:w-16 md:bg-gradient-to-r" />
          </div>

          <div className="relative px-5 pb-6 pt-1 md:px-9 md:pb-9 md:pt-8">
            {/* Q2M logo | event lockup (text, not the official event logo) */}
            <div className="flex items-center gap-3 md:gap-4">
              <img className="logo-color h-9 w-auto md:h-10" src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={66} height={40} />
              <img className="logo-reverse h-9 w-auto md:h-10" src={siteImages.brand.logoReverse.file} alt={siteImages.brand.logoReverse.alt} width={66} height={40} />
              <span aria-hidden className="h-9 w-px bg-line" />
              <div className="leading-tight">
                <p className="font-display text-sm font-bold md:text-[0.9375rem]">{p.lockup}</p>
                <p className="mt-0.5 text-xs text-ink-muted">{BTS.venue.short} · {date}</p>
              </div>
            </div>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-tint px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-action md:mt-7">
              <CalendarDays aria-hidden className="size-3.5 shrink-0" />{p.pill}
            </p>
            <h2 id="btsp-title" className="display-md mt-3">{p.title}</h2>
            <p id="btsp-desc" className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted md:mt-3 md:text-base">{BTS.liveDemos ? p.textLiveDemos : p.text}</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 md:mt-6 md:grid-cols-1">
              {p.items.map((it) => { const Icon = ICON[it.icon as keyof typeof ICON]; return (
                <li key={it.text} className="flex items-center gap-2.5 text-[0.8125rem] font-medium leading-snug md:gap-3 md:text-[0.9375rem]">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-md bg-tint text-action md:size-10"><Icon className="size-[1.125rem] md:size-5" /></span>{it.text}
                </li>
              ) })}
            </ul>
          </div>
        </div>

        {/* blue bar: the brand blue in both themes, so the white text keeps its contrast */}
        <div className="bg-[var(--q2m-action)] px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white md:px-9 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-3 md:flex-nowrap md:gap-x-7">
              <div className="flex items-center gap-3"><dt className="contents"><CalendarDays aria-hidden className="size-6 shrink-0 md:size-7" strokeWidth={1.75} /><span className="sr-only">Dates</span></dt><dd className="font-display text-base font-semibold md:text-lg">{date}</dd></div>
              <span aria-hidden className="hidden h-8 w-px bg-white/40 md:block" />
              <div className="flex items-center gap-3"><dt className="contents"><MapPin aria-hidden className="size-6 shrink-0 md:size-7" strokeWidth={1.75} /><span className="sr-only">Venue</span></dt><dd className="font-display text-base font-semibold md:text-lg">{BTS.venue.short}</dd></div>
            </dl>
            <Link to={BTS.path} onClick={close} className={`${BUTTON} w-full md:ml-auto md:w-auto`}>
              {p.cta}<ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button type="button" onClick={close} className="-mt-2 min-h-11 text-sm font-medium text-white/90 underline underline-offset-4 hover:text-white md:hidden">{p.later}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
