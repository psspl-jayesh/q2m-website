import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Menu, X, ArrowRight, ArrowUpRight, Mail, MapPin, Phone, Moon, Sun } from 'lucide-react'
import { NAV, TOP_LINKS, type MenuItem, type NavGroup } from '@/lib/site'
import ctas from '@/content/shared/ctas.json'
import footerContent from '@/content/shared/footer.json'
import { COMPANY, LEGAL, fullAddress } from '@/config/locale'
import { formatPhone, phoneHref } from '@/lib/format'
import { organizationJsonLd } from '@/lib/seo'
import { ariaCurrent, useActiveNav } from '@/lib/nav'
import { useContent } from '@/lib/content'
import { megaCopy } from '@/lib/menuCopy'
import { useSplitFit } from '@/lib/splitFit'
import { Button } from './ui'
import SocialIcon from './SocialIcon'
import siteCopy from '@/data/site-copy.json'
import siteImages from '@/data/site-images.json'
import BackToTop from '@/components/BackToTop'
import DotArrow from '@/components/DotArrow'
import ui from '@/content/shared/ui.json'
import btsPage from '@/content/pages/bts-2026/page.json'
import { BTS, useBtsPhase } from '@/config/bts'


/** Official Q2M logos from Q2M_Brand_Kit, unmodified (826x498). Colour on light, reverse on dark. Min width 96px. */
function Logo({ onBlock = false, width = 96 }: { onBlock?: boolean; width?: number }) {
  const h = Math.round((width * 498) / 826)
  return (
    <Link to="/" aria-label="Q2M Solutions home" className={`inline-flex ${onBlock ? 'on-block' : ''}`}>
      <img className="logo-color" src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={width} height={h} />
      <img className="logo-reverse" src={siteImages.brand.logoReverse.file} alt={siteImages.brand.logoReverse.alt} width={width} height={h} />
    </Link>
  )
}

/** One menu link: internal pages use the router, external destinations (e.g. Campus Click) open in a new tab. */
function MenuLink({ item, nav, onClick, className, children }: { item: MenuItem; nav: ReturnType<typeof useActiveNav>; onClick?: () => void; className: string; children: React.ReactNode }) {
  if (item.external) return <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>{children}</a>
  return <Link to={item.href} onClick={onClick} aria-current={ariaCurrent(nav.child(item))} className={className}>{children}</Link>
}

