import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchLive,
  fetchSettings,
  fetchWeatherLive,
  fetchHealth,
  fetchParentStatus,
} from './client'
import type { BuddySettings, LiveTelemetry, ParentStatus, WeatherLive } from './types'

export function usePolling<T>(
  loader: () => Promise<T>,
  intervalMs: number,
  enabled = true,
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const refresh = useCallback(async () => {
    try {
      const result = await loaderRef.current()
      setData(result)
      setError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg !== 'AUTH_REQUIRED') setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const tick = async () => {
      try {
        await refresh()
      } catch { /* auth handled upstream */ }
      if (!cancelled) timer = window.setTimeout(tick, intervalMs)
    }
    let timer = window.setTimeout(tick, 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [enabled, intervalMs, refresh])

  return { data, error, loading, refresh }
}

export function useLiveData(enabled = true) {
  return usePolling<LiveTelemetry>(() => fetchLive(), 1500, enabled)
}

export function useSettings(enabled = true) {
  const [settings, setSettings] = useState<BuddySettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const s = await fetchSettings()
      setSettings(s)
      setError(null)
      return s
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    refresh().catch(() => {})
  }, [enabled, refresh])

  const patch = useCallback((partial: Partial<BuddySettings>) => {
    setSettings(prev => (prev ? { ...prev, ...partial } : partial))
  }, [])

  return { settings, setSettings, patch, error, loading, refresh }
}

export function useWeather(enabled = true) {
  return usePolling<WeatherLive>(() => fetchWeatherLive(), 60000, enabled)
}

export function useServerHealth(enabled = true) {
  return usePolling(() => fetchHealth(), 10000, enabled)
}

export function useParentStatus(enabled = true) {
  return usePolling<ParentStatus>(() => fetchParentStatus(), 10000, enabled)
}

export function formatAgo(seconds: number | undefined): string {
  if (seconds === undefined || seconds < 0) return '—'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

export function maskSecret(value: unknown): string {
  const s = String(value ?? '')
  if (!s) return '—'
  if (s.length <= 4) return '••••'
  return s.slice(0, 2) + '••••' + s.slice(-2)
}
