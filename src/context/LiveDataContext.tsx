import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchLive, fetchSettings, fetchWeatherLive } from '@/api/client'
import type { BuddySettings, LiveTelemetry, WeatherLive } from '@/api/types'

interface LiveDataContextValue {
  live: LiveTelemetry | null
  settings: BuddySettings | null
  weather: WeatherLive | null
  refreshSettings: () => Promise<void>
  patchSettings: (partial: Partial<BuddySettings>) => void
  loading: boolean
}

const LiveDataContext = createContext<LiveDataContextValue | null>(null)

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveTelemetry | null>(null)
  const [settings, setSettings] = useState<BuddySettings | null>(null)
  const [weather, setWeather] = useState<WeatherLive | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    const s = await fetchSettings()
    setSettings(s)
    return s
  }, [])

  const patchSettings = useCallback((partial: Partial<BuddySettings>) => {
    setSettings(prev => (prev ? { ...prev, ...partial } : partial))
  }, [])

  useEffect(() => {
    let cancelled = false
    refreshSettings()
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })

    const pollLive = async () => {
      try {
        const l = await fetchLive()
        if (!cancelled) setLive(l)
      } catch { /* auth */ }
    }
    const pollWeather = async () => {
      try {
        const w = await fetchWeatherLive()
        if (!cancelled) setWeather(w)
      } catch { /* ignore */ }
    }

    pollLive()
    pollWeather()
    const liveId = window.setInterval(pollLive, 1500)
    const weatherId = window.setInterval(pollWeather, 60000)
    return () => {
      cancelled = true
      clearInterval(liveId)
      clearInterval(weatherId)
    }
  }, [refreshSettings])

  const value = useMemo(
    () => ({ live, settings, weather, refreshSettings, patchSettings, loading }),
    [live, settings, weather, refreshSettings, patchSettings, loading],
  )

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
}

export function useLiveDataContext() {
  const ctx = useContext(LiveDataContext)
  if (!ctx) throw new Error('useLiveDataContext must be used within LiveDataProvider')
  return ctx
}
