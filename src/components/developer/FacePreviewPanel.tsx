import { FIGMA_EXPRESSIONS, FIGMA_EXPRESSION_EMOJI } from '@/components/buddy/BuddyFaceScreen'
import { ExpressionDeviceGrid } from '@/components/developer/ExpressionDeviceGrid'

export function FacePreviewPanel({ devPassword }: { devPassword?: string }) {
  return (
    <div className="buddy-card">
      <h3>Figma expression preview (device)</h3>
      <ExpressionDeviceGrid devPassword={devPassword} />
      <p className="card-copy" style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
        Sends all {FIGMA_EXPRESSIONS.length} Figma expressions:{' '}
        {FIGMA_EXPRESSIONS.map(e => `${FIGMA_EXPRESSION_EMOJI[e]} ${e}`).join(', ')}
      </p>
    </div>
  )
}
