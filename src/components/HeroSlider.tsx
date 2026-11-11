import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { SiteImage, type SiteImg } from '@/components/ui'

const INTERVAL = 5000

/**
 * Hero image slider (home page). Cross-fades between live hero images, keeps their intrinsic aspect ratio,
 * pauses on hover/focus, and does not autoplay when the visitor prefers reduced motion.
 */
export default function HeroSlider({ slides, className = '' }: { slides: SiteImg[]; className?: string }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length
  useEffect(() => {
    if (reduce || paused || n < 2) return
    const t = window.setTimeout(() => setI((v) => (v + 1) % n), INTERVAL)
    return () => window.clearTimeout(t)
  }, [i, paused, reduce, n])
  if (!n) return null
  const first = slides[0]
  const ratio = first.w && first.h ? `${first.w} / ${first.h}` : '835 / 648'
  return (
    <div
      className={`relative ${className}`}
      role="group"
      aria-roledescription="carousel"
      aria-label="Q2M Solutions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-lg border border-line bg-surface-raised" style={{ aspectRatio: ratio }}>
        {slides.map((s, k) => (
          <div
            key={s.file}
            role="group"
            aria-roledescription="slide"
            aria-label={`${k + 1} of ${n}`}
            aria-hidden={k !== i}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${k === i ? 'opacity-100' : 'opacity-0'}`}
          >
            <SiteImage image={s} priority={k === 0} sizes="(min-width:1024px) 520px, 100vw" ratio="auto" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2" aria-live={paused || reduce ? 'polite' : 'off'}>
          {slides.map((s, k) => (
            <button
              key={s.file}
              type="button"
              aria-label={`Show slide ${k + 1} of ${n}`}
              aria-current={k === i ? 'true' : undefined}
              onClick={() => setI(k)}
              className={`h-2 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-action' : 'w-2 bg-ink-muted/40 hover:bg-ink-muted'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
