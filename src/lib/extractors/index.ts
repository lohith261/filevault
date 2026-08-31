// Returns plain text from supported file types, or null if unextractable.
export async function extractText(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string | null> {
  const mime = mimeType.toLowerCase()
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  if (mime.includes('text/plain') || ext === 'txt' || ext === 'md') {
    return buffer.toString('utf-8')
  }

  if (mime.includes('text/html') || ext === 'html' || ext === 'htm') {
    return extractHtml(buffer.toString('utf-8'))
  }

  if (mime.includes('application/json') || ext === 'json') {
    try {
      return JSON.stringify(JSON.parse(buffer.toString('utf-8')), null, 2)
    } catch {
      return buffer.toString('utf-8')
    }
  }

  if (mime.includes('pdf') || ext === 'pdf') {
    return extractPdf(buffer)
  }

  return null
}

const HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', hellip: '…', copy: '©',
  reg: '®', trade: '™', euro: '€', pound: '£', yen: '¥',
}

function decodeEntities(s: string): string {
  return s
    .replace(/&([a-z]+);/gi, (_, name) => HTML_ENTITIES[name.toLowerCase()] ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
}

function extractHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<!(DOCTYPE|doctype)[^>]*>/g, '')
      .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      // Self-closing and regular tags — tolerate `>` inside quoted attributes
      .replace(/<[a-z/][^"'>]*(?:"[^"]*"[^"'>]*|'[^']*'[^"'>]*)*\/?>/gi, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  )
}

async function extractPdf(buffer: Buffer): Promise<string | null> {
  try {
    // pdf-parse v2: class-based API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PDFParse } = (await import('pdf-parse')) as any
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    return result.text?.trim() || null
  } catch {
    return null
  }
}
