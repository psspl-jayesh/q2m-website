import { useRef } from 'react'
import { Link } from 'react-router-dom'
import d from '@/data/smart-glasses-page.json'
import { Img, Seo } from '@/components/ui'
import { DiscoveryForm, Ico, Pill, RingBadge, useReveal } from '@/components/GlassesDesign'
import { COMPANY, ADDRESS } from '@/config/locale'
import { BTS, useBtsPhase } from '@/config/bts'
import { useContent, type Entry } from '@/lib/content'
import { ogImageFor } from '@/lib/images'
import { SITE_URL } from '@/lib/site'
import { areaServedIndia } from '@/lib/seo'
import { phoneHref } from '@/lib/format'
import '@/styles/home-glasses.css'
import '@/styles/smart-glasses-page.css'

/**
 * Smart glasses service page at /smart-glasses-ar-wearable-app-development-services/ (replaces the generic service template for this
 * one URL; the old content stays in src/content and in the backup tag, see docs/BACKUP_OLD_DESIGN.md).
 * Design: design/smart-glasses-page/services/smart-glasses-app-development.html; same sections, text, images and animations,
 * built as React components. Text: src/data/smart-glasses-page.json. The site header and footer stay the shared ones; company
 * details come from src/config/locale.ts. The BTS line in the FAQ changes after the event (src/config/bts.ts).
 */
