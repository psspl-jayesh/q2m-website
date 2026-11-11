import { SectionHead, SiteImage, StaggerGroup, StaggerItem, type SiteImg } from '@/components/ui'

/**
 * Sitewide sections as standalone components, with the same markup and classes as where they appear today
 * (trust cards and client logo marquee: home "Trusted & Certified"; quote cards: service pages). The existing pages are not changed;
 * these are used by the BTS landing page.
 */

/** Trust points: the home "Trusted & Certified" card grid (first card full width with the Microsoft badges). */
export function TrustPoints({ title, items, badges = [] }: { title: string; items: { title: string; detail: string }[]; badges?: SiteImg[] }) {
  if (!items.length) return null
  return (
    <section id="trusted" className="scroll-anchor pb-12 md:pb-24">
      <div className="container-page">
        <SectionHead title={title} />
        <StaggerGroup as="ul" className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
          {items.map((x, n) => (
            <StaggerItem as="li" key={x.title} className={`group relative flex flex-col justify-between gap-8 bg-surface p-6 transition-colors duration-300 hover:bg-tint md:p-8 ${n === 0 ? 'md:col-span-2 md:flex-row md:items-end md:gap-12 md:p-10' : ''}`}>
              <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-action transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <div>
                <span className="mono text-action">{String(n + 1).padStart(2, '0')}</span>
                <h3 className={`mt-4 font-display leading-snug ${n === 0 ? 'text-[1.75rem] font-bold' : 'text-xl font-semibold'}`}>{x.title}</h3>
                <p className="mt-3 text-[0.9375rem] text-ink-muted">{x.detail}</p>
              </div>
              {n === 0 && badges.length > 0 && (
                <ul className="flex flex-wrap gap-3">
                  {badges.map((b) => <li key={b.file} className="rounded-md border border-line bg-white p-2"><SiteImage image={b} ratio="auto" sizes="220px" className="h-auto w-[170px] md:w-[210px]" /></li>)}
                </ul>
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}

/** Client logos strip: the home "Our Global Clients" marquee. */
export function ClientLogoStrip({ label, logos }: { label: string; logos: SiteImg[] }) {
  if (!logos.length) return null
  return (
    <section className="pb-12 md:pb-24">
      <div className="container-page">
        <p className="mono text-ink-muted">{label}</p>
        <div className="logo-marquee mt-6" role="group" aria-label={label}>
          <ul className="logo-marquee-track">
            {[...logos, ...logos].map((l, k) => (
              <li key={l.file + k} aria-hidden={k >= logos.length || undefined} className="flex h-16 w-[170px] shrink-0 items-center justify-center rounded-md border border-line bg-white px-6">
                <SiteImage image={l} ratio="auto" sizes="140px" className="h-8 w-auto max-w-full object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** Testimonials: the service-page quote cards under a section title. */
export function Testimonials({ eyebrow, title, items }: { eyebrow?: string; title: string; items: { quote: string; name: string; role?: string }[] }) {
  if (!items.length) return null
  return (
    <section className="pb-12 md:pb-24">
      <div className="container-page">
        <SectionHead eyebrow={eyebrow} title={title} />
        <StaggerGroup as="ul" className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((q) => (
            <StaggerItem as="li" key={q.name}><figure className="h-full rounded-lg border border-line bg-surface-raised p-6">
              <blockquote className="text-[0.9375rem] leading-relaxed">{q.quote}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4"><span className="block font-display text-lg font-semibold">{q.name}</span>{q.role && <span className="mono text-ink-muted">{q.role}</span>}</figcaption>
            </figure></StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
