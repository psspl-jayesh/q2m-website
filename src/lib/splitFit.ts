import { useEffect } from 'react'

/**
 * Shared safety rule for every `.split-aside` (the sticky left column).
 * If an aside is taller than the space below the header AND its sibling column is taller still, it would be cut off
 * while pinned, so it gets `.split-aside--scroll` (max-height + inner scroll). Otherwise the class is removed.
 * One rule for all pages; no per-page code. Runs on route change, resize and layout changes.
 */
export function useSplitFit(routeKey: string) {
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const cs = getComputedStyle(document.documentElement)
      const header = parseFloat(cs.getPropertyValue('--header-height')) || 96
      const room = window.innerHeight - header - 48
      document.querySelectorAll<HTMLElement>('.split-aside').forEach((aside) => {
        aside.classList.remove('split-aside--scroll')
        if (window.innerWidth < 1024) return
        const main = Array.from(aside.parentElement?.children ?? []).find((el) => el !== aside && el.classList.contains('split-main'))
        const h = aside.getBoundingClientRect().height
        if (main && h > room && main.getBoundingClientRect().height > h) aside.classList.add('split-aside--scroll')
      })
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(run) }
    const timers = [window.setTimeout(schedule, 150), window.setTimeout(schedule, 900)] // after images and reveals settle
    window.addEventListener('resize', schedule)
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)
    return () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener('resize', schedule); ro.disconnect() }
  }, [routeKey])
}
