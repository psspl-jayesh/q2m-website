import { Link } from 'react-router-dom'
import { attachLabels, sectionize, groupify, useContent, type Entry, type Block, type Group, type Section } from '@/lib/content'
import { topicImagesFor } from '@/lib/topicImages'
import { heroImage, imagesBySection, keyOf, ogImageFor, pageImages, type ManifestImage } from '@/lib/images'
import { Accordion, Breadcrumbs, Button, HeroImage, type SiteImg, Reveal, SectionHead, Seo, SiteFrame, SiteImage, StaggerGroup, StaggerItem } from '@/components/ui'
import DotArrow from '@/components/DotArrow'
import { NAV, SITE_URL } from '@/lib/site'
import { areaServedIndia, indiaDescription, indiaTitle } from '@/lib/seo'
import ctas from '@/content/shared/ctas.json'
import ui from '@/content/shared/ui.json'

export const anchor = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/** Link target from the live site: internal paths stay in the app; "#" and empty targets are dead links and return null. */
export function resolveHref(h?: string | null): string | null {
  if (!h || h === '#') return null
  const p = h.replace(/^https?:\/\/(www\.)?q2msolutions\.com/i, '')
  if (/^https?:/i.test(p)) return p
  return p.endsWith('/') || p.includes('#') || p.includes('?') ? p : p + '/'
}

/** Brand panel used when the live page has no hero image: black slab, dot arrow in the corner, on-page index. */
function OutlinePanel({ title, items, hasFaq }: { title: string; items: string[]; hasFaq: boolean }) {
  const row = 'group flex min-h-12 items-center gap-4 py-3 transition-colors hover:text-action-soft'
  return (
    <div className="on-dark rounded-lg bg-block p-6 text-ink-inverse sm:p-8">
      <DotArrow pitch={12} className="mb-6 ml-auto block h-auto w-[84px]" />
      <p className="eyebrow mb-4">{ui.onThisPage}</p>
      <p className="sr-only">{title}</p>
      <ol className="divide-y divide-block-line border-y border-block-line">
        {items.map((t, k) => (
          <li key={t}><a href={`#${anchor(t)}`} className={row}><span className="mono text-block-muted">{String(k + 1).padStart(2, '0')}</span><span className="text-[0.9375rem] leading-snug">{t}</span></a></li>
        ))}
        {hasFaq && <li><a href="#faq" className={row}><span className="mono text-block-muted">FAQ</span><span className="text-[0.9375rem]">{ui.faqFallback}</span></a></li>}
      </ol>
    </div>
  )
}

const groupOfNav = (slug: string) => NAV.find((g) => g.items.some((i) => i.href === `/${slug}/`))
const isFaqHeading = (t: string) => /^faq$|questions/i.test(t.trim())

/** Hero content from the live page: eyebrow + H1, lede, button, and the small extra lines under it, in live order. */
export function splitHero(blocks: Block[]) {
  const h1i = blocks.findIndex((b) => b.t === 'h1')
  const h1 = blocks[h1i]
  const rest = h1i >= 0 ? blocks.slice(h1i + 1) : blocks
  const bodyStart = rest.findIndex((b) => b.t === 'h2')
  const heroBlocks = bodyStart >= 0 ? rest.slice(0, bodyStart) : rest
  const body = bodyStart >= 0 ? rest.slice(bodyStart) : []
  const lede = heroBlocks.find((b) => b.t === 'p')
  return { h1, lede, btn: heroBlocks.find((b) => b.t === 'btn'), meta: heroBlocks.filter((b) => b !== lede && (b.t === 'p' || b.t === 'h6' || b.t === 'li')), body }
}

