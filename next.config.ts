import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner', 'jszip', 'bcryptjs', 'pg', '@prisma/adapter-pg'],
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
