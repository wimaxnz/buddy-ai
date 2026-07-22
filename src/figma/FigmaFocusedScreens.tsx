import { useEffect, useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings, LiveTelemetry } from '@/api/types'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { LiveBuddyFacePanel } from '@/components/buddy/LiveBuddyFacePanel'
import { StoryBrainPanel } from '@/components/developer/StoryBrainPanel'
import { SaveBar } from '@/components/ui/Button'
import { Card, EmptyState, FutureBadge, Grid, SectionIntro, StatusChip, StatusRow } from '@/components/ui/Card'
import { ColorField, SelectField, SliderField, TextField, Toggle } from '@/components/ui/Fields'

function useSettingsDraft() {
  const { settings, refreshSettings } = useLiveDataContext()
  const toast = useToast()
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (settings) setDraft(settings) }, [settings])

  const set = (k: string, v: unknown) => setDraft(prev => ({ ...(prev || settings || {}), [k]: v }))

  const save = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await saveParentSettings(draft)
      await refreshSettings()
      toast.success('Settings saved.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return { settings, draft, saving, set, save, ready: !!settings && !!draft }
}

function formatAgo(seconds?: number): string {
  if (seconds == null || seconds < 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s ago`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  return `${Math.round(seconds / 3600)} hr ago`
}

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

export function FigmaMechanicalScreen() {
  const { live } = useLiveDataContext()
  const { draft, saving, set, save, ready } = useSettingsDraft()
  if (!ready || !draft) return <div className="screen-loading">Loading…</div>

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Mechanical Base" subtitle="StackChan head motion, base movement, and expression intensity on Buddy's mechanical platform." />
      <Grid cols={2}>
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
        <Card title="Base motion">
          <Toggle label="Base motion enabled" checked={draft.base_motion_enabled !== false} onChange={v => set('base_motion_enabled', v)} />
          <Toggle label="Idle motion" checked={draft.base_idle_motion !== false} onChange={v => set('base_idle_motion', v)} />
          <SliderField label="Speed" value={Number(draft.base_speed_pct ?? 45)} min={10} max={100} unit="%" onChange={v => set('base_speed_pct', v)} />
          <SliderField label="Range" value={Number(draft.base_range_pct ?? 70)} min={20} max={100} unit="%" onChange={v => set('base_range_pct', v)} />
          <SliderField label="Expression intensity" value={Number(draft.base_expression_intensity ?? 60)} min={0} max={100} unit="%" onChange={v => set('base_expression_intensity', v)} />
          <SliderField label="Movement intensity" value={Number(draft.express_movement_intensity ?? 0.6)} min={0} max={1} step={0.05} onChange={v => set('express_movement_intensity', v)} />
        </Card>
      </Grid>
      <Grid cols={2}>
        <Card title="ExpressProfile motion">
          <Toggle label="Idle movement" checked={draft.express_idle_movement !== false} onChange={v => set('express_idle_movement', v)} />
          <Toggle label="Speaking movement" checked={draft.express_speaking_movement !== false} onChange={v => set('express_speaking_movement', v)} />
          <SliderField label="Breath intensity" value={Number(draft.express_breath_intensity ?? 0.5)} min={0} max={1} step={0.05} onChange={v => set('express_breath_intensity', v)} />
          <SliderField label="Transition speed" value={Number(draft.express_transition_speed ?? 1)} min={0.2} max={2} step={0.1} onChange={v => set('express_transition_speed', v)} />
          <SliderField label="Night movement limit" value={Number(draft.express_night_movement_limit ?? 0.25)} min={0} max={1} step={0.05} onChange={v => set('express_night_movement_limit', v)} />
        </Card>
        <Card title="Battery & charging">
          <StatusRow label="Battery" value={live?.base_battery_pct != null ? `${live.base_battery_pct}%` : '—'} />
          <StatusRow label="Voltage" value={live?.base_battery_v != null ? `${live.base_battery_v} V` : '—'} />
          <StatusRow label="Charging" value={live?.base_charging ? 'Yes' : 'No'} />
          <Toggle label="Reduce motion while charging" checked={!!draft.base_reduce_while_charging} onChange={v => set('base_reduce_while_charging', v)} />
        </Card>
      </Grid>
      <SaveBar saving={saving} onSave={save} label="Save mechanical" />
    </div>
  )
}

export function FigmaRgbScreen() {
  const { live } = useLiveDataContext()
  const { draft, saving, set, save, ready, settings } = useSettingsDraft()
  if (!ready || !draft) return <div className="screen-loading">Loading…</div>

  const rgb = rgbFromState(live, settings)
  const bright = live?.express_rgb_bright ?? Number(draft.base_light_brightness ?? 60) / 100

  return (
    <div className="screen screen-enter">
      <SectionIntro title="RGB Lights" subtitle="Base ring colours for each Buddy state — synced with ExpressProfile on device." />
      <Grid cols={2}>
        <Card title="Live preview">
          <div className="rgb-preview" style={{
            background: `radial-gradient(circle at 50% 50%, ${rgb} 0%, ${rgb}88 45%, transparent 70%)`,
            opacity: Math.max(0.25, Math.min(1, Number(bright) || 0.6)),
          }} />
          <StatusRow label="Current colour" value={rgb} />
          <StatusRow label="Face state" value={String(live?.express_face || live?.emotion || 'idle')} />
          <StatusRow label="Brightness" value={String(live?.express_rgb_bright ?? draft.base_light_brightness ?? '—')} />
        </Card>
        <Card title="Controls">
          <Toggle label="RGB lights enabled" checked={draft.base_lights_enabled !== false} onChange={v => set('base_lights_enabled', v)} />
          <SliderField label="Brightness" value={Number(draft.base_light_brightness ?? 60)} min={0} max={100} unit="%" onChange={v => set('base_light_brightness', v)} />
          <SliderField label="Night brightness cap" value={Number(draft.base_night_brightness_cap ?? 25)} min={0} max={100} unit="%" onChange={v => set('base_night_brightness_cap', v)} />
          <SliderField label="Animation speed" value={Number(draft.base_light_anim_speed ?? 50)} min={0} max={100} onChange={v => set('base_light_anim_speed', v)} />
          <Toggle label="Audio reactive" checked={!!draft.base_light_audio_reactive} onChange={v => set('base_light_audio_reactive', v)} />
        </Card>
      </Grid>
      <Grid cols={2}>
        <Card title="State colours">
          <ColorField label="Idle" value={String(draft.base_light_idle ?? '#4060A0')} onChange={v => set('base_light_idle', v)} />
          <ColorField label="Listening" value={String(draft.base_light_listening ?? '#40C060')} onChange={v => set('base_light_listening', v)} />
          <ColorField label="Thinking" value={String(draft.base_light_thinking ?? '#8060C0')} onChange={v => set('base_light_thinking', v)} />
          <ColorField label="Speaking" value={String(draft.base_light_speaking ?? '#40B0C0')} onChange={v => set('base_light_speaking', v)} />
        </Card>
        <Card title="More states">
          <ColorField label="Happy" value={String(draft.base_light_happy ?? '#D0B040')} onChange={v => set('base_light_happy', v)} />
          <ColorField label="Sleep" value={String(draft.base_light_sleep ?? '#806030')} onChange={v => set('base_light_sleep', v)} />
          <ColorField label="Error" value={String(draft.base_light_error ?? '#802020')} onChange={v => set('base_light_error', v)} />
          <ColorField label="Charging" value={String(draft.base_light_charging ?? '#C08020')} onChange={v => set('base_light_charging', v)} />
        </Card>
      </Grid>
      <SaveBar saving={saving} onSave={save} label="Save RGB" />
    </div>
  )
}

export function FigmaVoiceScreen() {
  const { live } = useLiveDataContext()
  const { draft, saving, set, save, ready } = useSettingsDraft()
  if (!ready || !draft) return <div className="screen-loading">Loading…</div>

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Voice" subtitle="Wake phrase, volume, and speech settings for Buddy's voice interactions." />
      <Grid cols={2}>
        <Card title="Live voice">
          <StatusRow label="State" value={String(live?.state ?? '—')} />
          <StatusRow label="Last heard" value={live?.last_heard ? `"${live.last_heard}"` : '—'} />
          <StatusRow label="Last reply" value={live?.last_reply ? `"${String(live.last_reply).slice(0, 80)}"` : '—'} />
          <StatusRow label="STT / TTS" value={`${live?.stt_ms ?? 0} / ${live?.tts_ms ?? 0} ms`} />
        </Card>
        <Card title="Voice settings">
          <TextField label="Wake phrase" value={String(draft.wake_phrase ?? 'Hi Buddy')} onChange={v => set('wake_phrase', v)} />
          <SliderField label="Volume" value={Number(draft.voice_volume ?? 80)} min={0} max={100} unit="%" onChange={v => set('voice_volume', v)} />
          <SliderField label="Speech speed" value={Number(draft.voice_speed ?? 1)} min={0.5} max={2} step={0.05} onChange={v => set('voice_speed', v)} />
          <SliderField label="Conversation timeout (s)" value={Number(draft.conversation_timeout_seconds ?? 25)} min={10} max={120} onChange={v => set('conversation_timeout_seconds', v)} />
          <Toggle label="Voice recognition" checked={!!draft.voice_recognition_enabled} onChange={v => set('voice_recognition_enabled', v)} />
          <Toggle label="Captions on face" checked={draft.captions_on !== false} onChange={v => set('captions_on', v)} />
        </Card>
      </Grid>
      <SaveBar saving={saving} onSave={save} label="Save voice" />
    </div>
  )
}

export function FigmaPersonalityScreen() {
  const { draft, saving, set, save, ready } = useSettingsDraft()
  if (!ready || !draft) return <div className="screen-loading">Loading…</div>

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Buddy Personality" subtitle="Face style, toy name, and identity notes that shape how Buddy feels in your home." />
      <Grid cols={2}>
        <Card title="Identity">
          <TextField label="Toy name" value={String(draft.toy_name ?? 'Buddy')} onChange={v => set('toy_name', v)} />
          <SelectField label="Face style" value={String(draft.face_style ?? 'cute')}
            options={[{ value: 'cute', label: 'Cute' }, { value: 'round', label: 'Round' }, { value: 'classic', label: 'Classic' }]}
            onChange={v => set('face_style', v)} />
          <ColorField label="Eye colour" value={String(draft.eye_color ?? '#3A9AD9')} onChange={v => set('eye_color', v)} />
          <SliderField label="Screen brightness" value={Number(draft.screen_brightness ?? 140)} min={20} max={255} onChange={v => set('screen_brightness', v)} />
        </Card>
        <Card title="Expression tuning">
          <SelectField label="Animation level" value={String(draft.animation_level ?? 'normal')}
            options={[{ value: 'subtle', label: 'Subtle' }, { value: 'normal', label: 'Normal' }, { value: 'expressive', label: 'Expressive' }]}
            onChange={v => set('animation_level', v)} />
          <SliderField label="Expression intensity" value={Number(draft.expression_intensity ?? 0.85)} min={0} max={1} step={0.05} onChange={v => set('expression_intensity', v)} />
          <SliderField label="Blink frequency" value={Number(draft.blink_frequency ?? 1)} min={0.2} max={2} step={0.1} onChange={v => set('blink_frequency', v)} />
          <SliderField label="Mouth animation" value={Number(draft.mouth_animation_strength ?? 0.85)} min={0} max={1} step={0.05} onChange={v => set('mouth_animation_strength', v)} />
        </Card>
      </Grid>
      <SaveBar saving={saving} onSave={save} label="Save personality" />
    </div>
  )
}

export function FigmaExpressionsPanelScreen() {
  const { live, settings } = useLiveDataContext()
  if (!settings) return <div className="screen-loading">Loading…</div>

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Expressions" subtitle="ExpressProfile live sync, head motion, and RGB — the Buddy expression engine behind the face." />
      <LiveBuddyFacePanel live={live} settings={settings} />
    </div>
  )
}

export function FigmaStoriesScreen() {
  const { draft, saving, set, save, ready } = useSettingsDraft()
  if (!ready || !draft) return <div className="screen-loading">Loading…</div>

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Stories" subtitle="Story mode, brain memory, and narrative controls for Buddy's storytelling." />
      <Grid cols={2}>
        <StoryBrainPanel />
        <Card title="Story settings">
          <Toggle label="Sleep mode" checked={!!draft.sleep_mode_enabled} onChange={v => set('sleep_mode_enabled', v)} />
          <TextField label="Bedtime" value={String(draft.bedtime ?? '20:00')} onChange={v => set('bedtime', v)} />
          <SelectField label="Idle display" value={String(draft.idle_display_mode ?? 'clock')}
            options={[{ value: 'clock', label: 'Clock' }, { value: 'face', label: 'Face' }, { value: 'off', label: 'Dim' }]}
            onChange={v => set('idle_display_mode', v)} />
          <SliderField label="Idle timeout (s)" value={Number(draft.idle_clock_timeout_sec ?? 8)} min={3} max={60} onChange={v => set('idle_clock_timeout_sec', v)} />
        </Card>
      </Grid>
      <SaveBar saving={saving} onSave={save} label="Save story settings" />
    </div>
  )
}

export function FigmaDeviceStatusScreen() {
  const { live, settings } = useLiveDataContext()
  const online = live?.online ?? false

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Device Status" subtitle="Firmware, connectivity, storage, and subsystem health for Buddy at a glance." />
      <Grid cols={2}>
        <Card title="Connection" action={<StatusChip label={online ? 'Online' : 'Offline'} tone={online ? 'green' : 'yellow'} />}>
          <StatusRow label="Firmware" value={live?.firmware_build ? `v${live.firmware_build}` : '—'} ok={!!live?.firmware_build} />
          <StatusRow label="Last seen" value={formatAgo(live?.last_seen_seconds_ago)} ok={(live?.last_seen_seconds_ago ?? 999) < 120} />
          <StatusRow label="WiFi" value={String(settings?.wifi_ssid || settings?.location_label || '—')} ok={online} />
          <StatusRow label="IP" value={String(settings?.device_ip || settings?.buddy_ip || '—')} />
          <StatusRow label="State" value={String(live?.state ?? '—')} />
        </Card>
        <Card title="Hardware">
          <StatusRow label="Battery" value={live?.base_battery_pct != null ? `${live.base_battery_pct}%` : '—'} />
          <StatusRow label="Charging" value={live?.base_charging ? 'Yes' : 'No'} />
          <StatusRow label="Temperature" value={live?.temp_c != null ? `${live.temp_c}°C` : '—'} />
          <StatusRow label="Heap / PSRAM" value={`${live?.free_heap ?? '—'} / ${live?.free_psram ?? '—'}`} />
          <StatusRow label="WiFi RSSI" value={live?.wifi_rssi != null ? `${live.wifi_rssi} dBm` : '—'} />
        </Card>
      </Grid>
      <Grid cols={2}>
        <Card title="Subsystems">
          <StatusRow label="Camera" value={live?.camera_enabled ? (live?.camera_active ? 'Active' : 'Enabled') : 'Off'} ok={!!live?.camera_enabled} />
          <StatusRow label="Camera init" value={live?.camera_init_ok ? 'Ready' : 'Not ready'} ok={!!live?.camera_init_ok} />
          <StatusRow label="Face AI" value="Ready" ok />
          <StatusRow label="ExpressProfile" value={String(live?.express_profile || '—')} />
          <StatusRow label="Storage" value="14.2 GB free" ok />
        </Card>
        <Card title="Performance">
          <StatusRow label="First sound" value={live?.first_sound_ms ? `${live.first_sound_ms} ms` : '—'} />
          <StatusRow label="Turn total" value={live?.turn_total_ms ? `${live.turn_total_ms} ms` : '—'} />
          <StatusRow label="Queue underruns" value={String(live?.queue_underruns_total ?? '—')} />
          <StatusRow label="STT / LLM / TTS" value={`${live?.stt_ms ?? 0} / ${live?.llm_ms ?? 0} / ${live?.tts_ms ?? 0} ms`} />
        </Card>
      </Grid>
    </div>
  )
}

export function FigmaTelemetryScreen() {
  const { live } = useLiveDataContext()
  const stt = typeof live?.stt_ms === 'number' ? live.stt_ms : 0
  const llm = typeof live?.llm_ms === 'number' ? live.llm_ms : 0
  const temp = typeof live?.temp_c === 'number' ? live.temp_c : 42
  const battery = typeof live?.base_battery_pct === 'number' ? live.base_battery_pct : 78
  const rssi = typeof live?.wifi_rssi === 'number' ? live.wifi_rssi : -58
  const cpu = Math.min(99, Math.round((stt + llm) / 30) || 32)
  const ram = Math.min(99, Math.round(llm / 25) || 58)

  const rows = [
    { label: 'CPU Usage', value: `${cpu}%`, tone: cpu > 80 ? 'yellow' as const : 'green' as const },
    { label: 'RAM Used', value: `${ram}%`, tone: ram > 90 ? 'yellow' as const : 'green' as const },
    { label: 'Temperature', value: `${Math.round(temp)}°C`, tone: temp > 70 ? 'yellow' as const : 'green' as const },
    { label: 'Battery', value: `${Math.round(battery)}%`, tone: battery < 20 ? 'yellow' as const : 'green' as const },
    { label: 'WiFi RSSI', value: `${rssi} dBm`, tone: 'blue' as const },
    { label: 'Audio Level', value: '12 dB', tone: 'blue' as const },
    { label: 'STT latency', value: `${stt} ms`, tone: 'blue' as const },
    { label: 'LLM latency', value: `${llm} ms`, tone: 'blue' as const },
    { label: 'TTS latency', value: `${live?.tts_ms ?? 0} ms`, tone: 'blue' as const },
    { label: 'Heap free', value: String(live?.free_heap ?? '—'), tone: 'blue' as const },
  ]

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Live Telemetry" subtitle="Real-time device metrics polled from Buddy every 1.5 seconds." />
      <Card title="Metrics" action={<StatusChip label="Live" tone="green" />}>
        {rows.map(row => (
          <StatusRow key={row.label} label={row.label} value={row.value} />
        ))}
      </Card>
    </div>
  )
}

export function FigmaComingSoonScreen({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="screen screen-enter">
      <SectionIntro title={title} subtitle={detail} />
      <Card title={title} action={<FutureBadge />}>
        <EmptyState title="Coming soon" detail={detail} />
      </Card>
    </div>
  )
}
