import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * The logo's dot arrow, drawn large (ported from the Q2M home page design in Q2M_Website_Home).
 * 13x13 grid. Dots inside the arrow are brand blue and grow in diagonally on load; dots near the pointer grow.
 * Static when the user prefers reduced motion.
 */
const N = 13
const inArrow = (r: number, c: number) => c >= r + 3 && r <= 8 && c >= 4
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export default function DotField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let pointer: { x: number; y: number } | null = null
    let raf = 0
    const start = performance.now()

    const size = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (t: number) => {
      const w = canvas.clientWidth
      const pitch = w / N
      const base = pitch * 0.2
      const blue = css('--blue') || '#0075ea'
      const idle = css('--dot-idle') || '#d5d8dd'
      ctx.clearRect(0, 0, w, w)
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const x = pitch * (c + 0.5)
          const y = pitch * (r + 0.5)
          const arrow = inArrow(r, c)
          let rad = arrow ? base * 1.25 : base * 0.7
          if (arrow && !reduce) {
            const delay = (N - c + r) * 45
            const p = Math.min(1, Math.max(0, (t - start - delay) / 380))
            rad *= 1 - Math.pow(1 - p, 3)
          }
          if (pointer) {
            const d = Math.hypot(pointer.x - x, pointer.y - y)
            const k = Math.max(0, 1 - d / (pitch * 3))
            rad += k * base * (arrow ? 0.9 : 1.1)
          }
          ctx.beginPath()
          ctx.arc(x, y, Math.max(0, rad), 0, Math.PI * 2)
          ctx.fillStyle = arrow ? blue : idle
          ctx.fill()
        }
      }
    }
    const loop = (t: number) => {
      draw(t)
      raf = !reduce && (t - start < 2200 || pointer) ? requestAnimationFrame(loop) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }
    const still = () => draw(start + 99999)

    size()
    reduce ? still() : kick()
    const onResize = () => { size(); still() }
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      pointer = { x: e.clientX - b.left, y: e.clientY - b.top }
      reduce ? still() : kick()
    }
    const onLeave = () => { pointer = null; still() }
    window.addEventListener('resize', onResize)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    const mo = new MutationObserver(still) // redraw when the theme changes
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      mo.disconnect()
    }
  }, [reduce])

  return <div aria-hidden className={className}><canvas ref={ref} className="block aspect-square w-full" /></div>
}
