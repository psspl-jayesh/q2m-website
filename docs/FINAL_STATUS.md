# Final status: feature/final-fixes

Generated 2026-11-11. Honest rule: anything not actually checked is "Not tested".

## Overall status: NOT READY (do not merge)

Reasons:
1. **6 pages fail "buttons on one line" at phone widths (360/390px).** The live call-to-action labels on these pages are 45 to 56 characters long and cannot fit on one line in a 328px column. After tightening the shared button they wrap to two lines cleanly (no clipping, no overflow). Pages: /azure-ai-and-machine-learning/ (Speak with a Microsoft Azure AI Consulta); /cyber-security-services/ (Schedule Your Cybersecurity Consultation); /digital-transformation-services/ (Let’s Modernise Together – Talk to Our E; Start Your Transformation – Schedule a F); /enterprise-business-application/ (Connect with us today to start your ente); /infrastructure-services/ (Contact Us for your Infrastructure Asses); /technology-consulting-services/ (Accelerate Innovation and Growth – Speak). **Needs your decision:** accept two-line labels on phones, or approve shorter label text.
2. **Performance is below target on Lighthouse mobile (Slow 4G):** 76/80/82/82 (LCP about 4.7 to 5.0 s). Not fixed in this run (needs bundle splitting and image preloading, a larger change). Accessibility is 100 on all four pages after the fixes below.
3. Several items below need your decision before a merge makes sense.

Unexplained content differences: **0** (live vs local, `docs/CONTENT_VERIFICATION.md`: 4,920 identical blocks, 725 changed only by logged fixes).

## Page-by-page results (61 routes)

Coverage: 732 page loads = 61 routes x 12 (light and dark at 360, 768, 1024, 1440; light at 1280 and 1920; dark at 390 plus light at 390), real headless Chrome, scrolled top to bottom with images loaded, results in `docs/qa/sweep-results.jsonl` (not committed). Checks per load: horizontal overflow, overlapping text, clipped text, button text on one line, content stuck hidden, layout shift (CLS), exactly one H1, console and network errors, broken or stretched or heavily cropped or oversized images, alt attributes, sticky left column on (>= 1024px) and off (< 1024px), heading order, contrast at 1440px (WCAG AA) and internal links. Width columns show Pass only when light and dark both pass at that width (1280 and 1920: light only; 390: both). 1920 and 1280 dark are Not tested.

| Page | Content | Images | 360 | 390 | 768 | 1024 | 1280 | 1440 | 1920 | Light | Dark | Issues |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /about/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-agent-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-app-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-chatbot-development-company/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-consulting-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-recommendation-systems/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-solutions-development/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /azure-ai-and-machine-learning/ | Pass | Pass | Fail | Pass | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Speak with a Microsoft Azure AI Consulta |
| /azure-data-ai-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /azure-data-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /azure-database-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /azure-iot-solution/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /blogs/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /case-studies/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /cloud-applications/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /cognitive-service-implementation/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /contact/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /cyber-security-services/ | Pass | Pass | Fail | Pass | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Schedule Your Cybersecurity Consultation |
| /data-copilot-for-azure-ai/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /data-lake-and-big-data-on-azure/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /deep-learning-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /digital-sustainability-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /digital-transformation-services/ | Pass | Pass | Fail | Fail | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Let’s Modernise Together – Talk to Our E; Start Your Transformation – Schedule a F |
| /enterprise-business-application/ | Pass | Pass | Fail | Fail | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Connect with us today to start your ente |
| /generative-ai-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /generative-ai-integration-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /infrastructure-services/ | Pass | Pass | Fail | Fail | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Contact Us for your Infrastructure Asses |
| /llm-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /machine-learning-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /machine-learning-models-on-azure/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /microsoft-fabric-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /mlops-consulting-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /modern-workplace/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /predictive-analytics-services-2/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /predictive-analytics-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /rag-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /sharepoint-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /smart-glasses-ar-wearable-app-development-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /technology-consulting-services/ | Pass | Pass | Fail | Fail | Pass | Pass | Pass | Pass | Pass | Fail | Fail | button text wraps: Accelerate Innovation and Growth – Speak |
| /vibe-coding-services/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-agent-development-cost/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-chatbot-development-strategic-priority-2026/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-development-cost/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /ai-development-lifecycle/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /generative-ai-app-development-cost/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /guide-microsoft-fabric-enables-real-time-analytics/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /hire-generative-ai-developers/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /how-software-consulting-services-help-you-choose-the-right-project-model/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /impact-of-digital-transformation-in-pharma/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /machine-learning-development-scalable-ml-solutions/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /microsoft-dynamics-365-and-dynamics-365-business-central/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /q2m-solutions-is-heading-to-ai4-2026/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /sharepoint-framework-v1-22-1-a-stability-update-developers-shouldnt-skip/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /the-transformative-power-of-ai-in-software-development/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /top-ai-agent-development-companies/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /case-study/building-a-single-pane-of-glass-for-a-1500-truck-fleet/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /case-study/mindshift-an-ai-powered-personal-growth-wellbeing-app/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /case-study/rele-one-building-a-national-real-estate-platform-with-vibe-coding/ | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |
| /privacy-policy/ | Not tested | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass | - |

