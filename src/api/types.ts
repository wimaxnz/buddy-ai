/** Live telemetry from GET /parent/live */
export interface LiveTelemetry {
  device_id?: string
  online?: boolean
  last_seen_seconds_ago?: number
  last_wake_seconds_ago?: number
  state?: string
  last_heard?: string
  last_reply?: string
  last_error?: string
  emotion?: string
  face_state?: string
  express_face?: string
  express_profile?: string
  recognised_user?: string
  firmware_build?: string
  base_battery_pct?: number
  base_battery_v?: number
  base_charging?: boolean
  base_pos_x?: number
  base_pos_y?: number
  express_head_target_x?: number
  express_head_target_y?: number
  express_head_actual_x?: number
  express_head_actual_y?: number
  express_rgb_bright?: number
  first_sound_ms?: number
  turn_total_ms?: number
  queue_underruns_total?: number
  stt_ms?: number
  llm_ms?: number
  tts_ms?: number
  camera_enabled?: boolean
  camera_active?: boolean
  camera_init_ok?: boolean
  camera_fps_actual?: number
  camera_fps_target?: number
  camera_last_frame?: number
  camera_frames_captured?: number
  camera_frames_uploaded?: number
  pending_command?: { id?: string; name?: string; status?: string } | null
  [key: string]: unknown
}

export interface ParentStatus {
  whisper_ready?: boolean
  deepseek_ready?: boolean
  uptime_seconds?: number
  timezone?: string
  history_size?: number
  [key: string]: unknown
}

export interface WeatherLive {
  ok?: boolean
  offline?: boolean
  temp_display?: string
  condition?: string
  city?: string
  timezone?: string
  wind_display?: string
  humidity?: number
  [key: string]: unknown
}

export type BuddySettings = Record<string, unknown>

export interface HealthResponse {
  status?: string
  uptime_seconds?: number
  [key: string]: unknown
}
