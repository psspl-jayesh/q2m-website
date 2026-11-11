# Bengaluru Tech Summit 2026 landing page (feature/bts-2026-landing)

**URL:** `/bengaluru-tech-summit-2026/` (local: http://127.0.0.1:5173/bengaluru-tech-summit-2026/, live after launch: https://q2msolutions.com/bengaluru-tech-summit-2026/). Listed in `public/sitemap.xml`.
**How to reach it:** the new button "Bengaluru Tech Summit 2026" in the home page BTS section, or the URL directly (email, LinkedIn, QR code).

## Self-contained
- Route: `src/main.tsx` → `src/pages/BtsLanding.tsx`.
- Content: `src/content/pages/bts-2026/page.json` and `src/content/sections/team-bento.json`. The home page does not read either file.
- Shared components are used unchanged (Button, SiteImage, SiteFrame, Accordion, BookingForm, header, footer).
- No new copy was written. Text comes verbatim from the designed home copy (BTS band, 30-minute session, booking form, FAQ, two demo tiles); team names, roles and photos from the live About page; stats from the approved shared counters.

## Sections
1. Hero: "Meet us at BTS 2026", H1 "Bengaluru Tech Summit 2026", "BIEC, Bengaluru", booking button; event facts card (Event, Venue, Dates, Live demos).
2. "Bring one process. Leave with an AI plan for it."
3. Live demos: smart-glasses vehicle inspection and the claims agent (live-site images).
4. Team bento (the layout you liked): lead photo, team card with all five faces, venue and live-demo cards, four team photos, four stat tiles. Two-up on phones.
5. The 30-minute session (three steps).
6. Booking form (same form as home; opens a pre-filled email until a delivery option is chosen).
7. FAQ.

## Home page
- Only change: one button in the existing BTS section (`src/pages/HomeFolder.tsx`, 1 line). Before/after check at 390px and 1440px, light and dark: same text, same images, one new link, page 80px taller (the button).
- BTS items already on the home page, left exactly as they were, for your decision: the hero line "Bengaluru Tech Summit 2026 · BIEC, Bengaluru"; the "See the work" tile "Find us at BIEC, Bengaluru" (dot panel, no image); the BTS section "Meet us at BTS 2026" (light-grey surface from commit 42c8db4); the home booking form "Reserve 30 minutes at BTS 2026".

## Checks
Landing page and home at 360, 768, 1024 and 1440px in light and dark (16 loads): no overflow, no clipped text, no hidden content, no broken or enlarged images, no button wrapping, no contrast failures, no layout shift, no console errors, one H1. Team photos keep faces in view (cropped from the top). Content verification: 0 unexplained differences.
