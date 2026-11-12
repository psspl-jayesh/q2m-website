import { COMPANY } from '@/config/locale'

/**
 * Where the contact and booking forms go.
 * - With VITE_WEB3FORMS_ACCESS_KEY set at build time: submissions are sent through Web3Forms (https://web3forms.com), which
 *   emails them to the address the access key was created for (info@q2msolutions.in). The key is a public form key, meant to
 *   be in the page; it is read from the build environment and never stored in the repository (see .env.example).
 * - Without it: the form opens a pre-filled email in the visitor's email app (mailto). Nothing is sent until they press Send.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined
export const emailServiceConfigured = !!ACCESS_KEY

/** Send one submission. `fields` are shown in the email as label: value; `botcheck` is the hidden spam-trap checkbox. */
export async function sendSubmission({ subject, name, replyTo, fields, botcheck }: { subject: string; name: string; replyTo: string; fields: Record<string, string>; botcheck: boolean }): Promise<void> {
  const r = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: ACCESS_KEY, subject, from_name: name, replyto: replyTo, botcheck, ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v.trim() !== '')) }),
  })
  const data = (await r.json().catch(() => ({}))) as { success?: boolean }
  if (!r.ok || !data.success) throw new Error(`Form service responded ${r.status}`)
}

/** Fallback without the form service: open a pre-filled email to the company address. */
export function openEmailDraft(subject: string, body: string) {
  window.location.assign(`mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
}

/** True when the hidden `botcheck` spam-trap checkbox in the submitted form is ticked (people never see it). */
export function isBot(e?: { target?: unknown }): boolean {
  const form = e?.target instanceof HTMLFormElement ? e.target : null
  const trap = form?.elements.namedItem('botcheck')
  return trap instanceof HTMLInputElement && trap.checked
}
