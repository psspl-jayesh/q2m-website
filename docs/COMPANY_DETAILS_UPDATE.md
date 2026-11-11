# Company details update (feature/company-details)

## Correction: only the Clutch logo is removed
My first pass also removed certification and partnership content you had not asked to remove. That is fixed with git, without rewriting history:
1. `git revert` of the step 3 commit (`58e683a`) and the step 2 commit (`5e9b1c8`), which brought back every removed claim, section, stat and badge file.
2. One new commit (`fd623e3`) that removes **only the Clutch logo**: the light and dark Clutch logo images, the footer Clutch badge, the link to the Clutch profile, and the "Review On" and "(N Reviews)" lines that sit next to the logo.
3. The text "Clutch Top AI Developer" and "APAC region" stays (home page, About section, Ai4 article).

### Proof: before and after
"Before" is the site as it was before this task (`adfb31c`), "after" is the current branch.

| Item | Before | After |
|---|---|---|
| "Trusted & Certified" section (home) | present | present |
| Microsoft Solution Partner (text and badge) | present | present (text on home and service pages; the 2 badge images on About, restored byte for byte) |
| Azure Expert, ISO 27001 items (home) | present | present |
| "Clutch Top AI Developer / APAC region" text | present | present |
| "Microsoft-certified depth" card | present | present |
| "A Microsoft Solution Partner You Can Hold Accountable" section | present | present |
| "Microsoft Solution Partner designations" counter | present | present |
| Microsoft Gold Partnership, Award-Winning Excellence (Data Copilot page) | present | present |
| "A Team of Certified AI Experts" (AI Agent page) | present | present |
| ISO 27001 in the chatbot and cyber security text | present | present |
| Content blocks that differ | | **56 only:** 25 "Review On" lines, 18 "(50 Reviews)" lines, and the "Review On" label on 13 headings (38 pages) |
| Clutch logo images (light, dark), footer Clutch badge | present | removed |
| Clutch profile link | present | removed (footer badge link and the Clutch entry in the social list) |
| Google reviews logo in the footer | present, unlinked | present, unlinked |

Content verification after the fix: identical 4,877, changed 725 (spelling, Cyrillic fixes, typos, India overrides), **unexplained 0**. The overrides list in `docs/CONTENT_CHANGES.md` shows the earlier India overrides plus a new section "Clutch logo removal" with the 56 lines. Nothing else was changed in the content.

## Company details (kept, step 1)
All values are in `src/config/locale.ts` (`ADDRESS`, `COMPANY`, `fullAddress()`); nothing is hardcoded elsewhere.
- Legal name `COMPANY.legalName` = "Q2M Solution Private Limited" (TO CONFIRM: "Solution" or "Solutions": change that one value). Brand name `COMPANY.name` = "Q2M Solutions" (logo, header, marketing copy).
- Legal name is used only in the footer copyright line, the Privacy Policy "Who we are" block, the Contact page company block and the Organization JSON-LD `legalName`.
- Address: addressLine1 "Indu Chacha Complex, near Chhani Jakat Naka Circle", addressLine2 "TP 13", locality "Chhani Jakatnaka", city "Vadodara", state "Gujarat", pinCode "390024", country "India".
- Map link `COMPANY.mapUrl` is built from the address (`https://www.google.com/maps/search/?api=1&query=<encoded address>`), opens in a new tab (footer and Contact page).
- Phone `COMPANY.phone` = 8799465558, shown "+91 87994 65558", linked `tel:+918799465558`. Email unchanged.
- Footer, Contact page, Privacy Policy and the Organization/LocalBusiness JSON-LD (address, telephone, legalName, hasMap, areaServed India) read from the config. CIN and grievance officer stay as TODO.
- Also removed: the hardcoded "Pvt Ltd" in the designed home copy (`home.json`: "Q2M Solutions is ...") and two unused legal strings.

## Social media links (all kept, confirmed)
Defined once in `src/config/locale.ts` `COMPANY.social`: LinkedIn, Facebook, Instagram, YouTube. Shown in the footer bottom row (`src/components/Layout.tsx`) and in the Organization JSON-LD `sameAs` (`src/lib/seo.ts`).

**Instagram: `https://www.instagram.com/qtomsolutions/`.** It is not from us: it comes from the live site. The live Contact page has an icon-only Instagram link in its "Social Just You Connected Us!" block (LinkedIn, Facebook, Instagram), and the live case-study page links the same account. Evidence in the repo: `audit/contact.html` (the live Contact page HTML, the link is on line 669) and `audit/external_links.csv`. Please check the handle: it reads "qtomsolutions" (q-t-o-m), not "q2msolutions", which may be a typo on the live site. Say so if you want it changed or removed.

## Search results (shipped site: src, public, index.html, README, CLAUDE.md)
| Term | Matches | Note |
|---|---|---|
| Singapore, +65, Cecil Street | 0 | gone from the shipped site and data |
| Clutch | 4 lines | only the kept text "Clutch Top AI Developer" (home, certifications data, Ai4 article) |
| ISO 27001, Solution Partner, Azure Expert, Certified, certification | present | restored on purpose (you asked for everything but Clutch to stay) |

## Check results (affected pages, final code)
344 loads = 43 pages x 360, 768, 1024, 1440 px x light and dark (every page where a section or line was removed or restored, plus Home, About, Contact and Privacy; the footer is on every page). No horizontal overflow, no overlapping or clipped text, no hidden content, no broken images, no contrast failures, one H1 everywhere, no console errors, no layout shift above 0.1, no empty sections left behind. Findings fixed on the way: layout shift on the Privacy page (the longer company paragraph re-wrapped when the web font loaded; the company block is now split into short lines). Still open (known, on `docs/OPEN_DECISIONS.md`): the 6 long-label buttons that wrap on phones.
Screenshots: `docs/readme/contact_1440_light.jpg`, `contact_390_dark.jpg`, `footer_1440_light.jpg`, `footer_390_dark.jpg`; Trusted & Certified before and after: `trusted_before.jpg`, `trusted_after.jpg`.

## Trusted & Certified (home)
Redesigned at your request (same live content, no new text): follows the light or dark theme, same title and card styles as the other sections, a wide first card with both Microsoft badges, three cards, and a client-logo wall.

