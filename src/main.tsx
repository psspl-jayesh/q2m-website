import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import '@/styles/index.css'
import Layout from '@/components/Layout'
import { ContentProvider, findEntry, useContent } from '@/lib/content'
import Home from '@/pages/HomeFolder'
import ServicePage from '@/pages/ServicePage'
import { About, Contact, NotFound } from '@/pages/Company'
import PrivacyPolicy from '@/pages/PrivacyPolicy'
import siteImages from '@/data/site-images.json'
import { LEGAL } from '@/config/locale'
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

const Splash = <div className="grid min-h-screen place-items-center bg-surface"><img src={siteImages.brand.logoColor.file} alt={siteImages.brand.logoColor.alt} width={120} height={72} /></div>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider fallback={Splash}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/category/:slug/*" element={<CategoryRoute />} />
            <Route path={LEGAL.privacyPath} element={<PrivacyPolicy />} />
            <Route path="*" element={<Resolver />} />
          </Route>
        </Routes>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
)
