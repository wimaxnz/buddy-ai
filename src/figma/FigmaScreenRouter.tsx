import { useLiveDataContext } from '@/context/LiveDataContext'
import { CameraScreen } from '@/screens/CameraScreen'
import { ClockWeatherScreen } from '@/screens/ClockWeatherScreen'
import { DeveloperScreen } from '@/screens/DeveloperScreen'
import { FamilyScreen } from '@/screens/FamilyScreen'
import { MemoryScreen } from '@/screens/MemoryScreen'
import { PhotosScreen } from '@/screens/PhotosScreen'
import { PrivacyScreen } from '@/screens/PrivacyScreen'
import { RoutinesScreen } from '@/screens/RoutinesScreen'
import {
  FigmaComingSoonScreen,
  FigmaDeviceStatusScreen,
  FigmaExpressionsPanelScreen,
  FigmaMechanicalScreen,
  FigmaPersonalityScreen,
  FigmaRgbScreen,
  FigmaStoriesScreen,
  FigmaTelemetryScreen,
  FigmaVoiceScreen,
} from '@/figma/FigmaFocusedScreens'

export type FigmaScreenId =
  | 'dashboard' | 'parent-dashboard' | 'buddy-face' | 'camera' | 'camera-preview' | 'photos' | 'photo-gallery'
  | 'family' | 'face-enrolment' | 'face-recognition' | 'personality' | 'expressions' | 'voice' | 'memory'
  | 'stories' | 'education' | 'routines' | 'clock' | 'weather' | 'mechanical' | 'rgb' | 'privacy' | 'security'
  | 'developer' | 'device-status' | 'telemetry'

/** Routes Figma nav IDs to integrated screens — Figma shell unchanged, content uses shared design tokens. */
export function FigmaScreenRouter({ id }: { id: FigmaScreenId }) {
  const { settings, weather, refreshSettings, loading } = useLiveDataContext()

  if (loading && !settings) {
    return <div className="screen-loading">Loading…</div>
  }

  const onSaved = () => { refreshSettings().catch(() => {}) }

  switch (id) {
    case 'camera':
      return <CameraScreen focus="all" />
    case 'camera-preview':
      return <CameraScreen focus="preview" />
    case 'face-recognition':
      return <CameraScreen focus="recognition" />
    case 'photos':
    case 'photo-gallery':
      return <PhotosScreen />
    case 'family':
    case 'face-enrolment':
      return settings ? <FamilyScreen settings={settings} onSaved={onSaved} /> : null
    case 'parent-dashboard':
      return (
        <FigmaComingSoonScreen
          title="Parent App"
          detail="The mobile parent companion app will connect here. Dashboard controls remain fully available on desktop and tablet."
        />
      )
    case 'education':
      return (
        <FigmaComingSoonScreen
          title="Education"
          detail="Learning sessions, curriculum progress, and educational games will appear here when the learning engine ships."
        />
      )
    case 'personality':
      return <FigmaPersonalityScreen />
    case 'expressions':
      return <FigmaExpressionsPanelScreen />
    case 'voice':
      return <FigmaVoiceScreen />
    case 'memory':
      return settings ? <MemoryScreen settings={settings} onSaved={onSaved} /> : null
    case 'stories':
      return <FigmaStoriesScreen />
    case 'routines':
      return settings ? <RoutinesScreen settings={settings} onSaved={onSaved} /> : null
    case 'clock':
      return settings ? <ClockWeatherScreen settings={settings} weather={weather} onSaved={onSaved} focus="clock" /> : null
    case 'weather':
      return settings ? <ClockWeatherScreen settings={settings} weather={weather} onSaved={onSaved} focus="weather" /> : null
    case 'mechanical':
      return <FigmaMechanicalScreen />
    case 'rgb':
      return <FigmaRgbScreen />
    case 'privacy':
      return settings ? <PrivacyScreen settings={settings} onSaved={onSaved} focus="privacy" /> : null
    case 'security':
      return settings ? <PrivacyScreen settings={settings} onSaved={onSaved} focus="security" /> : null
    case 'developer':
      return <DeveloperScreen />
    case 'device-status':
      return <FigmaDeviceStatusScreen />
    case 'telemetry':
      return <FigmaTelemetryScreen />
    default:
      return null
  }
}
