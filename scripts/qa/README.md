# QA scripts

Browser checks for the built site. They use the installed Chrome (no browser download) and are kept apart from the site's
own dependencies, so `npm ci` / `npm run build` at the repository root never install them.

## Setup (once)
```
cd scripts/qa
npm install
```
Chrome path: set `CHROME_PATH` if Chrome is not at `C:/Program Files/Google/Chrome/Application/chrome.exe`.

## Run against the production build
From the repository root: `npm run build`, then `npx vite preview --port 4173` in another terminal. Then, in `scripts/qa`:

| Script | What it checks |
|---|---|
| `node html-head.mjs` | Every sitemap URL has its own pre-rendered HTML with title, description, canonical, og tags (reads `dist/`, no server needed) |
| `node hydration.mjs` | Every route hydrates with no React errors and keeps the pre-rendered HTML |
| `node behaviour.mjs` | Countdown, booking dates, BTS after-event switch (faked clock), menu highlighting, sticky column, theme toggle, reveals |
| `node sweep.mjs` | Pages at several widths, light and dark: overflow, clipped/hidden text, wrapped buttons, empty sections, layout shift, console errors. Filters: `ONLY=home,service WIDTHS=360,768,1440` |
| `node back-to-top.mjs` | Back-to-top button: show/hide point, progress ring, click/Enter/Space, focus, menu, no overlap with forms and the footer |
| `node lighthouse.mjs "/,/contact/"` | Lighthouse mobile scores (writes `results/lighthouse.json`) |
| `node footer-shot.mjs <base> <path> <width> <theme> <out.png>` | Footer screenshot and height |

`BASE` sets the site to test (default `http://localhost:4173`). Results and screenshots go to `scripts/qa/results/` (not committed).
