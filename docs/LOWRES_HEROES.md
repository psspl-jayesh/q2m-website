# Low-resolution hero images (466×291)

Rule (one shared component `HeroImage` in `src/components/ui.tsx`; threshold `IMAGES.lowResHeroBelow = 800` in `src/config/locale.ts`; choice in `heroImage()`, `src/lib/images.ts`):
- Source ≥ 800px wide fills the hero frame.
- Source < 800px is **never enlarged, stretched, upscaled or AI-processed**: contained card, at most its intrinsic width (466px), centred.
- Where a live page lists both a 466px and a 2000px hero, I compared them side by side (`docs/hero-compare/`). Only the same picture may use the 2000px file; otherwise the page keeps the 466px card (`IMAGES.lowResHeroPages`).

**Pages whose live hero list includes a 466×291 file: 24.** 23 show the 466px contained card; 1 show the 2000px file because it is the same picture.

## 466px contained card (23 pages)

| Page | File | Size | Note |
|---|---|---|---|
| /ai-consulting-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 | a different 2000px picture exists; 466px kept (see docs/hero-compare/) |
| /ai-development-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 | a different 2000px picture exists; 466px kept (see docs/hero-compare/) |
| /ai-app-development-services/ | /images/ai-app-development-services/ai-app-development-services-banner.jpg | 466x291 | a different 2000px picture exists; 466px kept (see docs/hero-compare/) |
| /ai-chatbot-development-company/ | /images/shared/digital-transformation-service-banner.webp | 466x291 | a different 2000px picture exists; 466px kept (see docs/hero-compare/) |
| /azure-data-ai-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |  |
| /azure-data-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |  |
| /azure-iot-solution/ | /images/azure-iot-solution/azure-iot-solution.png | 466x291 |  |
| /azure-database-services/ | /images/azure-database-services/azure-database-services.png | 466x291 |  |
| /cloud-applications/ | /images/cloud-applications/cloud-banner.webp | 466x291 |  |
| /cyber-security-services/ | /images/cyber-security-services/cyber-security-services-banner.webp | 466x291 |  |
| /data-copilot-for-azure-ai/ | /images/data-copilot-for-azure-ai/data-copilot-for-azure-ai.png | 466x291 |  |
| /data-lake-and-big-data-on-azure/ | /images/shared/azure-data-ai-banner.webp | 466x291 |  |
| /generative-ai-development-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 |  |
| /infrastructure-services/ | /images/infrastructure-services/it-infrastructure-banner.webp | 466x291 |  |
| /machine-learning-development-services/ | /images/machine-learning-development-services/machine-learning-development-service-banner.jpg | 466x291 | a different 2000px picture exists; 466px kept (see docs/hero-compare/) |
| /machine-learning-models-on-azure/ | /images/machine-learning-models-on-azure/machine-learning-models-on-azure.png | 466x291 |  |
| /microsoft-fabric-services/ | /images/shared/azure-data-ai-banner.webp | 466x291 |  |
| /ai-solutions-development/ | /images/shared/azure-data-ai-banner.webp | 466x291 |  |
| /modern-workplace/ | /images/shared/modern-workspace-banner.webp | 466x291 |  |
| /cognitive-service-implementation/ | /images/cognitive-service-implementation/cognitive-service-implementation.png | 466x291 |  |
| /digital-sustainability-services/ | /images/digital-sustainability-services/digital-sustainability-services-banner.webp | 466x291 |  |
| /digital-transformation-services/ | /images/shared/digital-transformation-service-banner.webp | 466x291 |  |
| /technology-consulting-services/ | /images/technology-consulting-services/technology-consulting-banner.webp | 466x291 |  |

## Same picture at 2000px (1 page)

| Page | 466px file | 2000px file used |
|---|---|---|
| /ai-agent-development-services/ | /images/ai-agent-development-services/ai-agent-development-service-banner.jpg | /images/ai-agent-development-services/ai-agent-development-service-banner.webp |
