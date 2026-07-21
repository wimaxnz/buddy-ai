import { useCallback, useEffect, useState } from 'react'
import { emergencyStop, getStoredAuth } from '@/api/client'
import { useLiveData, useSettings, useWeather } from '@/api/hooks'
import { EmergencyFab, MobileNav, Sidebar, TopBar } from '@/components/layout/AppShell'
import { LoginGate } from '@/components/layout/LoginGate'
import { navItem, type ScreenId } from '@/navigation'
import { HomeScreen } from '@/screens/HomeScreen'
import { BuddyScreen } from '@/screens/BuddyScreen'
import { CameraScreen } from '@/screens/CameraScreen'
import { FamilyScreen } from '@/screens/FamilyScreen'
import { PhotosScreen } from '@/screens/PhotosScreen'
import { MemoryScreen } from '@/screens/MemoryScreen'
import { ClockWeatherScreen } from '@/screens/ClockWeatherScreen'
import { RoutinesScreen } from '@/screens/RoutinesScreen'
import { PrivacyScreen } from '@/screens/PrivacyScreen'
import { DeveloperScreen } from '@/screens/DeveloperScreen'

function readInitialScreen(): ScreenId {
  const hash = window.location.hash.replace('#', '')
  const allowed: ScreenId[] = ['home', 'buddy', 'camera', 'family', 'photos', 'memory', 'clock-weather', 'routines', 'privacy', 'developer']
  return allowed.includes(hash as ScreenId) ? (hash as ScreenId) : 'home'
}

export default function App() {
  const [authed, setAuthed] = useState(!!getStoredAuth())
  const [screen, setScreen] = useState<ScreenId>(readInitialScreen)
  const { data: live } = useLiveData(authed)
  const { data: weather } = useWeather(authed)
  const { settings, refresh: refreshSettings, loading: settingsLoading } = useSettings(authed)

  useEffect(() => {
    window.location.hash = screen
  }, [screen])

  const onNavigate = useCallback((id: ScreenId) => setScreen(id), [])
  const item = navItem(screen)
  const online = live?.online ?? false

  const onEmergency = async () => {
    if (!confirm('Emergency stop Buddy now?')) return
    await emergencyStop(String(settings?.developer_password ?? ''))
  }

  const renderScreen = () => {
    if (settingsLoading && !settings) {
      return <div className="screen-loading">Loading settings…</div>
    }
    if (!settings) {
      return <div className="screen-loading">Could not load settings.</div>
    }
    switch (screen) {
      case 'home':
        return <HomeScreen live={live} weather={weather} settings={settings} />
      case 'buddy':
        return <BuddyScreen settings={settings} live={live} onSaved={() => refreshSettings()} />
      case 'camera':
        return <CameraScreen settings={settings} live={live} onSaved={() => refreshSettings()} />
      case 'family':
        return <FamilyScreen settings={settings} onSaved={() => refreshSettings()} />
      case 'photos':
        return <PhotosScreen />
      case 'memory':
        return <MemoryScreen settings={settings} onSaved={() => refreshSettings()} />
      case 'clock-weather':
        return <ClockWeatherScreen settings={settings} weather={weather} onSaved={() => refreshSettings()} />
      case 'routines':
        return <RoutinesScreen settings={settings} onSaved={() => refreshSettings()} />
      case 'privacy':
        return <PrivacyScreen settings={settings} onSaved={() => refreshSettings()} />
      case 'developer':
        return <DeveloperScreen settings={settings} onRefreshSettings={() => refreshSettings()} />
      default:
        return null
    }
  }

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} />
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={screen}
        onNavigate={onNavigate}
        online={online}
        subtitle={live?.firmware_build ? String(live.firmware_build) : undefined}
      />
      <div className="app-main">
        <TopBar title={item?.label ?? 'Buddy AI'} group={item?.group} online={online} />
        <main className="app-content">{renderScreen()}</main>
      </div>
      <MobileNav active={screen} onNavigate={onNavigate} />
      <EmergencyFab onStop={onEmergency} />
    </div>
  )
}