function MegaPanel({ g, close, nav }: { g: NavGroup; close: () => void; nav: ReturnType<typeof useActiveNav> }) {
  const c = useContent()
  const { intro, blurb } = megaCopy(c, g)
  const [first, ...rest] = g.items
  const cols = rest.length > 6 ? [rest.slice(0, Math.ceil(rest.length / 2)), rest.slice(Math.ceil(rest.length / 2))] : [rest]
  return (
    <div className="grid grid-cols-12 gap-10 px-10 py-10">
      <div className="col-span-4">
        <p className="eyebrow mb-3">{g.label}</p>
        {intro && <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-muted">{intro}</p>}
        <MenuLink item={first} nav={nav} onClick={close} className="nav-featured group mt-6 block rounded-md border border-block-line bg-block p-6 text-ink-inverse transition-colors hover:bg-action">
          <span className="mono mb-3 block !text-[0.6875rem] uppercase tracking-[0.08em] opacity-70">Featured</span>
          <span className="flex items-center justify-between font-display text-xl">{first.label}<ArrowUpRight aria-hidden className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
          {blurb && <span className="mt-3 block text-[0.875rem] leading-relaxed opacity-80">{blurb}</span>}
        </MenuLink>
      </div>
      <div className="col-span-8 grid grid-cols-2 gap-10">
        {cols.map((col, i) => (
          <ul key={i} className={cols.length === 1 ? 'col-span-2 grid grid-cols-2 gap-x-10' : ''}>
            {col.map((l) => (
              <li key={l.href}>
                <MenuLink item={l} nav={nav} onClick={close} className="nav-link group flex items-center justify-between py-2.5 text-[0.9375rem] hover:text-action">
                  <span>{l.label}</span>
                  <ArrowUpRight aria-hidden className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </MenuLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function Header() {
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const nav = useActiveNav()
  const reduce = useReducedMotion()
  const timer = useRef<number>(0)
  const bar = useRef<HTMLDivElement>(null)

  // Close the menus when the page changes (state adjusted during render: https://react.dev/learn/you-might-not-need-an-effect)
  const [path, setPath] = useState(loc.pathname)
  if (path !== loc.pathname) { setPath(loc.pathname); setOpen(null); setMobile(false) }
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); setMobile(false) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : ''
    document.documentElement.toggleAttribute('data-menu-open', mobile) // lets fixed widgets (Back to top) step aside
    return () => { document.body.style.overflow = ''; document.documentElement.removeAttribute('data-menu-open') }
  }, [mobile])
  useEffect(() => {
    if (!open) return
    const click = (e: MouseEvent) => { if (bar.current && !bar.current.contains(e.target as Node)) setOpen(null) }
    document.addEventListener('mousedown', click); return () => document.removeEventListener('mousedown', click)
  }, [open])

  const enter = (k: string) => { window.clearTimeout(timer.current); setOpen(k) }
  const leave = () => { timer.current = window.setTimeout(() => setOpen(null), 140) }
  const active = NAV.find((g) => g.key === open)

  return (
    <header ref={bar} className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled || open || mobile ? 'border-line bg-surface' : 'border-transparent bg-surface'}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-block focus:px-5 focus:py-3 focus:text-ink-inverse">Skip to content</a>
      <div className="container-page flex h-[var(--header-height)] items-center justify-between">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex" onMouseLeave={leave}>
          {NAV.map((g) => (
            <div key={g.key} onMouseEnter={() => enter(g.key)}>
              <button aria-expanded={open === g.key} data-open={open === g.key} aria-current={ariaCurrent(nav.group(g), 'true')} aria-controls={`mega-${g.key}`} onClick={(e) => setOpen(open === g.key && e.detail === 0 ? null : g.key)}
                className={`nav-top flex h-11 items-center gap-1 rounded-md px-2 text-sm font-medium transition-colors xl:px-4 xl:text-[0.9375rem] ${open === g.key ? 'bg-block text-ink-inverse' : 'hover:bg-surface-raised'}`}>
                {g.label}<ChevronDown aria-hidden className={`size-4 transition-transform ${open === g.key ? 'rotate-180' : ''}`} />
              </button>
            </div>
          ))}
          {TOP_LINKS.map((l) => (
            <Link key={l.to} to={l.to} aria-current={ariaCurrent(nav.top(l))} className="nav-top flex h-11 items-center rounded-md px-2 text-sm font-medium transition-colors xl:px-4 xl:text-[0.9375rem] hover:bg-surface-raised">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button to={ctas.header.href} className="hidden h-11 shrink-0 whitespace-nowrap sm:inline-flex lg:px-4 lg:text-sm xl:px-6 xl:text-[0.9375rem]">{ctas.header.label}</Button>
          <button className="inline-flex size-11 items-center justify-center rounded-md border border-line lg:hidden" aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} aria-controls="mobile-nav" onClick={() => setMobile((v) => !v)}>
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {active && (
          <motion.div id={`mega-${active.key}`} key="mega" onMouseEnter={() => enter(active.key)} onMouseLeave={leave}
            initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full hidden border-b border-line bg-surface  lg:block">
            <div className="container-page"><MegaPanel g={active} close={() => setOpen(null)} nav={nav} /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile navigation */}
      {mobile && (
        <motion.div id="mobile-nav" initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 bottom-0 top-[var(--header-height)] overflow-y-auto overscroll-contain bg-surface px-5 pb-10 pt-4 lg:hidden">
          <MobileNav nav={nav} />
        </motion.div>
      )}
    </header>
  )
}

function MobileNav({ nav }: { nav: ReturnType<typeof useActiveNav> }) {
  // The section that contains the current page is expanded when the menu opens
  const [sec, setSec] = useState<string | null>(nav.activeGroupKey)
  return (
    <nav aria-label="Mobile">
      {NAV.map((g) => (
        <div key={g.key} className="border-b hairline">
          <button aria-expanded={sec === g.key} aria-current={ariaCurrent(nav.group(g), 'true')} onClick={() => setSec(sec === g.key ? null : g.key)} className="nav-top -mx-3 flex min-h-14 w-[calc(100%+1.5rem)] items-center justify-between rounded-md px-3 py-3 font-display text-2xl">
            {g.label}<ChevronDown aria-hidden className={`size-5 transition-transform ${sec === g.key ? 'rotate-180' : ''}`} />
          </button>
          {sec === g.key && (
            <div className="pb-5">
              {g.items.map((l, k) => <MenuLink key={l.href} item={l} nav={nav} className={k === 0 ? 'nav-featured mb-3 block rounded-md bg-block p-4 font-display text-lg text-ink-inverse' : 'nav-link flex min-h-12 items-center text-base'}>{l.label}</MenuLink>)}
            </div>
          )}
        </div>
      ))}
      {TOP_LINKS.map((l) => <div key={l.to} className="border-b hairline"><Link to={l.to} aria-current={ariaCurrent(nav.top(l))} className="nav-top -mx-3 flex min-h-14 w-[calc(100%+1.5rem)] items-center rounded-md px-3 font-display text-2xl">{l.label}</Link></div>)}
      <Button to={ctas.header.href} className="mt-8 w-full">{ctas.header.label}</Button>
    </nav>
  )
}

/** The theme lives on <html data-theme>. Pre-rendered HTML is built without a theme, so the server/hydration snapshot is "light". */
const subscribeTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => mo.disconnect()
}
const isDark = () => document.documentElement.dataset.theme === 'dark'

function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false)
  const flip = () => {
    const next = !dark
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    try { localStorage.setItem('q2m-theme', next ? 'dark' : 'light') } catch { /* storage unavailable */ }
  }
  return (
    <button onClick={flip} aria-pressed={dark} className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line px-5 text-sm text-ink transition-colors hover:border-action hover:text-action">
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}{dark ? 'Light theme' : 'Dark theme'}
    </button>
  )
}

/** One footer link group: uppercase blue heading with a short accent line, links with an arrow. Phones: a closed accordion. */
function FooterGroup({ title, links }: { title: string; links: MenuItem[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const head = 'font-sans text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-action'
  return (
    <nav aria-label={title} className="border-b border-line md:border-0">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className={`${head} flex min-h-12 w-full items-center justify-between text-left md:hidden`}>
        {title}<ChevronDown aria-hidden className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <p className={`${head} hidden md:block`}>{title}</p>
      <span aria-hidden className="mt-2.5 hidden h-0.5 w-10 rounded-full bg-q2m md:block" />
      <ul id={id} className={`${open ? 'grid' : 'hidden'} gap-y-3 pb-5 md:mt-6 md:grid md:pb-0`}>
        {links.map((l) => {
          const body = <><ArrowRight aria-hidden className="mt-[4px] size-3.5 shrink-0 text-action transition-transform group-hover:translate-x-0.5" /><span>{l.label}</span></>
          const cls = 'group grid grid-cols-[0.875rem_1fr] gap-x-2.5 text-[0.9375rem] leading-[1.375rem] text-ink-muted transition-colors hover:text-ink'
          return <li key={l.label + l.href}>{l.external ? <a className={cls} href={l.href} target="_blank" rel="noopener noreferrer">{body}</a> : <Link className={cls} to={l.href}>{body}</Link>}</li>
        })}
      </ul>
    </nav>
  )
}

/** Footer contact line: small icon in a soft circle, text in the body font; wrapped lines align with the first line. */
function ContactItem({ icon: Icon, href, external, children }: { icon: typeof Mail; href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[2rem_1fr] items-start gap-x-3 md:grid-cols-[2.25rem_1fr]">
      <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-tint text-action md:size-9"><Icon className="size-4" /></span>
      <a className="pt-1 text-[0.9375rem] leading-6 text-ink-muted transition-colors hover:text-ink md:pt-1.5" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
    </li>
  )
}

/**
 * Sitewide footer: CTA band, brand + contact column with four link columns, bottom bar. Follows the light/dark theme.
 * Links from the menu config (hidden "#" items stay hidden), contact and social data from the company config.
 * The CTA band replaces the per-page closing band; on the BTS page its button goes to the booking form (Contact after the event).
 */
function Footer() {
  const { pathname } = useLocation()
  const bts = pathname === BTS.path
  const after = useBtsPhase() === 'after'
  const cta = bts ? (after ? btsPage.after.cta : btsPage.closing.cta) : { label: footerContent.cta.primary, href: ctas.header.href }
  const title = ctas.header.label
  const [lead, accent] = title.endsWith(footerContent.cta.accent) ? [title.slice(0, -footerContent.cta.accent.length), footerContent.cta.accent] : [title, '']
  const columns: { title: string; links: MenuItem[] }[] = [
    { title: footerContent.heading, links: footerContent.links.map((l) => ({ label: l.label, href: l.href, external: false })) },
    ...['consulting', 'solutions', 'resources'].map((k) => NAV.find((g) => g.key === k)).filter((g): g is NavGroup => !!g).map((g) => ({ title: g.label, links: g.items })),
  ]
  const legal = [...TOP_LINKS.map((l) => ({ to: l.to, label: l.label })), { to: LEGAL.privacyPath, label: 'Privacy Policy' }]
  return (
    <footer className="site-footer border-t border-line bg-surface-raised text-ink">
      <div className="container-page">
        {/* CTA band */}
        <div className="border-b border-line py-8 md:py-14">
          <DotArrow pitch={7} className="mb-3 block h-auto w-[49px] md:mb-5 md:w-[63px]" />
          <div className="flex flex-col gap-5 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="display-md">{lead}{accent && <span className="text-action">{accent}</span>}</h2>
            <p className="mt-2 max-w-xl text-[0.9375rem] text-ink-muted md:mt-3 md:text-base">{footerContent.cta.line}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:shrink-0">
            <Link to={cta.href} className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-action px-5 font-medium sm:flex-none md:px-7 text-on-action transition-colors hover:bg-q2m">
              {cta.label}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href={`mailto:${COMPANY.email}`} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-5 font-medium sm:flex-none md:px-7 text-ink transition-colors hover:border-action hover:text-action">
              <Mail aria-hidden className="size-4" />{ui.finalCtaEmail}
            </a>
          </div>
          </div>
        </div>

        {/* Main footer: brand + contact, four link columns */}
        <div className="grid gap-6 py-8 md:gap-10 md:py-14 xl:grid-cols-12 xl:gap-12">
          <div className="xl:col-span-4">
            <Logo width={112} />
            <p className="mt-4 max-w-md text-[0.9375rem] leading-6 text-ink-muted md:mt-5">{siteCopy.footerBlurb}</p>
            <ul className="mt-5 max-w-md space-y-2.5 border-t border-line pt-5 md:mt-6 md:space-y-4 md:pt-6">
              <ContactItem icon={Mail} href={`mailto:${COMPANY.email}`}>{COMPANY.email}</ContactItem>
              {COMPANY.phone && <ContactItem icon={Phone} href={phoneHref(COMPANY.phone)}>{formatPhone(COMPANY.phone)}</ContactItem>}
              <ContactItem icon={MapPin} href={COMPANY.mapUrl} external>{fullAddress()}</ContactItem>
            </ul>
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-10 md:gap-y-10 lg:grid-cols-[1fr_1.1fr_1.3fr_0.7fr] lg:gap-x-8 xl:col-span-8">
            {columns.map((c) => <FooterGroup key={c.title} title={c.title} links={c.links} />)}
          </div>
        </div>

        {/* Bottom bar */}
        <div data-back-to-top-avoid className="flex flex-col gap-4 border-t border-line py-5 text-sm text-ink-muted md:gap-5 md:py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3 md:gap-x-4">
            <p suppressHydrationWarning>Copyright © {new Date().getFullYear()} {COMPANY.legalName}</p>
            <span aria-hidden className="hidden h-4 w-px bg-line md:block" />
            <ul className="flex flex-wrap items-center gap-x-4">
              {legal.map((l, i) => (
                <li key={l.to} className="flex items-center gap-x-4">{i > 0 && <span aria-hidden className="h-4 w-px bg-line" />}<Link className="inline-flex min-h-11 items-center transition-colors hover:text-ink" to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <ul aria-label="Social media" className="flex items-center gap-2">
              {COMPANY.social.map((s) => (
                <li key={s.label}><a className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-action hover:text-action" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}><SocialIcon label={s.label} /></a></li>
              ))}
            </ul>
            <span aria-hidden className="hidden h-6 w-px bg-line sm:block" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  useSplitFit(pathname)
  useEffect(() => {
    let el = document.getElementById('ld-org')
    if (!el) { el = document.createElement('script'); el.id = 'ld-org'; el.setAttribute('type', 'application/ld+json'); document.head.appendChild(el) }
    el.textContent = JSON.stringify(organizationJsonLd())
  }, [])
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return }
    const t = window.setTimeout(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView(), 150)
    return () => window.clearTimeout(t)
  }, [pathname, hash])
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1}><Outlet /></main>
      <Footer />
      <BackToTop />
    </>
  )
}
