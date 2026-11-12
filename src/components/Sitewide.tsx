import { SectionHead, SiteImage, StaggerGroup, StaggerItem, type SiteImg } from '@/components/ui'

/**
 * Sitewide sections as standalone components, with the same markup and classes as where they appear today
 * (client logo marquee: home "Our Global Clients"; quote cards: service pages). The existing pages are not changed;
 * these are used by the BTS landing page.
 */

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
