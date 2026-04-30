export interface UploadResponse {
  slug: string
  url: string
  expiresAt: string | null
  fileCount: number
  totalSizeBytes: number
}

export interface ErrorResponse {
  error: string
}

export interface FilesResponse {
  sites: SiteListItem[]
  total: number
  page: number
  pageSize: number
}

export interface SiteListItem {
  id: string
  slug: string
  label: string
  userId: string | null
  expiresAt: string | null
  createdAt: string
  totalSizeBytes: string
  entryFile: string
  viewCount: number
  passwordHash: string | null
}

export interface AnalyticsResponse {
  totalViews: number
  views24h: number
  views7d: number
}
