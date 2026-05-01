import type { StorageDriver } from './types'
import { localDriver } from './local'

export const storageDriver: StorageDriver = localDriver
export type { StorageDriver, FileEntry } from './types'
