import type { StorageDriver } from './types'

function getDriver(): StorageDriver {
  if (process.env.STORAGE_DRIVER === 's3') {
    const { s3Driver } = require('./s3')
    return s3Driver
  }
  const { localDriver } = require('./local')
  return localDriver
}

export const storageDriver: StorageDriver = getDriver()
export type { StorageDriver, FileEntry } from './types'
