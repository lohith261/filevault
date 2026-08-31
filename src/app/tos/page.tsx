import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — FileVault',
  description: 'Terms of Service for FileVault static file hosting.',
}

const LAST_UPDATED = 'May 3, 2026'
const CONTACT_EMAIL = 'support@filevault.host'
const ABUSE_EMAIL = 'abuse@filevault.host'

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-2">Terms of Service</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-12">Last updated: {LAST_UPDATED}</p>

      <div className="prose-style space-y-10 text-[var(--foreground)]">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            By uploading files to FileVault or using any part of the service, you agree to these Terms. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. What FileVault is</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            FileVault hosts static files — HTML, CSS, JavaScript, images, PDFs, and ZIPs containing them. We serve your files as-is over HTTPS. We do not execute server-side code, run databases, or process payments on your behalf. FileVault is not a general-purpose cloud storage service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Acceptable use</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">You may not use FileVault to host or distribute:</p>
          <ul className="space-y-2 text-[var(--muted-foreground)]">
            {[
              'Malware, viruses, or any code designed to harm devices or systems',
              'Phishing pages, scam sites, or content designed to deceive users',
              'Illegal content including CSAM (child sexual abuse material)',
              'Content that infringes copyright, trademarks, or other intellectual property rights',
              'Content that violates applicable laws in your jurisdiction or ours',
              'Spam or unsolicited bulk communication',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[var(--muted-foreground)] leading-relaxed mt-3">
            We reserve the right to remove any content and terminate any account that violates these terms, without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Service tiers and limits</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Anonymous uploads are limited to 5 MB and expire after 24 hours. Free accounts are limited to 10 MB per upload and 10 deployments with 30-day expiry. Pro accounts allow up to 100 MB per upload with permanent hosting. Limits may change with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data and expiry</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Files are automatically deleted when their expiry time is reached. We run a cleanup job that deletes expired files and associated data. We do not guarantee data retention beyond the stated expiry period. You are responsible for keeping copies of anything important.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Availability</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            We aim for high availability but do not guarantee any specific uptime SLA. The service is provided as-is. We may perform maintenance, updates, or experience outages without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation of liability</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            To the maximum extent permitted by law, FileVault is not liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to loss of data, loss of revenue, or service interruption.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. DMCA / Copyright</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            If you believe content hosted on FileVault infringes your copyright, send a DMCA notice to{' '}
            <a href={`mailto:${ABUSE_EMAIL}`} className="text-[var(--primary)] hover:underline">{ABUSE_EMAIL}</a>
            {' '}with: (1) identification of the copyrighted work, (2) the URL of the infringing content, (3) your contact information, and (4) a statement of good faith belief that the use is not authorised. We will respond promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to these terms</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            We may update these Terms at any time. Continued use of the service after changes are posted constitutes acceptance of the new Terms. Material changes will be announced on the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Questions about these Terms:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--primary)] hover:underline">{CONTACT_EMAIL}</a>
            <br />
            Abuse reports:{' '}
            <a href={`mailto:${ABUSE_EMAIL}`} className="text-[var(--primary)] hover:underline">{ABUSE_EMAIL}</a>
          </p>
        </section>

      </div>

      <div className="mt-16 border-t border-[var(--border)] pt-8 flex gap-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link>
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">← Back to FileVault</Link>
      </div>
    </main>
  )
}
