import { useEffect, useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings, LiveTelemetry, WeatherLive } from '@/api/types'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro, StatusRow } from '@/components/ui/Card'
import { ColorField, SelectField, SliderField, TextField, Toggle } from '@/components/ui/Fields'
import { useLiveDataContext } from '@/context/LiveDataContext'
import {
  CLOCK_LAYOUT_OPTIONS,
  clockLayoutToPreviewTheme,
  normalizeClockLayout,
} from '@/lib/clockLayouts'
import { BuddyLivingDisplay, mapWeatherFromCondition } from '@/screens/LivingDisplay'

const CLOCK_STYLE_OPTIONS = [
  { value: 'sunny', label: 'Sunny' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'night', label: 'Night' },
  { value: 'rainbow', label: 'Rainbow (kids)' },
]

function ClockLayoutFields({
  draft,
  set,
}: {
  draft: BuddySettings
  set: (k: string, v: unknown) => void
}) {
  const layout = normalizeClockLayout(String(draft.clock_layout ?? 'classic_analog'))
  return (
    <>
      <SelectField
        label="Layout"
        value={layout}
        options={CLOCK_LAYOUT_OPTIONS}
        onChange={v => set('clock_layout', v)}
      />
      <SelectField
        label="Style"
        value={String(draft.clock_style ?? 'sunny')}
        options={CLOCK_STYLE_OPTIONS}
        onChange={v => set('clock_style', v)}
      />
      <SelectField
        label="Hour format"
        value={String(draft.clock_hour_format ?? '12')}
        options={[{ value: '12', label: '12-hour' }, { value: '24', label: '24-hour' }]}
        onChange={v => set('clock_hour_format', v)}
      />
      <Toggle
        label="Show seconds"
        checked={draft.clock_show_seconds !== false}
        onChange={v => set('clock_show_seconds', v)}
      />
      <Toggle
        label="Show date"
        checked={draft.clock_show_date !== false}
        onChange={v => set('clock_show_date', v)}
      />
      <Toggle
        label="High contrast"
        checked={!!draft.clock_high_contrast}
        onChange={v => set('clock_high_contrast', v)}
      />
    </>
  )
}

function ClockLivePreview({
  draft,
  weather,
}: {
  draft: BuddySettings
  weather: WeatherLive | null
}) {
  const layout = normalizeClockLayout(String(draft.clock_layout ?? 'classic_analog'))
  const previewTheme = clockLayoutToPreviewTheme(layout)
  const previewWeather = mapWeatherFromCondition(weather?.condition)
  const ageMode = layout === 'children' ? 'child' as const : 'adult' as const
  const tempDisplay = weather?.temp_display || '--°'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        borderRadius: 20,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(79,142,247,0.25) 0%, transparent)',
        boxShadow: '0 0 40px rgba(79,142,247,0.12)',
      }}>
        <BuddyLivingDisplay
          weather={previewWeather}
          theme={previewTheme}
          ageMode={ageMode}
          todOverride="auto"
          tempDisplay={tempDisplay}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textAlign: 'center' }}>
        320 × 240 · Figma living display preview
        <br />
        Device layout: {layout.replace(/_/g, ' ')}
        {weather?.condition ? ` · ${weather.condition}` : ''}
      </div>
    </div>
  )
}

function DeviceClockSync({ live, draft }: { live: LiveTelemetry | null; draft: BuddySettings }) {
  const savedLayout = normalizeClockLayout(String(draft.clock_layout ?? 'classic_analog'))
  const savedIdle = String(draft.idle_display_mode ?? 'face')
  const deviceLayout = live?.clock_layout
    ? normalizeClockLayout(String(live.clock_layout))
    : null
  const deviceIdle = live?.idle_display_mode ? String(live.idle_display_mode) : null
  const layoutOk = !deviceLayout || deviceLayout === savedLayout
  const idleOk = !deviceIdle || deviceIdle === savedIdle
  const clockActive = live?.idle_clock_active === true
  const online = live?.online !== false
  const facePreview = live?.face_preview_active === true

  return (
    <Card title="Device sync">
      <StatusRow
        label="Buddy online"
        value={online ? 'Yes' : 'Offline'}
        ok={online}
      />
      {facePreview ? (
        <p style={{ fontSize: 12, color: 'var(--warn, #e6a817)', margin: '0 0 8px' }}>
          Expression preview is overriding the clock on device — save clock settings again or wait ~45s.
        </p>
      ) : null}
      <StatusRow
        label="Layout on device"
        value={deviceLayout ? deviceLayout.replace(/_/g, ' ') : '—'}
        ok={layoutOk}
      />
      <StatusRow
        label="Idle mode on device"
        value={deviceIdle ?? '—'}
        ok={idleOk}
      />
      <StatusRow
        label="Clock showing now"
        value={clockActive ? 'Yes' : 'No (face or busy)'}
        ok={savedIdle === 'clock' ? clockActive : undefined}
      />
      <StatusRow
        label="Weather on device"
        value={live?.weather_temp_display
          ? `${live.weather_temp_display}${live.weather_condition ? ` · ${live.weather_condition}` : ''}`
          : '—'}
      />
      <StatusRow
        label="Math board on device"
        value={live?.math_display_active ? 'Yes' : 'No'}
        ok={!!live?.math_display_active}
      />
      {!layoutOk || !idleOk ? (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
          Save again or wait a few seconds — Buddy polls settings every 1.5s after save.
        </p>
      ) : null}
    </Card>
  )
}