/** Sections of a page (live order) with their images from the manifest, then the FAQ. Shared by every page template. */
export function PageBody({ entry, secs, images = true }: { entry: Entry; secs: Section[]; images?: boolean }) {
  const c = useContent()
  const faqSec = entry.faqs.length ? [...secs].reverse().find((x) => isFaqHeading(x.title) && !x.blocks.some((b) => b.t !== 'img')) : undefined
  const shown = secs.filter((x) => x !== faqSec)
  // images=false: a page whose image placement is awaiting approval (the home page) renders without manifest images
  const sectionImgs = images ? imagesBySection(c, entry.path, shown.map((x) => x.title)) : new Map<string, ManifestImage[]>()
  // Prose sections whose live page has no image get a topic image (pages with images=false get none)
  const onPage = images ? [...sectionImgs.values()].flat().concat(pageImages(c, entry.path)) : []
  const pool = images ? topicImagesFor(entry.path, onPage) : []
  let next = 0
  const topics = shown.map((s) => (layoutOf(s, sectionImgs.get(keyOf(s.title)) ?? []) === 'prose-bare' ? pool[next++] : undefined))
  return (
    <>
      {shown.map((s, i) => <div key={s.title + i} id={anchor(s.title)} className="scroll-anchor"><SectionBlock s={s} i={i} imgs={sectionImgs.get(keyOf(s.title)) ?? []} topic={topics[i]} /></div>)}
      {entry.faqs.length > 0 && (
        <section id="faq" className="section scroll-anchor border-t hairline">
          <div className="container-page split">
            <div className="split-aside"><SectionHead eyebrow={faqSec?.eyebrow} title={faqSec?.title ?? ui.faqFallback} /></div>
            <div className="split-main"><Accordion items={entry.faqs} /></div>
          </div>
        </section>
      )}
    </>
  )
}

