/**
 * Q2M graphic device: the stepped triangle of round dots pointing up and right.
 * Brand rules: pitch 16px on banners/slides, 12px on small items; dot diameter = half the pitch;
 * flat blue; use once per surface, in a corner or on a black slab, never behind text.
 * Row layout (start col, end col) is read from the logo's dot arrow geometry.
 */
const ROWS: [number, number][] = [[4, 8], [3, 8], [2, 8], [1, 8], [0, 8], [4, 7], [4, 6], [4, 5], [4, 4]]

export default function DotArrow({ pitch = 16, className = '' }: { pitch?: number; className?: string }) {
  const r = pitch / 4
  const w = 9 * pitch
  const h = ROWS.length * pitch
  return (
    <svg aria-hidden focusable="false" width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className}>
      {ROWS.flatMap(([a, b], row) => Array.from({ length: b - a + 1 }, (_, i) => (
        <circle key={`${row}-${i}`} cx={(a + i) * pitch + pitch / 2} cy={row * pitch + pitch / 2} r={r} fill="var(--q2m-blue)" />
      )))}
    </svg>
  )
}
