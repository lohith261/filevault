import { describe, it, expect } from 'vitest'
import { chunkText } from '@/lib/chunking'

describe('chunkText', () => {
  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(chunkText('   \n\t  ')).toEqual([])
  })

  it('returns single chunk when text is shorter than chunkSize', () => {
    const words = Array.from({ length: 10 }, (_, i) => `word${i}`).join(' ')
    expect(chunkText(words, 500)).toHaveLength(1)
  })

  it('splits into multiple chunks when text exceeds chunkSize', () => {
    const words = Array.from({ length: 1100 }, (_, i) => `word${i}`).join(' ')
    const chunks = chunkText(words, 500, 100)
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('each chunk has at most chunkSize words', () => {
    const words = Array.from({ length: 2000 }, (_, i) => `word${i}`).join(' ')
    const chunks = chunkText(words, 500, 100)
    for (const chunk of chunks) {
      expect(chunk.split(' ').length).toBeLessThanOrEqual(500)
    }
  })

  it('adjacent chunks share overlap words', () => {
    const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(' ')
    const chunks = chunkText(words, 500, 100)
    expect(chunks).toHaveLength(2)
    const tail = chunks[0].split(' ').slice(-100)
    const head = chunks[1].split(' ').slice(0, 100)
    expect(tail).toEqual(head)
  })

  it('last chunk contains the final words', () => {
    const words = Array.from({ length: 650 }, (_, i) => `word${i}`).join(' ')
    const chunks = chunkText(words, 500, 100)
    const last = chunks[chunks.length - 1]
    expect(last).toContain('word649')
  })
})
