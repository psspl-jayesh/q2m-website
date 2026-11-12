import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Mail, MapPin, Phone, TriangleAlert } from 'lucide-react'
import { useContent, sectionize, type Entry } from '@/lib/content'
import { Breadcrumbs, Button, Reveal, Seo, SectionHead, SiteFrame, SiteImage, StaggerGroup, StaggerItem } from '@/components/ui'
import { imagesBySection, keyOf } from '@/lib/images'
import { SectionBlock } from './ServicePage'
import { SITE_URL } from '@/lib/site'
import { COMPANY, fullAddress } from '@/config/locale'
import { formatPhone, phoneHref } from '@/lib/format'
import { BusinessDetails, ConsentField, MobileField, businessFields, consentRequired, describeBusiness, mobileRequired, requireWholeAddress } from '@/components/forms'
import { areaServedIndia, indiaDescription, indiaTitle } from '@/lib/seo'
import { emailServiceConfigured, isBot, openEmailDraft, sendSubmission } from '@/lib/formDelivery'

/* ───────── About ───────── */
export function About({ entry }: { entry: Entry }) {
  const c = useContent()
  const secs = sectionize(entry.blocks)
  const first = secs[0]
  const headline = first.title
  const dek = first.blocks.find((b) => b.t === 'p')?.text
  const rest = secs.slice(1)
  const bySec = imagesBySection(c, entry.path, rest.map((x) => x.title))
  return (
    <>
      <Seo title={indiaTitle(entry.metaTitle || 'About')} description={indiaDescription(entry.description)} path={entry.path} />
      <section className="page-band pt-10 pb-16 md:pt-20 md:pb-24"><div className="container-page">
        <Breadcrumbs trail={[{ label: entry.furniture?.breadcrumb?.[0] ?? 'Home', to: '/' }, { label: entry.furniture?.breadcrumb?.[1] ?? entry.title }]} />
        <Reveal delay={0.08} y={26}><h1 className="display-lg mt-10 max-w-5xl">{headline}</h1></Reveal>
        {dek && <Reveal delay={0.16}><p className="lede mt-8 max-w-3xl">{dek}</p></Reveal>}
      </div></section>
      {rest.map((s, i) => {
        if (/the team that ships/i.test(s.title)) {
          const photos = bySec.get(keyOf(s.title)) ?? []
          const m = s.blocks.flatMap((b, idx, arr) => (b.t === 'h4' ? [{ name: b.text!, role: arr[idx + 1]?.t === 'p' ? arr[idx + 1].text! : '' }] : []))
          const lede = s.blocks[0]?.t === 'p' ? s.blocks[0].text : undefined
          return (
            <section key={s.title} className="section border-t hairline"><div className="container-page">
              <SectionHead eyebrow={s.eyebrow} title={s.title} lede={lede} />
              <StaggerGroup as="ul" className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-5">
                {m.map((p, k) => <StaggerItem as="li" key={p.name}>{photos[k] && <SiteFrame image={{ ...photos[k], alt: p.name }} position="center top" sizes="(min-width:1024px) 20vw, 50vw" />}<p className="mt-4 font-display text-xl">{p.name}</p>{p.role && <p className="mono text-ink-muted">{p.role}</p>}</StaggerItem>)}
              </StaggerGroup>
            </div></section>
          )
        }
        // partner badges section (images only + intro)
        if (/backed by the platforms/i.test(s.title)) {
          const logos = bySec.get(keyOf(s.title)) ?? []
          return (
            <section key={s.title} className="border-y hairline bg-surface-raised section !py-16"><div className="container-page split">
              <div className="split-aside">{s.eyebrow && <p className="eyebrow mb-4">{s.eyebrow}</p>}<h2 className="display-md">{s.title}</h2><p className="mt-4 text-ink-muted">{s.blocks.find((b) => b.t === 'p')?.text}</p></div>
              <StaggerGroup as="ul" className="split-main grid grid-cols-2 items-center gap-8 sm:grid-cols-3">{logos.map((m) => <StaggerItem as="li" key={m.file + m.order}><SiteImage image={m} sizes="200px" className="mx-auto max-h-14 w-auto object-contain" /></StaggerItem>)}</StaggerGroup>
            </div></section>
          )
        }
        return <SectionBlock key={s.title + i} s={s} i={i} imgs={bySec.get(keyOf(s.title)) ?? []} />
      })}
    </>
  )
}