export function ClockWeatherScreen({
  settings,
  weather,
  onSaved,
  focus = 'all',
}: {
  settings: BuddySettings
  weather: WeatherLive | null
  onSaved: () => void
  focus?: 'clock' | 'weather' | 'all'
}) {
  const { live, patchSettings } = useLiveDataContext()
  const [draft, setDraft] = useState(() => ({
    ...settings,
    clock_layout: normalizeClockLayout(String(settings.clock_layout ?? 'classic_analog')),
  }))
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => setDraft(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    setDraft({
      ...settings,
      clock_layout: normalizeClockLayout(String(settings.clock_layout ?? 'classic_analog')),
    })
  }, [settings])

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...draft,
        clock_layout: normalizeClockLayout(String(draft.clock_layout ?? 'classic_analog')),
        idle_display_mode:
          draft.idle_display_mode === 'off' ? 'alternate' : (draft.idle_display_mode ?? 'face'),
      }
      await saveParentSettings(payload)
      patchSettings(payload)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const title = focus === 'clock' ? 'Clock Settings' : focus === 'weather' ? 'Weather Settings' : 'Clock & Weather'
  const subtitle = focus === 'clock'
    ? 'Figma-matched clock preview and device layout — what you see here is what Buddy shows at idle.'
    : focus === 'weather'
      ? 'Live weather, location, and forecast settings for Buddy\'s face display.'
      : 'Analog and digital layouts, colours, and live weather for Buddy\'s face display.'

  const showClockPreview = focus === 'clock' || focus === 'all'

  return (
    <div className="screen screen-enter">
      <SectionIntro title={title} subtitle={subtitle} />

      {showClockPreview && (
        <Card title="Live clock preview">
          <ClockLivePreview draft={draft} weather={weather} />
        </Card>
      )}

      {(focus === 'clock' || focus === 'all') && (
        <DeviceClockSync live={live} draft={draft} />
      )}

      {(focus === 'all' || focus === 'weather') && <Grid cols={2}>
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

        {focus === 'weather' && (
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
        )}

        {focus === 'all' && (
          <Card title="Clock layout">
            <ClockLayoutFields draft={draft} set={set} />
          </Card>
        )}
      </Grid>}

      {(focus === 'all' || focus === 'clock') && <Grid cols={2}>
        <Card title="Clock colours">
          <ColorField label="Background" value={String(draft.clock_bg_color ?? '#08122A')} onChange={v => set('clock_bg_color', v)} />
          <ColorField label="Face" value={String(draft.clock_face_color ?? '#0A1830')} onChange={v => set('clock_face_color', v)} />
          <ColorField label="Numbers" value={String(draft.clock_number_color ?? '#00C8FF')} onChange={v => set('clock_number_color', v)} />
          <ColorField label="Hour hand" value={String(draft.clock_hour_hand_color ?? '#FF9500')} onChange={v => set('clock_hour_hand_color', v)} />
          <ColorField label="Date" value={String(draft.clock_date_color ?? '#78A0BE')} onChange={v => set('clock_date_color', v)} />
          <SliderField label="Brightness" value={Number(draft.clock_brightness ?? 100)} min={20} max={100} unit="%" onChange={v => set('clock_brightness', v)} />
        </Card>

        {focus === 'all' && (
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
        )}

        {focus === 'clock' && (
          <Card title="Clock layout & idle">
            <ClockLayoutFields draft={draft} set={set} />
            <SelectField
              label="Idle display"
              value={String(draft.idle_display_mode ?? 'face')}
              options={[
                { value: 'face', label: 'Buddy face (default)' },
                { value: 'clock', label: 'Clock at idle' },
                { value: 'alternate', label: 'Alternate face / clock' },
              ]}
              onChange={v => set('idle_display_mode', v)}
            />
            <SliderField
              label="Idle timeout (s)"
              value={Number(draft.idle_clock_timeout_sec ?? 8)}
              min={3}
              max={60}
              onChange={v => set('idle_clock_timeout_sec', v)}
            />
          </Card>
        )}
      </Grid>}

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
