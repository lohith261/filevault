import OpenAI from 'openai'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _client
}

// openai/text-embedding-3-small via OpenRouter: 1536 dims, cheap, fast
export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await getClient().embeddings.create({
    model: 'openai/text-embedding-3-small',
    input: text.slice(0, 8000),
  })
  return res.data[0].embedding
}
