import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { Readable } from 'stream'
import type { FileEntry, StorageDriver } from './types'

// .trim() guards against trailing whitespace/newlines in stored env var
// values (e.g. pasted via a dashboard). Confirmed live in production: all
// five R2_* vars were stored with a trailing "\n" -- AWS SigV4 signing then
// embeds that raw newline into the request's Authorization header, which
// Node's HTTP client correctly rejects ("Invalid character in header
// content [\"authorization\"]"), so every R2 call failed outright.
function env(name: string): string {
  return (process.env[name] ?? '').trim()
}

function client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env('R2_ACCESS_KEY_ID'),
      secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    },
  })
}

function bucket(): string {
  return env('R2_BUCKET_NAME')
}

// Public CDN base URL, e.g. https://pub-xxx.r2.dev or https://cdn.filevault.host
function publicBase(): string {
  const u = env('R2_PUBLIC_URL')
  return u.endsWith('/') ? u.slice(0, -1) : u
}

export const r2Driver: StorageDriver = {
  // Uploads all files and returns a "prefix" that is the CDN URL base for this slug.
  // The upload route stores storageKey = prefix + '/' + file.path, which becomes
  // a full https:// URL — the serve route then 302-redirects to it.
  async putFiles(slug: string, files: FileEntry[]): Promise<string> {
    const c = client()
    await Promise.all(
      files.map((f) =>
        c.send(
          new PutObjectCommand({
            Bucket: bucket(),
            Key: `${slug}/${f.path}`,
            Body: f.buffer,
            ContentType: f.mimeType,
          })
        )
      )
    )
    return `${publicBase()}/${slug}`
  },

  // storageKey is a full CDN URL; strip the base to get the R2 object key.
  async getFileStream(storageKey: string): Promise<ReadableStream> {
    const key = storageKey.replace(`${publicBase()}/`, '')
    const res = await client().send(
      new GetObjectCommand({ Bucket: bucket(), Key: key })
    )
    const body = res.Body as Readable
    return Readable.toWeb(body) as ReadableStream
  },

  // prefix is either a full CDN URL (r2) or a local filesystem path.
  // List + batch-delete all objects sharing the prefix.
  async deletePrefix(prefix: string): Promise<void> {
    const base = publicBase()
    const folder = prefix.startsWith('https://')
      ? prefix.replace(`${base}/`, '') + '/'
      : prefix + '/'

    const c = client()
    let token: string | undefined
    do {
      const list = await c.send(
        new ListObjectsV2Command({
          Bucket: bucket(),
          Prefix: folder,
          ContinuationToken: token,
        })
      )
      if (list.Contents?.length) {
        await c.send(
          new DeleteObjectsCommand({
            Bucket: bucket(),
            Delete: { Objects: list.Contents.map((o) => ({ Key: o.Key! })) },
          })
        )
      }
      token = list.IsTruncated ? list.NextContinuationToken : undefined
    } while (token)
  },
}
