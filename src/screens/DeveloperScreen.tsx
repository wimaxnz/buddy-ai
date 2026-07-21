import { useEffect, useState } from 'react'
import {
  devCommand,
  fetchAbResults,
  fetchDevLog,
  fetchDevVoices,
  postForm,
  saveDevSettings,
} from '@/api/client'
import { useLiveData } from '@/api/hooks'
import type { BuddySettings } from '@/api/types'
import { Button, SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro, StatusRow } from '@/components/ui/Card'
import { SliderField, TextField, Toggle } from '@/components/ui/Fields'

export function DeveloperScreen({ settings, onRefreshSettings }: {
  settings: BuddySettings
  onRefreshSettings: () => void
}) {
  const { data: live } = useLiveData(true)
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [log, setLog] = useState('')
  const [voices, setVoices] = useState<unknown>(null)
  const [ab, setAb] = useState<unknown>(null)
  const devPw = String(draft.developer_password ?? '')

  useEffect(() => { setDraft(settings) }, [settings])

  const refreshDiag = async () => {
    try {
      const [l, v, a] = await Promise.all([
        fetchDevLog().catch(() => 'Log unavailable'),
        fetchDevVoices().catch(() => null),
        fetchAbResults().catch(() => null),
      ])
      setLog(typeof l === 'string' ? l : JSON.stringify(l, null, 2))
      setVoices(v)
      setAb(a)
    } catch { /* dev auth */ }
  }

  useEffect(() => {
    refreshDiag()
    const id = window.setInterval(refreshDiag, 8000)
    return () => clearInterval(id)
  }, [])

  const set = (k: string, v: unknown) => setDraft(prev => ({ ...prev, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveDevSettings(draft)
      onRefreshSettings()
    } finally {
      setSaving(false)
    }
  }

  const cmd = async (name: string) => {
    try {
      await devCommand(name, '', devPw)
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e))
    }
  }

  const restart = async () => {
    if (!confirm('Restart BuddyAI server? Dashboard will reconnect in ~30s.')) return
    await postForm('/dev/restart-server', new FormData(), devPw)
  }

  return (
    <div className="screen developer-screen">
      <SectionIntro title="Developer" subtitle="Live telemetry, diagnostics, and test commands — separate from the family view." />

      <Grid cols={2}>
        <Card title="Live telemetry">
          <StatusRow label="Firmware" value={String(live?.firmware_build ?? '—')} />
          <StatusRow label="State" value={String(live?.state ?? '—')} />
          <StatusRow label="First sound" value={live?.first_sound_ms ? `${live.first_sound_ms} ms` : '—'} />
          <StatusRow label="Turn total" value={live?.turn_total_ms ? `${live.turn_total_ms} ms` : '—'} />
          <StatusRow label="Queue underruns" value={String(live?.queue_underruns_total ?? '—')} />
          <StatusRow label="Camera FPS" value={String(live?.camera_fps_actual ?? '—')} />
          <StatusRow label="StackChan pos" value={`${live?.base_pos_x ?? 0}, ${live?.base_pos_y ?? 0}`} />
          <StatusRow label="Battery" value={live?.base_battery_pct != null && live.base_battery_pct >= 0 ? `${live.base_battery_pct}% (${live.base_battery_v}V)` : '—'} />
          <StatusRow label="Free heap" value={live?.free_heap ? `${live.free_heap}` : '—'} />
        </Card>

        <Card title="Test commands">
          <div className="button-row wrap">
            {['preview_clock', 'preview_weather', 'test_wake', 'test_tts', 'run_ab_turn'].map(c => (
              <Button key={c} variant="soft" onClick={() => cmd(c)}>{c}</Button>
            ))}
            <Button variant="danger" onClick={restart}>Restart server</Button>
          </div>
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Wake & audio tuning">
          <SliderField label="Wake sensitivity" value={Number(draft.wake_sensitivity ?? 6)} min={1} max={10} onChange={v => set('wake_sensitivity', v)} />
          <SliderField label="Noise floor ×" value={Number(draft.noise_floor_multiplier ?? 2.5)} min={1} max={5} step={0.1} onChange={v => set('noise_floor_multiplier', v)} />
          <SliderField label="Min speech ms" value={Number(draft.minimum_speech_ms ?? 500)} min={200} max={2000} onChange={v => set('minimum_speech_ms', v)} />
          <SliderField label="Silence end ms" value={Number(draft.silence_end_ms ?? 750)} min={300} max={2000} onChange={v => set('silence_end_ms', v)} />
          <SliderField label="Playback buffer ms" value={Number(draft.playback_buffer_ms ?? 400)} min={100} max={1200} onChange={v => set('playback_buffer_ms', v)} />
          <Toggle label="Developer mode" checked={!!draft.developer_mode} onChange={v => set('developer_mode', v)} />
          <Toggle label="Serial debug" checked={draft.serial_debug_enabled !== false} onChange={v => set('serial_debug_enabled', v)} />
        </Card>

        <Card title="TTS engine">
          <TextField label="Engine" value={String(draft.tts_engine ?? 'kokoro')} onChange={v => set('tts_engine', v)} />
          <TextField label="Voice" value={String(draft.tts_voice ?? 'af_heart')} onChange={v => set('tts_voice', v)} />
          <SliderField label="Sample rate" value={Number(draft.tts_sample_rate ?? 24000)} min={16000} max={48000} step={1000} onChange={v => set('tts_sample_rate', v)} />
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Server log">
          <pre className="dev-log">{log.slice(-12000) || 'Loading…'}</pre>
          <Button variant="ghost" onClick={refreshDiag}>Refresh log</Button>
        </Card>
        <Card title="A/B & voices">
          <pre className="dev-log">{JSON.stringify({ voices, ab }, null, 2).slice(0, 8000)}</pre>
        </Card>
      </Grid>

      <SaveBar saving={saving} onSave={save} label="Save developer settings" />
    </div>
  )
}
