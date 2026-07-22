import { useEffect, useState } from 'react'
import { fetchAbResults, fetchDevLog, fetchDevVoices, saveDevSettings } from '@/api/client'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { DevCommandGrid } from '@/components/developer/DevCommandGrid'
import { FacePreviewPanel } from '@/components/developer/FacePreviewPanel'
import { FaceSyncPanel } from '@/components/developer/FaceSyncPanel'
import { ProviderPanel } from '@/components/developer/ProviderPanel'
import { StoryBrainPanel } from '@/components/developer/StoryBrainPanel'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro, StatusRow } from '@/components/ui/Card'
import { Collapsible } from '@/components/ui/Skeleton'
import { SliderField, TextField, Toggle } from '@/components/ui/Fields'

export function DeveloperScreen() {
  const { live, settings, refreshSettings } = useLiveDataContext()
  const toast = useToast()
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [log, setLog] = useState('')
  const [voices, setVoices] = useState<unknown>(null)
  const [ab, setAb] = useState<unknown>(null)
  const devPw = String(draft?.developer_password ?? '')

  useEffect(() => { if (settings) setDraft(settings) }, [settings])

  const refreshDiag = async () => {
    try {
      const [v, a] = await Promise.all([
        fetchDevVoices().catch(() => null),
        fetchAbResults().catch(() => null),
      ])
      setVoices(v)
      setAb(a)
      try {
        const l = await fetchDevLog()
        setLog(typeof l === 'string' ? l : JSON.stringify(l, null, 2))
      } catch {
        setLog('Log download requires developer auth — use Download log button.')
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    refreshDiag()
    const id = window.setInterval(refreshDiag, 12000)
    return () => clearInterval(id)
  }, [])

  if (!settings || !draft) return null

  const set = (k: string, v: unknown) => setDraft(prev => ({ ...(prev || settings), [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveDevSettings(draft)
      await refreshSettings()
      toast.success('Developer settings saved.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen screen-enter developer-screen">
      <SectionIntro title="Developer" subtitle="Diagnostics, providers, and test tools — kept separate from the family view." />

      <Grid cols={2}>
        <Card title="Live telemetry">
          <StatusRow label="Firmware" value={String(live?.firmware_build ?? '—')} />
          <StatusRow label="State" value={String(live?.state ?? '—')} />
          <StatusRow label="First sound" value={live?.first_sound_ms ? `${live.first_sound_ms} ms` : '—'} />
          <StatusRow label="Turn total" value={live?.turn_total_ms ? `${live.turn_total_ms} ms` : '—'} />
          <StatusRow label="Queue underruns" value={String(live?.queue_underruns_total ?? '—')} />
          <StatusRow label="STT / LLM / TTS" value={`${live?.stt_ms ?? 0} / ${live?.llm_ms ?? 0} / ${live?.tts_ms ?? 0} ms`} />
          <StatusRow label="Heap / PSRAM" value={`${live?.free_heap ?? '—'} / ${live?.free_psram ?? '—'}`} />
        </Card>
        <StoryBrainPanel />
      </Grid>

      <Collapsible title="AI Provider" badge="keys">
        <ProviderPanel />
      </Collapsible>

      <Collapsible title="Wake, audio & TTS tuning">
        <Grid cols={2}>
          <Card title="Wake & audio">
            <SliderField label="Wake sensitivity" value={Number(draft.wake_sensitivity ?? 6)} min={1} max={10} onChange={v => set('wake_sensitivity', v)} />
            <SliderField label="Noise floor ×" value={Number(draft.noise_floor_multiplier ?? 2.5)} min={1} max={5} step={0.1} onChange={v => set('noise_floor_multiplier', v)} />
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
        <SaveBar saving={saving} onSave={save} label="Save developer settings" />
      </Collapsible>

      <Collapsible title="Figma face sync" badge="device">
        <FaceSyncPanel devPassword={devPw} />
      </Collapsible>

      <Collapsible title="Test commands & device actions">
        <DevCommandGrid devPassword={devPw} />
        <FacePreviewPanel devPassword={devPw} />
      </Collapsible>

      <Collapsible title="Logs & A/B results">
        <Grid cols={2}>
          <Card title="Server log">
            <pre className="dev-log">{log.slice(-8000) || 'Loading…'}</pre>
          </Card>
          <Card title="Voices & A/B">
            <pre className="dev-log">{JSON.stringify({ voices, ab }, null, 2).slice(0, 8000)}</pre>
          </Card>
        </Grid>
      </Collapsible>
    </div>
  )
}
