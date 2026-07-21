import { useEffect, useState } from 'react'
import { saveParentSettings } from '@/api/client'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { BuddyFaceScreen } from '@/components/buddy/BuddyFaceScreen'
import { LiveBuddyFacePanel } from '@/components/buddy/LiveBuddyFacePanel'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro } from '@/components/ui/Card'
import { ColorField, SelectField, SliderField, Toggle } from '@/components/ui/Fields'

export function BuddyScreen() {
  const { live, settings, refreshSettings } = useLiveDataContext()
  const toast = useToast()
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'live' | 'settings' | 'expressions'>('live')

  useEffect(() => { if (settings) setDraft(settings) }, [settings])

  if (!settings || !draft) return null

  const set = (k: string, v: unknown) => setDraft(prev => ({ ...(prev || settings), [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      await saveParentSettings(draft)
      await refreshSettings()
      toast.success('Buddy settings saved.')
    } catch {
      toast.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen screen-enter">
      <SectionIntro title="Buddy" subtitle="See exactly what Buddy shows — face, voice, movement, and lights." />

      <div className="tab-row">
        {(['live', 'settings', 'expressions'] as const).map(t => (
          <button key={t} type="button" className={`tab-btn${tab === t ? ' is-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'live' ? 'Live face' : t === 'settings' ? 'Settings' : 'Expression library'}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <LiveBuddyFacePanel live={live} settings={settings} />
      )}

      {tab === 'expressions' && (
        <BuddyFaceScreen live={live} liveMode={false} />
      )}

      {tab === 'settings' && (
        <>
          <Grid cols={2}>
            <Card title="Face">
              <SelectField label="Face style" value={String(draft.face_style ?? 'cute')}
                options={[{ value: 'cute', label: 'Cute' }, { value: 'round', label: 'Round' }, { value: 'classic', label: 'Classic' }]}
                onChange={v => set('face_style', v)} />
              <ColorField label="Eye colour" value={String(draft.eye_color ?? '#3A9AD9')} onChange={v => set('eye_color', v)} />
              <SliderField label="Volume" value={Number(draft.voice_volume ?? 80)} min={0} max={100} unit="%" onChange={v => set('voice_volume', v)} />
              <SliderField label="Brightness" value={Number(draft.screen_brightness ?? 140)} min={20} max={255} onChange={v => set('screen_brightness', v)} />
            </Card>
            <Card title="StackChan & RGB">
              <Toggle label="Base motion" checked={draft.base_motion_enabled !== false} onChange={v => set('base_motion_enabled', v)} />
              <Toggle label="RGB lights" checked={draft.base_lights_enabled !== false} onChange={v => set('base_lights_enabled', v)} />
              <SliderField label="Light brightness" value={Number(draft.base_light_brightness ?? 60)} min={0} max={100} unit="%" onChange={v => set('base_light_brightness', v)} />
              <SliderField label="Movement intensity" value={Number(draft.express_movement_intensity ?? 0.6)} min={0} max={1} step={0.05} onChange={v => set('express_movement_intensity', v)} />
            </Card>
          </Grid>
          <SaveBar saving={saving} onSave={save} />
        </>
      )}
    </div>
  )
}
