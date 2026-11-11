# Mega menu copy (live-sourced, for your review)

Layout restored: left column = group name, **intro text**, **Featured** card (first item, with blurb); right = all items. Both texts are taken only from live pages the menu links to, trimmed by whole sentences (`src/lib/menuCopy.ts`). Nothing is written by us except the word "Featured".

- Intro = live meta description of the group's first page that has one (≤ 170 characters).
- Blurb = first paragraph of the featured (first) page (≤ 130 characters); shown only if the page has one and it differs from the intro.

| Group | Items | Featured page | Intro (source: live meta description) | Blurb (source: first paragraph) |
|---|---|---|---|---|
| AI | 8 | AI Development Services | Q2M is a leading custom AI development company delivering enterprise-grade AI development services using cutting-edge technologies for maximum ROI. | From startups to Fortune 500 companies, businesses worldwide are embracing the transformative power of AI development services. |
| Consulting | 8 | Cloud Application | Take advantage of Q2M Solutions’ Cloud Applications—secure, scalable, AI-driven solutions for seamless migration, modernisation & growth. | Unlock your company's potential with Q2M Solutions' Cloud Applications. |
| Solutions | 11 (10 + Microsoft Fabric Services moved in from Data) | SharePoint Development Services | Q2M Solutions, a reputed SharePoint development company, offers a wide range of customised SharePoint development services for measurable ROI. | SharePoint can be transformed into a smart workplace instead of being limited to a file-sharing platform. |
| Resources | 3 (Case Studies, Blogs, Campus Click) | Case Studies | Explore more about the AI development services of Q2M Solutions and partner with them for your upcoming AI development project. (from the live Blogs page: Case Studies has no live description) | none (live Case Studies page has no paragraph) |

Menu changes
- The 17 live "#" items stay hidden (Data 7, Copilot 5, Resources 5).
- "Data" had one real page (Microsoft Fabric Services) once the "#" items were hidden. Rule in `src/lib/site.ts`: a group with fewer than 2 visible items is dissolved and its items move to the target group (`Data → Solutions`). "Copilot" has no real page and does not show.
- No visible group has fewer than 2 items. Active-page highlighting works on every item (same helper as before; checked on Azure Data Services).
