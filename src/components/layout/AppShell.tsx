import { MOBILE_NAV, NAV_ITEMS, navItem, type ScreenId } from '@/navigation'
import { Icon } from '@/components/ui/Icon'
import { useTheme, type ThemeMode } from '@/context/ThemeProvider'

export function Sidebar({ active, onNavigate, online, subtitle }: {
  active: ScreenId
  onNavigate: (id: ScreenId) => void
  online?: boolean
  subtitle?: string
}) {
  const groups = [...new Set(NAV_ITEMS.map(i => i.group))]

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">B</div>
        <div>
          <div className="sidebar-title">Buddy AI</div>
          <div className="sidebar-sub">Control Centre</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {groups.map(group => (
          <div key={group} className="sidebar-group">
            <div className="sidebar-group-label">{group}</div>
            {NAV_ITEMS.filter(i => i.group === group).map(item => {
              const isActive = item.id === active
              return (
                <button key={item.id} type="button" className={`sidebar-link${isActive ? ' is-active' : ''}`}
                  onClick={() => onNavigate(item.id)}>
                  <Icon name={item.icon} size={15} strokeWidth={isActive ? 2 : 1.6} />
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className={`status-dot${online ? ' is-online' : ''}`} />
        <div>
          <div>{online ? 'Buddy online' : 'Buddy offline'}</div>
          <div className="sidebar-footer-sub">{subtitle || '—'}</div>
        </div>
      </div>
    </aside>
  )
}

export function TopBar({ title, group, online }: { title: string; group?: string; online?: boolean }) {
  const { mode, setMode } = useTheme()
  return (
    <header className="app-topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {group && <span>{group}</span>}
      </div>
      <div className="topbar-actions">
        <select className="theme-select" value={mode} onChange={e => setMode(e.target.value as ThemeMode)} aria-label="Theme">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="auto">Auto</option>
        </select>
        <span className={`chip chip-${online ? 'green' : 'red'}`}>{online ? 'Connected' : 'Offline'}</span>
        <a className="topbar-classic" href="/dashboard/classic">Classic</a>
      </div>
    </header>
  )
}

export function MobileNav({ active, onNavigate }: { active: ScreenId; onNavigate: (id: ScreenId) => void }) {
  return (
    <nav className="mobile-nav">
      {MOBILE_NAV.map((id) => {
        const item = navItem(id)
        if (!item) return null
        return (
          <button key={id} type="button" className={`mobile-nav-btn${active === id ? ' is-active' : ''}`}
            onClick={() => onNavigate(id)}>
            <Icon name={item.icon} size={18} />
            <span>{item.mobileLabel ?? item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function EmergencyFab({ onStop }: { onStop: () => void }) {
  return (
    <button type="button" className="emergency-fab" onClick={onStop} aria-label="Emergency stop">
      STOP
    </button>
  )
}