**Totals:** 55 pages pass every check; 6 pages have an issue (the long-label buttons above). Content column: Pass = 0 unexplained differences; /privacy-policy/ has no live source, so "Not tested".

## Visual review by eye
Every route at 390px, 1024px and 1440px in light and dark: full-page screenshots were taken for all 366 combinations (`docs/screenshots/`, not committed) and I looked at the top-of-page (header, hero, first section, call to action, Clutch badge) of every route in all six combinations, 21 review sheets covering 61 routes. Findings: no overlapping elements, no broken stacking, no cut-off faces or text, header intact at 1024px. Below-the-fold sections were checked by the automated checks only (plus full-page montages for the home page, About and AI Agent Development Services), **not by eye on every page: Not tested.**

## Lighthouse mobile (Slow 4G, production build)
| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| / | 76 | 100 | 100 | 92 | 0.8 s | 4.9 s | 290 ms | 0 |
| /ai-consulting-services/ | 80 | 100 | 100 | 100 | 0.8 s | 5.0 s | 150 ms | 0 |
| /top-ai-agent-development-companies/ | 82 | 100 | 100 | 100 | 0.8 s | 4.8 s | 110 ms | 0.02 |
| /contact/ | 82 | 100 | 100 | 100 | 0.8 s | 4.7 s | 100 ms | 0.018 |

Home SEO 92: Lighthouse flags non-descriptive link text; I added descriptive labels to the home "Read more" links, a remaining link on that page was not identified. Performance: LCP about 5 s on simulated Slow 4G; the production bundle is one large script. Open item.

## Interaction checks (35 of 35 passed, mocked contact endpoint: nothing was sent to the live site)
Desktop mega menu (hover, keyboard Enter, Escape, active item, aria-current), mobile menu (open, close, Escape, active group, no Data group), visible focus, hero slider on touch (component only), FAQ accordion on touch and keyboard, contact form at 390 and 1280 (required errors, invalid email and mobile, bad GSTIN and PIN, partial address, consent, success, server error, network failure; +91 phone, GSTIN, address and consent travel in the message), booking form fields and +91 prefix. **Not tested:** a real booking submission (the booking form opens a pre-filled email draft unless an endpoint is configured), a real contact submission to the live WordPress form, real touch devices, Safari and Firefox.

