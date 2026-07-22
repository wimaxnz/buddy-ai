import { useState } from 'react'
import { getStoredAuth } from '@/api/client'
import { LiveDataProvider } from '@/context/LiveDataContext'
import { ThemeProvider } from '@/context/ThemeProvider'
import { ToastProvider } from '@/context/ToastProvider'
import { LoginGate } from '@/components/layout/LoginGate'
import { FigmaDashboard } from '@/figma/FigmaDashboard'

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
          <FigmaDashboard />
        </LiveDataProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
