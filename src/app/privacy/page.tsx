import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — FileVault',
  description: 'Privacy Policy for FileVault static file hosting.',
}

const LAST_UPDATED = 'May 3, 2026'
const CONTACT_EMAIL = 'support@filevault.host'

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-extrabold text-[var(--foreground)] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-12">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-10 text-[var(--foreground)]">

        <section>
          <h2 className="text-xl font-semibold mb-3">1. What we collect</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
            We collect the minimum data required to operate the service:
          </p>
          <ul className="space-y-3 text-[var(--muted-foreground)]">
            {[
              { label: 'Files you upload', desc: 'Stored to serve your deployments. Deleted automatically when the deployment expires.' },
              { label: 'Account information', desc: 'Email address and name, managed by Clerk (our auth provider). We do not store passwords.' },
              { label: 'IP addresses', desc: 'Logged per page view for analytics (how many people visited your deployment). Not shared or sold.' },
              { label: 'User agent strings', desc: 'Browser/device type, stored alongside view counts for analytics.' },
              { label: 'Upload metadata', desc: 'File count, total size, expiry time, and the slug you chose. Stored in our database.' },
            ].map(({ label, desc }) => (
              <li key={label} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]" />
                <span><strong className="text-[var(--foreground)]">{label}:</strong> {desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. What we do not collect</h2>
          <ul className="space-y-2 text-[var(--muted-foreground)]">
            {[
              'We do not read or scan the content of your uploaded files beyond what is required for storage and serving',
              'We do not use tracking cookies or third-party advertising pixels',
              'We do not sell your data to anyone',
              'We do not build advertising profiles',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How we use your data</h2>
          <ul className="space-y-2 text-[var(--muted-foreground)]">
            {[
              'To serve your uploaded files to visitors',
              'To show you analytics (view counts) on your deployments',
              'To enforce tier limits (file size, link count, expiry)',
              'To send transactional emails (expiry warnings, account notices) — only if you have an account',
              'To investigate abuse reports',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Third-party services</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed mb-3">
            We use the following third-party services to operate FileVault:
          </p>
          <ul className="space-y-3 text-[var(--muted-foreground)]">
            {[
              { name: 'Clerk', purpose: 'Authentication and account management. Your email and password are managed by Clerk.', link: 'https://clerk.com/privacy' },
              { name: 'Railway', purpose: 'Hosting infrastructure. Your files are stored on Railway\'s platform.', link: 'https://railway.app/legal/privacy' },
            ].map(({ name, purpose, link }) => (
              <li key={name} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]" />
                <span>
                  <strong className="text-[var(--foreground)]">{name}:</strong> {purpose}{' '}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Privacy policy →</a>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data retention</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Anonymous deployments are deleted after 24 hours. Free account deployments are deleted after 30 days. Pro deployments are retained until you delete them or cancel your subscription (after which a 30-day grace period applies). View logs are deleted when their associated deployment is deleted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your rights</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            You can delete any deployment at any time from your dashboard. You can delete your account by contacting us — we will remove your account and all associated deployments within 7 days. If you are in the EU or UK, you have rights under GDPR/UK GDPR including access, rectification, erasure, and portability. Contact us to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            We use a single session cookie set by Clerk to keep you logged in. No advertising or analytics cookies are set. No third-party cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes to this policy</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            We may update this Privacy Policy. Material changes will be announced on the site. Continued use after changes are posted constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            Privacy questions or data requests:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--primary)] hover:underline">{CONTACT_EMAIL}</a>
          </p>
        </section>

      </div>

      <div className="mt-16 border-t border-[var(--border)] pt-8 flex gap-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/tos" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link>
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">← Back to FileVault</Link>
      </div>
    </main>
  )
}
