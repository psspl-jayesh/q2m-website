import { useEffect, useState } from 'react'
import { ArrowUpRight, Bot, CalendarDays, Clock, Glasses, MapPin, Ticket } from 'lucide-react'
import page from '@/content/pages/bts-2026/page.json'
import team from '@/content/sections/team-bento.json'
import stats from '@/content/shared/stats.json'
import certifications from '@/content/shared/certifications.json'
import testimonials from '@/content/shared/testimonials.json'
import { Accordion, Button, Reveal, SectionHead, Seo, SiteFrame, SiteImage, StaggerGroup, StaggerItem, TextLink, imgMeta, type SiteImg } from '@/components/ui'
import BookingForm from '@/components/BookingForm'
import DotArrow from '@/components/DotArrow'
import { FinalCta } from '@/components/Cards'
import { ClientLogoStrip, TrustPoints, Testimonials } from '@/components/Sitewide'
import { COMPANY } from '@/config/locale'
import { BTS, btsDateRange, btsNow, useBtsPhase } from '@/config/bts'
import { findEntry, useContent } from '@/lib/content'
import { pageImages } from '@/lib/images'
import { trimSentences } from '@/lib/menuCopy'

/**
 * Landing page for Bengaluru Tech Summit 2026 (/bengaluru-tech-summit-2026/). Self-contained: its own route and content
 * (src/content/pages/bts-2026/page.json, src/content/sections/team-bento.json). Dates, venue and the live-demos flag come
 * from src/config/bts.ts. After the event closes, the countdown, session, booking form and venue hide and the hero thanks visitors.
 */
const img = (file: string, alt: string): SiteImg => ({ file, alt, w: imgMeta(file)?.w ?? null, h: imgMeta(file)?.h ?? null })
/** Trust points: Microsoft/Azure partner and ISO 27001. The Clutch text item is left out while its decision is open (OPEN_DECISIONS #19). */
const TRUST = certifications.filter((x) => !/clutch/i.test(x.title))

function useCountdown(target: string) {
  const calc = () => Math.max(0, new Date(target).getTime() - btsNow().getTime())
  const [ms, setMs] = useState(calc)
  useEffect(() => { const t = window.setInterval(() => setMs(calc()), 15_000); return () => window.clearInterval(t) }, [target]) // eslint-disable-line react-hooks/exhaustive-deps
  const min = Math.floor(ms / 60_000)
  return [Math.floor(min / 1440), Math.floor((min % 1440) / 60), min % 60]
}

function Countdown() {
  const parts = useCountdown(BTS.start)
  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface-raised p-6 md:p-8">
      <DotArrow pitch={10} className="pointer-events-none absolute right-5 top-5 h-auto w-[80px]" />
      <p className="mono text-ink-muted">{page.countdown.label}</p>
      <dl className="mt-5 grid grid-cols-3 gap-3" aria-live="off">
        {parts.map((n, i) => (
          <div key={page.countdown.units[i]} className="flex flex-col-reverse rounded-md bg-surface p-3 md:p-4">
            <dt className="mono mt-2 text-ink-muted">{page.countdown.units[i]}</dt>
            <dd className="font-display text-4xl font-bold leading-none tabular-nums md:text-5xl">{String(n).padStart(2, '0')}</dd>
          </div>
        ))}
      </dl>
      <p className="mono mt-6 flex items-center gap-2"><CalendarDays aria-hidden className="size-4 text-action" />{btsDateRange()}</p>
    </div>
  )
}

