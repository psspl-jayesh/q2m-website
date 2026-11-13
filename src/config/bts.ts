import { useEffect, useState } from 'react'

/**
 * Bengaluru Tech Summit 2026: the ONE place for event dates and flags.
 * The landing page and the home page BTS items read only from here.
 */
export const BTS = {
  path: '/bengaluru-tech-summit-2026/',
  /** Event opens (countdown target). */
  start: '2026-11-17T09:00:00+05:30',
  /** Event closes. After this moment all BTS booking items hide and the landing page thanks visitors. */
  end: '2026-11-19T18:00:00+05:30',
  venue: {
    name: 'Bangalore International Exhibition Centre (BIEC)',
    /** Short form for compact lines such as the announcement popup. */
    short: 'BIEC, Bengaluru',
    address: 'Tumkur Road, Bengaluru',
    /** Google Maps search for the venue, opens in a new tab. */
    directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Bangalore International Exhibition Centre, Tumkur Road, Bengaluru')}`,
  },
  /**
   * NEEDS CONFIRMATION: does Q2M have a booth with live demos? Until confirmed (false), "Live demos" is hidden and the demo
   * section is worded as what we can show you, not as a booth demo.
   */
  liveDemos: false,
  /**
   * Announcement popup on every page except the BTS landing page (src/components/BtsPopup.tsx): shown 2 s after load, once per
   * visitor every 7 days, and switched off when the event closes (`end`). No demo claim while `liveDemos` is false.
   */
  popup: {
    badge: "We're at Bengaluru Tech Summit 2026",
    badgeShort: "We're at BTS 2026",
    titleLead: 'Meet Q2M at',
    titleAccent: 'BTS 2026',
    /** "30‑minute" uses a non-breaking hyphen so it never splits across lines. */
    text: "Visit us at BIEC, Bengaluru and book a 30‑minute session with our team. Bring one process, and we'll map an AI agent or automation for it.",
    /** Event theme, from the owner's popup design (12 Nov 2026). */
    theme: 'AI & Beyond',
    cta: 'Book a meeting',
    later: 'Maybe later',
    delayMs: 2000,
    snoozeDays: 7,
  },
} as const

export type BtsPhase = 'before' | 'live' | 'after'

/**
 * "Now" for BTS logic. For checking the before/during/after states, a date can be mocked with ?btsNow=<ISO date> in the URL;
 * this only works on the development server, never on the live site.
 */
export function btsNow(): Date {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const mock = new URLSearchParams(window.location.search).get('btsNow')
    if (mock) { const d = new Date(mock); if (!Number.isNaN(d.getTime())) return d }
  }
  return new Date()
}

export function btsPhase(now: Date = btsNow()): BtsPhase {
  if (now < new Date(BTS.start)) return 'before'
  if (now < new Date(BTS.end)) return 'live'
  return 'after'
}

/** "17 to 19 November 2026", built from the config dates (shown in Indian time). */
export function btsDateRange(): string {
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...o }).format(new Date(iso))
  return `${fmt(BTS.start, { day: 'numeric' })} to ${fmt(BTS.end, { day: 'numeric', month: 'long', year: 'numeric' })}`
}

/** "17–19 November 2026" (en dash), for compact labels such as the home date pill. */
export function btsDateRangeShort(): string {
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...o }).format(new Date(iso))
  return `${fmt(BTS.start, { day: 'numeric' })}–${fmt(BTS.end, { day: 'numeric', month: 'long', year: 'numeric' })}`
}

/** Daily opening hours from the start and end times, e.g. "9 AM – 6 PM" (Indian time). */
export function btsHours(): string {
  const t = (iso: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: true }).format(new Date(iso)).toUpperCase()
  // no-break spaces keep "9 AM" and "6 PM" together when the line wraps
  const keep = (x: string) => x.replace(/\s/g, ' ')
  return `${keep(t(BTS.start))} – ${keep(t(BTS.end))}`
}

/** "17–19 Nov 2026": the date range with a short month name. */
export function btsDateRangeAbbr(): string {
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', ...o }).format(new Date(iso))
  return `${fmt(BTS.start, { day: 'numeric' })}–${fmt(BTS.end, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** React hook: the current BTS phase, re-checked every 30 seconds so pages switch at the right moment without a reload. */
export function useBtsPhase(): BtsPhase {
  const [phase, setPhase] = useState<BtsPhase>(() => btsPhase())
  useEffect(() => { const t = window.setInterval(() => setPhase(btsPhase()), 30_000); return () => window.clearInterval(t) }, [])
  return phase
}

