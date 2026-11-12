/**
 * Single source of truth for India localisation.
 * Every page, form, helper and metadata function reads from here. Nothing region-specific lives anywhere else.
 *
 * `null` values are details Q2M has not supplied yet. Components render a detail only when it is set, so nothing is invented.
 * Items that still need your input are listed in docs/INDIA_LOCALISATION.md.
 */
export const LOCALE = {
  language: 'en-IN',          // BCP 47: Indian English (British spelling)
  ogLocale: 'en_IN',          // Open Graph
  hreflang: 'en-IN',
  country: 'India',
  countryCode: 'IN',          // ISO 3166-1 alpha-2
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  utcOffset: '+05:30',
  dialCode: '+91',
  /** Live titles and descriptions are used exactly. Set true to append "in India" to service-page titles. */
  seoIndiaSuffix: false,
  dateStyle: { day: 'numeric', month: 'short', year: 'numeric' } as Intl.DateTimeFormatOptions, // "11 Nov 2026"
} as const

/** Booking / scheduling rules. Times are IST. Change here and every form follows. */
export const BOOKING = {
  businessDays: [1, 2, 3, 4, 5],   // Mon to Fri (0 = Sunday)
  startTime: '10:00',              // first slot, IST
  endTime: '18:00',                // last slot ends by this time, IST
  slotMinutes: 30,
  leadTimeMinutes: 120,            // earliest bookable slot is this far from now
  daysAhead: 10,                   // how many business days are offered
} as const

/** Registered address, split into fields. Every place that shows the address reads these (footer, Contact, Privacy Policy, JSON-LD, map link). */
export const ADDRESS = {
  addressLine1: 'Indu Chacha Complex, near Chhani Jakat Naka Circle',
  addressLine2: 'TP 13',
  locality: 'Chhani Jakatnaka',
  city: 'Vadodara',
  state: 'Gujarat',
  pinCode: '390024',
  country: LOCALE.country,
} as const
/** The address as one line, built from ADDRESS. */
export const fullAddress = (a: typeof ADDRESS = ADDRESS) => `${a.addressLine1}, ${a.addressLine2}, ${a.locality}, ${a.city}, ${a.state} ${a.pinCode}, ${a.country}`

/** Company details. Only confirmed values are set. */
export const COMPANY = {
  /** Brand name: logo, header and marketing copy. */
  name: 'Q2M Solutions',
  /** Legal name: footer copyright line, Privacy Policy, Contact page company block, Organization JSON-LD. */
  legalName: 'Q2M Solutions Private Limited',
  siteUrl: 'https://q2msolutions.com',
  email: 'info@q2msolutions.in',
  /** 10-digit Indian mobile. Shown as "+91 87994 65558" and linked as tel:+918799465558 by formatPhone() / phoneHref(). */
  phone: '8799465558' as string | null,
  address: ADDRESS,
  /** Google Maps search for the full address. */
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress())}`,
  linkedin: 'https://www.linkedin.com/company/q2m-solutions/',
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/q2m-solutions/' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61562342012252' },
    { label: 'Instagram', href: 'https://www.instagram.com/qtomsolutions/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@Q2MSolutions' },
  ],
  /** TODO: Corporate Identity Number (CIN). Not supplied yet: while empty, nothing about the CIN is shown on the site. */
  cin: null as string | null,
  /** TODO: Data Protection / grievance contact required under the DPDP Act, 2023. NEEDS INPUT: name and designation. */
  grievanceOfficer: null as null | { name: string; designation: string; email: string },
} as const

/** Privacy and consent wording. DRAFT: generated text, must be reviewed by Q2M's legal counsel before it is treated as final. */
export const LEGAL = {
  privacyPath: '/privacy-policy/',
  act: 'the Digital Personal Data Protection Act, 2023 (DPDP Act)',
  reviewStatus: 'DRAFT: pending legal review',
  consentLabel: (company = COMPANY.legalName) =>
    `I consent to ${company} processing the personal data I enter in this form to respond to my request, as described in the Privacy Policy, under the Digital Personal Data Protection Act, 2023. I can withdraw this consent at any time by emailing ${COMPANY.email}.`,
} as const

/** All 28 states and 8 union territories (alphabetical within each group). */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const
export const INDIAN_UNION_TERRITORIES = [
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCT)', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const

/** Image rules shared by every page. */
export const IMAGES = {
  /** Hero images narrower than this are never enlarged: they render in a contained card at their intrinsic size. */
  lowResHeroBelow: 800,
  /** Hero images at least this wide may be used as og:image. */
  ogMinWidth: 1200,
  /**
   * Pages whose live hero list has both a 466px and a 2000px file that are DIFFERENT pictures (checked side by side, docs/hero-compare/).
   * These keep the 466px picture in the contained card. On every other page the widest hero is used (same picture, higher resolution).
   */
  lowResHeroPages: [
    '/ai-consulting-services/',
    '/ai-development-services/',
    '/ai-app-development-services/',
    '/ai-chatbot-development-company/',
    '/machine-learning-development-services/',
  ],
} as const
