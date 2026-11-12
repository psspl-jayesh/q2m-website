import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Sitewide "Back to top" button (rendered once in Layout).
 * - Hidden at the top; appears after ~one screen of scrolling (SHOW_AFTER), hides again near the top.
 * - A ring around it fills with scroll progress (0% at the top, 100% at the bottom).
 * - Click / Enter / Space: the arrow shoots up, then the page scrolls to the top and focus moves to the top of the page
 *   (keyboard: the skip link, which becomes visible; mouse: <main>, silently).
 * - Lifts above the footer's bottom bar (social icons, theme switch) when that bar is on screen; hidden while the mobile
 *   menu is open and while a form field has focus, so it never covers what someone is typing in.
 * - Reduced motion: no entrance, no arrow loop, instant jump (the global reduced-motion CSS removes the animations).
 * - Pre-render safe: renders hidden; window/document are only touched in effects and handlers.
 */
const SHOW_AFTER = 600
const R = 28 // ring radius in the 60px box (the 48px button sits inside it with a small gap)
const C = 2 * Math.PI * R

/** True when a form control is under the button's area or within 4px of it (a 5 x 5 grid of points, edges included). */
function coversControl(el: HTMLElement, lift: number): boolean {
  // the resting (shown) position, not the current one: while hidden the button sits 16px lower for its slide-up entrance
  const cs = getComputedStyle(el)
  const size = el.offsetWidth
  const left = window.innerWidth - parseFloat(cs.right) - size
  const top = window.innerHeight - parseFloat(cs.bottom) - size - lift
  const m = 4 // keep a little clearance around the button
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const x = left - m + ((size + 2 * m) * i) / 4
    const y = top - m + ((size + 2 * m) * j) / 4
    if (document.elementsFromPoint(x, y).some((n) => !el.contains(n) && n.closest('input, select, textarea, form button, label'))) return true
  }
  return false
}

export default function BackToTop() {
  const [shown, setShown] = useState(false)
  const [busy, setBusy] = useState(false) // a form field has focus, or the mobile menu is open
  const [shooting, setShooting] = useState(false)
  const [overControl, setOverControl] = useState(false)
  const ring = useRef<SVGCircleElement>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - p))
      // keep clear of the footer's bottom bar: lift the button above it while it is on screen
      const bar = document.querySelector('[data-back-to-top-avoid]')
      const el = box.current
      let lift = 0
      if (bar && el) {
        const resting = window.innerHeight - parseFloat(getComputedStyle(el).bottom) // the button's bottom edge, before lifting
        lift = Math.max(0, resting - (bar.getBoundingClientRect().top - 12))
        el.style.setProperty('--btt-lift', `${-lift}px`)
      }
      // never sit on a form control (booking and contact forms on phones): step aside while one is underneath
      setOverControl(el ? coversControl(el, lift) : false)
      setShown(y > SHOW_AFTER)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    const ro = new ResizeObserver(on) // page height changes (images, accordions) move the progress
    ro.observe(document.body)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); ro.disconnect() }
  }, [])

  useEffect(() => {
    const field = () => !!document.activeElement?.matches('input, select, textarea, [contenteditable="true"]')
    const menu = () => document.documentElement.hasAttribute('data-menu-open')
    const check = () => setBusy(field() || menu())
    const later = () => window.setTimeout(check, 0)
    document.addEventListener('focusin', check)
    document.addEventListener('focusout', later)
    const mo = new MutationObserver(check)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-menu-open'] })
    return () => { document.removeEventListener('focusin', check); document.removeEventListener('focusout', later); mo.disconnect() }
  }, [])

  const go = (keyboard: boolean) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const land = () => {
      const target = keyboard ? document.querySelector<HTMLElement>('a[href="#main"]') : document.getElementById('main')
      target?.focus({ preventScroll: true })
    }
    if (reduce) { window.scrollTo({ top: 0, behavior: 'instant' }); land(); return }
    setShooting(true)
    window.setTimeout(() => {
      setShooting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // move focus once the scroll has arrived (scrollend where supported; otherwise poll briefly)
      const start = performance.now()
      const wait = () => (window.scrollY <= 1 || performance.now() - start > 1500 ? land() : requestAnimationFrame(wait))
      requestAnimationFrame(wait)
    }, 160)
  }
  const onClick = (e: MouseEvent<HTMLButtonElement>) => go(e.detail === 0) // detail 0 = activated from the keyboard

  const visible = shown && !busy && !overControl
  return (
    <div ref={box} className={`btt ${visible ? 'btt--shown' : ''}`}>
      <svg aria-hidden className="btt-ring" viewBox="0 0 60 60" width="60" height="60">
        <circle cx="30" cy="30" r={R} className="btt-track" />
        <circle ref={ring} cx="30" cy="30" r={R} className="btt-progress" strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <button type="button" aria-label="Back to top" tabIndex={visible ? 0 : -1} onClick={onClick} className="btt-button">
        <ArrowUp aria-hidden className={`btt-arrow ${shooting ? 'btt-arrow--shoot' : ''}`} strokeWidth={2.5} />
      </button>
    </div>
  )
}
