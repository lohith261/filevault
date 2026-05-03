@AGENTS.md

# FileVault — Claude context

Read this file before doing anything. It is the canonical snapshot of the project.
Skip file exploration for anything covered here — go straight to the relevant file.

---

## What this project is

Two products, one codebase:

| Product | Users | Entry point |
|---|---|---|
| Static file hosting | Humans via browser | `/` homepage → `/api/upload` |
| Agent Storage API | AI agents via REST | `/api/v1/*` with `fv_sk_` API keys |

---

## Dev server

```bash
node node_modules/next/dist/bin/next dev
```

`npx next dev` and `npm run dev` both fail with MODULE_NOT_FOUND on this Next.js 16 build. Always use the full path.

---

## Key files — go here first

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Single source of truth for all DB models |
| `src/proxy.ts` | Middleware — subdomain rewrites + Clerk auth (NOT `middleware.ts`) |
| `src/lib/auth/apiKey.ts` | `generateApiKey()`, `hashApiKey()`, `resolveAgent(authHeader)` |
| `src/lib/prisma.ts` | Prisma client singleton (libsql adapter) |
| `src/lib/storage/index.ts` | `storageDriver` — always import from here, never from `local.ts` / `r2.ts` directly |
| `src/lib/storage/types.ts` | `StorageDriver` interface, `FileEntry` type |
| `src/lib/embeddings/index.ts` | `generateEmbedding(text)` → `number[]` via OpenRouter |
| `src/lib/chunking/index.ts` | `chunkText(text, chunkSize=500, overlap=100)` → `string[]` |
| `src/lib/extractors/index.ts` | `extractText(buffer, mimeType, filename)` → HTML/TXT/PDF/JSON |
| `src/lib/search/similarity.ts` | `cosineSimilarity(a, b)`, `rankResults(results, topK)` |
| `src/lib/indexing.ts` | `indexFile(agentId, fileId, buffer, mimeType, filename)` → `IndexResult`, `streamToBuffer(stream)` |
| `src/lib/rateLimit.ts` | `checkUploadRateLimit(agentId)` → `{ allowed, retryAfterSeconds }` — 20 uploads/min |
| `src/hooks/useAgentFiles.ts` | SWR hook for v1/files — `deleteFile`, `indexFile`, `uploadFile` |
| `src/hooks/useAgentMemory.ts` | SWR hook for v1/memory — `addMemory` |
| `src/components/agents/` | `AgentSetup`, `AgentDashboard`, `AgentFileCard`, `AgentSearch`, `AgentMemory` |
| `src/app/agents/page.tsx` | `/agents` page — key stored in localStorage under `fv_agent_key` |
| `src/lib/limits.ts` | `getTier()`, `getLimits()`, `capExpiry()` — tier config |
| `src/lib/validations.ts` | Shared Zod schemas |
| `src/types/api.ts` | Shared TypeScript types for API responses |

---

## Database models (prisma/schema.prisma)

**Human hosting:**
- `Site` — a deployed static site (slug, userId, passwordHash, expiresAt, customDomain, storagePrefix)
- `SiteFile` — individual file within a Site (path, mimeType, sizeBytes, storageKey)
- `SiteView` — analytics record per file request
- `AnonUploadLog` — IP-based rate limiting for anonymous uploads

**Agent system:**
- `Agent` — API key identity (apiKeyHash, name)
- `AgentFile` — file uploaded via agent API (agentId, storageKey, metadata JSON string, isIndexed)
- `Embedding` — text chunk + vector (agentId, fileId nullable, content, vector as JSON string)
- `Memory` — agent memory entry (agentId, content, vector as JSON string, expiresAt nullable)

Vectors are stored as JSON-encoded `number[]` strings. Parse with `JSON.parse()`, serialize with `JSON.stringify()`.

---

## Full API surface

