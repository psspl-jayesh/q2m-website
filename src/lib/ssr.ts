import { createContext } from 'react'

/**
 * Pre-rendering support (scripts/prerender.mjs writes static HTML for every route at build time).
 *
 * `isHydrating()` is true on the server and during the browser's first render of a pre-rendered page (hydration). Components
 * that would otherwise render something different in the browser (reveal animations, time-based values) use it to render
 * exactly what the server rendered, then update after mount. It turns false once the first render has committed.
 */
let hydrating = typeof window === 'undefined'
export const isHydrating = () => hydrating
export const setHydrating = (v: boolean) => { hydrating = v }

/** Server only: <Seo> hands the page's head data to the build (setSeo) so the tags go into the HTML. Null in the browser. */
export type HeadData = { seo?: SeoInput; setSeo: (s: SeoInput) => void }
export const HeadContext = createContext<HeadData | null>(null)

export type SeoInput = { title: string; description?: string; path: string; image?: string; noindex?: boolean; jsonLd?: object | object[] }
