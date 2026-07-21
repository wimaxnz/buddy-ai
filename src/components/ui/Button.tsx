import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'soft'

export function Button({
  variant = 'primary',
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button type="button" className={`btn btn-${variant} ${className ?? ''}`.trim()} {...props}>
      {children}
    </button>
  )
}

export function SaveBar({ saving, onSave, label = 'Save changes' }: {
  saving?: boolean
  onSave: () => void
  label?: string
}) {
  return (
    <div className="save-bar">
      <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : label}</Button>
    </div>
  )
}
