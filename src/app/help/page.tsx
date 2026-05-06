import Link from 'next/link'

const sections = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'What is FileVault?',
        a: 'FileVault is a storage API for AI agents. Each agent gets an isolated namespace with file storage, semantic search, and persistent memory — all accessible via a single REST API or TypeScript SDK.',
      },
      {
        q: 'How do I create an agent?',
        a: 'Send a POST request to /api/v1/agents with a name field. You\'ll receive a secret API key (fv_sk_...) once — store it immediately. All subsequent requests authenticate with this key via the Authorization: Bearer header.',
      },
      {
        q: 'How do I authenticate API requests?',
        a: 'Pass your agent key in every request header: Authorization: Bearer fv_sk_your_key_here. Requests without a valid key return 401 Unauthorized.',
      },
      {
        q: 'Is there a TypeScript SDK?',
        a: 'Yes. Import the FileVault class from the SDK, pass your API key, and get fully typed methods for every endpoint — upload, search, memory, collections, webhooks, and more. No raw fetch required.',
      },
    ],
  },
  {
    title: 'Files & storage',
    items: [
      {
        q: 'How do I upload a file?',
        a: 'POST to /api/v1/files with a multipart form containing the file field. Add index=true to automatically extract and embed the file content for semantic search. You can also attach arbitrary JSON metadata.',
      },
      {
        q: 'How do I upload multiple files at once?',
        a: 'POST to /api/v1/files/batch with up to 10 files in a files[] field. The response includes a result entry per file, with partial success (207) if some files fail.',
      },
      {
        q: 'What is the file size limit?',
        a: 'Each file can be up to 50 MB. Per-agent limits are 1,000 files and 1 GB total storage on the free tier.',
      },
      {
        q: 'How do I retrieve or delete a file?',
        a: 'GET /api/v1/files/:id returns metadata and a download URL. DELETE /api/v1/files/:id removes the file and all associated embeddings from storage.',
      },
      {
        q: 'What file types are supported?',
        a: 'All file types are stored. For indexing and semantic search, FileVault extracts text from HTML, plain text, PDF, and JSON files. Other types are stored and downloadable but not searchable.',
      },
    ],
  },
  {
    title: 'Semantic search',
    items: [
      {
        q: 'How does indexing work?',
        a: 'When you upload with index=true (or call POST /api/v1/files/:id/index later), FileVault extracts text from the file, splits it into chunks, generates embeddings via OpenRouter, and stores them in a pgvector index.',
      },
      {
        q: 'How do I run a semantic search?',
        a: 'POST to /api/v1/search with a query string. FileVault embeds your query and returns the most similar chunks ranked by cosine similarity. Filter by file_id, collection_id, metadata fields, or include shared agent content with include_shared=true.',
      },
      {
        q: 'How do I search only within a specific file or collection?',
        a: 'Pass file_id or collection_id in the search request body to scope results. You can combine filters — e.g. search within a collection while filtering by a metadata tag.',
      },
    ],
  },
  {
    title: 'Memory',
    items: [
      {
        q: 'What is agent memory?',
        a: 'Memory lets your agent store arbitrary text snippets with an embedding attached — conversation turns, extracted facts, decisions, or any knowledge it wants to recall later. Each memory can optionally expire.',
      },
      {
        q: 'How do I store and retrieve memories?',
        a: 'POST to /api/v1/memory with a content string (and optional expiresAt). GET /api/v1/memory returns a paginated list. Memories are also included in semantic search results — use type=memory in the search request to search only memories.',
      },
      {
        q: 'How many memories can an agent have?',
        a: 'Up to 5,000 active memories on the free tier. Expired memories don\'t count toward the limit.',
      },
    ],
  },
  {
    title: 'Collections & sharing',
    items: [
      {
        q: 'What are collections?',
        a: 'Collections are named groups of files within your agent\'s namespace. Use them to organise files by project, topic, or workflow — and to scope searches to a specific subset of your storage.',
      },
      {
        q: 'How do I share data between agents?',
        a: 'POST to /api/v1/shares with another agent\'s agent_id to grant it read access to your files and embeddings. The grantee can then include your content in searches using include_shared=true.',
      },
    ],
  },
  {
    title: 'Webhooks',
    items: [
      {
        q: 'What events fire webhooks?',
        a: 'FileVault fires a webhook on file.created after every successful upload. The payload includes file_id, name, size_bytes, and is_indexed.',
      },
      {
        q: 'How do I register a webhook?',
        a: 'PUT to /api/v1/webhooks with a url field. FileVault will POST events to that URL as they happen. Use DELETE /api/v1/webhooks to remove it.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        q: 'I\'m getting 401 Unauthorized.',
        a: 'Check that your Authorization header is exactly: Bearer fv_sk_your_key. The key is shown only once at agent creation — if you lost it, create a new agent.',
      },
      {
        q: 'My file uploaded but search returns no results.',
        a: 'The file must be indexed first. Either upload with index=true, or call POST /api/v1/files/:id/index after the fact. Check the index_status field on the file — it will be pending, indexed, or failed.',
      },
      {
        q: 'I\'m hitting rate limits.',
        a: 'The free tier allows 20 uploads per minute per agent. If you hit the limit, the API returns 429 with a Retry-After header. Batch uploads (/api/v1/files/batch) count as one request for up to 10 files.',
      },
      {
        q: 'How do I check my current usage?',
        a: 'GET /api/v1/usage returns your current file count, indexed file count, storage bytes used, and memory count — all in a single call.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">
          Documentation
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Help &amp; FAQ</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Everything you need to build with the FileVault Agent API.
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

      {/* Quick start snippet */}
      <div className="mb-14 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-mono text-[var(--muted-foreground)] mb-3 uppercase tracking-widest">Quick start</p>
        <pre className="text-xs font-mono text-[var(--foreground)] overflow-x-auto leading-relaxed whitespace-pre">{`# 1. Create an agent
curl -X POST https://filevault.host/api/v1/agents \\
  -H "Content-Type: application/json" \\
  -d '{"name":"my-agent"}'

# 2. Upload a file (with semantic indexing)
curl -X POST https://filevault.host/api/v1/files \\
  -H "Authorization: Bearer fv_sk_..." \\
  -F "file=@report.pdf" \\
  -F "index=true"

# 3. Search
curl -X POST https://filevault.host/api/v1/search \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"query":"quarterly revenue"}'`}</pre>
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
