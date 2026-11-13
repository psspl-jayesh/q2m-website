import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { COMPANY, LEGAL } from '@/config/locale'
import { emailServiceConfigured, isBot, openEmailDraft, sendSubmission } from '@/lib/formDelivery'

/**
 * Building blocks of the smart glasses design (design/smart-glasses-page, design/home-new): line icons, pill label, scroll reveal
 * and the dark discovery-call form. Styles: src/styles/home-glasses.css (scope .hg).
 */

/* ───────── icons (the design's line icons, 48×48 grid) ───────── */
const ICONS: Record<string, ReactNode> = {
  glasses: <><path d="M4 18h40" /><rect x="5" y="18" width="16" height="13" rx="5" /><rect x="27" y="18" width="16" height="13" rx="5" /><path d="M21 22c2-2 4-2 6 0" /><path d="M31 23h8M31 27h5" /></>,
  device: <><rect x="4" y="18" width="16" height="11" rx="4" /><rect x="28" y="18" width="16" height="11" rx="4" /><path d="M20 22c2.5-2 5.5-2 8 0" /><path d="M12 36v4M36 36v4M12 40h24" /><path d="M24 8v6" /></>,
  robot: <><rect x="9" y="14" width="30" height="22" rx="7" /><path d="M24 14V8" /><circle cx="24" cy="6" r="2" /><circle cx="18" cy="25" r="2.2" fill="currentColor" /><circle cx="30" cy="25" r="2.2" fill="currentColor" /><path d="M19 31h10" /><path d="M5 22v6M43 22v6" /></>,
  network: <><circle cx="10" cy="12" r="5" /><circle cx="38" cy="12" r="5" /><circle cx="24" cy="37" r="5" /><path d="M15 12h18" /><path d="M35 16l-8 16" /><path d="M13 16l8 16" /><path d="M29 9l4 3-4 3" /></>,
  hardhat: <><path d="M8 30a16 16 0 0 1 32 0" /><path d="M5 30h38v4H5z" /><path d="M20 14v8M28 14v8" /><path d="M24 12v-4" /></>,
  headset: <><path d="M8 28v-4a16 16 0 0 1 32 0v4" /><rect x="6" y="26" width="8" height="12" rx="3" /><rect x="34" y="26" width="8" height="12" rx="3" /><path d="M38 38c0 4-4 5-10 5h-4" /></>,
  chart: <><path d="M6 40h36" /><rect x="10" y="26" width="6" height="14" /><rect x="21" y="18" width="6" height="22" /><rect x="32" y="10" width="6" height="30" /><path d="M8 18l10-8 8 5 14-9" /></>,
  cycle: <><path d="M38 18a15 15 0 0 0-27-4" /><path d="M10 6v8h8" /><path d="M10 30a15 15 0 0 0 27 4" /><path d="M38 42v-8h-8" /><path d="M18 26l4 4 8-9" /></>,
  car: <><path d="M6 30l4-10c1-2 2-3 5-3h18c3 0 4 1 5 3l4 10v8H6z" /><circle cx="14" cy="34" r="3" /><circle cx="34" cy="34" r="3" /><path d="M10 26h28" /></>,
  layers: <><path d="M24 6l18 9-18 9-18-9z" /><path d="M6 24l18 9 18-9" /><path d="M6 33l18 9 18-9" /></>,
  medical: <><rect x="8" y="8" width="32" height="32" rx="8" /><path d="M24 16v16M16 24h16" /></>,
  shield: <><path d="M24 5l16 6v12c0 10-7 17-16 20C15 40 8 33 8 23V11z" /><path d="M17 24l5 5 9-10" /></>,
  gauge: <><path d="M8 34a16 16 0 1 1 32 0" /><path d="M24 34l8-10" /><circle cx="24" cy="34" r="2.5" fill="currentColor" /><path d="M12 22l3 2M36 22l-3 2M24 14v4" /></>,
  question: <><circle cx="24" cy="24" r="18" /><path d="M19 19a5 5 0 1 1 7 4.6c-1.3.6-2 1.6-2 3V28" /><circle cx="24" cy="34" r="1.4" fill="currentColor" /></>,
  lock: <><rect x="10" y="22" width="28" height="20" rx="3" /><path d="M16 22v-6a8 8 0 0 1 16 0v6" /><circle cx="24" cy="31" r="3" /><path d="M24 34v3" /></>,
  person: <><circle cx="18" cy="16" r="6" /><path d="M6 40c1-7 6-11 12-11s11 4 12 11" /><path d="M30 22l4 4 9-9" /></>,
  cube: <><path d="M24 5l17 9v20l-17 9-17-9V14z" /><path d="M7 14l17 9 17-9M24 23v20" /><circle cx="15" cy="27" r="1.6" fill="currentColor" /><circle cx="33" cy="27" r="1.6" fill="currentColor" /><circle cx="24" cy="13" r="1.6" fill="currentColor" /></>,
}
export const Svg = ({ name }: { name: string }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>
)
export const Ico = ({ name, soft }: { name: string; soft?: boolean }) => <span className={soft ? 'ico ico-s' : 'ico'}><Svg name={name} /></span>
export const Pill = ({ children, dark }: { children: ReactNode; dark?: boolean }) => <span className={dark ? 'pill pill-d' : 'pill'}>{children}</span>

