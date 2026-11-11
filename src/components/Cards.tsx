import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useContent, fmtDate, type Entry } from '@/lib/content'
import { thumbFor } from '@/lib/images'
import { Button, Reveal, SiteImage } from '@/components/ui'
import DotArrow from '@/components/DotArrow'
import { COMPANY } from '@/config/locale'
import ui from '@/content/shared/ui.json'
import ctas from '@/content/shared/ctas.json'

export function CaseCard({ e, large, i = 0, as: Heading = 'h3' }: { e: Entry; large?: boolean; i?: number; as?: 'h2' | 'h3' }) {
  const c = useContent()
  const m = thumbFor(c, e)
  const lede = e.blocks.find((b) => b.t === 'p')?.text
  return (
    <Reveal delay={i * 0.1} className={large ? 'lg:col-span-12' : 'lg:col-span-6'}>
      <Link to={e.path} className={`group grid h-full overflow-hidden rounded-lg border border-line bg-surface transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-ink ${large ? 'lg:grid-cols-2' : ''}`}>
        {m && <div className="overflow-hidden"><SiteImage image={{ ...m, alt: m.alt || `${e.title}: project visual` }} ratio={large ? '4/3' : '16/10'} sizes={large ? '(min-width:1024px) 640px, 100vw' : '(min-width:1024px) 600px, 100vw'} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" /></div>}
        <div className="flex flex-col justify-between gap-8 p-6 md:p-10">
          <div>
            <p className="eyebrow mb-4">{e.blocks.find((b) => b.t === 'h1')?.eyebrow}</p>
            <Heading className={`font-display ${large ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>{e.title}</Heading>
            {lede && <p className="mt-4 line-clamp-3 text-ink-muted">{lede}</p>}
          </div>
          <span className="inline-flex items-center gap-1.5 font-medium text-action">{ui.caseCta}<ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </div>
      </Link>
    </Reveal>
  )
}

export function PostCard({ e, i = 0 }: { e: Entry; i?: number }) {
  const c = useContent()
  const m = thumbFor(c, e)
  const cat = c.categories.find((x) => e.categories.includes(x.id) && x.slug !== 'uncategorized')
  return (
    <Reveal delay={(i % 3) * 0.1}>
      <Link to={e.path} className="group block">
        {m && <div className="overflow-hidden rounded-md"><SiteImage image={{ ...m, alt: '' }} ratio="16/10" sizes="(min-width:1024px) 400px, (min-width:768px) 50vw, 100vw" className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" /></div>}
        <p className="mono mt-5 text-ink-muted">{cat?.name ?? 'Insight'} · {fmtDate(e.date)}</p>
        <h3 className="mt-2 font-display text-xl leading-snug transition-colors duration-200 group-hover:text-action">{e.title}</h3>
      </Link>
    </Reveal>
  )
}

/** Closing call-to-action band (every page). Text is the live CTA ("Book a Discovery Call", src/content/shared/ctas.json). The live site has no supporting line for it, so none is shown. */
export function FinalCta({ title = ctas.header.label }: { title?: string }) {
  return (
    <section className="on-dark bg-block text-ink-inverse">
      <div className="container-page split split--lead py-20 md:py-28">
        <div className="split-aside"><DotArrow pitch={12} className="mb-8 block h-auto w-[84px]" /><h2 className="display-lg">{title}</h2></div>
        <div className="split-main">
          <div className="flex flex-wrap gap-3"><Button to={ctas.header.href}>{ctas.header.label}</Button><Button href={`mailto:${COMPANY.email}`} variant="ghost" arrow={false}>{ui.finalCtaEmail}</Button></div>
        </div>
      </div>
    </section>
  )
}
