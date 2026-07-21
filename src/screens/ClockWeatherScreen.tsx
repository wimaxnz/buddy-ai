import { useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings, WeatherLive } from '@/api/types'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro, StatusRow } from '@/components/ui/Card'
import { ColorField, SelectField, SliderField, TextField, Toggle } from '@/components/ui/Fields'

export function ClockWeatherScreen({
  settings,
  weather,
  onSaved,
}: {
  settings: BuddySettings
  weather: WeatherLive | null
  onSaved: () => void
}) {
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)
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
      <SectionIntro title="Clock & Weather" subtitle="Analog and digital layouts, colours, and live weather for Buddy's face display." />

      <Grid cols={2}>
        <Card title="Live weather">
          <StatusRow label="Location" value={weather?.city || String(draft.location_city || draft.home_city || '—')} />
          <StatusRow label="Now" value={weather?.temp_display ? `${weather.temp_display} · ${weather.condition ?? ''}` : '—'} />
          <StatusRow label="Wind" value={weather?.wind_display || '—'} />
          <Toggle label="Weather enabled" checked={draft.weather_enabled !== false} onChange={v => set('weather_enabled', v)} />
          <TextField label="City" value={String(draft.location_city ?? draft.home_city ?? '')} onChange={v => { set('location_city', v); set('home_city', v) }} />
          <SelectField label="Temperature unit" value={String(draft.temp_unit ?? 'celsius')}
            options={[{ value: 'celsius', label: 'Celsius' }, { value: 'fahrenheit', label: 'Fahrenheit' }]}
            onChange={v => set('temp_unit', v)} />
        </Card>

        <Card title="Clock layout">
          <SelectField label="Layout" value={String(draft.clock_layout ?? 'classic_analog')}
            options={[
              { value: 'classic_analog', label: 'Classic analog' },
              { value: 'modern_analog', label: 'Modern analog' },
              { value: 'digital', label: 'Digital' },
              { value: 'minimal_digital', label: 'Minimal digital' },
            ]}
            onChange={v => set('clock_layout', v)} />
          <SelectField label="Style" value={String(draft.clock_style ?? 'sunny')}
            options={[
              { value: 'sunny', label: 'Sunny' },
              { value: 'ocean', label: 'Ocean' },
              { value: 'forest', label: 'Forest' },
              { value: 'night', label: 'Night' },
            ]}
            onChange={v => set('clock_style', v)} />
          <SelectField label="Hour format" value={String(draft.clock_hour_format ?? '12')}
            options={[{ value: '12', label: '12-hour' }, { value: '24', label: '24-hour' }]}
            onChange={v => set('clock_hour_format', v)} />
          <Toggle label="Show seconds" checked={draft.clock_show_seconds !== false} onChange={v => set('clock_show_seconds', v)} />
          <Toggle label="Show date" checked={draft.clock_show_date !== false} onChange={v => set('clock_show_date', v)} />
          <Toggle label="High contrast" checked={!!draft.clock_high_contrast} onChange={v => set('clock_high_contrast', v)} />
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Clock colours">
          <ColorField label="Background" value={String(draft.clock_bg_color ?? '#08122A')} onChange={v => set('clock_bg_color', v)} />
          <ColorField label="Face" value={String(draft.clock_face_color ?? '#0A1830')} onChange={v => set('clock_face_color', v)} />
          <ColorField label="Numbers" value={String(draft.clock_number_color ?? '#00C8FF')} onChange={v => set('clock_number_color', v)} />
          <ColorField label="Hour hand" value={String(draft.clock_hour_hand_color ?? '#FF9500')} onChange={v => set('clock_hour_hand_color', v)} />
          <ColorField label="Date" value={String(draft.clock_date_color ?? '#78A0BE')} onChange={v => set('clock_date_color', v)} />
          <SliderField label="Brightness" value={Number(draft.clock_brightness ?? 100)} min={20} max={100} unit="%" onChange={v => set('clock_brightness', v)} />
        </Card>
        <Card title="Weather on clock">
          <SelectField label="Weather placement" value={String(draft.clock_weather_placement ?? 'integrated')}
            options={[
              { value: 'integrated', label: 'Integrated (9 o\'clock temp)' },
              { value: 'corner', label: 'Corner' },
              { value: 'hidden', label: 'Hidden' },
            ]}
            onChange={v => set('clock_weather_placement', v)} />
          <SelectField label="Forecast mode" value={String(draft.forecast_mode ?? 'current')}
            options={[{ value: 'current', label: 'Current' }, { value: 'hourly', label: 'Hourly preview' }]}
            onChange={v => set('forecast_mode', v)} />
          <SliderField label="Weather refresh (min)" value={Number(draft.weather_refresh_min ?? 15)} min={5} max={120} onChange={v => set('weather_refresh_min', v)} />
        </Card>
      </Grid>

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
