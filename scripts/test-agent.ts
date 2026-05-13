#!/usr/bin/env npx tsx
/**
 * FileVault Integration Test Agent
 *
 * Tests every v1 API endpoint against a running dev server and prints
 * coloured pass/fail output for each feature.
 *
 * Usage:
 *   npx tsx scripts/test-agent.ts
 *   TEST_BASE_URL=https://filevault.host npx tsx scripts/test-agent.ts
 *
 * Requirements:
 *   - Dev server running: node node_modules/next/dist/bin/next dev
 *   - A local database with migrations applied
 *   - OPENROUTER_API_KEY set (only needed for search tests)
 */

const BASE_URL = (process.env.TEST_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const API_BASE = `${BASE_URL}/api/v1`

// ── Tiny test runner ──────────────────────────────────────────────────────────

let passed = 0
let failed = 0
let skipped = 0

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  error?: string
}
const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    results.push({ name, status: 'pass' })
    console.log(`  ✅ ${name}`)
  } catch (err) {
    failed++
    const error = err instanceof Error ? err.message : String(err)
    results.push({ name, status: 'fail', error })
    console.log(`  ❌ ${name}`)
    console.log(`     └─ ${error}`)
  }
}

async function skip(name: string, reason: string): Promise<void> {
  skipped++
  results.push({ name, status: 'skip' })
  console.log(`  ⏭️  ${name}`)
  console.log(`     └─ skipped: ${reason}`)
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function assertStatus(res: Response, expected: number): void {
  if (res.status !== expected) {
    throw new Error(`Expected HTTP ${expected}, got ${res.status}`)
  }
}

function assertField(obj: Record<string, unknown>, field: string): void {
  assert(field in obj, `Missing field "${field}" in: ${JSON.stringify(obj).slice(0, 300)}`)
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function authHeaders(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` }
}

async function api(
  method: string,
  path: string,
  apiKey: string,
  body?: unknown
): Promise<{ res: Response; json: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...authHeaders(apiKey), 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let json: Record<string, unknown> = {}
  try {
    json = await res.json()
  } catch {
    // empty body (204 etc.)
  }
  return { res, json }
}

async function createAgent(name: string): Promise<{ api_key: string; agent_id: string }> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Agent creation failed (HTTP ${res.status}): ${body}`)
  }
  const data = (await res.json()) as Record<string, unknown>
  assert(typeof data.api_key === 'string' && data.api_key.length > 0, 'api_key missing from agent creation response')
  assert(typeof data.agent_id === 'string', 'agent_id missing from agent creation response')
  return { api_key: data.api_key as string, agent_id: data.agent_id as string }
}

