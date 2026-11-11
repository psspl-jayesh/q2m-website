# Home page: image mapping (awaiting your approval)

Nothing below is applied. The routed home page renders **no manifest images** (`<PageBody images={false}>`) until you approve.
Sources: live home page image list (`src/data/image-manifest.json`, path `/`) and the shared industry images used elsewhere on the live site.

| # | Home section (live heading) | Suggested live image | Reason |
|---|---|---|---|
| 1 | Hero: "Enterprise AI Development Company in India" | **none** (live has 3 generic banner illustrations: q2m-banner-img-1/2/3.webp, alt "illustration") | Generic artwork with no specific meaning; the brand dot-field hero already carries the section |
| 1a | Hero: Clutch rating | Clutch logo (`/images/shared/clutch-logo.svg`, white variant in dark mode) | Applied already via `ClutchBadge`; shown only next to the live "Review On … Reviews" line |
| 1b | Hero: "ai4" promo | **none** (`ai4-logo.png`) | Promo for the Ai4 event article; excluded earlier. Say if you want it back |
| 2 | Trusted & Certified | 8 client logos: ZIMM Group, GAI Consultants, Apps 365, NStCM, e-peas Semiconductors, integration-partners, Groupe Restalliance, Linde | Exact meaning match (client/partner logos). `integration-partners.png` is an icon-only mark with no readable name; its alt needs your wording |
| 3 | The Results Our Clients Measure (both copies) | **none** | Counters only; live has no image |
| 4 | An AI Development Company Built Differently | **none** (`solution-bg.png` is a theme background) | Decorative theme background, agreed not to render |
| 5 | AI Development Services Built For Enterprise | **none** | Live has no image in this section |
| 6 | A Microsoft Solution Partner You Can Hold Accountable | **none on home** (the two Microsoft Solutions Partner badges exist on /about/) | Meaning would match, but they are not on the live home page. Optional: reuse the About badges here. Your call |
| 7 | AI Development Built For Your Industry | **none on live home**. Optional: finance-banking-img, transportation-img, healthcare-img, manufacturing-img, government-img (live industry-page images) | Meaning matches 5 of 6 industries (Financial Services, Logistics & Supply Chain, Healthcare, Manufacturing, Public Sector). SaaS & Technology has no image, so the set would be uneven. Recommend **none** |
| 8 | The AI and Microsoft Stack We Build On | **none** | Live has no image |
| 9 | How our AI Development Engagements Work | 4 step images: discovery-consultation, planning-strategy, design-development, quality-assurance (353×353 webp) | Step names match the images; shown at or below 353px, never enlarged. Alts need review (currently file-name based) |
| 10 | Our Creative Showcase | **none** (only `right-arrow.png`) | Theme demo content, not migrated |
| 11 | Trusted By Our Clients | **none** (no image in this section; the logos are in section 2) | No duplicate logo row |
| 12 | From The Team | 3 blog thumbnails: ai-chabot.png (1672×941), machine-learning.png (1448×1086), top-12-ai-agent-development-companies…-blog-img.webp (1920×1080) | Each is the thumbnail of the post it links to |
| 13 | Questions Enterprise Buyers Ask Us (FAQ) | **none** | Text only |

**Summary:** clear matches are rows 2, 9, 12 (15 images). Everything else: none. Rows 6 and 7 are optional.
Reply "approve" (or list changes) and I will enable them through the same `imagesBySection` mechanism used on all other pages.
