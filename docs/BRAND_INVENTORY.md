# Q2M brand asset inventory and how it is applied

Source of truth: `Q2M_Brand_Kit` (v1, November 2026). Nothing in the site's design is taken from anywhere else.

## Kit contents
| File | Used for |
|---|---|
| `Logos/Q2M_Logo_Color_Transparent.png` (826x498) | Header and splash on light backgrounds (copied unmodified to `public/brand/`) |
| `Logos/Q2M_Logo_Reverse_Transparent.png` | Footer, and the header in dark theme (on black) |
| `Logos/Q2M_Logo_Black_Transparent.png`, `_White_Transparent.png`, `_Original_White.png` | Not used on the site. They are for one-colour print, and white-on-blue use. |
| `q2m-colors.css`, `q2m-tokens.json` | Mirrored in `src/styles/index.css` (palette, light and dark tokens, type, radius, spacing) |
| `Q2M_Brand_Guidelines.pdf` | Rules below |

## Official tokens
Black `#000000`, Q2M Blue `#0075EA` (dots, icons, fills, display 24px+), Action Blue `#0062C4` (buttons, links, small blue text), Grey `#898989` (decorative only), Muted `#5C6168`, Tint `#E6F1FD`, Surface `#F4F5F7`, Line `#E2E4E8`. Dark theme: surface `#0B0D10`, raised `#15181D`, ink `#F4F6F8`, blue/action `#3D96F5`, block `#1E232A`.

Fonts (Google Fonts, OFL, self-hosted via Fontsource): **Sora** 600/700 headlines, **DM Sans** body and labels, **JetBrains Mono** numbers and dates.

## Rules and how the site follows them
| Rule | Implementation |
|---|---|
| Colour logo on white, reverse on black; no recolouring, stretching or redrawing | The PNGs are used as-is; CSS shows the right variant per theme and slab |
| Minimum logo width 96px; clear space equal to the height of the "2" | Header logo is 96px wide in a 88/96px header. Footer logo is 120px. |
| Flat colour, no gradients, borders not shadows | All shadows and gradients removed (checked on all 61 pages: none) |
| One blue per layout | `--blue` for fills and dots, `--action` for text and buttons, never mixed with other hues |
| Corners 8px buttons/cards, 4px tags/inputs, 16px panels, pills for tags only | `--radius-sm/md/lg` |
| 4px spacing base, 48px mobile / 64px+ desktop section gaps | `.section`, Tailwind 4px scale |
| Dot arrow once per surface, corner or black slab, never behind text | `DotArrow` is used on the hero slab and the final CTA slab only |
| Left-aligned layouts, 12-column grid | Used throughout |
| Sora Bold display, 64/60 hero only | `.display-xl` is capped at 64px and used on the homepage hero only |
| Body text never in grey `#898989` | Secondary text uses Muted `#5C6168` |
| 2px focus ring, 2px offset | Global `:focus-visible` |
| Voice: plain, no hype, no em dashes, no emoji, only confirmed numbers | My own copy follows this. Copy that comes from the CMS is unchanged. |

## Conflicts between the kit and the existing site (need a decision)
1. **Location:** the guidelines say "built in India" and "Bengaluru, India" appears as a sample. The live site says Singapore (office at 143 Cecil Street, Singapore). I kept the site's facts.
2. **Services list:** the guidelines list agentic commerce (ACP/UCP) readiness and 3D Gaussian splatting. No pages exist for these on the live site, so I have not created any.
3. **Industries:** the kit lists Automotive, Life sciences/health/biotech, Real estate, Insurance, Fintech, BPO. The site's homepage lists Financial Services, Logistics, Healthcare, Manufacturing, Public Sector, SaaS. I kept the site's content.
4. **Sentence-case headlines:** the CMS titles are in Title Case ("AI Development Services"). I did not change CMS text automatically, because it would damage product names. Say if you want them edited in the CMS.
5. **Favicon:** the kit has no icon file. I kept the live site's `q2m-icon.svg` for the browser tab only. Please supply an official favicon.
6. **Print assets:** the logos are raster (826px). A vector master (SVG) is needed for sharper logos on high-density screens.
7. **Em dashes in CMS copy** (e.g. "Pilots — real RAG…") conflict with the voice rules. They are the site's existing text.
