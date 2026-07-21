import { postEmpty } from '@/api/client'
import { useLiveDataContext } from '@/context/LiveDataContext'
import { useConfirm } from '@/context/ToastProvider'
import { useToast } from '@/context/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Card, StatusRow } from '@/components/ui/Card'

export function StoryBrainPanel() {
  const { live } = useLiveDataContext()
  const toast = useToast()
  const confirm = useConfirm()

  const resetStory = async () => {
    if (!confirm('Reset story memory on the server for this device?')) return
    try {
      await postEmpty('/parent/story/reset')
      toast.success('Story memory reset.')
    } catch {
      toast.error('Story reset failed.')
    }
  }

  const resetBrain = async () => {
    if (!confirm('Clear long-term brain memories for this device?')) return
    try {
      await postEmpty('/parent/brain/reset')
      toast.success('Brain memories reset.')
    } catch {
      toast.error('Brain reset failed.')
    }
  }

  return (
    <Card title="Story & Brain">
      <StatusRow label="Story active" value={live?.story_active ? 'Yes' : 'No'} />
      <StatusRow label="Title" value={String(live?.story_title || '—')} />
      <StatusRow label="Chapter" value={String(live?.story_chapter ?? '—')} />
      <StatusRow label="Setting" value={String(live?.story_setting || '—')} />
      <StatusRow label="Characters" value={String(live?.story_characters || '—')} />
      <StatusRow label="Long-term memories" value={String(live?.brain_long_term_count ?? '—')} />
      <StatusRow label="Open threads" value={String(live?.brain_open_promises ?? '—')} />
      <StatusRow label="Learning topics" value={String(live?.brain_learning_topics || '—')} />
      <StatusRow label="Reading level" value={String(live?.brain_reading_level || '—')} />
      <StatusRow label="Math level" value={String(live?.brain_math_level || '—')} />
      <div className="button-row">
        <Button variant="danger" onClick={resetStory}>Reset story</Button>
        <Button variant="danger" onClick={resetBrain}>Reset brain memories</Button>
      </div>
    </Card>
  )
}
