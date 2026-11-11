import { BOOKING, LOCALE } from '@/config/locale'

/**
 * Shared formatting and validation helpers. All pages and components use these; none hardcodes a format.
 * Everything is driven by src/config/locale.ts (en-IN, INR, Asia/Kolkata).
 */

/* ───────── Numbers and currency ───────── */
const nf = new Intl.NumberFormat(LOCALE.language)
/** 1250000 -> "12,50,000" (Indian digit grouping). */
export const formatNumber = (n: number, opts?: Intl.NumberFormatOptions) => (opts ? new Intl.NumberFormat(LOCALE.language, opts).format(n) : nf.format(n))

/** 1250000 -> "₹12,50,000". Whole rupees by default. */
export const formatCurrency = (amount: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat(LOCALE.language, { style: 'currency', currency: LOCALE.currency, maximumFractionDigits: 0, ...opts }).format(amount)

/** Text wording for amounts: 1250000 -> "₹12.5 lakh", 24000000 -> "₹2.4 crore", 85000 -> "₹85,000". */
export function formatCurrencyWords(amount: number): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  const trim = (v: number) => String(+v.toFixed(2))
  if (abs >= 1e7) return `${sign}${LOCALE.currencySymbol}${trim(abs / 1e7)} crore`
  if (abs >= 1e5) return `${sign}${LOCALE.currencySymbol}${trim(abs / 1e5)} lakh`
  return formatCurrency(amount)
}

/* ───────── Dates and times (always IST) ───────── */
const toDate = (d: Date | string | number) => (d instanceof Date ? d : new Date(d))
/** "11 Nov 2026" */
export const formatDate = (d: Date | string | number) => toDate(d).toLocaleDateString(LOCALE.language, { ...LOCALE.dateStyle, timeZone: LOCALE.timeZone })
/** "11/11/2026" */
export const formatDateNumeric = (d: Date | string | number) => toDate(d).toLocaleDateString(LOCALE.language, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: LOCALE.timeZone })
/** "Thu, 12 Nov 2026" */
export const formatDateLong = (d: Date | string | number) => `${toDate(d).toLocaleDateString(LOCALE.language, { weekday: 'short', timeZone: LOCALE.timeZone })}, ${formatDate(d)}`
/** "10:30 am IST" */
export const formatTime = (d: Date | string | number) =>
  `${toDate(d).toLocaleTimeString(LOCALE.language, { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: LOCALE.timeZone })} ${LOCALE.timeZoneLabel}`
export const formatDateTime = (d: Date | string | number) => `${formatDate(d)}, ${formatTime(d)}`

/* ───────── Booking slots (IST, Indian business hours from the locale config) ───────── */
export type Slot = { value: string; label: string }
const ymdIST = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: LOCALE.timeZone }).format(d) // YYYY-MM-DD in IST
const atIST = (ymd: string, hm: string) => new Date(`${ymd}T${hm}:00${LOCALE.utcOffset}`)
const addMinutes = (hm: string, m: number) => { const [h, mi] = hm.split(':').map(Number); const t = h * 60 + mi + m; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` }

/** Bookable dates: the next business days (in IST), starting today if slots remain. */
export function bookableDates(now = new Date()): Slot[] {
  const out: Slot[] = []
  const [y, m, d] = ymdIST(now).split('-').map(Number)
  for (let i = 0; out.length < BOOKING.daysAhead && i < 40; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i, 12))
    const dow = day.getUTCDay()
    if (!(BOOKING.businessDays as readonly number[]).includes(dow)) continue
    const ymd = day.toISOString().slice(0, 10)
    if (timeSlots(ymd, now).length === 0) continue
    out.push({ value: ymd, label: formatDateLong(atIST(ymd, '12:00')) })
  }
  return out
}
/** Time slots for a date, in IST, within business hours, skipping times inside the lead-time window. */
export function timeSlots(ymd: string, now = new Date()): Slot[] {
  const out: Slot[] = []
  const earliest = now.getTime() + BOOKING.leadTimeMinutes * 60000
  for (let t: string = BOOKING.startTime; addMinutes(t, BOOKING.slotMinutes) <= BOOKING.endTime; t = addMinutes(t, BOOKING.slotMinutes)) {
    if (atIST(ymd, t).getTime() < earliest) continue
    out.push({ value: t, label: formatTime(atIST(ymd, t)) })
  }
  return out
}

/** "Mon to Fri, 10:00 to 18:00 IST" from the booking config. */
export function businessHoursLabel(): string {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const d = [...BOOKING.businessDays]
  const days = d.length > 1 ? `${names[d[0]]} to ${names[d[d.length - 1]]}` : names[d[0]]
  return `${days}, ${BOOKING.startTime} to ${BOOKING.endTime} ${LOCALE.timeZoneLabel}`
}

/* ───────── Phone ───────── */
/** Strip a leading +91 / 91 / 0 and any non-digits. */
export const nationalDigits = (raw: string) => {
  let d = raw.replace(/[^\d+]/g, '')
  if (d.startsWith('+')) d = d.slice(1)
  if (d.startsWith('91') && d.length === 12) d = d.slice(2)
  if (d.startsWith('0') && d.length === 11) d = d.slice(1)
  return d
}
/** Indian mobile: 10 digits starting 6-9. */
export const isValidIndianMobile = (raw: string) => /^[6-9]\d{9}$/.test(nationalDigits(raw))
/** "9876543210" -> "+91 98765 43210". Returns the input unchanged if it is not a valid mobile number. */
export const formatPhone = (raw: string) => {
  const d = nationalDigits(raw)
  return /^\d{10}$/.test(d) ? `${LOCALE.dialCode} ${d.slice(0, 5)} ${d.slice(5)}` : raw
}
export const phoneHref = (raw: string) => `tel:${LOCALE.dialCode}${nationalDigits(raw)}`

/* ───────── Address and tax identifiers ───────── */
/** PIN code: 6 digits, first digit 1-9. */
export const isValidPin = (v: string) => /^[1-9]\d{5}$/.test(v.trim())
/** GSTIN: 15 characters, state code (01-38, 97, 99) + PAN (AAAAA9999A) + entity no. + 'Z' + check character. */
export const isValidGstin = (v: string) => /^(0[1-9]|[12]\d|3[0-8]|97|99)[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v.trim().toUpperCase())
