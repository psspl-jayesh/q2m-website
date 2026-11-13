import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock, MapPin, X } from 'lucide-react'
import { BTS, btsDateRangeAbbr, btsDateRangeShort, btsHours, useBtsPhase } from '@/config/bts'
import DotArrow from '@/components/DotArrow'

/**
 * Bengaluru Tech Summit 2026 announcement (text and timing: BTS.popup in src/config/bts.ts).
 * - Opens BTS.popup.delayMs after the page has loaded, on every page except the BTS landing page. Never in the pre-rendered HTML.
 * - Closes with the X, "Maybe later", Esc or a click outside. Closing or following the button snoozes it for BTS.popup.snoozeDays
 *   (localStorage; if storage is blocked it simply shows again next visit).
 * - Switched off once the event has closed (BTS.end).
 * - A modal dialog: the page behind is made inert, focus moves into the dialog (its close button), stays inside it and returns afterwards.
 * - Fixed position over the page, so nothing shifts. Phones: a full-width bottom sheet. Reduced motion: no animation (index.css).
 */
const KEY = 'q2m-bts-popup-closed'
const snoozed = () => {
  try { const t = Number(localStorage.getItem(KEY)); return t > 0 && Date.now() - t < BTS.popup.snoozeDays * 864e5 } catch { return false }
}
const snooze = () => { try { localStorage.setItem(KEY, String(Date.now())) } catch { /* storage blocked: it shows again next visit */ } }

/** One fact card (larger screens). */
const Fact = ({ icon: Icon, k, v, nowrap }: { icon: typeof CalendarDays; k: string; v: string; nowrap?: boolean }) => (
  // dt uses display: contents so the icon and label sit in the card grid while the list keeps valid dt/dd structure
  <div className="grid grid-cols-[2.5rem_1fr] items-center gap-x-3 rounded-lg border border-line bg-surface-raised p-4">
    <dt className="contents">
      <span aria-hidden className="row-span-2 grid size-10 place-items-center rounded-md bg-tint text-action"><Icon className="size-5" /></span>
      <span className="self-end text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">{k}</span>
    </dt>
    <dd className={`col-start-2 self-start font-medium leading-snug ${nowrap ? 'whitespace-nowrap' : ''}`}>{v}</dd>
  </div>
)

export default function BtsPopup() {
  const { pathname } = useLocation()
  const over = useBtsPhase() === 'after'
  const onLanding = pathname.replace(/\/?$/, '/') === BTS.path
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (over || onLanding || snoozed()) return
    const t = window.setTimeout(() => setOpen(true), BTS.popup.delayMs)
    return () => window.clearTimeout(t)
  }, [over, onLanding])

  const visible = open && !over && !onLanding
  const close = useCallback(() => { snooze(); setOpen(false) }, [])

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

  if (!visible) return null
  const p = BTS.popup
  return createPortal(
    <div className="btsp fixed inset-0 z-[60] flex items-end justify-center bg-black/45 md:items-center md:p-6">
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="btsp-title" aria-describedby="btsp-desc"
        className="btsp-panel relative max-h-[100dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-ink shadow-2xl md:max-w-[40rem] md:rounded-[1.75rem] md:p-10">
        <div aria-hidden className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-line md:hidden" />
        <button type="button" onClick={close} aria-label="Close" data-autofocus
          className="absolute right-5 top-9 grid size-11 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-tint md:right-5 md:top-5">
          <X aria-hidden className="size-5" />
        </button>

        {/* badge row: the dot arrow sits beside the badge on larger screens, beside the heading on phones */}
        <div className="flex items-center gap-4 pr-14">
          <DotArrow pitch={4.5} className="hidden h-auto w-10 shrink-0 md:block" />
          <p className="inline-flex items-center gap-2 rounded-full bg-tint px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-action">
            <CalendarDays aria-hidden className="size-4 shrink-0" />
            <span className="md:hidden">{p.badgeShort}</span><span className="hidden md:inline">{p.badge}</span>
          </p>
        </div>

        <div className="mt-6 flex items-start gap-3 md:mt-5">
          <DotArrow pitch={4} className="mt-2 h-auto w-9 shrink-0 md:hidden" />
          <h2 id="btsp-title" className="font-display text-[1.75rem] font-bold leading-[1.2] tracking-tight md:text-[2.75rem]">
            {p.titleLead}<br className="md:hidden" /><span className="hidden md:inline"> </span>
            <span className="relative inline-block whitespace-nowrap text-action">
              {p.titleAccent}
              <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-2.5 w-full text-q2m"><path d="M3 9 C 55 2, 145 2, 197 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </span>
          </h2>
        </div>
        <p id="btsp-desc" className="mt-5 text-ink-muted md:mt-4">{p.text}</p>

        {/* phones: one card with two rows */}
        <dl className="mt-5 divide-y divide-line rounded-lg border border-line bg-surface-raised px-4 md:hidden">
          <div className="flex items-center gap-3 py-3"><span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md bg-tint text-action"><CalendarDays className="size-5" /></span><dt className="sr-only">Dates and timings</dt><dd className="font-medium">{btsDateRangeShort()} · <span className="whitespace-nowrap">{btsHours()}</span></dd></div>
          <div className="flex items-center gap-3 py-3"><span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md bg-tint text-action"><MapPin className="size-5" /></span><dt className="sr-only">Venue</dt><dd className="font-medium">{`BIEC, ${BTS.venue.address}`}</dd></div>
        </dl>
        {/* larger screens: three fact cards */}
        <dl className="mt-6 hidden grid-cols-3 gap-3 md:grid">
          <Fact icon={CalendarDays} k="Dates" v={btsDateRangeAbbr()} />
          <Fact icon={MapPin} k="Venue" v={BTS.venue.short} />
          <Fact icon={Clock} k="Timings" v={btsHours()} nowrap />
        </dl>

        <div className="mt-6 flex flex-col gap-3 md:mt-7 md:flex-row md:items-center">
          <Link to={BTS.path} onClick={() => { snooze(); setOpen(false) }}
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-action px-7 font-semibold text-on-action transition-colors hover:bg-q2m">
            {p.cta}<ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <button type="button" onClick={close} className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 font-semibold transition-colors hover:bg-tint">
            {p.later}
          </button>
          <p className="hidden text-sm text-ink-muted md:ml-auto md:block">Theme: {p.theme}</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
