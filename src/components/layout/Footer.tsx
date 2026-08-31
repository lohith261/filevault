import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-t border-[#e8e8e8] bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="FileVault" width={22} height={22} className="rounded-sm" />
            <span className="text-[14px] font-semibold text-[#0a0a0a] tracking-[-0.01em]">FileVault</span>
            <span className="text-[13px] text-[#aaa] ml-2">© {new Date().getFullYear()}</span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { href: '/agents', label: 'Agents' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/help', label: 'Docs' },
              { href: '/privacy', label: 'Privacy' },
              { href: '/tos', label: 'Terms' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] text-[#888] hover:text-[#0a0a0a] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
