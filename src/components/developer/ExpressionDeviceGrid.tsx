import { devCommand } from '@/api/client'
import type { Emotion2 } from '@/components/buddy/BuddyFaceScreen'
import { FIGMA_EXPRESSIONS, FIGMA_EXPRESSION_EMOJI } from '@/components/buddy/BuddyFaceScreen'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'

export function ExpressionDeviceGrid({
  devPassword,
  active,
  onPick,
}: {
  devPassword?: string
  active?: Emotion2
  onPick?: (emotion: Emotion2) => void
}) {
  const { live } = useLiveDataContext()
  const toast = useToast()
  const online = live?.online ?? false

  const send = async (emotion: Emotion2) => {
    onPick?.(emotion)
    if (!online) {
      toast.error('Device offline — connect Buddy to Wi‑Fi first.')
      return
    }
    try {
      await devCommand('sync_figma_face', emotion, devPassword)
      toast.success(`Showing ${emotion} on device…`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not send expression')
    }
  }

  return (
    <div>
      <p className="card-copy" style={{ marginBottom: 10 }}>
        Tap any expression to preview it on Buddy&apos;s screen for ~45 seconds.
      </p>
      <div className="button-row wrap">
        {FIGMA_EXPRESSIONS.map(e => (
          <Button
            key={e}
            variant={active === e ? 'primary' : 'soft'}
            onClick={() => send(e)}
            disabled={!online}
          >
            {FIGMA_EXPRESSION_EMOJI[e]} {e}
          </Button>
        ))}
      </div>
    </div>
  )
}
