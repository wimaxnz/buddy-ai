import { useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings, LiveTelemetry } from '@/api/types'
import { MiniFace } from '@/components/buddy/MiniFace'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro } from '@/components/ui/Card'
import { ColorField, SelectField, SliderField, Toggle } from '@/components/ui/Fields'

export function BuddyScreen({
  settings,
  live,
  onSaved,
}: {
  settings: BuddySettings
  live: LiveTelemetry | null
  onSaved: () => void
}) {
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'face' | 'voice' | 'motion' | 'lights'>('face')
  const emotion = live?.emotion || live?.face_state || 'idle'

  const set = (k: string, v: unknown) => setDraft(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveParentSettings(draft)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <SectionIntro title="Buddy" subtitle="Personality, face, voice, movement, and lights — connected to your device." />

      <div className="buddy-preview-row buddy-card">
        <MiniFace emotion={String(emotion).toLowerCase()} />
        <div>
          <h3>{String(draft.toy_name ?? 'Buddy')}</h3>
          <p>Current emotion: {String(emotion)} · ExpressProfile: {live?.express_profile || '—'}</p>
        </div>
      </div>

      <div className="tab-row">
        {(['face', 'voice', 'motion', 'lights'] as const).map(t => (
          <button key={t} type="button" className={`tab-btn${tab === t ? ' is-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'face' ? 'Face' : t === 'voice' ? 'Voice' : t === 'motion' ? 'Movement' : 'RGB lights'}
          </button>
        ))}
      </div>

      {tab === 'face' && (
        <Grid cols={2}>
          <Card title="Expressions">
            <SelectField label="Face style" value={String(draft.face_style ?? 'cute')}
              options={[
                { value: 'cute', label: 'Cute' },
                { value: 'round', label: 'Round' },
                { value: 'classic', label: 'Classic' },
              ]}
              onChange={v => set('face_style', v)} />
            <ColorField label="Eye colour" value={String(draft.eye_color ?? '#3A9AD9')} onChange={v => set('eye_color', v)} />
            <SelectField label="Animation level" value={String(draft.animation_level ?? 'normal')}
              options={[
                { value: 'off', label: 'Off' },
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
              ]}
              onChange={v => set('animation_level', v)} />
            <SliderField label="Expression intensity" value={Number(draft.expression_intensity ?? 0.85)}
              min={0} max={1} step={0.05} onChange={v => set('expression_intensity', v)} />
            <SliderField label="Blink frequency" value={Number(draft.blink_frequency ?? 1)}
              min={0.2} max={2} step={0.1} onChange={v => set('blink_frequency', v)} />
            <SliderField label="Mouth animation" value={Number(draft.mouth_animation_strength ?? 0.85)}
              min={0} max={1} step={0.05} onChange={v => set('mouth_animation_strength', v)} />
          </Card>
          <Card title="Idle display">
            <SelectField label="Idle mode" value={String(draft.idle_display_mode ?? 'clock')}
              options={[
                { value: 'face', label: 'Face' },
                { value: 'clock', label: 'Clock' },
                { value: 'alternate', label: 'Alternate' },
              ]}
              onChange={v => set('idle_display_mode', v)} />
            <SliderField label="Clock timeout (sec)" value={Number(draft.idle_clock_timeout_sec ?? 8)}
              min={3} max={60} onChange={v => set('idle_clock_timeout_sec', v)} />
          </Card>
        </Grid>
      )}

      {tab === 'voice' && (
        <Grid cols={2}>
          <Card title="Voice">
            <SliderField label="Volume" value={Number(draft.voice_volume ?? 80)} min={0} max={100} unit="%" onChange={v => set('voice_volume', v)} />
            <SliderField label="Voice speed" value={Number(draft.voice_speed ?? 1)} min={0.5} max={1.5} step={0.05} onChange={v => set('voice_speed', v)} />
            <Toggle label="Captions on screen" checked={!!draft.captions_on} onChange={v => set('captions_on', v)} />
          </Card>
          <Card title="Device">
            <SliderField label="Screen brightness" value={Number(draft.screen_brightness ?? 140)} min={20} max={255} onChange={v => set('screen_brightness', v)} />
            <SliderField label="Conversation timeout" value={Number(draft.conversation_timeout_seconds ?? 25)} min={5} max={120} unit="s" onChange={v => { set('conversation_timeout_seconds', v); set('conversation_timeout', v) }} />
            <Toggle label="Sleep mode" checked={!!draft.sleep_mode_enabled} onChange={v => set('sleep_mode_enabled', v)} />
          </Card>
        </Grid>
      )}

      {tab === 'motion' && (
        <Grid cols={2}>
          <Card title="StackChan">
            <Toggle label="Base motion enabled" checked={draft.base_motion_enabled !== false} onChange={v => set('base_motion_enabled', v)} />
            <Toggle label="Idle motion" checked={draft.base_idle_motion !== false} onChange={v => set('base_idle_motion', v)} />
            <SliderField label="Speed" value={Number(draft.base_speed_pct ?? 45)} min={10} max={100} unit="%" onChange={v => set('base_speed_pct', v)} />
            <SliderField label="Range" value={Number(draft.base_range_pct ?? 70)} min={10} max={100} unit="%" onChange={v => set('base_range_pct', v)} />
            <StatusLive label="Position" live={`${live?.base_pos_x ?? 0}, ${live?.base_pos_y ?? 0}`} />
            <StatusLive label="Battery" live={live?.base_battery_pct != null && live.base_battery_pct >= 0 ? `${live.base_battery_pct}%` : '—'} />
          </Card>
          <Card title="ExpressProfile movement">
            <SliderField label="Movement intensity" value={Number(draft.express_movement_intensity ?? 0.6)} min={0} max={1} step={0.05} onChange={v => set('express_movement_intensity', v)} />
            <SliderField label="Breath intensity" value={Number(draft.express_breath_intensity ?? 0.5)} min={0} max={1} step={0.05} onChange={v => set('express_breath_intensity', v)} />
            <Toggle label="Idle movement" checked={draft.express_idle_movement !== false} onChange={v => set('express_idle_movement', v)} />
            <Toggle label="Speaking movement" checked={draft.express_speaking_movement !== false} onChange={v => set('express_speaking_movement', v)} />
          </Card>
        </Grid>
      )}

      {tab === 'lights' && (
        <Grid cols={2}>
          <Card title="RGB lights">
            <Toggle label="Lights enabled" checked={draft.base_lights_enabled !== false} onChange={v => set('base_lights_enabled', v)} />
            <Toggle label="Lights off override" checked={!!draft.base_lights_off} onChange={v => set('base_lights_off', v)} />
            <SliderField label="Brightness" value={Number(draft.base_light_brightness ?? 60)} min={0} max={100} unit="%" onChange={v => set('base_light_brightness', v)} />
            <SliderField label="Night cap" value={Number(draft.base_night_brightness_cap ?? 25)} min={0} max={100} unit="%" onChange={v => set('base_night_brightness_cap', v)} />
            <Toggle label="Audio reactive" checked={draft.base_light_audio_reactive !== false} onChange={v => set('base_light_audio_reactive', v)} />
          </Card>
          <Card title="State colours">
            <ColorField label="Idle" value={String(draft.base_light_idle ?? '#4060A0')} onChange={v => set('base_light_idle', v)} />
            <ColorField label="Listening" value={String(draft.base_light_listening ?? '#40C060')} onChange={v => set('base_light_listening', v)} />
            <ColorField label="Thinking" value={String(draft.base_light_thinking ?? '#8060C0')} onChange={v => set('base_light_thinking', v)} />
            <ColorField label="Speaking" value={String(draft.base_light_speaking ?? '#40B0C0')} onChange={v => set('base_light_speaking', v)} />
            <ColorField label="Happy" value={String(draft.base_light_happy ?? '#D0B040')} onChange={v => set('base_light_happy', v)} />
          </Card>
        </Grid>
      )}

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}

function StatusLive({ label, live }: { label: string; live: string }) {
  return (
    <div className="status-row">
      <span className="status-row-label">{label}</span>
      <span className="status-row-value">{live}</span>
    </div>
  )
}
