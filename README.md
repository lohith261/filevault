<div align="center">
  <img src="./public/logo.png" width="140" alt="FileVault" />
  <h1>FileVault</h1>
  <p><strong>The storage layer AI agents actually need.</strong><br/>
  Files · Memory · Semantic Search · Agent-to-Agent Sharing — one API.</p>

  [![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js&logoColor=white)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![pgvector](https://img.shields.io/badge/pgvector-4169e1?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
  [![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-f38020?logo=cloudflare&logoColor=white)](https://www.cloudflare.com/developer-platform/r2/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

  **[→ filevault.host](https://filevault.host)** &nbsp;·&nbsp; [Docs](/help) &nbsp;·&nbsp; [Pricing](/pricing)
</div>

---

## The problem

Most AI agents are stateless by default. Between runs they lose context. Files live in S3 (dumb blobs), memories live in Pinecone (dumb vectors) — and neither knows about the other. Stitching them together means custom auth, a custom sync layer, and custom rate limiting. Every. Single. Time.

**FileVault is the storage infrastructure that treats agents as first-class citizens.**

| Without FileVault | With FileVault |
|---|---|
| S3 + Pinecone + Redis + custom auth | One API key |
| Build your own chunking & embedding pipeline | Upload → indexed automatically |
| Manual cross-agent credential sharing | `POST /v1/shares` |
| Rebuild memory on every session | Persistent memory with TTL |
| Duct tape between services | One REST API, two SDKs, one MCP server |

---

## Features

| | Capability | Detail |
|---|---|---|
| 📁 | **Semantic File Storage** | Upload any file; text is extracted, chunked, and embedded automatically |
| 🧠 | **Agent Memory** | Persistent key/value memory with TTL — survives across sessions |
| 🔍 | **Semantic Search** | Natural language queries via pgvector HNSW · <50ms p99 |
| 🗂️ | **Collections** | Scope search to a project, client, or topic |
| 🤝 | **Agent-to-Agent Sharing** | Grant read access to your embeddings without sharing credentials |
| 💾 | **State / Checkpoints** | Save and resume agent execution state |
| 🪝 | **Webhooks** | Receive events for `file.created`, `file.indexed`, `file.deleted` |
| 🔌 | **MCP Server** | Works out-of-the-box with Claude Desktop, Cursor, Cline |

---

## Quick Start

### 1. Get an API key

```bash
curl -X POST https://filevault.host/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent"}'
```

Save the `api_key` (starts with `fv_sk_`). It is shown **exactly once**.

### 2. Upload & index a file

```bash
curl -X POST https://filevault.host/api/v1/files \
  -H "Authorization: Bearer fv_sk_..." \
  -F "file=@report.pdf" \
  -F "index=true"
```

### 3. Search in natural language

```bash
curl -X POST https://filevault.host/api/v1/search \
  -H "Authorization: Bearer fv_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "What was the Q3 revenue?", "limit": 5}'
```

### 4. Store memory

```bash
curl -X POST https://filevault.host/api/v1/memory \
  -H "Authorization: Bearer fv_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers concise bullet points.", "ttl": 86400}'
```

---

## SDKs

### TypeScript

```ts
import { FileVault } from '@filevault/sdk'

const fv = new FileVault('fv_sk_...')

// Upload and index
const file = await fv.files.upload(blob, { index: true, metadata: { project: 'q3' } })

// Semantic search
const results = await fv.search('What is the refund policy?')

// Persistent memory
await fv.memory.add('User prefers concise responses.', { ttl_seconds: 86400 })

// Delete a memory
await fv.memory.delete(memoryId)

// Iterate all files with auto-pagination
for await (const f of fv.files.iter()) {
  console.log(f.name, f.index_status)
}
```

### Python

```python
from filevault import FileVault

fv = FileVault("fv_sk_...")

# Upload and index
with open("report.pdf", "rb") as f:
    file = fv.files.upload(f, name="report.pdf", index=True)

# Semantic search
results = fv.search("What is the refund policy?")
for r in results:
    print(f"{r.score:.2f}  {r.content[:80]}")

# Persistent memory
fv.memory.add("User prefers metric units", ttl_seconds=86400 * 30)

# Delete a memory
fv.memory.delete(memory_id)

# Iterate all files
for f in fv.files.iter():
    print(f.name)
```

---

## MCP Server

FileVault exposes an MCP server so any compatible client can use it without writing code.

**Claude Desktop config (`~/.claude/claude_desktop_config.json`):**

```json
{
  "mcpServers": {
    "filevault": {
      "command": "npx",
      "args": ["-y", "tsx", "src/mcp/server.ts"],
      "env": { "FILEVAULT_API_KEY": "fv_sk_..." }
    }
  }
}
```

| Tool | Description |
|---|---|
| `filevault_upload_file` | Upload and optionally index a file |
| `filevault_search` | Semantic search across files and memory |
| `filevault_store_memory` | Store agent memory with optional TTL |
| `filevault_list_files` | List stored files |
| `filevault_get_usage` | Get usage statistics |

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Next.js 16 (Vercel)                      │
│                                                             │
│  Agent → POST /v1/agents    create identity                 │
│       → POST /v1/files      upload + index                  │
│       → POST /v1/search     semantic retrieval              │
│       → POST /v1/memory     store + recall                  │
│       → POST /v1/state      checkpoints                     │
│       → POST /v1/shares     cross-agent access              │
│       → GET  /v1/collections scoped groups                  │
│                                                             │
└───────────────┬──────────────────────────┬─────────────────┘
                │                          │
       PostgreSQL + pgvector         Cloudflare R2
       (vectors + metadata)          (object storage)
                │
     ┌──────────┴────────────────┐
     │   Embedding pipeline       │
     │   extract → chunk → embed  │
     │   OpenRouter · text-emb-3  │
     └───────────────────────────┘
```

---

## Agent API Reference (v1)

Every endpoint requires `Authorization: Bearer fv_sk_<64 hex chars>`.

### Files

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/files?limit=&cursor=&indexed=` | List files |
| `POST` | `/v1/files` | Upload file (multipart) |
| `POST` | `/v1/files/batch` | Batch upload (up to 10) |
| `GET` | `/v1/files/:id` | Get file metadata + `index_status` |
| `DELETE` | `/v1/files/:id` | Delete file + embeddings |
| `POST` | `/v1/files/:id/index` | Queue indexing on demand |

**`index_status` lifecycle:** `idle` → `pending` → `indexing` → `indexed` / `failed`

### Search

```json
POST /v1/search
{
  "query": "quarterly revenue breakdown",
  "filter": {
    "type": "all",
    "file_id": "clx...",
    "collection_id": "clx...",
    "include_shared": true,
    "metadata": { "project": "q3" }
  },
  "limit": 5
}
```

### Memory

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/memory` | Store memory `{ content, ttl? }` |
| `GET` | `/v1/memory?limit=&cursor=` | List memories |
| `DELETE` | `/v1/memory/:id` | Delete a memory entry |

### State / Checkpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/state` | Store or update state (upsert by key) |
| `GET` | `/v1/state?limit=&cursor=&key=` | List states |
| `GET` | `/v1/state/:id` | Get single state with data |
| `DELETE` | `/v1/state/:id` | Delete state |

### Collections

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/collections` | List collections |
| `POST` | `/v1/collections` | Create collection `{ name }` |
| `GET` | `/v1/collections/:id` | Get collection + files |
| `DELETE` | `/v1/collections/:id` | Delete collection |
| `POST` | `/v1/collections/:id/files` | Add file `{ file_id }` |
| `DELETE` | `/v1/collections/:id/files/:fileId` | Remove file |

### Sharing

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/shares` | List shares given & received |
| `POST` | `/v1/shares` | Grant access `{ agent_id }` |
| `DELETE` | `/v1/shares/:granteeId` | Revoke access |

### Webhooks & Usage

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/webhooks` | Get webhook URL |
| `PUT` | `/v1/webhooks` | Set webhook URL |
| `DELETE` | `/v1/webhooks` | Remove webhook |
| `GET` | `/v1/usage` | File, embedding, memory, state counts |

**Webhook events:** `file.created` · `file.deleted` · `file.indexed`

---

## Usage Caps (Free tier)

| Resource | Limit |
|---|---|
| Files | 1,000 |
| Total storage | 1 GB |
| Embedding chunks | 50,000 |
| Active memories | 5,000 |
| State checkpoints | 1,000 |
| Max file size | 50 MB |
| Batch size | 10 files |

All limits return `429` with a descriptive `error` field.

---

## Agent Artifacts (Human Hosting)

Agents build things for humans — dashboards, reports, static sites. FileVault hosts those too.

Drop a ZIP or HTML file on the homepage, get a shareable URL in seconds.

| Feature | Anonymous | Free |
|---|:---:|:---:|
| Upload ZIP or HTML | ✓ | ✓ |
| Max upload size | 5 MB | 10 MB |
| Link expiry | 24 h | 30 days |
| Custom subdomain | — | ✓ |

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector (fastest via Docker):

```bash
docker compose up -d   # spins up ankane/pgvector on localhost:5432
```

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

Minimum for local dev:

```env
DATABASE_URL="postgresql://filevault:filevault@localhost:5432/filevault"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
CRON_SECRET="dev-cron-secret"
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 3. Apply migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Start dev server

```bash
node node_modules/next/dist/bin/next dev
```

> `npm run dev` and `npx next dev` fail with MODULE_NOT_FOUND on this Next.js 16 build. Use the full path above.

### 5. Run MCP server locally

```bash
FILEVAULT_API_KEY=fv_sk_... npm run mcp
```

### 6. Run tests

```bash
npm test                    # unit tests (91 tests)
npm run test:integration    # integration tests against running dev server
```

---

## Deployment

### Vercel (recommended)

Production runs at **[filevault.host](https://filevault.host)** — auto-deploys on push to `main`.

1. Import the GitHub repo into Vercel
2. Set all env vars from `.env.example` in **Project → Settings → Environment Variables**
3. Set `STORAGE_DRIVER=r2` (Vercel is serverless — local disk won't persist)
4. Deploy

> **Migrations:** Vercel does NOT run `prisma migrate deploy` during build. Run new migrations manually via the Supabase SQL editor.

### Railway (secondary)

`railway.json` and `scripts/start.sh` remain in the repo but Railway is no longer the primary target.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | PostgreSQL + pgvector |
| Object storage | Cloudflare R2 |
| Embeddings | OpenRouter → `openai/text-embedding-3-small` |
| Auth (human) | Clerk v7 (optional) |
| Auth (agent) | SHA-256 hashed API keys |

---

## Roadmap

### v1.1
- [ ] Streaming search results
- [ ] Re-ranking with cross-encoder
- [x] pgvector migration
- [x] `DELETE /v1/memory/:id`
- [ ] Billing for agent API (Pro tier)

### v1.2
- [ ] Knowledge graph API (nodes + edges)
- [ ] Multi-modal embeddings (images)
- [ ] Agent CLI (`npx filevault`)
- [ ] Go and Rust SDKs

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests: `npm test`
4. Lint: `npm run lint`
5. Open a PR with a clear description

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <img src="./public/logo.png" width="48" alt="FileVault" /><br/>
  Built with <a href="https://nextjs.org">Next.js</a> · <a href="https://prisma.io">Prisma</a> · <a href="https://www.cloudflare.com/developer-platform/r2/">Cloudflare R2</a> · <a href="https://openrouter.ai">OpenRouter</a>
</div>
