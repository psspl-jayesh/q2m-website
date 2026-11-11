import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useContent, sectionize, groupify, fmtDate, readingTime, type Entry } from '@/lib/content'
import { altForFile, heroImage, imagesBySection, keyOf, ogImageFor, pageImages, thumbFor, type ManifestImage } from '@/lib/images'
import ui from '@/content/shared/ui.json'
import { resolveHref } from './ServicePage'
import { Breadcrumbs, Button, Reveal, SectionHead, Seo, Accordion, SiteFrame, SiteImage } from '@/components/ui'
import { CaseCard, FinalCta, PostCard } from '@/components/Cards'
import { SITE_URL } from '@/lib/site'
import siteImages from '@/data/site-images.json'
import { indiaDescription, indiaTitle } from '@/lib/seo'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const SKIP = /connect with us|social|your success starts/i

const h1Of = (e: Entry) => e.blocks.find((b) => b.t === 'h1')?.text ?? e.title
const crumbOf = (e: Entry) => e.furniture?.breadcrumb?.[e.furniture.breadcrumb.length - 1] ?? e.title

/* ───────── Case study listing ───────── */
export function CaseStudies({ entry }: { entry: Entry }) {
  const c = useContent()
  return (
    <>
      <Seo title={indiaTitle(entry.metaTitle || 'Case Studies')} description={indiaDescription(entry.description)} path={entry.path} />
      <section className="page-band pt-10 pb-14 md:pt-20"><div className="container-page">
        <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: crumbOf(entry) }]} />
        <Reveal y={28}><h1 className="display-xl mt-10 max-w-4xl">{h1Of(entry)}</h1></Reveal>
      </div></section>
      <section className="pb-24"><div className="container-page grid gap-8 lg:grid-cols-12">{c.caseStudies.map((e, i) => <CaseCard key={e.id} e={e} large={i === 0} i={i} />)}</div></section>
      <FinalCta />
    </>
  )
}

/* ───────── Case study detail ───────── */
export function CaseStudy({ entry }: { entry: Entry }) {
  const c = useContent()
  const secs = sectionize(entry.blocks)
  const title = secs[0]?.title ?? entry.title
  const dek = secs[0]?.blocks.find((b) => b.t === 'p')?.text
  const body = secs.slice(1).filter((s) => !SKIP.test(s.title))
  const others = c.caseStudies.filter((e) => e.id !== entry.id)
  const bySec = imagesBySection(c, entry.path, body.map((x) => x.title))
  const ogImage = ogImageFor(c, entry.path)
  return (
    <>
      <Seo title={entry.metaTitle || `${entry.title} | Q2M Solutions`} description={entry.description} path={entry.path} image={ogImage}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Article', headline: entry.title, datePublished: entry.date, dateModified: entry.modified, image: ogImage ? SITE_URL + ogImage : undefined, publisher: { '@type': 'Organization', name: 'Q2M Solutions' } }} />
      <article>
        <header className="pt-8 pb-14 md:pt-14 md:pb-20"><div className="container-page">
          <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Case Studies', to: '/case-studies/' }, { label: entry.title }]} />
          {secs[0]?.eyebrow && <p className="eyebrow mt-10 mb-5">{secs[0].eyebrow}</p>}
          <h1 className="display-lg max-w-5xl">{title}</h1>
          {dek && <p className="lede mt-7 max-w-3xl">{dek}</p>}
        </div></header>

        <div className="container-page split split--toc pb-24">
          <aside className="split-aside hidden lg:block"><nav aria-label="On this page">
            <p className="eyebrow mb-4">In this story</p>
            <ul className="space-y-2.5 border-l hairline pl-4 text-sm">{body.map((s) => <li key={s.title}><a className="text-ink-muted hover:text-action" href={`#${slugify(s.title)}`}>{s.title}</a></li>)}</ul>
          </nav></aside>
          <div className="split-main">
            {body.map((s) => <Reveal key={s.title} y={16}><StorySection title={s.title} blocks={s.blocks} imgs={bySec.get(keyOf(s.title)) ?? []} /></Reveal>)}
          </div>
        </div>
      </article>
      {others.length > 0 && (
        <section className="section bg-surface-raised"><div className="container-page"><SectionHead eyebrow="Related work" title="More from our portfolio." />
          <div className="mt-12 grid gap-8 lg:grid-cols-12">{others.map((e, i) => <CaseCard key={e.id} e={e} i={i} />)}</div></div></section>
      )}
      <FinalCta />
    </>
  )
}

