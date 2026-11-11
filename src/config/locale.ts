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

/** Company details. Only confirmed values are set. */
export const COMPANY = {
  name: 'Q2M Solutions',
  legalName: 'Q2M Solutions Pvt Ltd',
  siteUrl: 'https://q2msolutions.com',
  email: 'info@q2msolutions.com',
  phone: null as string | null,            // NEEDS INPUT: Indian number, e.g. '9876543210' (10 digits). Not supplied yet.
  address: null as null | { line1: string; line2?: string; city: string; state: string; pin: string }, // NEEDS INPUT
  mapUrl: null as string | null,
  linkedin: 'https://www.linkedin.com/company/q2m-solutions/',
  /** NEEDS INPUT: Google Business Profile URL. Until set, the footer Google reviews badge stays unlinked. */
  googleBusinessProfile: null as string | null,
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/q2m-solutions/' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61562342012252' },
    { label: 'Instagram', href: 'https://www.instagram.com/qtomsolutions/' },
    { label: 'YouTube', href: 'https://www.youtube.com/@Q2MSolutions' },
    { label: 'Clutch', href: 'https://clutch.co/profile/q2m-solutions' },
  ],
  /** Data Protection / grievance contact required under the DPDP Act, 2023. NEEDS INPUT: name and designation. */
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
} as const
