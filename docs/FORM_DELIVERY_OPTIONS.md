# Contact and booking forms: where submissions go (for your decision)

## What the live form uses (https://q2msolutions.com/contact/, checked 11 Nov 2026)
| Item | Found |
|---|---|
| Form plugin | **Contact Form 7** 6.2.3 (the current site's form plugin), form ID 18, unit tag `wpcf7-f18-p63-o1`, on page ID 63 |
| Posts to | `/contact/#wpcf7-f18-p63-o1` (Contact Form 7 sends it through the current site with a security token) |
| Fields | `full-name` (text), `organization` (text), `tel-phone` (tel), `email-company` (email), `subject` (text), `textarea-message` (textarea); button "Submit Now" |
| Hidden fields | `_wpcf7`, `_wpcf7_version`, `_wpcf7_locale` (en_US), `_wpcf7_unit_tag`, `_wpcf7_container_post`, `_wpcf7_posted_data_hash`, `_wpnonce`, `_wp_http_referer` |
| Spam protection | **hCaptcha** (site key `0a6cead8-578e-497a-9d32-0d709a8295e2`) |
| Analytics | Google Analytics 4 via gtag (`G-7T9HVTW3TN`) |
| CRM or email-marketing tools | **None visible on the page** (no HubSpot, Zoho, Mailchimp, Salesforce or reCAPTCHA scripts) |
| Where the email goes | **Not visible from outside.** Please check in the current site's admin: Contact → Contact Forms → form 18 → **Mail** tab (To, From, any Mail (2) copy), and Plugins (any "CF7 to CRM", Flamingo or webhook add-on). |

## What our site does now
- Both forms keep the live field names where they match (`full-name`, `organization`, `tel-phone`, `email-company`, `subject`, `textarea-message`), plus our India fields: +91 mobile, optional GSTIN and Indian address, and the DPDP consent checkbox.
- **Until you choose an option, both forms open a pre-filled email to info@q2msolutions.in in the visitor's mail app** (mailto). The page says clearly that nothing is sent until the visitor presses send.
- Our Contact form used to post directly to the live site's form endpoint. That is removed: it needed a nonce, could break at any time, and stops working when the old site is replaced.

## Options (pick one; nothing is implemented until you choose)

| | A. Form service | B. Serverless function on the hosting platform | C. Our own small API on Azure |
|---|---|---|---|
| How it works | The browser posts the form to a hosted form service (for example Formspree, Basin or Web3Forms). The service emails info@q2msolutions.in and can forward to a CRM by webhook or Zapier. | A small function next to the site (Netlify Functions, Vercel Functions or Cloudflare Workers, depending on where we host) checks the fields and the captcha, then sends the email through an email API (Resend, Postmark or Amazon SES) or through your Microsoft 365 mailbox (Microsoft Graph). | An Azure Function (or App Service) in the Central India region checks the fields and the captcha and sends the email from your Microsoft 365 mailbox through Microsoft Graph. CRM forwarding can be added in the same function. |
| Effort | About half a day | About 1 day | About 1.5 to 2 days, plus Azure setup |
| Pros | Fastest. No server code. Spam filtering included. Submissions dashboard. | We own the code and validation. Secrets stay on the server. Cheap or free at our volume. Easy to add a CRM later. Works the same for both forms. | Full control. Data can stay in India. Fits the Microsoft stack (sends from your own mailbox). Easy CRM or Dynamics 365 integration later. |
| Cons | A third party stores the submissions (often outside India): needs a data-processing check under the DPDP Act. Monthly submission limits. Their branding on free plans. | Tied to the hosting platform we choose. Needs an email sending setup (SPF/DKIM for the domain or Microsoft 365 app registration). | Most setup and upkeep. Needs an Azure subscription and an app registration with permission to send mail. |
| Typical cost | Free tier about 50 submissions/month; paid plans roughly US$10 to 20 per month (check current pricing) | Usually free at our volume (function free tiers; email APIs have free tiers of a few thousand emails/month) | Azure Functions consumption plan is usually free at our volume; Microsoft 365 mailbox already paid |
| Spam protection | Built in (honeypot, captcha) | hCaptcha or Cloudflare Turnstile, verified on the server | hCaptcha or Turnstile, verified on the server |

**My recommendation: B**, once the hosting platform is decided (or **C** if the site will be hosted on Azure). Both keep submissions under your control and send to info@q2msolutions.in. Tell me which option, and whether any CRM should also receive the submissions after you check the current site's form settings.
