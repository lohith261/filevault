import OpenAI from 'openai'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

// text-embedding-3-small: 1536 dims, cheap, fast — good for MVP
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await getClient().embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000), // hard cap to stay within token limits
  })
  return res.data[0].embedding
}
