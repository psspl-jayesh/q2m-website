import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, Cpu, FileText, Glasses, MapPin, Video, X } from 'lucide-react'
import { BTS, btsDateRangeShort, useBtsPhase } from '@/config/bts'
import { Img, imgMeta } from '@/components/ui'

/**
 * Bengaluru Tech Summit 2026 announcement (content and timing: BTS.popup in src/config/bts.ts).
 * - Larger screens (768px+): the owner's banner image (public/images/bts/bts-popup-desktop.png, served as AVIF/WebP). The whole
 *   image links to the BTS page. It is fetched only when the popup is due, and the popup appears once the image has loaded.
 * - Phones: an HTML bottom sheet with the same message and a "Meet us at the summit" button (the banner is too small to read
 *   there). If public/images/bts/bts-popup-mobile.png is added and run through the image optimiser, phones show that image.
 * - Opens BTS.popup.delayMs after the page has loaded, never on the BTS landing page, never in the pre-rendered HTML.
 * - Closes with the X, "Maybe later" (phones), Esc or a click outside. Closing it or following the link snoozes it for
 *   BTS.popup.snoozeDays (localStorage; if storage is blocked it simply shows again on the next visit).
 * - Switched off once the event has closed (BTS.end).
 * - A modal dialog: the page behind is made inert, focus moves into it (its close button), stays inside and returns afterwards.
 * - Fixed position over the page, so nothing shifts. Reduced motion: no animation (index.css).
 */
const KEY = 'q2m-bts-popup-closed'
const snoozed = () => {
  try { const t = Number(localStorage.getItem(KEY)); return t > 0 && Date.now() - t < BTS.popup.snoozeDays * 864e5 } catch { return false }
}
const snooze = () => { try { localStorage.setItem(KEY, String(Date.now())) } catch { /* storage blocked: it shows again next visit */ } }

const WIDE = '(min-width: 768px)'
const ICON = { glasses: Glasses, chip: Cpu, video: Video, document: FileText } as const

/** <picture> for a manifest image, with a load callback (the popup waits for it). */
function Banner({ src, alt, onReady }: { src: string; alt: string; onReady: () => void }) {
  const m = imgMeta(src)
  const set = (fmt: string) => m?.widths.map((w) => `${m.dir}/${m.name}-${w}.${fmt} ${w}w`).join(', ')
  const sizes = '(min-width: 1048px) 1000px, calc(100vw - 48px)'
  return (
    <picture>
      {m && <source type="image/avif" srcSet={set('avif')} sizes={sizes} />}
      {m && <source type="image/webp" srcSet={set('webp')} sizes={sizes} />}
      <img src={src} alt={alt} width={m?.w} height={m?.h} decoding="async" onLoad={onReady} onError={onReady} className="block h-auto w-full" />
    </picture>
  )
}