## Bugs fixed in this run (one commit each, all pushed)
- Header call-to-action wrapped onto three lines at 1024px (shared header).
- Images could be shown larger than their own width (Azure Database image at 768px): frames now never exceed the image width.
- Footer theme toggle wrapped at 360/768/1024px.
- Long call-to-action labels overflowed fixed-height buttons; buttons now grow, and use smaller padding and text on phones.
- Case Studies listing heading order (h1 then h3) fixed.
- List markup errors in capability rows (Lighthouse accessibility 93 to 100) and non-descriptive "Read more" links on home.
- Neutral counter labels, "Serving enterprises in India" card, country-specific governance claim removed, PDPA and MAS TRM removed (Part B1 and B2).
- Raw page excerpts that carried the Singapore address are no longer in the shipped data.
- Mega menu restored with live-sourced text; Data group merged into Solutions; closing call-to-action uses the live "Book a Discovery Call".
- Clutch logo now shown wherever the live hero shows it (37 pages); the 5 pages whose 2000px hero is a different picture keep the 466px card.
- Home: designed home routed, live sections added (Trusted & Certified with logos and Microsoft badges, Results, From The Team); alt text for Integration Partners logo.

## Part C: is your content kept?
| Item | Result |
|---|---|
| Live content vs local (verify-content) | Identical 4,920, changed by logged fixes 725, **unexplained 0** |
| Designed home (HomeFolder.tsx, home.json) | Confirmed. `git diff baseline-before-final-fixes` on HomeFolder.tsx: removed only the "NOT routed" comment and the unused SEO line (now the live title and description); added three live sections, one step image and the live links. Hero (dot field), copy, section order unchanged. home.json: no changes |
| Nothing silently deleted | Confirmed: no page removed. Compared with the baseline commit, the only live blocks that changed or disappeared are: "India presence" heading and text, two counter labels, the Ai4 article sentence and one chatbot compliance sentence (all Part B1/B2), plus 3 template strings in ui.json (closing call-to-action title, text and button) |
| No Singapore address or +65 | Confirmed (shipped content data and source: 0 matches) |
| No geo-blocking | Confirmed (no such code) |
| No DPDP compliance claim | Confirmed: no "compliant" wording. The consent text and the draft privacy page (marked pending legal review, noindex) name the DPDP Act as the legal basis for consent, which needs your legal review |
| No invented numbers or copy | Confirmed for content. Not ours to confirm: alt texts of topic images and hero slides were written by me from the images (flagged) |
| Brand kit logos | Confirmed (header and footer logos byte-identical to Q2M_Brand_Kit) |
| Flat backgrounds | Confirmed (no shadows in components; flat page band) |
| Hidden "#" menu items | Confirmed: 17 hidden |
| India locale config | Confirmed (INR, IST, +91, GSTIN, PIN, states) |
| Sticky left column | Confirmed on every page with one: sticky at 1024px and above, static below (732 loads) |
| Active-page menu highlighting | Confirmed in mega menu and mobile menu (interaction tests) |
| India formats and forms | Confirmed (interaction tests) |
| Image manifest and SiteImage | Confirmed (all images through the shared component) |

## Topic images (added without being on your list)
**What a topic image is:** on service pages, a section of text (heading, paragraphs, bullets) that has no image on the live page left the right-hand half of the layout empty (for example "Benefits of Using Azure Data Services"). A topic image fills that space with a picture of the same topic. **Why:** you asked for it on 11 Nov after pointing at that page.

**Sources: all 13 images come from our live site (q2msolutions.com). Each file is byte-identical (SHA-256) to the file on the live URL below, and each is already used on another live page.** None is stock or generated, nothing was edited. Rule: since all are from the live site, they stay; please review.

