# Q2M React rebuild: status report (2026-11-11)

## Stack and how it runs
Vite + React 19 + TypeScript + Tailwind v4 + React Router + Motion + React Hook Form + Zod + Lucide.

- `npm run content` pulls live content from the live site's content API into `src/data/content.json` (read-only).
- `node scripts/mirror-images.mjs` self-hosts the images in `public/media` and runs the content-hygiene pass.
- `npm run seo` writes the sitemap, robots.txt and `docs/page-tracker.csv`.
- `npm run dev` / `npm run build` run the app.

**Integration strategy:** headless. The live site's CMS stays the editing tool, and the React site renders its content at the same URLs. Every string comes from the CMS, with nothing invented.

## Done
- Design system: tokens in `src/styles/index.css` (8px spacing, one accent #0474EC sampled from the logo, Fraunces + Inter, shared radii).
- Header with keyboard and mouse mega menu, mobile accordion nav, footer.
- Homepage: 13 sections built from real content (credentials, differentiators, capabilities, Microsoft partnership, case studies, industries, delivery stepper, stack, team, insights, FAQ, CTA).
- Templates: service/solution (shape-driven sections, FAQ and Service/FAQ/Breadcrumb schema), case study (TOC, metrics band), case-study listing, blog listing (search, topic filter, pagination), article, About, Contact, 404, category route.
- Contact form: React Hook Form + Zod, posting to the real Contact Form 7 endpoint (form 18), with server errors shown and no fake success.
- Verified in a browser: all 61 content routes render exactly one H1, with no broken images, no console errors and no horizontal overflow at 360, 390, 768 and 1920px.

## Not done / honest gaps
1. **Not yet visually reviewed page by page.** I checked the homepage hero and one service page by screenshot. The other templates were verified structurally (see above), not by eye. All pages stay "Implemented, not QA Passed".
2. **Client-side rendered.** Googlebot can render it, but other crawlers and link previews will not see the content. The site needs pre-rendering or SSG before launch (e.g. a build-time prerender of the same routes).
3. **Content bundle is 900 KB (239 KB gzip).** Split per page before launch.
4. **Images: 13 MB** mirrored unoptimised. They need resizing and AVIF/WebP, plus `srcset`.
5. **No Lighthouse / Core Web Vitals / axe run yet**, and no 1024, 1280 or 1440px pass.
6. **Contact form delivery is unverified.** The form posts to Contact Form 7 but its hCaptcha is bound to q2msolutions.com. Set `VITE_HCAPTCHA_SITEKEY` for the new domain and test one real submission.
7. **Analytics (GA4 `G-7T9HVTW3TN`) and Crisp are not wired in yet.**
8. **Mega menu only lists pages that exist.** The live site's menu items for Azure OpenAI, Copilot Studio, Data Strategy, BI and Legal Copilot have no pages in the CMS or sitemap (the crawl found none). Confirm whether they are planned.
9. No news, webinar, video, ebook or author pages exist in the crawl, so none were built. Author names are not exposed, so articles are bylined "Q2M Solutions".

## Content issues found (need your decision)
- **Conflicting statistics:** service pages say 150 projects / 98% satisfaction / 3 min; About says 120+ / 95% / 24 hrs. I **omitted all stat counters** until one approved set is supplied. The homepage "Results our clients measure" block has no data.
- **Stale announcement:** the Ai4 2026 banner (4–6 Aug 2026) is already past, so I did not render it.
- **Placeholder text live on the site:** the case study contains "Within [X] months of rollout…". I dropped the sentence. Please supply the real figure.
- **Case-study outcome figures** (15%, 85%, 42%) are rendered as published. Please confirm they are client-approved.
- **Cyrillic lookalike letters** in 4 page titles and body text (e.g. "Azurе", "Databasе") break search and copy/paste. I normalised them (10 fixes, logged in `content.json` under `hygiene`).
- **Duplicate pages:** `/predictive-analytics-services/` and `/-2/` have identical titles. `/recommendation-engines/` is noindex but linked.
- **Wrong og:image** on the live homepage points at the theme vendor's demo domain.
- **39 noindex theme-demo / system pages** (e.g. `/saas-product-dark/`, `/cart/`, `/shop/`, 10 `/portfolio/*` items, `/test-form/`) were not migrated. They are listed in `docs/page-tracker.csv`. Please approve retiring or redirecting them.
- Six service pages have two H1s on the live site (the rebuild uses one).
- The site contained leftover template copy ("Feel free adapt this based on the specific managed services…") in the contact area. It was removed.

## Next steps
Visual QA of every template with fixes, pre-render, image optimisation, performance/a11y runs, and wiring analytics. I can continue with any of these in that order.

---

## Update: premium imagery and scroll motion (2026-11-11)

### Images
- `scripts/optimize-images.mjs` builds AVIF and WebP variants (320 to 2000px) of all 119 mirrored images and writes `src/data/images.json`. Variants never exceed the source width. The `Img` component renders `<picture>` with `srcset`, `sizes`, and real `width`/`height` (no layout shift).
- Audit finding: 20 of 30 service-page banners are only 466x291px at the source, which would be soft at hero size. They are not enlarged. Those pages use a brand panel (black slab, dot arrow, on-page index). The 10 pages with large originals use a photo hero with parallax.
- Parallax runs only on sources of 1600px or more (1.08 zoom). Mid-size sources get a frame capped at native width. The stepper images (353px) show at native size.
- Verified in the browser at 1440px and 390px: 374 images per viewport, none rendered above native resolution, none broken, no overflow.
- **Not done:** I cannot source new licensed photography. Some imagery is the existing site's generic stock. Replacing it needs a decision and assets from you. Client logos are tiny (e.g. 77x50px) and need high-resolution or SVG versions from the clients.

### Motion (`src/components/motion.tsx`)
- Tokens: easing, 200/350/650/1000ms durations, ~100ms stagger (capped at 0.7s total for long lists).
- `Reveal` (fade and rise), `StaggerGroup/Item`, `ImageFrame` (clip reveal and parallax), animated accordion and delivery stepper, animated mobile menu, hover movement on cards (borders, no shadows, per the brand kit).
- Reveal fix: the trigger uses a scroll check that reveals anything in view or already scrolled past, so content cannot stay hidden after jumping with End, anchor links or fast scroll. Checked on 5 pages.
- Reduced motion: all components render static content when `prefers-reduced-motion` is set. This path is implemented but I have not exercised it in a browser.
- Bug fixed: clicking the mega-menu trigger after hovering used to close it.

### Still open
Performance profiling (Lighthouse/INP), a manual look at every page at tablet width, pre-rendering, contact form delivery test, analytics wiring.

---

## Update: home page rebuilt from `Q2M_Website_Home` (2026-11-11)

**Source of truth for the home page:** `Q2M_Website_Home/index.html` (read-only). `scripts/ingest-home.mjs` extracts every section into `src/data/home.json`, so the copy is not retyped. The source folder was not modified (checked).

**Mapped:** hero (with the animated dot-arrow field ported from the folder's script), BTS 2026 band, See the work (6 tiles), 7 services, 6 industries, About, How we work (4 stages), 4 principles, Technology and keyword strip, 30-minute session, 11 FAQs, booking form, footer text. SEO title and meta description are the folder's.

**Not published (see `docs/CONTENT_GAPS.md`):**
- 21 `[TBC]` placeholders are stripped: BTS stand and exact dates, contact phone, LinkedIn URL, CIN, registered office, and all three founder entries. The Team section is therefore left out of the home page. The live About page still shows its existing team.
- 15 image slots have no real image: the folder contains only the two logos. Nothing was substituted with stock. Tiles show brand dot-pattern panels with their captions until real captures are supplied.
- Booking form is not connected. Set `VITE_BOOKING_ENDPOINT` to POST to a real service. Until then it validates, then opens a pre-filled email draft to info@q2msolutions.in and says nothing has been sent.

**Decisions needed (conflicts between the folder and the live site):**
1. Location: the folder says India. The live Contact page says Singapore (143 Cecil Street, +65 phone). The footer now follows the folder (email, India). The Contact page keeps the live details.
2. The live home page claimed Microsoft Solution Partner status, ISO 27001, client logos and "150 projects". None of it is in the new copy, so it is not on the home page. Say if any should return.
3. Agentic commerce and 3D Gaussian splatting have no service pages. They are not linked.
4. The new copy's claims (device list, fixed-price discovery, IP ownership, NDA policy, one-week follow-up) are flagged in the source notes as needing confirmation.
