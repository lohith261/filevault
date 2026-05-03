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

function extractHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function extractPdf(buffer: Buffer): Promise<string | null> {
  try {
    // pdf-parse is optional; skip if unavailable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
    const data = await pdfParse(buffer)
    return data.text?.trim() || null
  } catch {
    return null
  }
}