export default function SmartGlassesPage({ entry }: { entry: Entry }) {
  const c = useContent()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const btsOver = useBtsPhase() === 'after'
  // BTS line: booth wording only when BTS.liveDemos is on, neutral wording otherwise, and no BTS mention after the event
  const faq = d.faq.items.map((f) => ({ q: f.q, a: btsOver && 'afterBts' in f && f.afterBts ? f.afterBts : !BTS.liveDemos && 'neutral' in f && f.neutral ? f.neutral : f.a }))
  const url = SITE_URL + entry.path
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'Service', name: d.seo.serviceName, description: d.seo.description, url, areaServed: areaServedIndia,
      provider: {
        '@type': 'Organization', name: COMPANY.legalName, url: SITE_URL, ...(COMPANY.phone ? { telephone: phoneHref(COMPANY.phone).replace('tel:', '') } : {}),
        address: { '@type': 'PostalAddress', streetAddress: `${ADDRESS.addressLine1}, ${ADDRESS.addressLine2}`, addressLocality: ADDRESS.city, addressRegion: ADDRESS.state, postalCode: ADDRESS.pinCode, addressCountry: 'IN' },
      },
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: d.breadcrumb.home, item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: d.breadcrumb.services, item: SITE_URL + d.breadcrumb.servicesHref },
        { '@type': 'ListItem', position: 3, name: d.breadcrumb.current, item: url },
      ],
    },
  ]
  return (
    <div className="hg sgp" ref={root}>
      <Seo title={d.seo.title} description={d.seo.description} path={entry.path} image={ogImageFor(c, entry.path)} jsonLd={jsonLd} />

      {/* Hero */}
      <section className="hero" aria-labelledby="sgp-title"><div className="w">
        <div>
          <nav className="crumb" aria-label="Breadcrumb"><ol>
            <li><Link to="/">{d.breadcrumb.home}</Link></li>
            <li><Link to={d.breadcrumb.servicesHref}>{d.breadcrumb.services}</Link></li>
            <li><span aria-current="page">{d.breadcrumb.current}</span></li>
          </ol></nav>
          <Pill>{d.hero.pill}</Pill>
          <h1 id="sgp-title">{d.hero.titleBefore}<em>{d.hero.titleAccent}</em>{d.hero.titleAfter}</h1>
          <p className="lead">{d.hero.lead}</p>
          <div className="cta">
            <a className="btn btn-p" href={d.hero.primary.href}>{d.hero.primary.label} <span aria-hidden="true">&#8594;</span></a>
            <a className="btn btn-g" href={d.hero.secondary.href}>{d.hero.secondary.label}</a>
          </div>
          <ul className="trust">{d.hero.trust.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="hvis">
          <div className="ph"><Img src={d.hero.image.file} alt={d.hero.image.alt} eager sizes="(min-width:1200px) 552px, (min-width:900px) 46vw, 100vw" /></div>
          <div className="chip-f"><Ico name="chart" /><span>{d.hero.chip.title}<small>{d.hero.chip.sub}</small></span></div>
          <RingBadge text={d.hero.badge} id="sgp-ring" />
        </div>
      </div></section>

      {/* Capability marquee (decorative: the same words are in the sections below) */}
      <div className="mq" aria-hidden="true"><div className="tr">{[...d.marquee, ...d.marquee].map((m, i) => <span key={i}>{m}</span>)}</div></div>

      {/* Six building blocks */}
      <section className="sec" id="capabilities"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.capabilities.pill}</Pill><h2>{d.capabilities.title}</h2><p>{d.capabilities.intro}</p></div>
        <div className="cap6">{d.capabilities.items.map((x) => <article className="scard" data-reveal key={x.title}><Ico name={x.icon} soft /><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
      </div></section>

      {/* Use cases by industry */}
      <section className="sec sec-s" id="use-cases"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.useCases.pill}</Pill><h2>{d.useCases.title}</h2><p>{d.useCases.intro}</p></div>
        <div className="bento">{d.useCases.tiles.map((t, i) => {
          const cls = `bt ${t.size}`.trim()
          if (t.kind === 'text') return <div className={`${cls} txt${'dark' in t && t.dark ? ' dark' : ''}`} data-reveal key={i}><h3>{t.title}</h3><p>{t.text}</p></div>
          return (
            <figure className={cls} data-reveal key={i}>
              <Img src={t.file!} alt={t.alt ?? ''} position={t.position ?? 'center'} sizes={t.size.includes('w2') ? '(min-width:900px) 584px, 100vw' : '(min-width:900px) 290px, (min-width:560px) 50vw, 100vw'} />
              {t.caption && <figcaption className="cp"><span>{t.tag}</span><b>{t.caption}</b></figcaption>}
            </figure>
          )
        })}</div>
      </div></section>

      {/* Which glasses fit the job */}
      <section className="sec" id="devices"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.devices.pill}</Pill><h2>{d.devices.title}</h2><p>{d.devices.intro}</p></div>
        {/* the table scrolls sideways on small screens, so keyboard users must be able to focus it (WCAG 2.1.1, axe scrollable-region-focusable) */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div className="dtbl" data-reveal tabIndex={0} role="region" aria-label={d.devices.title}>
          <table>
            <thead><tr>{d.devices.columns.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>{d.devices.rows.map(([type, ...cells]) => <tr key={type}><th scope="row">{type}</th>{cells.map((v, k) => <td key={k}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <ul className="logos l4" data-reveal>{d.devices.logos.map((l) => (
          <li key={l.file}>{l.file.endsWith('.svg') ? <img src={l.file} alt={l.alt} width={l.w} height={l.h} loading="lazy" decoding="async" /> : <Img src={l.file} alt={l.alt} sizes="220px" />}</li>
        ))}</ul>
        <p className="disc">{d.devices.disclaimer}</p>
      </div></section>

      {/* Four parts */}
      <section className="sec dk" id="how"><div className="w">
        <div className="hdr c" data-reveal><Pill dark>{d.how.pill}</Pill><h2>{d.how.title}</h2><p>{d.how.intro}</p></div>
        <ol className="flow" data-reveal>{d.how.parts.map((p, i) => <li className="fnode" key={p.title}><b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b><h3>{p.title}</h3><p>{p.text}</p></li>)}</ol>
        <p className="flow-note">{d.how.note}</p>
      </div></section>

      {/* Pilot */}
      <section className="sec" id="pilot"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.pilot.pill}</Pill><h2>{d.pilot.title}</h2></div>
        <ol className="proc">{d.pilot.steps.map((s, i) => (
          <li className="step" data-reveal key={s.title}>
            <div className="im"><Img src={s.image} alt="" sizes="(min-width:1000px) 280px, (min-width:560px) 50vw, 100vw" /><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span></div>
            <div className="tx"><h3>{s.title}</h3><p>{s.text}</p></div>
          </li>
        ))}</ol>
      </div></section>

      {/* Practical things */}
      <section className="sec dk"><div className="w">
        <div className="hdr c" data-reveal><Pill dark>{d.practical.pill}</Pill><h2>{d.practical.title}</h2></div>
        <div className="cap6">{d.practical.items.map((x) => <article className="dcard" data-reveal key={x.title}><Ico name={x.icon} /><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
      </div></section>

      {/* Measuring results */}
      <section className="sec"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.measure.pill}</Pill><h2>{d.measure.title}</h2><p>{d.measure.intro}</p></div>
        <ul className="meas">{d.measure.items.map((m) => <li data-reveal key={m.title}><h3>{m.title}</h3><p>{m.text}</p></li>)}</ul>
      </div></section>

      {/* FAQ */}
      <section className="sec sec-s" id="faq"><div className="w">
        <div className="hdr c" data-reveal><Pill>{d.faq.pill}</Pill><h2>{d.faq.title}</h2></div>
        <div className="fq">{faq.map((f) => <details data-reveal key={f.q}><summary>{f.q}<i aria-hidden="true">+</i></summary><p>{f.a}</p></details>)}</div>
      </div></section>

      {/* Related services */}
      <section className="sec pb0"><div className="w">
        <div className="hdr" data-reveal><Pill>{d.related.pill}</Pill><h2>{d.related.title}</h2></div>
        <div className="rel">{d.related.items.map((r) => (
          <article className="scard" data-reveal key={r.title}><Ico name={r.icon} soft /><h3>{r.title}</h3><p>{r.text}</p>
            {r.href.startsWith('/')
              ? <Link className="more" to={r.href}>{d.related.more} <span aria-hidden="true">&#8594;</span><span className="sr-only">: {r.title}</span></Link>
              : <a className="more" href={r.href}>{d.related.more} <span aria-hidden="true">&#8594;</span><span className="sr-only">: {r.title}</span></a>}
          </article>
        ))}</div>
      </div></section>

      {/* Contact */}
      <section className="sec" id="contact"><div className="w"><div className="ct" data-reveal>
        <div>
          <Pill dark>{d.contact.pill}</Pill><h2 className="mt16">{d.contact.title}</h2><p style={{ marginTop: 14 }}>{d.contact.intro}</p>
          <ul><li>{`Based in ${ADDRESS.city}, ${ADDRESS.state}${d.contact.pointsAfterCity}`}</li>{d.contact.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <DiscoveryForm companyLabel="Company" messageLabel="The workflow you want to discuss" placeholder={d.contact.placeholder} submit={d.contact.submit} subject="Smart glasses discovery call request" />
      </div></div></section>
    </div>
  )
}