/** The rotating "DISCOVER · PILOT · DEPLOY · SCALE" badge on the hero image (decorative). */
export const RingBadge = ({ text, id }: { text: string; id: string }) => (
  <div className="badge" aria-hidden="true">
    <svg className="ringt" viewBox="0 0 132 132"><defs><path id={id} d="M66,66 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" /></defs><text fontFamily="Inter Variable, Inter, sans-serif" fontWeight="600" fontSize="11.5" letterSpacing="3.2" fill="currentColor"><textPath href={`#${id}`}>{text}</textPath></text></svg>
    <div className="c"><Svg name="glasses" /></div>
  </div>
)

/**
 * Scroll reveal, as in the design: elements marked data-reveal that start below the first screen fade up as they come into view,
 * staggered by their position among siblings ((index % 4) × 90 ms). Nothing is hidden without JavaScript or with reduced motion.
 */
export function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const vh = window.innerHeight
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((n) => {
      if (n.getBoundingClientRect().top < vh) return
      const i = n.parentElement ? Array.prototype.indexOf.call(n.parentElement.children, n) : 0
      n.style.setProperty('--d', `${(i % 4) * 90}ms`)
      n.classList.add('pre', 'rv')
      io.observe(n)
    })
    return () => io.disconnect()
  }, [root])
}

/** Number that counts up from 0 over 900 ms when it scrolls into view (shows the final value before that and without motion). */
export function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(to)
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const s = performance.now()
      const tick = (t: number) => { const p = Math.min(1, (t - s) / 900); setN(Math.round(to * p)); if (p < 1) raf = requestAnimationFrame(tick) }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [to])
  return <b ref={ref}>{n}</b>
}

