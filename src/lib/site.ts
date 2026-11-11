import menu from '@/content/shared/menu.json'
import { COMPANY } from '@/config/locale'

/**
 * Navigation. Labels and links come from the shared live menu (src/content/shared/menu.json, synced from the live site).
 * Items that link to "#" on the live site are placeholders: they are NOT rendered (listed in docs/CONTENT_FLAGS.md).
 */
export type MenuItem = { label: string; href: string; external: boolean }
export type NavGroup = { key: string; label: string; items: MenuItem[] }
export type TopLink = { to: string; label: string }
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const norm = (h: string) => (h.endsWith('/') || /^https?:/.test(h) ? h : h + '/')

export const NAV: NavGroup[] = menu
  .filter((m) => m.children.length)
  .map((m) => ({ key: slug(m.label), label: m.label, items: m.children.filter((c) => !c.placeholder && c.href).map((c) => ({ label: c.label, href: norm(c.href), external: !!c.external })) }))
  .filter((g) => g.items.length)
export const TOP_LINKS: TopLink[] = menu.filter((m) => !m.children.length && m.href).map((m) => ({ to: norm(m.href), label: m.label }))
/** Live menu items that link to "#" (hidden until you decide whether to create the pages). */
export const HIDDEN_MENU_ITEMS = menu.flatMap((m) => m.children.filter((c) => c.placeholder).map((c) => `${m.label} > ${c.label}`))

export const CONTACT = COMPANY
export const SOCIAL = COMPANY.social
export const SITE_URL = COMPANY.siteUrl
