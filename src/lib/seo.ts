import { COMPANY, LOCALE } from '@/config/locale'
import { nationalDigits } from '@/lib/format'
import siteImages from '@/data/site-images.json'
import type { Entry } from '@/lib/content'
import { trimSentences } from '@/lib/menuCopy'

/** India-targeted metadata helpers. All wording and region data come from src/config/locale.ts. */

const SUFFIX = /\s*[-|–]\s*Q2M Solutions\s*$/i

/** "AI Development Services - Q2M Solutions" -> "AI Development Services in India | Q2M Solutions". Leaves titles that already say India alone. */
export function indiaTitle(raw: string): string {
  if (!LOCALE.seoIndiaSuffix) return raw
  const base = raw.replace(SUFFIX, '').trim()
  const brand = ` | ${COMPANY.name}`
  return new RegExp(LOCALE.country, 'i').test(base) ? base + brand : `${base} in ${LOCALE.country}${brand}`
}

/** Adds one factual sentence about the target market when the description does not already mention India. */
export function indiaDescription(raw = ''): string {
  if (!LOCALE.seoIndiaSuffix) return raw
  const d = raw.trim()
  if (!d) return `${COMPANY.name} serves businesses and enterprises across ${LOCALE.country}.`
  if (new RegExp(LOCALE.country, 'i').test(d)) return d
  return `${/[.!?]$/.test(d) ? d : d + '.'} Serving businesses across ${LOCALE.country}.`
}

/** Organization + LocalBusiness for every page. Address and telephone appear only once Q2M supplies them. */
export function organizationJsonLd() {
  const a = COMPANY.address
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${COMPANY.siteUrl}/#organization`,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.siteUrl,
    logo: `${COMPANY.siteUrl}${siteImages.brand.logoColor.file}`,
    email: COMPANY.email,
    ...(COMPANY.phone ? { telephone: `${LOCALE.dialCode}${nationalDigits(COMPANY.phone)}` } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [a.addressLine1, a.addressLine2, a.locality].join(', '),
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.pinCode,
      addressCountry: LOCALE.countryCode,
    },
    hasMap: COMPANY.mapUrl,
    areaServed: { '@type': 'Country', name: LOCALE.country },
    sameAs: COMPANY.social.map((s) => s.href),
  }
}
export const areaServedIndia = { '@type': 'Country', name: LOCALE.country }

/** Meta description: the page's live description, or (when the live page has none) its first real paragraph, trimmed to whole sentences. */
export function descriptionFor(e: Entry): string {
  if (e.description) return e.description
  const p = e.blocks.find((b) => b.t === 'p' && (b.text || '').length > 60)?.text ?? ''
  return trimSentences(p, 155)
}
