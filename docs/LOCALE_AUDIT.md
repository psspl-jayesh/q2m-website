# India localisation audit

Generated 2026-11-11T08:08:50.505Z by scripts/audit-locale.mjs. Read-only; run before the localisation changes.

## 1. Hardcoded region details in source code
- `src/lib/content.tsx:64` [locale call] export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
- `src/lib/site.ts:63` [phone numbers] email: 'info@q2msolutions.com', phone: '+65 8743 0992', phoneHref: 'tel:+6587430992',
- `src/lib/site.ts:64` [addresses / venues] address: '143 Cecil Street, 25-03, GB Building, Singapore', mapUrl: 'https://maps.app.goo.gl/HgnmwmcT8tpns2pMA',
- `src/pages/Company.tsx:71` [privacy / legal frameworks] consent: z.literal(true, { message: 'Please confirm you agree to be contacted.' }),
- `src/pages/Company.tsx:96` [privacy / legal frameworks] Object.entries(v).forEach(([k, val]) => k !== 'consent' && fd.append(k, String(val)))
- `src/pages/Company.tsx:156` [privacy / legal frameworks] <label className="flex items-start gap-3 text-sm text-ink-muted"><input type="checkbox" {...register('consent')} className="mt-1 size-5 acce
- `src/pages/Company.tsx:158` [privacy / legal frameworks] {errors.consent && <p className="mt-1.5 text-sm text-red-700">{errors.consent.message as string}</p>}
- `src/styles/index.css:137` [dates] .marquee-track { display: flex; width: max-content; gap: 2.5rem; animation: q2m-marquee 45s linear infinite; }

## 2. Content: currency symbols / codes (24 text items on 9 pages)
- /predictive-analytics-services-2/: `dollars`
- /predictive-analytics-services/: `dollars`
- /ai-consulting-services/: `$1`
- /ai-development-services/: `$5`
- /ai-chatbot-development-strategic-priority-2026/: `$9`, `$8`, `$2`
- /machine-learning-development-scalable-ml-solutions/: `$7`, `$5`, `$4`
- /ai-development-cost/: `USD`, `dollars`
- /generative-ai-app-development-cost/: `$1`, `USD`, `$3`, `$5`, `$2`, `$4`
- /ai-agent-development-cost/: `$1`, `$7`, `dollars`

## 2. Content: prices / cost figures (36 text items on 20 pages)
- /ai-recommendation-systems/: `Pricing Models at Q2`
- /predictive-analytics-services-2/: `Pricing Models at Q2`
- /mlops-consulting-services/: `Pricing Models at Q2`
- /deep-learning-services/: `Pricing Models at Q2`
- /predictive-analytics-services/: `Pricing Models at Q2`
- /vibe-coding-services/: `Pricing Models at Q2`
- /generative-ai-integration-services/: `Pricing Models at Q2`
- /sharepoint-development-services/: `Pricing Models at Q2`
- /llm-development-services/: `Pricing Models at Q2`
- /rag-development-services/: `Pricing Models at Q2`
- /smart-glasses-ar-wearable-app-development-services/: `Pricing Models at Q2`
- /ai-consulting-services/: `pricing model: ● Hourly rates: Typically`
- /ai-agent-development-services/: `Pricing Models at Q2`, `cost of AI agent development services wi`
- /machine-learning-development-services/: `Pricing Models at Q2`
- /ai-chatbot-development-strategic-priority-2026/: `Cost in 2026`
- /machine-learning-development-scalable-ml-solutions/: `costs into 2`
- /ai-development-cost/: `Pricing Guide on AI Development Cost in `, `Cost in 2026`
- /generative-ai-app-development-cost/: `Cost in 2026`, `100,000 or more per month`, `cost range: $3,000 to $15,000`, `cost range: $5,000 to $25,000`, `cost range: $5,000 to $30,000`, `cost range: $20,000 to $150,000`
- /ai-agent-development-cost/: `Cost in 2026`, `cost forecasts by more than 25`, `cost with Q2`
- /case-study/building-a-single-pane-of-glass-for-a-1500-truck-fleet/: `cost leakage by 15`, `cost leakage across 1,500`

## 2. Content: dates (7 text items on 4 pages)
- /: `6 August 2026`
- /ai-development-cost/: `January 2026`
- /q2m-solutions-is-heading-to-ai4-2026/: `Aug 4`, `August 4`, `August 3 `
- home.json:.bts.facts.2.v: `November 2026`

## 2. Content: times / timezones (19 text items on 14 pages)
- /mlops-consulting-services/: `24/7`
- /cyber-security-services/: `24/7`
- /generative-ai-integration-services/: `24/7`
- /llm-development-services/: `24/7`
- /rag-development-services/: `24/7`
- /generative-ai-development-services/: `24/7`
- /ai-agent-development-services/: `24/7`
- /ai-chatbot-development-company/: `24/7`
- /azure-data-ai-services/: `24/7`
- /ai-chatbot-development-strategic-priority-2026/: `time zone`
- /microsoft-dynamics-365-and-dynamics-365-business-central/: `24/7`
- /case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/: `24/7`
- home.json:.ingestedAt: `01:54`
- home.json:.faq.items.7.a.0: `time zones`

## 2. Content: phone numbers (4 text items on 4 pages)
- /contact/: `+6587430992`
- /case-study/rele-one-building-a-national-real-estate-platform-with-vibe-coding/: `+6587430992`
- /case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/: `+6587430992`
- /case-study/building-a-single-pane-of-glass-for-a-1500-truck-fleet/: `+6587430992`

