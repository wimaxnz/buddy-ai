import { useState } from 'react'
import { clearStoredAuth, setStoredAuth } from '@/api/client'
import { Button } from '@/components/ui/Button'

export function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('parent')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStoredAuth(username, password)
    try {
      const r = await fetch('/parent/settings', {
        credentials: 'include',
        headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
      })
      if (r.status === 401) {
        clearStoredAuth()
        setError('Wrong password. Try again.')
        return
      }
      if (!r.ok) {
        setError(`Could not reach BuddyAI server (HTTP ${r.status})`)
        return
      }
      onSuccess()
    } catch {
      setError('Could not reach BuddyAI server. Check it is running and proxy is configured.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-gate">
      <form className="login-card buddy-card" onSubmit={submit}>
        <div className="login-logo">B</div>
        <h1>Buddy AI</h1>
        <p>Sign in to your home Control Centre</p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-tertiary)' }}>
          Username <strong>parent</strong> · password from Security settings (default LAN: leave empty)
        </p>
        <label className="field">
          <span className="field-label">Username</span>
          <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
        </label>
        <label className="field">
          <span className="field-label">Dashboard password</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Leave empty if LAN dev mode" />
        </label>
        {error && <div className="login-error">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Connecting…' : 'Continue'}</Button>
      </form>
    </div>
  )
}
