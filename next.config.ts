import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['jszip', 'bcryptjs', '@libsql/client', '@prisma/adapter-libsql'],
  async headers() {
    return [
      {
        source: '/s/:slug*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
