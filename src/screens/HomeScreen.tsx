import { useMemo, useState } from 'react'
import { emergencyStop } from '@/api/client'
import { formatAgo } from '@/api/hooks'
import type { BuddySettings, LiveTelemetry, WeatherLive } from '@/api/types'
import { MiniFace } from '@/components/buddy/MiniFace'
import { Button } from '@/components/ui/Button'
import { Card, Grid, SectionIntro, StatusChip, StatusRow } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

export function HomeScreen({
  live,
  weather,
  settings,
}: {
  live: LiveTelemetry | null
  weather: WeatherLive | null
  settings: BuddySettings | null
}) {
  const [stopping, setStopping] = useState(false)
  const toy = String(settings?.toy_name ?? 'Buddy')
  const emotion = live?.emotion || live?.face_state || live?.express_face || 'idle'
  const online = live?.online ?? false
  const battery = live?.base_battery_pct ?? -1
  const recognised = live?.recognised_user || 'No one yet'
  const now = useMemo(() => new Date(), [])

  const onEmergency = async () => {
    if (!confirm('Emergency stop Buddy now? Movement and lights will halt until reset.')) return
    setStopping(true)
    try {
      await emergencyStop(String(settings?.developer_password ?? ''))
    } finally {
      setStopping(false)
    }
  }

  return (
    <div className="screen home-screen">
      <SectionIntro title="Home" subtitle="Live status at a glance — warm, simple, and safe for the whole family." />

      <div className="home-hero buddy-card">
        <MiniFace emotion={String(emotion).toLowerCase()} />
        <div className="home-hero-main">
          <div className="home-hero-title">
            <h2>{toy}</h2>
            <StatusChip label={online ? 'Online' : 'Offline'} tone={online ? 'green' : 'red'} />
            {emotion && <StatusChip label={String(emotion)} tone="blue" />}
          </div>
          <p className="home-hero-sub">
            {online
              ? `Last seen ${formatAgo(live?.last_seen_seconds_ago)}`
              : 'Device not connected — check Wi‑Fi and power'}
            {recognised !== 'No one yet' && ` · Recognised: ${recognised}`}
          </p>
        </div>
        <div className="home-clock">
          <div className="home-clock-time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="home-clock-date">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
      </div>

      <Grid cols={4}>
        <Card title="State"><StatusRow label="Phase" value={live?.state ?? '—'} /></Card>
        <Card title="Battery"><StatusRow label="Level" value={battery >= 0 ? `${battery}%` : '—'} ok={battery < 0 || battery > 15} /></Card>
        <Card title="Camera"><StatusRow label="Status" value={live?.camera_active ? 'Active' : live?.camera_enabled ? 'Ready' : 'Off'} /></Card>
        <Card title="Weather"><StatusRow label={weather?.city || 'Location'} value={weather?.temp_display ? `${weather.temp_display} · ${weather.condition ?? ''}` : '—'} /></Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Last interaction">
          <StatusRow label="Heard" value={live?.last_heard || '—'} />
          <StatusRow label="Reply" value={live?.last_reply || '—'} />
          <StatusRow label="Latency" value={live?.turn_total_ms ? `${live.turn_total_ms} ms total` : '—'} />
        </Card>
        <Card title="ExpressProfile">
          <StatusRow label="Profile" value={live?.express_profile || '—'} />
          <StatusRow label="Head target" value={`${live?.express_head_target_x ?? 0}, ${live?.express_head_target_y ?? 0}`} />
          <StatusRow label="Head actual" value={`${live?.express_head_actual_x ?? 0}, ${live?.express_head_actual_y ?? 0}`} />
          <StatusRow label="RGB brightness" value={live?.express_rgb_bright != null ? String(live.express_rgb_bright) : '—'} />
        </Card>
      </Grid>

      <Card title="Safety">
        <p className="card-copy">Emergency stop halts StackChan movement and RGB immediately.</p>
        <Button variant="danger" onClick={onEmergency} disabled={stopping}>
          <Icon name="zap" size={14} /> {stopping ? 'Stopping…' : 'Emergency stop'}
        </Button>
      </Card>
    </div>
  )
}