function StorySection({ title, blocks, imgs }: { title: string; blocks: ReturnType<typeof sectionize>[number]['blocks']; imgs: ManifestImage[] }) {
  const { lead, groups } = groupify(blocks)
  const id = slugify(title)
  // Results → metric band
  if (/^results/i.test(title) && groups.length) return (
    <section id={id} className="on-dark my-16 scroll-anchor rounded-lg bg-block p-8 text-ink-inverse md:p-14">
      <h2 className="display-md">{title}</h2>
      {lead.paras[0] && <p className="lede mt-4 max-w-2xl">{lead.paras[0]}</p>}
      <dl className="mt-10 grid gap-8 sm:grid-cols-2">
        {groups.map((g) => { const [num, ...w] = g.title.split(' '); return (
          <div key={g.title} className="border-t border-block-line pt-5"><dd className="font-display text-5xl text-action-soft md:text-6xl">{num}</dd><dt className="mt-1 text-sm uppercase tracking-wider">{w.join(' ')}</dt><dd className="mt-2 text-sm text-block-muted">{g.paras[0]}</dd></div>
        ) })}
      </dl>
    </section>
  )
  // Gallery
  if (imgs.length >= 1 && blocks.every((b) => b.t === 'img')) return (
    <section id={id} className="my-16 scroll-anchor"><h2 className="display-md mb-8">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{imgs.map((m, k) => <Reveal key={m.file + m.order} delay={(k % 2) * 0.1}><SiteFrame image={m} sizes="(min-width:1024px) 440px, 100vw" /></Reveal>)}</div></section>
  )
  return (
    <section id={id} className="mb-14 scroll-anchor border-t hairline pt-10">
      <h2 className="display-md">{title}</h2>
      <div className="prose-q2m mt-4 text-ink-muted">
        {lead.paras.map((p) => <p key={p}>{p}</p>)}
        {lead.items.length > 0 && <ul>{lead.items.map((x) => <li key={x}>{x}</li>)}</ul>}
        {groups.map((g) => (<div key={g.title}><h3 className="text-ink">{g.title}</h3>{g.paras.map((p) => <p key={p}>{p}</p>)}{g.items.length > 0 && <ul>{g.items.map((x) => <li key={x}>{x}</li>)}</ul>}</div>))}
      </div>
      {[...lead.btns, ...groups.flatMap((g) => g.btns)].map((b, k) => { const h = resolveHref(b.href); return h ? <div key={k} className="mt-6"><Button to={h}>{b.text}</Button></div> : null })}
    </section>
  )
}