export default function ServicePage({ entry }: { entry: Entry }) {
  const c = useContent()
  const { h1, lede, btn, meta, body } = splitHero(entry.blocks)
  const hero = heroImage(c, entry.path) // the banner shown under the title on the live page (manifest is the source of truth)
  const secs = sectionize(body)
  const nav = groupOfNav(entry.slug)
  const related = (nav?.items ?? []).filter((l) => l.href !== entry.path && !l.external).slice(0, 6)
  const title = indiaTitle(entry.metaTitle || entry.title)
  const description = indiaDescription(entry.description)
  const crumb = entry.furniture?.breadcrumb?.length ? entry.furniture.breadcrumb[entry.furniture.breadcrumb.length - 1] : entry.title
  const heroHref = resolveHref(btn?.href) ?? ctas.hero.href

  return (
    <>
      <Seo title={title} description={description} path={entry.path} image={ogImageFor(c, entry.path)}
        jsonLd={[
          { '@context': 'https://schema.org', '@type': 'Service', name: entry.title, description, areaServed: areaServedIndia, url: SITE_URL + entry.path, provider: { '@type': 'Organization', name: 'Q2M Solutions', url: SITE_URL } },
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' }, { '@type': 'ListItem', position: 2, name: entry.title, item: SITE_URL + entry.path }] },
          ...(entry.faqs.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entry.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.join(' ') } })) }] : []),
        ]} />

      {/* Hero */}
      <section className="pt-8 pb-14 md:pt-14 md:pb-24">
        <div className="container-page">
          <Breadcrumbs trail={[{ label: entry.furniture?.breadcrumb?.[0] ?? 'Home', to: '/' }, { label: crumb }]} />
          <div className="mt-10 split split--lead">
            <div className="split-aside">
              {h1?.eyebrow && <Reveal><p className="eyebrow mb-5">{h1.eyebrow}</p></Reveal>}
              <Reveal delay={0.07} y={26}><h1 className="display-lg">{h1?.text ?? entry.title}</h1></Reveal>
              {lede && <Reveal delay={0.16}><p className="lede mt-6 max-w-xl">{lede.text}</p></Reveal>}
              <Reveal delay={0.24}>
                <div className="mt-8 flex flex-wrap gap-3"><Button to={heroHref}>{btn?.text ?? ctas.hero.label}</Button></div>
                {meta.length > 0 && <p className="mono mt-8 flex flex-wrap gap-x-5 gap-y-1 text-ink-muted">{meta.map((m, k) => <span key={k}>{m.text}</span>)}</p>}
              </Reveal>
            </div>
            <div className="split-main">
              {hero
                ? <HeroImage image={hero} />
                : <Reveal delay={0.2} y={28}><OutlinePanel title={entry.title} items={secs.map((x) => x.title).filter((t) => !isFaqHeading(t)).slice(0, 7)} hasFaq={entry.faqs.length > 0} /></Reveal>}
            </div>
          </div>
        </div>
      </section>

      <PageBody entry={entry} secs={secs} />

      {related.length > 0 && (
        <section className="section border-t hairline bg-surface-raised !py-16 md:!py-20">
          <div className="container-page">
            <p className="eyebrow mb-6">{ui.relatedIn} {nav!.label}</p>
            <ul className="flex flex-wrap gap-2.5">
              {related.map((l) => <li key={l.href}><Link to={l.href} className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm hover:border-q2m hover:text-action">{l.label}</Link></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}

/* Layout chosen from the shape of the content, not one template for every section.
   Images come from the manifest (same section, same order, natural aspect ratio as on the live page). */
function Gallery({ media }: { media: ManifestImage[] }) {
  return (
    <StaggerGroup as="ul" className={`mt-12 grid gap-4 ${media.length === 1 ? '' : media.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {media.map((m) => <StaggerItem as="li" key={m.file + m.order}><SiteFrame image={m} sizes="(min-width:1024px) 400px, 100vw" /></StaggerItem>)}
    </StaggerGroup>
  )
}

const dot = <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-q2m" />
const Bullets = ({ items, className = 'mt-4 space-y-2 text-[0.9375rem] text-ink-muted' }: { items: string[]; className?: string }) => (
  <ul className={className}>{items.map((it) => <li key={it} className="flex gap-2.5">{dot}{it}</li>)}</ul>
)
const Pills = ({ labels, dark }: { labels: string[]; dark?: boolean }) => (
  <ul className="flex flex-wrap gap-2.5">{labels.map((l) => <li key={l} className={`rounded-full border px-4 py-2 text-sm ${dark ? 'border-block-line' : 'border-line bg-surface text-ink'}`}>{l}</li>)}</ul>
)
/** Everything in a section's lead beyond the first paragraph (more paragraphs, a list, label lines). */
function LeadExtra({ lead, dark }: { lead: Group; dark?: boolean }) {
  const extra = lead.paras.slice(1)
  if (!extra.length && !lead.items.length && !lead.labels.length) return null
  return (
    <div className={`mt-8 max-w-3xl space-y-4 ${dark ? 'text-block-muted' : 'text-ink-muted'}`}>
      {extra.map((p) => <p key={p}>{p}</p>)}
      {lead.items.length > 0 && <Bullets items={lead.items} className="space-y-2 text-[0.9375rem]" />}
      {lead.labels.length > 0 && <Pills labels={lead.labels} dark={dark} />}
    </div>
  )
}
const Label = ({ g, dark }: { g: Group; dark?: boolean }) => (g.label ? <span className={`mono mb-2 block ${dark ? 'text-action-soft' : 'text-action'}`}>{g.label}</span> : null)

/**
 * Which layout SectionBody picks for a section (same conditions, same order). 'prose-bare' = editorial prose with no image of its own
 * and enough text to leave the right-hand column visibly empty: those sections get a topic image.
 */
function layoutOf(s: Section, imgs: ManifestImage[]): 'logos' | 'gallery' | 'tags' | 'bullets' | 'process' | 'capability' | 'prose' | 'prose-bare' {
  const { lead, groups } = groupify(attachLabels(s.blocks))
  const logos = imgs.filter((m) => m.role === 'logo')
  const media = imgs.filter((m) => m.role !== 'logo')
  const textBlocks = s.blocks.filter((b) => b.t !== 'img')
  const paras = s.blocks.filter((b) => b.t === 'p')
  if (textBlocks.length === 0 && logos.length > 0) return 'logos'
  if (textBlocks.length === 0 && media.length > 0) return 'gallery'
  if (paras.length >= 6 && paras.every((p) => p.text!.length < 48) && groups.length === 0) return 'tags'
  if (groups.some((g) => g.items.length >= 2)) return 'bullets'
  if (/approach|process|how we|methodology|work/i.test(s.title) && groups.length >= 3 && groups.every((g) => g.paras.length)) return 'process'
  if (groups.length >= 3) return 'capability'
  const chars = lead.paras.join('').length + lead.items.join('').length + groups.reduce((n, g) => n + g.paras.join('').length + g.items.join('').length, 0)
  return media.length === 0 && chars >= 250 && !/^(faq|frequently asked|questions)/i.test(s.title) ? 'prose-bare' : 'prose'
}

function SectionBody({ s, i, imgs = [], topic }: { s: Section; i: number; imgs?: ManifestImage[]; topic?: SiteImg }) {
  const { lead, groups } = groupify(attachLabels(s.blocks))
  const logos = imgs.filter((m) => m.role === 'logo')
  const media = imgs.filter((m) => m.role !== 'logo')
  const textBlocks = s.blocks.filter((b) => b.t !== 'img')
  const paras = s.blocks.filter((b) => b.t === 'p')
  const shortParas = paras.length >= 6 && paras.every((p) => p.text!.length < 48) && groups.length === 0
  const isProcess = /approach|process|how we|methodology|work/i.test(s.title) && groups.length >= 3 && groups.every((g) => g.paras.length)
  const hasBullets = groups.some((g) => g.items.length >= 2)
  // one image per card (e.g. one image per industry): attach in live order
  const attach = media.length >= 2 && media.length === groups.length
  const cardImg = (k: number) => attach ? <div className="mb-5"><SiteFrame image={media[k]} sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" /></div> : null
  const gallery = !attach && media.length > 0 ? <Gallery media={media} /> : null
  // logos that sit inside a text section (e.g. client logos under a heading) form a strip after the text, labelled with the live label line
  const stripLabel = [...lead.labels, ...groups.flatMap((g) => g.labels)].find((l) => /client|partner|trusted|certif/i.test(l))
  const logoStrip = textBlocks.length > 0 && logos.length > 0 ? (
    <div className="mt-14 border-t hairline pt-8">
      {stripLabel && <p className="eyebrow mb-6">{stripLabel}</p>}
      <StaggerGroup as="ul" className="grid grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">{logos.map((m) => <StaggerItem as="li" key={m.file + m.order}><SiteImage image={m} sizes="120px" className="mx-auto max-h-10 w-auto object-contain opacity-70 grayscale" /></StaggerItem>)}</StaggerGroup>
    </div>
  ) : null
  const tail = <>{gallery}{logoStrip}</>

  // Logo strip (client logos, partner badges)
  if (textBlocks.length === 0 && logos.length > 0) return (
    <section aria-label={s.title} className="border-y hairline bg-surface-raised py-12"><div className="container-page">
      <p className="eyebrow mb-8">{s.title}</p>
      <StaggerGroup as="ul" className="grid grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">{logos.map((m) => <StaggerItem as="li" key={m.file + m.order}><SiteImage image={m} sizes="120px" className="mx-auto max-h-10 w-auto object-contain opacity-70 grayscale" /></StaggerItem>)}</StaggerGroup>
    </div></section>
  )
  // Heading with images only
  if (textBlocks.length === 0 && media.length > 0) return (
    <section className="section"><div className="container-page"><SectionHead eyebrow={s.eyebrow} title={s.title} /><Gallery media={media} /></div></section>
  )

  // Tag wall
  if (shortParas) return (
    <section className="section"><div className="container-page"><SectionHead eyebrow={s.eyebrow} title={s.title} /><StaggerGroup as="ul" className="mt-10 flex flex-wrap gap-2.5">{paras.map((p) => <StaggerItem as="li" key={p.text} className="rounded-full border border-line bg-surface px-4 py-2 text-sm">{p.text}</StaggerItem>)}</StaggerGroup>{tail}</div></section>
  )

  // Industry / bullet groups → hairline columns
  if (hasBullets) return (
    <section className="section bg-surface-raised"><div className="container-page">
      <div className="grid gap-10 lg:grid-cols-12"><div className="lg:col-span-7"><SectionHead eyebrow={s.eyebrow} title={s.title} lede={lead.paras[0]} /><LeadExtra lead={lead} /></div></div>
      <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, k) => (
          <Reveal key={g.title + k} delay={(k % 3) * 0.1}><div className={attach ? '' : 'border-t border-line pt-5'}>{cardImg(k)}<div className={attach ? 'border-t border-line pt-5' : ''}><Label g={g} /><h3 className="font-display text-2xl">{g.title}</h3>
            {g.paras.map((p) => <p key={p} className="mt-3 text-[0.9375rem] text-ink-muted">{p}</p>)}
            {g.items.length > 0 && <Bullets items={g.items} />}{g.labels.length > 0 && <div className="mt-4"><Pills labels={g.labels} /></div>}</div></div></Reveal>
        ))}
      </div>
      {tail}
    </div></section>
  )

  // Process → dark numbered steps
  if (isProcess) return (
    <section className="on-dark bg-block py-20 text-ink-inverse md:py-32"><div className="container-page">
      <SectionHead dark eyebrow={s.eyebrow} title={s.title} lede={lead.paras[0]} />
      <LeadExtra lead={lead} dark />
      <StaggerGroup as="ol" className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, k) => (<StaggerItem as="li" key={g.title + k} className="border-t border-block-line pt-6">{cardImg(k)}<span className="mono text-action-soft">{g.label ?? `0${k + 1}`}</span><h3 className="mt-3 font-display text-2xl">{g.title}</h3>{g.paras.map((p) => <p key={p} className="mt-3 text-block-muted">{p}</p>)}{g.items.length > 0 && <Bullets items={g.items} className="mt-4 space-y-2 text-[0.9375rem] text-block-muted" />}</StaggerItem>))}
      </StaggerGroup>
      {tail}
    </div></section>
  )

  // Capability index (3+ titled groups) → numbered rows, alternating with 2-col grid
  if (groups.length >= 3) {
    const rows = i % 2 === 0
    return (
      <section className="section"><div className="container-page">
        <div className="split split--lead"><div className="split-aside"><SectionHead eyebrow={s.eyebrow} title={s.title} /></div>{lead.paras[0] && <p className="split-main lede">{lead.paras[0]}</p>}</div>
        <LeadExtra lead={lead} />
        {rows ? (
          <>
            {gallery ?? (attach ? <Gallery media={media} /> : null)}
            <div role="list" className="mt-14 border-t hairline">
              {groups.map((g, k) => (<Reveal key={g.title + k}><div role="listitem" className="grid gap-3 border-b hairline py-7 md:grid-cols-12 md:gap-8"><span className="mono text-action md:col-span-1">{g.label ?? String(k + 1).padStart(2, '0')}</span><h3 className="font-display text-2xl md:col-span-4 md:text-3xl">{g.title}</h3><div className="text-ink-muted md:col-span-7">{g.paras.map((p) => <p key={p} className="mb-2">{p}</p>)}{g.items.length > 0 && <Bullets items={g.items} className="mt-2 space-y-2 text-[0.9375rem]" />}{g.labels.length > 0 && <div className="mt-3"><Pills labels={g.labels} /></div>}</div></div></Reveal>))}
            </div>
          </>
        ) : (
          <>
            {gallery}
            <div className="mt-14 grid gap-px overflow-hidden rounded-md bg-line sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g, k) => (<Reveal key={g.title + k} delay={(k % 3) * 0.08}><div className="h-full bg-surface p-7">{cardImg(k)}<Label g={g} /><h3 className="font-display text-2xl">{g.title}</h3><div className="mt-3 text-[0.9375rem] text-ink-muted">{g.paras.map((p) => <p key={p} className="mb-2">{p}</p>)}{g.items.length > 0 && <Bullets items={g.items} className="mt-2 space-y-2" />}{g.labels.length > 0 && <div className="mt-3"><Pills labels={g.labels} /></div>}</div></div></Reveal>))}
            </div>
          </>
        )}
        {logoStrip}
      </div></section>
    )
  }

  // Editorial prose; the section's images sit in the right-hand column in live order
  const g0: Group = lead
  return (
    <section className="section"><div className="container-page split split--lead">
      <div className="split-aside">
        {s.eyebrow && <p className="eyebrow mb-4">{s.eyebrow}</p>}
        <h2 className="display-md">{s.title}</h2>
        <div className="prose-q2m mt-6 text-ink-muted">
          {g0.paras.map((p) => <p key={p}>{p}</p>)}
          {g0.items.length > 0 && <ul>{g0.items.map((x) => <li key={x}>{x}</li>)}</ul>}
          {g0.labels.length > 0 && <Pills labels={g0.labels} />}
          {groups.map((g, k) => (<div key={g.title + k}>{g.label && <span className="mono text-action">{g.label}</span>}<h3 className="text-ink">{g.title}</h3>{g.paras.map((p) => <p key={p}>{p}</p>)}{g.items.length > 0 && <ul>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>}{g.labels.length > 0 && <Pills labels={g.labels} />}</div>))}
        </div>
      </div>
      {media.length > 0 && (
        <div className="split-main space-y-4">
          {media.map((m) => <SiteFrame key={m.file + m.order} image={m} sizes="(min-width:1024px) 520px, 100vw" />)}
        </div>
      )}
      {media.length === 0 && topic && <div className="split-main"><SiteFrame image={topic} sizes="(min-width:1024px) 520px, 100vw" /></div>}
      {logoStrip && <div className="lg:col-span-12">{logoStrip}</div>}
    </div></section>
  )
}

/** Buttons, stats and testimonials that sit in a section on the live page. Stat values come from the shared stats config. */
function SectionExtras({ s }: { s: Section }) {
  const btns = s.blocks.filter((b) => b.t === 'btn')
  const stats = s.blocks.filter((b) => b.t === 'stat')
  const quotes = s.blocks.filter((b) => b.t === 'quote')
  if (!btns.length && !stats.length && !quotes.length) return null
  return (
    <div className="container-page -mt-6 pb-12 md:-mt-12 md:pb-20">
      {stats.length > 0 && (
        <StaggerGroup as="dl" className="mb-10 grid gap-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((b, k) => (
            <StaggerItem key={k}><dd className="font-display text-5xl font-bold leading-none">{b.prefix}{b.value}{b.suffix}</dd><dt className="mt-3 text-[0.9375rem] text-ink-muted">{b.text}</dt></StaggerItem>
          ))}
        </StaggerGroup>
      )}
      {quotes.length > 0 && (
        <StaggerGroup as="ul" className="mb-10 grid gap-6 md:grid-cols-3">
          {quotes.map((q, k) => (
            <StaggerItem as="li" key={k}><figure className="h-full rounded-lg border border-line bg-surface-raised p-6">
              <blockquote className="text-[0.9375rem] leading-relaxed">{q.text}</blockquote>
              <figcaption className="mt-5 border-t border-line pt-4"><span className="block font-display text-lg font-semibold">{q.name}</span>{q.role && <span className="mono text-ink-muted">{q.role}</span>}</figcaption>
            </figure></StaggerItem>
          ))}
        </StaggerGroup>
      )}
      {btns.map((b, k) => { const h = resolveHref(b.href); return h ? <div key={k} className="mt-2"><Button to={h}>{b.text}</Button></div> : null })}
    </div>
  )
}

export function SectionBlock(props: { s: Section; i: number; imgs?: ManifestImage[]; topic?: SiteImg }) {
  return <><SectionBody {...props} /><SectionExtras s={props.s} /></>
}
