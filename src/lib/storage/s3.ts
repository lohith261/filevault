import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import type { FileEntry, StorageDriver } from './types'

function getClient() {
  return new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = process.env.S3_BUCKET_NAME!

export const s3Driver: StorageDriver = {
  async putFiles(slug, files) {
    const client = getClient()
    const prefix = `sites/${slug}`

    await Promise.all(
      files.map((file) =>
        client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${prefix}/${file.path}`,
            Body: file.buffer,
            ContentType: file.mimeType,
          })
        )
      )
    )

    return prefix
  },

  async getFileStream(storageKey) {
    const client = getClient()
    const response = await client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: storageKey })
    )
    return response.Body as ReadableStream
  },

  async deletePrefix(prefix) {
    const client = getClient()
    let continuationToken: string | undefined

    do {
      const list = await client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        })
      )

      const keys = (list.Contents ?? []).map((o) => ({ Key: o.Key! }))
      if (keys.length > 0) {
        await client.send(
          new DeleteObjectsCommand({
            Bucket: BUCKET,
            Delete: { Objects: keys },
          })
        )
      }

      continuationToken = list.NextContinuationToken
    } while (continuationToken)
  },
}
