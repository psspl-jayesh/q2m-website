import { Link } from 'react-router-dom'
import { z } from 'zod'
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { INDIAN_STATES, INDIAN_UNION_TERRITORIES, LEGAL, LOCALE } from '@/config/locale'
import { isValidGstin, isValidIndianMobile, isValidPin } from '@/lib/format'

/** Shared form building blocks. Every form that collects personal data uses these, so wording and validation are identical. */

/* ───────── validation fragments ───────── */
export const mobileRequired = z.string().trim().refine(isValidIndianMobile, 'Enter a 10-digit Indian mobile number (starting 6 to 9).')
export const mobileOptional = z.string().trim().optional().refine((v) => !v || isValidIndianMobile(v), 'Enter a 10-digit Indian mobile number (starting 6 to 9).')
export const consentRequired = z.literal(true, { message: 'Please tick the box to give your consent.' })

export const businessFields = {
  gstin: z.string().trim().optional().refine((v) => !v || isValidGstin(v), 'Enter a valid 15-character GSTIN, for example 29ABCDE1234F1Z5.'),
  addressLine: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pin: z.string().trim().optional().refine((v) => !v || isValidPin(v), 'Enter a valid 6-digit PIN code.'),
}
type Biz = { addressLine?: string; city?: string; state?: string; pin?: string }
/** If any address field is filled, the whole Indian address structure is required. */
export function requireWholeAddress(v: Biz, ctx: z.RefinementCtx) {
  const any = [v.addressLine, v.city, v.state, v.pin].some((x) => x && x.trim())
  if (!any) return
  ;(['addressLine', 'city', 'state', 'pin'] as const).forEach((k) => { if (!v[k]?.trim()) ctx.addIssue({ code: 'custom', path: [k], message: 'Please complete the address (address line, city, state and PIN code).' }) })
}
/** Plain-text block for emails and CRM messages. */
export const describeBusiness = (v: Biz & { gstin?: string }) =>
  [v.gstin ? `GSTIN: ${v.gstin.toUpperCase()}` : '', v.addressLine ? `Address: ${v.addressLine}, ${v.city}, ${v.state} ${v.pin}, India` : ''].filter(Boolean).join('\n')

/* ───────── fields ───────── */
const cls = (err: boolean) => `h-12 w-full rounded-sm border bg-surface px-4 transition-colors focus:border-action ${err ? 'border-error' : 'border-line'}`

/** Mobile number with the +91 prefix locked (India only). */
export function MobileField<T extends FieldValues>({ name, register, errors, label = 'Mobile number', required = false, id }: { name: Path<T>; register: UseFormRegister<T>; errors: FieldErrors<T>; label?: string; required?: boolean; id: string }) {
  const err = errors[name]
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}{required ? <> <span aria-hidden className="text-action">*</span></> : ' (optional)'}</label>
      <div className={`flex overflow-hidden rounded-sm border bg-surface focus-within:border-action focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus)] focus-within:[outline-style:solid] ${err ? 'border-error' : 'border-line'}`}>
        <span className="mono flex items-center border-r border-line bg-surface-raised px-3 text-ink-muted" aria-hidden>+91</span>
        <input id={id} type="text" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" aria-required={required || undefined} aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} {...register(name)} className="h-12 w-full bg-transparent px-4 outline-none" />
      </div>
      {err && <p id={`${id}-e`} className="mt-1.5 text-sm text-error">{err.message as string}</p>}
    </div>
  )
}

/** Optional GSTIN + Indian address (address line, city, state, PIN). Country is fixed to India. */
export function BusinessDetails<T extends FieldValues>({ register, errors, prefix }: { register: UseFormRegister<T>; errors: FieldErrors<T>; prefix: string }) {
  const f = (n: string) => n as Path<T>
  const e = (n: string) => errors[n as keyof typeof errors] as { message?: string } | undefined
  const input = (n: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`${prefix}-${n}`} className="mb-2 block text-sm font-medium">{label}</label>
      <input id={`${prefix}-${n}`} aria-invalid={!!e(n)} aria-describedby={e(n) ? `${prefix}-${n}-e` : undefined} {...register(f(n))} {...props} className={cls(!!e(n))} />
      {e(n) && <p id={`${prefix}-${n}-e`} className="mt-1.5 text-sm text-error">{e(n)!.message}</p>}
    </div>
  )
  return (
    <details className="rounded-md border border-line bg-surface p-4 sm:col-span-2">
      <summary className="cursor-pointer font-medium">GSTIN and company address (optional)</summary>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">{input('gstin', 'GSTIN', { autoCapitalize: 'characters', maxLength: 15, placeholder: '29ABCDE1234F1Z5' })}</div>
        <div className="sm:col-span-2">{input('addressLine', 'Address line', { autoComplete: 'address-line1' })}</div>
        {input('city', 'City', { autoComplete: 'address-level2' })}
        <div>
          <label htmlFor={`${prefix}-state`} className="mb-2 block text-sm font-medium">State or union territory</label>
          <select id={`${prefix}-state`} {...register(f('state'))} className="h-12 w-full rounded-sm border border-line bg-surface px-3 focus:border-action">
            <option value="">Select</option>
            <optgroup label="States">{INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}</optgroup>
            <optgroup label="Union territories">{INDIAN_UNION_TERRITORIES.map((s) => <option key={s}>{s}</option>)}</optgroup>
          </select>
          {e('state') && <p className="mt-1.5 text-sm text-error">{e('state')!.message}</p>}
        </div>
        {input('pin', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code', placeholder: '560001' })}
        <p className="mono text-ink-muted sm:col-span-2">Country: {LOCALE.country}</p>
      </div>
    </details>
  )
}

/** Consent checkbox shown on every form that collects personal data (DPDP Act, 2023). Wording lives in the locale config. */
export function ConsentField<T extends FieldValues>({ register, errors, name, id }: { register: UseFormRegister<T>; errors: FieldErrors<T>; name: Path<T>; id: string }) {
  const err = errors[name]
  return (
    <div className="sm:col-span-2">
      <label className="flex min-h-11 items-start gap-3 py-1 text-sm text-ink-muted" htmlFor={id}>
        <input id={id} type="checkbox" aria-required="true" {...register(name)} className="mt-1 size-5 shrink-0 accent-[#0062c4]" aria-invalid={!!err} aria-describedby={err ? `${id}-e` : undefined} />
        <span>
          {LEGAL.consentLabel()} <Link to={LEGAL.privacyPath} className="text-action underline underline-offset-4" target="_blank" rel="noopener">Read the Privacy Policy</Link>.
        </span>
      </label>
      {err && <p id={`${id}-e`} className="mt-1.5 text-sm text-error">{err.message as string}</p>}
    </div>
  )
}
