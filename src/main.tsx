import { StrictMode, useEffect } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import { ContentProvider, loadContent, normPath, type Content } from '@/lib/content'
import { setHydrating } from '@/lib/ssr'
import { btsPhase } from '@/config/bts'
import { AppRoutes, Splash } from '@/App'

/** Marks the end of the first render, so later in-app navigation uses the normal (client-only) behaviour. */
function HydrationDone() {
  useEffect(() => { setHydrating(false); document.documentElement.classList.remove('bts-stale') }, [])
  return null
}

const app = (initial: Content | null) => (
  <StrictMode>
    <BrowserRouter>
      <ContentProvider fallback={Splash} initial={initial}>
        <AppRoutes />
        <HydrationDone />
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>
)

const root = document.getElementById('root')!
const html = document.documentElement
if (!root.hasChildNodes()) {
  // No pre-rendered HTML (development server): render in the browser with the splash screen while content loads
  setHydrating(false)
  createRoot(root).render(app(null))
} else {
  // Pre-rendered page: hydrate it, unless it was built for another URL (host fallback page) or before a BTS date
  // boundary that has since passed (then the BTS items in the HTML are out of date, so render fresh in the browser).
  const sameRoute = html.dataset.prerendered === normPath(location.pathname)
  const sameBtsPhase = !html.dataset.btsPhase || html.dataset.btsPhase === btsPhase()
  loadContent().then((c) => {
    if (sameRoute && sameBtsPhase) { setHydrating(true); hydrateRoot(root, app(c)) }
    else { setHydrating(false); root.replaceChildren(); createRoot(root).render(app(c)) }
  })
}
