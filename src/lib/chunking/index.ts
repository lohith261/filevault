const CHUNK_WORDS = 500
const OVERLAP_WORDS = 100

// Splits text into overlapping word-count windows.
// Overlap ensures that context spanning a chunk boundary is preserved.
export function chunkText(
  text: string,
  chunkSize = CHUNK_WORDS,
  overlap = OVERLAP_WORDS
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const chunks: string[] = []
  let i = 0
  while (i < words.length) {
    const slice = words.slice(i, i + chunkSize)
    chunks.push(slice.join(' '))
    if (i + chunkSize >= words.length) break
    i += chunkSize - overlap
  }
  return chunks
}
