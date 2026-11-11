# Image completeness: live page vs local page

Measured in the browser (Vite dev server, 1024px, light mode) for all 61 routes: the set of image files rendered in `<main>` compared with the live page's images from `src/data/image-manifest.json` (hero, section images, logos, in live order).

**Excluded by design (never rendered):** Elementor `placeholder.png` (see `docs/PLACEHOLDER_SECTIONS.md`), theme demo images from zenfy-wp.egenslab.com (`banner-img-4.jpg`, `breadcrumb-bg.png`), decorative theme backgrounds and icons. The Clutch logo is the approved exception: it is served locally from `public/images/shared/clutch-logo.svg` (+ `clutch-logo-white.svg` for dark mode) in the hero meta line and is not counted below.
**Hero rule:** when a live page lists several hero images, the widest is used (`heroImage()` in `src/lib/images.ts`), so the counts exclude the 466px duplicate on the 6 pages listed in `docs/LOWRES_HEROES.md`. Images under 800px are never enlarged.

**Result: 61/61 routes accounted for. 56 match exactly; 3 case-study pages differ only by the related-case cards; the home page waits for your approval; /privacy-policy/ is new.** Image files referenced: all exist on disk; no broken image on any route after eager loading.

| Route | Live images | Local images | Result |
|---|---|---|---|
| / | 17 | 0 | PENDING YOUR APPROVAL: 15 images proposed (logos, process steps, blog thumbnails), see docs/HOME_IMAGE_MAPPING.md. Hero banners/ai4 promo: none. |
| /about/ | 12 | 12 | match |
| /ai-agent-development-services/ | 7 | 7 | match |
| /ai-app-development-services/ | 17 | 17 | match |
| /ai-chatbot-development-company/ | 18 | 18 | match |
| /ai-consulting-services/ | 19 | 19 | match |
| /ai-development-services/ | 7 | 7 | match |
| /ai-recommendation-systems/ | 9 | 9 | match |
| /ai-solutions-development/ | 17 | 17 | match |
| /azure-ai-and-machine-learning/ | 16 | 16 | match |
| /azure-data-ai-services/ | 14 | 14 | match |
| /azure-data-services/ | 17 | 17 | match |
| /azure-database-services/ | 17 | 17 | match |
| /azure-iot-solution/ | 17 | 17 | match |
| /blogs/ | 10 | 10 | match |
| /case-studies/ | 3 | 3 | match |
| /cloud-applications/ | 6 | 6 | match |
| /cognitive-service-implementation/ | 17 | 17 | match |
| /contact/ | 0 | 0 | match (no images live or local) |
| /cyber-security-services/ | 18 | 18 | match |
| /data-copilot-for-azure-ai/ | 17 | 17 | match |
| /data-lake-and-big-data-on-azure/ | 15 | 15 | match |
| /deep-learning-services/ | 8 | 8 | match |
| /digital-sustainability-services/ | 15 | 15 | match |
| /digital-transformation-services/ | 19 | 19 | match |
| /enterprise-business-application/ | 16 | 16 | match |
| /generative-ai-development-services/ | 7 | 7 | match |
| /generative-ai-integration-services/ | 8 | 8 | match |
| /infrastructure-services/ | 16 | 16 | match |
| /llm-development-services/ | 6 | 6 | match |
| /machine-learning-development-services/ | 18 | 18 | match |
| /machine-learning-models-on-azure/ | 15 | 15 | match |
| /microsoft-fabric-services/ | 18 | 18 | match |
| /mlops-consulting-services/ | 8 | 8 | match |
| /modern-workplace/ | 15 | 15 | match |
| /predictive-analytics-services-2/ | 9 | 9 | match |
| /predictive-analytics-services/ | 8 | 8 | match |
| /rag-development-services/ | 7 | 7 | match |
| /sharepoint-development-services/ | 8 | 8 | match |
| /smart-glasses-ar-wearable-app-development-services/ | 6 | 6 | match |
| /technology-consulting-services/ | 16 | 16 | match |
| /vibe-coding-services/ | 8 | 8 | match |
| /ai-agent-development-cost/ | 4 | 4 | match |
| /ai-chatbot-development-strategic-priority-2026/ | 3 | 3 | match |
| /ai-development-cost/ | 4 | 4 | match |
| /ai-development-lifecycle/ | 4 | 4 | match |
| /generative-ai-app-development-cost/ | 4 | 4 | match |
| /guide-microsoft-fabric-enables-real-time-analytics/ | 4 | 4 | match |
| /hire-generative-ai-developers/ | 4 | 4 | match |
| /how-software-consulting-services-help-you-choose-the-right-project-model/ | 4 | 4 | match |
| /impact-of-digital-transformation-in-pharma/ | 4 | 4 | match |
| /machine-learning-development-scalable-ml-solutions/ | 3 | 3 | match |
| /microsoft-dynamics-365-and-dynamics-365-business-central/ | 6 | 6 | match |
| /q2m-solutions-is-heading-to-ai4-2026/ | 4 | 4 | match |
| /sharepoint-framework-v1-22-1-a-stability-update-developers-shouldnt-skip/ | 4 | 4 | match |
| /the-transformative-power-of-ai-in-software-development/ | 4 | 4 | match |
| /top-ai-agent-development-companies/ | 3 | 3 | match |
| /case-study/building-a-single-pane-of-glass-for-a-1500-truck-fleet/ | 4 | 6 | +2 local: related-case cards from the shared CaseStudy template (not on the live detail page) |
| /case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/ | 0 | 2 | +2 local: related-case cards from the shared CaseStudy template (not on the live detail page) |
| /case-study/rele-one-building-a-national-real-estate-platform-with-vibe-coding/ | 0 | 2 | +2 local: related-case cards from the shared CaseStudy template (not on the live detail page) |
| /privacy-policy/ | 0 | 0 | New page (India/DPDP), no live equivalent |
