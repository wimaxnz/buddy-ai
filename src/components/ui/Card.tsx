import type { ReactNode, CSSProperties } from 'react'

export function Card({ title, action, children, className, style }: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <section className={`buddy-card ${className ?? ''}`.trim()} style={style}>
      {(title || action) && (
        <div className="buddy-card-head">
          {title && <h2 className="buddy-card-title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Grid({ cols = 2, children, gap = 16 }: { cols?: number; children: ReactNode; gap?: number }) {
  return (
    <div className="buddy-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
      {children}
    </div>
  )
}

export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: 'green' | 'yellow' | 'red' | 'blue' | 'neutral' }) {
  return <span className={`chip chip-${tone}`}>{label}</span>
}

export function StatusRow({ label, value, ok }: { label: string; value: ReactNode; ok?: boolean }) {
  return (
    <div className="status-row">
      <span className="status-row-label">{label}</span>
      <span className={`status-row-value${ok === false ? ' is-bad' : ''}`}>{value}</span>
    </div>
  )
}

export function SectionIntro({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="section-intro">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-title">{title}</div>
      {detail && <div className="empty-state-detail">{detail}</div>}
    </div>
  )
}

export function FutureBadge() {
  return <span className="chip chip-blue" style={{ fontSize: 10 }}>Coming soon</span>
}