| Image (local file) | Live URL | Byte-identical to live | Already used on live pages |
|---|---|---|---|
| shared/azure-data-ai-img.webp | https://q2msolutions.com/wp-content/uploads/2025/08/azure-data-ai-img.webp | Yes | /azure-data-ai-services/, /azure-iot-solution/, /cognitive-service-implementation/ +3 |
| azure-database-services/modernize-your-data-with-azure-database-services-img.png | https://q2msolutions.com/wp-content/uploads/2025/10/modernize-your-data-with-azure-database-services-img.png | Yes | /azure-database-services/ |
| shared/cloud-computing.webp | https://q2msolutions.com/wp-content/uploads/2025/08/cloud-computing.webp | Yes | /azure-ai-and-machine-learning/, /cloud-applications/, /cyber-security-services/ |
| infrastructure-services/it-infrastructure.webp | https://q2msolutions.com/wp-content/uploads/2025/08/it-infrastructure.webp | Yes | /infrastructure-services/ |
| shared/digital-transofrmation.webp | https://q2msolutions.com/wp-content/uploads/2025/08/digital-transofrmation.webp | Yes | /digital-transformation-services/, /generative-ai-development-services/, /generative-ai-integration-services/ +3 |
| shared/technology-consulting-service-img.webp | https://q2msolutions.com/wp-content/uploads/2025/08/technology-consulting-service-img.webp | Yes | /ai-solutions-development/, /azure-data-services/, /data-lake-and-big-data-on-azure/ +1 |
| enterprise-business-application/enterprise-business-app.webp | https://q2msolutions.com/wp-content/uploads/2025/08/enterprise-business-app.webp | Yes | /enterprise-business-application/ |
| modern-workplace/modern-workplace.webp | https://q2msolutions.com/wp-content/uploads/2025/08/modern-workplace.webp | Yes | /modern-workplace/ |
| digital-sustainability-services/digital-sustainability-services-img.webp | https://q2msolutions.com/wp-content/uploads/2025/08/digital-sustainability-services-img.webp | Yes | /digital-sustainability-services/ |
| mlops-consulting-services/why-do-businesses-need-mlops-consulting-img.webp | https://q2msolutions.com/wp-content/uploads/2026/08/why-do-businesses-need-mlops-consulting-img.webp | Yes | /mlops-consulting-services/ |
| shared/why-enterprises-choose-implementation-approach.webp | https://q2msolutions.com/wp-content/uploads/2026/07/why-enterprises-choose-implementation-approach.webp | Yes | /ai-recommendation-systems/, /ai-chatbot-development-company/, /predictive-analytics-services-2/ +1 |
| shared/q2m-banner-2.jpg | https://q2msolutions.com/wp-content/uploads/2025/08/q2m-banner-2.jpg | Yes | /ai-consulting-services/, /azure-iot-solution/, /digital-transformation-services/ +2 |
| shared/untitled-design-5.png | https://q2msolutions.com/wp-content/uploads/2026/09/Untitled-design-5.png | Yes | /ai-recommendation-systems/, /predictive-analytics-services-2/ |

Rules: only text-heavy prose sections (250+ characters); never FAQ, call-to-action bands, testimonials, pricing, tech stacks or card grids; a page uses the images of its topic family, skipping any it already shows. Alt text was written by me. **73 sections on 36 pages:**