export default function BtsLanding() {
  const phase = useBtsPhase()
  const after = phase === 'after'
  const c = useContent()
  const people = team.people.map((p) => ({ ...p, image: img(p.photo, p.alt) }))
  const [lead, ...rest] = people
  const counters = team.stats.map((k) => stats.counters.find((s) => s.key === k)).filter((s): s is (typeof stats.counters)[number] => !!s)
  const fact = (k: string) => page.facts.find((f) => f.k === k)
  const dates = { k: 'Dates', v: btsDateRange() }
  const glance = [fact('Event'), dates, fact('Venue'), after ? undefined : page.glance.session, BTS.liveDemos ? fact('Live demos') : undefined].filter((f): f is { k: string; v: string } => !!f)
  const GLANCE_ICON: Record<string, typeof Ticket> = { Event: Ticket, Dates: CalendarDays, Venue: MapPin, Session: Clock, 'Live demos': Glasses }
  const bentoFacts = [fact('Venue'), BTS.liveDemos ? fact('Live demos') : dates].filter((f): f is { k: string; v: string } => !!f)
  const why = page.why.pages.map((p) => findEntry(c, p)).filter((e): e is NonNullable<typeof e> => !!e)
  const clientLogos = pageImages(c, '/').filter((i) => i.role === 'logo' && i.sectionKey === 'trusted certified')
  const msBadges = pageImages(c, '/about/').filter((i) => i.role === 'logo' && /\/microsoft-/.test(i.file))
  const demos = BTS.liveDemos ? page.demos : { ...page.demos, eyebrow: page.demos.noDemos.eyebrow, items: page.demos.items.map((d, i) => ({ ...d, tag: page.demos.noDemos.tags[i] ?? d.tag })) }
  return (
    <>
      <Seo title={page.seo.title} description={page.seo.description} path={page.path} />

      {/* Hero: countdown before the event; after it, a thank-you with a link to Contact */}
      <section className="pb-12 pt-8 md:pb-20 md:pt-16">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal><p className="eyebrow mb-5">{after ? page.hero.title : page.hero.eyebrow}</p></Reveal>
            <Reveal delay={0.08} y={28}><h1 className="display-xl">{after ? page.after.title : page.hero.title}</h1></Reveal>
            <Reveal delay={0.14}><p className="mono mt-5 flex items-center gap-2 text-ink-muted"><MapPin aria-hidden className="size-4 text-action" />{page.hero.venue}</p></Reveal>
            {!after && <Reveal delay={0.2}><p className="lede mt-6 max-w-xl">{page.hero.lead}</p></Reveal>}
            <Reveal delay={0.26}><div className="mt-8">{after ? <Button to={page.after.cta.href}>{page.after.cta.label}</Button> : <Button to={page.hero.primary.href}>{page.hero.primary.label}</Button>}</div></Reveal>
          </div>
          {phase === 'before' && <Reveal delay={0.15} className="lg:col-span-5"><Countdown /></Reveal>}
        </div>
      </section>

      {/* Event at a glance */}
      <section aria-labelledby="glance" className="pb-12 md:pb-24">
        <div className="container-page">
          <h2 id="glance" className="eyebrow mb-6">{page.glance.title}</h2>
          <StaggerGroup as="dl" className={`grid grid-cols-2 gap-3 sm:gap-4 ${glance.length > 4 ? 'lg:grid-cols-5' : glance.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {glance.map((f, i) => { const Icon = GLANCE_ICON[f.k] ?? Ticket; return (
              <StaggerItem key={f.k} className={`flex flex-col gap-5 rounded-lg border border-line bg-surface-raised p-4 sm:p-6 ${glance.length % 2 && i === glance.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <span className="flex size-10 items-center justify-center rounded-md bg-tint text-action"><Icon aria-hidden className="size-5" /></span>
                <div className="flex flex-col-reverse"><dd className="font-display text-base font-semibold leading-snug sm:text-lg">{f.v}</dd><dt className="mono mb-1 text-ink-muted">{f.k}</dt></div>
              </StaggerItem>
            ) })}
          </StaggerGroup>
        </div>
      </section>

      {/* Pitch (about preparing for the session, so hidden after the event) */}
      {!after && (
        <section className="pb-12 md:pb-24">
          <div className="container-page split split--lead">
            <div className="split-aside"><SectionHead title={page.pitch.title} /></div>
            <Reveal delay={0.1} className="split-main"><p className="lede">{BTS.liveDemos ? page.pitch.text : page.pitch.textNoDemos}</p></Reveal>
          </div>
        </section>
      )}

      {/* What we can show you (live demos only once confirmed: BTS.liveDemos) */}
      <section className="pb-12 md:pb-24">
        <div className="container-page">
          <SectionHead eyebrow={demos.eyebrow} title={demos.title} />
          <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2">
            {demos.items.map((d) => (
              <StaggerItem key={d.title} className="relative overflow-hidden rounded-lg border border-line">
                <SiteFrame image={img(d.image, d.alt)} ratio="16/10" sizes="(min-width:768px) 50vw, 100vw" />
                <div className="absolute inset-x-3 bottom-3 rounded-md bg-surface p-3 md:inset-x-4 md:bottom-4">
                  <span className="mb-1.5 inline-block rounded-sm bg-action px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-action">{d.tag}</span>
                  <b className="block font-display text-base font-semibold leading-snug">{d.title}</b>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Trust points */}
      <TrustPoints title={page.trust.title} items={TRUST} badges={msBadges} />

      {/* Why meet Q2M: our AI service pages (live titles and descriptions) */}
      {why.length > 0 && (
        <section className="pb-12 md:pb-24">
          <div className="container-page">
            <SectionHead title={page.why.title} />
            <StaggerGroup as="ul" className="mt-12 grid gap-4 md:grid-cols-2">
              {why.map((e) => (
                <StaggerItem as="li" key={e.path} className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-surface-raised p-6 md:p-8">
                  <div>
                    <span className="flex size-10 items-center justify-center rounded-md bg-tint text-action">{/glasses/.test(e.path) ? <Glasses aria-hidden className="size-5" /> : <Bot aria-hidden className="size-5" />}</span>
                    <h3 className="mt-5 font-display text-xl font-semibold leading-snug">{e.title}</h3>
                    {e.description && <p className="mt-3 text-[0.9375rem] text-ink-muted">{trimSentences(e.description, 170)}</p>}
                  </div>
                  <p><TextLink to={e.path} label={`Read more about ${e.title}`}>Read more</TextLink></p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Team bento */}
      <section id="team" className="scroll-anchor pb-12 md:pb-24">
        <div className="container-page">
          <StaggerGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(150px,auto)]">
            {/* lead photo */}
            <StaggerItem className="relative col-span-2 min-h-[320px] overflow-hidden rounded-lg border border-line lg:col-span-5 lg:row-span-2">
              <SiteImage image={lead.image} ratio="auto" sizes="(min-width:1024px) 520px, 100vw" position="center 20%" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute bottom-3 left-3 rounded-md bg-surface px-3 py-2 md:bottom-4 md:left-4"><b className="block font-display text-base font-semibold">{lead.name}</b><span className="text-sm text-ink-muted">{lead.role}</span></div>
            </StaggerItem>
            {/* intro card with the whole team */}
            <StaggerItem className="col-span-2 flex flex-col justify-between gap-8 rounded-lg border border-line bg-tint p-6 md:p-8 lg:col-span-4 lg:row-span-2">
              <div>
                <p className="eyebrow mb-4">{team.eyebrow}</p>
                <ul className="flex flex-wrap gap-2" aria-label={team.title}>
                  {people.map((p) => <li key={p.name}><SiteImage image={p.image} ratio="1/1" sizes="48px" position="center 15%" className="size-12 rounded-full border-2 border-surface object-cover" /></li>)}
                </ul>
              </div>
              <div>
                <h2 className="display-md">{team.title}</h2>
                <p className="mt-4 text-ink-muted">{team.intro}</p>
              </div>
            </StaggerItem>
            {/* event facts (live demos only once confirmed; otherwise the dates) */}
            {bentoFacts.map((f) => { const Icon = f.k === 'Venue' ? MapPin : f.k === 'Dates' ? CalendarDays : Bot; return (
              <StaggerItem key={f.k} className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-4 sm:p-6 lg:col-span-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-tint text-action"><Icon aria-hidden className="size-5" /></span>
                <div><p className="font-display text-base font-semibold leading-snug sm:text-lg">{f.v}</p><p className="mono mt-1 text-ink-muted">{f.k}</p></div>
              </StaggerItem>
            ) })}
            {/* team photos */}
            {rest.map((p) => (
              <StaggerItem key={p.name} className="relative min-h-[220px] overflow-hidden rounded-lg border border-line sm:min-h-[260px] lg:col-span-2 lg:row-span-2">
                <SiteImage image={p.image} ratio="auto" sizes="(min-width:1024px) 220px, 50vw" position="center 20%" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-x-2 bottom-2 rounded-md bg-surface px-3 py-2"><b className="block text-sm font-semibold leading-tight">{p.name}</b><span className="text-xs text-ink-muted">{p.role}</span></div>
              </StaggerItem>
            ))}
            {/* stats */}
            {counters.map((s) => (
              <StaggerItem key={s.key} className="flex flex-col justify-between gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5 lg:col-span-2">
                <span className="font-display text-2xl font-bold leading-none sm:text-3xl">{s.prefix}{s.value}{s.suffix}</span>
                <span className="text-sm text-ink-muted">{s.label}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Client logos and testimonials */}
      <ClientLogoStrip label={page.trust.logos} logos={clientLogos} />
      <Testimonials eyebrow={page.trust.testimonials.eyebrow} title={page.trust.testimonials.title} items={testimonials} />

      {!after && (
        <>
          {/* The 30-minute session */}
          <section className="pb-12 md:pb-24">
            <div className="container-page">
              <div className="split split--lead">
                <div className="split-aside"><SectionHead eyebrow={page.session.eyebrow} title={page.session.title} /></div>
                <Reveal delay={0.1} className="split-main"><p className="text-ink-muted">{page.session.intro}</p></Reveal>
              </div>
              <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-3">
                {page.session.steps.map((s) => (
                  <StaggerItem key={s.title} className="rounded-lg border border-line bg-surface-raised p-6 md:p-8">
                    <span className="mono text-action">{s.min}</span><h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3><p className="mt-3 text-ink-muted">{s.text}</p>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </section>

          {/* Book */}
          <section id="book" className="scroll-anchor pb-12 md:pb-24">
            <div className="container-page">
              <Reveal>
                <div className="split rounded-lg bg-tint p-6 md:p-12">
                  <div className="split-aside">
                    <p className="eyebrow mb-4">{page.book.eyebrow}</p>
                    <h2 className="display-md">{page.book.title}</h2>
                    <p className="mt-5 text-ink-muted">{page.book.intro}</p>
                    <p className="mono mt-8">Email: <a className="text-action underline underline-offset-4" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
                  </div>
                  <div className="split-main"><BookingForm industries={page.book.industries} placeholder={page.book.placeholder} note={page.book.note} /></div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Venue and directions (no embedded map) */}
          <section id="venue" className="scroll-anchor pb-12 md:pb-24">
            <div className="container-page">
              <div className="flex flex-col gap-6 rounded-lg border border-line bg-surface-raised p-6 md:flex-row md:items-end md:justify-between md:p-10">
                <div>
                  <p className="eyebrow mb-4">{page.venueSection.eyebrow}</p>
                  <h2 className="display-md max-w-2xl">{BTS.venue.name}</h2>
                  <address className="mono mt-4 flex items-center gap-2 not-italic text-ink-muted"><MapPin aria-hidden className="size-4 text-action" />{BTS.venue.address}</address>
                </div>
                <a href={BTS.venue.directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-line px-5 py-3 font-semibold transition-colors hover:border-action hover:text-action md:self-auto">
                  {page.venueSection.directions}<ArrowUpRight aria-hidden className="size-4" /><span className="sr-only"> (opens Google Maps in a new tab)</span>
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FAQ */}
      <section id="faq" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page split">
          <div className="split-aside"><SectionHead eyebrow={page.faq.eyebrow} title={page.faq.title} lede={page.faq.intro} /></div>
          <div className="split-main"><Accordion items={page.faq.items} /></div>
        </div>
      </section>

      {/* Closing CTA band (the sitewide FinalCta; the button goes to the booking form, or to Contact after the event) */}
      <FinalCta cta={after ? page.after.cta : page.closing.cta} />
    </>
  )
}
