import { useLocation } from 'react-router-dom'
import { useContent } from './content'
import { NAV, TOP_LINKS, type MenuItem, type NavGroup, type TopLink } from './site'

/**
 * Single source of truth for "which menu item is the current page".
 * Used by the desktop header, the mega menu and the mobile menu. Nothing else decides what is active.
 */

/** Ignore query string, hash, letter case, duplicate slashes and trailing slash. "/" stays "/". */
export function normalizePath(p: string): string {
  let s = p.split('#')[0].split('?')[0].toLowerCase().replace(/\/{2,}/g, '/')
  if (!s.startsWith('/')) s = '/' + s
  s = s.replace(/\/+$/, '')
  return s || '/'
}

/** Exact match, or (when `prefix`) the current path sits below href, e.g. /case-study/x under /case-study. */
export function isActivePath(current: string, href: string, prefix = false): boolean {
  const a = normalizePath(current)
  const b = normalizePath(href)
  return a === b || (prefix && b !== '/' && a.startsWith(b + '/'))
}

/** Routes that belong to a menu item even though they sit outside its own URL (articles live at /<slug>/, case studies at /case-study/). */
const RELATED: Record<string, { prefixes?: string[]; articles?: boolean }> = {
  '/blogs/': { prefixes: ['/category/'], articles: true },
  '/case-studies/': { prefixes: ['/case-study/'] },
}

/** Pure matcher so it can be tested without React. `isPost` says whether the current path is a blog article. */
export function matchers(pathname: string, isPost: boolean) {
  /** A menu item is active on exact match, or on the routes related to it. External items never match. */
  const child = (it: MenuItem) => {
    if (it.external) return false
    const r = RELATED[normalizePath(it.href) + '/'] ?? RELATED[it.href]
    return isActivePath(pathname, it.href) || (r?.prefixes ?? []).some((m) => isActivePath(pathname, m, true)) || (!!r?.articles && isPost)
  }
  /** A top-level group is active if any of its items matches the current route. */
  const group = (g: NavGroup) => g.items.some(child)
  /** Direct links (About, Contact) are active on exact match and on sub-pages. */
  const top = (l: TopLink) => isActivePath(pathname, l.to, true)
  return { child, group, top }
}

/** React hook: recomputes on every client-side route change. */
export function useActiveNav() {
  const { pathname } = useLocation()
  const c = useContent()
  const cur = normalizePath(pathname)
  const isPost = c.posts.some((p) => normalizePath(p.path) === cur)
  const m = matchers(cur, isPost)
  return { ...m, activeGroupKey: NAV.find(m.group)?.key ?? null, hasActiveTop: TOP_LINKS.some(m.top) }
}

/** aria-current value for a link (page) or a group trigger (true: current page is inside it). */
export const ariaCurrent = (active: boolean, kind: 'page' | 'true' = 'page') => (active ? kind : undefined)