| Page | Section | Image (live file) |
|---|---|---|
| /ai-agent-development-services/ | The Most In-Demand AI Agent Solutions We Develop at Q2M | shared/why-enterprises-choose-implementation-approach.webp |
| /ai-agent-development-services/ | How Agentic AI Works? | shared/q2m-banner-2.jpg |
| /ai-agent-development-services/ | Accelerate Business Growth with Q2M AI Agent Development Ser | shared/untitled-design-5.png |
| /ai-app-development-services/ | Our Expertise in AI App Development Services | shared/why-enterprises-choose-implementation-approach.webp |
| /ai-app-development-services/ | Q2M Solutions’ AI App Development Process | shared/q2m-banner-2.jpg |
| /ai-app-development-services/ | Why Do AI App Development Services Matter? | shared/untitled-design-5.png |
| /ai-chatbot-development-company/ | Types of AI Chatbots We Develop | shared/q2m-banner-2.jpg |
| /ai-chatbot-development-company/ | Q2M's AI Chatbot Capabilities: From Conversation to Action | shared/untitled-design-5.png |
| /ai-consulting-services/ | AI Solutions by Capability | shared/why-enterprises-choose-implementation-approach.webp |
| /ai-consulting-services/ | Why Choose Q2M for AI Consulting Services? | shared/technology-consulting-service-img.webp |
| /ai-development-services/ | Advanced AI Solutions We Develop at Q2M | shared/why-enterprises-choose-implementation-approach.webp |
| /ai-development-services/ | Why Choose Q2M for Custom AI Development Services | shared/q2m-banner-2.jpg |
| /ai-development-services/ | Partner with Q2M for Intelligent AI-Powered Growth and Innov | shared/untitled-design-5.png |
| /ai-recommendation-systems/ | Why Does Your Business Require AI Development for Recommenda | shared/azure-data-ai-img.webp |
| /ai-recommendation-systems/ | AI-Powered Recommendation Engines We Build | shared/q2m-banner-2.jpg |
| /ai-solutions-development/ | Benefits of AI Solutions Development | shared/why-enterprises-choose-implementation-approach.webp |
| /ai-solutions-development/ | The Q2M AI Advantage | shared/azure-data-ai-img.webp |
| /azure-ai-and-machine-learning/ | Azure AI and Machine Learning Solutions | shared/azure-data-ai-img.webp |
| /azure-data-ai-services/ | Q2M Solutions’ Added Advantage in Azure Data & AI Distinctio | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /azure-data-services/ | Benefits of Using Azure Data Services | shared/azure-data-ai-img.webp |
| /azure-data-services/ | How Do Azure Data Services Work? | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /azure-database-services/ | Key Benefits of Azure Database Services | shared/azure-data-ai-img.webp |
| /azure-database-services/ | How Q2M Delivers Azure Database Solutions | shared/cloud-computing.webp |
| /azure-iot-solution/ | Our Expertise in Azure IoT Services | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /azure-iot-solution/ | Why Choose Q2M Solutions for Azure IoT Services? | shared/cloud-computing.webp |
| /cloud-applications/ | Advancing Cloud Computing Services Innovation | infrastructure-services/it-infrastructure.webp |
| /cognitive-service-implementation/ | Key Benefits of Cognitive Service Implementation | shared/why-enterprises-choose-implementation-approach.webp |
| /cognitive-service-implementation/ | Our Expertise in Using Azure Cognitive Services | shared/cloud-computing.webp |
| /cyber-security-services/ | Q2M Expertise in Cyber Security | shared/digital-transofrmation.webp |
| /data-copilot-for-azure-ai/ | Azure Data Copilot Features | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /data-copilot-for-azure-ai/ | Benefits: Cloud Resource Optimisation with Data Copilot for  | shared/cloud-computing.webp |
| /data-lake-and-big-data-on-azure/ | Business Benefits of Azure Data Lake & Big Data | shared/azure-data-ai-img.webp |
| /data-lake-and-big-data-on-azure/ | Why Partner with Q2M Solutions? | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /deep-learning-services/ | Why Are Businesses Turning to Deep Learning Development Comp | shared/why-enterprises-choose-implementation-approach.webp |
| /deep-learning-services/ | Deep Learning Solutions We Build | mlops-consulting-services/why-do-businesses-need-mlops-consulting-img.webp |
| /deep-learning-services/ | Client Testimonials | shared/q2m-banner-2.jpg |
| /digital-sustainability-services/ | Q2M Expertise in Digital Sustainability | shared/digital-transofrmation.webp |
| /digital-transformation-services/ | Q2M Solutions’ Expertise in AI Models: Turning Possibilities | shared/technology-consulting-service-img.webp |
| /digital-transformation-services/ | AI-Powered Transformation with Microsoft Copilot | enterprise-business-application/enterprise-business-app.webp |
| /enterprise-business-application/ | Our Expertise in Enterprise Business Applications | shared/technology-consulting-service-img.webp |
| /generative-ai-development-services/ | Generative AI Development Services for Next-Gen Scalable App | shared/why-enterprises-choose-implementation-approach.webp |
| /generative-ai-development-services/ | Power Business Innovation with Q2M Generative AI Development | shared/untitled-design-5.png |
| /generative-ai-development-services/ | Our Gen AI Development Tech Stack | shared/q2m-banner-2.jpg |
| /generative-ai-integration-services/ | Why AI Integration Consulting Services Matter for Businesses | shared/why-enterprises-choose-implementation-approach.webp |
| /generative-ai-integration-services/ | The Potential Business Outcomes of Generative AI Integration | shared/untitled-design-5.png |
| /generative-ai-integration-services/ | Industries We Support with Our AI Integration Consulting Ser | shared/q2m-banner-2.jpg |
| /infrastructure-services/ | Infrastructure Expertise: Empowering Peak Business Performan | shared/cloud-computing.webp |
| /llm-development-services/ | Business Benefits of Our LLM Development Services | shared/why-enterprises-choose-implementation-approach.webp |
| /llm-development-services/ | Industries We Serve with Our Custom LLM Builds | shared/untitled-design-5.png |
| /llm-development-services/ | The Tech Stack We Use for Custom LLM Development | shared/q2m-banner-2.jpg |
| /machine-learning-development-services/ | ML Expertise Across the Full Landscape | shared/why-enterprises-choose-implementation-approach.webp |
| /machine-learning-development-services/ | How We Build Machine Learning Solutions | mlops-consulting-services/why-do-businesses-need-mlops-consulting-img.webp |
| /machine-learning-development-services/ | The Tools Behind Our Machine Learning Development | shared/q2m-banner-2.jpg |
| /machine-learning-models-on-azure/ | Q2M Machine Learning Models on Azure | shared/why-enterprises-choose-implementation-approach.webp |
| /machine-learning-models-on-azure/ | Benefits of Machine Learning Models on Azure | mlops-consulting-services/why-do-businesses-need-mlops-consulting-img.webp |
| /microsoft-fabric-services/ | Q2M’s Microsoft Fabric Capabilities | azure-database-services/modernize-your-data-with-azure-database-services-img.png |
| /microsoft-fabric-services/ | How Q2M Solutions Helps with Microsoft Fabric Consulting | shared/cloud-computing.webp |
| /mlops-consulting-services/ | What Are MLOps Services? | shared/why-enterprises-choose-implementation-approach.webp |
| /modern-workplace/ | Q2M Solutions’ Innovation in AI: Powering the Next-Gen Moder | enterprise-business-application/enterprise-business-app.webp |
| /predictive-analytics-services-2/ | Why Businesses Value Predictive Analytics Services | shared/azure-data-ai-img.webp |
| /predictive-analytics-services-2/ | Predictive Analytics Solutions We Build | shared/q2m-banner-2.jpg |
| /predictive-analytics-services/ | What Are Predictive Analytics Services? | shared/azure-data-ai-img.webp |
| /predictive-analytics-services/ | Predictive Analytics Solutions We Build | shared/why-enterprises-choose-implementation-approach.webp |
| /predictive-analytics-services/ | Business Benefits of Predictive Data Analytics Services | shared/q2m-banner-2.jpg |
| /rag-development-services/ | Q2M's Range of RAG Development Services | shared/azure-data-ai-img.webp |
| /rag-development-services/ | Common Use Cases of RAG Development Services | shared/untitled-design-5.png |
| /sharepoint-development-services/ | What are SharePoint Development Services and Why They Matter | modern-workplace/modern-workplace.webp |
| /sharepoint-development-services/ | Capabilities of Our SharePoint Solutions | enterprise-business-application/enterprise-business-app.webp |
| /technology-consulting-services/ | Q2M Solutions Expertise in Technology Consulting | shared/digital-transofrmation.webp |
| /technology-consulting-services/ | Q2M Technology Consulting Services | enterprise-business-application/enterprise-business-app.webp |
| /vibe-coding-services/ | What is Vibe Coding and Why Businesses Value It | shared/untitled-design-5.png |
| /vibe-coding-services/ | Advanced Capabilities of Our Vibe Coding Platforms | shared/q2m-banner-2.jpg |
| /vibe-coding-services/ | Client Testimonials | shared/why-enterprises-choose-implementation-approach.webp |