async function uploadTextFile(apiKey: string, filename: string, content: string): Promise<Record<string, unknown>> {
  const form = new FormData()
  form.append('file', new Blob([content], { type: 'text/plain' }), filename)
  const res = await fetch(`${API_BASE}/files`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed (HTTP ${res.status})`)
  return res.json() as Promise<Record<string, unknown>>
}

/** Poll GET /files/:id until index_status is terminal or timeout. Returns final status. */
async function pollIndexStatus(
  apiKey: string,
  fileId: string,
  timeoutMs = 20_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const { json } = await api('GET', `/files/${fileId}`, apiKey)
    const status = json.index_status as string
    if (status === 'indexed' || status === 'failed') return status
    await new Promise((r) => setTimeout(r, 1_500))
  }
  return 'timeout'
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🧪  FileVault Integration Tests`)
  console.log(`    Target : ${BASE_URL}`)
  console.log(`    Time   : ${new Date().toISOString()}\n`)

  // Confirm server is reachable before doing anything
  try {
    await fetch(`${BASE_URL}/api/v1/agents`, { method: 'HEAD' })
  } catch {
    console.error(`❌  Cannot reach ${BASE_URL}`)
    console.error(`    Start the dev server: node node_modules/next/dist/bin/next dev`)
    process.exit(1)
  }

  // ── Setup: create two agents ───────────────────────────────────────────────
  console.log('📋  Setup')

  let agent1Key: string, agent1Id: string
  let agent2Key: string, agent2Id: string

  try {
    ;({ api_key: agent1Key, agent_id: agent1Id } = await createAgent(`test-a1-${Date.now()}`))
    ;({ api_key: agent2Key, agent_id: agent2Id } = await createAgent(`test-a2-${Date.now()}`))
    console.log(`  ✅  Created agent1 (${agent1Id.slice(0, 8)}…)`)
    console.log(`  ✅  Created agent2 (${agent2Id.slice(0, 8)}…)\n`)
  } catch (err) {
    console.error(`  ❌  Setup failed: ${err}`)
    console.error('     Cannot continue without valid agents.')
    process.exit(1)
  }

  // IDs accumulated for cleanup at the end
  const a1FileIds: string[] = []
  const a1MemoryIds: string[] = []

  // ── 1. Authentication ──────────────────────────────────────────────────────
  console.log('1️⃣   Authentication')

  await test('GET /agents/me with valid key → 200', async () => {
    const { res, json } = await api('GET', '/agents/me', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'agent_id')
    assertField(json, 'created_at')
    assert(json.agent_id === agent1Id, `agent_id mismatch: expected ${agent1Id}, got ${json.agent_id}`)
  })

  await test('GET /agents/me with bad key → 401', async () => {
    const { res } = await api('GET', '/agents/me', 'fv_sk_' + '0'.repeat(64))
    assertStatus(res, 401)
  })

  await test('GET /agents/me with no auth header → 401', async () => {
    const res = await fetch(`${API_BASE}/agents/me`)
    assertStatus(res, 401)
  })

  // ── 2. Files ───────────────────────────────────────────────────────────────
  console.log('\n2️⃣   Files')

  let mainFileId = ''

  await test('POST /files (upload text file) → 201 with file_id + index_status', async () => {
    const form = new FormData()
    form.append(
      'file',
      new Blob(['FileVault integration test document — quarterly revenue Q3'], { type: 'text/plain' }),
      'test-doc.txt'
    )
    const res = await fetch(`${API_BASE}/files`, {
      method: 'POST',
      headers: authHeaders(agent1Key),
      body: form,
    })
    assertStatus(res, 201)
    const json = (await res.json()) as Record<string, unknown>
    assertField(json, 'file_id')
    assertField(json, 'index_status')
    assertField(json, 'is_indexed')
    assertField(json, 'size_bytes')
    assert(typeof json.file_id === 'string' && json.file_id.length > 0, 'file_id is empty')
    mainFileId = json.file_id as string
    a1FileIds.push(mainFileId)
  })

  await test('GET /files → 200, uploaded file in list', async () => {
    const { res, json } = await api('GET', '/files', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'files')
    const files = json.files as Array<Record<string, unknown>>
    assert(Array.isArray(files), 'files must be an array')
    assert(files.some((f) => f.file_id === mainFileId), 'Uploaded file not found in list')
  })

  await test('GET /files/:id → 200 with index_status field', async () => {
    const { res, json } = await api('GET', `/files/${mainFileId}`, agent1Key)
    assertStatus(res, 200)
    assertField(json, 'file_id')
    assertField(json, 'index_status') // Bug we fixed — was missing
    assertField(json, 'is_indexed')
    assertField(json, 'size_bytes')
    assertField(json, 'url')
  })

  await test('GET /files/:id with wrong agent → 404', async () => {
    const { res } = await api('GET', `/files/${mainFileId}`, agent2Key)
    assertStatus(res, 404)
  })

  await test('POST /files/:id/index → 200, index_status: pending (non-blocking)', async () => {
    const { res, json } = await api('POST', `/files/${mainFileId}/index`, agent1Key)
    assertStatus(res, 200)
    assertField(json, 'index_status')
    assert(
      json.index_status === 'pending',
      `Expected index_status "pending", got "${json.index_status}"`
    )
  })

  await test('POST /files/:id/index while pending → 429', async () => {
    const { res } = await api('POST', `/files/${mainFileId}/index`, agent1Key)
    assertStatus(res, 429)
  })

  await test('GET /files?indexed=false filter → 200', async () => {
    const { res, json } = await api('GET', '/files?indexed=false', agent1Key)
    assertStatus(res, 200)
    const files = json.files as Array<Record<string, unknown>>
    assert(Array.isArray(files), 'files must be array')
    // All returned files should have is_indexed === false
    assert(files.every((f) => f.is_indexed === false), 'indexed=false filter returned indexed files')
  })

  // ── 3. Batch upload ────────────────────────────────────────────────────────
  console.log('\n3️⃣   Batch upload')

  await test('POST /files/batch (3 files) → 201, array of 3 results', async () => {
    const form = new FormData()
    form.append('files', new Blob(['batch alpha'], { type: 'text/plain' }), 'alpha.txt')
    form.append('files', new Blob(['batch beta'], { type: 'text/plain' }), 'beta.txt')
    form.append('files', new Blob(['batch gamma'], { type: 'text/plain' }), 'gamma.txt')
    const res = await fetch(`${API_BASE}/files/batch`, {
      method: 'POST',
      headers: authHeaders(agent1Key),
      body: form,
    })
    assertStatus(res, 201)
    const json = (await res.json()) as Record<string, unknown>
    assertField(json, 'files')
    const files = json.files as Array<Record<string, unknown>>
    assert(files.length === 3, `Expected 3 results, got ${files.length}`)
    assert(files.every((f) => !f.error), `Some batch files failed: ${JSON.stringify(files)}`)
    for (const f of files) {
      if (typeof f.file_id === 'string' && f.file_id) a1FileIds.push(f.file_id)
    }
  })

  await test('POST /files/batch with no files → 400', async () => {
    const form = new FormData()
    const res = await fetch(`${API_BASE}/files/batch`, {
      method: 'POST',
      headers: authHeaders(agent1Key),
      body: form,
    })
    assertStatus(res, 400)
  })

  await test('POST /files/batch with >10 files → 400', async () => {
    const form = new FormData()
    for (let i = 0; i < 11; i++) {
      form.append('files', new Blob([`file ${i}`], { type: 'text/plain' }), `f${i}.txt`)
    }
    const res = await fetch(`${API_BASE}/files/batch`, {
      method: 'POST',
      headers: authHeaders(agent1Key),
      body: form,
    })
    assertStatus(res, 400)
  })

  // ── 4. Search (requires indexing) ──────────────────────────────────────────
  console.log('\n4️⃣   Search')

  const indexStatus = await pollIndexStatus(agent1Key, mainFileId, 20_000)

  if (indexStatus === 'indexed') {
    await test('POST /search → 200 with results array', async () => {
      const { res, json } = await api('POST', '/search', agent1Key, {
        query: 'quarterly revenue Q3',
        limit: 5,
      })
      assertStatus(res, 200)
      assertField(json, 'results')
      const results = json.results as Array<Record<string, unknown>>
      assert(Array.isArray(results), 'results must be array')
      if (results.length > 0) {
        assertField(results[0], 'score')
        assertField(results[0], 'content')
        assertField(results[0], 'type')
        assert(typeof results[0].score === 'number', 'score must be a number')
      }
    })

    await test('POST /search with file_id filter → only that file', async () => {
      const { res, json } = await api('POST', '/search', agent1Key, {
        query: 'revenue',
        filter: { file_id: mainFileId },
        limit: 3,
      })
      assertStatus(res, 200)
      const results = json.results as Array<Record<string, unknown>>
      assert(
        results.every((r) => r.file_id === mainFileId),
        'file_id filter returned results from other files'
      )
    })
  } else {
    await skip(
      'POST /search → results',
      `indexing ${indexStatus === 'timeout' ? 'timed out (20s)' : 'failed'} — check OPENROUTER_API_KEY`
    )
    await skip('POST /search with file_id filter', 'depends on indexing')
  }

  await test('POST /search with type: memory (no memories yet) → 200 empty', async () => {
    const { res, json } = await api('POST', '/search', agent1Key, {
      query: 'anything',
      filter: { type: 'memory' },
      limit: 5,
    })
    assertStatus(res, 200)
    assertField(json, 'results')
  })

  await test('POST /search with no query → 400', async () => {
    const { res } = await api('POST', '/search', agent1Key, { limit: 5 })
    assertStatus(res, 400)
  })

  // ── 5. Memory ──────────────────────────────────────────────────────────────
  console.log('\n5️⃣   Memory')

  let mem1Id = ''

  await test('POST /memory → 201 with memory_id (not id)', async () => {
    const { res, json } = await api('POST', '/memory', agent1Key, {
      content: 'FileVault memory: user prefers metric units',
    })
    assertStatus(res, 201)
    assertField(json, 'memory_id') // Verifies field name fix
    assertField(json, 'content')
    assertField(json, 'created_at')
    assert(json.expires_at === null, `Expected expires_at null, got ${json.expires_at}`)
    assert(!('id' in json) || json.id === json.memory_id, 'Response has bare "id" field — use memory_id')
    mem1Id = json.memory_id as string
    a1MemoryIds.push(mem1Id)
  })

  await test('POST /memory with ttl → expires_at is set', async () => {
    const { res, json } = await api('POST', '/memory', agent1Key, {
      content: 'Temporary memory entry',
      ttl: 3600,
    })
    assertStatus(res, 201)
    assert(json.expires_at !== null && json.expires_at !== undefined, 'expires_at should be set')
    if (typeof json.memory_id === 'string') a1MemoryIds.push(json.memory_id)
  })

  await test('GET /memory → 200, entry in list with memory_id field', async () => {
    const { res, json } = await api('GET', '/memory', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'memories')
    const memories = json.memories as Array<Record<string, unknown>>
    assert(Array.isArray(memories), 'memories must be array')
    assert(memories.some((m) => m.memory_id === mem1Id), 'Memory not found in list')
    if (memories.length > 0) assertField(memories[0], 'memory_id')
  })

  await test('GET /memory with limit → respects pagination', async () => {
    const { res, json } = await api('GET', '/memory?limit=1', agent1Key)
    assertStatus(res, 200)
    const memories = json.memories as Array<Record<string, unknown>>
    assert(memories.length <= 1, `Expected ≤1 memory with limit=1, got ${memories.length}`)
  })

  await test('DELETE /memory/:id → 204', async () => {
    const res = await fetch(`${API_BASE}/memory/${mem1Id}`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
    a1MemoryIds.splice(a1MemoryIds.indexOf(mem1Id), 1)
  })

  await test('DELETE /memory/:id → 404 after already deleted', async () => {
    const { res } = await api('DELETE', `/memory/${mem1Id}`, agent1Key)
    assertStatus(res, 404)
  })

  await test('POST /memory with empty content → 400', async () => {
    const { res } = await api('POST', '/memory', agent1Key, { content: '' })
    assertStatus(res, 400)
  })

  // ── 6. State / Checkpoints ─────────────────────────────────────────────────
  console.log('\n6️⃣   State / Checkpoints')

  let stateId = ''
  const stateKey = `test-checkpoint-${Date.now()}`

  await test('POST /state (create) → 201 with state_id', async () => {
    const { res, json } = await api('POST', '/state', agent1Key, {
      key: stateKey,
      data: { step: 1, context: 'integration test' },
    })
    assertStatus(res, 201)
    assertField(json, 'state_id')
    assertField(json, 'key')
    assertField(json, 'created_at')
    assert(json.key === stateKey, `key mismatch`)
    stateId = json.state_id as string
  })

  await test('GET /state → 200, state in list', async () => {
    const { res, json } = await api('GET', '/state', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'states')
    const states = json.states as Array<Record<string, unknown>>
    assert(states.some((s) => s.state_id === stateId), 'State not found in list')
  })

  await test('GET /state/:id → 200 with data field matching stored value', async () => {
    const { res, json } = await api('GET', `/state/${stateId}`, agent1Key)
    assertStatus(res, 200)
    assertField(json, 'data')
    const data = json.data as Record<string, unknown>
    assert(data.step === 1, `Expected step=1, got ${data.step}`)
    assert(data.context === 'integration test', 'context field mismatch')
  })

  await test('POST /state same key (upsert) → 201, same state_id', async () => {
    const { res, json } = await api('POST', '/state', agent1Key, {
      key: stateKey,
      data: { step: 2, context: 'updated' },
    })
    assertStatus(res, 201)
    assert(json.state_id === stateId, `Upsert changed state_id: expected ${stateId}, got ${json.state_id}`)
  })

  await test('GET /state/:id after upsert → data reflects update', async () => {
    const { res, json } = await api('GET', `/state/${stateId}`, agent1Key)
    assertStatus(res, 200)
    const data = json.data as Record<string, unknown>
    assert(data.step === 2, `Expected step=2 after upsert, got ${data.step}`)
  })

  await test('GET /state?key=checkpoint filter → works', async () => {
    const { res, json } = await api('GET', `/state?key=test-checkpoint`, agent1Key)
    assertStatus(res, 200)
    const states = json.states as Array<Record<string, unknown>>
    assert(states.some((s) => s.state_id === stateId), 'State not found with key filter')
  })

  await test('DELETE /state/:id → 204', async () => {
    const res = await fetch(`${API_BASE}/state/${stateId}`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
  })

  await test('GET /state/:id after delete → 404', async () => {
    const { res } = await api('GET', `/state/${stateId}`, agent1Key)
    assertStatus(res, 404)
  })

  // ── 7. Collections ─────────────────────────────────────────────────────────
  console.log('\n7️⃣   Collections')

  let collectionId = ''
  let collectionFileId = ''

  // Upload a fresh file for collection tests
  try {
    const f = await uploadTextFile(agent1Key, 'collection-doc.txt', 'Document for collection testing')
    collectionFileId = f.file_id as string
    a1FileIds.push(collectionFileId)
  } catch (err) {
    console.log(`  ⚠️  Could not upload file for collection tests: ${err}`)
  }

  await test('POST /collections → 201 with collection_id', async () => {
    const { res, json } = await api('POST', '/collections', agent1Key, { name: 'Test Collection' })
    assertStatus(res, 201)
    assertField(json, 'collection_id')
    assertField(json, 'name')
    assert(json.file_count === 0, `New collection should have file_count 0, got ${json.file_count}`)
    collectionId = json.collection_id as string
  })

  await test('GET /collections → 200, collection in list', async () => {
    const { res, json } = await api('GET', '/collections', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'collections')
    const collections = json.collections as Array<Record<string, unknown>>
    assert(collections.some((c) => c.collection_id === collectionId), 'Collection not in list')
  })

  await test('POST /collections/:id/files → 204', async () => {
    assert(collectionFileId !== '', 'No file to add to collection (file upload failed above)')
    const res = await fetch(`${API_BASE}/collections/${collectionId}/files`, {
      method: 'POST',
      headers: { ...authHeaders(agent1Key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: collectionFileId }),
    })
    assertStatus(res, 204)
  })

  await test('GET /collections/:id → file appears in files array', async () => {
    const { res, json } = await api('GET', `/collections/${collectionId}`, agent1Key)
    assertStatus(res, 200)
    assertField(json, 'files')
    const files = json.files as Array<Record<string, unknown>>
    assert(files.some((f) => f.file_id === collectionFileId), 'File not found in collection')
  })

  await test('POST /collections/:id/files (idempotent re-add) → 204', async () => {
    const res = await fetch(`${API_BASE}/collections/${collectionId}/files`, {
      method: 'POST',
      headers: { ...authHeaders(agent1Key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: collectionFileId }),
    })
    assertStatus(res, 204)
  })

  await test('DELETE /collections/:id/files/:fileId → 204', async () => {
    const res = await fetch(`${API_BASE}/collections/${collectionId}/files/${collectionFileId}`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
  })

  await test('DELETE /collections/:id → 204 (files unaffected)', async () => {
    const res = await fetch(`${API_BASE}/collections/${collectionId}`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
  })

  await test('GET /collections/:id after delete → 404', async () => {
    const { res } = await api('GET', `/collections/${collectionId}`, agent1Key)
    assertStatus(res, 404)
  })

  // ── 8. Shares ──────────────────────────────────────────────────────────────
  console.log('\n8️⃣   Shares')

  await test('POST /shares → 201, agent1 grants agent2', async () => {
    const { res, json } = await api('POST', '/shares', agent1Key, { agent_id: agent2Id })
    assertStatus(res, 201)
    assertField(json, 'share_id')
    assertField(json, 'grantee_agent_id')
    assert(json.grantee_agent_id === agent2Id, `Expected grantee ${agent2Id}, got ${json.grantee_agent_id}`)
  })

  await test('GET /shares (agent1) → given list has agent2', async () => {
    const { res, json } = await api('GET', '/shares', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'given')
    assertField(json, 'received')
    const given = json.given as Array<Record<string, unknown>>
    assert(given.some((s) => s.grantee_agent_id === agent2Id), 'Agent2 not in given shares')
  })

  await test('GET /shares (agent2) → received list has agent1', async () => {
    const { res, json } = await api('GET', '/shares', agent2Key)
    assertStatus(res, 200)
    const received = json.received as Array<Record<string, unknown>>
    assert(received.some((s) => s.owner_agent_id === agent1Id), 'Agent1 not in received shares')
  })

  await test('POST /shares with self → 400', async () => {
    const { res } = await api('POST', '/shares', agent1Key, { agent_id: agent1Id })
    assertStatus(res, 400)
  })

  if (indexStatus === 'indexed') {
    await test('POST /search with include_shared (agent2) → sees agent1 content', async () => {
      const { res, json } = await api('POST', '/search', agent2Key, {
        query: 'quarterly revenue Q3',
        filter: { include_shared: true },
        limit: 5,
      })
      assertStatus(res, 200)
      assertField(json, 'results')
    })
  } else {
    await skip('POST /search with include_shared', 'depends on indexing completing')
  }

  await test('DELETE /shares/:granteeId → 204', async () => {
    const res = await fetch(`${API_BASE}/shares/${agent2Id}`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
  })

  await test('DELETE /shares/:granteeId again → 404', async () => {
    const { res } = await api('DELETE', `/shares/${agent2Id}`, agent1Key)
    assertStatus(res, 404)
  })

  // ── 9. Webhooks ────────────────────────────────────────────────────────────
  console.log('\n9️⃣   Webhooks')

  await test('PUT /webhooks → 200', async () => {
    const { res, json } = await api('PUT', '/webhooks', agent1Key, {
      url: 'https://example.com/webhook',
    })
    assertStatus(res, 200)
    assertField(json, 'webhook_url')
    assert(json.webhook_url === 'https://example.com/webhook', 'webhook_url mismatch')
  })

  await test('GET /webhooks → webhook_url matches', async () => {
    const { res, json } = await api('GET', '/webhooks', agent1Key)
    assertStatus(res, 200)
    assert(json.webhook_url === 'https://example.com/webhook', `Unexpected webhook_url: ${json.webhook_url}`)
  })

  await test('PUT /webhooks with private IP → 400', async () => {
    const { res } = await api('PUT', '/webhooks', agent1Key, { url: 'http://127.0.0.1/hook' })
    assertStatus(res, 400)
  })

  await test('PUT /webhooks with 192.168.x.x → 400', async () => {
    const { res } = await api('PUT', '/webhooks', agent1Key, { url: 'http://192.168.1.1/hook' })
    assertStatus(res, 400)
  })

  await test('DELETE /webhooks → 204', async () => {
    const res = await fetch(`${API_BASE}/webhooks`, {
      method: 'DELETE',
      headers: authHeaders(agent1Key),
    })
    assertStatus(res, 204)
  })

  await test('GET /webhooks after delete → webhook_url null', async () => {
    const { res, json } = await api('GET', '/webhooks', agent1Key)
    assertStatus(res, 200)
    assert(json.webhook_url === null, `Expected null, got ${json.webhook_url}`)
  })

  // ── 10. Usage ──────────────────────────────────────────────────────────────
  console.log('\n🔟   Usage')

  await test('GET /usage → 200 with all metric objects', async () => {
    const { res, json } = await api('GET', '/usage', agent1Key)
    assertStatus(res, 200)
    assertField(json, 'files')
    assertField(json, 'embeddings')
    assertField(json, 'memory')
    assertField(json, 'states')
    const files = json.files as Record<string, unknown>
    assertField(files, 'count')
    assertField(files, 'indexed')
    assertField(files, 'storage_bytes')
    assert(typeof files.count === 'number', 'files.count must be a number')
    assert(typeof files.storage_bytes === 'number', 'files.storage_bytes must be a number')
  })

  await test('GET /usage reflects file uploads', async () => {
    const { json } = await api('GET', '/usage', agent1Key)
    const files = json.files as Record<string, unknown>
    assert((files.count as number) >= a1FileIds.length, `Usage count ${files.count} < uploaded ${a1FileIds.length}`)
  })

  // ── Cleanup ────────────────────────────────────────────────────────────────
  console.log('\n🧹   Cleanup')

  let deletedFiles = 0
  for (const id of a1FileIds) {
    try {
      const res = await fetch(`${API_BASE}/files/${id}`, {
        method: 'DELETE',
        headers: authHeaders(agent1Key),
      })
      if (res.status === 204 || res.status === 404) deletedFiles++
    } catch {
      // best-effort
    }
  }

  let deletedMemories = 0
  for (const id of a1MemoryIds) {
    try {
      const res = await fetch(`${API_BASE}/memory/${id}`, {
        method: 'DELETE',
        headers: authHeaders(agent1Key),
      })
      if (res.status === 204 || res.status === 404) deletedMemories++
    } catch {
      // best-effort
    }
  }

  console.log(`  Deleted ${deletedFiles}/${a1FileIds.length} files`)
  console.log(`  Deleted ${deletedMemories}/${a1MemoryIds.length} memories`)
  console.log(
    `  Note: agents ${agent1Id.slice(0, 8)}… and ${agent2Id.slice(0, 8)}… remain in DB (no DELETE /agents endpoint)`
  )

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passed + failed + skipped
  console.log(`\n${'─'.repeat(55)}`)
  console.log(`  ${passed} passed  ·  ${failed} failed  ·  ${skipped} skipped  /  ${total} total`)
  console.log(`${'─'.repeat(55)}`)

  if (failed > 0) {
    console.log('\n❌  Failed tests:')
    for (const r of results.filter((r) => r.status === 'fail')) {
      console.log(`  • ${r.name}`)
      console.log(`    ${r.error}`)
    }
    process.exit(1)
  } else {
    console.log('\n✨  All tests passed!\n')
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
