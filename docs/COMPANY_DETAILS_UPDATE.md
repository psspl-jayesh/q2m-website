# Company details update (feature/company-details)

## 1. Company details: where they live
All values are in `src/config/locale.ts` (`ADDRESS`, `COMPANY`, `fullAddress()`); nothing is hardcoded elsewhere.
- Legal name `COMPANY.legalName` = "Q2M Solution Private Limited" (TO CONFIRM: "Solution" or "Solutions": change that one value). Brand name `COMPANY.name` = "Q2M Solutions" (logo, header, marketing copy).
- Legal name is used only in: footer copyright line, Privacy Policy "Who we are" block, Contact page company block, Organization JSON-LD `legalName`.
- Address fields: addressLine1 "Indu Chacha Complex, near Chhani Jakat Naka Circle", addressLine2 "TP 13", locality "Chhani Jakatnaka", city "Vadodara", state "Gujarat", pinCode "390024", country "India".
- Map link `COMPANY.mapUrl` is built from the address (`https://www.google.com/maps/search/?api=1&query=<encoded address>`) and opens in a new tab (footer and Contact page).
- Phone `COMPANY.phone` = 8799465558: shown "+91 87994 65558", linked `tel:+918799465558`. Email unchanged.
- Footer, Contact page, Privacy Policy and the Organization/LocalBusiness JSON-LD (address, telephone, legalName, hasMap, areaServed India) read from the config.
- CIN (`COMPANY.cin`) and grievance officer stay as TODO (the Privacy Policy still says "CIN: to be confirmed").
- Removed from config: `googleBusinessProfile`, the Clutch social entry, `src/content/shared/certifications.json`, the Clutch and badge entries in `site-images.json`.
- Also removed the hardcoded "Pvt Ltd" from the designed home copy (`home.json`: "Q2M Solutions is ...") and two unused legal strings.

## 2. Removed: certification, partnership, badge and review claims
Nothing was written in their place. Technology mentions (Azure, Copilot Studio, Power BI ...) stay. The full before -> after list (77 entries) is in `docs/CONTENT_CHANGES.md`. Rules are in `scripts/apply-content.mjs`.

**Logos removed:** Clutch logo (light and dark), Microsoft Solutions Partner badges (2). Other logos stay (client logos and the Google reviews logo, now unlinked). The Clutch profile link is removed from the footer and the JSON-LD.

**Sections and claims removed per page**

| Page | Removed |
|---|---|
| / | Clutch "Review On / (N Reviews)" hero lines (1); stat; section "Microsoft Solution Partner"; section "Clutch Top AI Developer"; section "Trusted & Certified"; section "Microsoft-certified depth"; section "A Microsoft Solution Partner You Can Hold Accountable" |
| /ai-agent-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1); section "A Team of Certified AI Experts"; 1 claim sentence(s) in a paragraph (edited) |
| /ai-app-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /ai-chatbot-development-company/ | Clutch "Review On / (N Reviews)" hero lines (1); ISO 27001 mention removed from a list of security controls (edited); paragraph; heading left with no body |
| /ai-consulting-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /ai-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /ai-recommendation-systems/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /ai-solutions-development/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /azure-ai-and-machine-learning/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /azure-data-ai-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /azure-data-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /azure-database-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /azure-iot-solution/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /cloud-applications/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /cognitive-service-implementation/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /cyber-security-services/ | Clutch "Review On / (N Reviews)" hero lines (2); ISO 27001 mention removed from a list of regulations (edited) |
| /data-copilot-for-azure-ai/ | Clutch "Review On / (N Reviews)" hero lines (2); section "Microsoft Gold Partnership"; section "Award-Winning Excellence" |
| /data-lake-and-big-data-on-azure/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /deep-learning-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /digital-sustainability-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /digital-transformation-services/ | Clutch "Review On / (N Reviews)" hero lines (2); paragraph; heading left with no body |
| /enterprise-business-application/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /generative-ai-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /generative-ai-integration-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /hire-generative-ai-developers/ | 1 claim sentence(s) in a paragraph (edited) |
| /infrastructure-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /llm-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1); paragraph; heading left with no body |
| /machine-learning-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /machine-learning-models-on-azure/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /microsoft-fabric-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /mlops-consulting-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /modern-workplace/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /predictive-analytics-services-2/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /predictive-analytics-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /q2m-solutions-is-heading-to-ai4-2026/ | 1 claim sentence(s) in a paragraph (edited) |
| /rag-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /sharepoint-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /smart-glasses-ar-wearable-app-development-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| /technology-consulting-services/ | Clutch "Review On / (N Reviews)" hero lines (2) |
| /vibe-coding-services/ | Clutch "Review On / (N Reviews)" hero lines (1) |
| shared/stats | counter |

Home page (designed home): the added "Trusted & Certified" section is gone; the client logos remain under their live label "Our Global Clients". Results counters now show 3 (150+, 40%+, 6wk): the "Microsoft Solution Partner designations" counter is removed.

## 3. Search results
Terms: Singapore, +65, Cecil Street, Clutch, ISO 27001, Solution Partner, Azure Expert, Certified, certification.

**Shipped site (src, public, index.html, README, CLAUDE.md): 0 matches** for Singapore, +65, Cecil Street, Clutch, ISO 27001, Solution Partner and Certified. Remaining (all legitimate):
| Term | Where | Reason |
|---|---|---|
| "Azure Expert" (substring) | "Talk to Our Azure Experts" button on 5 Azure pages; "deep Azure expertise" on /azure-iot-solution/ | Call-to-action label and a skills statement, not the Azure Expert certification |
| "certification" | /azure-data-services/ "compliance certifications" | Describes the Microsoft Azure platform's own security compliance (technology usage), not a Q2M claim |

**Not shipped, still matching (by design):**
- `scripts/` (apply-content, sync-images, sync-content, audit-locale): the rules and patterns that find and remove these terms, and the Singapore to India overrides.
- `src/content/live/`, `src/content/live-shared/`: verbatim copies of the live site used to prove that nothing else changed (never loaded by the app).
- `docs/`, `docs/_prev/`: reports and logs that describe the removals.
- `Q2M_Website_Home/`, `audit/`, `Q2M_Brand_Kit/`: your source material and the earlier audit.

## 4. Social media links (not removed, waiting for your confirmation)
Defined once in `src/config/locale.ts` `COMPANY.social`: LinkedIn, Facebook, Instagram, YouTube (`COMPANY.linkedin` duplicates the LinkedIn URL). Shown in:
- Footer bottom row: all four (`src/components/Layout.tsx`)
- Organization JSON-LD `sameAs` on every page (`src/lib/seo.ts`)
- `SOCIAL` export in `src/lib/site.ts` (not used by any component)
