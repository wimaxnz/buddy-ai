import { useState } from 'react'
import { saveParentSettings } from '@/api/client'
import type { BuddySettings } from '@/api/types'
import { SaveBar } from '@/components/ui/Button'
import { Card, Grid, SectionIntro } from '@/components/ui/Card'
import { TextField } from '@/components/ui/Fields'

function linesToText(v: unknown): string {
  return Array.isArray(v) ? v.join('\n') : String(v ?? '')
}

function textToLines(s: string): string[] {
  return s.split('\n').map(l => l.trim()).filter(Boolean)
}

export function MemoryScreen({ settings, onSaved }: { settings: BuddySettings; onSaved: () => void }) {
  const [draft, setDraft] = useState(settings)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!confirm('Save memory changes to Buddy?')) return
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
      <SectionIntro title="Memory" subtitle="Family knowledge, stories, and learning goals Buddy can use safely." />

      <Grid cols={2}>
        <Card title="Family knowledge">
          <TextField label="Facts Buddy should know (Name: fact per line)" multiline
            value={linesToText(draft.family_knowledge)}
            onChange={v => setDraft({ ...draft, family_knowledge: textToLines(v) })}
            placeholder="Emma: loves dinosaurs&#10;Dad: works from home on Tuesdays" />
        </Card>
        <Card title="Local world">
          <TextField label="Places, pets, and local context" multiline
            value={linesToText(draft.local_world_knowledge)}
            onChange={v => setDraft({ ...draft, local_world_knowledge: textToLines(v) })} />
        </Card>
      </Grid>

      <Grid cols={2}>
        <Card title="Buddy personality notes">
          <TextField label="Optional identity notes" multiline
            value={linesToText(draft.buddy_identity_notes)}
            onChange={v => setDraft({ ...draft, buddy_identity_notes: textToLines(v) })} />
        </Card>
        <Card title="Learning goals">
          <TextField label="Sport goal (minutes/week)" value={String(draft.sport_goal_minutes ?? 60)}
            onChange={v => setDraft({ ...draft, sport_goal_minutes: Number(v) || 0 })} />
          <TextField label="Study goal (minutes/week)" value={String(draft.study_goal_minutes ?? 45)}
            onChange={v => setDraft({ ...draft, study_goal_minutes: Number(v) || 0 })} />
          <TextField label="Screen time limit (minutes/day)" value={String(draft.screen_time_limit_minutes ?? 60)}
            onChange={v => setDraft({ ...draft, screen_time_limit_minutes: Number(v) || 0 })} />
        </Card>
      </Grid>

      <SaveBar saving={saving} onSave={save} label="Save memory" />
    </div>
  )
}
