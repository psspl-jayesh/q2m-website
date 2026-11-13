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
   * visitor every `snoozeDays` days, and switched off when the event closes (`end`). Note: the banner image itself
   * carries the owner's "solutions in action" line; the phone sheet uses neutral wording while `liveDemos` is false.
   */
  popup: {
    /** Larger screens show the owner's banner image (also on q2msolutions.com as Popup-Q2M-Bengaluru-Tech-Summit-2026.webp). */
    image: '/images/bts/bts-popup-desktop.png',
    /** Optional: add this file and run the image optimiser to show an image on phones instead of the HTML bottom sheet. */
    mobileImage: '/images/bts/bts-popup-mobile.png',
    imageAlt: 'Q2M Solutions at Bengaluru Tech Summit 2026, 17–19 November 2026, BIEC Bengaluru. AI-powered smart glasses, agentic AI, computer vision and document intelligence. Meet us at the summit.',
    /* Phones: the HTML bottom sheet below uses this text. */
    pill: "We're Participating in",
    title: 'Bengaluru Tech Summit 2026',
    /** Shown while `liveDemos` is false. */
    text: 'Meet us to talk about our AI, Smart Glasses and Intelligent Automation solutions.',
    /** The banner's line, shown only when `liveDemos` is true. */
    textLiveDemos: 'Experience our AI, Smart Glasses and Intelligent Automation solutions in action.',
    items: [
      { icon: 'glasses', text: 'AI-Powered Smart Glasses & XR' },
      { icon: 'chip', text: 'Agentic AI & Generative AI' },
      { icon: 'video', text: 'Computer Vision & Video Intelligence' },
      { icon: 'document', text: 'Document Intelligence & Automation' },
    ],
    /** Phones: the photo cut from the owner's banner (without the banner text). */
    photo: { file: '/images/bts-2026/popup-photo.jpg', alt: 'Technician wearing smart glasses checking a car door, with a damage analysis overlay' },
    cta: 'Meet us at the summit',
    later: 'Maybe later',
    delayMs: 2000,
    /** After closing it or following the link, the popup stays hidden this many days (per browser). */
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



/** React hook: the current BTS phase, re-checked every 30 seconds so pages switch at the right moment without a reload. */
export function useBtsPhase(): BtsPhase {
  const [phase, setPhase] = useState<BtsPhase>(() => btsPhase())
  useEffect(() => { const t = window.setInterval(() => setPhase(btsPhase()), 30_000); return () => window.clearInterval(t) }, [])
  return phase
}

