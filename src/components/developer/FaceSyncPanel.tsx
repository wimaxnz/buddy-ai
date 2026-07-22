import { useMemo } from 'react'
import { devCommand } from '@/api/client'
import type { LiveTelemetry } from '@/api/types'
import { mapTelemetryEmotion, BuddyFaceScreen } from '@/components/buddy/BuddyFaceScreen'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Card, Grid, StatusChip, StatusRow } from '@/components/ui/Card'

function devicePreviewLive(live: LiveTelemetry | null, deviceEmotion: string): LiveTelemetry | null {
  if (!live || deviceEmotion === '—') return null
  const emo = deviceEmotion.toLowerCase()
  return {
    ...live,
    express_face: emo,
    face_state: emo,
    figma_face_emotion: emo,
    device_figma_emotion: emo,
    speaking: emo === 'speaking',
    listening: emo === 'listening',
    thinking: emo === 'thinking',
    state: emo === 'sleeping' ? 'Sleeping' : emo === 'speaking' ? 'Speaking'
      : emo === 'listening' ? 'Listening' : emo === 'thinking' ? 'Thinking' : 'Idle',
  }
}

export function FaceSyncPanel({ devPassword }: { devPassword?: string }) {
  const { live } = useLiveDataContext()
  const toast = useToast()
  const dashboardEmotion = mapTelemetryEmotion(live)
  const deviceEmotion = String(live?.device_figma_emotion || live?.figma_face_emotion || '—')
  const deviceLive = useMemo(() => devicePreviewLive(live, deviceEmotion), [live, deviceEmotion])
  const syncOk = Boolean(live?.figma_face_sync_ok) || (deviceEmotion !== '—' && dashboardEmotion === deviceEmotion)
  const lastUpdate = live?.last_seen_seconds_ago != null && live.last_seen_seconds_ago < 120
    ? `${live.last_seen_seconds_ago}s ago`
    : '—'

  const sync = async () => {
    try {
      await devCommand('sync_figma_face', dashboardEmotion, devPassword)
      toast.success(`Syncing ${dashboardEmotion} to device…`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Sync failed')
    }
  }

  return (
    <div className="screen-enter">
      <Grid cols={2}>
        <Card title="Dashboard expression" action={<StatusChip label="Preview" tone="blue" />}>
          <BuddyFaceScreen live={live} liveMode compact />
          <StatusRow label="Mapped emotion" value={dashboardEmotion} />
        </Card>
        <Card title="Device expression" action={<StatusChip label={live?.online ? 'Live' : 'Offline'} tone={live?.online ? 'green' : 'yellow'} />}>
          {deviceLive
            ? <BuddyFaceScreen live={deviceLive} liveMode compact />
            : <div className="card-copy" style={{ textAlign: 'center', padding: '48px 0' }}>Waiting for device…</div>}
          <StatusRow label="Mapped emotion" value={deviceEmotion} />
          <StatusRow label="ExpressProfile" value={String(live?.express_profile || '—')} />
        </Card>
      </Grid>
      <Card title="Figma face sync">
        <StatusRow label="Dashboard expression" value={dashboardEmotion} />
        <StatusRow label="Device expression" value={deviceEmotion} />
        <StatusRow label="Sync status" value={syncOk ? 'In sync' : 'Out of sync'} />
        <StatusRow label="ExpressProfile" value={String(live?.express_profile || '—')} />
        <StatusRow label="Last update" value={lastUpdate} />
        <StatusRow label="Recognised" value={String(live?.recognised_user || '—')} />
        <StatusRow label="Firmware" value={String(live?.firmware_build || '—')} />
        <div className="button-row" style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={sync}>Sync dashboard face to device</Button>
        </div>
      </Card>
    </div>
  )
}
