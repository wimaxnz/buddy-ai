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

const ROUTINE_HINTS = [
  { key: 'bedtime', label: 'Bedtime', hint: 'Wind-down and night mode' },
  { key: 'school', label: 'School', hint: 'Morning readiness' },
  { key: 'sport', label: 'Sport', hint: `${''}` },
  { key: 'study', label: 'Study', hint: 'Focus time reminders' },
  { key: 'hygiene', label: 'Hygiene', hint: 'Teeth, wash, tidy' },
  { key: 'screen', label: 'Screen time', hint: 'Healthy limits' },
]

export function RoutinesScreen({ settings, onSaved }: { settings: BuddySettings; onSaved: () => void }) {
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
      <SectionIntro title="Routines" subtitle="Bedtime, school, sport, study, and reminders — gentle nudges for daily rhythm." />

      <Grid cols={2}>
        <Card title="Daily routines">
          <TextField label="Routine lines (one per line)" multiline
            value={linesToText(draft.routines)}
            onChange={v => setDraft({ ...draft, routines: textToLines(v) })}
            placeholder="7:30 School wake-up&#10;20:00 Bedtime story&#10;Tuesday: swimming" />
          <TextField label="Bedtime" value={String(draft.bedtime ?? '20:00')}
            onChange={v => setDraft({ ...draft, bedtime: v })} />
        </Card>

        <Card title="Goals & progress">
          {ROUTINE_HINTS.map(r => (
            <div key={r.key} className="routine-chip">
              <strong>{r.label}</strong>
              <span>{r.hint}</span>
            </div>
          ))}
          <TextField label="Sport goal (min/week)" value={String(draft.sport_goal_minutes ?? 60)}
            onChange={v => setDraft({ ...draft, sport_goal_minutes: Number(v) || 0 })} />
          <TextField label="Study goal (min/week)" value={String(draft.study_goal_minutes ?? 45)}
            onChange={v => setDraft({ ...draft, study_goal_minutes: Number(v) || 0 })} />
          <TextField label="Screen limit (min/day)" value={String(draft.screen_time_limit_minutes ?? 60)}
            onChange={v => setDraft({ ...draft, screen_time_limit_minutes: Number(v) || 0 })} />
        </Card>
      </Grid>

      <SaveBar saving={saving} onSave={save} />
    </div>
  )
}