## Home hero: decision for you
The designed home page (HomeFolder.tsx) had a **dot field** on the right of the hero. I switched it to a slider during this task and have **reverted it**: the dot field is back and nothing else in the hero changed.
- **Option A (current):** keep the designed dot field.
- **Option B:** replace it with a slider of the 3 live home banners (as on the live site), with the Clutch logo beside the buttons. The slider is built (`HeroSlider.tsx`, order and alt text in `hero-slides.json`) and still used by the non-routed live-structure home (`Home.tsx`).

## Open items that need your decision
1. The 6 pages with long call-to-action labels on phones (accept two lines, or approve shorter text).
2. Performance: LCP about 5 s (approve a performance pass: code splitting, preloading).
3. Stats table: `docs/STATS_FOR_APPROVAL.md` (one value per conflicting stat).
4. SEO proposals: `docs/SEO_PROPOSALS.md` (18 titles and 10 descriptions; not applied).
5. Home table: `docs/HOME_IMAGE_MAPPING.md` (3 added live sections, 1 step image; other steps and sections have no clear image).
6. Mega-menu text: `docs/MEGA_MENU_COPY.md`.
7. Placeholder sections: `docs/PLACEHOLDER_SECTIONS.md` (34 pages; the "38" was a labelling bug in my earlier report).
8. Low-res heroes: `docs/LOWRES_HEROES.md` (23 pages in a 466px card, 1 uses the 2000px copy of the same picture; side-by-side proofs in `docs/hero-compare/`).
9. Clutch placements: `docs/CLUTCH_PLACEMENTS.md` (37 pages; I could not reproduce the earlier "32").
10. Topic images and their alt text (above).
11. Indian address, phone, CIN, grievance officer and Google Business Profile URL (the footer Google badge stays unlinked until you send it).
12. Legal review of the draft privacy policy and consent wording.

