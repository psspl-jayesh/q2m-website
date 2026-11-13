import { useRef } from 'react'
import g from '@/data/home-glasses.json'
import { Img, Seo } from '@/components/ui'
import { ADDRESS } from '@/config/locale'
import { BTS, useBtsPhase } from '@/config/bts'
import { useContent } from '@/lib/content'
import { ogImageFor } from '@/lib/images'
import { CountUp, DiscoveryForm, Ico, Pill, RingBadge, useReveal } from '@/components/GlassesDesign'
import '@/styles/home-glasses.css'

/**
 * THE HOME PAGE (routed). Smart glasses design from design/home-new/index.html (reference image design/home-new/home-design.png):
 * same sections, text, images and animations, built as React components. Text lives in src/data/home-glasses.json, styles in
 * src/styles/home-glasses.css (scoped to .hg). The site header and footer stay the shared ones; company details come from
 * src/config/locale.ts. BTS lines hide after the event (src/config/bts.ts). The previous home is HomeFolder.tsx (not routed),
 * see docs/BACKUP_OLD_DESIGN.md.
 */

/* ───────── page ───────── */
export default function HomeGlasses() {
  const c = useContent()
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  const btsOver = useBtsPhase() === 'after'
  const keep = <T extends { bts?: boolean }>(xs: T[]) => (btsOver ? xs.filter((x) => !x.bts) : xs)
  const marquee = keep(g.marquee)
  // Booth wording ("live demos at our desk") only when BTS.liveDemos is on; neutral wording otherwise
  const demos = BTS.liveDemos
  const faq = g.faq.items.map((f) => ({ q: f.q, a: btsOver && 'afterBts' in f && f.afterBts ? f.afterBts : !demos && 'neutral' in f && f.neutral ? f.neutral : f.a }))
  const tiles = keep(g.work.tiles).map((t) => ({ ...t, ...(!demos && 'neutral' in t && t.neutral ? t.neutral : {}), size: btsOver && 'afterBtsSize' in t && t.afterBtsSize ? t.afterBtsSize : t.size }))
  const trust = keep(g.hero.trust).map((t) => (!demos && 'neutral' in t && t.neutral ? t.neutral : t.text))
  const stats = g.stats.items.filter((s) => !('hidden' in s && s.hidden))
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
  return (
    <div className="hg" ref={root}>
      <Seo title={g.seo.title} description={g.seo.description} path="/" image={ogImageFor(c, '/')} jsonLd={faqLd} />

      {/* Hero */}
      <section className="hero" aria-labelledby="hg-title"><div className="w">
        <div>
          <Pill>{g.hero.pill}</Pill>
          <h1 id="hg-title">{g.hero.titleBefore}<em>{g.hero.titleAccent}</em>{g.hero.titleAfter}</h1>
          <p className="lead">{g.hero.lead}</p>
          <div className="cta">
            <a className="btn btn-p" href={g.hero.primary.href}>{g.hero.primary.label} <span aria-hidden="true">&#8594;</span></a>
            <a className="btn btn-g" href={g.hero.secondary.href}>{g.hero.secondary.label}</a>
          </div>
          <ul className="trust">{trust.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
        <div className="hvis">
          <div className="ph"><Img src={g.hero.image.file} alt={g.hero.image.alt} eager sizes="(min-width:1200px) 552px, (min-width:900px) 46vw, 100vw" /></div>
          <div className="chip-f"><Ico name="glasses" /><span>{g.hero.chip.title}<small>{g.hero.chip.sub}</small></span></div>
          <RingBadge text={g.hero.badge} id="hg-ring" />
        </div>
      </div></section>

      {/* Platform marquee (decorative: the same names are in the sections below) */}
      <div className="mq" aria-hidden="true"><div className="tr">{[...marquee, ...marquee].map((m, i) => <span key={i}>{m.text}</span>)}</div></div>

      {/* Platforms + numbers */}
      <section className="sec" id="platforms"><div className="w two">
        <div data-reveal>
          <Pill>{g.platforms.pill}</Pill><h2 className="mt16">{g.platforms.title}</h2>
          <p className="sub">{g.platforms.intro}</p>
          <ul className="logos">{g.platforms.logos.map((l) => (
            <li key={'file' in l ? l.file : l.text}>{'file' in l && l.file
              ? (l.file.endsWith('.svg') ? <img src={l.file} alt={l.alt} width={'w' in l ? l.w : undefined} height={'h' in l ? l.h : undefined} loading="lazy" decoding="async" /> : <Img src={l.file} alt={l.alt} sizes="220px" />)
              : <span className="tx">{'text' in l ? l.text : ''}</span>}</li>
          ))}</ul>
          <p className="disc">{g.platforms.disclaimer}</p>
        </div>
        <div data-reveal>
          <Pill>{g.stats.pill}</Pill><h2 className="mt16">{g.stats.title}</h2>
          <div className="stats">{stats.map((s) => (
            <div className="stat" key={s.label}>{'value' in s && typeof s.value === 'number' ? <CountUp to={s.value} /> : <b><span className="tbc">[TBC]</span></b>}<p>{s.label}</p></div>
          ))}</div>
        </div>
      </div></section>

      {/* Why Q2M */}
      <section className="sec dk" id="why"><div className="w">
        <div className="hdr c" data-reveal><Pill dark>{g.why.pill}</Pill><h2>{g.why.title}</h2><p>{g.why.intro}</p></div>
        <div className="g4">{g.why.items.map((x) => <article className="dcard" data-reveal key={x.title}><Ico name={x.icon} /><h3>{x.title}</h3><p>{x.text}</p></article>)}</div>
      </div></section>

      {/* Services */}
      <section className="sec sec-s" id="services"><div className="w">
        <div className="hdr" data-reveal><Pill>{g.services.pill}</Pill><h2>{g.services.title}</h2><p>{g.services.intro}</p></div>
        <div className="g3">{g.services.items.map((x) => (
          <article className="scard" data-reveal key={x.title}><Ico name={x.icon} soft /><h3>{x.title}</h3><p>{x.text}</p>
            <a className="more" href="#contact">{g.services.more} <span aria-hidden="true">&#8594;</span><span className="sr-only">: {x.title}</span></a></article>
        ))}</div>
      </div></section>

      {/* Choosing glasses */}
      <section className="sec" id="devices"><div className="w">
        <div className="hdr c" data-reveal><Pill>{g.devices.pill}</Pill><h2>{g.devices.title}</h2><p>{g.devices.intro}</p></div>
        <div className="plist">{g.devices.items.map((x) => (
          <div className="prow" data-reveal key={x.title}><Ico name="device" soft /><div><h3>{x.title}</h3><p>{x.text}</p><span className="on">{x.on}</span></div></div>
        ))}</div>
      </div></section>

      {/* Industries */}
      <section className="sec dk indsec" id="industries"><div className="w ind">
        <div data-reveal><Pill dark>{g.industries.pill}</Pill><h2 className="mt16">{g.industries.title}</h2><p className="sub">{g.industries.intro}</p><a className="btn btn-p" href="#contact">{g.industries.cta}</a></div>
        <div className="ig">{g.industries.items.map((x) => <div className="icard" data-reveal key={x.title}><Ico name={x.icon} /><div><h3>{x.title}</h3><p>{x.text}</p></div></div>)}</div>
      </div></section>

      {/* Technology */}
      <section className="sec sec-s" id="stack"><div className="w">
        <div className="hdr c" data-reveal><Pill>{g.stack.pill}</Pill><h2>{g.stack.title}</h2></div>
        <div className="stk">{g.stack.groups.map((s) => <div data-reveal key={s.title}><h3>{s.title}</h3><ul className="tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul></div>)}</div>
      </div></section>

      {/* Process */}
      <section className="sec" id="process"><div className="w">
        <div className="hdr" data-reveal><Pill>{g.process.pill}</Pill><h2>{g.process.title}</h2><p>{g.process.intro}</p></div>
        <ol className="proc">{g.process.steps.map((s, i) => (
          <li className="step" data-reveal key={s.title}>
            <div className="im"><Img src={s.image} alt="" sizes="(min-width:1000px) 280px, (min-width:560px) 50vw, 100vw" /><span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span></div>
            <div className="tx"><h3>{s.title}</h3><p>{s.text}</p></div>
          </li>
        ))}</ol>
      </div></section>

      {/* Use cases */}
      <section className="sec sec-s" id="work"><div className="w">
        <div className="hdr" data-reveal><Pill>{g.work.pill}</Pill><h2>{g.work.title}</h2><p>{g.work.intro}{!btsOver && (demos ? g.work.introBts : g.work.introBtsNeutral)}</p></div>
        <div className="bento">{tiles.map((t, i) => {
          const cls = `bt ${t.size}`.trim()
          if (t.kind === 'text') return <div className={`${cls} txt`} data-reveal key={i}><h3>{t.title}</h3><p>{t.text}</p><a className="btn btn-w" href="#contact">{t.cta}</a></div>
          return (
            <figure className={cls} data-reveal key={i}>
              <Img src={t.file!} alt={t.alt ?? ''} position={t.position ?? 'center'} sizes={t.size.includes('w2') ? '(min-width:900px) 584px, 100vw' : '(min-width:900px) 290px, (min-width:560px) 50vw, 100vw'} />
              {t.caption && <figcaption className="cp"><span>{t.tag}</span><b>{t.caption}</b></figcaption>}
            </figure>
          )
        })}</div>
      </div></section>

      {/* Contact */}
      <section className="sec" id="contact"><div className="w"><div className="ct" data-reveal>
        <div>
          <Pill dark>{g.contact.pill}</Pill><h2 className="mt16">{g.contact.title}</h2><p style={{ marginTop: 14 }}>{g.contact.intro}</p>
          <ul><li>{`Based in ${ADDRESS.city}, ${ADDRESS.state}${g.contact.pointsAfterCity}`}</li>{g.contact.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <DiscoveryForm companyLabel="Company / organisation" messageLabel="Message" placeholder={g.contact.placeholder} submit={g.contact.submit} workflows={g.contact.workflows} subject="Discovery call request" />
      </div></div></section>

      {/* FAQ */}
      <section className="sec faq" id="faq"><div className="w">
        <div className="hdr c" data-reveal><Pill>{g.faq.pill}</Pill><h2>{g.faq.title}</h2></div>
        <div className="fq">{faq.map((f) => <details data-reveal key={f.q}><summary>{f.q}<i aria-hidden="true">+</i></summary><p>{f.a}</p></details>)}</div>
      </div></section>
    </div>
  )
}
