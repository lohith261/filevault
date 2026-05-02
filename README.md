# FileVault

> Instant static file hosting — drop a ZIP or HTML file, get a shareable URL in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://prisma.io)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FileVault** is an open-source static site hosting platform. Upload a ZIP archive or a single HTML file and immediately get a shareable subdomain URL. No configuration, no account required for basic use.

Runs on [Railway](https://railway.app) with SQLite and a local filesystem volume — no external database or blob storage required.

→ **[filevault.host](https://filevault.host)**

---

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Local Development](#local-development)
6. [Environment Variables](#environment-variables)
7. [Tier System](#tier-system)
8. [API Reference](#api-reference)
9. [Authentication & Billing](#authentication--billing)
10. [Security Model](#security-model)
11. [Deployment to Railway](#deployment-to-railway)
12. [Custom Domains & Subdomains](#custom-domains--subdomains)
13. [Cron Jobs](#cron-jobs)
14. [Database Schema](#database-schema)
15. [Contributing](#contributing)
16. [License](#license)

---

## Features

| Feature | Anonymous | Free | Pro |
|---|:---:|:---:|:---:|
| Upload ZIP or HTML | ✓ | ✓ | ✓ |
| Auto-detect entry file | ✓ | ✓ | ✓ |
| Shareable subdomain URL | ✓ | ✓ | ✓ |
| Max upload size | 5 MB | 10 MB | 100 MB |
| Link expiry | 24 h | 30 days | Never |
| Daily upload limit | 3 / IP | — | — |
| Max active links | — | 10 | Unlimited |
| Password protection | — | ✓ | ✓ |
| Custom link name (`name.filevault.host`) | — | ✓ | ✓ |
| View analytics | — | ✓ | ✓ |
| QR code | — | ✓ | ✓ |
| Dashboard | — | ✓ | ✓ |
| Priority support | — | — | ✓ |

### Feature Details

**Instant deploy** — The upload pipeline (parse → unzip → store → DB write) runs in a single Next.js API route. ZIP files are extracted in memory with JSZip. The entry file is detected by looking for `index.html` at the ZIP root, falling back to the first `.html` found.

**Password protection** — Lock any deployment with a password set at upload time. Passwords are hashed with bcrypt before storage. Visitors see an inline HTML form; on success a `fv_pw_<slug>` httpOnly cookie is set.

**Custom subdomain routing** — All signed-in users can choose a custom link name (e.g. `myproject`). The site is served at `myproject.filevault.host` via a wildcard DNS record + Next.js middleware rewrite. Custom names are validated server-side (3–30 chars, alphanumeric + hyphens, reserved names blocked).

**Expiry & cleanup** — Expiry is stored in the database. A daily cron job deletes expired sites (storage + DB). Anonymous uploads are hard-capped at 24 h; Pro links never expire.

**Anonymous rate limiting** — Anonymous uploads are limited to 3 per day per IP, tracked in the `AnonUploadLog` table.

**Analytics** — Every file request logs a `SiteView` record (deduped by IP + slug + hour). The dashboard shows per-deployment view counts.

**Clerk optional** — Clerk auth is an enhancement, not a requirement. The entire app works without Clerk keys — anonymous uploads, file serving, and password gates all function without an auth provider.

---

## Architecture Overview

```
Browser
  │
  ├── *.filevault.host  →  proxy.ts rewrites to /s/[slug]
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Railway)                    │
│                                                             │
│  POST /api/upload  ──► unzip ──► Local FS ──► Prisma DB    │
│                                                             │
│  GET /s/[slug]     ──► DB lookup ──► redirect to entryFile │
│      (Server Component, calls notFound() or redirect())     │
│                                                             │
│  GET /s/[slug]/[...path]                                    │
│    ├── DB lookup SiteFile.storageKey                        │
│    ├── Password gate (cookie check + bcrypt verify)         │
│    └── Stream file from filesystem                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   SQLite (libsql)          Local filesystem
   prisma/filevault.db      uploads/<slug>/…
   (Railway Volume)         (Railway Volume)
```

Both the SQLite database and uploaded files live on the same Railway Volume (mounted at `/app/uploads`).

### Middleware (`src/proxy.ts`)

This Next.js 16 app uses `src/proxy.ts` as the middleware file (not `middleware.ts`). It does two things in order:

1. **Subdomain rewrite** — if the host ends in `.filevault.host` and the subdomain is not reserved, rewrite the request to `/s/<subdomain>` before auth runs.
2. **Clerk auth** — if Clerk is configured, protect non-public routes.

### Upload Pipeline

```
POST /api/upload (multipart/form-data)
  │
  ├── Auth: try Clerk, fall back to anonymous
  ├── Tier: getTier(userId, isPro) → limits
  ├── Validate: file size, blocked extensions
  ├── Rate limit: anon IP daily count (AnonUploadLog), free link cap
  ├── Custom slug: validate format + uniqueness (P2002 on conflict)
  ├── If ZIP: JSZip extract in memory, sanitize paths, detectEntryFile()
  ├── storageDriver.putFiles(slug, files[])
  ├── Prisma transaction: Site + SiteFile[] + AnonUploadLog (if anon)
  └── Return: { slug, url, expiresAt, fileCount, totalSizeBytes }
```

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js | 16.2.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Animations | Framer Motion | 12.x |
| Auth + Billing | Clerk | 7.x (optional) |
| ORM | Prisma | 7.x |
| Database | SQLite via libsql | — |
| ZIP extraction | JSZip | 3.x |
| Password hashing | bcryptjs | 3.x |
| Data fetching | SWR | 2.x |
| ID generation | nanoid | 5.x |
| QR codes | qrcode.react | 4.x |
| Validation | Zod | 4.x |

---

## Project Structure

```
FileVault/
├── prisma/
│   ├── schema.prisma             # Site, SiteFile, SiteView, AnonUploadLog
│   └── migrations/
├── railway.json                  # Build + start commands
└── src/
    ├── proxy.ts                  # Middleware: subdomain rewrite + Clerk auth
    ├── app/
    │   ├── layout.tsx            # Root layout: conditional ClerkProvider
    │   ├── page.tsx              # Landing page
    │   ├── globals.css           # CSS custom properties (warm palette, light only)
    │   ├── not-found.tsx         # Styled 404 page
    │   ├── (auth)/
    │   │   ├── sign-in/[[...sign-in]]/page.tsx
    │   │   └── sign-up/[[...sign-up]]/page.tsx
    │   ├── pricing/page.tsx      # Tier comparison cards + FAQ
    │   ├── help/page.tsx         # Accordion FAQ — 5 sections
    │   ├── link-expired/page.tsx # Shown when a link's expiry has passed
    │   ├── dashboard/page.tsx    # File manager
    │   ├── s/
    │   │   ├── [slug]/page.tsx   # Server Component: redirect or notFound()
    │   │   └── [slug]/[...path]/route.ts  # File serving + password gate
    │   └── api/
    │       ├── upload/route.ts
    │       ├── files/
    │       │   ├── route.ts              # GET: list user sites
    │       │   └── [slug]/route.ts       # DELETE / PATCH
    │       ├── analytics/[slug]/route.ts # GET: view stats
    │       └── cron/cleanup/route.ts     # Expired site cleanup
    ├── components/
    │   ├── landing/
    │   │   ├── HeroSection.tsx         # Two-column layout, rotating word
    │   │   ├── FeaturesSection.tsx     # Asymmetric grid
    │   │   ├── HowItWorksSection.tsx   # Horizontal 3-step timeline
    │   │   └── TestimonialsSection.tsx # Pull-quote style
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── upload/
    │   │   ├── DropZone.tsx
    │   │   ├── UploadProgress.tsx
    │   │   ├── UploadSuccess.tsx
    │   │   └── ExpiryPicker.tsx
    │   ├── dashboard/  (FileCard, FileGrid, RenameDialog, DeleteDialog, …)
    │   ├── ui/         (Button, Input, Badge, Card, Dialog, …)
    │   └── shared/     (CopyButton, QRCodeDisplay, …)
    ├── hooks/
    │   ├── useUpload.ts     # XHR upload with progress, slug support
    │   ├── useFiles.ts
    │   └── useClipboard.ts
    └── lib/
        ├── limits.ts        # Tier config: maxBytes, maxLinks, expiry, customSlugAllowed
        ├── prisma.ts
        ├── storage/         # StorageDriver interface + local filesystem driver
        ├── slug.ts          # generateSlug() + validateCustomSlug()
        ├── unzip.ts
        ├── mime.ts
        ├── hash.ts
        ├── analytics.ts
        └── validations.ts
```

---

## Local Development

### Prerequisites

- Node.js 20+
- No external services required

### 1. Clone & install

```bash
git clone https://github.com/lohith261/filevault.git
cd filevault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Minimum required for local dev (no Clerk, no external storage):

```env
DATABASE_URL="file:./prisma/filevault.db"
DIRECT_URL="file:./prisma/filevault.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_DOMAIN="localhost"
CRON_SECRET="dev-cron-secret"
```

Uploaded files are written to `./uploads/<slug>/`. The SQLite database is at `./prisma/filevault.db`. Both paths are gitignored.

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start the dev server

```bash
node node_modules/next/dist/bin/next dev
```

> Note: this project uses a custom Next.js 16 build. `npm run dev` or `npx next dev` may fail with MODULE_NOT_FOUND on some Node versions — use the full path above.

Open [http://localhost:3000](http://localhost:3000). Upload a ZIP or HTML file to get a `/s/<slug>` URL immediately.

---

## Environment Variables

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | SQLite connection string. `file:./prisma/filevault.db` locally; `file:/app/uploads/filevault.db` on Railway. |
| `DIRECT_URL` | ✓ | Direct connection (non-pooled). Same value as `DATABASE_URL` for SQLite. |

### Storage

| Variable | Required | Description |
|---|---|---|
| `UPLOADS_PATH` | — | Directory for uploaded files. Defaults to `./uploads`. Set to `/app/uploads` on Railway. |

### Application

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | ✓ | Public base URL without trailing slash. Used in shareable link construction. |
| `NEXT_PUBLIC_BASE_DOMAIN` | — | Base domain for subdomain routing. Default: `filevault.host`. |
| `CRON_SECRET` | ✓ | Authorises the cleanup cron endpoint. Any random string. |

### Auth (Clerk — optional)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | — | Clerk publishable key. App runs fully without this (anonymous mode). |
| `CLERK_SECRET_KEY` | — | Required if publishable key is set. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | — | Default: `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | — | Default: `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | — | Default: `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | — | Default: `/dashboard` |

---

## Tier System

Tier limits are defined in a single source of truth: `src/lib/limits.ts`.

| | Anonymous | Free | Pro |
|---|---|---|---|
| Max file size | 5 MB | 10 MB | 100 MB |
| Link expiry | 24 h (forced) | 30 days max | Never |
| Daily uploads | 3 per IP | Unlimited | Unlimited |
| Max active links | — | 10 | Unlimited |
| Password protection | No | Yes | Yes |
| Custom link name | No | Yes | Yes |

**Tier detection (server-side):**

```typescript
import { getTier, getLimits } from '@/lib/limits'

const tier = getTier(userId, isPro)   // 'anon' | 'free' | 'pro'
const limits = getLimits(tier)        // { maxBytes, maxLinks, maxExpiryOption, ... }
```

The `capExpiry()` utility silently downgrades a requested expiry to the tier maximum:

```typescript
const finalExpiry = capExpiry(requestedExpiry, limits.maxExpiryOption)
```

---

## API Reference

### `POST /api/upload`

Upload a file and deploy it.

**Auth:** Optional. Determines tier limits.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✓ | A `.zip` or `.html` (or any static file) |
| `expiry` | string | — | `1h`, `24h`, `7d`, `30d`, `never`. Default: `24h` |
| `password` | string | — | Password to protect the deployment |
| `label` | string | — | Human-readable name shown in dashboard |
| `slug` | string | — | Custom link name (signed-in users only) |

**Response `200`:**
```json
{
  "slug": "abc123",
  "url": "https://filevault.host/s/abc123",
  "expiresAt": "2025-01-15T12:00:00.000Z",
  "fileCount": 5,
  "totalSizeBytes": 48210
}
```

**Error responses:**
- `400` — Invalid file, blocked extension, or bad expiry option
- `403` — Custom slug attempted without an account
- `409` — Custom slug already taken
- `413` — File exceeds tier size limit
- `429` — Anonymous daily limit reached

---

### `GET /api/files`

List the authenticated user's deployments.

**Auth:** Required.

**Query params:** `page` (default `1`), `search` (label substring)

**Response `200`:**
```json
{
  "sites": [{ "slug": "abc123", "label": "...", "expiresAt": null, "viewCount": 42, ... }],
  "total": 15,
  "page": 1
}
```

---

### `DELETE /api/files/[slug]`

Delete a deployment and its files. **Auth:** Required, must own the deployment.

---

### `PATCH /api/files/[slug]`

Update label, password, or expiry. **Auth:** Required, must own the deployment.

```json
{ "label": "New name", "password": "new-pass", "expiresAt": null }
```

Send `"password": ""` to remove a password. Send `"expiresAt": null` to remove expiry.

---

### `GET /api/analytics/[slug]`

View stats for a deployment. **Auth:** Required, must own the deployment.

```json
{ "total": 150, "last7Days": 42, "last30Days": 120 }
```

---

### `GET /api/cron/cleanup`

Deletes all expired sites. Requires `Authorization: Bearer <CRON_SECRET>`.

```json
{ "deleted": 3 }
```

---

## Authentication & Billing

### Authentication (Clerk — optional)

When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is absent, the app runs in anonymous mode — uploads work, file serving works, and the dashboard shows an empty state. All `auth()` calls in API routes are wrapped in try/catch so they fail gracefully.

### Subscription Billing (Clerk Billing)

Billing is handled natively by Clerk. No Stripe setup required.

**Checking plan (server-side):**
```typescript
const { userId, has } = await auth()
const isPro = has?.({ plan: 'user:pro' }) ?? false
```

**Checking plan (client-side):**
```typescript
const { isSignedIn, has } = useAuth()
const isPro = isSignedIn ? (has?.({ plan: 'user:pro' }) ?? false) : false
```

### Setting up Clerk Billing

1. Clerk dashboard → **Billing** → enable billing
2. Create a **Free** plan (key: `free_user`, price: $0, set as default)
3. Create a **Pro** plan (key: `pro`, price: your choice — currently ₹399/month)
4. Publish both plans
5. Visit `/pricing` to verify the checkout flow

---

## Security Model

### Upload validation

- Blocked extensions within ZIPs: `.php`, `.py`, `.rb`, `.sh`, `.exe`, `.bat`, `.cgi`, `.pl`, `.asp`, `.aspx`, `.jsp`
- All extracted paths are sanitized with `path.normalize`; any path containing `..` is rejected

### File serving headers

```
Content-Security-Policy: sandbox allow-scripts allow-same-origin allow-popups allow-forms
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Cache-Control: public, max-age=3600
```

The `sandbox` CSP directive prevents deployed sites from accessing the hosting domain's cookies or localStorage.

### Password protection

bcryptjs at cost factor 10. Cookie `fv_pw_<slug>` is `HttpOnly; SameSite=Lax; Path=/s/<slug>; Max-Age=86400`. Verified on every request.

### Authentication guards

- File management endpoints verify Clerk session and ownership
- Cron endpoint requires `Authorization: Bearer <CRON_SECRET>`
- Custom slug creation is blocked for anonymous users server-side (not just UI)

---

## Deployment to Railway

### Step 1 — Create a Railway project

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**
2. Railway auto-detects `railway.json` — no additional setup needed

### Step 2 — Attach a Volume

FileVault needs a persistent volume for both the SQLite database and uploaded files.

1. Service → **Volumes** → **Add Volume**
2. Mount path: `/app/uploads`

### Step 3 — Environment variables

```env
DATABASE_URL              = file:/app/uploads/filevault.db
DIRECT_URL                = file:/app/uploads/filevault.db
UPLOADS_PATH              = /app/uploads
NEXT_PUBLIC_BASE_URL      = https://<your-domain>
NEXT_PUBLIC_BASE_DOMAIN   = filevault.host
CRON_SECRET               = <random 32-char string>

# Optional: Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY                  = sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL     = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL     = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
```

### Step 4 — Deploy

Railway deploys on every push. The `railway.json` runs migrations before starting:

```json
{
  "build": { "buildCommand": "npx prisma generate && npm run build" },
  "deploy": { "startCommand": "npx prisma migrate deploy && npm start" }
}
```

---

## Custom Domains & Subdomains

FileVault uses wildcard DNS to serve user sites at `<slug>.filevault.host`.

### DNS setup (Namecheap or any registrar)

Add two CNAME records pointing to your Railway service:

| Host | Value |
|---|---|
| `@` | `<your-service>.up.railway.app` |
| `*` | `<your-service>.up.railway.app` |

### Railway custom domains

Add both `filevault.host` and `*.filevault.host` in your Railway service settings. Railway issues a wildcard SSL certificate automatically.

> **Note:** Railway Hobby plan allows 2 custom domains. Using `filevault.host` + `*.filevault.host` fills both slots — do not add `www.filevault.host` separately.

### How routing works

`src/proxy.ts` intercepts every request. If the host ends in `.filevault.host`, it rewrites the path to `/s/<subdomain>` and lets Next.js handle it. Reserved subdomains (`www`, `api`, `app`, `admin`, `dashboard`, `login`, `signup`, `pricing`, `help`, `s`, etc.) are excluded from rewriting.

---

## Cron Jobs

**Endpoint:** `GET /api/cron/cleanup`

**What it does:**
1. Queries all `Site` rows where `expiresAt < now()`
2. Calls `storageDriver.deletePrefix(site.storagePrefix)` to remove files from disk
3. Deletes the `Site` record (cascades to `SiteFile` and `SiteView`)

Set up an external cron (Railway cron service, cron-job.org, etc.) to call this endpoint daily:

```
GET https://filevault.host/api/cron/cleanup
Authorization: Bearer <CRON_SECRET>
```

---

## Database Schema

```prisma
model Site {
  id             String     @id @default(cuid())
  slug           String     @unique
  label          String     @default("")
  userId         String?                         // null = anonymous
  passwordHash   String?                         // bcrypt hash
  expiresAt      DateTime?                       // null = never
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  totalSizeBytes BigInt     @default(0)
  entryFile      String     @default("index.html")
  storagePrefix  String                          // filesystem path prefix
  files          SiteFile[]
  views          SiteView[]
}

model SiteFile {
  id         String   @id @default(cuid())
  siteId     String
  site       Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  path       String                              // e.g. "css/style.css"
  mimeType   String
  sizeBytes  Int
  storageKey String                              // absolute path on disk
  createdAt  DateTime @default(now())

  @@unique([siteId, path])
}

model SiteView {
  id        String   @id @default(cuid())
  siteId    String
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  ip        String?
  userAgent String?
  viewedAt  DateTime @default(now())
}

model AnonUploadLog {
  id        String   @id @default(cuid())
  ip        String
  createdAt DateTime @default(now())

  @@index([ip, createdAt])   // used for daily rate-limit count queries
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Verify no TypeScript errors: `node node_modules/typescript/bin/tsc --noEmit`
4. Submit a pull request with a clear description

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a>, <a href="https://prisma.io">Prisma</a>, <a href="https://railway.app">Railway</a>, and <a href="https://clerk.com">Clerk</a>
</p>