## Git
`git log --oneline before-final-fixes..HEAD`
```
5fbbc79 fix(a11y): valid list markup in capability rows; descriptive aria-labels for Read more links on home
3bec5c8 chore: remove temporary review helper
e1b6409 fix(buttons): smaller padding and text on phones so long call-to-action labels wrap far less
4b52659 docs: record live source and checksum of each topic image
914a894 fix(home): keep the designed dot-field hero (slider left as a decision); docs updated
14e738f feat(images): topic images for text-only prose sections (live images only), drop raw page excerpts with the Singapore address
598e7c3 fix(layout): images never exceed intrinsic width, theme toggle and long CTA labels no longer wrap/clip, case-study listing heading order
72b5a5e feat(B3,B5): live-sourced mega menu copy with fallback; closing CTA uses live 'Book a Discovery Call' and no invented line
460d9b4 feat(B3,B4,B6,A1,A2): restore mega menu with live-sourced copy and merge Data into Solutions; Clutch badge wherever live hero has it; stats and SEO proposal tables; home mapping table
cf2b602 images(A3,A5): keep 466px card where the 2000px hero is a different picture; fix placeholder page count label
9139a99 feat(home): route the designed home, add live Trusted/Results/From The Team sections and approved images; alt for Integration Partners logo (A1,A4)
bf1fc2b content(B1,B2): neutral counter labels, India presence card, remove country-specific governance claim and PDPA/MAS TRM
```
`git diff --stat before-final-fixes` (summary line)
```
 53 files changed, 2115 insertions(+), 1404 deletions(-)
```
