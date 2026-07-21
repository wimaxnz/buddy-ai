import { useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings } from '@/api/types'
import { SaveBar } from '@/components/ui/Button'
import { Card, FutureBadge, Grid, SectionIntro } from '@/components/ui/Card'
import { TextField, Toggle } from '@/components/ui/Fields'

function linesToText(v: unknown): string {
  return Array.isArray(v) ? v.join('\n') : String(v ?? '')
}

function textToLines(s: string): string[] {
  return s.split('\n').map(l => l.trim()).filter(Boolean)
}

export function FamilyScreen({ settings, onSaved }: { settings: BuddySettings; onSaved: () => void }) {
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

  return (
    <div className="screen">
      <SectionIntro title="Family" subtitle="Profiles, trusted adults, and permissions for a safe home experience." />

      <Grid cols={2}>
        <Card title="Child profile">
          <TextField label="Child name" value={String(draft.child_name ?? '')} onChange={v => setDraft({ ...draft, child_name: v })} />
          <TextField label="Age" value={String(draft.child_age ?? 6)} onChange={v => setDraft({ ...draft, child_age: Number(v) || 6 })} />
          <TextField label="Bedtime" value={String(draft.bedtime ?? '20:00')} onChange={v => setDraft({ ...draft, bedtime: v })} />
        </Card>

        <Card title="Trusted adults" action={<FutureBadge />}>
          <TextField label="Family members (one per line)" multiline
            value={linesToText(draft.trusted_family_members)}
            onChange={v => setDraft({ ...draft, trusted_family_members: textToLines(v) })}
            placeholder="Mum&#10;Dad&#10;Grandma" />
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Permissions">
          <Toggle label="Voice recognition" checked={!!draft.voice_recognition_enabled}
            onChange={v => setDraft({ ...draft, voice_recognition_enabled: v })} />
          <Toggle label="Face recognition" checked={!!draft.face_recognition_enabled}
            onChange={v => setDraft({ ...draft, face_recognition_enabled: v })} />
          <Toggle label="Save conversation history" checked={!!(draft.history_enabled ?? draft.save_history)}
            onChange={v => setDraft({ ...draft, history_enabled: v, save_history: v })} />
          <Toggle label="Allow recordings" checked={draft.recordings_enabled !== false}
            onChange={v => setDraft({ ...draft, recordings_enabled: v })} />
        </Card>

        <Card title="Face enrolment" action={<FutureBadge />}>
          <p className="card-copy">Enrol trusted faces from the camera once Phase 2 recognition is enabled. No biometric data is shown here.</p>
        </Card>
      </Grid>

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
