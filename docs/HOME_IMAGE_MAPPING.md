# Home page: section → content → image (review table)

The routed home page is now the **designed home** (`src/pages/HomeFolder.tsx`, data in `src/data/home.json`). Its design, section order and copy are unchanged. The live-structure home is kept as `src/pages/Home.tsx` (not routed). Nothing was deleted.
SEO title and description on the home page are the live ones. Images come from the live site only, unmodified.

| # | Home section (as routed) | Content | Image | Status / reason |
|---|---|---|---|---|
| 1 | Hero | Designed copy (eyebrow, headline, lead, CTAs, Bengaluru Tech Summit meta) | Slider of the 3 live home banners (`q2m-banner-img-2/-3/-1.webp`, 835×648). Clutch logo beside the CTAs (local copy, white in dark mode) | Applied. The slider replaces the designed dot field, as you asked earlier ("slider images like the live site"). Say if you want the dot field back |
| 2 | **Trusted & Certified** (added, live content) | Live certification list (Microsoft Solution Partner, Azure Expert, Clutch Top AI Developer, ISO 27001) | 2 Microsoft Solutions Partner badges (live files from /about/, unmodified); 8 live client logos (ZIMM Group, GAI Consultants, Apps 365, NStCM, e-peas Semiconductors, Integration Partners, Groupe Restalliance, Linde) under "Our Global Clients" | Applied. The design had no section for this; it is the one place where logos and badges match in meaning |
| 3 | BTS 2026 band | Designed copy | none | No matching live image |
| 4 | See the work | Designed copy, brand dot panels | none | Live case-study banners are not the work shown in the tiles (no clear match) |
| 5 | Services | Designed copy | none | Live home has no images in its services section |
| 6 | Industries | Designed copy (Automotive, Insurance, Life sciences, Real estate, Fintech, BPO) | none | **Skipped as decided:** the industry image set. It also would not match these six industries |
| 7 | **The Results Our Clients Measure** (added, live content) | 4 live counters: 150+, 40%+, 6wk, 2 (neutral labels, values from the shared stats config) | none | Live has no image here |
| 8 | About | Designed copy | none | — |
| 9 | How we work (4 steps: Discovery, Pilot, Production, Run and improve) | Designed copy | Step 01 Discovery: `discovery-consultation.webp` (live, 353×353) | Applied to step 01 only. Re-checked against the routed copy: Pilot / Production / Run and improve do not clearly match `planning-strategy`, `design-development`, `quality-assurance`, so they have none. Tell me if you want them anyway |
| 10 | Principles | Designed copy | none | — |
| 11 | Technology | Designed copy | none | — |
| 12 | The 30-minute session | Designed copy | none | — |
| 13 | **From The Team** (added, live content) | 3 live posts: AI chatbot development in 2026, Machine learning development guide, Top 12 AI agent development companies | The 3 live blog thumbnails (`ai-chabot.png`, `machine-learning.png`, `top-12-…-blog-img.webp`) | Applied via the shared post card |
| 14 | FAQ | Designed FAQ (11 questions) | none | Live FAQ not added: designed FAQ covers the same purpose |
| 15 | Book a session | Designed copy and booking form | none | — |

**Live home sections not added** (the design already covers the meaning, or they are excluded): "An AI Development Company Built Differently" (+ `solution-bg.png`, a theme background), "AI Development Services Built For Enterprise", "A Microsoft Solution Partner You Can Hold Accountable", "AI Development Built For Your Industry", "The AI and Microsoft Stack", the live 4-step engagement process, the second results block, "Our Creative Showcase" (theme demo), "Trusted By Our Clients" (3 testimonials), the Ai4 promo (`ai4-logo.png`). Tell me if you want any of them added.

Unchanged by this task: Microsoft badges only come from the live site (`/images/about/microsoft-*.png`).
