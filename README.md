# FileVault

> Instant static file hosting — drop a ZIP or HTML file, get a shareable URL in under 3 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://prisma.io)

---

## Features

- **Instant deploy** — upload a ZIP or HTML file, live URL in < 3s
- **ZIP support** — upload an entire static site as a ZIP; entry point auto-detected
- **Password protection** — optionally lock any deployment behind a password
- **Expiry options** — set links to expire after 1 hour, 24 hours, 7 days, 30 days, or never
- **Anonymous uploads** — no account required (capped at 10 MB / 24 h max)
- **Dashboard** — manage, rename, and delete your sites when signed in
- **Analytics** — view count per deployment
- **QR codes** — one-click QR code for every hosted URL
- **Dark / light mode** — system-aware with manual toggle
- **Storage backends** — local filesystem (dev) or AWS S3 (prod)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animations | Framer Motion |
| Auth | Clerk v7 |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| Storage | Local FS (dev) / AWS S3 (prod) |
| ZIP extraction | JSZip (pure JS, serverless-safe) |
| Password hashing | bcryptjs (pure JS, serverless-safe) |

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/lohith261/filevault.git
cd filevault
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values (see `.env.example` for descriptions). You need:

- A **PostgreSQL** database (e.g. [Supabase](https://supabase.com) free tier)
- A **Clerk** application (e.g. [clerk.com](https://clerk.com) free tier)
- For production: an **AWS S3** bucket (or keep `STORAGE_DRIVER=local`)

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string (PgBouncer pooled) |
| `DIRECT_URL` | ✓ | PostgreSQL direct connection (used for migrations) |
| `STORAGE_DRIVER` | ✓ | `local` or `s3` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✓ | Clerk publishable key |
| `CLERK_SECRET_KEY` | ✓ | Clerk secret key |
| `NEXT_PUBLIC_BASE_URL` | ✓ | Your public URL (e.g. `https://filevault.host`) |
| `CRON_SECRET` | ✓ | Secret for the cleanup cron job |
| `ANON_MAX_SIZE_MB` | — | Max upload size for anonymous users (default: `10`) |
| `ANON_MAX_EXPIRY_HOURS` | — | Max expiry for anonymous users (default: `24`) |
| `AWS_ACCESS_KEY_ID` | S3 only | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 only | AWS credentials |
| `AWS_REGION` | S3 only | e.g. `us-east-1` |
| `S3_BUCKET_NAME` | S3 only | Private S3 bucket name |

## Project Structure

```
src/
├── app/
│   ├── (auth)/sign-in|sign-up/   # Clerk-hosted auth pages
│   ├── api/
│   │   ├── upload/               # POST: unzip + store + create DB records
│   │   ├── files/[slug]/         # DELETE / PATCH
│   │   ├── analytics/[slug]/     # GET: view stats
│   │   └── cron/cleanup/         # Vercel cron: delete expired sites
│   ├── dashboard/                # Authenticated file manager
│   └── s/[slug]/[...path]/       # File serving + password gate + analytics
├── components/
│   ├── ui/                       # Button, Card, Badge, Dialog, Spinner…
│   ├── layout/                   # Navbar, Footer, ThemeProvider
│   ├── upload/                   # DropZone, UploadProgress, ExpiryPicker
│   ├── dashboard/                # FileCard, FileGrid, dialogs
│   └── landing/                  # HeroSection, FeaturesSection, HowItWorks
├── lib/
│   ├── storage/                  # StorageDriver interface + local + S3 impls
│   ├── prisma.ts                 # Prisma client (adapter-pg)
│   ├── unzip.ts                  # JSZip extraction + path sanitization
│   ├── slug.ts                   # 6-char nanoid slug generation
│   └── analytics.ts              # View counting with IP dedup
└── hooks/
    ├── useUpload.ts              # XHR-based upload state machine
    └── useFiles.ts               # SWR dashboard hook
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in the Vercel dashboard
4. The cleanup cron runs every 6 hours automatically via `vercel.json`

For production, set `STORAGE_DRIVER=s3` and provide the AWS credentials.

## License

MIT
