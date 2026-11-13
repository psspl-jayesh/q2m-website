import { COMPANY, LEGAL, fullAddress } from '@/config/locale'
import { formatPhone, phoneHref } from '@/lib/format'
import { Breadcrumbs, Seo } from '@/components/ui'

/**
 * DRAFT privacy notice aligned to India's Digital Personal Data Protection Act, 2023.
 * It is generated text, NOT legal advice, and must be reviewed and approved by Q2M's legal counsel before launch.
 * The page is set to noindex until then. Items marked "to be confirmed" need real details from Q2M.
 */
export default function PrivacyPolicy() {
  const go = COMPANY.grievanceOfficer
  return (
    <>
      <Seo title={`Privacy Policy (draft) | ${COMPANY.name}`} description="How Q2M Solutions handles personal data under the Digital Personal Data Protection Act, 2023." path={LEGAL.privacyPath} noindex />
      <section className="pt-10 pb-24 md:pt-20"><div className="container-page">
        <Breadcrumbs trail={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
        <p role="note" className="mt-8 rounded-md border border-action bg-tint p-4 text-sm"><strong>{LEGAL.reviewStatus}.</strong> This text was generated to match {LEGAL.act} and has not been reviewed by a lawyer. It is not final and must not be relied on until Q2M's legal counsel approves it.</p>
        <h1 className="display-lg mt-10 max-w-3xl">Privacy Policy</h1>
        <div className="prose-q2m mt-8 text-ink-muted">
          <h2 className="text-ink">Who we are</h2>
          <p>{COMPANY.legalName} ("Q2M", "we") is the Data Fiduciary for personal data collected through this website. You can write to us at <a className="text-action underline underline-offset-4" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
          <ul className="list-none space-y-1 pl-0">
            <li>Registered office: {fullAddress()}</li>
            <li>Phone: <a className="text-action underline underline-offset-4" href={phoneHref(COMPANY.phone ?? '')}>{formatPhone(COMPANY.phone ?? '')}</a></li>
            {COMPANY.cin && <li>CIN: {COMPANY.cin}</li>}
          </ul>
          <h2 className="text-ink">What we collect and why</h2>
          <p>When you use the contact or booking form we collect the details you enter: name, company, role, work email, mobile number, industry, preferred date and time, the process you want to discuss and, if you choose, your GSTIN and company address. We use them only to respond to your request and to schedule a session. We do not use them to train public AI models.</p>
          <h2 className="text-ink">Consent</h2>
          <p>We ask for your consent, by an unticked checkbox, before we process the details you enter in a form. You can withdraw consent at any time by emailing {COMPANY.email}. Withdrawal does not affect processing already done, and we will stop processing and delete your data unless the law requires us to keep it.</p>
          <h2 className="text-ink">Who sees your data</h2>
          <p>Our team, and the service providers that host this website and deliver email, under written terms. We do not sell personal data. Where a provider is outside India, the transfer will follow the DPDP Act and any restrictions notified under it. Form submissions reach us through Web3Forms (web3forms.com), which delivers them to us by email. Hosting provider: to be confirmed by Q2M.</p>
          <h2 className="text-ink">How long we keep it</h2>
          <p>Only as long as needed for the purpose above, or as the law requires. Retention period: to be confirmed by Q2M.</p>
          <h2 className="text-ink">Your rights</h2>
          <p>Under the DPDP Act, 2023 you may ask for a summary of the personal data we hold and how it is processed, ask us to correct or complete it, ask us to erase it, use our grievance redressal process, and nominate another person to exercise these rights if you die or become unable to. Email {COMPANY.email} to make a request.</p>
          <h2 className="text-ink">Children</h2>
          <p>This website is for businesses. We do not knowingly collect personal data of anyone under 18. If you believe we have, tell us and we will delete it.</p>
          <h2 className="text-ink">Grievance officer</h2>
          <p>{go ? `${go.name}, ${go.designation}, ${go.email}` : 'Name, designation and contact of the grievance officer: to be confirmed by Q2M.'} If you are not satisfied with our response you may complain to the Data Protection Board of India.</p>
          <h2 className="text-ink">Cookies and analytics</h2>
          <p>This site does not use analytics or advertising cookies. It stores only your light or dark theme choice in your browser, so the page looks the way you chose on your next visit. If we add analytics, we will name the tools here first.</p>
          <h2 className="text-ink">Changes</h2>
          <p>We will update this page when our practices change and show the date of the latest version here once it is approved.</p>
        </div>
      </div></section>
    </>
  )
}
