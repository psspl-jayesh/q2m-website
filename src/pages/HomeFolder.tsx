import home from '@/data/home.json'
import { Accordion, Button, Reveal, SectionHead, Seo, StaggerGroup, StaggerItem, TextLink } from '@/components/ui'
import DotField from '@/components/DotField'
import DotPanel from '@/components/DotPanel'
import BookingForm from '@/components/BookingForm'
import { COMPANY } from '@/config/locale'
import { getPage, findEntry, useContent } from '@/lib/content'
import { ogImageFor, pageImages } from '@/lib/images'
import { PostCard } from '@/components/Cards'
import { SiteFrame, SiteImage, imgMeta, type SiteImg } from '@/components/ui'
import homeImages from '@/content/shared/home-images.json'
import stats from '@/content/shared/stats.json'
import { BTS, btsDateRangeShort, useBtsPhase } from '@/config/bts'
import btsWording from '@/content/sections/bts-wording.json'
import { ArrowUpRight, CalendarDays, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Existing Q2M pages that cover a practice. Practices with no page (agentic commerce, 3D Gaussian splatting) are not linked. */
const SERVICE_PAGE: Record<string, string> = {
  'AI smart glasses app development': '/smart-glasses-ar-wearable-app-development-services/',
  'Agentic AI and intelligent automation': '/ai-agent-development-services/',
  'AI agent development': '/ai-agent-development-services/',
  MLOps: '/mlops-consulting-services/',
  'Microsoft business apps': '/enterprise-business-application/',
}

/** Topic image for a home item (live-site image, see src/content/shared/home-images.json); undefined keeps the brand dot panel. */
type HomeImgs = Record<string, { file: string; alt: string }>
const topicImg = (set: HomeImgs, key: string): SiteImg | undefined => {
  const e = set[key]; if (!e) return undefined
  const m = imgMeta(e.file)
  return { file: e.file, alt: e.alt, w: m?.w ?? null, h: m?.h ?? null }
}
const WORK = homeImages.work as HomeImgs
const SERVICE_IMG = homeImages.services as HomeImgs
const INDUSTRY_IMG = homeImages.industries as HomeImgs
const APPROACH_IMG = homeImages.approach as HomeImgs

const Head = ({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) => (
  <div className="split split--lead">
    <div className="split-aside"><SectionHead eyebrow={eyebrow} title={title} /></div>
    {intro && <Reveal delay={0.1} className="split-main"><p className="text-ink-muted">{intro}</p></Reveal>}
  </div>
)

/** Live blog posts shown in "From The Team" on the live home page. */
/**
 * After Bengaluru Tech Summit 2026 closes (date in src/config/bts.ts) the BTS items hide: the hero event line, the "Find us at BIEC"
 * tile, the BTS section and the booking form. The tile grid then re-flows: these two tiles grow so the 4-column grid has no holes.
 */
const BTS_TILE = 'BTS 2026'
const AFTER_BTS_TILE_SIZE: Record<string, { w2?: boolean; h2?: boolean }> = {
  'Use-case mapping with client teams': { h2: true },
  'Clinical and lab records, extracted': { w2: true },
}

const N = btsWording.neutral

const TEAM_POSTS = ['/ai-chatbot-development-strategic-priority-2026/', '/machine-learning-development-scalable-ml-solutions/', '/top-ai-agent-development-companies/']

/**
 * BACKUP, NOT ROUTED since the smart glasses home (HomeGlasses.tsx) became the home page on branch new-home-page (12 Nov 2026; see docs/BACKUP_OLD_DESIGN.md). Previously THE HOME PAGE. The designed home from the Q2M_Website_Home folder: its design, section order and copy are kept as they were.
 * Three sections from the live home page are added where the meaning matches nothing in the design (Our Global Clients logos,
 * The Results Our Clients Measure, From The Team). "Trusted & Certified" was removed on the owner's request (12 Nov 2026).
 * The live-structure home is kept as Home.tsx (not routed).
 * SEO title and description are the live ones.
 */
export default function HomeFolder() {
  const h = home
  const c = useContent()
  const live = getPage(c, 'q2m-solutions')!
  const homeImgs = pageImages(c, '/')
  const clientLogos = homeImgs.filter((i) => i.role === 'logo' && i.sectionKey === 'trusted certified')
  const counters = stats.counters.slice(0, 4)
  const btsOver = useBtsPhase() === 'after'
  const tiles = (btsOver ? h.work.tiles.filter((t) => t.tag !== BTS_TILE).map((t) => ({ ...t, ...AFTER_BTS_TILE_SIZE[t.title] })) : h.work.tiles)
    .map((t) => (!BTS.liveDemos && t.tag === N.demoTag.replaces ? { ...t, tag: N.demoTag.text } : t))
  // Booth wording (BTS.liveDemos) and after-event hiding for the BTS lines in other sections
  const booth = BTS.liveDemos
  const card = h.bts.card
  const workIntro = booth && !btsOver ? h.work.intro : N.workIntro.text
  const serviceTag = (tag: string) => (tag === btsWording.liveDemoServiceTag && (!booth || btsOver) ? '' : tag)
  const session = booth ? h.session : { ...h.session, title: N.sessionTitle.text, steps: h.session.steps.map((x, i) => (i === 1 ? { ...x, text: N.sessionStep2.text } : x)) }
  const faqIntro = btsOver ? undefined : booth ? h.faq.intro : N.faqIntro.text
  const faqItems = btsOver ? h.faq.items.filter((f) => f.q !== btsWording.sessionFaqQuestion)
    : booth ? h.faq.items : h.faq.items.map((f) => (f.q === btsWording.sessionFaqQuestion ? { ...f, a: [N.faqSessionAnswer.text] } : f))
  const posts = TEAM_POSTS.map((p) => findEntry(c, p)).filter((e): e is NonNullable<typeof e> => !!e)
  return (
    <>
      <Seo title={live.metaTitle} description={live.description} path="/" image={ogImageFor(c, '/')} />

      {/* Hero */}
      <section className="pb-12 pt-8 md:pb-24 md:pt-16">
        <div className="container-page split split--lead">
          <div className="split-aside">
            <Reveal><p className="eyebrow mb-5">{h.hero.eyebrow}</p></Reveal>
            <Reveal delay={0.08} y={28}>
              <h1 className="display-xl">
                {h.hero.lines.map((l, i) => <span key={i} className={`block ${l.dim ? 'text-grey' : ''}`}>{l.text}</span>)}
              </h1>
            </Reveal>
            <Reveal delay={0.18}><p className="lede mt-6 max-w-xl text-[1.1875rem] leading-[1.7rem]">{h.hero.lead}</p></Reveal>
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to={btsOver ? '/contact/' : '/#book'}>{h.hero.ctas[0].label}</Button>
                <Button to="/#services" variant="ghost" arrow={false}>{h.hero.ctas[1].label}</Button>
              </div>
              {!btsOver && <p className="mono mt-8 flex flex-wrap gap-x-5 gap-y-1 text-ink-muted">{h.hero.meta.map((m) => <span key={m}>{m}</span>)}</p>}
            </Reveal>
          </div>
          <Reveal delay={0.15} y={0} className="split-main"><DotField className="mx-auto w-full max-w-[520px]" /></Reveal>
        </div>
      </section>

      {/* Our Global Clients: live client logos (the "Trusted & Certified" heading and certification cards were removed on the owner's request, 12 Nov 2026) */}
      {clientLogos.length > 0 && (
        <section id="clients" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
          <div className="container-page">
            <p className="mono text-ink-muted">Our Global Clients</p>
            <div className="logo-marquee mt-6" role="group" aria-label="Our Global Clients">
              <ul className="logo-marquee-track">
                {[...clientLogos, ...clientLogos].map((l, k) => (
                  <li key={l.file + k} aria-hidden={k >= clientLogos.length || undefined} className="flex h-16 w-[170px] shrink-0 items-center justify-center rounded-md border border-line bg-white px-6">
                    <SiteImage image={l} priority ratio="auto" sizes="160px" className="h-8 w-auto max-w-full object-contain" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* BTS 2026 card (hidden after the event): owner's design. Soft shapes and a small dot grid sit away from the text. */}
      {!btsOver && <section id="bts" aria-labelledby="bts-title" className="scroll-anchor relative overflow-hidden border-y border-line bg-surface-raised">
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-q2m/10 md:size-[26rem]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-36 -left-28 size-80 rounded-full bg-q2m/10" />
        <div aria-hidden className="pointer-events-none absolute left-[max(1rem,calc(50%-41rem))] top-8 hidden h-10 w-28 bg-[radial-gradient(circle,var(--blue)_1.5px,transparent_1.6px)] [background-size:16px_14px] opacity-40 md:block" />
        <div className="container-page relative py-14 md:py-24">
          <Reveal>
            <div className="grid gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-12">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 rounded-full bg-tint px-4 py-2 text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-action">
                  <CalendarDays aria-hidden className="size-4" />{card.badge}
                </p>
                <h2 id="bts-title" className="display-lg mt-6">
                  {card.titleLead}
                  <span className="relative inline-block whitespace-nowrap text-action">
                    {card.accent}
                    <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-2.5 w-full text-q2m"><path d="M3 9 C 55 2, 145 2, 197 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
                  </span>
                  {card.titleTail}
                </h2>
                <p className="lede mt-6 max-w-xl text-ink-muted">{card.text}</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link to={BTS.path} className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-action px-7 font-medium text-on-action transition-colors hover:bg-q2m">
                    {card.cta}<ArrowUpRight aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <span aria-hidden className="hidden h-9 w-px bg-line sm:block" />
                  <p className="flex items-center gap-2 text-ink-muted"><Clock aria-hidden className="size-5" />{card.meta}</p>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-lg border border-line bg-surface-raised p-6 sm:p-8">
                  <div className="flex lg:justify-end">
                    <p className="inline-flex items-center gap-2 rounded-full bg-tint px-4 py-1.5 text-sm font-semibold text-action"><span aria-hidden className="size-2 rounded-full bg-q2m" />{btsDateRangeShort()}</p>
                  </div>
                  <dl className="-mb-5 mt-1 divide-y divide-line">
                    {card.facts.map((f) => { const Icon = f.icon === 'venue' ? MapPin : CalendarDays; return (
                      <div key={f.k} className="relative flex min-h-24 flex-col justify-center py-5 pl-[4.5rem]">
                        {/* the icon sits inside the label (<dt>) so the list keeps valid dt/dd structure */}
                        <dt className="text-[0.75rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                          <span aria-hidden className="absolute left-0 top-1/2 flex size-14 -translate-y-1/2 items-center justify-center rounded-md bg-tint text-action"><Icon className="size-6" /></span>
                          {f.k}
                        </dt>
                        <dd className="mt-1 font-display text-xl font-semibold">{f.v}</dd>
                      </div>
                    ) })}
                  </dl>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>}

      {/* See the work: live-site topic images; a tile with no matching image keeps the brand dot panel */}
      <section id="work" className="section scroll-anchor">
        <div className="container-page">
          <Head eyebrow={h.work.eyebrow} title={h.work.title} intro={workIntro} />
          <StaggerGroup className="mt-12 grid auto-rows-[minmax(150px,1fr)] grid-cols-2 gap-3 md:auto-rows-[minmax(180px,1fr)] md:grid-cols-4 md:gap-4">
            {tiles.map((t) => (
              <StaggerItem key={t.title} className={`relative min-h-[150px] overflow-hidden rounded-lg border border-line ${t.w2 ? 'col-span-2' : 'col-span-2 md:col-span-1'} ${t.h2 ? 'md:row-span-2' : ''}`}>
                {topicImg(WORK, t.title) ? <SiteImage image={topicImg(WORK, t.title)!} ratio="auto" sizes="(min-width:768px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-cover" /> : <DotPanel dark={t.dark} className="absolute inset-0" />}
                <div className="absolute inset-x-3 bottom-3 rounded-md bg-surface p-3 md:inset-x-4 md:bottom-4">
                  <span className="mb-1.5 inline-block rounded-sm bg-action px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-action">{t.tag}</span>
                  <b className="block font-display text-[0.9375rem] font-semibold leading-snug md:text-base">{t.title}</b>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <p className="mt-8"><TextLink to="/case-studies/">Read our published case studies</TextLink></p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <Head eyebrow={h.services.eyebrow} title={h.services.title} intro={h.services.intro} />
          <Reveal>
            <div className="mt-12 overflow-hidden rounded-lg border border-line">
              {h.services.items.filter((s) => s.feature).map((s) => (
                <article key={s.title} className="grid gap-8 bg-surface-raised p-6 md:p-10 lg:grid-cols-12 lg:gap-12">
                  <div className="lg:col-span-7">
                  {serviceTag(s.tag) && <span className="mb-4 inline-block rounded-sm bg-tint px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-action">{serviceTag(s.tag)}</span>}
                  <h3 className="max-w-3xl font-display text-[1.75rem] font-bold leading-tight">{s.title}</h3>
                  <p className="mt-4 max-w-3xl text-ink-muted">{s.text}</p>
                  <ul className="mt-6 grid gap-x-8 gap-y-2 md:grid-cols-2">{s.ticks.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-q2m" />{x}</li>)}</ul>
                  {SERVICE_PAGE[s.title] && <p className="mt-6"><TextLink to={SERVICE_PAGE[s.title]}>{`Read more about ${s.title}`}</TextLink></p>}
                  </div>
                  {topicImg(SERVICE_IMG, s.title) && <div className="lg:col-span-5"><SiteFrame image={topicImg(SERVICE_IMG, s.title)!} sizes="(min-width:1024px) 460px, 100vw" /></div>}
                </article>
              ))}
              <div className="grid gap-px border-t border-line bg-line md:grid-cols-2 lg:grid-cols-3">
                {h.services.items.filter((s) => !s.feature).map((s) => (
                  <article key={s.title} className="flex flex-col bg-surface p-6 md:p-8">
                    {topicImg(SERVICE_IMG, s.title) && <div className="mb-6"><SiteFrame image={topicImg(SERVICE_IMG, s.title)!} ratio="16/10" sizes="(min-width:1024px) 360px, (min-width:768px) 50vw, 100vw" /></div>}
                    <h3 className="font-display text-xl font-semibold leading-snug">{s.title}</h3>
                    <p className="mt-3 text-[0.9375rem] text-ink-muted">{s.text}</p>
                    <ul className="mt-5 space-y-2 text-[0.9375rem]">{s.ticks.map((x) => <li key={x} className="flex gap-3"><span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-q2m" />{x}</li>)}</ul>
                    {SERVICE_PAGE[s.title] && <p className="mt-auto pt-6"><TextLink to={SERVICE_PAGE[s.title]}>{`Read more about ${s.title}`}</TextLink></p>}
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <Head eyebrow={h.industries.eyebrow} title={h.industries.title} intro={h.industries.intro} />
          <StaggerGroup as="ul" className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {h.industries.items.map((i) => (
              <StaggerItem as="li" key={i.name}>
                {topicImg(INDUSTRY_IMG, i.name) ? <SiteFrame image={topicImg(INDUSTRY_IMG, i.name)!} ratio="4/3" sizes="(min-width:1024px) 360px, (min-width:768px) 50vw, 100vw" /> : <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line"><DotPanel /></div>}
                <h3 className="mt-5 font-display text-2xl font-semibold">{i.name}</h3>
                <p className="mt-2 text-ink-muted">{i.text}</p>
                <p className="mono mt-3 text-action">{i.refs}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* The Results Our Clients Measure: live home counters (labels neutral, values from the shared stats config) */}
      <section id="results" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <SectionHead title="The Results Our Clients Measure" />
          <StaggerGroup as="dl" className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((k) => (
              <StaggerItem key={k.key}><dd className="font-display text-5xl font-bold leading-none">{k.prefix}{k.value}{k.suffix}</dd><dt className="mt-3 text-[0.9375rem] text-ink-muted">{k.label}</dt></StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page split">
          <div className="split-aside"><SectionHead eyebrow={h.about.eyebrow} title={h.about.title} /></div>
          <div className="split-main space-y-6">
            {h.about.paras.map((p, i) => <Reveal key={i} delay={i * 0.05}><p className={i === 0 ? 'text-xl leading-8' : 'text-ink-muted'}>{p}</p></Reveal>)}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section id="approach" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <Head eyebrow={h.approach.eyebrow} title={h.approach.title} intro={h.approach.intro} />
          <StaggerGroup as="ol" className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {h.approach.steps.map((s) => (
              <StaggerItem as="li" key={s.num} className="relative border-t border-line pt-6 lg:border-t-0 lg:pt-0">
                <div aria-hidden className="mb-5 hidden items-center lg:flex"><span className="size-3 rounded-full bg-q2m" /><span className="ml-2 h-0.5 flex-1 bg-ink" /></div>
                {topicImg(APPROACH_IMG, s.num) && <div className="mb-5"><SiteFrame image={topicImg(APPROACH_IMG, s.num)!} ratio="1/1" sizes="(min-width:1024px) 260px, (min-width:768px) 45vw, 100vw" /></div>}
                <span className="mono text-action">{s.num}</span>
                <h3 className="mt-2 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-[0.9375rem] text-ink-muted">{s.text}</p>
                <p className="mono mt-4">{s.out}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-surface-raised py-12 md:py-24 lg:py-32">
        <div className="container-page">
          <Head eyebrow={h.principles.eyebrow} title={h.principles.title} intro={h.principles.intro} />
          <StaggerGroup className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {h.principles.items.map((p) => (
              <StaggerItem key={p.title} className="border-t border-line pt-5"><h3 className="font-display text-xl font-semibold">{p.title}</h3><p className="mt-3 text-[0.9375rem] text-ink-muted">{p.text}</p></StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Technology */}
      <section className="section">
        <div className="container-page">
          <Head eyebrow={h.stack.eyebrow} title={h.stack.title} intro={h.stack.intro} />
          <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {h.stack.groups.map((g) => (
              <StaggerItem key={g.title} className="rounded-md border border-line bg-surface-raised p-6"><h3 className="font-display text-lg font-semibold">{g.title}</h3><p className="mt-3 text-[0.9375rem] text-ink-muted">{g.text}</p></StaggerItem>
            ))}
          </StaggerGroup>
        </div>
        <div aria-hidden className="marquee mt-12 border-y border-line py-5">
          <div className="marquee-track">{[...h.stack.words, ...h.stack.words].map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
      </section>

      {/* The 30-minute session (BTS: hidden after the event) */}
      {!btsOver && <section className="pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <Head eyebrow={session.eyebrow} title={session.title} intro={session.intro} />
          <StaggerGroup className="mt-12 grid gap-4 md:grid-cols-3">
            {session.steps.map((s) => (
              <StaggerItem key={s.title} className="rounded-lg border border-line bg-surface-raised p-6 md:p-8">
                <span className="mono text-action">{s.min}</span><h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3><p className="mt-3 text-ink-muted">{s.text}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>}

      {/* From The Team: the three live home blog posts with their live thumbnails */}
      {posts.length > 0 && (
        <section id="team-posts" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
          <div className="container-page">
            <SectionHead title="From The Team" />
            <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">{posts.map((e, i) => <PostCard key={e.path} e={e} i={i} />)}</div>
            <p className="mt-10"><TextLink to="/blogs/">All insights</TextLink></p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page split">
          <div className="split-aside"><SectionHead eyebrow={h.faq.eyebrow} title={h.faq.title} lede={faqIntro} /></div>
          <div className="split-main"><Accordion items={faqItems} /></div>
        </div>
      </section>

      {/* Book a session (hidden after the event) */}
      {!btsOver && <section id="book" className="scroll-anchor pb-12 md:pb-24 lg:pb-32">
        <div className="container-page">
          <Reveal>
            <div className="split rounded-lg bg-tint p-6 md:p-12">
              <div className="split-aside">
                <p className="eyebrow mb-4">{h.book.eyebrow}</p>
                <h2 className="display-md">{h.book.title}</h2>
                <p className="mt-5 text-ink-muted">{h.book.intro}</p>
                <p className="mono mt-8">Email: <a className="text-action underline underline-offset-4" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
              </div>
              <div className="split-main"><BookingForm industries={h.book.industries} placeholder={h.book.placeholder} note={h.book.note} /></div>
            </div>
          </Reveal>
        </div>
      </section>}
    </>
  )
}
