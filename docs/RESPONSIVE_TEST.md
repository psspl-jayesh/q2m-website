# Mobile and responsive test

**Scope:** all 61 routes (60 live-mapped pages + the new `/privacy-policy/`) × 360px, 768px, 1024px × light and dark = **366 page loads**, each scrolled top to bottom (so lazy images and reveal animations load), measured inside same-origin iframes of exactly that width on the Vite dev server (`http://127.0.0.1:5173`).

| Check | Result |
|---|---|
| Horizontal overflow (`scrollWidth > clientWidth`) | **0 of 366** |
| Layout shift (CLS > 0.05) | **0 of 366** (all 0.000) |
| Exactly one `<h1>` | **366 of 366** |
| Test-harness errors (page failed to load/measure) | 0 (browser console errors were not collected in this run) |
| Images displayed larger than intrinsic size (non-SVG) | None. 9 readings at 1024px (e.g. 986px shown vs 895px "natural") are a measurement artefact: with `srcset`/`sizes` the browser reports `naturalWidth` scaled to the declared `sizes`; the files served are 1024px+ wide |
| Images with a crop above 35% (cover) | **0** |
| Broken images | None. The first pass flagged lazy images that had not loaded yet; re-checked with eager loading on /, /about/, /blogs/, /azure-data-ai-services/, /ai-consulting-services/: 0 broken. All manifest files exist on disk |
| Low-res (466×291) heroes | Contained card, never above intrinsic size (277px wide at 360px viewport; max 466px). Dark mode checked visually on /cyber-security-services/ at 360px: card, border and white Clutch logo correct |
| Dark mode Clutch logo | White variant shown, light variant hidden (`.only-light/.only-dark`) |

## Issues by page

One issue, found by visual inspection (the automated checks did not catch it), **on every page at 1024px (shared header)**: the "Book a Discovery Call" button wrapped onto three lines and overflowed its box because the nav and button had no room. **Fixed once in the shared header** (`src/components/Layout.tsx`): tighter nav padding and `text-sm` between 1024 and 1279px, `whitespace-nowrap` on the button. Re-measured at 1024/1100/1280px: single line, 23px gap at 1024px, no overflow.

No other overflow, layout-shift, crop or error issues were found on any page at any of the three widths in either theme.

Limits of this test (please read): faces and text cropping was verified by the crop-ratio rule above and by visual spot checks of the low-res hero card at 360px dark mode; I did not visually inspect all 366 combinations. Please tell me if you want a screenshot review of a specific page set (for example the industry image sets).
