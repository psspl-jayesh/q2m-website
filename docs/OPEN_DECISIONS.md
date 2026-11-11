# Open issues and decisions

From `docs/FINAL_STATUS.md` (status "Not ready") plus items found since. Severity: High = blocks launch, Medium = fix soon, Low = polish, Decision = needs your answer before work.

| # | Issue | Page(s) | Severity |
|---|---|---|---|
| 1 | Performance: Lighthouse mobile (Slow 4G) LCP about 4.7 to 5.0 s, performance score 76 to 82. Needs bundle splitting and image preloading | All pages (home 76, service 80, article 82, contact 82) | Medium |
| 2 | Long live button labels (45 to 56 characters) wrap to two lines on phones (360/390px). No clipping or overflow. Accept two lines, or approve shorter text | /azure-ai-and-machine-learning/, /cyber-security-services/, /digital-transformation-services/, /enterprise-business-application/, /infrastructure-services/, /technology-consulting-services/ | Low / Decision |
| 3 | Lighthouse SEO 92: one non-descriptive link text left | Home | Low |
| 4 | Conflicting live stat values stay hidden (79 stat blocks). Approve one value per stat: `docs/STATS_FOR_APPROVAL.md` | About and about 36 service pages | Decision |
| 5 | SEO titles over 60 characters (18) and descriptions over 155 (10): proposals in `docs/SEO_PROPOSALS.md` (not applied) | 28 pages | Low / Decision |
| 6 | Legal review of the draft Privacy Policy and consent wording (DPDP Act text) | Privacy Policy, every form | High (legal) |
| 7 | Legal name: done ("Q2M Solutions Private Limited", one value `COMPANY.legalName`) | Footer, Privacy, Contact, JSON-LD | Done |
| 8 | CIN (empty TODO in config, nothing shown while empty) and grievance officer still missing | Privacy Policy | Medium |
| 9 | Google reviews logo: removed from the footer (and the profile URL setting) | Footer | Done |
| 10 | Check the Instagram handle "qtomsolutions" (it is what the live site links to) | Footer, JSON-LD | Low |
| 11 | Home hero: dot field (current) or slider of the 3 live banners | Home | Decision |
| 12 | Home topic images: review pairings (Insurance, Agentic commerce, Automotive) and industry images: `docs/HOME_IMAGES.md` | Home | Decision |
| 13 | Topic images in text-only sections (73 sections on 36 pages) and their alt texts: `docs/TOPIC_IMAGES.md` | 36 service pages | Decision |
| 14 | Mega-menu intro and Featured text: `docs/MEGA_MENU_COPY.md` | Header on every page | Decision |
| 15 | Placeholder sections (live site shows Elementor placeholder): `docs/PLACEHOLDER_SECTIONS.md` | 34 pages | Info |
| 16 | 466px heroes shown in a contained card: `docs/LOWRES_HEROES.md` | 23 pages | Info |
| 17 | Not tested yet: below-the-fold visual review of every page, Safari and Firefox, real touch devices, a real booking or contact submission | All | Medium |
| 18 | Contact and booking form delivery: choose option A, B or C in `docs/FORM_DELIVERY_OPTIONS.md`, and tell me if a CRM should also receive submissions (check WordPress: Contact Form 7, form 18, Mail tab). Until then both forms open a pre-filled email to info@q2msolutions.com | Contact, Home booking form | Decision |
| 19 | "Clutch Top AI Developer / APAC region" text: keep or remove. Locations: home page hero line and Trusted & Certified card (`src/content/pages/home.json`, `src/content/shared/certifications.json`), and the Ai4 article paragraph ("recognised by Clutch as a Top AI Developer in the APAC region") | Home, /q2m-solutions-is-heading-to-ai4-2026/ | Decision |
| 20 | Privacy Policy placeholders still shown as "to be confirmed": retention period, grievance officer, analytics tools (the page is a draft, noindex) | Privacy Policy | Decision (legal) |
| 21 | BTS 2026 band details (event, venue, dates and stand facts from the designed home copy) | Home | Decision |

