import { Bot, CalendarDays, Glasses, MapPin, Ticket } from 'lucide-react'
import page from '@/content/pages/bts-2026/page.json'
import team from '@/content/sections/team-bento.json'
import stats from '@/content/shared/stats.json'
import { Accordion, Button, Reveal, SectionHead, Seo, SiteFrame, SiteImage, StaggerGroup, StaggerItem, imgMeta, type SiteImg } from '@/components/ui'
import BookingForm from '@/components/BookingForm'
import DotArrow from '@/components/DotArrow'
import { COMPANY } from '@/config/locale'

/**
 * Landing page for Bengaluru Tech Summit 2026 (/bengaluru-tech-summit-2026/). Self-contained: its own route and content
 * (src/content/pages/bts-2026/page.json, src/content/sections/team-bento.json). Shared components are used as they are.
 */
const img = (file: string, alt: string): SiteImg => ({ file, alt, w: imgMeta(file)?.w ?? null, h: imgMeta(file)?.h ?? null })
const FACT_ICON: Record<string, typeof Ticket> = { Event: Ticket, Venue: MapPin, Dates: CalendarDays, 'Live demos': Glasses }

export default function BtsLanding() {
  const people = team.people.map((p) => ({ ...p, image: img(p.photo, p.alt) }))
  const [lead, ...rest] = people
  const counters = team.stats.map((k) => stats.counters.find((c) => c.key === k)).filter((c): c is (typeof stats.counters)[number] => !!c)
  const venue = page.facts.find((f) => f.k === 'Venue')
  const demosFact = page.facts.find((f) => f.k === 'Live demos')
  return (
    <>
      <Seo title={page.seo.title} description={page.seo.description} path={page.path} />

      {/* Hero */}
      <section className="pb-12 pt-8 md:pb-20 md:pt-16">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal><p className="eyebrow mb-5">{page.hero.eyebrow}</p></Reveal>
            <Reveal delay={0.08} y={28}><h1 className="display-xl">{page.hero.title}</h1></Reveal>
            <Reveal delay={0.14}><p className="mono mt-5 flex items-center gap-2 text-ink-muted"><MapPin aria-hidden className="size-4 text-action" />{page.hero.venue}</p></Reveal>
            <Reveal delay={0.2}><p className="lede mt-6 max-w-xl">{page.hero.lead}</p></Reveal>
            <Reveal delay={0.26}><div className="mt-8"><Button to={page.hero.primary.href}>{page.hero.primary.label}</Button></div></Reveal>
          </div>
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-lg border border-line bg-surface-raised p-6 md:p-8">
              <DotArrow pitch={10} className="pointer-events-none absolute right-5 top-5 h-auto w-[80px]" />
              <dl className="grid gap-6 pr-16">
                {page.facts.map((f) => { const Icon = FACT_ICON[f.k] ?? Ticket; return (
                  <div key={f.k} className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-tint text-action"><Icon aria-hidden className="size-5" /></span>
                    <div><dt className="mono text-ink-muted">{f.k}</dt><dd className="mt-1 font-display text-lg font-semibold leading-snug">{f.v}</dd></div>
                  </div>
                ) })}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pitch */}
      <section className="pb-12 md:pb-24">
        <div className="container-page split split--lead">
          <div className="split-aside"><SectionHead title={page.pitch.title} /></div>
          <Reveal delay={0.1} className="split-main"><p className="lede">{page.pitch.text}</p></Reveal>
        </div>
      </section>

      {/* Live demos */}
      <section className="pb-12 md:pb-24">
        <div className="container-page">
          <SectionHead eyebrow={page.demos.eyebrow} title={page.demos.title} />
          <StaggerGroup className="mt-10 grid gap-4 md:grid-cols-2">
            {page.demos.items.map((d) => (
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
            {/* event facts */}
            {[venue, demosFact].filter(Boolean).map((f) => { const Icon = f!.k === 'Venue' ? MapPin : Bot; return (
              <StaggerItem key={f!.k} className="flex flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-4 sm:p-6 lg:col-span-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-tint text-action"><Icon aria-hidden className="size-5" /></span>
                <div><p className="font-display text-base font-semibold leading-snug sm:text-lg">{f!.v}</p><p className="mono mt-1 text-ink-muted">{f!.k}</p></div>
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
            {counters.map((c) => (
              <StaggerItem key={c.key} className="flex flex-col justify-between gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5 lg:col-span-2">
                <span className="font-display text-2xl font-bold leading-none sm:text-3xl">{c.prefix}{c.value}{c.suffix}</span>
                <span className="text-sm text-ink-muted">{c.label}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

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

      {/* FAQ */}
      <section id="faq" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page split">
          <div className="split-aside"><SectionHead eyebrow={page.faq.eyebrow} title={page.faq.title} lede={page.faq.intro} /></div>
          <div className="split-main"><Accordion items={page.faq.items} /></div>
        </div>
      </section>
    </>
  )
}
