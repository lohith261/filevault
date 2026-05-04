import { describe, it, expect } from 'vitest'
import { cosineSimilarity, rankResults } from '@/lib/search/similarity'

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [1, 2, 3]
    expect(cosineSimilarity(v, v)).toBeCloseTo(1)
  })

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0)
  })

  it('returns -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1)
  })

  it('returns 0 for a zero vector', () => {
    expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0)
  })

  it('returns 0 for mismatched lengths instead of NaN', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2])).toBe(0)
  })

  it('is length-normalised — magnitude does not affect similarity', () => {
    const a = [1, 0]
    const b = [100, 0]
    expect(cosineSimilarity(a, b)).toBeCloseTo(1)
  })
})

describe('rankResults', () => {
  const results = [
    { id: 'a', type: 'file' as const, content: 'a', score: 0.5 },
    { id: 'b', type: 'file' as const, content: 'b', score: 0.9 },
    { id: 'c', type: 'memory' as const, content: 'c', score: 0.1 },
    { id: 'd', type: 'file' as const, content: 'd', score: 0.7 },
  ]

  it('returns results sorted descending by score', () => {
    const ranked = rankResults([...results], 10)
    expect(ranked.map((r) => r.id)).toEqual(['b', 'd', 'a', 'c'])
  })

  it('respects topK limit', () => {
    expect(rankResults([...results], 2)).toHaveLength(2)
  })

  it('returns top result when topK=1', () => {
    expect(rankResults([...results], 1)[0].id).toBe('b')
  })

  it('handles empty array', () => {
    expect(rankResults([], 5)).toEqual([])
  })
})
