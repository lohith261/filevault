import type { StorageDriver } from './types'

function getDriver(): StorageDriver {
  if (process.env.STORAGE_DRIVER === 'vercelblob') {
    const { vercelBlobDriver } = require('./vercelblob')
    return vercelBlobDriver
  }
  const { localDriver } = require('./local')
  return localDriver
}

export const storageDriver: StorageDriver = getDriver()
export type { StorageDriver, FileEntry } from './types'