/* ───────── Blog listing (search + category filter + pagination) ───────── */
const PAGE = 9
export function Blogs({ entry, category }: { entry?: Entry; category?: string }) {
  const c = useContent()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState(category ?? 'all')
  const [page, setPage] = useState(1)
  const cats = c.categories.filter((x) => x.count > 0 && x.slug !== 'uncategorized')
  const sorted = useMemo(() => [...c.posts].sort((a, b) => +new Date(b.date) - +new Date(a.date)), [c])
  const list = sorted.filter((p) => (cat === 'all' || p.categories.includes(cats.find((x) => x.slug === cat)?.id ?? -1)) && (!q || (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase())))
  const featured = cat === 'all' && !q && page === 1 ? list[0] : undefined
  const rest = featured ? list.slice(1) : list
  const pages = Math.max(1, Math.ceil(rest.length / PAGE))
  const view = rest.slice((page - 1) * PAGE, page * PAGE)
  const fm = featured && thumbFor(c, featured)
  return (
    <>
      <Seo title={indiaTitle(entry?.metaTitle || 'Blog')} description={indiaDescription(entry?.description || '')} path={entry?.path ?? `/category/${category}/`} noindex={!entry} />
      <section className="page-band pt-10 pb-10 md:pt-20"><div className="container-page">
        <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: entry ? crumbOf(entry) : 'Blog' }]} />
        <Reveal y={28}><h1 className="display-xl mt-10">{entry ? h1Of(entry) : 'Blog'}</h1></Reveal>
        <div className="mt-12 flex flex-col gap-6 border-y hairline py-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
            {[{ slug: 'all', name: 'All' }, ...cats].map((x) => (
              <button key={x.slug} aria-pressed={cat === x.slug} onClick={() => { setCat(x.slug); setPage(1) }} className={`min-h-11 rounded-full border px-4 text-sm transition-colors ${cat === x.slug ? 'border-ink bg-block text-ink-inverse' : 'border-line hover:border-ink'}`}>{x.name}</button>
            ))}
          </div>
          <label className="relative block lg:w-80"><span className="sr-only">Search articles</span>
            <Search aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search articles" className="h-12 w-full rounded-sm border border-line bg-surface pl-11 pr-4 text-sm outline-none focus:border-q2m" />
          </label>
        </div>
      </div></section>

      <section className="pb-24"><div className="container-page">
        {featured && (
          <Reveal><Link to={featured.path} className="group mb-16 grid gap-8 lg:grid-cols-12 lg:items-center">
            {fm && <div className="lg:col-span-7 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]"><SiteFrame image={fm} priority ratio="16/10" sizes="(min-width:1024px) 700px, 100vw" /></div>}
            <div className="lg:col-span-5"><p className="eyebrow mb-4">Featured · {fmtDate(featured.date)}</p><h2 className="display-md group-hover:text-action">{featured.title}</h2><p className="mt-4 line-clamp-4 text-ink-muted">{featured.excerpt}</p><p className="mt-6 text-sm text-ink-muted">{readingTime(featured)} min read</p></div>
          </Link></Reveal>
        )}
        {view.length === 0 ? <p className="py-16 text-center text-ink-muted" role="status">No articles match your search.</p> : <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{view.map((p, i) => <PostCard key={p.id} e={p} i={i} />)}</div>}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-16 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} aria-current={n === page ? 'page' : undefined} onClick={() => { setPage(n); window.scrollTo({ top: 0 }) }} className={`size-11 rounded-md border text-sm ${n === page ? 'border-ink bg-block text-ink-inverse' : 'border-line hover:border-ink'}`}>{n}</button>)}
          </nav>
        )}
      </div></section>
      <FinalCta />
    </>
  )
}

export function CategoryRoute() {
  const { slug } = useParams()
  return <Blogs category={slug} />
}