**Human API:**
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload + deploy (multipart) |
| `GET` | `/api/files` | List user's sites (paginated) |
| `PATCH` | `/api/files/[slug]` | Rename, password, expiry |
| `PUT` | `/api/files/[slug]` | Replace files at same URL |
| `DELETE` | `/api/files/[slug]` | Delete site + storage |
| `GET` | `/api/analytics/[slug]` | View stats |
| `GET` | `/api/domain` | Custom domain → slug resolution |
| `GET` | `/api/cron/cleanup` | Delete expired sites (cron) |

**Agent API (v1):**
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/agents` | Create agent, returns `fv_sk_` key once |
| `GET` | `/api/v1/files` | List files (paginated, `indexed` filter) |
| `POST` | `/api/v1/files` | Upload + optionally index file (rate limited: 20/min) |
| `GET` | `/api/v1/files/[id]` | Single file metadata |
| `DELETE` | `/api/v1/files/[id]` | Delete file + embeddings (cascade) + storage |
| `POST` | `/api/v1/files/[id]/index` | Index existing file on demand |
| `POST` | `/api/v1/search` | Semantic search over embeddings + memory |
| `POST` | `/api/v1/memory` | Store a memory with embedding |
| `GET` | `/api/v1/memory` | List memories (paginated) |

---

## Environment variables

```bash
# Database (libsql)
DATABASE_URL          # file:./prisma/filevault.db locally
DIRECT_URL            # same as DATABASE_URL for SQLite

# Storage — set STORAGE_DRIVER=r2 to switch from local to R2
STORAGE_DRIVER        # "local" (default) or "r2"
UPLOADS_PATH          # local only — defaults to ./uploads
R2_ACCOUNT_ID         # fd8b0a310ce4c92432537df62bcefbbf
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME        # filevault
R2_PUBLIC_URL         # https://pub-f641d19db8ee499bbce78fa8ab1c7e9e.r2.dev

# AI
OPENROUTER_API_KEY    # model: openai/text-embedding-3-small

# App
NEXT_PUBLIC_BASE_URL      # http://localhost:3001 locally
NEXT_PUBLIC_BASE_DOMAIN   # filevault.host
CRON_SECRET               # any random string

# Clerk (optional — app works without these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL       # /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL       # /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL # /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL # /dashboard
```

---

## Patterns — follow these exactly

**Every v1 route starts with:**
```ts
import { resolveAgent } from '@/lib/auth/apiKey'

const agentId = await resolveAgent(request.headers.get('authorization'))
if (!agentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Storage — always through the driver:**
```ts
import { storageDriver } from '@/lib/storage'
// Never: import { r2Driver } from '@/lib/storage/r2'
```

**Validation — always Zod:**
```ts
const result = MySchema.safeParse(body)
if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
```

**Prisma — always the singleton:**
```ts
import { prisma } from '@/lib/prisma'
```

**Vectors — serialize/deserialize:**
```ts
// Store:  vector: JSON.stringify(embedding)
// Recall: JSON.parse(row.vector) as number[]
```

**Error responses:**
- `400` — bad input
- `401` — missing or invalid API key
- `404` — resource not found or doesn't belong to agent
- `500` — unexpected server error (log it, don't expose internals)

---

## Migrations

The DB is SQLite. Apply new migrations with:
```bash
sqlite3 prisma/filevault.db < prisma/migrations/<migration>/migration.sql
npx prisma generate
```

After writing a new migration file, also record it in `_prisma_migrations` if the dev DB is already up.

---

## Quirks to remember

- Middleware is `src/proxy.ts`, not `middleware.ts`
- `AgentFile.metadata` is stored as a JSON **string** — `JSON.parse()` before returning
- `Embedding.vector` and `Memory.vector` are JSON **strings** of `number[]`
- The R2 file-serving route 302-redirects to the CDN URL — files never stream through Next.js
- Clerk is entirely optional; all `auth()` calls are wrapped in try/catch

---

## README update rule

**Update `README.md` whenever:**
- A new API endpoint is added or removed
- A new environment variable is introduced
- The storage layer, embedding provider, or DB changes
- The tier system limits change
- A new library is added to the core stack
- Deployment instructions change

Keep the README accurate. It is the external-facing source of truth.
When updating, match the existing section structure — don't restructure, just update the relevant section.
