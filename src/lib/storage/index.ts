import type { StorageDriver } from './types'
import { localDriver } from './local'

function makeDriver(): StorageDriver {
  // .trim() guards against trailing whitespace/newlines in the stored env
  // var value (e.g. pasted via a dashboard) silently failing the ===
  // check below and falling through to the local driver, which cannot
  // work on Vercel's read-only serverless filesystem. Confirmed live in
  // production: STORAGE_DRIVER was stored as "r2\n", not "r2".
  const driver = (process.env.STORAGE_DRIVER ?? 'local').trim()
  if (driver === 'r2') {
    // Loaded lazily so the AWS SDK is only imported when actually used
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { r2Driver } = require('./r2') as { r2Driver: StorageDriver }
    return r2Driver
  }
  return localDriver
}

export const storageDriver: StorageDriver = makeDriver()
export type { StorageDriver, FileEntry } from './types'
