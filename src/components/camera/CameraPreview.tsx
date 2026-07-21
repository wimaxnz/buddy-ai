import { useEffect, useState } from 'react'
import { cameraPreviewUrl, getStoredAuth } from '@/api/client'

export function CameraPreview({ enabled, fps = 3, large = false }: { enabled: boolean; fps?: number; large?: boolean }) {
  const [src, setSrc] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setSrc('')
      setError(false)
      return
    }
    let cancelled = false
    const interval = Math.max(250, Math.round(1000 / Math.max(1, fps)))
    const load = async () => {
      try {
        const token = getStoredAuth()
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Basic ${token}`
        const r = await fetch(cameraPreviewUrl(), { credentials: 'include', cache: 'no-store', headers })
        if (cancelled) return
        if (r.status === 204 || !r.ok) {
          setError(true)
          setSrc('')
          return
        }
        const blob = await r.blob()
        const url = URL.createObjectURL(blob)
        setSrc(prev => {
          if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
          return url
        })
        setError(false)
      } catch {
        if (!cancelled) setError(true)
      }
    }
    load()
    const id = window.setInterval(load, interval)
    return () => {
      cancelled = true
      clearInterval(id)
      setSrc(prev => {
        if (prev.startsWith('blob:')) URL.revokeObjectURL(prev)
        return ''
      })
    }
  }, [enabled, fps])

  if (!enabled) {
    return (
      <div className="camera-preview camera-preview-off">
        <span>Camera is off</span>
      </div>
    )
  }
  if (error || !src) {
    return (
      <div className="camera-preview camera-preview-wait">
        <span>{error ? 'Waiting for frame…' : 'Loading preview…'}</span>
      </div>
    )
  }
  return (
    <div className={`camera-preview${large ? ' camera-preview-large' : ''}`}>
      <img src={src} alt="Live camera preview" />
      <div className="camera-privacy-badge">Live · Privacy indicator active on device</div>
    </div>
  )
}
