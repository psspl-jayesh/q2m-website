import { useEffect, useId, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Menu, X, ArrowUpRight, Mail, MapPin, Phone, Moon, Sun } from 'lucide-react'
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
        <MenuLink item={first} nav={nav} onClick={close} className="nav-featured group mt-6 block rounded-md bg-block p-6 text-ink-inverse transition-colors hover:bg-action">
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

  useEffect(() => { setOpen(null); setMobile(false) }, [loc.pathname])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(null); setMobile(false) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [mobile])
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

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const flip = () => {
    const next = !dark
    setDark(next)
    document.documentElement.dataset.theme = next ? 'dark' : 'light'
    try { localStorage.setItem('q2m-theme', next ? 'dark' : 'light') } catch { /* storage unavailable */ }
  }
  return (
    <button onClick={flip} aria-pressed={dark} className="inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-block-line px-4 hover:border-ink-inverse hover:text-ink-inverse">
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}{dark ? 'Light theme' : 'Dark theme'}
    </button>
  )
}

/** One footer link group. Phones and tablets: a closed accordion (button with aria-expanded). Desktop (1024px and up): always open. */
function FooterGroup({ title, columns = 1, children }: { title: string; columns?: 1 | 2; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <nav aria-label={title} className={`border-b border-block-line lg:border-0 ${columns === 2 ? 'lg:col-span-2' : ''}`}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}
        className="eyebrow flex min-h-12 w-full items-center justify-between text-left lg:hidden">
        {title}<ChevronDown aria-hidden className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <p className="eyebrow mb-3 hidden lg:block">{title}</p>
      <ul id={id} className={`${open ? 'grid' : 'hidden'} gap-y-2 pb-4 lg:grid lg:pb-0 ${columns === 2 ? 'sm:grid-cols-2 sm:gap-x-6' : ''}`}>{children}</ul>
    </nav>
  )
}

const footLink = 'text-sm leading-5 text-block-muted hover:text-ink-inverse'

function Footer() {
  const groups = NAV.filter((g) => g.key !== 'ai' && g.items.length > 1)
  return (
    <footer className="on-dark bg-block text-ink-inverse">
      <div className="container-page py-10 md:py-14">
        <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
          {/* Company: logo, short description, contact details (always visible) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-10 xl:col-span-4 xl:block">
            <div>
            <Logo onBlock width={104} />
            <p className="mt-4 max-w-sm text-sm leading-6 text-block-muted">{siteCopy.footerBlurb}</p>
            </div>
            <ul className="mono mt-5 space-y-2 !text-[0.8125rem] text-block-muted lg:mt-0 xl:mt-5">
              <li className="flex gap-2.5"><Mail aria-hidden className="mt-0.5 size-4 shrink-0" /><a className="hover:text-ink-inverse" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
              {COMPANY.phone && <li className="flex gap-2.5"><Phone aria-hidden className="mt-0.5 size-4 shrink-0" /><a className="hover:text-ink-inverse" href={phoneHref(COMPANY.phone)}>{formatPhone(COMPANY.phone)}</a></li>}
              <li className="flex gap-2.5"><MapPin aria-hidden className="mt-0.5 size-4 shrink-0" /><a className="hover:text-ink-inverse" href={COMPANY.mapUrl} target="_blank" rel="noopener noreferrer">{fullAddress()}</a></li>
            </ul>
          </div>
          {/* Link groups: compact columns; the long Solutions list uses two columns */}
          <div className="lg:grid lg:grid-cols-5 lg:gap-x-8 xl:col-span-8">
            <FooterGroup title={footerContent.heading}>
              {footerContent.links.map((l) => <li key={l.label}><Link className={footLink} to={l.href}>{l.label}</Link></li>)}
            </FooterGroup>
            {groups.map((g) => (
              <FooterGroup key={g.key} title={g.label} columns={g.items.length > 9 ? 2 : 1}>
                {g.items.map((l) => <li key={l.href}>{l.external ? <a className={footLink} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a> : <Link className={footLink} to={l.href}>{l.label}</Link>}</li>)}
              </FooterGroup>
            ))}
          </div>
        </div>
        {/* Bottom row: copyright, legal links, social icons, theme switch (one line on desktop) */}
        <div className="mt-8 flex flex-col gap-4 border-t border-block-line pt-6 text-sm text-block-muted md:mt-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-x-6">
            <p>Copyright {new Date().getFullYear()} {COMPANY.legalName}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {TOP_LINKS.map((l) => <li key={l.to}><Link className="hover:text-ink-inverse" to={l.to}>{l.label}</Link></li>)}
              <li><Link className="hover:text-ink-inverse" to={LEGAL.privacyPath}>Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ul aria-label="Social media" className="flex items-center gap-1">
              {COMPANY.social.map((s) => (
                <li key={s.label}><a className="inline-flex size-10 items-center justify-center rounded-md hover:bg-white/10 hover:text-ink-inverse" href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}><SocialIcon label={s.label} /></a></li>
              ))}
            </ul>
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
    </>
  )
}
