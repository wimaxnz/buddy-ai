import { useEffect, useState } from 'react'
import { saveParentSettings } from '@/api/client'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { CameraPreview } from '@/components/camera/CameraPreview'
import { SaveBar } from '@/components/ui/Button'
import { Card, FutureBadge, Grid, SectionIntro, StatusChip, StatusRow } from '@/components/ui/Card'
import { SliderField, Toggle } from '@/components/ui/Fields'

export function CameraScreen({ focus = 'all' }: { focus?: 'all' | 'preview' | 'recognition' }) {
  const { live, settings, refreshSettings } = useLiveDataContext()
  const toast = useToast()
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (settings) setDraft(settings) }, [settings])
  if (!settings || !draft) return null

  const enabled = !!draft.camera_enabled
  const preview = !!draft.camera_preview_enabled
  const set = (k: string, v: unknown) => setDraft(prev => ({ ...(prev || settings), [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveParentSettings(draft)
      await refreshSettings()
      toast.success('Camera settings saved.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const qualityLabel = live?.camera_init_ok ? 'Good' : live?.camera_enabled ? 'Starting' : 'Off'
  const connection = live?.online ? (live.camera_active ? 'Streaming' : 'Connected, waiting') : 'Device offline'

  const title = focus === 'preview' ? 'Camera Preview' : focus === 'recognition' ? 'Face Recognition' : 'Camera'
  const subtitle = focus === 'preview'
    ? 'Live stream from Buddy with privacy and connection indicators.'
    : focus === 'recognition'
      ? 'Face detection and recognition settings — enrolment coming soon.'
      : 'Live view from Buddy with clear privacy and quality indicators.'

  if (focus === 'preview') {
    return (
      <div className="screen screen-enter camera-screen">
        <SectionIntro title={title} subtitle={subtitle} />
        <Card title="Live preview" action={<StatusChip label={connection} tone={live?.camera_active ? 'green' : 'yellow'} />}>
          <CameraPreview enabled={enabled && preview} fps={Number(draft.camera_fps ?? 3)} large />
          <div className="camera-indicators">
            <StatusChip label={enabled ? 'Camera on' : 'Camera off'} tone={enabled ? 'green' : 'neutral'} />
            <StatusChip label="Privacy active on device" tone="blue" />
            {live?.camera_active && <StatusChip label="Capturing" tone="green" />}
          </div>
        </Card>
        <Grid cols={2}>
          <Card title="Status">
            <StatusRow label="Connection" value={connection} />
            <StatusRow label="FPS actual" value={live?.camera_fps_actual != null ? String(live.camera_fps_actual) : '—'} />
            <StatusRow label="Last frame" value={live?.camera_last_frame_bytes ? `${live.camera_last_frame_bytes} bytes` : '—'} />
          </Card>
          <Card title="Preview controls">
            <Toggle label="Dashboard preview" checked={preview} onChange={v => set('camera_preview_enabled', v)} />
            <SaveBar saving={saving} onSave={save} label="Save preview" />
          </Card>
        </Grid>
      </div>
    )
  }

  if (focus === 'recognition') {
    return (
      <div className="screen screen-enter camera-screen">
        <SectionIntro title={title} subtitle={subtitle} />
        <Grid cols={2}>
          <Card title="Face detection" action={<FutureBadge />}>
            <p className="card-copy">Recognition and enrolment UI will appear here when Phase 2 ships. Toggle prepares the device setting.</p>
            <Toggle label="Face recognition" checked={!!draft.face_recognition_enabled} onChange={v => set('face_recognition_enabled', v)} />
            <StatusRow label="Recognised user" value={String(live?.recognised_user || '—')} />
          </Card>
          <Card title="Camera status">
            <StatusRow label="Camera" value={enabled ? 'Enabled' : 'Disabled'} ok={enabled} />
            <StatusRow label="Init" value={live?.camera_init_ok ? 'Ready' : 'Not ready'} ok={!!live?.camera_init_ok} />
            <SaveBar saving={saving} onSave={save} label="Save recognition" />
          </Card>
        </Grid>
      </div>
    )
  }

  return (
    <div className="screen screen-enter camera-screen">
      <SectionIntro title={title} subtitle={subtitle} />

      <div className="camera-layout">
        <Card title="Live preview" action={<StatusChip label={connection} tone={live?.camera_active ? 'green' : 'yellow'} />}>
          <CameraPreview enabled={enabled && preview} fps={Number(draft.camera_fps ?? 3)} large />
          <div className="camera-indicators">
            <StatusChip label={enabled ? 'Camera on' : 'Camera off'} tone={enabled ? 'green' : 'neutral'} />
            <StatusChip label="Privacy active on device" tone="blue" />
            {live?.camera_active && <StatusChip label="Capturing" tone="green" />}
          </div>
        </Card>

        <div className="camera-side">
          <Card title="Status">
            <StatusRow label="Connection" value={connection} />
            <StatusRow label="Init" value={live?.camera_init_ok ? 'Ready' : 'Not ready'} ok={!!live?.camera_init_ok} />
            <StatusRow label="Sensor" value={String(live?.camera_sensor || 'GC0308')} />
            <StatusRow label="Resolution" value={live?.camera_frame_width ? `${live.camera_frame_width}×${live.camera_frame_height}` : '320×240'} />
            <StatusRow label="FPS target" value={String(live?.camera_fps_target ?? draft.camera_fps ?? '—')} />
            <StatusRow label="FPS actual" value={live?.camera_fps_actual != null ? String(live.camera_fps_actual) : '—'} />
            <StatusRow label="Last frame" value={live?.camera_last_frame_bytes ? `${live.camera_last_frame_bytes} bytes` : '—'} />
            <StatusRow label="Quality" value={qualityLabel} />
          </Card>

          <Card title="Controls">
            <Toggle label="Camera enabled" checked={enabled} onChange={v => set('camera_enabled', v)} />
            <Toggle label="Dashboard preview" checked={preview} onChange={v => set('camera_preview_enabled', v)} />
            <SliderField label="Target FPS" value={Number(draft.camera_fps ?? 3)} min={1} max={10} onChange={v => set('camera_fps', v)} />
            <SliderField label="JPEG quality" value={Number(draft.camera_quality ?? 15)} min={5} max={30} onChange={v => set('camera_quality', v)} />
            <SliderField label="Brightness" value={Number(draft.camera_brightness ?? 0)} min={-2} max={2} onChange={v => set('camera_brightness', v)} />
            <SliderField label="Contrast" value={Number(draft.camera_contrast ?? 0)} min={-2} max={2} onChange={v => set('camera_contrast', v)} />
            <SaveBar saving={saving} onSave={save} label="Save camera" />
          </Card>
        </div>
      </div>

      <Grid cols={2}>
        <Card title="Face detection" action={<FutureBadge />}>
          <p className="card-copy">Detection, recognition, and enrolment controls will appear here in Phase 2.</p>
          <Toggle label="Face recognition" checked={!!draft.face_recognition_enabled} onChange={() => {}} disabled />
        </Card>
        <Card title="Photo capture" action={<FutureBadge />}>
          <p className="card-copy">Capture and gallery will connect when the photo backend ships.</p>
        </Card>
      </Grid>
    </div>
  )
}
