# Bengaluru Tech Summit 2026 landing page

**URL:** `/bengaluru-tech-summit-2026/` (listed in `public/sitemap.xml`). Reached from the button in the home page BTS section, or directly (email, LinkedIn, QR code).

## One config for dates and flags: `src/config/bts.ts`
- `start` 17 Nov 2026 09:00 IST (countdown target), `end` 19 Nov 2026 18:00 IST (after this, BTS items hide).
- `venue`: BIEC name, address and the Google Maps "Get directions" link (no embedded map).
- `liveDemos: false` until you confirm Q2M has a booth with demos (see OPEN_DECISIONS #22).
- `useBtsPhase()` returns `before`, `live` or `after`, re-checked every 30 seconds. On the dev server only, `?btsNow=<ISO date>` mocks the date, for example `/?btsNow=2026-11-19T18:01:00%2B05:30`.

## Sections (in order)
1. Hero: "Meet us at BTS 2026", H1, "BIEC, Bengaluru", booking button; countdown card (before the event only).
2. Event at a glance: Event, Dates (from the config), Venue, Session 30 minutes (and Live demos when the flag is on).
3. "Bring one process. Leave with an AI plan for it." (the "come for the demos" sentence shows only when `liveDemos` is on).
4. What we can show you: smart-glasses vehicle inspection and the claims agent ("Live demos" wording when the flag is on).
5. Trust points: Microsoft Solution Partner (with the Microsoft badges), Azure Expert, ISO 27001. The Clutch text is left out while OPEN_DECISIONS #19 is open.
6. Why meet Q2M: AI agents, smart glasses, AI chatbots, AI consulting, with each page's live title and description.
7. Team bento: names, roles and photos from the live About page.
8. Client logos ("Our Global Clients", the home marquee logos).
9. Testimonials ("Client Feedback / Trusted By Our Clients", the live home quotes).
10. The 30-minute session.
11. Booking form (same form as home; opens a pre-filled email until a delivery option is chosen).
12. Venue and directions.
13. FAQ.
14. Closing CTA band (the sitewide FinalCta) with "Book a Meeting" linking to the form.

The shared sections live in `src/components/Sitewide.tsx`, with the same markup as the home Trusted & Certified section and the service-page quote cards. `FinalCta` got an optional `cta` prop that only this page uses; every other page is unchanged.

## After the event (from 19 Nov 2026, 18:00 IST)
- **Landing page:**
  - The hero reads "Thanks for meeting us at BTS 2026", with a "Talk to us" button to `/contact/`.
  - The countdown, pitch, session, booking form, venue and the FAQ intro hide, as does the Session card.
  - The closing CTA becomes "Talk to us".
- **Home page:**
  - The hero line "Bengaluru Tech Summit 2026 · BIEC, Bengaluru", the "Find us at BIEC" tile, the "Meet us at BTS 2026" section and the "Reserve 30 minutes at BTS 2026" form all hide.
  - The hero button goes to `/contact/`.
  - In "See the work", two tiles grow (Workshops gets double height, Document AI double width), so the 4-column grid has no holes. I measured it: 5 tiles fill all 12 cells.
- **Before the event:** the home page is identical to before this change (same text, links and images; same height at 390 and 1440px, light and dark).

## Checks (feature/bts-landing-fixes)
- **Widths and themes:** landing and home, before and after the event, at 360, 390, 768, 1024, 1440 and 1920px in light and dark (48 loads).
  - No overflow, broken images, hidden text, clipped text, wrapped buttons, empty sections or console errors.
  - One H1 and CLS ≤ 0.004 on every load.
- **Team:** all 5 names and roles match the live About page in the same order, and every photo is byte-identical to the live file (sha256).
- **Stats:** 150+, 40%+, 6wk and 2 trace to the live home counter widgets; see `docs/STATS_FOR_APPROVAL.md`.
- **Lighthouse mobile** (production build): performance 79, accessibility 100, best practices 100, SEO 92. LCP is 4.9 s; see OPEN_DECISIONS #25.
