import type { BuddySettings, HealthResponse, LiveTelemetry, ParentStatus, WeatherLive } from './types'

const AUTH_KEY = 'buddy_dashboard_auth'

export function getStoredAuth(): string | null {
  try {
    return sessionStorage.getItem(AUTH_KEY)
  } catch {
    return null
  }
}

export function setStoredAuth(username: string, password: string) {
  const token = btoa(`${username}:${password}`)
  sessionStorage.setItem(AUTH_KEY, token)
}

export function clearStoredAuth() {
  sessionStorage.removeItem(AUTH_KEY)
}

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  const token = getStoredAuth()
  const h: Record<string, string> = { ...(extra as Record<string, string>) }
  if (token) h.Authorization = `Basic ${token}`
  return h
}

export function devHeaders(devPassword?: string): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (devPassword) h['X-Dev-Password'] = devPassword
  const token = getStoredAuth()
  if (token) h.Authorization = `Basic ${token}`
  return h
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: authHeaders(init.headers ?? {}),
  })
  if (res.status === 401) {
    clearStoredAuth()
    throw new Error('AUTH_REQUIRED')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}${text ? `: ${text.slice(0, 120)}` : ''}`)
  }
  if (res.status === 204) return undefined as T
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  return (await res.text()) as T
}

export async function fetchLive(): Promise<LiveTelemetry> {
  return request<LiveTelemetry>('/parent/live', { cache: 'no-store' })
}

export async function fetchSettings(): Promise<BuddySettings> {
  return request<BuddySettings>('/parent/settings')
}

export async function fetchParentStatus(): Promise<ParentStatus> {
  return request<ParentStatus>('/parent/status')
}

export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}

export async function fetchWeatherLive(): Promise<WeatherLive> {
  return request<WeatherLive>('/parent/weather-live')
}

export async function fetchDevLog(): Promise<string> {
  return request<string>('/dev/log')
}

export async function fetchDevVoices(): Promise<unknown> {
  return request('/dev/voices')
}

export async function fetchAbResults(): Promise<unknown> {
  return request('/dev/ab-results')
}

export async function postForm(url: string, form: FormData | URLSearchParams, devPw?: string) {
  const isDev = url.includes('/dev/')
  const headers = isDev
    ? devHeaders(devPw)
    : authHeaders()
  const res = await fetch(url, {
    method: 'POST',
    body: form,
    credentials: 'include',
    headers,
    redirect: 'follow',
  })
  if (res.status === 401) {
    clearStoredAuth()
    throw new Error('AUTH_REQUIRED')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

export async function postJson(url: string, body: unknown, devPw?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders() as Record<string, string> }
  if (url.includes('/dev/') && devPw) headers['X-Dev-Password'] = devPw
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
  })
  if (res.status === 401) {
    clearStoredAuth()
    throw new Error('AUTH_REQUIRED')
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json().catch(() => ({}))
}

export async function devCommand(name: string, arg = '', devPw?: string) {
  const body = new URLSearchParams({ name, arg })
  return postForm('/dev/command', body, devPw)
}

export async function emergencyStop(devPw?: string) {
  return devCommand('emergency_stop', '', devPw)
}

export function cameraPreviewUrl(): string {
  return `/camera/latest?t=${Date.now()}`
}

/** Build FormData for POST /dashboard/parent-settings from full settings object */
export function buildParentSettingsForm(s: BuddySettings): FormData {
  const fd = new FormData()
  const str = (k: string, d = '') => String(s[k] ?? d)
  const num = (k: string, d: number) => String(s[k] ?? d)
  const lines = (k: string) => (Array.isArray(s[k]) ? (s[k] as string[]).join('\n') : str(k))
  const chk = (k: string) => { if (s[k]) fd.append(k, 'on') }

  fd.set('child_name', str('child_name'))
  fd.set('child_age', num('child_age', 6))
  fd.set('toy_name', str('toy_name', 'Buddy'))
  fd.set('wake_phrase', str('wake_phrase', 'Hi Buddy'))
  fd.set('voice_volume', num('voice_volume', 80))
  fd.set('screen_brightness', num('screen_brightness', 140))
  fd.set('voice_speed', num('voice_speed', 1))
  fd.set('conversation_timeout_seconds', num('conversation_timeout_seconds', 25))
  chk('sleep_mode_enabled')
  fd.set('bedtime', str('bedtime', '20:00'))
  chk('captions_on')
  chk('history_enabled')
  if (!s.history_enabled && s.save_history) fd.append('history_enabled', 'on')
  chk('recordings_enabled')
  fd.set('sport_goal_minutes', num('sport_goal_minutes', 60))
  fd.set('study_goal_minutes', num('study_goal_minutes', 45))
  fd.set('screen_time_limit_minutes', num('screen_time_limit_minutes', 60))
  fd.set('trusted_family_members', lines('trusted_family_members'))
  fd.set('family_knowledge', lines('family_knowledge'))
  fd.set('local_world_knowledge', lines('local_world_knowledge'))
  fd.set('buddy_identity_notes', lines('buddy_identity_notes'))
  chk('face_recognition_enabled')
  chk('voice_recognition_enabled')
  chk('camera_enabled')
  chk('camera_preview_enabled')
  fd.set('camera_fps', num('camera_fps', 3))
  fd.set('camera_quality', num('camera_quality', 15))
  fd.set('camera_brightness', num('camera_brightness', 0))
  fd.set('camera_contrast', num('camera_contrast', 0))
  fd.set('eye_color', str('eye_color', '#3A9AD9'))
  fd.set('face_style', str('face_style', 'cute'))
  fd.set('animation_level', str('animation_level', 'normal'))
  fd.set('expression_intensity', num('expression_intensity', 0.85))
  fd.set('blink_frequency', num('blink_frequency', 1))
  fd.set('mouth_animation_strength', num('mouth_animation_strength', 0.85))
  fd.set('idle_display_mode', str('idle_display_mode', 'clock'))
  fd.set('idle_clock_timeout_sec', num('idle_clock_timeout_sec', 8))
  fd.set('clock_style', str('clock_style', 'sunny'))
  fd.set('clock_bg_color', str('clock_bg_color', '#08122A'))
  fd.set('clock_face_color', str('clock_face_color', '#0A1830'))
  fd.set('clock_ring_color', str('clock_ring_color', '#1E5AA0'))
  fd.set('clock_tick_color', str('clock_tick_color', '#1E5AA0'))
  fd.set('clock_number_color', str('clock_number_color', '#00C8FF'))
  fd.set('clock_ampm_color', str('clock_ampm_color', '#78A0BE'))
  fd.set('clock_date_color', str('clock_date_color', '#78A0BE'))
  fd.set('clock_hour_hand_color', str('clock_hour_hand_color', '#FF9500'))
  fd.set('clock_minute_hand_color', str('clock_minute_hand_color', '#78A0BE'))
  fd.set('clock_second_hand_color', str('clock_second_hand_color', '#FF453A'))
  fd.set('clock_weekday_color', str('clock_weekday_color', '#78A0BE'))
  fd.set('clock_day_number_color', str('clock_day_number_color', '#FFFFFF'))
  fd.set('clock_scale', num('clock_scale', 100))
  fd.set('clock_hand_thickness_hour', num('clock_hand_thickness_hour', 5))
  fd.set('clock_hand_thickness_minute', num('clock_hand_thickness_minute', 4))
  fd.set('clock_hand_thickness_second', num('clock_hand_thickness_second', 2))
  fd.set('clock_tick_size', num('clock_tick_size', 12))
  fd.set('clock_second_mode', str('clock_second_mode', 'step'))
  fd.set('clock_layout', str('clock_layout', 'classic_analog'))
  chk('clock_show_seconds')
  fd.set('clock_readability_preset', str('clock_readability_preset', 'normal'))
  chk('clock_high_contrast')
  fd.set('clock_weather_placement', str('clock_weather_placement', 'integrated'))
  fd.set('clock_animation_intensity', str('clock_animation_intensity', 'normal'))
  fd.set('forecast_mode', str('forecast_mode', 'current'))
  fd.set('forecast_timeout_sec', num('forecast_timeout_sec', 30))
  fd.set('location_country', str('location_country'))
  fd.set('location_city', str('location_city', str('home_city')))
  fd.set('location_region', str('location_region'))
  fd.set('location_timezone', str('location_timezone'))
  chk('location_auto')
  chk('location_manual_override')
  chk('weather_enabled')
  fd.set('weather_refresh_min', num('weather_refresh_min', 15))
  fd.set('temp_unit', str('temp_unit', 'celsius'))
  fd.set('wind_unit', str('wind_unit', 'kmh'))
  fd.set('clock_font_size', str('clock_font_size', 'large'))
  fd.set('clock_hour_format', str('clock_hour_format', '12'))
  chk('clock_show_ampm')
  chk('clock_show_date')
  fd.set('clock_brightness', num('clock_brightness', 100))
  fd.set('clock_anim_speed_ms', num('clock_anim_speed_ms', 110))
  fd.set('math_number_color', str('math_number_color', '#FFB43C'))
  fd.set('math_answer_color', str('math_answer_color', '#50FF8C'))
  fd.set('math_bg_color', str('math_bg_color', '#0C0E24'))
  fd.set('math_anim_speed_ms', num('math_anim_speed_ms', 1500))
  chk('math_border_enabled')
  fd.set('visual_result_timeout_sec', num('visual_result_timeout_sec', 30))
  chk('base_motion_enabled')
  chk('base_idle_motion')
  fd.set('base_speed_pct', num('base_speed_pct', 45))
  fd.set('base_range_pct', num('base_range_pct', 70))
  fd.set('base_expression_intensity', num('base_expression_intensity', 60))
  fd.set('base_sleep_pitch_tenths', num('base_sleep_pitch_tenths', 120))
  chk('base_reduce_while_charging')
  chk('base_lights_enabled')
  fd.set('base_light_brightness', num('base_light_brightness', 60))
  fd.set('base_night_brightness_cap', num('base_night_brightness_cap', 25))
  fd.set('base_light_anim_speed', num('base_light_anim_speed', 50))
  fd.set('base_light_pulse_intensity', num('base_light_pulse_intensity', 50))
  chk('base_light_audio_reactive')
  chk('base_lights_off')
  fd.set('base_light_idle', str('base_light_idle', '#4060A0'))
  fd.set('base_light_listening', str('base_light_listening', '#40C060'))
  fd.set('base_light_thinking', str('base_light_thinking', '#8060C0'))
  fd.set('base_light_speaking', str('base_light_speaking', '#40B0C0'))
  fd.set('base_light_happy', str('base_light_happy', '#D0B040'))
  fd.set('base_light_sleep', str('base_light_sleep', '#806030'))
  fd.set('base_light_error', str('base_light_error', '#802020'))
  fd.set('base_light_charging', str('base_light_charging', '#C08020'))
  fd.set('express_movement_intensity', num('express_movement_intensity', 0.6))
  fd.set('express_light_intensity', num('express_light_intensity', 0.6))
  fd.set('express_breath_intensity', num('express_breath_intensity', 0.5))
  fd.set('express_transition_speed', num('express_transition_speed', 1))
  chk('express_idle_movement')
  chk('express_speaking_movement')
  fd.set('express_night_movement_limit', num('express_night_movement_limit', 0.25))
  fd.set('dashboard_password', str('dashboard_password'))
  fd.set('developer_password', str('developer_password'))
  return fd
}

export async function saveParentSettings(s: BuddySettings) {
  return postForm('/dashboard/parent-settings', buildParentSettingsForm(s))
}

export function buildDevSettingsForm(s: BuddySettings): FormData {
  const fd = new FormData()
  const num = (k: string, d: number) => String(s[k] ?? d)
  const str = (k: string, d = '') => String(s[k] ?? d)
  const chk = (k: string) => { if (s[k]) fd.append(k, 'on') }
  fd.set('wake_sensitivity', num('wake_sensitivity', 6))
  fd.set('noise_floor_multiplier', num('noise_floor_multiplier', 2.5))
  fd.set('minimum_speech_ms', num('minimum_speech_ms', 500))
  fd.set('silence_end_ms', num('silence_end_ms', 750))
  fd.set('max_record_seconds', num('max_record_seconds', 8))
  fd.set('post_playback_rearm_ms', num('post_playback_rearm_ms', 600))
  fd.set('speaker_test_volume', num('speaker_test_volume', 140))
  fd.set('tts_engine', str('tts_engine', 'kokoro'))
  fd.set('tts_voice', str('tts_voice', 'af_heart'))
  fd.set('tts_sample_rate', num('tts_sample_rate', 24000))
  fd.set('playback_buffer_ms', num('playback_buffer_ms', 400))
  fd.set('stream_chunk_bytes', num('stream_chunk_bytes', 4096))
  chk('developer_mode')
  chk('serial_debug_enabled')
  return fd
}

export async function saveDevSettings(s: BuddySettings) {
  return postForm('/dashboard/dev-settings', buildDevSettingsForm(s))
}
