import type { StorageDriver } from './types'
import { localDriver } from './local'

function makeDriver(): StorageDriver {
  const driver = process.env.STORAGE_DRIVER ?? 'local'
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
