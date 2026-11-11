# Footer, company name and contact form (feature/footer-and-forms)

## 1. Company name
- `COMPANY.legalName` = "Q2M Solutions Private Limited" (one value in `src/config/locale.ts`). Brand name stays "Q2M Solutions".
- CIN: empty TODO field `COMPANY.cin`. While it is empty nothing about the CIN is shown (the Privacy Policy line only appears once a CIN is set).

## 2. Badges removed
- Google reviews logo removed from the footer; the image file, its optimised copies, its alt text and its site-images entry are deleted; the image sync skips it. (`COMPANY.googleBusinessProfile` was already gone.)
- No Clutch logo or badge image is left anywhere (files, manifest, components).
- Kept: Microsoft, Azure and ISO certifications and all social links.
- "Clutch Top AI Developer / APAC region" text, **not removed, your decision**:
  - Home page: hero line "Clutch Top AI Developer" and the Trusted & Certified card "Clutch Top AI Developer / APAC region" (`src/content/pages/home.json`, `src/content/shared/certifications.json`).
  - /q2m-solutions-is-heading-to-ai4-2026/: "…have been recognised by Clutch as a Top AI Developer in the APAC region…" (`src/content/pages/q2m-solutions-is-heading-to-ai4-2026.json`).

## 3. Compact footer
Height measured on a service page, light theme.

| Width | Before | After | Change |
|---|---|---|---|
| 360px | 1,908px | 795px | −58% |
| 768px | 1,460px | 783px | −46% |
| 1024px | 1,169px | 767px | −34% |
| 1440px | 1,021px | 577px | −43% |

Screenshots: `docs/readme/footer_before_{360,768,1024,1440}.jpg` and `docs/readme/footer_after_{360,768,1024,1440}.jpg`.

What changed: less padding and smaller gaps; logo, short description and contact details in one column; link groups in compact columns (the 11-item Solutions group uses two columns); bottom row with copyright, legal links, social icons and the theme switch on one line on desktop. Below 1024px the four link groups are accordions, closed by default; contact details and social icons stay visible. All 41 footer links, the address (map link), phone and email are kept. Social links are now icons with their names as accessible labels.

## 4. Forms
See `docs/FORM_DELIVERY_OPTIONS.md` for the live form report (Contact Form 7, form 18, hCaptcha, Google Analytics, no visible CRM) and the three delivery options. Until you choose, the Contact and booking forms open a pre-filled email to info@q2msolutions.com; nothing is posted to the WordPress site any more.

## 6. Checks
- Footer and Contact sweep: 9 page types (home, service, article, case study, About, Contact, Blogs, Case Studies, Privacy) at 360, 768, 1024 and 1440px in light and dark = 72 loads. No horizontal overflow, no clipped or overlapping text, no contrast failures, no console errors, one H1, no layout shift above 0.1, same 41 footer links everywhere.
- Accordions and form: 20 of 20 tests pass (touch open and close, keyboard Enter/Space/Tab with a visible focus ring, desktop always open, contact details and social icons always visible on phones, Contact form shows the email-draft message and posts nothing to WordPress).
- Found and fixed on the way: layout shift on Home (360px) and Privacy (768px) caused by the brand fonts arriving after the first paint. The two main fonts (DM Sans, Sora) are now preloaded; layout shift is 0 in repeated runs, each font downloads once.