## 2. Content: addresses / venues (19 text items on 17 pages)
- /llm-development-services/: `suite`
- /rag-development-services/: `suite`
- /smart-glasses-ar-wearable-app-development-services/: `suite`
- /ai-development-services/: `Suite`
- /cognitive-service-implementation/: `suite`
- /azure-database-services/: `suite`
- /contact/: `Cecil Street`
- /q2m-solutions-is-heading-to-ai4-2026/: `floor`
- /guide-microsoft-fabric-enables-real-time-analytics/: `suite`
- /microsoft-dynamics-365-and-dynamics-365-business-central/: `suite`
- /case-study/rele-one-building-a-national-real-estate-platform-with-vibe-coding/: `suite`
- home.json:.meta.description: `Bengaluru`
- home.json:.hero.meta.0: `Bengaluru`
- home.json:.hero.meta.1: `BIEC`
- home.json:.bts.facts.0.v: `Bengaluru`
- home.json:.bts.facts.1.v: `BIEC`
- home.json:.work.tiles.4.title: `BIEC`

## 2. Content: non-Indian regions (0 text items on 0 pages)
(none)

## 2. Content: privacy / legal frameworks (9 text items on 7 pages)
- /cyber-security-services/: `GDPR`
- /generative-ai-development-services/: `HIPAA`
- /ai-chatbot-development-company/: `GDPR`
- /enterprise-business-application/: `GDPR`
- /ai-development-cost/: `GDPR`
- /hire-generative-ai-developers/: `GDPR`, `SOC 2`
- /ai-development-lifecycle/: `GDPR`

## 3. American spellings in content
| word | occurrences | pages |
|---|---|---|
| optimization | 93 | 32 |
| customized | 89 | 34 |
| personalized | 62 | 23 |
| optimize | 48 | 27 |
| behavior | 45 | 17 |
| utilize | 36 | 25 |
| organizations | 35 | 22 |
| organization | 31 | 22 |
| utilizing | 27 | 15 |
| analyze | 27 | 19 |
| customization | 26 | 17 |
| modernization | 23 | 12 |
| customize | 21 | 14 |
| organized | 21 | 12 |
| optimizing | 20 | 15 |
| modeling | 19 | 9 |
| optimized | 17 | 13 |
| organize | 13 | 11 |
| personalization | 12 | 4 |
| analyzing | 12 | 8 |
| program | 11 | 6 |
| modernize | 11 | 7 |
| programming | 11 | 5 |
| maximize | 11 | 9 |
| prioritize | 10 | 10 |
| minimizing | 10 | 6 |
| programs | 8 | 8 |
| visualization | 7 | 4 |
| center | 7 | 5 |
| organizing | 7 | 7 |
| utilization | 7 | 6 |
| organizational | 6 | 6 |
| utilized | 6 | 5 |
| labor | 6 | 6 |
| summarizing | 6 | 4 |
| centralized | 6 | 3 |
| maximizing | 6 | 6 |
| behavioral | 5 | 2 |
| minimizes | 5 | 4 |
| defense | 5 | 1 |
| centered | 5 | 5 |
| optimizes | 5 | 5 |
| catalog | 5 | 2 |
| minimize | 4 | 4 |
| defenses | 4 | 3 |
| prioritizes | 4 | 4 |
| customizing | 4 | 4 |
| utilizes | 4 | 4 |
| personalize | 4 | 4 |
| behaviors | 4 | 4 |
| summarization | 3 | 2 |
| categorization | 3 | 2 |
| analyzes | 3 | 2 |
| centers | 3 | 3 |
| personalizer | 3 | 1 |
| recognizer | 3 | 1 |
| licenses | 3 | 1 |
| labeling | 2 | 2 |
| analyzed | 2 | 2 |
| standardized | 2 | 2 |
| summarize | 2 | 2 |
| centralize | 2 | 2 |
| visualize | 2 | 2 |
| customizable | 2 | 2 |
| prioritized | 2 | 2 |
| recognize | 2 | 2 |
| recognized | 2 | 2 |
| licensed | 2 | 1 |
| catalogue | 2 | 2 |
| catalogs | 1 | 1 |
| categorizing | 1 | 1 |
| centralizes | 1 | 1 |
| maximizes | 1 | 1 |
| centralizing | 1 | 1 |
| visualizations | 1 | 1 |
| fulfillment | 1 | 1 |
| colors | 1 | 1 |
| traveler | 1 | 1 |
| favorite | 1 | 1 |
| favor | 1 | 1 |

## 4. Forms and fields
- `src/components/BookingForm.tsx`: name, company, role, work email, industry, preferred day (Day 1/2/3), topic. No phone, no consent checkbox, no timezone/slots. Delivery by mailto or `VITE_BOOKING_ENDPOINT`.
- `src/pages/Company.tsx` (Contact): full-name, organization, tel-phone (generic 6+ chars), email-company, subject, message, consent. Posts to the live Contact Form 7 (id 18). No country field, no address fields.
- Blog search box (`src/pages/Stories.tsx`): no personal data.

## 5. SEO / metadata
- `index.html`: `<html lang="en">`, static title/description.
- `src/components/ui.tsx` Seo(): sets title, description, canonical, og:title/description/url/image/type, twitter:card, robots, JSON-LD. No og:locale, no hreflang.
- JSON-LD in `Home.tsx` (Organization, no address/phone/areaServed), `ServicePage.tsx` (Service, BreadcrumbList, FAQPage), `Stories.tsx` (Article/BlogPosting), `Company.tsx` (ContactPage).
- `public/sitemap.xml`, `public/robots.txt`: generated by `scripts/generate-seo.mjs`.
- Titles/meta from CMS: 60 entries; mention of India in titles: 0.

## 6. Summary counts (content)
- currency symbols / codes: 24
- prices / cost figures: 36
- dates: 7
- times / timezones: 19
- phone numbers: 4
- addresses / venues: 19
- non-Indian regions: 0
- privacy / legal frameworks: 9
