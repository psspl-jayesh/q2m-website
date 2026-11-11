# India localisation (2026-11-11)

Single source of truth: `src/config/locale.ts` (locale, currency, timezone, dial code, booking hours, company details, consent wording, states and UTs).
Shared helpers: `src/lib/format.ts` (currency, numbers, dates, IST times, booking slots, phone, PIN, GSTIN), `src/lib/seo.ts` (India titles/descriptions, Organization/LocalBusiness data), `src/components/forms.tsx` (mobile field, GSTIN and address block, consent checkbox).
The pre-change audit is in `docs/LOCALE_AUDIT.md` (snapshot, run by `scripts/audit-locale.mjs`).

## What was done
- `<html lang="en-IN">`; `og:locale en_IN`, `hreflang="en-IN"` and a canonical URL on every page (verified on 62 routes).
- Organization + LocalBusiness JSON-LD on every page (`areaServed: India`, `addressCountry: IN`). Service pages also carry `areaServed`.
- India in titles and descriptions: service pages, About, Case studies, Insights and Contact. Titles of articles and the home page are unchanged (the home title already says India).
- Spelling: 983 American spellings converted to Indian (British) English across the synced content by `scripts/localise-content.mjs` (150 distinct forms reviewed; product names protected). Re-run it after `npm run content`.
- Dates: all dates go through `formatDate` ("11 Nov 2026"). Times are IST.
- Booking form: dates and times offered in IST, Mon to Fri, 10:00 to 18:00 (configurable), 30-minute slots, 2-hour lead time. These are requests, not confirmed bookings.
- Phone: +91 prefix fixed, 10-digit Indian mobile validated (6-9 start), shown as "+91 98765 43210".
- Optional GSTIN (15-character format) and Indian address (address line, city, state or union territory, 6-digit PIN). All 28 states and 8 UTs. No country selector exists; country is fixed to India.
- Consent checkbox with a Privacy Policy link on both forms (booking, contact), worded for the DPDP Act, 2023.
- New page `/privacy-policy/`: **DRAFT, set to noindex, flagged on the page for legal review.** It is generated text, not legal advice.
- `sitemap.xml` has hreflang alternates; `robots.txt` unchanged (allows all, points to the sitemap).
- Singapore address and +65 phone removed from the footer and Contact page.

## Needs your input (nothing below was invented)
1. **Indian registered office / contact address, PIN, and map link.** `COMPANY.address`, `COMPANY.mapUrl`. Until set, the footer and Contact page show "India" and the email only.
2. **Indian phone number** (`COMPANY.phone`, 10-digit). Until set, no phone is shown or put in structured data.
3. **Registered office and CIN** for the Privacy Policy and footer legal line.
4. **Grievance officer** name, designation and email (`COMPANY.grievanceOfficer`), required by the DPDP Act.
5. **Legal review** of the Privacy Policy and the consent wording (`LEGAL.consentLabel`). Also: data retention period, list of service providers and whether any are outside India, analytics tools in use.
6. **Booking delivery**: set `VITE_BOOKING_ENDPOINT`. Until then the form opens a pre-filled email draft. The contact form still posts to the existing Contact Form 7 (id 18), which has no GSTIN or address fields, so those go inside the message text; its hCaptcha key is bound to the old domain.
7. **Business hours and booking rules** are my assumption (Mon to Fri, 10:00 to 18:00 IST). Confirm in `BOOKING`.

## Not converted: needs a decision
- **USD amounts (about 40) on 5 pages.** Converting at an invented exchange rate would create prices Q2M never set, so none were converted.
  - Q2M cost ranges: `/generative-ai-app-development-cost/` ($3,000 to $15,000; $5,000 to $25,000; $5,000 to $30,000; $20,000 to $150,000; others), `/ai-consulting-services/` ($100, $300, $10,000, $250,000), `/ai-development-services/` ($5000, $500,000). Please give real INR ranges; `formatCurrency` and `formatCurrencyWords` (lakh/crore) are ready.
  - Third-party market statistics in USD ("$9.56 billion", "$73.81 billion", "$100 billion"): `/ai-chatbot-development-strategic-priority-2026/`, `/machine-learning-development-scalable-ml-solutions/`, `/ai-agent-development-cost/`, `/ai-development-cost/`. These are cited global figures; converting them would misquote the source. Decide: keep with the source currency, or remove.
- **Compliance claims naming other regimes.** GDPR, HIPAA and SOC 2 appear on `/cyber-security-services/`, `/generative-ai-development-services/`, `/ai-chatbot-development-company/` (also "MAS TRM" and "PDPA", which are Singapore rules), `/enterprise-business-application/`, `/ai-development-cost/`, `/hire-generative-ai-developers/` (SOC 2 Type II), `/ai-development-lifecycle/`. These are capability claims, so I did not swap them for the DPDP Act. Please confirm which are true and whether to add DPDP.
- **Non-Indian region references:**
  - `/q2m-solutions-is-heading-to-ai4-2026/`: Las Vegas event, "Singapore's enterprise AI development company", "APAC", "150+ projects", ISO 27001. The event date has passed. Recommend retiring or rewriting.
  - `/ai-agent-development-cost/`: "Asia Pacific is the fastest-growing market" (cited statistic).
  - `/ai-development-services/`, `/ai-development-cost/`: "Fortune 500 companies" (not a region, but US-centric wording).
  - Client facts kept as published: Australian clients in two case studies (Rele.one, Avenue Group Australia, Perth), a Denver-based client in the fleet case study, two Canadian companies in `/top-ai-agent-development-companies/`. These describe real third parties and were not changed.
  - The old live home page (still in `src/data/content.json` but no longer shown) said "Singapore's Enterprise AI Development Company" and "governed by the regulations of Singapore".
- **Dates in the old Ai4 content**: "4 to 6 August 2026" is past.

## Performance (Indian mobile networks)
Done: all content images are served as AVIF/WebP at several widths, lazy-loaded below the fold, with real dimensions to avoid layout shift. Not done: the content bundle is still about 900 KB (240 KB gzip) loaded as one file, and I have not run Lighthouse or tested on throttled mobile. Next step would be to split the content per page and pre-render.

## Optional: restrict access to visitors in India
Not implemented, as you asked for confirmation first. It needs hosting/CDN rules (for example Cloudflare country rules) and a themed "available in India only" page, with search crawlers allowed. Tell me the hosting provider and I can prepare it.
