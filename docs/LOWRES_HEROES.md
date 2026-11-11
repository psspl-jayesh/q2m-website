# Low-resolution hero images (466×291)

Rule (one shared component, `HeroImage` in `src/components/ui.tsx`; threshold `IMAGES.lowResHeroBelow = 800` in `src/config/locale.ts`; hero choice `heroImage()` in `src/lib/images.ts`):
- A page uses its widest hero image. Source ≥ 800px fills the hero frame.
- Source < 800px: **never enlarged, stretched, upscaled or AI-processed**. It sits in a contained card (`rounded-lg border bg-surface-raised p-4 sm:p-6`) at no more than its intrinsic width (`sizes="466px"`, `max-w-full h-auto`), centred. Checked: rendered 277px wide at a 360px viewport (intrinsic 466px).

Used by every service page through `ServicePage`.

**Pages whose live hero list includes a 466×291 file: 24** (matches your 24). 18 render in the contained card; 6 also list a 2000px hero on the live page, which is shown instead.

## Rendered in the contained card (18 pages, 13 files)

| Page | File | Intrinsic size |
|---|---|---|
| /azure-data-ai-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |
| /ai-solutions-development/ | /images/shared/azure-data-ai-banner.webp | 466x291 |
| /azure-data-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |
| /azure-iot-solution/ | /images/azure-iot-solution/azure-iot-solution.png | 466x291 |
| /azure-database-services/ | /images/azure-database-services/azure-database-services.png | 466x291 |
| /cloud-applications/ | /images/cloud-applications/cloud-banner.webp | 466x291 |
| /cyber-security-services/ | /images/cyber-security-services/cyber-security-services-banner.webp | 466x291 |
| /cognitive-service-implementation/ | /images/cognitive-service-implementation/cognitive-service-implementation.png | 466x291 |
| /data-copilot-for-azure-ai/ | /images/data-copilot-for-azure-ai/data-copilot-for-azure-ai.png | 466x291 |
| /data-lake-and-big-data-on-azure/ | /images/shared/azure-data-ai-banner.webp | 466x291 |
| /digital-sustainability-services/ | /images/digital-sustainability-services/digital-sustainability-services-banner.webp | 466x291 |
| /digital-transformation-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 |
| /generative-ai-development-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 |
| /infrastructure-services/ | /images/infrastructure-services/it-infrastructure-banner.webp | 466x291 |
| /machine-learning-models-on-azure/ | /images/machine-learning-models-on-azure/machine-learning-models-on-azure.png | 466x291 |
| /microsoft-fabric-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |
| /modern-workplace/ | /images/shared/modern-workspace-banner.webp | 466x291 |
| /technology-consulting-services/ | /images/technology-consulting-services/technology-consulting-banner.webp | 466x291 |

## Live page lists both a 466×291 and a 2000px hero (6 pages)
The 2000px hero is shown; the 466px one is not rendered. Please confirm (I assumed the 466px file is a duplicate or mobile variant).

| Page | Detail |
|---|---|
| /ai-consulting-services/ | ai-consulting-service-banner.webp (2000px) used instead of digital-transformation-service-banner.webp (466x291) |
| /ai-agent-development-services/ | ai-agent-development-service-banner.webp (2000px) used instead of ai-agent-development-service-banner.jpg (466x291) |
| /ai-development-services/ | ai-development-service-banner.webp (2000px) used instead of digital-transformation-service-banner.webp (466x291) |
| /ai-app-development-services/ | ai-app-development-service-banner.webp (2000px) used instead of ai-app-development-services-banner.jpg (466x291) |
| /ai-chatbot-development-company/ | ai-chatbot-development-company-banner.webp (2000px) used instead of digital-transformation-service-banner.webp (466x291) |
| /machine-learning-development-services/ | machine-learning-development-company-banner.webp (2000px) used instead of machine-learning-development-service-banner.jpg (466x291) |
