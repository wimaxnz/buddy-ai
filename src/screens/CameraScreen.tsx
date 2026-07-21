import { useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings, LiveTelemetry } from '@/api/types'
import { CameraPreview } from '@/components/camera/CameraPreview'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, FutureBadge, SectionIntro, StatusRow } from '@/components/ui/Card'
import { SliderField, Toggle } from '@/components/ui/Fields'

export function CameraScreen({
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
  const enabled = !!draft.camera_enabled
  const preview = !!draft.camera_preview_enabled

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
      <SectionIntro title="Camera" subtitle="Live preview, privacy indicator, and capture settings — Phase 1 foundation." />

      <Grid cols={2}>
        <Card title="Live preview">
          <CameraPreview enabled={enabled && preview} fps={Number(draft.camera_fps ?? 3)} />
          <StatusRow label="Init OK" value={live?.camera_init_ok ? 'Yes' : 'No'} ok={!!live?.camera_init_ok} />
          <StatusRow label="FPS actual" value={live?.camera_fps_actual != null ? String(live.camera_fps_actual) : '—'} />
          <StatusRow label="Frames uploaded" value={String(live?.camera_frames_uploaded ?? '—')} />
        </Card>

        <Card title="Controls">
          <Toggle label="Camera enabled" hint="Turns on CoreS3 camera hardware" checked={enabled} onChange={v => set('camera_enabled', v)} />
          <Toggle label="Dashboard preview" hint="Shows live JPEG preview here" checked={preview} onChange={v => set('camera_preview_enabled', v)} />
          <SliderField label="Target FPS" value={Number(draft.camera_fps ?? 3)} min={1} max={10} onChange={v => set('camera_fps', v)} />
          <SliderField label="JPEG quality" value={Number(draft.camera_quality ?? 15)} min={5} max={30} onChange={v => set('camera_quality', v)} />
          <SliderField label="Brightness" value={Number(draft.camera_brightness ?? 0)} min={-2} max={2} onChange={v => set('camera_brightness', v)} />
          <SliderField label="Contrast" value={Number(draft.camera_contrast ?? 0)} min={-2} max={2} onChange={v => set('camera_contrast', v)} />
        </Card>
      </Grid>

      <Card title="Recognition" action={<FutureBadge />}>
        <p className="card-copy">Face detection and enrolment will appear here in Phase 2. Camera foundation must pass physical acceptance first.</p>
        <Toggle label="Face recognition (future)" checked={!!draft.face_recognition_enabled} onChange={v => set('face_recognition_enabled', v)} disabled />
      </Card>

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
