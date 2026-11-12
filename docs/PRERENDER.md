# Pre-rendering (static HTML at build time)

`npm run build` now writes a real HTML file for every route, so search engines and link previews (LinkedIn, WhatsApp, Google) see the page text and tags without running JavaScript.

## How it works
1. `vite build` builds the browser app as before.
2. `vite build --ssr src/entry-server.tsx` builds a render function. It is used only at build time and never shipped.
3. `node scripts/prerender.mjs` renders each route and writes it to disk:
   - Routes: every page, post and case study, the category archives, the privacy policy and the BTS page. That is 71 routes, including all 61 sitemap URLs.
   - Each route goes to `dist/<route>/index.html`, plus `dist/404.html`.
   - Each file has the page body and its own `<title>`, meta description, canonical, hreflang, Open Graph, Twitter, robots and JSON-LD tags.
4. In the browser, `src/main.tsx` loads the content, then hydrates the HTML: React takes it over without re-drawing it.

The head tags come from one list (`src/lib/seoTags.ts`), used both by `<Seo>` in the browser and by the build. The two can't drift apart.

## Things that depend on "now"
The HTML is built before visitors arrive, so these are worked out in the browser after load:
- **BTS countdown:** shows "--" in the HTML and fills in on load.
- **Booking form dates and times:** filled in on load.
- **Theme toggle label and footer year:** read after load.
- **BTS phase (before, during, after the event):** the home and BTS pages record the phase they were built in (`data-bts-phase`).
  - If a date boundary has passed since the build (for example after 19 Nov 2026, 18:00 IST), a tiny inline script hides the out-of-date page body.
  - The browser then renders the page fresh with the correct BTS items, and the page shows again.
  - The usual 30-second check still switches the page while it is open.
  - **Recommended:** rebuild and redeploy once after the event, so the static HTML itself no longer has the BTS items.

## Animations
On a pre-rendered page, content in the first screen is visible immediately; it no longer fades in on first load. This is what makes the first paint fast (LCP). Content further down still reveals on scroll. Pages reached by clicking a link inside the site animate as before.

## Hosting
- Serve `dist/` as static files. `/about/` must resolve to `dist/about/index.html`; most static hosts and `vite preview` do this.
- Unknown URLs: configure the host to return `dist/404.html` with status 404.
- If a host instead falls back to `index.html` (the home page HTML), the browser sees the URL doesn't match (`data-prerendered`) and renders the not-found page itself.

## Checks (feature/bts-decisions-and-prerender)
- **HTML:** all 61 sitemap URLs have their own HTML. Titles are unique; canonical and og:url equal the page URL; each has one `<title>` and real body HTML.
- **Hydration:** all 71 routes hydrate with no React errors, and the server HTML is kept (checked in production).
- **Behaviour:**
  - Countdown and booking dates fill in.
  - With the clock faked to after the event, home and BTS hide their BTS items. During the event, the countdown hides.
  - Menu highlighting, sticky column, theme toggle, scroll reveals and in-site navigation (title and canonical update) work as before.
- **Lighthouse mobile:** see `docs/OPEN_DECISIONS.md` #1 and #25.
