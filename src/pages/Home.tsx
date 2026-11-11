import { getPage, sectionize, useContent } from '@/lib/content'
import { Button, ClutchBadge, Reveal, Seo } from '@/components/ui'
import { ogImageFor, pageImages } from '@/lib/images'
import HeroSlider from '@/components/HeroSlider'
import { FinalCta } from '@/components/Cards'
import { PageBody, resolveHref, splitHero } from './ServicePage'
import ctas from '@/content/shared/ctas.json'
import heroSlides from '@/content/shared/hero-slides.json'

/**
 * Home page. All copy comes from the live home page (src/content/pages/home.json) with the India overrides applied.
 * The hero keeps the existing design (dot field); every other section uses the shared section components.
 * The folder-based home is kept in HomeFolder.tsx (not routed).
 */
export default function Home() {
  const c = useContent()
  const entry = getPage(c, 'q2m-solutions')!
  const { h1, lede, btn, meta, body } = splitHero(entry.blocks)
  const secs = sectionize(body)
  // live home hero banners, in the order and with the alt text from hero-slides.json
  const live = pageImages(c, '/')
  const slides = heroSlides.slides.flatMap((s) => { const m = live.find((i) => i.file === s.file); return m ? [{ ...m, alt: s.alt }] : [] })
  return (
    <>
      <Seo title={entry.metaTitle} description={entry.description} path="/" image={ogImageFor(c, '/')} />
      <section className="pb-12 pt-8 md:pb-24 md:pt-16">
        <div className="container-page split split--lead">
          <div className="split-aside">
            {h1?.eyebrow && <Reveal><p className="eyebrow mb-5">{h1.eyebrow}</p></Reveal>}
            <Reveal delay={0.08} y={28}><h1 className="display-xl">{h1?.text}</h1></Reveal>
            {lede && <Reveal delay={0.18}><p className="lede mt-6 max-w-xl text-[1.1875rem] leading-[1.7rem]">{lede.text}</p></Reveal>}
            <Reveal delay={0.26}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button to={resolveHref(btn?.href) ?? ctas.header.href}>{btn?.text ?? ctas.header.label}</Button>
                {meta.some((m) => /review/i.test(m.text ?? '')) && <ClutchBadge className="h-6 items-center" />}
              </div>
              {meta.length > 0 && <p className="mono mt-8 flex flex-wrap gap-x-5 gap-y-1 text-ink-muted">{meta.map((m, k) => <span key={k}>{m.text}</span>)}</p>}
            </Reveal>
          </div>
          <Reveal delay={0.15} y={0} className="split-main"><HeroSlider slides={slides} className="mx-auto w-full max-w-[560px]" /></Reveal>
        </div>
      </section>
      {/* Home images are placed only after you approve docs/HOME_IMAGE_MAPPING.md */}
      <PageBody entry={entry} secs={secs} images={false} />
      <FinalCta />
    </>
  )
}
