# FileVault

> Instant static file hosting — drop a ZIP or HTML file, get a shareable URL in under 3 seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://prisma.io)
[![SQLite](https://img.shields.io/badge/SQLite-libsql-003b57?logo=sqlite)](https://github.com/tursodatabase/libsql)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FileVault** is an open-source, production-ready static site hosting platform. Upload a ZIP archive or a single HTML file, and you immediately get a permanent shareable URL. No configuration, no account required for basic use.

Runs entirely on [Railway](https://railway.app) with SQLite and local filesystem storage — no external database or blob storage service needed.

---

## Table of Contents

1. [Features](#features)
2. [Live Demo](#live-demo)
3. [Architecture Overview](#architecture-overview)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Local Development](#local-development)
7. [Environment Variables](#environment-variables)
8. [API Reference](#api-reference)
9. [Authentication & Billing](#authentication--billing)
10. [Security Model](#security-model)
11. [Deployment to Railway](#deployment-to-railway)
12. [Clerk Billing Setup](#clerk-billing-setup)
13. [Cron Jobs](#cron-jobs)
14. [Database Schema](#database-schema)
15. [Contributing](#contributing)
16. [License](#license)

---

## Features

### Core

| Feature | Free | Pro |
|---|---|---|
| Upload ZIP or HTML | ✓ | ✓ |
| Auto-detect entry file | ✓ | ✓ |
| Shareable `/s/<slug>` URL | ✓ | ✓ |
| Anonymous uploads (no account) | ✓ | ✓ |
| Max upload size | 10 MB | 50 MB |
| Max expiry | 24 hours | Never |
| Password protection | ✓ | ✓ |
| View counter | ✓ | ✓ |
| QR code generation | ✓ | ✓ |
| Dashboard + file manager | ✓ | ✓ |
| Rename deployments | ✓ | ✓ |
| Dark / light mode | ✓ | ✓ |

### Feature Details

**Instant deploy** — The upload pipeline (parse → unzip → store → DB write) runs entirely inside a Next.js API route. Files are written to the local filesystem on a persistent Railway Volume.

**ZIP support** — JSZip extracts the archive in memory (no temp-file I/O). Every extracted path is sanitized against directory traversal (`../`). The entry point is detected by searching for `index.html` at the root, or the first `.html` file found.

**Password protection** — Any deployment can be locked with a password set at upload time. The password is hashed with bcrypt before storage. Visitors see an inline password form served by the same route; on success, a `fv_pw_<slug>` httpOnly cookie is set so they don't have to re-enter it.

**Expiry & cleanup** — Expiry dates are stored in the database. A cron job runs daily to delete expired sites (storage + DB records). Anonymous users are limited to 24-hour expiry; Pro users can set 7d, 30d, or never.

**Dashboard** — Signed-in users see all their deployments in a paginated grid with view counts, creation dates, expiry badges, and quick-actions (copy URL, rename, delete). A search bar filters by label.

**Analytics** — Every file request logs a `SiteView` record (deduped by IP + slug + hour). The dashboard shows total views per deployment.

**QR codes** — The `qrcode.react` component renders a QR code for every deployment URL.

**Clerk optional** — Clerk auth is an enhancement, not a gate. The app runs fully without Clerk keys — anonymous mode is fully functional.

---

## Live Demo

→ **[filevault.host](https://filevault.host)**

---

## Architecture Overview

```
Browser
  │
  ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Railway)                     │
│                                                             │
│  POST /api/upload ──► unzip ──► Local FS ──► Prisma DB     │
│                                                             │
│  GET /s/[slug]    ──► DB lookup ──► 302 to entryFile       │
│                                                             │
│  GET /s/[slug]/[...path]                                    │
│    ├── DB lookup SiteFile.storageKey                        │
│    └── stream file from filesystem                          │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
   SQLite (libsql)          Local filesystem
   file:/app/uploads/       /app/uploads/<slug>/
   filevault.db             (Railway Volume)
```

Both the SQLite database file and uploaded files live on the same Railway Volume mounted at `/app/uploads`. A single volume is all that's needed.

### Storage Driver

All uploads are written to the local filesystem via `src/lib/storage/local.ts`. The uploads directory is configurable via `UPLOADS_PATH` (defaults to `./uploads` in dev, `/app/uploads` on Railway).

```typescript
interface StorageDriver {
  putFiles(slug: string, files: FileEntry[]): Promise<string>  // returns storagePrefix
  getFileStream(storageKey: string): Promise<ReadableStream>
  deletePrefix(prefix: string): Promise<void>
}
```

### Upload Pipeline

```
POST /api/upload (multipart/form-data)
  │
  ├── Parse: file, expiry, password?, label?
  ├── Validate: size limit, allowed MIME types, no executable extensions
  ├── Generate: 6-char nanoid slug (collision-checked against DB)
  ├── If ZIP: JSZip extract in memory, sanitize paths, detect entryFile
  ├── storageDriver.putFiles(slug, files[])
  ├── Prisma transaction: Site + SiteFile[] bulk insert
  └── Return: { slug, url, expiresAt, fileCount }
```

### Password Gate Flow

```
GET /s/slug/page.html
  │
  ├── DB lookup Site (check passwordHash)
  ├── If passwordHash present:
  │     ├── Read cookie fv_pw_slug
  │     ├── bcrypt.compare(cookieValue, passwordHash)
  │     ├── If mismatch → return inline HTML password form (no redirect)
  │     └── If match → proceed
  └── Stream file from disk
```

---

## Tech Stack

| Layer | Library | Version | Why |
|---|---|---|---|
| Framework | Next.js | 16.x | App Router, server components, API routes |
| Language | TypeScript | 5.x | Type safety across the full stack |
| Styling | Tailwind CSS | v4 | CSS-first config, custom properties design tokens |
| Animations | Framer Motion | 12.x | `AnimatePresence`, animated blobs, hover effects |
| Auth + Billing | Clerk | 7.x | Optional drop-in auth + subscription billing |
| Database ORM | Prisma | 7.x | Type-safe client with `@prisma/adapter-libsql` |
| Database | SQLite (libsql) | — | Self-contained, no external service, Railway Volume |
| Storage | Local filesystem | — | Railway Volume mount, `UPLOADS_PATH` configurable |
| ZIP extraction | JSZip | 3.x | Pure JS, runs in serverless without native bindings |
| Password hashing | bcryptjs | 2.x | Pure JS, no native bindings required |
| Data fetching | SWR | 2.x | Dashboard file list with optimistic mutations |
| ID generation | nanoid | 5.x | Cryptographically secure URL-safe slugs |
| QR codes | qrcode.react | 4.x | Client-side QR generation, no external API |
| Theme | next-themes | 0.4.x | SSR-safe dark/light mode with system detection |
| Validation | Zod | 4.x | API request schema validation |

---

## Project Structure

```
FileVault/
├── .env.example                  # Template for all required env vars
├── .env.local                    # Your local secrets (gitignored)
├── .gitignore
├── next.config.ts                # serverExternalPackages
├── railway.json                  # Railway build + deploy config
├── prisma/
│   ├── schema.prisma             # Site, SiteFile, SiteView models (SQLite)
│   └── migrations/               # SQLite migration files
├── public/
│   └── favicon.ico
└── src/
    ├── proxy.ts                  # Next.js 16 middleware (Clerk optional guard)
    ├── app/
    │   ├── layout.tsx            # Root layout: conditional ClerkProvider, ThemeProvider
    │   ├── page.tsx              # Landing page (HeroSection + features)
    │   ├── globals.css           # CSS custom properties design tokens
    │   ├── (auth)/
    │   │   ├── sign-in/[[...sign-in]]/page.tsx
    │   │   └── sign-up/[[...sign-up]]/page.tsx
    │   ├── pricing/
    │   │   └── page.tsx          # Clerk PricingTable component
    │   ├── dashboard/
    │   │   └── page.tsx          # File manager with search + pagination
    │   ├── s/
    │   │   ├── [slug]/
    │   │   │   └── route.ts      # Redirect /slug → /slug/<entryFile>
    │   │   └── [slug]/[...path]/
    │   │       └── route.ts      # File serving: password gate + stream from disk
    │   └── api/
    │       ├── upload/
    │       │   └── route.ts      # POST: upload pipeline
    │       ├── files/
    │       │   ├── route.ts      # GET: list user's sites (paginated + search)
    │       │   └── [slug]/
    │       │       └── route.ts  # DELETE / PATCH: manage a deployment
    │       ├── analytics/
    │       │   └── [slug]/
    │       │       └── route.ts  # GET: view stats for a deployment
    │       └── cron/
    │           └── cleanup/
    │               └── route.ts  # GET (cron): delete expired sites
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── Dialog.tsx
    │   │   ├── Tooltip.tsx
    │   │   └── Spinner.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx        # useSafeAuth() for Clerk-optional rendering
    │   │   ├── Footer.tsx
    │   │   └── ThemeProvider.tsx
    │   ├── upload/
    │   │   ├── DropZone.tsx      # Animated drop area with file-type badges
    │   │   ├── UploadProgress.tsx
    │   │   ├── UploadSuccess.tsx  # Pulsing ring + copy + share buttons
    │   │   └── ExpiryPicker.tsx
    │   ├── dashboard/
    │   │   ├── FileCard.tsx
    │   │   ├── FileGrid.tsx      # Illustrated empty state
    │   │   ├── RenameDialog.tsx
    │   │   ├── DeleteDialog.tsx
    │   │   ├── PasswordDialog.tsx
    │   │   └── StatsBar.tsx
    │   ├── landing/
    │   │   ├── HeroSection.tsx   # Animated gradient blobs + social proof strip
    │   │   ├── FeaturesSection.tsx
    │   │   └── HowItWorksSection.tsx
    │   └── shared/
    │       ├── CopyButton.tsx
    │       ├── QRCodeDisplay.tsx
    │       └── PasswordPrompt.tsx
    ├── lib/
    │   ├── prisma.ts             # Singleton PrismaClient with PrismaLibSql adapter
    │   ├── storage/
    │   │   ├── types.ts          # StorageDriver interface + FileEntry type
    │   │   ├── index.ts          # Always exports localDriver
    │   │   └── local.ts          # Filesystem driver (UPLOADS_PATH configurable)
    │   ├── unzip.ts
    │   ├── slug.ts
    │   ├── mime.ts
    │   ├── hash.ts
    │   ├── analytics.ts
    │   ├── ratelimit.ts
    │   └── validations.ts
    ├── hooks/
    │   ├── useUpload.ts
    │   ├── useFiles.ts
    │   ├── useClipboard.ts
    │   └── useTheme.ts
    └── types/
        ├── api.ts
        └── db.ts
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

Minimum required for local dev (no Clerk needed):

```bash
DATABASE_URL="file:./prisma/filevault.db"
UPLOADS_PATH="./uploads"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
CRON_SECRET="any-random-secret"
```

Uploaded files are written to `./uploads/<slug>/`. The SQLite database is at `./prisma/filevault.db`. Both paths are gitignored.

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload a ZIP or HTML file — you'll get a `/s/<slug>` URL immediately.

### 5. Testing the upload flow

1. Create a ZIP containing `index.html`
2. Drag it onto the hero drop zone
3. Copy the resulting URL and open it — your page should render
4. For password-protected sites: set a password in Advanced options and verify the prompt appears

---

## Environment Variables

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | SQLite file path. `file:./prisma/filevault.db` locally, `file:/app/uploads/filevault.db` on Railway. |

### Storage

| Variable | Required | Description |
|---|---|---|
| `UPLOADS_PATH` | — | Directory for uploaded files. Default: `./uploads`. Set to `/app/uploads` on Railway. |

### Auth (Clerk — optional)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | — | Clerk publishable key. App works without this (anonymous mode). |
| `CLERK_SECRET_KEY` | — | Clerk secret key. Required if publishable key is set. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | — | Default: `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | — | Default: `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | — | Default: `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | — | Default: `/dashboard` |

### Application

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | ✓ | Public base URL, no trailing slash. Used to construct shareable links. |
| `CRON_SECRET` | ✓ | Random secret (32+ chars) used to authorize the cleanup cron endpoint. |
| `ANON_MAX_SIZE_MB` | — | Max upload size in MB for unauthenticated users. Default: `10`. |
| `ANON_MAX_EXPIRY_HOURS` | — | Max expiry in hours for unauthenticated users. Default: `24`. |

---

## API Reference

### `POST /api/upload`

Upload a file and deploy it.

**Auth:** Optional. Authenticated Pro users get larger size limits and longer expiry options.

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✓ | A `.zip` or `.html` file |
| `expiry` | string | — | `1h`, `24h`, `7d`, `30d`, `never`. Default: `24h` |
| `password` | string | — | Password to protect the deployment |
| `label` | string | — | Human-readable name shown in dashboard |

**Response `200`:**
```json
{
  "slug": "abc123",
  "url": "https://filevault.host/s/abc123",
  "expiresAt": "2025-01-15T12:00:00.000Z",
  "fileCount": 5
}
```

**Error responses:**
- `400` — Invalid file type, file too large, or missing file
- `429` — Rate limited (IP-based, 10 req/min anonymous)

---

### `GET /api/files`

List the authenticated user's deployments.

**Auth:** Required. Returns empty list if not authenticated.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (1-indexed). Default: `1` |
| `search` | string | Filter by label (substring match) |

**Response `200`:**
```json
{
  "sites": [
    {
      "slug": "abc123",
      "label": "My portfolio",
      "expiresAt": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "totalSizeBytes": 123456,
      "entryFile": "index.html",
      "viewCount": 42
    }
  ],
  "total": 15,
  "page": 1
}
```

---

### `DELETE /api/files/[slug]`

Delete a deployment and its stored files.

**Auth:** Required. Must own the deployment.

**Response `200`:** `{ "success": true }`

---

### `PATCH /api/files/[slug]`

Update a deployment's metadata.

**Auth:** Required. Must own the deployment.

**Request body (JSON):**
```json
{
  "label": "New name",
  "password": "new-password",
  "expiresAt": "2025-06-01T00:00:00.000Z"
}
```

All fields are optional. Send `"password": ""` to remove a password. Send `"expiresAt": null` to remove expiry.

---

### `GET /api/analytics/[slug]`

Get view statistics for a deployment.

**Auth:** Required. Must own the deployment.

**Response `200`:**
```json
{ "total": 150, "last7Days": 42, "last30Days": 120 }
```

---

### `GET /api/cron/cleanup`

Deletes all expired sites (storage files + DB records).

**Auth:** `Authorization: Bearer <CRON_SECRET>` header required.

**Response `200`:** `{ "deleted": 3 }`

---

### `GET /s/[slug]`

Redirects to the deployment's entry file.

**Response:** `302` redirect to `/s/[slug]/<entryFile>`

---

### `GET /s/[slug]/[...path]`

Serves a file from a deployment.

**Password gate:** If the site has a password and the `fv_pw_<slug>` cookie is missing or wrong, returns an HTML password form. On correct password submission, sets the cookie and proceeds.

**Response:** `200` with file contents streamed from disk, with headers:
```
Content-Type: <detected MIME type>
Cache-Control: public, max-age=3600
Content-Security-Policy: sandbox allow-scripts allow-same-origin allow-popups allow-forms
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

---

## Authentication & Billing

### Authentication (Clerk — optional)

Clerk is optional. When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is not set, the app runs in anonymous mode: uploads work, file serving works, and the dashboard shows an empty state rather than an error.

When Clerk is configured, it handles email/password sign-up, OAuth providers, and user sessions.

The middleware in `src/proxy.ts` checks `CLERK_CONFIGURED` before enabling auth protection. All `auth()` calls in API routes are wrapped in try/catch so they degrade gracefully without keys.

### Subscription Billing (Clerk Billing)

Billing is handled natively by Clerk — no Stripe setup required.

**Plans:**

| Plan | Clerk key | Price | Limits |
|---|---|---|---|
| Free | `free_user` | $0 | 10 MB uploads, 24h max expiry |
| Pro | `pro` | $1/month | 50 MB uploads, any expiry including never |

**Checking plan in code (server-side):**
```typescript
import { auth } from '@clerk/nextjs/server'
const authObj = await auth()
const isPro = authObj.has?.({ plan: 'user:pro' }) ?? false
```

**Checking plan (client-side):**
```typescript
import { useAuth } from '@clerk/nextjs'
const { has } = useAuth()
const isPro = has?.({ plan: 'user:pro' }) ?? false
```

The `/pricing` page renders Clerk's `<PricingTable />` component which handles the full checkout flow.

---

## Security Model

### Upload validation

- Allowed MIME types: `text/html`, `application/zip`, `application/x-zip-compressed`, `application/octet-stream`
- Blocked extensions within ZIPs: `.php`, `.py`, `.rb`, `.sh`, `.exe`, `.bat`, `.cgi`, `.pl`, `.asp`, `.aspx`, `.jsp`
- All extracted paths normalized with `path.normalize`; any path containing `..` is rejected

### File serving headers

```
Content-Security-Policy: sandbox allow-scripts allow-same-origin allow-popups allow-forms
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Cache-Control: public, max-age=3600
```

The `sandbox` CSP directive prevents deployed sites from accessing cookies or localStorage on the hosting domain.

### Password protection

Passwords hashed with bcryptjs at cost factor 10. Cookie `fv_pw_<slug>` set with `HttpOnly; SameSite=Lax; Path=/s/<slug>`. Verified on every request by comparing to stored hash.

### Authentication guards

- File management endpoints require a valid Clerk session
- Ownership verified on every DELETE/PATCH
- Cron endpoint requires `Authorization: Bearer <CRON_SECRET>`

### Rate limiting

In-memory rate limiter limits anonymous upload requests to 10 per minute per IP.

---

## Deployment to Railway

### Prerequisites

- A [Railway](https://railway.app) account
- A GitHub repository with the FileVault code
- (Optional) A [Clerk](https://clerk.com) application

### Step 1 — Create a Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. Select **Deploy from GitHub repo** and choose your repository
3. Railway auto-detects the `railway.json` config — no additional setup needed

### Step 2 — Attach a Volume

FileVault needs a persistent volume for both the SQLite database and uploaded files.

1. In your Railway service → **Volumes** → **Add Volume**
2. Set the **mount path** to `/app/uploads`
3. Railway automatically sets `RAILWAY_VOLUME_MOUNT_PATH=/app/uploads`

### Step 3 — Add environment variables

In Railway → Project → **Variables**, add:

```
DATABASE_URL       = file:/app/uploads/filevault.db
UPLOADS_PATH       = /app/uploads
NEXT_PUBLIC_BASE_URL = https://<your-service>.up.railway.app
CRON_SECRET        = <random 32-char string>
```

Optionally (for auth + billing):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
CLERK_SECRET_KEY                  = sk_live_...
```

### Step 4 — Generate a public domain

In Railway → Service → **Settings** → **Networking** → **Generate Domain**.

Update `NEXT_PUBLIC_BASE_URL` to match.

### Step 5 — Deploy

Railway automatically deploys on every push to your default branch.

The `railway.json` `startCommand` runs `npx prisma migrate deploy` before starting the server, so the database schema is always up to date on boot:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Custom domain

In Railway → Service → **Settings** → **Networking** → **Custom Domain**. Update `NEXT_PUBLIC_BASE_URL` to your domain.

---

## Clerk Billing Setup

To enable the subscription system in Clerk:

### 1. Enable Billing

Clerk dashboard → **Billing** → toggle **Enable Billing** on.

### 2. Create plans

**Free plan:**
- Key: `free_user` · Price: $0/month · Mark as **default**

**Pro plan:**
- Key: `pro` · Price: $1/month

### 3. Publish both plans

Each plan must be in **Published** state for `<PricingTable />` to display it.

### 4. Verify

Visit `/pricing` on your deployed site. After subscribing to Pro, `has({ plan: 'user:pro' })` returns `true`, unlocking 50 MB uploads and extended expiry.

---

## Cron Jobs

FileVault uses a single cron job to clean up expired deployments.

**Endpoint:** `GET /api/cron/cleanup`

**What it does:**
1. Queries all `Site` records where `expiresAt < now()`
2. Calls `storageDriver.deletePrefix(storagePrefix)` to delete files from disk
3. Deletes the `Site` record (cascades to `SiteFile` and `SiteView`)

To run it on a schedule, set up a Railway cron service or an external cron (e.g. cron-job.org) to `GET /api/cron/cleanup` daily with the header `Authorization: Bearer <CRON_SECRET>`.

---

## Database Schema

```prisma
model Site {
  id             String     @id @default(cuid())
  slug           String     @unique
  label          String     @default("")
  userId         String?                          // null = anonymous upload
  passwordHash   String?                          // bcrypt hash
  expiresAt      DateTime?                        // null = never expires
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  totalSizeBytes BigInt     @default(0)
  entryFile      String     @default("index.html")
  storagePrefix  String                           // local dir path
  files          SiteFile[]
  views          SiteView[]

  @@index([userId])
  @@index([expiresAt])
  @@index([createdAt])
}

model SiteFile {
  id         String   @id @default(cuid())
  siteId     String
  site       Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  path       String                               // e.g. "css/style.css"
  mimeType   String
  sizeBytes  Int
  storageKey String                               // absolute path on disk
  createdAt  DateTime @default(now())

  @@index([siteId])
  @@unique([siteId, path])
}

model SiteView {
  id        String   @id @default(cuid())
  siteId    String
  site      Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
  ip        String?
  userAgent String?
  viewedAt  DateTime @default(now())

  @@index([siteId])
  @@index([siteId, viewedAt])
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make changes and run `npm run build` to verify no TypeScript errors
4. Submit a pull request with a clear description

### Code style

- TypeScript strict mode throughout
- No `any` types (use `unknown` + type narrowing)
- Tailwind CSS only — no inline styles
- Comments only when the **why** is non-obvious

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a>, <a href="https://prisma.io">Prisma</a>, <a href="https://railway.app">Railway</a>, and <a href="https://clerk.com">Clerk</a>
</p>
