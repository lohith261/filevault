import { describe, it, expect } from 'vitest'
import { extractText } from '@/lib/extractors'

async function html(content: string) {
  return extractText(Buffer.from(content), 'text/html', 'test.html')
}

describe('extractText — HTML', () => {
  it('strips basic tags', async () => {
    expect(await html('<p>Hello world</p>')).toBe('Hello world')
  })

  it('removes <script> blocks entirely', async () => {
    const result = await html('<p>Keep</p><script>alert("bad")</script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('Keep')
  })

  it('removes <style> blocks entirely', async () => {
    const result = await html('<style>body{color:red}</style><p>Keep</p>')
    expect(result).not.toContain('color')
    expect(result).toContain('Keep')
  })

  it('removes HTML comments', async () => {
    expect(await html('<!-- secret -->visible')).toBe('visible')
  })

  it('strips DOCTYPE', async () => {
    const result = await html('<!DOCTYPE html><html><body>Hi</body></html>')
    expect(result).not.toContain('DOCTYPE')
    expect(result).toContain('Hi')
  })

  it('strips CDATA sections', async () => {
    const result = await html('<![CDATA[hidden]]><p>visible</p>')
    expect(result).not.toContain('CDATA')
    expect(result).not.toContain('hidden')
    expect(result).toContain('visible')
  })

  it('decodes named entities', async () => {
    expect(await html('AT&amp;T &lt;great&gt;')).toBe('AT&T <great>')
  })

  it('decodes numeric entities', async () => {
    expect(await html('&#65;&#66;&#67;')).toBe('ABC')
  })

  it('decodes hex entities', async () => {
    expect(await html('&#x41;&#x42;&#x43;')).toBe('ABC')
  })

  it('handles tags with > inside quoted attributes', async () => {
    const result = await html('<a href="a>b">link text</a>')
    expect(result).toContain('link text')
    expect(result).not.toContain('<a')
  })

  it('collapses extra whitespace', async () => {
    const result = await html('<p>one</p>   <p>two</p>')
    expect(result).toBe('one two')
  })
})

describe('extractText — plain text', () => {
  it('returns utf-8 content verbatim', async () => {
    const text = 'hello world\nnewline'
    expect(await extractText(Buffer.from(text), 'text/plain', 'a.txt')).toBe(text)
  })
})

describe('extractText — JSON', () => {
  it('pretty-prints valid JSON', async () => {
    const result = await extractText(Buffer.from('{"a":1}'), 'application/json', 'a.json')
    expect(result).toContain('"a"')
    expect(result).toContain('1')
  })

  it('returns raw string for invalid JSON', async () => {
    const raw = 'not json'
    expect(await extractText(Buffer.from(raw), 'application/json', 'a.json')).toBe(raw)
  })
})

describe('extractText — unsupported type', () => {
  it('returns null for binary files with no extractor', async () => {
    expect(await extractText(Buffer.from('\x00\x01\x02'), 'image/png', 'img.png')).toBeNull()
  })
})
