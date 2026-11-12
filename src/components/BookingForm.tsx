import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, TriangleAlert } from 'lucide-react'
import { Button } from './ui'
import { BusinessDetails, ConsentField, MobileField, businessFields, consentRequired, describeBusiness, mobileOptional, requireWholeAddress } from './forms'
import { COMPANY, LOCALE } from '@/config/locale'
import { bookableDates, businessHoursLabel, formatPhone, timeSlots } from '@/lib/format'

/**
 * Booking form (fields and options come from the Q2M home page copy, localised for India).
 * Slots are requests, not confirmed bookings: dates and times are offered in IST within the business hours set in src/config/locale.ts.
 * Delivery: if VITE_BOOKING_ENDPOINT is set, details are POSTed there as JSON and success is shown only on an OK response.
 * Otherwise nothing is "sent" by this page: a pre-filled email draft opens in the visitor's mail app and the message says so.
 */
const ENDPOINT = import.meta.env.VITE_BOOKING_ENDPOINT as string | undefined

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.'),
  company: z.string().trim().min(2, 'Please enter your company.'),
  role: z.string().trim().optional(),
  email: z.string().trim().email('Enter a work email like name@company.com.'),
  mobile: mobileOptional,
  industry: z.string().min(1),
  date: z.string().min(1, 'Choose a preferred date.'),
  time: z.string().min(1, 'Choose a preferred time.'),
  topic: z.string().trim().optional(),
  ...businessFields,
  consent: consentRequired,
}).superRefine(requireWholeAddress)
type Values = z.infer<typeof schema>
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok'; msg: string } | { kind: 'error'; msg: string }

export default function BookingForm({ industries, placeholder, note }: { industries: string[]; placeholder: string; note: string }) {
  // Bookable dates depend on today, so they are worked out in the browser after load (pre-rendered HTML is built earlier)
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])
  const dates = useMemo(() => (now ? bookableDates(now) : []), [now])
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema) as never,
    defaultValues: { industry: industries[0], date: '', time: '' },
  })
  useEffect(() => { if (dates[0]) setValue('date', dates[0].value) }, [dates, setValue])
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const live = useRef<HTMLDivElement>(null)
  const date = watch('date')
  const times = useMemo(() => (date ? timeSlots(date) : []), [date])

  const onSubmit = async (v: Values) => {
    setStatus({ kind: 'sending' })
    const slot = `${dates.find((d) => d.value === v.date)?.label}, ${times.find((t) => t.value === v.time)?.label ?? v.time}`
    const payload = { ...v, mobile: v.mobile ? formatPhone(v.mobile) : '', slot, timezone: LOCALE.timeZone, consentGiven: true }
    if (ENDPOINT) {
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (!r.ok) throw new Error(String(r.status))
        setStatus({ kind: 'ok', msg: 'Thank you. We will confirm your time slot by email.' }); reset()
      } catch {
        setStatus({ kind: 'error', msg: `We could not send your request. Please email ${COMPANY.email} instead.` })
      }
      live.current?.focus()
      return
    }
    const body = [
      `Name: ${v.name}`, `Company: ${v.company}`, `Role: ${v.role || '-'}`, `Work email: ${v.email}`, `Mobile: ${payload.mobile || '-'}`, `Industry: ${v.industry}`,
      `Preferred slot: ${slot}`, describeBusiness(v), '', 'Process to discuss:', v.topic || '-', '', 'Consent: given (Digital Personal Data Protection Act, 2023)',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n')
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent('30-minute AI session request')}&body=${encodeURIComponent(body)}`
    setStatus({ kind: 'ok', msg: 'Your email app should now open with these details. Nothing has been sent until you press send there.' })
    live.current?.focus()
  }

  const input = (name: 'name' | 'company' | 'role' | 'email', label: string, opts: { type?: string; autoComplete?: string } = {}) => (
    <div>
      <label htmlFor={`b-${name}`} className="mb-2 block text-sm font-medium">{label}</label>
      <input id={`b-${name}`} type={opts.type} autoComplete={opts.autoComplete} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `b-${name}-e` : undefined} {...register(name)}
        className={`h-12 w-full rounded-sm border bg-surface px-4 outline-none transition-colors focus:border-action ${errors[name] ? 'border-red-600' : 'border-line'}`} />
      {errors[name] && <p id={`b-${name}-e`} className="mt-1.5 text-sm text-red-700">{errors[name]!.message as string}</p>}
    </div>
  )
  const selectCls = 'h-12 w-full rounded-sm border border-line bg-surface px-3 outline-none focus:border-action'

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Book a session" className="grid gap-5 sm:grid-cols-2">
      <div ref={live} tabIndex={-1} role="status" aria-live="polite" className="outline-none sm:col-span-2">
        {status.kind === 'ok' && <p className="flex gap-3 rounded-md border border-line bg-surface p-4"><CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-action" />{status.msg}</p>}
        {status.kind === 'error' && <p className="flex gap-3 rounded-md border border-red-600 bg-surface p-4"><TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-red-700" />{status.msg}</p>}
      </div>
      {input('name', 'Full name', { autoComplete: 'name' })}
      {input('company', 'Company', { autoComplete: 'organization' })}
      {input('role', 'Role', { autoComplete: 'organization-title' })}
      {input('email', 'Work email', { type: 'email', autoComplete: 'email' })}
      <MobileField<Values> name="mobile" register={register} errors={errors} id="b-mobile" />
      <div>
        <label htmlFor="b-industry" className="mb-2 block text-sm font-medium">Industry</label>
        <select id="b-industry" {...register('industry')} className={selectCls}>{industries.map((o) => <option key={o}>{o}</option>)}</select>
      </div>
      <div>
        <label htmlFor="b-date" className="mb-2 block text-sm font-medium">Preferred date</label>
        <select id="b-date" {...register('date')} aria-invalid={!!errors.date} className={selectCls}>{dates.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}</select>
        {errors.date && <p className="mt-1.5 text-sm text-red-700">{errors.date.message}</p>}
      </div>
      <div>
        <label htmlFor="b-time" className="mb-2 block text-sm font-medium">Preferred time ({LOCALE.timeZoneLabel})</label>
        <select id="b-time" {...register('time')} aria-invalid={!!errors.time} aria-describedby="b-time-hint" className={selectCls}>
          <option value="">Select a time</option>
          {times.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {errors.time && <p className="mt-1.5 text-sm text-red-700">{errors.time.message}</p>}
      </div>
      <p id="b-time-hint" className="mono self-end pb-3 text-ink-muted">
        {businessHoursLabel()}. We confirm your slot by email.
      </p>
      <div className="sm:col-span-2">
        <label htmlFor="b-topic" className="mb-2 block text-sm font-medium">What process do you want to discuss?</label>
        <textarea id="b-topic" rows={4} placeholder={placeholder} {...register('topic')} className="w-full rounded-sm border border-line bg-surface p-4 outline-none focus:border-action" />
      </div>
      <BusinessDetails register={register} errors={errors} prefix="b" />
      <ConsentField register={register} errors={errors} name="consent" id="b-consent" />
      <p className="text-sm text-ink-muted sm:col-span-2">{note}</p>
      <div className="sm:col-span-2"><Button type="submit" disabled={status.kind === 'sending'} className="w-full">{status.kind === 'sending' ? 'Sending…' : 'Request a session'}</Button></div>
    </form>
  )
}
