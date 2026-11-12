# Page-builder placeholder.png: pages and sections

The live site shows the page builder's grey `placeholder.png` in these places. It is **never rendered** (excluded in `scripts/sync-images.mjs`, not in the manifest, not copied to `public/`). Sections render without an image; each reads correctly as text only.

Total: 54 placements on 34 pages. **The "38 pages" figure was a labelling bug in my earlier sync report, not a different crawl:** the report heading printed the number of image placements recorded by the sync (38) as "pages", while its list already held 34 unique pages. Comparing the old list (baseline commit) with the current crawl: identical, 34 pages, **no page dropped out and none was added**. The report heading is fixed (`scripts/sync-images.mjs`).

| Page | Section(s) where live shows placeholder.png |
|---|---|
| /ai-agent-development-services/ | hero (under the page title) |
| /ai-app-development-services/ | hero (under the page title) |
| /ai-chatbot-development-company/ | hero (under the page title) |
| /ai-consulting-services/ | hero (under the page title) |
| /ai-development-services/ | hero (under the page title) |
| /ai-solutions-development/ | hero (under the page title) |
| /azure-ai-and-machine-learning/ | hero (under the page title) |
| /azure-data-ai-services/ | hero (under the page title) |
| /azure-data-services/ | hero (under the page title) |
| /azure-database-services/ | hero (under the page title) |
| /azure-iot-solution/ | hero (under the page title) |
| /cloud-applications/ | hero (under the page title) |
| /cognitive-service-implementation/ | hero (under the page title) |
| /cyber-security-services/ | hero (under the page title) |
| /data-copilot-for-azure-ai/ | hero (under the page title) |
| /data-lake-and-big-data-on-azure/ | hero (under the page title) |
| /deep-learning-services/ | Client Testimonials |
| /digital-sustainability-services/ | hero (under the page title) |
| /digital-transformation-services/ | hero (under the page title) |
| /enterprise-business-application/ | hero (under the page title) |
| /generative-ai-development-services/ | hero (under the page title) |
| /generative-ai-integration-services/ | hero (under the page title); Client Testimonials |
| /infrastructure-services/ | hero (under the page title) |
| /llm-development-services/ | hero (under the page title); Client Testimonials |
| /machine-learning-development-services/ | hero (under the page title); Client Testimonials |
| /machine-learning-models-on-azure/ | hero (under the page title) |
| /microsoft-fabric-services/ | hero (under the page title) |
| /mlops-consulting-services/ | Client Testimonials |
| /modern-workplace/ | hero (under the page title) |
| /predictive-analytics-services/ | Client Testimonials |
| /rag-development-services/ | hero (under the page title); Hear From Our Esteemed Clients |
| /smart-glasses-ar-wearable-app-development-services/ | hero (under the page title) |
| /technology-consulting-services/ | hero (under the page title) |
| /vibe-coding-services/ | Client Testimonials |

Related demo-domain items (zenfy-wp.egenslab.com):
- `clutch-logo.svg`: approved, downloaded to `public/images/shared/clutch-logo.svg`, served locally (31 places, service-page hero).
- `breadcrumb-bg.png`: not used. Was the page-title banner background on 19 pages. Replaced by the flat `.page-band` on About, Contact, Blogs, Case Studies and Article pages.
- `banner-img-4.jpg`: not used. It was the hero image (under the page title) on /enterprise-business-application/ and /azure-ai-and-machine-learning/. Those pages show the brand panel instead.
