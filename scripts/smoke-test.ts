#!/usr/bin/env npx tsx
/**
 * Production smoke test.
 *
 * Exercises the exact path that was silently broken for months: upload a
 * file, index it, search for it, store a memory, search for that. Designed
 * to run on a schedule against the live site (see
 * .github/workflows/smoke-test.yml) so a regression here fails loudly --
 * a GitHub Actions workflow failure notification -- within hours instead
 * of being discovered by accident.
 *
 * Deliberately much narrower than scripts/test-agent.ts: this creates one
 * throwaway agent per run (there is no DELETE /v1/agents endpoint, so those
 * accumulate -- named "smoke-test-<timestamp>" so they're easy to filter/
 * identify in the dashboard) and cleans up everything else it creates.
 *
 * Usage: TEST_BASE_URL=https://filevault.host OPENROUTER_API_KEY=... npx tsx scripts/smoke-test.ts
 */

export {} // force module scope -- otherwise this collides with test-agent.ts's globals under tsc

const BASE_URL = (process.env.TEST_BASE_URL ?? 'https://filevault.host').replace(/\/$/, '')
const API_BASE = `${BASE_URL}/api/v1`

function fail(step: string, detail: string): never {
  console.error(`❌ FAILED at: ${step}`)
  console.error(`   ${detail}`)
  process.exit(1)
}

async function main() {
  console.log(`Smoke-testing ${BASE_URL}\n`)

  // 1. Create a throwaway agent
  const agentRes = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `smoke-test-${Date.now()}` }),
  })
  if (!agentRes.ok) fail('create agent', `HTTP ${agentRes.status}`)
  const agent = (await agentRes.json()) as { api_key: string; agent_id: string }
  const auth = { Authorization: `Bearer ${agent.api_key}` }
  console.log(`✅ created agent ${agent.agent_id}`)

  // 2. Upload + index a tiny file with a unique, greppable fact
  const marker = `SMOKE-${Date.now()}`
  const content = `This is an automated smoke test file. The marker for this run is ${marker}.`
  const form = new FormData()
  form.append('file', new Blob([content], { type: 'text/plain' }), 'smoke-test.txt')
  form.append('index', 'true')

  const uploadRes = await fetch(`${API_BASE}/files`, { method: 'POST', headers: auth, body: form })
  if (!uploadRes.ok) fail('upload file', `HTTP ${uploadRes.status}: ${await uploadRes.text()}`)
  const file = (await uploadRes.json()) as { file_id: string }
  console.log(`✅ uploaded file ${file.file_id}`)

  // 3. Poll for indexing to complete (up to 30s)
  let indexed = false
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const statusRes = await fetch(`${API_BASE}/files/${file.file_id}`, { headers: auth })
    if (!statusRes.ok) fail('poll index status', `HTTP ${statusRes.status}`)
    const status = (await statusRes.json()) as { index_status: string }
    if (status.index_status === 'indexed') {
      indexed = true
      break
    }
    if (status.index_status === 'failed') fail('indexing', 'index_status is "failed"')
  }
  if (!indexed) fail('indexing', 'did not reach "indexed" within 30s')
  console.log('✅ file indexed')

  // 4. Search for the marker and confirm the right file comes back
  const searchRes = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `What is the marker for this automated test run?`, limit: 3 }),
  })
  if (!searchRes.ok) fail('search', `HTTP ${searchRes.status}: ${await searchRes.text()}`)
  const searchJson = (await searchRes.json()) as { results: Array<{ content: string; file_id?: string }> }
  const found = searchJson.results.some((r) => r.content.includes(marker))
  if (!found) fail('search', `marker "${marker}" not found in results: ${JSON.stringify(searchJson.results)}`)
  console.log('✅ search found the file by semantic query')

  // 5. Store and search a memory
  const memRes = await fetch(`${API_BASE}/memory`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: `Smoke test memory marker ${marker}` }),
  })
  if (!memRes.ok) fail('store memory', `HTTP ${memRes.status}: ${await memRes.text()}`)
  const memory = (await memRes.json()) as { memory_id: string }
  console.log(`✅ stored memory ${memory.memory_id}`)

  const memSearchRes = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'smoke test memory marker', filter: { type: 'memory' }, limit: 3 }),
  })
  if (!memSearchRes.ok) fail('search memory', `HTTP ${memSearchRes.status}`)
  const memSearchJson = (await memSearchRes.json()) as { results: Array<{ content: string }> }
  const memFound = memSearchJson.results.some((r) => r.content.includes(marker))
  if (!memFound) fail('search memory', `marker not found in memory search results`)
  console.log('✅ memory search found the stored memory')

  // 6. Clean up what we can (file + memory; the agent itself has no delete endpoint)
  await fetch(`${API_BASE}/files/${file.file_id}`, { method: 'DELETE', headers: auth }).catch(() => {})
  await fetch(`${API_BASE}/memory/${memory.memory_id}`, { method: 'DELETE', headers: auth }).catch(() => {})

  console.log('\n✨ All smoke test checks passed.')
}

main().catch((err) => {
  console.error('\nFatal error running smoke test:', err)
  process.exit(1)
})
