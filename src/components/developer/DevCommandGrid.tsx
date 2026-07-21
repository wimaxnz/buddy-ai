import { devCommand, postForm, postJson } from '@/api/client'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'

type CmdGroup = { title: string; cmds: { name: string; label: string; variant?: 'danger' | 'soft' }[] }

const GROUPS: CmdGroup[] = [
  {
    title: 'StackChan motion',
    cmds: [
      { name: 'base_centre', label: 'Centre head' },
      { name: 'base_left', label: 'Test left' },
      { name: 'base_right', label: 'Test right' },
      { name: 'base_up', label: 'Test up' },
      { name: 'base_down', label: 'Test down' },
      { name: 'base_nod', label: 'Test nod' },
      { name: 'base_greeting', label: 'Greeting' },
      { name: 'base_calibrate_x', label: 'Calibrate X', variant: 'soft' },
      { name: 'base_calibrate_y', label: 'Calibrate Y', variant: 'soft' },
      { name: 'base_emergency_stop', label: 'E-stop', variant: 'danger' },
      { name: 'base_emergency_clear', label: 'Clear E-stop', variant: 'soft' },
    ],
  },
  {
    title: 'RGB lights',
    cmds: [
      { name: 'lights_idle', label: 'Idle' },
      { name: 'lights_listening', label: 'Listening' },
      { name: 'lights_thinking', label: 'Thinking' },
      { name: 'lights_speaking', label: 'Speaking' },
      { name: 'lights_happy', label: 'Happy' },
      { name: 'lights_sleep', label: 'Sleep' },
      { name: 'lights_off', label: 'Off' },
      { name: 'lights_on', label: 'On' },
      { name: 'lights_error', label: 'Emergency red', variant: 'danger' },
    ],
  },
  {
    title: 'ExpressProfile preview',
    cmds: [
      { name: 'express_preview_idle', label: 'Idle' },
      { name: 'express_preview_happy', label: 'Happy' },
      { name: 'express_preview_curious', label: 'Curious' },
      { name: 'express_preview_thinking', label: 'Thinking' },
      { name: 'express_preview_listening', label: 'Listening' },
      { name: 'express_preview_speaking', label: 'Speaking' },
      { name: 'express_preview_sleep', label: 'Sleep' },
      { name: 'express_preview_live', label: 'Return live', variant: 'soft' },
    ],
  },
  {
    title: 'Audio & diagnostics',
    cmds: [
      { name: 'test_speaker_tone', label: 'Speaker tone' },
      { name: 'test_local_pcm', label: 'Local PCM' },
      { name: 'test_microphone', label: 'Microphone' },
      { name: 'test_wake_detector', label: 'Wake detector' },
      { name: 'run_diag_abcd', label: 'Full A-D diag' },
      { name: 'refresh_settings', label: 'Refresh settings', variant: 'soft' },
    ],
  },
  {
    title: 'Display preview',
    cmds: [
      { name: 'preview_clock', label: 'Clock' },
      { name: 'preview_date', label: 'Date' },
      { name: 'preview_face', label: 'Face' },
      { name: 'preview_idle', label: 'Idle display' },
      { name: 'preview_math_add', label: 'Math add', variant: 'soft' },
    ],
  },
]

export function DevCommandGrid({ devPassword }: { devPassword?: string }) {
  const toast = useToast()

  const run = async (name: string) => {
    try {
      await devCommand(name, '', devPassword)
      toast.success(`Queued: ${name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Command failed')
    }
  }

  const serverTts = async () => {
    try {
      const j = await postForm('/dev/test-server-tts', new FormData(), devPassword)
      const data = await j.json().catch(() => ({}))
      if (data.url) toast.success('Server TTS ready — check audio in classic dashboard or browser.')
      else toast.success('Server TTS triggered.')
    } catch {
      toast.error('Server TTS failed.')
    }
  }

  const clearAudio = async () => {
    await postJson('/dev/clear-audio', {}, devPassword)
    toast.success('Temporary audio cleared.')
  }

  const downloadLog = () => {
    window.open('/dev/log', '_blank')
  }

  const restart = async () => {
    if (!confirm('Restart BuddyAI server? Wait ~30s before retrying.')) return
    await postForm('/dev/restart-server', new FormData(), devPassword)
    toast.success('Server restart scheduled.')
  }

  return (
    <div className="dev-cmd-grid">
      {GROUPS.map(g => (
        <div key={g.title} className="buddy-card">
          <h3>{g.title}</h3>
          <div className="button-row wrap">
            {g.cmds.map(c => (
              <Button key={c.name} variant={c.variant || 'soft'} onClick={() => run(c.name)}>{c.label}</Button>
            ))}
          </div>
        </div>
      ))}
      <div className="buddy-card">
        <h3>Server actions</h3>
        <div className="button-row wrap">
          <Button variant="soft" onClick={serverTts}>Test server TTS</Button>
          <Button variant="ghost" onClick={clearAudio}>Clear temp audio</Button>
          <Button variant="ghost" onClick={downloadLog}>Download log</Button>
          <Button variant="danger" onClick={restart}>Restart server</Button>
        </div>
      </div>
    </div>
  )
}
