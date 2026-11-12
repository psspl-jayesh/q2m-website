# Open decisions after launch

Launched with the release of 12 Nov 2026. Everything below is still waiting on a decision, on information from Q2M, or on a later step. Nothing here blocks the site from going live.

Severity: High = do soon (legal or business), Medium = fix soon, Low = polish, Decision = needs your answer before work.

## Pending

| # | Item | Where | What is needed | Severity |
|---|---|---|---|---|
| 1 | **Form delivery.** Web3Forms chosen and built in. Waiting on the access key: create it with info@q2msolutions.in and set `VITE_WEB3FORMS_ACCESS_KEY` in the build environment (`docs/FORM_DELIVERY_OPTIONS.md`). Privacy policy should name Web3Forms as a processor | Contact, home and BTS booking forms | Access key, legal review | High |
| 2 | **Legal review** of the draft Privacy Policy and the consent wording (DPDP Act). The page says "DRAFT: pending legal review" and is noindex until then | Privacy Policy, every form | Legal counsel review | High |
| 3 | **Privacy details** still shown as "to be confirmed by Q2M": service providers, retention period, grievance officer, analytics tools (kept visible on purpose for launch) | Privacy Policy | The real details | High |
| 4 | **Grievance officer** (DPDP Act): name, designation, email (`COMPANY.grievanceOfficer` in `src/config/locale.ts`) | Privacy Policy | The details | High |
| 5 | **CIN** (Corporate Identity Number): not shown while empty (`COMPANY.cin`) | Footer, Privacy, JSON-LD | The number | Medium |
| 6 | **Rebuild after the event.** After 19 Nov 2026, 6:00 PM IST, rebuild and re-upload once so the static files no longer contain the Bengaluru Tech Summit booking items (the browser already hides them) | Home, BTS landing | Rebuild + upload | Medium |
| 7 | **Testimonials** (Sarah Chen, Marcus Webb, Priya Roberts) are hidden on every page (`SHOW_TESTIMONIALS` in `src/config/flags.ts`) until confirmed as real, nameable clients | BTS landing, About | Real, approved testimonials | Decision |
| 8 | **Live demos at BTS:** flag off (`BTS.liveDemos` in `src/config/bts.ts`); all booth/stand/demo wording is neutral. Turn on if a booth with demos is confirmed | BTS landing, home | Confirmation | Decision |
| 9 | **"Clutch Top AI Developer / APAC region"** text: keep or remove. Only left in the Ai4 article paragraph | /q2m-solutions-is-heading-to-ai4-2026/ | Keep or remove | Decision |
| 10 | **Stats:** 150+, 40%+, 6wk, 2 approved. 79 other stat blocks with conflicting live values stay hidden until one value per stat is approved: `docs/STATS_FOR_APPROVAL.md` | About and 36 service pages | One value per stat | Decision |
| 11 | **SEO titles and descriptions:** 18 titles over 60 characters and 10 descriptions over 155; proposals in `docs/SEO_PROPOSALS.md` (not applied). `/case-studies/` has no meta description (its live page has no text) | 28 pages + /case-studies/ | Approve proposals / a description | Low / Decision |
| 12 | **Mega-menu text** (intro and Featured lines): `docs/MEGA_MENU_COPY.md` | Header on every page | Approve or edit | Decision |
| 13 | **Alt texts and topic images** for text-only sections (73 sections on 36 pages): `docs/TOPIC_IMAGES.md` | 36 service pages | Review | Decision |
| 14 | **Home image pairings** (Insurance, Agentic commerce, Automotive) and industry images: `docs/HOME_IMAGES.md` | Home | Review | Decision |
| 15 | **Low-resolution heroes** (466px sources shown in a contained card): `docs/LOWRES_HEROES.md` | 23 pages | Larger images, or accept | Low |
| 16 | **Placeholder sections:** where the live site shows a page-builder placeholder image, our pages show no image: `docs/PLACEHOLDER_SECTIONS.md` | 34 pages | Real images, or accept | Low |
| 17 | **Testing not yet done:** Safari and Firefox, real phones (iOS and Android), a real booking/contact submission once form delivery is chosen, a below-the-fold visual review of every page | All | Manual testing | Medium |
| 18 | **Footer "Solutions"** shows all 11 links (no "View all" because there is no page listing all solutions). Say if a Solutions overview page should be added | Footer | Decision | Low |
| 19 | **Long button labels** (45 to 56 characters) wrap to two lines on phones; no clipping | 6 service pages | Accept, or shorter text | Low |
| 20 | **Home hero:** dot field with the Q2M logo arrow (current), or a slider of the 3 live banners | Home | Decision | Low |
| 21 | **Instagram handle** "qtomsolutions" is what the live site links to; confirm it is the right account | Footer, JSON-LD | Confirmation | Low |
| 22 | **New home (branch new-home-page): "[TBC]" stat.** "Enterprise pilots delivered" shows [TBC] as in the design. Give the real figure or remove the card | Home | Number | High |
| 23 | **New home: BTS live demos.** The design says "Live demos at BTS 2026" and "at our BTS 2026 desk", but `BTS.liveDemos` is false (no desk with demos confirmed). Confirm, or the lines need neutral wording. They hide after the event either way | Home | Yes/no | High |

## Done (for reference)
- Pre-rendered static HTML for every route; Lighthouse mobile 98–100 on home, BTS landing, a service page and contact (`docs/PRERENDER.md`).
- Legal name "Q2M Solutions Private Limited", Vadodara address, phone +91 87994 65558, email info@q2msolutions.in; Clutch logo and Google review badge removed; social links kept.
- BTS landing page and home BTS items with automatic hiding after 19 Nov 2026, 6:00 PM IST; "Trusted & Certified" removed from home and BTS on request; client logos kept.
- Footer redesign; back-to-top button on every page; hero dot field shows the Q2M logo arrow; descriptive "Read more" links.
- Deployment: `docs/DEPLOYMENT_FOR_ADMIN.md`, redirect files in `docs/deploy/`, 404 page, sitemap and robots.txt.
