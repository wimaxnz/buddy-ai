import { Card, EmptyState, FutureBadge, SectionIntro } from '@/components/ui/Card'

export function PhotosScreen() {
  return (
    <div className="screen">
      <SectionIntro title="Photos" subtitle="Capture, gallery, and storage — connected when photo backend ships." />
      <Card title="Gallery" action={<FutureBadge />}>
        <EmptyState title="Photo gallery coming soon"
          detail="Capture, keep, rename, download, and delete will connect to the BuddyAI photo store. Camera foundation preview is available now under Camera." />
      </Card>
    </div>
  )
}
