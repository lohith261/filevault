import Link from 'next/link'

const sections = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How do I host a file?',
        a: 'Drag and drop any HTML or ZIP file onto the upload box on the home page, or click to browse. Your link is ready in a few seconds — no account required.',
      },
      {
        q: 'What file types can I upload?',
        a: 'You can upload a single HTML file, or a ZIP archive containing HTML, CSS, JavaScript, images, and other static assets. FileVault will automatically detect and serve the right entry file.',
      },
      {
        q: 'How do I share my link?',
        a: 'After uploading you\'ll see your link (e.g. abc123.filevault.host). Copy it or use the one-click copy button. Anyone with the link can view your site.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account is required to upload. Anonymous uploads support files up to 5 MB and expire after 24 hours. Signing up gives you larger files, longer expiry, password protection, and custom link names.',
      },
    ],
  },
  {
    title: 'Files & limits',
    items: [
      {
        q: 'What is the file size limit?',
        a: 'Anonymous users: 5 MB. Free accounts: 10 MB. Pro accounts: 100 MB. If your ZIP contains many assets, the total uncompressed size is what counts.',
      },
      {
        q: 'How long do links stay live?',
        a: 'Anonymous uploads expire after 24 hours. Free accounts get 30 days. Pro links never expire (unless you delete them).',
      },
      {
        q: 'How many links can I create?',
        a: 'Anonymous users can upload up to 3 times per day from the same IP. Free accounts can have up to 10 active links. Pro accounts have no limit.',
      },
      {
        q: 'Can I delete a link early?',
        a: 'Yes — signed-in users can delete any of their links from the dashboard at any time.',
      },
    ],
  },
  {
    title: 'Custom links & subdomains',
    items: [
      {
        q: 'Can I choose my own link name?',
        a: 'Yes, if you have a free or Pro account. In the upload options, enter a custom link name (e.g. "my-portfolio") and your site will be live at my-portfolio.filevault.host.',
      },
      {
        q: 'Are there restrictions on custom link names?',
        a: 'Custom names must be 3–30 characters, lowercase letters, numbers, and hyphens only. They can\'t start or end with a hyphen, contain consecutive hyphens, or use reserved names like "api", "admin", or "dashboard".',
      },
      {
        q: 'What if my chosen name is already taken?',
        a: 'You\'ll see an error when you try to upload. Choose a different name and try again.',
      },
    ],
  },
  {
    title: 'Password protection',
    items: [
      {
        q: 'How do I add a password to my site?',
        a: 'Click "Options" on the upload card, then enter a password in the password field before uploading. Visitors will be asked for the password before they can view the site.',
      },
      {
        q: 'Can I change the password after uploading?',
        a: 'Not currently. To change a password, delete the existing link and re-upload with a new one.',
      },
      {
        q: 'Is password protection available on the free plan?',
        a: 'Yes — password protection is available to all signed-in users on the free plan and above. It is not available for anonymous uploads.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        q: 'My ZIP uploaded but the site shows a blank page.',
        a: 'FileVault looks for index.html at the root of your ZIP. Make sure your entry file is named index.html and is not inside a sub-folder. Some tools (e.g. macOS Archive Utility) wrap files in an extra folder — try zipping with a different tool.',
      },
      {
        q: 'My images or styles aren\'t loading.',
        a: 'Check that all asset paths in your HTML are relative (e.g. ./style.css, not /style.css or an absolute URL). Absolute paths won\'t resolve correctly on a subdomain.',
      },
      {
        q: 'I\'m getting a "file too large" error.',
        a: 'Your file exceeds the limit for your plan. Sign in for a higher limit, or upgrade to Pro for up to 100 MB.',
      },
      {
        q: 'My link shows "Not found" even though I just uploaded.',
        a: 'Double-check you\'re visiting the right URL. If you used a custom slug, make sure the spelling matches exactly. If the issue persists, email us.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Help &amp; FAQ</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Everything you need to know about using FileVault.
        </p>
      </div>

      {/* Quick links */}
      <div className="mb-12 flex flex-wrap justify-center gap-2">
        {sections.map((s) => (
          <a
            key={s.title}
            href={`#${s.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            {s.title}
          </a>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-14">
        {sections.map((section) => (
          <div key={section.title} id={section.title.toLowerCase().replace(/\s+/g, '-')}>
            <h2 className="mb-5 text-lg font-semibold text-[var(--foreground)]">{section.title}</h2>
            <div className="space-y-3">
              {section.items.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[var(--foreground)]">
                    {q}
                    <svg
                      className="h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-sm font-semibold text-[var(--foreground)]">Still need help?</p>
        <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
          Email us and we&apos;ll get back to you within 24 hours.
        </p>
        <a
          href="mailto:support@filevault.host"
          className="mt-4 inline-block rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          support@filevault.host
        </a>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          See also:{' '}
          <Link href="/pricing" className="underline underline-offset-2 hover:text-[var(--foreground)]">
            Pricing &amp; plans
          </Link>
        </p>
      </div>
    </div>
  )
}