export default function BtsPopup() {
  const { pathname } = useLocation()
  const over = useBtsPhase() === 'after'
  const onLanding = pathname.replace(/\/?$/, '/') === BTS.path
  const [due, setDue] = useState(false)
  const [wide, setWide] = useState(false)
  const [ready, setReady] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (over || onLanding || snoozed()) return
    const t = window.setTimeout(() => { setWide(window.matchMedia(WIDE).matches); setDue(true) }, BTS.popup.delayMs)
    return () => window.clearTimeout(t)
  }, [over, onLanding])

  // switch between the image and the bottom sheet if the window is resized while it is open
  useEffect(() => {
    if (!due) return
    const mq = window.matchMedia(WIDE)
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [due])

  const mobileImage = !!imgMeta(BTS.popup.mobileImage)
  const usesImage = wide || mobileImage
  const active = due && !over && !onLanding
  const visible = active && (!usesImage || ready)
  const close = useCallback(() => { snooze(); setDue(false) }, [])

  useEffect(() => {
    if (!visible) return
    const back = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    box.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return }
      if (e.key !== 'Tab' || !box.current) return
      const f = [...box.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
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

  if (!active) return null
  const p = BTS.popup
  const follow = () => { snooze(); setDue(false) }
  const closeBtn = (
    <button type="button" onClick={close} aria-label="Close" data-autofocus
      className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-white text-[#0b0c0c] shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105">
      <X aria-hidden className="size-5" />
    </button>
  )

  // the image version renders hidden until the image has loaded, so the popup never opens as an empty frame
  if (usesImage) return createPortal(
    <div className={`fixed inset-0 z-[60] flex items-end justify-center bg-black/60 md:items-center md:p-6 ${visible ? 'btsp' : 'invisible'}`}>
      <div ref={box} role="dialog" aria-modal="true" aria-label={p.title} className={`relative w-full max-w-[1000px] ${visible ? 'btsp-panel' : ''}`}>
        {closeBtn}
        <Link to={BTS.path} onClick={follow} className="block overflow-hidden rounded-t-[1.25rem] shadow-2xl md:rounded-[1.25rem]">
          <Banner src={wide ? p.image : p.mobileImage} alt={p.imageAlt} onReady={() => setReady(true)} />
        </Link>
      </div>
    </div>,
    document.body,
  )

  const date = btsDateRangeShort()
  return createPortal(
    <div className="btsp fixed inset-0 z-[60] flex items-end justify-center bg-black/60">
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="btsp-title" aria-describedby="btsp-desc"
        className="btsp-panel relative max-h-[100dvh] w-full overflow-y-auto overflow-x-hidden rounded-t-[1.5rem] bg-surface text-ink shadow-2xl">
        {closeBtn}
        <div className="relative h-44 sm:h-56">
          <Img src={p.photo.file} alt={p.photo.alt} eager sizes="100vw" position="35% 30%" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent" />
        </div>
        <div className="px-5 pb-5 pt-1">
          <p className="inline-block rounded-lg bg-tint px-3 py-1.5 text-sm font-semibold text-action">{p.pill}</p>
          <h2 id="btsp-title" className="mt-2 font-display text-[1.75rem] font-bold leading-[1.1] tracking-tight">{p.title}</h2>
          <p id="btsp-desc" className="mt-2 text-[0.9375rem] font-medium leading-snug text-ink-muted">{BTS.liveDemos ? p.textLiveDemos : p.text}</p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {p.items.map((it) => { const Icon = ICON[it.icon as keyof typeof ICON]; return (
              <li key={it.text} className="flex items-center gap-2.5 text-[0.8125rem] font-semibold leading-tight">
                <Icon aria-hidden className="size-6 shrink-0 text-action" strokeWidth={1.75} />{it.text}
              </li>
            ) })}
          </ul>
        </div>
        {/* blue band: the brand blue in both themes, so white text keeps its contrast */}
        <div className="bg-[var(--q2m-action)] px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-white">
          <dl className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3"><dt className="contents"><CalendarDays aria-hidden className="size-7 shrink-0" strokeWidth={1.75} /><span className="sr-only">Dates</span></dt><dd className="font-display text-lg font-semibold leading-tight">{date}</dd></div>
            <div className="flex items-center gap-3"><dt className="contents"><MapPin aria-hidden className="size-7 shrink-0" strokeWidth={1.75} /><span className="sr-only">Venue</span></dt><dd className="font-display text-lg font-semibold leading-tight">{BTS.venue.short}</dd></div>
          </dl>
          <Link to={BTS.path} onClick={follow}
            className="mt-4 flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 font-display text-lg font-semibold text-[var(--q2m-action)] shadow-sm">
            {p.cta}<ArrowRight aria-hidden className="size-5" />
          </Link>
          <button type="button" onClick={close} className="mx-auto mt-1 block min-h-11 px-4 text-sm font-medium text-white/90 underline underline-offset-4">{p.later}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
