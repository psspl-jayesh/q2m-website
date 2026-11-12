import { Children, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import { isHydrating } from '@/lib/ssr'

/** Animation tokens. Small interactions 150-250ms, transitions 250-450ms, scroll reveals 500-800ms, stagger ~100ms. */
export const EASE = [0.22, 1, 0.36, 1] as const
export const DUR = { fast: 0.2, base: 0.35, reveal: 0.65, image: 1.0 }
export const STAGGER = 0.1

/**
 * Reveal trigger. An element reveals once it is within the viewport OR already above it, so content can never stay
 * hidden after the user jumps (End key, anchor link, scroll restoration, fast scroll). One shared passive scroll listener.
 */
type Pending = { el: Element; fn: () => void }
const pending = new Set<Pending>()
let bound = false
function check() {
  const limit = window.innerHeight * 0.92
  for (const p of [...pending]) {
    if (p.el.getBoundingClientRect().top < limit) { pending.delete(p); p.fn() }
  }
}
function bind() {
  if (bound) return
  bound = true
  let raf = 0
  const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; check() }) }
  window.addEventListener('scroll', on, { passive: true })
  window.addEventListener('resize', on)
  window.addEventListener('hashchange', on)
}
/**
 * Pre-rendered pages (`ssr` = rendered on the server or hydrating its HTML): content starts visible, so the static HTML is
 * readable before JavaScript runs and the first paint is not held back. After hydration, elements already in the first
 * viewport stay as they are; elements below it are hidden off-screen and reveal on scroll as before.
 * Pages reached by in-app navigation keep the original behaviour (start hidden, reveal on scroll).
 */
function useReveal<T extends HTMLElement>(): [RefObject<T | null>, boolean, boolean] {
  const ref = useRef<T>(null)
  const [ssr] = useState(isHydrating)
  const [shown, setShown] = useState(ssr)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (ssr) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return // in the first viewport: stays visible
      setShown(false) // below the fold: hide (not on screen) so it reveals on scroll
    }
    bind()
    const p = { el, fn: () => setShown(true) }
    pending.add(p)
    const t = window.setTimeout(check, 60) // after first layout
    check()
    return () => { pending.delete(p); window.clearTimeout(t) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, shown, ssr]
}

/** Fade + rise on scroll. Content is rendered normally (visible) when reduced motion is on. */
export function Reveal({ children, delay = 0, y = 20, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion()
  const [ref, shown, ssr] = useReveal<HTMLDivElement>()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div ref={ref} className={className} initial={ssr ? false : { opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : ssr ? { opacity: 0, y, transition: { duration: 0 } } : undefined} transition={{ duration: DUR.reveal, delay, ease: EASE }}>
      {children}
    </motion.div>
  )
}

/** Staggered group: children wrapped in <StaggerItem> enter one after another (~100ms apart). */
/** ~100ms between items, but the whole cascade never exceeds ~0.7s, so long lists don't make people wait. */
const groupFor = (n: number): Variants => ({ hidden: {}, show: { transition: { staggerChildren: Math.min(STAGGER, 0.7 / Math.max(1, n)) } } })
const item: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: DUR.reveal * 0.85, ease: EASE } } }
type Tag = 'div' | 'ul' | 'ol' | 'dl' | 'li'
const M = { div: motion.div, ul: motion.ul, ol: motion.ol, dl: motion.dl, li: motion.li }
export function StaggerGroup({ children, as = 'div', className = '' }: { children: ReactNode; as?: Tag; className?: string }) {
  const reduce = useReducedMotion()
  const [ref, shown, ssr] = useReveal<HTMLElement>()
  const C = M[as] as typeof motion.div
  const Plain = as as 'div'
  if (reduce) return <Plain className={className}>{children}</Plain>
  return <C ref={ref as RefObject<HTMLDivElement>} className={className} variants={groupFor(Children.count(children))} initial={ssr ? false : 'hidden'} animate={shown ? 'show' : 'hidden'}>{children}</C>
}
export function StaggerItem({ children, as = 'div', className = '' }: { children: ReactNode; as?: Tag; className?: string }) {
  const reduce = useReducedMotion()
  const C = M[as] as typeof motion.div
  const Plain = as as 'div'
  if (reduce) return <Plain className={className}>{children}</Plain>
  return <C className={className} variants={item}>{children}</C>
}

/** Image frame: clip-and-fade reveal on scroll, optional subtle parallax. Fixed aspect ratio, so no layout shift. */
/** `maxWidth` (px): the frame never grows beyond the image's own width, so no image is ever shown larger than its intrinsic size. */
export function ImageFrame({ children, ratio, parallax = false, className = '', maxWidth }: { children: ReactNode; ratio?: string; parallax?: boolean; className?: string; maxWidth?: number }) {
  const reduce = useReducedMotion()
  const [ref, shown, ssr] = useReveal<HTMLDivElement>()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%'])
  const style = ratio || maxWidth ? { aspectRatio: ratio, maxWidth, marginInline: maxWidth ? 'auto' : undefined } : undefined
  const base = `overflow-hidden rounded-lg bg-surface-raised ${className}`
  if (reduce) return <div ref={ref} style={style} className={base}>{children}</div>
  return (
    <motion.div ref={ref} style={style} className={base}
      initial={ssr ? false : { opacity: 0, clipPath: 'inset(8% 0 0 0)' }}
      animate={shown ? { opacity: 1, clipPath: 'inset(0% 0 0 0)' } : ssr ? { opacity: 0, clipPath: 'inset(8% 0 0 0)', transition: { duration: 0 } } : undefined} transition={{ duration: DUR.image, ease: EASE }}>
      {parallax ? <motion.div style={{ y, scale: 1.08 }} className="h-full w-full">{children}</motion.div> : children}
    </motion.div>
  )
}
