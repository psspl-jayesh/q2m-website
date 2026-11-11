import { useId } from 'react'

/**
 * Brand graphic panel shown where a real image has not been supplied yet (see docs/CONTENT_GAPS.md).
 * Flat dot pattern, 16px pitch, dot diameter = half the pitch. Never uses stock imagery.
 */
export default function DotPanel({ dark = false, className = '' }: { dark?: boolean; className?: string }) {
  const id = useId()
  return (
    <svg aria-hidden focusable="false" className={`h-full w-full ${className}`} data-needs-image>
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2" fill={dark ? 'var(--blue)' : 'var(--dot-idle)'} /></pattern>
      </defs>
      <rect width="100%" height="100%" fill={dark ? 'var(--block)' : 'var(--surface-raised)'} />
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
