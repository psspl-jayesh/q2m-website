import { COMPANY, LOCALE } from '@/config/locale'
import { formatPhone, nationalDigits } from '@/lib/format'
import siteImages from '@/data/site-images.json'

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
    name: COMPANY.legalName,
    alternateName: COMPANY.name,
    url: COMPANY.siteUrl,
    logo: `${COMPANY.siteUrl}${siteImages.brand.logoColor.file}`,
    email: COMPANY.email,
    ...(COMPANY.phone ? { telephone: formatPhone(nationalDigits(COMPANY.phone)) } : {}),
    address: {
      '@type': 'PostalAddress',
      addressCountry: LOCALE.countryCode,
      ...(a ? { streetAddress: [a.line1, a.line2].filter(Boolean).join(', '), addressLocality: a.city, addressRegion: a.state, postalCode: a.pin } : {}),
    },
    areaServed: { '@type': 'Country', name: LOCALE.country },
    sameAs: COMPANY.social.map((s) => s.href),
  }
}
export const areaServedIndia = { '@type': 'Country', name: LOCALE.country }