/* ───────── Article ───────── */
export function Article({ entry }: { entry: Entry }) {
  const c = useContent()
  const media = heroImage(c, entry.path)
  const cat = c.categories.find((x) => entry.categories.includes(x.id) && x.slug !== 'uncategorized')
  const headings = entry.blocks.filter((b) => b.t === 'h2')
  const secImgs = imagesBySection(c, entry.path, headings.map((h) => h.text!))
  const introImgs = pageImages(c, entry.path).filter((i) => i.sectionKey === 'hero' && i.role === 'content')
  // Same three posts the live page shows in its "Popular Post" sidebar (read from the manifest); falls back to related posts
  const popular = pageImages(c, entry.path).filter((i) => i.sectionKey === 'popular post').map((i) => c.posts.find((p) => thumbFor(c, p)?.file === i.file)).filter((p): p is Entry => !!p)
  const related = c.posts.filter((p) => p.id !== entry.id && p.categories.some((k) => entry.categories.includes(k))).slice(0, 3)
  const more = popular.length ? popular : related.length ? related : c.posts.filter((p) => p.id !== entry.id).slice(0, 3)
  return (
    <>
      <Seo title={entry.metaTitle || `${entry.title} | Q2M Solutions`} description={entry.description} path={entry.path} image={ogImageFor(c, entry.path)}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: entry.title, datePublished: entry.date, dateModified: entry.modified, image: media ? SITE_URL + media.file : undefined, author: { '@type': 'Organization', name: 'Q2M Solutions' }, publisher: { '@type': 'Organization', name: 'Q2M Solutions', logo: { '@type': 'ImageObject', url: SITE_URL + siteImages.brand.logoColor.file } } }} />
      <article>
        <header className="page-band pt-8 pb-10 md:pt-14"><div className="container-page">
          <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: entry.title }]} />
          <p className="eyebrow mt-10 mb-5">{cat?.name ?? 'Insight'}</p>
          <h1 className="display-lg max-w-5xl">{entry.title}</h1>
          <p className="mt-6 text-sm text-ink-muted">{entry.furniture?.meta?.find((m) => /^by,/i.test(m))} · <time dateTime={entry.date}>{fmtDate(entry.date)}</time></p>
          {media && <div className={`mt-10 ${(media.w ?? 0) / (media.h ?? 1) >= 1.6 ? '' : 'max-w-3xl'}`}><SiteFrame image={media} priority parallax sizes="(min-width:1280px) 1400px, (min-width:896px) 896px, 100vw" /></div>}
        </div></header>
        <div className="container-page split split--toc pb-20">
          {headings.length > 1 && (
            <aside className="split-aside hidden lg:block"><nav aria-label="Contents"><p className="eyebrow mb-4">Contents</p>
              <ul className="space-y-2.5 border-l hairline pl-4 text-sm">{headings.map((h) => <li key={h.text}><a className="text-ink-muted hover:text-action" href={`#${slugify(h.text!)}`}>{h.text}</a></li>)}</ul></nav></aside>
          )}
          <div className="split-main prose-q2m text-[1.0625rem]">
            {(() => {
              const out: React.ReactNode[] = []
              let list: string[] = []
              const flush = (k: number) => { if (list.length) { out.push(<ul key={'ul' + k}>{list.map((x) => <li key={x}>{x}</li>)}</ul>); list = [] } }
              entry.blocks.forEach((b, i) => {
                if (b.t === 'li') { list.push(b.text!); return }
                flush(i)
                if (b.t === 'h2') {
                  if (introImgs.length && !out.some((o) => (o as { key?: string }).key === 'intro-imgs')) out.push(<div key="intro-imgs">{introImgs.map((m) => <SiteImage key={m.file} image={m} className="h-auto w-full" ratio="auto" />)}</div>)
                  out.push(<h2 key={i} id={slugify(b.text!)} className="scroll-anchor">{b.text}</h2>)
                  ;(secImgs.get(keyOf(b.text!)) ?? []).forEach((m) => out.push(<SiteImage key={m.file + m.order} image={m} className="h-auto w-full" ratio="auto" />))
                }
                else if (b.t === 'h3' || b.t === 'h4' || b.t === 'h5' || b.t === 'h6') out.push(<h3 key={i}>{b.text}</h3>)
                else if (b.t === 'btn') { const h = resolveHref(b.href); if (h) out.push(<p key={i}><Button to={h}>{b.text}</Button></p>) }
                else if (b.t === 'p') out.push(<p key={i}>{b.text}</p>)
                else if (b.t === 'img') out.push(<SiteImage key={i} image={{ file: b.src!, alt: altForFile(c, b.src!) }} className="h-auto w-full" ratio="auto" />)
              })
              flush(9999)
              return out
            })()}
          </div>
        </div>
        {entry.faqs.length > 0 && <div className="container-page pb-20"><div className="max-w-3xl"><h2 className="display-md mb-8">Frequently asked questions</h2><Accordion items={entry.faqs} /></div></div>}
      </article>
      <section className="section bg-surface-raised"><div className="container-page"><SectionHead title={ui.popularPosts} /><div className="mt-12 grid gap-8 md:grid-cols-3">{more.map((p, i) => <PostCard key={p.id} e={p} i={i} />)}</div>
        <div className="mt-12"><Button to="/blogs/" variant="dark">All insights</Button></div></div></section>
      <FinalCta />
    </>
  )
}
