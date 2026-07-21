import { devCommand } from '@/api/client'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'

const FACE_STATES = [
  'idle', 'wake', 'listening', 'thinking', 'speaking',
  'storytelling', 'encouragement', 'concerned', 'confused', 'sleeping',
]

export function FacePreviewPanel({ devPassword }: { devPassword?: string }) {
  const toast = useToast()
  const run = async (state: string) => {
    try {
      await devCommand('face_preview', state, devPassword)
      toast.success(`Face preview: ${state}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }
  return (
    <div className="buddy-card">
      <h3>Face state preview (device)</h3>
      <p className="card-copy">Queues face_preview on CoreS3 — watch Express face in Live panel.</p>
      <div className="button-row wrap">
        {FACE_STATES.map(s => (
          <Button key={s} variant="soft" onClick={() => run(s)}>{s}</Button>
        ))}
      </div>
    </div>
  )
}
