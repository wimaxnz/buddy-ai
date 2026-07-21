import type { BuddySettings, LiveTelemetry } from '@/api/types'
import { BuddyFaceScreen, mapTelemetryEmotion } from '@/components/buddy/BuddyFaceScreen'
import { Card, StatusRow } from '@/components/ui/Card'
import { StatusChip } from '@/components/ui/Card'

function rgbFromState(live: LiveTelemetry | null, settings: BuddySettings | null): string {
  const state = String(live?.state || live?.express_face || 'idle').toLowerCase()
  const key = state.includes('listen') ? 'base_light_listening'
    : state.includes('think') ? 'base_light_thinking'
    : state.includes('speak') ? 'base_light_speaking'
    : state.includes('happy') ? 'base_light_happy'
    : state.includes('sleep') ? 'base_light_sleep'
    : 'base_light_idle'
  return String(settings?.[key] ?? '#4060A0')
}

export function LiveBuddyFacePanel({
  live,
  settings,
  compact = false,
  showSide = true,
}: {
  live: LiveTelemetry | null
  settings: BuddySettings | null
  compact?: boolean
  showSide?: boolean
}) {
  const emotion = mapTelemetryEmotion(live)
  const rgb = rgbFromState(live, settings)
  const bright = live?.express_rgb_bright ?? 0.6

  return (
    <div className={`live-face-panel${compact ? ' is-compact' : ''}`}>
      <BuddyFaceScreen live={live} liveMode compact={compact} />
      {showSide && !compact && (
        <div className="live-face-side">
          <Card title="ExpressProfile">
            <StatusRow label="Profile" value={live?.express_profile || '—'} />
            <StatusRow label="Face state" value={live?.express_face || live?.face_state || emotion} />
            <StatusChip label={live?.online ? 'Live sync' : 'Offline preview'} tone={live?.online ? 'green' : 'yellow'} />
          </Card>
          <Card title="StackChan head">
            <div className="head-preview">
              <div className="head-grid">
                <span className="head-dot head-target" style={{
                  left: `${50 + (live?.express_head_target_x ?? 0) * 0.35}%`,
                  top: `${50 - (live?.express_head_target_y ?? 0) * 0.35}%`,
                }} title="Target" />
                <span className="head-dot head-actual" style={{
                  left: `${50 + (live?.express_head_actual_x ?? 0) * 0.35}%`,
                  top: `${50 - (live?.express_head_actual_y ?? 0) * 0.35}%`,
                }} title="Actual" />
              </div>
            </div>
            <StatusRow label="Target" value={`${live?.express_head_target_x ?? 0}, ${live?.express_head_target_y ?? 0}`} />
            <StatusRow label="Actual" value={`${live?.express_head_actual_x ?? 0}, ${live?.express_head_actual_y ?? 0}`} />
            <StatusRow label="Base position" value={`${live?.base_pos_x ?? 0}, ${live?.base_pos_y ?? 0}`} />
          </Card>
          <Card title="RGB preview">
            <div className="rgb-preview" style={{
              background: `radial-gradient(circle at 50% 50%, ${rgb} 0%, ${rgb}88 45%, transparent 70%)`,
              opacity: Math.max(0.25, Math.min(1, Number(bright) || 0.6)),
            }} />
            <StatusRow label="Colour" value={rgb} />
            <StatusRow label="Brightness" value={String(bright)} />
          </Card>
        </div>
      )}
    </div>
  )
}
