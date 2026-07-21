import { useMemo } from 'react'
import { emergencyStop } from '@/api/client'
import { formatAgo } from '@/api/hooks'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { LiveBuddyFacePanel } from '@/components/buddy/LiveBuddyFacePanel'
import { mapTelemetryEmotion } from '@/components/buddy/BuddyFaceScreen'
import { Button } from '@/components/ui/Button'
import { Card, SectionIntro, StatusChip } from '@/components/ui/Card'
import { HomeSkeleton } from '@/components/ui/Skeleton'

function linesToText(v: unknown): string {
  return Array.isArray(v) ? v.join('\n') : String(v ?? '')
}

export function HomeScreen() {
  const { live, settings, weather, loading } = useLiveDataContext()
  const toast = useToast()
  const toy = String(settings?.toy_name ?? 'Buddy')
  const online = live?.online ?? false
  const emotion = mapTelemetryEmotion(live)
  const battery = live?.base_battery_pct ?? -1
  const user = live?.recognised_user || settings?.child_name || 'No one recognised yet'
  const routineHint = useMemo(() => {
    const routines = linesToText(settings?.routines)
    const first = routines.split('\n').find(Boolean)
    return first || String(settings?.bedtime ? `Bedtime ${settings.bedtime}` : 'No routine set')
  }, [settings])

  if (loading && !settings) return <HomeSkeleton />

  const onEmergency = async () => {
    if (!confirm('Emergency stop Buddy now?')) return
    try {
      await emergencyStop(String(settings?.developer_password ?? ''))
      toast.success('Emergency stop sent.')
    } catch {
      toast.error('Emergency stop failed.')
    }
  }

  return (
    <div className="screen screen-enter home-screen-parent">
      <SectionIntro
        title={`Hello, ${settings?.child_name ? 'family' : 'there'}`}
        subtitle="Buddy at a glance — calm, clear, and ready for everyone at home."
      />

      <div className="home-status-card buddy-card">
        <div className="home-status-top">
          <div>
            <h2>{toy}</h2>
            <div className="home-chips">
              <StatusChip label={online ? 'Online' : 'Offline'} tone={online ? 'green' : 'red'} />
              <StatusChip label={emotion} tone="blue" />
            </div>
            <p className="home-sub">
              {online ? `Connected · last seen ${formatAgo(live?.last_seen_seconds_ago)}` : 'Buddy is not connected right now'}
            </p>
          </div>
          <div className="home-weather-block">
            <div className="home-weather-temp">{weather?.temp_display || '—'}</div>
            <div className="home-weather-meta">{weather?.condition || 'Weather'}</div>
            <div className="home-weather-meta">{weather?.city || settings?.location_city || ''}</div>
          </div>
        </div>

        <LiveBuddyFacePanel live={live} settings={settings} compact showSide={false} />

        <div className="home-metrics">
          <div className="home-metric">
            <span>Battery</span>
            <strong>{battery >= 0 ? `${battery}%` : '—'}</strong>
          </div>
          <div className="home-metric">
            <span>With</span>
            <strong>{String(user)}</strong>
          </div>
          <div className="home-metric">
            <span>Now</span>
            <strong>{routineHint}</strong>
          </div>
        </div>
      </div>

      <Card title="Quick actions">
        <div className="quick-actions">
          <Button variant="soft" onClick={() => window.location.hash = 'buddy'}>Adjust Buddy</Button>
          <Button variant="soft" onClick={() => window.location.hash = 'camera'}>Camera</Button>
          <Button variant="soft" onClick={() => window.location.hash = 'routines'}>Routines</Button>
          <Button variant="danger" onClick={onEmergency}>Emergency stop</Button>
        </div>
      </Card>
    </div>
  )
}
