import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from '@/components/Layout'
import { findEntry, useContent } from '@/lib/content'
import Home from '@/pages/HomeFolder'
import BtsLanding from '@/pages/BtsLanding'
import ServicePage from '@/pages/ServicePage'
import { About, Contact, NotFound } from '@/pages/Company'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import siteImages from '@/data/site-images.json'
import { LEGAL } from '@/config/locale'
import { BTS } from '@/config/bts'
import { Article, Blogs, CaseStudies, CaseStudy, CategoryRoute } from '@/pages/Stories'

/** Resolves any CMS path (kept identical to the live site's URLs) to the right template. */
function Resolver() {
  const c = useContent()
  const { pathname } = useLocation()
  const e = findEntry(c, pathname)
  if (!e) return <NotFound />
  if (e.slug === 'q2m-solutions') return <Home />
  if (e.type === 'case-study') return <CaseStudy entry={e} />
  if (e.type === 'post') return <Article entry={e} />
  if (e.slug === 'about') return <About entry={e} />
  if (e.slug === 'contact') return <Contact entry={e} />
  if (e.slug === 'case-studies') return <CaseStudies entry={e} />
  if (e.slug === 'blogs') return <Blogs entry={e} />
  return <ServicePage entry={e} />
}

export const Splash = <div className="grid min-h-screen place-items-center bg-surface"><img src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={120} height={72} /></div>

/** The route tree, shared by the browser (src/main.tsx) and the build-time pre-render (src/entry-server.tsx). */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/category/:slug/*" element={<CategoryRoute />} />
        <Route path={LEGAL.privacyPath} element={<PrivacyPolicy />} />
        <Route path={BTS.path} element={<BtsLanding />} />
        <Route path="*" element={<Resolver />} />
      </Route>
    </Routes>
  )
}