/* ───────── discovery call form (design fields + the site's DPDP consent; delivery as the other forms) ───────── */
type Msg = { kind: 'ok' | 'err'; text: string } | null
export function DiscoveryForm({ companyLabel, messageLabel, placeholder, submit, workflows, subject }: {
  companyLabel: string; messageLabel: string; placeholder: string; submit: string; workflows?: string[]; subject: string
}) {
  const [msg, setMsg] = useState<Msg>(null)
  const [bad, setBad] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const live = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (msg) live.current?.focus({ preventScroll: true }) }, [msg])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const val = (n: string) => ((form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim()
    const consent = (form.elements.namedItem('consent') as HTMLInputElement).checked
    const missing = ['n', 'co', 'em'].filter((n) => !val(n))
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('em'))
    setBad([...missing, ...(!missing.includes('em') && !emailOk ? ['em'] : []), ...(!consent ? ['consent'] : [])])
    if (missing.length) return setMsg({ kind: 'err', text: 'Please fill in your name, company and email.' })
    if (!emailOk) return setMsg({ kind: 'err', text: 'Enter a valid company email.' })
    if (!consent) return setMsg({ kind: 'err', text: 'Please tick the box to give your consent.' })
    const fields: Record<string, string> = { 'Full name': val('n'), [companyLabel]: val('co'), Phone: val('ph'), 'Company email': val('em') }
    if (workflows) fields['Workflow to discuss'] = val('wf')
    fields[messageLabel] = val('msg')
    fields.Page = typeof window !== 'undefined' ? window.location.pathname : ''
    fields.Consent = 'Given (Digital Personal Data Protection Act, 2023)'
    const subj = `${subject}: ${val('co')}`
    if (!emailServiceConfigured) {
      openEmailDraft(subj, Object.entries(fields).map(([k, v]) => `${k}: ${v || '-'}`).join('\n'))
      return setMsg({ kind: 'ok', text: 'Your email app should now open with these details. Press Send there to send your request to us.' })
    }
    setSending(true)
    try {
      await sendSubmission({ subject: subj, name: val('n'), replyTo: val('em'), botcheck: isBot(e), fields })
      form.reset(); setBad([])
      setMsg({ kind: 'ok', text: 'Thank you! Your request has been sent. We’ll get back to you within one business day.' })
    } catch {
      setMsg({ kind: 'err', text: `We could not send your request. Please try again, or email ${COMPANY.email} instead.` })
    } finally { setSending(false) }
  }

  const inv = (n: string) => (bad.includes(n) ? true : undefined)
  const err = msg?.kind === 'err' ? 'fm' : undefined
  return (
    <form noValidate onSubmit={onSubmit} aria-label="Request a discovery call">
      <div className="f"><label htmlFor="n">Full name</label><input id="n" name="n" autoComplete="name" required aria-invalid={inv('n')} aria-describedby={inv('n') && err} /></div>
      <div className="f"><label htmlFor="co">{companyLabel}</label><input id="co" name="co" autoComplete="organization" required aria-invalid={inv('co')} aria-describedby={inv('co') && err} /></div>
      <div className="f"><label htmlFor="ph">Phone</label><input id="ph" name="ph" type="tel" autoComplete="tel" /></div>
      <div className="f"><label htmlFor="em">Company email</label><input id="em" name="em" type="email" autoComplete="email" required aria-invalid={inv('em')} aria-describedby={inv('em') && err} /></div>
      {workflows && <div className="f full"><label htmlFor="wf">Workflow to discuss</label><select id="wf" name="wf">{workflows.map((w) => <option key={w}>{w}</option>)}</select></div>}
      <div className="f full"><label htmlFor="msg">{messageLabel}</label><textarea id="msg" name="msg" placeholder={placeholder} /></div>
      <div className="full">
        <label className="consent" htmlFor="dc-consent">
          <input id="dc-consent" name="consent" type="checkbox" required aria-invalid={inv('consent')} aria-describedby={inv('consent') && err} />
          <span>{LEGAL.consentLabel()} <Link to={LEGAL.privacyPath} target="_blank" rel="noopener">Read the Privacy Policy</Link>.</span>
        </label>
      </div>
      {/* spam trap: hidden from people and assistive tech; bots that tick it are dropped by the form service */}
      <input type="checkbox" name="botcheck" tabIndex={-1} aria-hidden="true" className="hp" />
      <div className="f full"><button className="btn btn-p submit" type="submit" disabled={sending}>{sending ? 'Sending…' : submit}</button></div>
      <div role="status" aria-live="polite" className="full">{msg && <p id="fm" ref={live} tabIndex={-1} className={msg.kind === 'err' ? 'fmsg err' : 'fmsg'}>{msg.text}</p>}</div>
    </form>
  )
}
