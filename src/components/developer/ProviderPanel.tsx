import { useEffect, useState } from 'react'
import { fetchProviders, postJson, saveProviderKey, testProvider } from '@/api/client'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField, TextField, Toggle } from '@/components/ui/Fields'

interface ProviderInfo {
  label?: string
  enabled?: boolean
  base_url?: string
  model?: string
  priority?: number
  key_masked?: string
}

interface ProvidersView {
  storage_method?: string
  active_provider?: string
  fallback_provider?: string
  providers?: Record<string, ProviderInfo>
}

const IDS = ['openai', 'deepseek', 'custom'] as const

export function ProviderPanel() {
  const toast = useToast()
  const [data, setData] = useState<ProvidersView | null>(null)
  const [active, setActive] = useState('deepseek')
  const [fallback, setFallback] = useState('openai')
  const [draft, setDraft] = useState<Record<string, ProviderInfo>>({})
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')

  const load = async () => {
    try {
      const j = await fetchProviders()
      setData(j)
      setActive(j.active_provider || 'deepseek')
      setFallback(j.fallback_provider || 'openai')
      setDraft(j.providers || {})
    } catch {
      setStatus('Could not load providers.')
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    const body = {
      active_provider: active,
      fallback_provider: fallback,
      providers: Object.fromEntries(IDS.map(id => [id, {
        enabled: draft[id]?.enabled ?? false,
        base_url: draft[id]?.base_url ?? '',
        model: draft[id]?.model ?? '',
        priority: draft[id]?.priority ?? 99,
      }])),
    }
    try {
      await postJson('/dashboard/providers', body)
      toast.success('Provider settings saved.')
      load()
    } catch {
      toast.error('Save failed.')
    }
  }

  const saveKey = async (id: string) => {
    const key = keys[id]
    if (!key) { setStatus('Enter a key first.'); return }
    try {
      await saveProviderKey(id, key)
      setKeys(k => ({ ...k, [id]: '' }))
      toast.success('Key saved (masked on server).')
      load()
    } catch {
      toast.error('Key save failed.')
    }
  }

  const deleteKey = async (id: string) => {
    if (!confirm(`Delete saved API key for ${id}?`)) return
    await postJson('/dashboard/provider-key', { provider_id: id, action: 'delete' })
    toast.success('Key deleted.')
    load()
  }

  const test = async (id: string) => {
    try {
      const j = await testProvider(id) as { status?: string; message?: string }
      setStatus(`${j.status || 'done'}: ${j.message || ''}`)
    } catch {
      setStatus('Test failed.')
    }
  }

  return (
    <Card title="AI Provider">
      <p className="card-copy">
        API keys stay on this PC only — stored in <strong>{data?.storage_method || 'secure store'}</strong>.
        Never sent to CoreS3 or shown in full after save.
      </p>
      <SelectField label="Active conversation provider" value={active}
        options={IDS.map(id => ({ value: id, label: draft[id]?.label || id }))}
        onChange={setActive} />
      <SelectField label="Fallback provider" value={fallback}
        options={IDS.map(id => ({ value: id, label: draft[id]?.label || id }))}
        onChange={setFallback} />

      {IDS.map(id => (
        <div key={id} className="buddy-card provider-card">
          <h3>{draft[id]?.label || id}</h3>
          <Toggle label="Enabled" checked={!!draft[id]?.enabled}
            onChange={v => setDraft(d => ({ ...d, [id]: { ...d[id], enabled: v } }))} />
          <TextField label="Base URL" value={draft[id]?.base_url || ''}
            onChange={v => setDraft(d => ({ ...d, [id]: { ...d[id], base_url: v } }))} />
          <TextField label="Model" value={draft[id]?.model || ''}
            onChange={v => setDraft(d => ({ ...d, [id]: { ...d[id], model: v } }))} />
          <TextField label="Priority" value={String(draft[id]?.priority ?? 99)}
            onChange={v => setDraft(d => ({ ...d, [id]: { ...d[id], priority: Number(v) || 99 } }))} />
          <p className="card-copy">Saved key: {draft[id]?.key_masked || '(none)'}</p>
          <TextField label="New / replace key" value={keys[id] || ''} type="password"
            onChange={v => setKeys(k => ({ ...k, [id]: v }))} placeholder="Leave blank to keep" />
          <div className="button-row">
            <Button variant="soft" onClick={() => saveKey(id)}>Save key</Button>
            <Button variant="ghost" onClick={() => deleteKey(id)}>Delete key</Button>
            <Button variant="ghost" onClick={() => test(id)}>Test</Button>
          </div>
        </div>
      ))}

      <div className="button-row">
        <Button onClick={save}>Save provider settings</Button>
      </div>
      {status && <p className="card-copy">{status}</p>}
    </Card>
  )
}
