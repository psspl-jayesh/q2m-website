# Q2M Solutions — Phase 0 & 1 Findings (2026-11-11)

Scope: read-only public crawl of https://q2msolutions.com/. No repository, staging site or CMS access has been provided, and nothing has been modified.

## Phase 0 — Environment
| Item | Finding |
|---|---|
| Local project | `h:\q2m-solution` was **empty**. There is no repo, theme export or staging, so no local run or test commands exist. |
| CMS | **WordPress 7.1.4** on Apache 2.4.52 (Ubuntu). |
| Builder / theme | **Elementor 4.3.5** (Header-Footer-Elementor `hfe`), theme **zenfy** with a **zenfy-child** child theme. |
| Plugins (seen on the front end / REST namespaces) | Yoast SEO, Contact Form 7, hCaptcha, WebP Express, Redirection, Schema & Structured Data for WP (`saswp`), MC4WP (Mailchimp), Duplicate Post, WP 2FA, WP Mail SMTP, NPS Survey, plus `ps-wp-insights`, `elementor-mcp-composer` and `mcp` REST endpoints. |
| Analytics / widgets | Google Analytics 4 (`G-7T9HVTW3TN`), Crisp chat reference. No GTM, Meta pixel or LinkedIn insight tag was detected on the homepage. This needs confirming in the browser. |
| Forms | Contact Form 7 + hCaptcha (the contact page), MC4WP (newsletter). The delivery path (WP Mail SMTP / CRM) is unverified. |
| Robots / sitemaps | `robots.txt` is Yoast's default and only blocks `/wp-admin/`. The sitemap index lists post, page, case-study, portfolio, category and author sitemaps. |

**Implication:** This is an Elementor-built WordPress site, so the redesign has to be delivered as an Elementor/child-theme change. Building a new framework would break the "preserve the CMS and plugins" rule. Access to wp-admin, a staging copy or a backup is required before any build.

## Phase 1 — URL inventory
Files: [url_inventory.csv](url_inventory.csv), [external_links.csv](external_links.csv), [crawl.py](crawl.py) (re-runnable).

- **129 internal URLs** were discovered. 72 are in the sitemaps, and **57 are found only through links**. All 129 return HTTP 200 after redirects.
- Families:
  - Pages and posts: 62
  - Date archives: 30
  - Portfolio items: 11
  - Categories: 9
  - Portfolio tags: 5
  - Portfolio categories: 4
  - Case studies: 4
  - Authors: 2
  - Tags: 2
- 41 external domains are linked. They include social profiles, Clutch/DesignRush, third-party statistics sources cited in blog posts, and Campus Click (`campusclick365.com`).
- **Audit status:** every URL is "Crawled: metadata only". None has had a visual, screenshot, UX or performance audit yet, so none should be called "Audited".

### Issues found (initial, metadata-level)
| Sev | Issue | Evidence |
|---|---|---|
| High | **11 legacy "portfolio" pages** with demo-style content (e.g. "Captivating digital campaign", "set-the-industry-ablaze", slugs like `…-copy-copy-copy`) are linked or in a sitemap, but set to **noindex**. This confirms the generic creative-agency leftovers noted in the brief. They need a decision (retire or redirect) and not a redesign. | `portfolio/*`, `portfolio-category/*`, `portfolio-tag/*` |
| High | **61 of 129 pages have no meta description.** Most are archives, but check the money pages too. | inventory |
| High | **6 service pages have 2 × H1**: ai-development, chatbot, machine-learning, ai-consulting, ai-app, ai-agent. | inventory |
| Med | **3 case studies and the AI4 2026 event page have no H1.** | `case-study/*`, `ai4-2026-…` |
| Med | **Date archives** (`/2026/07/15/` etc.) are crawlable. They redirect from the no-slash form and are noindex. Two (`/2024/03/20/`, `/2024/03/28/`) redirect to the homepage. They add crawl noise and should be reviewed. | inventory |
| Med | `/agentic-ai-services/` 301s to `/ai-agent-development-services/`. This is a legitimate redirect, but internal links should point to the final URL. | inventory |
| Med | The brief's list of pages contains slugs the crawl didn't confirm, or confirmed with different names. For example the chatbot page is `/ai-chatbot-development-company/`. Reconcile against the real menu. | inventory |
| Info | The brief said some homepage metrics are zero, and that a Contact page has placeholder-style copy. Both are **not yet verified** because they are counters and page content that need a rendered browser pass. | pending |
| Info | Canonical tags match the final URL on all pages that have one. No 4xx/5xx errors. | inventory |

### Not done yet (needs browser pass or access)
- The screenshots at 360–1920px, interaction testing, Lighthouse/CrUX, accessibility, and the rendered mega-menu and counters (JavaScript-driven).
- Hidden or JS-only navigation links. The crawler only follows static `<a href>` links in the HTML.
- Form delivery, CRM and email checks (needs an approved test submission).

## Needed from you before moving on
1. **A working copy:** wp-admin access or a full backup (files + DB) and a staging environment. I will not touch production.
2. **Brand assets:** logo files, fonts and colour values, or confirmation to extract them from the site.
3. **Approval of the portfolio decision:** keep, retire or redirect the 11 legacy portfolio pages.
4. **Next step choice:** continue with Phase 2 (the browser-based visual/performance/accessibility audit of each page family) on the live site, which is read-only and safe.
