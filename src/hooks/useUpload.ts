'use client'

import { useReducer, useCallback } from 'react'

export interface UploadResult {
  slug: string
  url: string
  expiresAt: string | null
  fileCount: number
  totalSizeBytes: number
}

export interface UploadOptions {
  expiry: string
  password?: string
  label?: string
}

type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'processing' }
  | { status: 'success'; result: UploadResult }
  | { status: 'error'; message: string }

type Action =
  | { type: 'START' }
  | { type: 'PROGRESS'; progress: number }
  | { type: 'PROCESSING' }
  | { type: 'SUCCESS'; result: UploadResult }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

function reducer(state: UploadState, action: Action): UploadState {
  switch (action.type) {
    case 'START': return { status: 'uploading', progress: 0 }
    case 'PROGRESS': return { status: 'uploading', progress: action.progress }
    case 'PROCESSING': return { status: 'processing' }
    case 'SUCCESS': return { status: 'success', result: action.result }
    case 'ERROR': return { status: 'error', message: action.message }
    case 'RESET': return { status: 'idle' }
    default: return state
  }
}

export function useUpload() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' })

  const upload = useCallback((file: File, options: UploadOptions) => {
    dispatch({ type: 'START' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('expiry', options.expiry)
    if (options.password) formData.append('password', options.password)
    if (options.label) formData.append('label', options.label)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 90)
        dispatch({ type: 'PROGRESS', progress: pct })
      }
    })

    xhr.upload.addEventListener('load', () => {
      dispatch({ type: 'PROCESSING' })
    })

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          dispatch({ type: 'SUCCESS', result: data })
        } else {
          dispatch({ type: 'ERROR', message: data.error ?? 'Upload failed.' })
        }
      } catch {
        dispatch({ type: 'ERROR', message: 'Unexpected response from server.' })
      }
    })

    xhr.addEventListener('error', () => {
      dispatch({ type: 'ERROR', message: 'Network error. Please try again.' })
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, upload, reset }
}
