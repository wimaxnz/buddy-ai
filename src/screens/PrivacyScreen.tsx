import { useState } from 'react'
import { postForm, saveParentSettings } from '@/api/client'
import type { BuddySettings } from '@/api/types'
import { Button, SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro } from '@/components/ui/Card'
import { TextField, Toggle } from '@/components/ui/Fields'
import { maskSecret } from '@/api/hooks'

export function PrivacyScreen({ settings, onSaved, focus = 'all' }: {
  settings: BuddySettings
  onSaved: () => void
  focus?: 'all' | 'privacy' | 'security'
}) {
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await saveParentSettings(draft)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm('Clear all conversation history? This cannot be undone.')) return
    await postForm('/dashboard/history/clear', new FormData())
  }

  const title = focus === 'security' ? 'Security' : 'Privacy'
  const subtitle = focus === 'security'
    ? 'Dashboard and developer access passwords for your home Control Centre.'
    : 'Camera, microphone, recordings, and family data — you stay in control.'

  if (focus === 'security') {
    return (
      <div className="screen screen-enter">
        <SectionIntro title={title} subtitle={subtitle} />
        <Grid cols={2}>
          <Card title="Access passwords">
            <TextField label="Dashboard password" type="password"
              value={String(draft.dashboard_password ?? '')}
              onChange={v => setDraft({ ...draft, dashboard_password: v })}
              placeholder="Leave empty for LAN dev mode" />
            <p className="card-copy">Stored password shown masked after save: {maskSecret(draft.dashboard_password)}</p>
            <TextField label="Developer password" type="password"
              value={String(draft.developer_password ?? '')}
              onChange={v => setDraft({ ...draft, developer_password: v })} />
          </Card>
          <Card title="Data controls">
            <p className="card-copy">Destructive actions always ask for confirmation.</p>
            <div className="button-row">
              <Button variant="danger" onClick={clearHistory}>Clear conversation history</Button>
            </div>
          </Card>
        </Grid>
        <SaveBar saving={saving} onSave={save} />
      </div>
    )
  }

  return (
    <div className="screen screen-enter">
      <SectionIntro title={title} subtitle={subtitle} />

      <Grid cols={2}>
        <Card title="Permissions">
          <Toggle label="Camera enabled" checked={!!draft.camera_enabled}
            onChange={v => setDraft({ ...draft, camera_enabled: v })} />
          <Toggle label="Dashboard camera preview" checked={!!draft.camera_preview_enabled}
            onChange={v => setDraft({ ...draft, camera_preview_enabled: v })} />
          <Toggle label="Save conversation history" checked={!!(draft.history_enabled ?? draft.save_history)}
            onChange={v => setDraft({ ...draft, history_enabled: v, save_history: v })} />
          <Toggle label="Allow local recordings" checked={draft.recordings_enabled !== false}
            onChange={v => setDraft({ ...draft, recordings_enabled: v })} />
          <Toggle label="Face recognition" checked={!!draft.face_recognition_enabled}
            onChange={v => setDraft({ ...draft, face_recognition_enabled: v })} />
          <Toggle label="Voice recognition" checked={!!draft.voice_recognition_enabled}
            onChange={v => setDraft({ ...draft, voice_recognition_enabled: v })} />
        </Card>

        <Card title="Security">
          <TextField label="Dashboard password" type="password"
            value={String(draft.dashboard_password ?? '')}
            onChange={v => setDraft({ ...draft, dashboard_password: v })}
            placeholder="Leave empty for LAN dev mode" />
          <p className="card-copy">Stored password shown masked after save: {maskSecret(draft.dashboard_password)}</p>
          <TextField label="Developer password" type="password"
            value={String(draft.developer_password ?? '')}
            onChange={v => setDraft({ ...draft, developer_password: v })} />
        </Card>
      </Grid>

      <Card title="Data controls">
        <p className="card-copy">Destructive actions always ask for confirmation.</p>
        <div className="button-row">
          <Button variant="danger" onClick={clearHistory}>Clear conversation history</Button>
        </div>
      </Card>

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
