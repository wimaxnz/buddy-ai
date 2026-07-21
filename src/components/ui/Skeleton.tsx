import { useState, type CSSProperties, type ReactNode } from 'react'

export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton ${className}`.trim()} style={style} aria-hidden />
}

export function CardSkeleton() {
  return (
    <div className="buddy-card">
      <Skeleton style={{ height: 14, width: '40%', marginBottom: 12 }} />
      <Skeleton style={{ height: 10, width: '90%', marginBottom: 8 }} />
      <Skeleton style={{ height: 10, width: '75%' }} />
    </div>
  )
}

export function HomeSkeleton() {
  return (
    <div className="screen screen-enter">
      <Skeleton style={{ height: 28, width: 120, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 280, marginBottom: 20 }} />
      <div className="buddy-card" style={{ minHeight: 120, marginBottom: 16 }}>
        <Skeleton style={{ height: 80, width: '100%' }} />
      </div>
      <div className="buddy-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0,1fr))' }}>
        <CardSkeleton /><CardSkeleton />
      </div>
    </div>
  )
}

export function Collapsible({ title, defaultOpen = false, children, badge }: {
  title: string
  defaultOpen?: boolean
  badge?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`collapsible${open ? ' is-open' : ''}`}>
      <button type="button" className="collapsible-trigger" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        {badge && <span className="chip chip-neutral">{badge}</span>}
        <span className="collapsible-chevron">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="collapsible-body screen-enter">{children}</div>}
    </section>
  )
}
