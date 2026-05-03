export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let magA = 0
  let magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

export interface SearchResult {
  id: string
  type: 'file' | 'memory'
  content: string
  score: number
  fileId?: string
  fileUrl?: string
}

export function rankResults(results: SearchResult[], topK = 5): SearchResult[] {
  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}
