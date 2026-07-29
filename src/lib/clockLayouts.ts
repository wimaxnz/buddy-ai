/** Device/server clock layout ids (see BuddyAI server.py CLOCK_LAYOUTS). */
export const DEVICE_CLOCK_LAYOUTS = [
  'classic_analog',
  'modern_digital',
  'analog_weather',
  'minimal',
  'children',
  'realistic_weather',
  'night_bedside',
] as const

export type DeviceClockLayout = (typeof DEVICE_CLOCK_LAYOUTS)[number]

const LEGACY_LAYOUT_MAP: Record<string, DeviceClockLayout> = {
  modern_analog: 'classic_analog',
  digital: 'modern_digital',
  minimal_digital: 'minimal',
}

/** Map dashboard legacy layout names to device layout ids before save. */
export function normalizeClockLayout(raw: string | undefined | null): DeviceClockLayout {
  const v = String(raw ?? 'classic_analog').trim()
  if ((DEVICE_CLOCK_LAYOUTS as readonly string[]).includes(v)) return v as DeviceClockLayout
  return LEGACY_LAYOUT_MAP[v] ?? 'classic_analog'
}

export const CLOCK_LAYOUT_OPTIONS: { value: DeviceClockLayout; label: string }[] = [
  { value: 'classic_analog', label: 'Classic analog' },
  { value: 'modern_digital', label: 'Premium digital' },
  { value: 'analog_weather', label: 'Analog + weather' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'children', label: 'Kids rainbow' },
  { value: 'realistic_weather', label: 'Realistic weather' },
  { value: 'night_bedside', label: 'Night bedside' },
]

/** LivingDisplay theme used for dashboard preview (320×240). */
export type LivingDisplayTheme =
  | 'classic-analogue'
  | 'modern-analogue'
  | 'premium-digital'
  | 'minimal'
  | 'luxury'
  | 'kids'
  | 'futuristic'
  | 'elegant'

export function clockLayoutToPreviewTheme(layout: string | undefined | null): LivingDisplayTheme {
  switch (normalizeClockLayout(layout)) {
    case 'modern_digital':
      return 'premium-digital'
    case 'minimal':
    case 'night_bedside':
      return 'minimal'
    case 'children':
      return 'kids'
    case 'analog_weather':
    case 'realistic_weather':
      return 'classic-analogue'
    default:
      return 'classic-analogue'
  }
}
