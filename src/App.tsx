import { useEffect, useState } from 'react'
import { getStoredAuth } from '@/api/client'
import { LiveDataProvider } from '@/context/LiveDataContext'
import { ThemeProvider } from '@/context/ThemeProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { EmergencyFab, MobileNav, Sidebar, TopBar } from '@/components/layout/AppShell'
import { LoginGate } from '@/components/layout/LoginGate'
import { emergencyStop } from '@/api/client'
import { useLiveDataContext } from '@/context/LiveDataContext'
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

function AppRoutes() {
  const [screen, setScreen] = useState<ScreenId>(readInitialScreen)
  const { live, settings, weather, loading, refreshSettings } = useLiveDataContext()
  const item = navItem(screen)
  const online = live?.online ?? false

  useEffect(() => {
    window.location.hash = screen
  }, [screen])

  const onNavigate = (id: ScreenId) => setScreen(id)

  const onEmergency = async () => {
    if (!confirm('Emergency stop Buddy now?')) return
    await emergencyStop(String(settings?.developer_password ?? ''))
  }

  const renderScreen = () => {
    if (loading && !settings && screen !== 'photos') {
      return <div className="screen-loading">Loading…</div>
    }
    switch (screen) {
      case 'home': return <HomeScreen />
      case 'buddy': return <BuddyScreen />
      case 'camera': return <CameraScreen />
      case 'family': return settings ? <FamilyScreen settings={settings} onSaved={refreshSettings} /> : null
      case 'photos': return <PhotosScreen />
      case 'memory': return settings ? <MemoryScreen settings={settings} onSaved={refreshSettings} /> : null
      case 'clock-weather': return settings ? <ClockWeatherScreen settings={settings} weather={weather} onSaved={refreshSettings} /> : null
      case 'routines': return settings ? <RoutinesScreen settings={settings} onSaved={refreshSettings} /> : null
      case 'privacy': return settings ? <PrivacyScreen settings={settings} onSaved={refreshSettings} /> : null
      case 'developer': return <DeveloperScreen />
      default: return null
    }
  }

  return (
    <div className="app-shell">
      <Sidebar active={screen} onNavigate={onNavigate} online={online} subtitle={live?.firmware_build ? String(live.firmware_build) : undefined} />
      <div className="app-main">
        <TopBar title={item?.label ?? 'Buddy AI'} group={item?.group} online={online} />
        <main className="app-content">{renderScreen()}</main>
      </div>
      <MobileNav active={screen} onNavigate={onNavigate} />
      <EmergencyFab onStop={onEmergency} />
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(!!getStoredAuth())

  if (!authed) {
    return (
      <ThemeProvider>
        <LoginGate onSuccess={() => setAuthed(true)} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <LiveDataProvider>
          <AppRoutes />
        </LiveDataProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