/* ───────── Contact ───────── */
/*
 * Delivery (src/lib/formDelivery.ts, docs/FORM_DELIVERY_OPTIONS.md): sent through Web3Forms when VITE_WEB3FORMS_ACCESS_KEY is set
 * at build time, otherwise a pre-filled email opens in the visitor's mail app. It never posts to the WordPress site.
 * Field names match the live Contact Form 7 form 18: full-name, organization, tel-phone, email-company, subject, textarea-message.
 */
const schema = z.object({
  'full-name': z.string().trim().min(2, 'Please enter your name.'),
  organization: z.string().trim().min(2, 'Please enter your company or organisation.'),
  'tel-phone': mobileRequired,
  'email-company': z.string().trim().email('Please enter a valid email address.'),
  subject: z.string().trim().min(3, 'Please add a subject.'),
  'textarea-message': z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).'),
  ...businessFields,
  consent: consentRequired,
}).superRefine(requireWholeAddress)
type Form = z.infer<typeof schema>
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'ok'; msg: string } | { kind: 'error'; msg: string }

export function Contact({ entry }: { entry: Entry }) {
  const csec = sectionize(entry.blocks)
  const connect = csec.find((x) => /connect with us/i.test(x.title))
  const office = csec.find((x) => /office location/i.test(x.title))
  const lede = connect?.blocks.find((b) => b.t === 'h4')?.text
  const formHeading = connect?.blocks.find((b) => b.t === 'h3' && /success starts/i.test(b.text ?? ''))?.text
  const phoneLabel = connect?.blocks.find((b) => b.t === 'h3' && /inquiry/i.test(b.text ?? ''))?.text
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) as never })
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const live = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (status.kind !== 'ok' && status.kind !== 'error') return
    live.current?.focus({ preventScroll: true })
    live.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [status])

  const onSubmit = async (v: Form, e?: React.BaseSyntheticEvent) => {
    if (!emailServiceConfigured) {
      const body = [
        `Full name: ${v['full-name']}`, `Company / organisation: ${v.organization}`, `Mobile: ${formatPhone(v['tel-phone'])}`, `Company email: ${v['email-company']}`,
        describeBusiness(v), '', 'Message:', v['textarea-message'], '', 'Consent: given (Digital Personal Data Protection Act, 2023)',
      ].filter((l, k, a) => l !== '' || a[k - 1] !== '').join('\n')
      openEmailDraft(v.subject, body)
      setStatus({ kind: 'ok', msg: 'Your email app should now open with your message. Press Send there to send it to us.' })
      return
    }
    setStatus({ kind: 'sending' })
    try {
      await sendSubmission({
        subject: `Website enquiry: ${v.subject}`, name: v['full-name'], replyTo: v['email-company'], botcheck: isBot(e),
        fields: {
          'Full name': v['full-name'], 'Company / organisation': v.organization, Mobile: formatPhone(v['tel-phone']), 'Company email': v['email-company'],
          'Business details': describeBusiness(v), Subject: v.subject, Message: v['textarea-message'], Consent: 'Given (Digital Personal Data Protection Act, 2023)',
        },
      })
      reset()
      setStatus({ kind: 'ok', msg: 'Thank you! Your message has been sent. We’ll get back to you within one business day.' })
    } catch {
      setStatus({ kind: 'error', msg: `We could not send your message. Please try again, or email ${COMPANY.email} instead.` })
    }
  }

  const field = (name: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">{label} <span aria-hidden className="text-action">*</span></label>
      <input id={name} aria-required="true" aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-e` : undefined} {...register(name)} {...props}
        className={`h-12 w-full rounded-sm border bg-surface px-4 transition-colors focus:border-q2m ${errors[name] ? 'border-error' : 'border-line'}`} />
      {errors[name] && <p id={`${name}-e`} className="mt-1.5 text-sm text-error">{errors[name]!.message as string}</p>}
    </div>
  )

  return (
    <>
      <Seo title={indiaTitle(entry.metaTitle || 'Contact')} description={indiaDescription(entry.description)} path={entry.path}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'ContactPage', url: SITE_URL + entry.path, areaServed: areaServedIndia }} />
      <section className="page-band pt-10 pb-24 md:pt-20"><div className="container-page">
        <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
        <div className="mt-10 split">
          <div className="split-aside">
            <Reveal delay={0.08} y={26}><h1 className="display-lg">{csec[0]?.title ?? entry.title}</h1></Reveal>
            {lede && <Reveal delay={0.16}><p className="lede mt-7">{lede}</p></Reveal>}
            {office && <h2 className="mt-12 font-display text-2xl font-semibold">{office.title}</h2>}
            <ul className="mt-6 space-y-6">
              <li className="flex gap-4"><MapPin aria-hidden className="mt-1 size-5 shrink-0 text-action" /><div><p className="font-medium">{COMPANY.legalName}</p><a className="text-ink-muted hover:text-ink" href={COMPANY.mapUrl} target="_blank" rel="noopener noreferrer">{fullAddress()}</a></div></li>
              {COMPANY.phone && <li className="flex gap-4"><Phone aria-hidden className="mt-1 size-5 shrink-0 text-action" /><div><p className="font-medium">{phoneLabel ?? 'Phone'}</p><a className="text-ink-muted hover:text-ink" href={phoneHref(COMPANY.phone)}>{formatPhone(COMPANY.phone)}</a></div></li>}
              <li className="flex gap-4"><Mail aria-hidden className="mt-1 size-5 shrink-0 text-action" /><div><p className="font-medium">Email</p><a className="text-ink-muted hover:text-ink" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></div></li>
            </ul>
          </div>
          <div className="split-main">
            <div className="rounded-lg bg-surface p-6 sm:p-10">
              {formHeading && <h2 className="mb-8 font-display text-2xl font-semibold">{formHeading}</h2>}
              <div ref={live} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
                {status.kind === 'ok' && <div className="mb-8 flex gap-3 rounded-md border border-line bg-tint p-4 text-ink"><CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-action" /><p>{status.msg}</p></div>}
                {status.kind === 'error' && <div className="mb-8 flex gap-3 rounded-md border border-error bg-surface p-4 text-ink"><TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-error" /><p><strong className="block">Not sent.</strong>{status.msg}</p></div>}
              </div>
              <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-2" aria-label="Contact form">
                {field('full-name', 'Full name', { autoComplete: 'name' })}
                {field('organization', 'Company / organisation', { autoComplete: 'organization' })}
                {field('email-company', 'Company email', { type: 'email', autoComplete: 'email' })}
                <MobileField<Form> name="tel-phone" register={register} errors={errors} id="tel-phone" label="Mobile number" required />
                <div className="sm:col-span-2">{field('subject', 'Subject')}</div>
                <div className="sm:col-span-2">
                  <label htmlFor="textarea-message" className="mb-2 block text-sm font-medium">Message <span aria-hidden className="text-action">*</span></label>
                  <textarea id="textarea-message" rows={6} aria-required="true" aria-invalid={!!errors['textarea-message']} aria-describedby={errors['textarea-message'] ? 'msg-e' : undefined} {...register('textarea-message')}
                    className={`w-full rounded-sm border bg-surface p-4 transition-colors focus:border-q2m ${errors['textarea-message'] ? 'border-error' : 'border-line'}`} />
                  {errors['textarea-message'] && <p id="msg-e" className="mt-1.5 text-sm text-error">{errors['textarea-message'].message}</p>}
                </div>
                <BusinessDetails register={register} errors={errors} prefix="c" />
                <ConsentField register={register} errors={errors} name="consent" id="c-consent" />
                {/* spam trap: hidden from people and assistive tech; bots that tick it are dropped by the form service */}
                <input type="checkbox" name="botcheck" tabIndex={-1} aria-hidden="true" className="hidden" />
                <div className="sm:col-span-2"><Button type="submit" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending…' : 'Send message'}</Button></div>
              </form>
            </div>
          </div>
        </div>
      </div></section>
    </>
  )
}

export function NotFound() {
  return (
    <>
      <Seo title="Page not found | Q2M Solutions" path="/404/" noindex />
      <section className="section"><div className="container-page">
        <p className="eyebrow mb-6">404</p><h1 className="display-lg max-w-3xl">We couldn’t find that page.</h1>
        <p className="lede mt-6 max-w-xl">It may have moved. Try our services, or get in touch and we’ll point you the right way.</p>
        <div className="mt-10 flex gap-3"><Button to="/">Back to home</Button><Button to="/contact/" variant="ghost">Contact us</Button></div>
      </div></section>
    </>
  )
}
