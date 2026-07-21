import { useState, useEffect, useRef } from 'react'

// ─── Icon primitives (SVG inline, no icon library dependency) ─────────────────

const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.6 }: {
  d: string | string[]; size?: number; color?: string; strokeWidth?: number
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d) ? d : [d]).map((path, i) => <path key={i} d={path} />)}
  </svg>
)

const Icons = {
  dashboard:    'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  camera:       ['M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z', 'M12 17a4 4 0 100-8 4 4 0 000 8z'],
  family:       ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', 'M9 11a4 4 0 100-8 4 4 0 000 8z', 'M23 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  face:         ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M8 14s1.5 2 4 2 4-2 4-2', 'M9 9h.01', 'M15 9h.01'],
  photos:       ['M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z', 'M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z', 'M21 15l-5-5L5 21'],
  clock:        ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
  weather:      ['M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z'],
  personality:  ['M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z'],
  voice:        ['M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z', 'M19 10v2a7 7 0 01-14 0v-2', 'M12 19v4', 'M8 23h8'],
  memory:       ['M12 2L2 7l10 5 10-5-10-5z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  stories:      ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'],
  education:    ['M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z', 'M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z'],
  routines:     ['M12 2v4', 'M12 18v4', 'M4.93 4.93l2.83 2.83', 'M16.24 16.24l2.83 2.83', 'M2 12h4', 'M18 12h4', 'M4.93 19.07l2.83-2.83', 'M16.24 7.76l2.83-2.83'],
  privacy:      ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  security:     ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M9 12l2 2 4-4'],
  device:       ['M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18'],
  telemetry:    ['M22 12h-4l-3 9L9 3l-3 9H2'],
  developer:    ['M16 18l6-6-6-6', 'M8 6l-6 6 6 6'],
  settings:     ['M12 15a3 3 0 100-6 3 3 0 000 6z', 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'],
  bell:         ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', 'M13.73 21a2 2 0 01-3.46 0'],
  chevronRight: 'M9 18l6-6-6-6',
  chevronDown:  'M6 9l6 6 6-6',
  wifi:         ['M5 12.55a11 11 0 0114.08 0', 'M1.42 9a16 16 0 0121.16 0', 'M8.53 16.11a6 16 0 016.95 0', 'M12 20h.01'],
  battery:      ['M17 7H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2z', 'M22 11v2'],
  circle:       'M12 12m-4 0a4 4 0 108 0 4 4 0 10-8 0',
  plus:         ['M12 5v14', 'M5 12h14'],
  arrowUp:      ['M12 19V5', 'M5 12l7-7 7 7'],
  zap:          'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  star:         'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  photo:        ['M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', 'M15 13a3 3 0 11-6 0 3 3 0 016 0'],
  mood:         ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M8 14s1.5 2 4 2 4-2 4-2'],
  book:         ['M4 19.5A2.5 2.5 0 016.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'],
  user:         ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', 'M12 11a4 4 0 100-8 4 4 0 000 8z'],
  rgb:          ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  check:        'M20 6L9 17l-5-5',
  info:         ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 8v4', 'M12 16h.01'],
}

// ─── Navigation structure ─────────────────────────────────────────────────────

type ScreenId =
  'dashboard' | 'parent-dashboard' | 'camera' | 'camera-preview' | 'family'
  | 'face-enrolment' | 'face-recognition' | 'photos' | 'photo-gallery'
  | 'clock' | 'weather' | 'personality' | 'expressions' | 'mechanical'
  | 'rgb' | 'voice' | 'memory' | 'stories' | 'education' | 'routines'
  | 'privacy' | 'security' | 'developer' | 'device-status' | 'telemetry'
  | 'buddy-face'

interface NavItem {
  id: ScreenId
  label: string
  icon: keyof typeof Icons
  group: string
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',        label: 'Dashboard',       icon: 'dashboard',   group: 'Overview' },
  { id: 'parent-dashboard', label: 'Parent App',      icon: 'family',      group: 'Overview' },
  { id: 'buddy-face',       label: 'Expressions',     icon: 'face',        group: 'Overview' },
  { id: 'camera',           label: 'Camera',          icon: 'camera',      group: 'Capture' },
  { id: 'camera-preview',   label: 'Camera Preview',  icon: 'photo',       group: 'Capture' },
  { id: 'photos',           label: 'Photos',          icon: 'photos',      group: 'Capture' },
  { id: 'photo-gallery',    label: 'Photo Gallery',   icon: 'photos',      group: 'Capture' },
  { id: 'family',           label: 'Family',          icon: 'family',      group: 'Family' },
  { id: 'face-enrolment',   label: 'Face Enrolment',  icon: 'face',        group: 'Family' },
  { id: 'face-recognition', label: 'Recognition',     icon: 'face',        group: 'Family' },
  { id: 'personality',      label: 'Personality',     icon: 'personality', group: 'Buddy' },
  { id: 'expressions',      label: 'Expressions',     icon: 'mood',        group: 'Buddy' },
  { id: 'voice',            label: 'Voice',           icon: 'voice',       group: 'Buddy' },
  { id: 'memory',           label: 'Memory',          icon: 'memory',      group: 'Buddy' },
  { id: 'stories',          label: 'Stories',         icon: 'stories',     group: 'Buddy' },
  { id: 'education',        label: 'Education',       icon: 'education',   group: 'Buddy' },
  { id: 'routines',         label: 'Routines',        icon: 'routines',    group: 'Buddy' },
  { id: 'clock',            label: 'Clock',           icon: 'clock',       group: 'Settings' },
  { id: 'weather',          label: 'Weather',         icon: 'weather',     group: 'Settings' },
  { id: 'mechanical',       label: 'Mechanical Base', icon: 'settings',    group: 'Settings' },
  { id: 'rgb',              label: 'RGB Lights',      icon: 'rgb',         group: 'Settings' },
  { id: 'privacy',          label: 'Privacy',         icon: 'privacy',     group: 'Admin' },
  { id: 'security',         label: 'Security',        icon: 'security',    group: 'Admin' },
  { id: 'developer',        label: 'Developer',       icon: 'developer',   group: 'Admin' },
  { id: 'device-status',    label: 'Device Status',   icon: 'device',      group: 'Admin' },
  { id: 'telemetry',        label: 'Live Telemetry',  icon: 'telemetry',   group: 'Admin', badge: 'LIVE' },
]

// ─── Buddy Mini Face (for Dashboard card) ────────────────────────────────────

function MiniFace({ emotion }: { emotion: string }) {
  const [blink, setBlink] = useState(false)
  const [breathe, setBreathe] = useState(0)
  const tRef = useRef(0)

  useEffect(() => {
    const tick = () => {
      tRef.current += 0.022
      setBreathe(Math.sin(tRef.current) * 1.2)
      requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const schedule = () => {
      const timer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 115)
      }, 2600 + Math.random() * 3200)
      return timer
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  const glowMap: Record<string, string> = {
    idle: '#4fc3f7', happy: '#ffd54f', listening: '#80cbc4',
    thinking: '#ce93d8', excited: '#ffb74d', sleeping: '#7986cb',
  }
  const glow = glowMap[emotion] ?? '#4fc3f7'

  // Mini lens-shaped eyes using the same approach as FaceEye
  const renderMiniEye = (ecx: number, ecy: number, key: string) => {
    const rx = 9.5, ry = 8.2
    const open = blink ? 0 : 1
    const cy2 = ecy + breathe * 0.25
    const upperCtrl = cy2 - 2 * ry * open
    const lowerCtrl = cy2 + ry * 0.95
    const lx = ecx - rx, rx2 = ecx + rx
    const eyePath = `M ${lx} ${cy2} Q ${ecx} ${upperCtrl} ${rx2} ${cy2} Q ${ecx} ${lowerCtrl} ${lx} ${cy2} Z`
    const lashPath = `M ${lx} ${cy2} Q ${ecx} ${upperCtrl} ${rx2} ${cy2}`
    return (
      <g key={key}>
        <defs>
          <clipPath id={`mec-${key}`}><path d={eyePath} /></clipPath>
        </defs>
        <g clipPath={`url(#mec-${key})`}>
          <ellipse cx={ecx} cy={cy2} rx={rx + 1} ry={ry + 1} fill="white" />
          <ellipse cx={ecx} cy={cy2} rx={5.5} ry={5.5} fill="#2450b0" />
          <ellipse cx={ecx} cy={cy2} rx={3.2} ry={3.2} fill="#050818" />
          <circle cx={ecx - 2.2} cy={cy2 - 2.5} r={1.6} fill="white" opacity="0.95" />
        </g>
        <path d={eyePath} fill="none" stroke="#091420" strokeWidth="1" />
        {open > 0.05 && <path d={lashPath} fill="none" stroke="#0c1828" strokeWidth="1.8" strokeLinecap="round" />}
      </g>
    )
  }

  return (
    <svg width={82} height={62} viewBox="0 0 82 62" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="mfbg2" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.15" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="82" height="62" rx="12" fill="#0d1b2e" />
      <ellipse cx="41" cy="31" rx="36" ry="28" fill="url(#mfbg2)" />
      {renderMiniEye(25, 28, 'L')}
      {renderMiniEye(57, 28, 'R')}
      {/* Cubic bezier smile — no triangles */}
      <path d="M 28 46 C 34 54 48 54 54 46"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: keyof typeof Icons
}) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-xl)',
      padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'border-color var(--dur-base) var(--ease-out)',
      cursor: 'default',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--r-md)',
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon d={Icons[icon]} size={17} color={color} strokeWidth={1.8} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 3 }}>
          Today
        </span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{label}</div>
      </div>
      <div style={{ fontSize: 11, color, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon d={Icons.arrowUp} size={11} color={color} strokeWidth={2} />
        {sub}
      </div>
    </div>
  )
}

// ─── Activity Feed ─────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: 'photo', color: '#4f8ef7', label: 'Photo taken', sub: 'Emma smiled at camera', time: '2 min ago' },
  { icon: 'stories', color: '#a78bfa', label: 'Story told', sub: '"The Dragon and the Rainbow"', time: '18 min ago' },
  { icon: 'face', color: '#34d399', label: 'Face recognised', sub: 'Dad enrolled successfully', time: '34 min ago' },
  { icon: 'education', color: '#fbbf24', label: 'Learning session', sub: 'Colours — Level 2 complete', time: '1 hr ago' },
  { icon: 'voice', color: '#2dd4bf', label: 'Voice command', sub: '"Tell me a joke"', time: '1.5 hr ago' },
  { icon: 'routines', color: '#fb923c', label: 'Routine triggered', sub: 'Bedtime — Night mode on', time: '8 hr ago' },
] as const

function ActivityItem({ icon, color, label, sub, time }: {
  icon: keyof typeof Icons; color: string; label: string; sub: string; time: string
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 'var(--r-md)',
        background: color + '16',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon d={Icons[icon]} size={15} color={color} strokeWidth={1.7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-disabled)', flexShrink: 0 }}>{time}</div>
    </div>
  )
}

// ─── Telemetry Mini Chart ────────────────────────────────────────────────────

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 28
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function useTelemetry(base: number, variance: number) {
  const [data, setData] = useState(() => Array.from({ length: 20 }, () => base + (Math.random() - 0.5) * variance))
  const [val, setVal] = useState(base)
  useEffect(() => {
    const iv = setInterval(() => {
      const next = Math.max(0, base + (Math.random() - 0.5) * variance)
      setData(d => [...d.slice(1), next])
      setVal(Math.round(next))
    }, 1200)
    return () => clearInterval(iv)
  }, [base, variance])
  return { data, val }
}

function TelemetryRow({ label, base, variance, unit, color, warn }: {
  label: string; base: number; variance: number; unit: string; color: string; warn?: number
}) {
  const { data, val } = useTelemetry(base, variance)
  const isWarn = warn !== undefined && val > warn
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 120, fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
      <SparkLine data={data} color={isWarn ? 'var(--red)' : color} />
      <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: isWarn ? 'var(--red)' : 'var(--text-primary)', minWidth: 54, textAlign: 'right' }}>
        {val}<span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  )
}

// ─── Family member chip ───────────────────────────────────────────────────────

const FAMILY = [
  { name: 'Emma', role: 'Child', color: '#f472b6', initials: 'E', status: 'active' },
  { name: 'Dad', role: 'Parent', color: '#4f8ef7', initials: 'D', status: 'active' },
  { name: 'Mum', role: 'Parent', color: '#34d399', initials: 'M', status: 'away' },
  { name: 'Finn', role: 'Child', color: '#fbbf24', initials: 'F', status: 'offline' },
]

function FamilyChip({ name, role, color, initials, status }: typeof FAMILY[number]) {
  const statusColor = status === 'active' ? 'var(--green)' : status === 'away' ? 'var(--yellow)' : 'var(--text-disabled)'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      background: 'var(--surface-2)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-lg)',
      transition: 'border-color var(--dur-fast)',
      cursor: 'default',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: color + '22',
        border: `1.5px solid ${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color,
        position: 'relative', flexShrink: 0,
      }}>
        {initials}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 9, height: 9, borderRadius: '50%',
          background: statusColor,
          border: '1.5px solid var(--surface-2)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{role}</div>
      </div>
    </div>
  )
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const ss = String(time.getSeconds()).padStart(2, '0')
  const dateStr = time.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: '100%', minHeight: 0 }}>

      {/* ── Left column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 0, overflow: 'auto', paddingRight: 2 }}>

        {/* Hero status bar */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-2xl)',
          padding: '22px 28px',
          display: 'flex', alignItems: 'center', gap: 28,
        }}>
          <MiniFace emotion="happy" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Buddy</span>
              <span className="chip chip-green" style={{ fontSize: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Online
              </span>
              <span className="chip chip-blue" style={{ fontSize: 10 }}>Happy</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              Last seen: Emma, 2 minutes ago · Living Room · M5Stack CoreS3
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
              {hh}:{mm}<span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontWeight: 400 }}>:{ss}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{dateStr}</div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="Photos taken" value="24" sub="+8 vs yesterday" color="var(--accent)" icon="photo" />
          <StatCard label="Stories told" value="3" sub="+1 vs yesterday" color="var(--purple)" icon="stories" />
          <StatCard label="Learning sessions" value="2" sub="Colours, Shapes" color="var(--yellow)" icon="education" />
          <StatCard label="Interactions" value="47" sub="+12 vs yesterday" color="var(--green)" icon="zap" />
        </div>

        {/* Activity + Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Activity */}
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-xl)',
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Recent Activity</span>
              <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>View all</button>
            </div>
            <div>
              {ACTIVITY.map((a, i) => (
                <ActivityItem key={i} {...a} />
              ))}
            </div>
          </div>

          {/* Telemetry */}
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-xl)',
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Live Telemetry</span>
              <span className="chip chip-green" style={{ fontSize: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Live
              </span>
            </div>
            <TelemetryRow label="CPU Usage" base={32} variance={18} unit="%" color="var(--accent)" warn={80} />
            <TelemetryRow label="RAM Used" base={58} variance={8} unit="%" color="var(--purple)" warn={90} />
            <TelemetryRow label="Temperature" base={42} variance={6} unit="°C" color="var(--orange)" warn={70} />
            <TelemetryRow label="Battery" base={78} variance={4} unit="%" color="var(--green)" />
            <TelemetryRow label="WiFi RSSI" base={-58} variance={10} unit="dBm" color="var(--teal)" />
            <TelemetryRow label="Audio Level" base={12} variance={22} unit="dB" color="var(--yellow)" />
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflow: 'auto' }}>

        {/* Device health */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Device Health</div>
          {[
            { label: 'Firmware', value: 'v2.4.1', ok: true },
            { label: 'WiFi', value: 'Living Room', ok: true },
            { label: 'Storage', value: '14.2 GB free', ok: true },
            { label: 'Camera', value: 'Enabled', ok: true },
            { label: 'Face AI', value: 'Ready', ok: true },
            { label: 'Last sync', value: '1 min ago', ok: true },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '7px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{row.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: row.ok ? 'var(--text-primary)' : 'var(--red)' }}>
                {row.value}
                <Icon d={Icons.check} size={12} color={row.ok ? 'var(--green)' : 'var(--red)'} strokeWidth={2.5} />
              </span>
            </div>
          ))}
        </div>

        {/* Family */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Family</span>
            <button className="btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}>
              <Icon d={Icons.plus} size={12} />Add
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAMILY.map(m => <FamilyChip key={m.name} {...m} />)}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Start Story Time', color: 'var(--purple)', icon: 'stories' as const },
              { label: 'Capture Photo', color: 'var(--accent)', icon: 'camera' as const },
              { label: 'Begin Learning', color: 'var(--yellow)', icon: 'education' as const },
              { label: 'Bedtime Mode', color: 'var(--teal)', icon: 'clock' as const },
            ].map(a => (
              <button key={a.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: a.color + '10',
                border: `1px solid ${a.color}28`,
                borderRadius: 'var(--r-lg)',
                color: a.color,
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all var(--dur-fast)',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = a.color + '1e')}
                onMouseLeave={e => (e.currentTarget.style.background = a.color + '10')}
              >
                <Icon d={Icons[a.icon]} size={15} color={a.color} strokeWidth={1.8} />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Placeholder screens ──────────────────────────────────────────────────────

function PlaceholderScreen({ title, icon }: { title: string; icon: keyof typeof Icons }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      color: 'var(--text-tertiary)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 'var(--r-xl)',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon d={Icons[icon]} size={26} strokeWidth={1.4} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12 }}>This screen is queued for build</div>
      </div>
    </div>
  )
}

// ─── Buddy Face screen (preserved from previous build) ───────────────────────

type Emotion2 = 'idle' | 'happy' | 'listening' | 'thinking' | 'speaking'
  | 'curious' | 'excited' | 'celebrating' | 'worried' | 'sad'
  | 'laughing' | 'love' | 'shy' | 'sleeping'

interface EyeS { openness: number; pupilX: number; pupilY: number; pupilScale: number; squint: number }
interface BrowS { leftY: number; rightY: number; leftAngle: number; rightAngle: number; leftCurve: number; rightCurve: number }
interface MouthS { shape: string; width: number; openness: number }
interface FaceCfg { eye: EyeS; brow: BrowS; mouth: MouthS; cheekOp: number; glow: string }

const FACE_EMOTIONS: Record<Emotion2, FaceCfg> = {
  // Relaxed, soft smile — pupils centered, brows at ease
  idle:      { eye:{openness:.82,pupilX:0,pupilY:.04,pupilScale:1,squint:.06},          brow:{leftY:-.04,rightY:-.04,leftAngle:0,rightAngle:0,leftCurve:.08,rightCurve:.08},     mouth:{shape:'tinySmile',width:.96,openness:0},    cheekOp:.28, glow:'#4fc3f7' },
  // Happy squint-smile: lids lower, cheeks lift, brows gently arched
  happy:     { eye:{openness:.52,pupilX:0,pupilY:.06,pupilScale:1.08,squint:.48},        brow:{leftY:-.18,rightY:-.18,leftAngle:5,rightAngle:-5,leftCurve:.38,rightCurve:.38},    mouth:{shape:'smile',width:1.08,openness:.25},     cheekOp:.68, glow:'#ffd54f' },
  // Attentive — wide open eyes, subtle brow raise, mouth soft closed
  listening: { eye:{openness:.98,pupilX:0,pupilY:-.08,pupilScale:1.04,squint:0},         brow:{leftY:-.28,rightY:-.28,leftAngle:3,rightAngle:-3,leftCurve:.12,rightCurve:.12},    mouth:{shape:'closed',width:.88,openness:0},       cheekOp:0,   glow:'#80cbc4' },
  // Looking up-right, left brow raised, tiny private smile
  thinking:  { eye:{openness:.74,pupilX:.38,pupilY:-.52,pupilScale:.92,squint:.08},      brow:{leftY:-.48,rightY:-.08,leftAngle:-11,rightAngle:4,leftCurve:.28,rightCurve:-.08},  mouth:{shape:'tinySmile',width:.80,openness:0},    cheekOp:0,   glow:'#ce93d8' },
  // Natural talking: eyes expressive, mouth syncs to amplitude
  speaking:  { eye:{openness:.86,pupilX:0,pupilY:0,pupilScale:1,squint:.04},             brow:{leftY:-.10,rightY:-.10,leftAngle:2,rightAngle:-2,leftCurve:.12,rightCurve:.12},    mouth:{shape:'open',width:1,openness:.48},         cheekOp:.32, glow:'#4fc3f7' },
  // One brow dramatically raised, pupils shifted up, slight head-tilt energy
  curious:   { eye:{openness:.98,pupilX:.18,pupilY:-.22,pupilScale:1.18,squint:0},       brow:{leftY:-.58,rightY:-.08,leftAngle:-13,rightAngle:5,leftCurve:.42,rightCurve:-.08},  mouth:{shape:'tinySmile',width:.86,openness:.08},  cheekOp:0,   glow:'#81d4fa' },
  // Huge eyes, both brows high, wide-open smile
  excited:   { eye:{openness:1,pupilX:0,pupilY:-.04,pupilScale:1.32,squint:0},           brow:{leftY:-.68,rightY:-.68,leftAngle:6,rightAngle:-6,leftCurve:.55,rightCurve:.55},    mouth:{shape:'wideOpen',width:1.18,openness:.88},  cheekOp:.80, glow:'#ffb74d' },
  // Squinted joy-laugh: eyes nearly closed, cheeks up, laughing mouth
  celebrating:{ eye:{openness:.38,pupilX:0,pupilY:.06,pupilScale:1.18,squint:.62},       brow:{leftY:-.48,rightY:-.48,leftAngle:8,rightAngle:-8,leftCurve:.58,rightCurve:.58},    mouth:{shape:'laughing',width:1.22,openness:.82},  cheekOp:.84, glow:'#f48fb1' },
  // Inner brow corners rise (worried brow), pupils slightly down, soft frown
  worried:   { eye:{openness:.88,pupilX:0,pupilY:.18,pupilScale:.88,squint:0},            brow:{leftY:-.28,rightY:-.28,leftAngle:17,rightAngle:-17,leftCurve:-.48,rightCurve:-.48},mouth:{shape:'worried',width:.88,openness:0},       cheekOp:0,   glow:'#90a4ae' },
  // Heavy inner brow raise, pupils cast down, deeper frown
  sad:       { eye:{openness:.60,pupilX:0,pupilY:.38,pupilScale:.80,squint:0},            brow:{leftY:-.18,rightY:-.18,leftAngle:22,rightAngle:-22,leftCurve:-.58,rightCurve:-.58},mouth:{shape:'worried',width:.84,openness:0},       cheekOp:0,   glow:'#78909c' },
  // Eyes pressed shut by laugh, full cheeks, wide mouth
  laughing:  { eye:{openness:.22,pupilX:0,pupilY:.05,pupilScale:1,squint:.78},            brow:{leftY:-.38,rightY:-.38,leftAngle:6,rightAngle:-6,leftCurve:.52,rightCurve:.52},    mouth:{shape:'laughing',width:1.28,openness:.88},  cheekOp:.94, glow:'#ffd54f' },
  // Soft gaze: half-closed lids, gentle brow arch, warm smile
  love:      { eye:{openness:.50,pupilX:0,pupilY:.04,pupilScale:1.12,squint:.40},         brow:{leftY:-.10,rightY:-.10,leftAngle:4,rightAngle:-4,leftCurve:.34,rightCurve:.34},    mouth:{shape:'smile',width:.98,openness:.08},      cheekOp:.90, glow:'#f48fb1' },
  // Averted pupils, one brow asymmetric, tiny bashful smile
  shy:       { eye:{openness:.56,pupilX:-.38,pupilY:.30,pupilScale:.82,squint:.22},       brow:{leftY:.10,rightY:-.20,leftAngle:10,rightAngle:-5,leftCurve:-.08,rightCurve:.22},   mouth:{shape:'tinySmile',width:.76,openness:0},    cheekOp:.80, glow:'#f06292' },
  // Sleeping: eyes completely closed (triggers closed-eye arc path), brows dropped
  // and featureless, mouth perfectly flat and neutral — no hint of attitude.
  sleeping:  { eye:{openness:0,pupilX:0,pupilY:0,pupilScale:.5,squint:0},                 brow:{leftY:.22,rightY:.22,leftAngle:0,rightAngle:0,leftCurve:.0,rightCurve:.0},         mouth:{shape:'closed',width:.78,openness:0},       cheekOp:.14, glow:'#5c6bc0' },
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function FaceEye({ cfg, side, breathe, blink }: { cfg: EyeS; side: string; breathe: number; blink: boolean }) {
  const W = 86, H = 78
  const cx = W / 2, cy = H / 2
  const rx = W * 0.43, ry = H * 0.44
  const uid = `fe-${side}`

  const open = blink ? 0 : Math.max(0, Math.min(1, cfg.openness))
  const px = cfg.pupilX * 12, py = cfg.pupilY * 9 + breathe * 0.35, ps = cfg.pupilScale

  // ── Closed-eye rendering ──────────────────────────────────────────────────
  // When open < 0.07 the lens clip degenerates into a crescent that reads as
  // smug/bored. Instead draw a single smooth arc: the lower eyelid resting on
  // the upper — this is exactly how Pixar/Disney characters look when asleep.
  if (open < 0.07) {
    const lx = cx - rx * 0.88, rx2 = cx + rx * 0.88
    // Gentle downward arc — lower lid resting naturally, no white showing
    const closedArc = `M ${lx} ${cy - 2} Q ${cx} ${cy + ry * 0.28} ${rx2} ${cy - 2}`
    // Very subtle lash thickness above the line
    const lashArc   = `M ${lx} ${cy - 2} Q ${cx} ${cy + ry * 0.24} ${rx2} ${cy - 2}`
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
        {/* Lash shadow — soft fill band gives eyelid mass */}
        <path d={`${closedArc} Q ${cx} ${cy + ry * 0.10} ${lx} ${cy - 2} Z`}
          fill="#142038" opacity="0.55" />
        {/* Main closed lid line */}
        <path d={closedArc} fill="none" stroke="#0c1828" strokeWidth="3.6" strokeLinecap="round" />
        {/* Fine lash edge */}
        <path d={lashArc}   fill="none" stroke="#162236" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  // ── Open-eye lens rendering ───────────────────────────────────────────────
  // Quadratic arc: peak at 0.5*ctrl + 0.25*(P0+P2)
  // To put upper lid peak at cy - ry*open → ctrl.y = cy - 2*ry*open
  const upperCtrl = cy - 2 * ry * open
  const lowerCtrl = cy + ry * (1 - cfg.squint * 0.52)

  const lx = cx - rx, rx2 = cx + rx
  const eyePath  = `M ${lx} ${cy} Q ${cx} ${upperCtrl} ${rx2} ${cy} Q ${cx} ${lowerCtrl} ${lx} ${cy} Z`
  const lashPath = `M ${lx} ${cy} Q ${cx} ${upperCtrl} ${rx2} ${cy}`

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
      <defs>
        <radialGradient id={`sg2-${uid}`} cx="44%" cy="36%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#eaf4ff" />
          <stop offset="100%" stopColor="#d2eaff" />
        </radialGradient>
        <radialGradient id={`ir-${uid}`} cx="42%" cy="36%" r="58%">
          <stop offset="0%" stopColor="#5b8ee0" />
          <stop offset="52%" stopColor="#2450b0" />
          <stop offset="100%" stopColor="#122060" />
        </radialGradient>
        <radialGradient id={`pg2-${uid}`} cx="34%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#1a2460" />
          <stop offset="65%" stopColor="#080d28" />
          <stop offset="100%" stopColor="#02040e" />
        </radialGradient>
        <clipPath id={`ec2-${uid}`}>
          <path d={eyePath} />
        </clipPath>
      </defs>

      <g clipPath={`url(#ec2-${uid})`}>
        <ellipse cx={cx} cy={cy} rx={rx + 2} ry={ry + 2} fill={`url(#sg2-${uid})`} />
        <ellipse cx={cx} cy={cy - ry * 0.28} rx={rx * 0.82} ry={ry * 0.32}
          fill="#b8d6f0" opacity="0.22" />
        <ellipse cx={cx + px} cy={cy + py} rx={20 * ps} ry={20 * ps} fill={`url(#ir-${uid})`} />
        <ellipse cx={cx + px} cy={cy + py} rx={12 * ps} ry={12 * ps} fill={`url(#pg2-${uid})`} />
        <circle cx={cx + px - 4.5 * ps} cy={cy + py - 5 * ps} r={3.6 * ps} fill="white" opacity="0.96" />
        <circle cx={cx + px + 5 * ps} cy={cy + py - 2 * ps} r={1.8 * ps} fill="white" opacity="0.48" />
      </g>

      <path d={eyePath} fill="none" stroke="#091420" strokeWidth="1.6" />
      <path d={lashPath} fill="none" stroke="#0c1828" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}

function FaceBrow({ brow, side }: { brow: BrowS; side: 'left' | 'right' }) {
  const y = side === 'left' ? brow.leftY : brow.rightY
  const angle = side === 'left' ? brow.leftAngle : brow.rightAngle
  const curve = side === 'left' ? brow.leftCurve : brow.rightCurve
  // Tapered eyebrow: thick at the inner end (left for left brow), tapers to thin outer tip.
  // arch = upward arch from curve parameter; archY negative = brow arches upward.
  const w = 62, h = 28
  const arch = -curve * 11  // positive curve = arches up = arch is negative offset from midline
  const midY = h * 0.55

  // Inner end (medial, thick): left side for left brow
  // Outer end (lateral, thin): right side for left brow
  // We build the brow as a filled organic shape using cubic bezier:
  // Top edge: from inner to outer, following the arch
  // Bottom edge: slightly lower, tighter arch radius
  const innerThick = 6.5  // half-height at inner end
  const outerThick = 2.8  // half-height at outer end (tapers)
  const peakX = w * 0.55  // arch peak slightly past center toward outer

  const topPath = `M 3 ${midY + innerThick}
    C ${w*0.28} ${midY + innerThick - 2 + arch}
      ${peakX} ${midY + arch - innerThick * 0.3}
      ${w-3} ${midY - outerThick + arch * 0.6}`
  const bottomPath = `C ${peakX} ${midY + arch + outerThick * 0.6}
      ${w*0.28} ${midY - arch * 0.3 + innerThick * 0.6}
      3 ${midY + innerThick}`
  const fullPath = `${topPath} ${bottomPath} Z`

  // Subtle gradient: slightly lighter at inner tip
  const gradId = `bg-${side}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible"
      style={{
        transform: `translateY(${y * 18}px) rotate(${angle}deg)`,
        transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)',
        transformOrigin: side === 'left' ? '78% 50%' : '22% 50%',
      }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.65)" />
        </linearGradient>
      </defs>
      <path d={fullPath} fill={`url(#${gradId})`} />
    </svg>
  )
}

function FaceMouth({ m, amp }: { m: MouthS; amp: number }) {
  // All shapes use cubic bezier curves. Open shapes are oval-based — amplitude
  // scales the height of the opening, never the corner positions, so the shape
  // can never collapse to a triangle regardless of amplitude value.
  const W = 92 * m.width, cx = W / 2
  const amp01 = Math.min(1, Math.max(0, m.openness + amp * 0.62))

  // Corner lift for smile shapes (corner Y moves up for smiles)
  const getPath = (): { d: string; filled: boolean; teeth: boolean } => {
    switch (m.shape) {

      case 'closed': return {
        // Gently flat — almost a straight line with soft curve
        d: `M ${cx-24} 17 C ${cx-8} 19 ${cx+8} 19 ${cx+24} 17`,
        filled: false, teeth: false,
      }

      case 'tinySmile': return {
        d: `M ${cx-20} 14 C ${cx-8} 24 ${cx+8} 24 ${cx+20} 14`,
        filled: false, teeth: false,
      }

      case 'smile': return {
        d: `M ${cx-30} 8 C ${cx-14} 36 ${cx+14} 36 ${cx+30} 8`,
        filled: false, teeth: false,
      }

      case 'open': {
        // Oval mouth: fixed corner positions, only height scales with amplitude.
        // Top lip: flat gentle arc. Bottom lip: oval curve downward.
        const cY = 10            // corner Y (top lip edge)
        const h = 6 + amp01 * 26 // oval height — scales with amplitude only
        return {
          d: `M ${cx-22} ${cY}
              C ${cx-22} ${cY-4} ${cx+22} ${cY-4} ${cx+22} ${cY}
              C ${cx+22} ${cY+h} ${cx-22} ${cY+h} ${cx-22} ${cY} Z`,
          filled: true, teeth: amp01 > 0.45,
        }
      }

      case 'mediumOpen': {
        const cY = 8, h = 10 + amp01 * 22
        return {
          d: `M ${cx-28} ${cY}
              C ${cx-28} ${cY-5} ${cx+28} ${cY-5} ${cx+28} ${cY}
              C ${cx+28} ${cY+h} ${cx-28} ${cY+h} ${cx-28} ${cY} Z`,
          filled: true, teeth: amp01 > 0.4,
        }
      }

      case 'wideOpen': {
        // Corners slightly lifted into a hint of smile, oval opens downward
        const cY = 6, h = 14 + amp01 * 24
        return {
          d: `M ${cx-34} ${cY+2}
              C ${cx-30} ${cY-6} ${cx+30} ${cY-6} ${cx+34} ${cY+2}
              C ${cx+30} ${cY+h} ${cx-30} ${cY+h} ${cx-34} ${cY+2} Z`,
          filled: true, teeth: true,
        }
      }

      case 'laughing': {
        // Big smile arc on top, wide oval opening below — always rounded
        const smileH = 28, openH = 12 + amp01 * 16
        return {
          d: `M ${cx-36} 6
              C ${cx-18} ${smileH} ${cx+18} ${smileH} ${cx+36} 6
              C ${cx+32} ${smileH+openH} ${cx-32} ${smileH+openH} ${cx-36} 6 Z`,
          filled: true, teeth: true,
        }
      }

      case 'worried': return {
        // Frown: control points push path downward at center
        d: `M ${cx-28} 20 C ${cx-10} 8 ${cx+10} 8 ${cx+28} 20`,
        filled: false, teeth: false,
      }

      case 'surprised': {
        // Rounded O shape — a near-circle
        const r = 10 + amp01 * 6
        const t = 10, b = t + r * 2
        return {
          d: `M ${cx} ${t}
              C ${cx-r} ${t} ${cx-r} ${b} ${cx} ${b}
              C ${cx+r} ${b} ${cx+r} ${t} ${cx} ${t} Z`,
          filled: true, teeth: false,
        }
      }

      case 'sleepy': return {
        d: `M ${cx-18} 18 C ${cx-6} 22 ${cx+6} 22 ${cx+18} 18`,
        filled: false, teeth: false,
      }

      default: return {
        d: `M ${cx-24} 17 C ${cx-8} 19 ${cx+8} 19 ${cx+24} 17`,
        filled: false, teeth: false,
      }
    }
  }

  const { d, filled, teeth } = getPath()

  return (
    <svg width={W} height={52} viewBox={`0 0 ${W} 52`} overflow="visible">
      <defs>
        <radialGradient id="mi2" cx="50%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#1a0c14" />
          <stop offset="100%" stopColor="#060308" />
        </radialGradient>
      </defs>
      {filled && <path d={d} fill="url(#mi2)" />}
      {/* Tooth row — only shows when mouth is wide open */}
      {filled && teeth && (
        <clipPath id="teethClip">
          <path d={d} />
        </clipPath>
      )}
      {filled && teeth && (
        <g clipPath="url(#teethClip)">
          <rect x={cx - 20} y={12} width={40} height={8} rx={3} fill="white" opacity={0.75} />
        </g>
      )}
      <path d={d} fill="none"
        stroke="white"
        strokeWidth={filled ? 3.2 : 4.2}
        strokeLinecap="round"
        strokeLinejoin="round" />
    </svg>
  )
}

const EMOTIONS2 = Object.keys(FACE_EMOTIONS) as Emotion2[]
const EMOJI2: Record<Emotion2,string> = {
  idle:'😊',happy:'😄',listening:'👂',thinking:'🤔',speaking:'💬',
  curious:'🧐',excited:'🤩',celebrating:'🎉',worried:'😟',sad:'😢',
  laughing:'😂',love:'❤️',shy:'🙈',sleeping:'💤'
}

// ── Zzz bubble: three staggered letters that drift upward and fade ────────────
function ZzzOverlay({ visible }: { visible: boolean }) {
  const [phase, setPhase] = useState(0)
  const pt = useRef(0)
  useEffect(() => {
    if (!visible) return
    const tick = () => { pt.current += 0.008; setPhase(pt.current); requestAnimationFrame(tick) }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [visible])
  if (!visible) return null

  // Three Z's at different cycle offsets — each completes a 0→1 rise in ~4s
  const z = (offset: number, baseX: number, baseY: number, size: number) => {
    const p = ((phase + offset) % 1)
    const y = baseY - p * 38
    const opacity = p < 0.15 ? p / 0.15 : p > 0.75 ? 1 - (p - 0.75) / 0.25 : 1
    const scale = 0.7 + p * 0.35
    return { x: baseX + Math.sin(phase * 3 + offset * 6) * 5, y, opacity, size: size * scale }
  }

  const z1 = z(0,    196, 68,  11)
  const z2 = z(0.33, 210, 55,  14)
  const z3 = z(0.66, 222, 42,  17)

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {[z1, z2, z3].map(({ x, y, opacity, size }, i) => (
        <text key={i} x={x} y={y} fontSize={size} fontWeight="700"
          fill="#7986cb" opacity={opacity * 0.85}
          fontFamily="-apple-system, sans-serif"
          style={{ userSelect: 'none' }}>Z</text>
      ))}
    </svg>
  )
}

// ── Arousal scale: maps 0-100 onto a smooth eye-openness blend ───────────────
const AROUSAL_PRESETS = [
  { label: '100% Awake',  pct: 100, desc: 'Wide, alert eyes' },
  { label: '75% Relaxed', pct: 75,  desc: 'Soft eyelids, easy smile' },
  { label: '50% Sleepy',  pct: 50,  desc: 'Heavy lids, slow blink' },
  { label: '25% Drowsy',  pct: 25,  desc: 'Eyes almost closed' },
  { label: '0% Sleeping', pct: 0,   desc: 'Fully closed, breathing' },
]

function BuddyFaceScreen() {
  const [emo, setEmo] = useState<Emotion2>('idle')
  const [prev, setPrev] = useState<Emotion2>('idle')
  const [t, setT] = useState(1)
  const [breathe, setBreathe] = useState(0)
  const [blink, setBlink] = useState(false)
  const [speakAmp, setSpeakAmp] = useState(0)
  const [showArousal, setShowArousal] = useState(false)
  const [arousal, setArousal] = useState(100) // 0-100
  const bt = useRef(0)
  const isSleeping = emo === 'sleeping'

  // Breathing — slower and deeper when sleeping
  useEffect(() => {
    const speed = isSleeping ? 0.006 : 0.016
    const amp   = isSleeping ? 4.8 : 3.2
    const tick = () => { bt.current += speed; setBreathe(Math.sin(bt.current) * amp); requestAnimationFrame(tick) }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [isSleeping])

  // Blink — slower when sleeping (only transition blinks, no idle blinks)
  useEffect(() => {
    if (isSleeping) return
    const go = (): ReturnType<typeof setTimeout> => {
      const timer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); go() }, 120)
      }, 2400 + Math.random() * 3600)
      return timer
    }
    const timer = go()
    return () => clearTimeout(timer)
  }, [isSleeping])

  // Speaking amplitude
  useEffect(() => {
    if (emo !== 'speaking') { setSpeakAmp(0); return }
    let run = true, st = 0
    const tick = () => {
      if (!run) return
      st += .065
      setSpeakAmp(Math.max(0, Math.sin(st*3.3)*.38 + Math.sin(st*5.9)*.22 + (Math.random()-.3)*.12))
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { run = false }
  }, [emo])

  const switchEmo = (next: Emotion2) => {
    if (next === emo) return
    setPrev(emo); setEmo(next); setT(0)
    let s: number | null = null
    const anim = (ts: number) => {
      if (!s) s = ts
      const raw = Math.min((ts - s) / 520, 1)
      setT(1 - Math.pow(1 - raw, 3))
      if (raw < 1) requestAnimationFrame(anim)
    }
    requestAnimationFrame(anim)
  }

  // Arousal scale overrides eye openness when active
  const applyArousal = (baseCfg: FaceCfg): FaceCfg => {
    if (!showArousal) return baseCfg
    const openness = (arousal / 100) * 0.98 + 0.01
    return { ...baseCfg, eye: { ...baseCfg.eye, openness } }
  }

  const L = (a: number, b: number) => lerp(a, b, t)
  const fromC = FACE_EMOTIONS[prev], toC = FACE_EMOTIONS[emo]
  const rawCfg: FaceCfg = t < 1 ? {
    eye: {
      openness: L(fromC.eye.openness, toC.eye.openness),
      pupilX: L(fromC.eye.pupilX, toC.eye.pupilX),
      pupilY: L(fromC.eye.pupilY, toC.eye.pupilY),
      pupilScale: L(fromC.eye.pupilScale, toC.eye.pupilScale),
      squint: L(fromC.eye.squint, toC.eye.squint),
    },
    brow: {
      leftY: L(fromC.brow.leftY, toC.brow.leftY),
      rightY: L(fromC.brow.rightY, toC.brow.rightY),
      leftAngle: L(fromC.brow.leftAngle, toC.brow.leftAngle),
      rightAngle: L(fromC.brow.rightAngle, toC.brow.rightAngle),
      leftCurve: L(fromC.brow.leftCurve, toC.brow.leftCurve),
      rightCurve: L(fromC.brow.rightCurve, toC.brow.rightCurve),
    },
    mouth: {
      shape: t > 0.5 ? toC.mouth.shape : fromC.mouth.shape,
      width: L(fromC.mouth.width, toC.mouth.width),
      openness: L(fromC.mouth.openness, toC.mouth.openness),
    },
    cheekOp: L(fromC.cheekOp, toC.cheekOp),
    glow: FACE_EMOTIONS[emo].glow,
  } : FACE_EMOTIONS[emo]

  const cfg = applyArousal(rawCfg)
  const glow = cfg.glow

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

      {/* ── Face display ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          borderRadius: 20, padding: 3,
          background: `linear-gradient(135deg,${glow}35 0%,transparent)`,
          boxShadow: `0 0 60px ${glow}25`,
          transition: 'box-shadow 0.9s ease',
        }}>
          <div style={{
            width: 320, height: 240,
            background: isSleeping ? '#060e1a' : '#0d1b2e',
            borderRadius: 17, position: 'relative', overflow: 'hidden',
            transition: 'background 1.2s ease',
          }}>
            <div style={{ position:'absolute',inset:0,background:`radial-gradient(ellipse at 50% 38%,${glow}16 0%,transparent 68%)`,transition:'background 0.9s' }} />

            {/* Cheeks */}
            {([{ x: -8 }, { x: 208 }] as const).map(({ x }, i) => (
              <svg key={i} width={58} height={30} viewBox="0 0 58 30"
                style={{ position:'absolute', left: x, top: 76, opacity: cfg.cheekOp, transition: 'opacity .5s' }}>
                <defs>
                  <radialGradient id={`ck${i}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff7aaa" stopOpacity=".8"/>
                    <stop offset="100%" stopColor="#ff7aaa" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <ellipse cx="29" cy="15" rx="27" ry="13" fill={`url(#ck${i})`} />
              </svg>
            ))}

            {/* Face group — breathe moves entire face gently */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(-50%,-50%) translate(0,${breathe * 0.32}px)`,
              transition: 'transform 0.1s linear',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ display:'flex', gap:54, marginBottom:-6, paddingLeft:2 }}>
                <FaceBrow brow={cfg.brow} side="left" />
                <FaceBrow brow={cfg.brow} side="right" />
              </div>
              <div style={{ display:'flex', gap:18 }}>
                <FaceEye cfg={cfg.eye} side="left" breathe={breathe} blink={blink} />
                <FaceEye cfg={cfg.eye} side="right" breathe={breathe} blink={blink} />
              </div>
              <div style={{ marginTop: 12 }}>
                <FaceMouth m={cfg.mouth} amp={speakAmp} />
              </div>
            </div>

            {/* Zzz overlay — only visible when sleeping */}
            <ZzzOverlay visible={isSleeping} />

            {/* State label */}
            <div style={{ position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',fontSize:10,color:'#ffffff30',letterSpacing:'.14em',textTransform:'uppercase',userSelect:'none' }}>
              {EMOJI2[emo]} {emo}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
          320 × 240 · M5Stack CoreS3
        </div>

        {/* ── Arousal scale panel ── */}
        <div style={{
          width: 320,
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          padding: '16px 18px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Arousal Scale</span>
            <button onClick={() => setShowArousal(p => !p)} style={{
              padding: '3px 10px', borderRadius: 8,
              border: `1px solid ${showArousal ? '#7986cb' : 'var(--border-default)'}`,
              background: showArousal ? '#7986cb20' : 'transparent',
              color: showArousal ? '#7986cb' : 'var(--text-tertiary)',
              fontSize: 10, cursor: 'pointer', letterSpacing: '0.06em',
            }}>
              {showArousal ? 'ON' : 'OFF'}
            </button>
          </div>
          <input type="range" min={0} max={100} value={arousal}
            onChange={e => { setShowArousal(true); setArousal(Number(e.target.value)) }}
            style={{ width: '100%', accentColor: '#7986cb', cursor: 'pointer', marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {AROUSAL_PRESETS.map(p => (
              <button key={p.pct} onClick={() => { setShowArousal(true); setArousal(p.pct) }}
                style={{
                  padding: '4px 0', width: 56, fontSize: 9, textAlign: 'center',
                  background: arousal === p.pct && showArousal ? '#7986cb20' : 'transparent',
                  border: `1px solid ${arousal === p.pct && showArousal ? '#7986cb' : 'var(--border-subtle)'}`,
                  borderRadius: 6, color: 'var(--text-tertiary)', cursor: 'pointer',
                }}>
                <div style={{ fontSize: 11, marginBottom: 1 }}>{p.pct}%</div>
                <div style={{ fontSize: 7.5, opacity: 0.7, lineHeight: 1.2 }}>{p.desc.split(',')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Emotion grid ── */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Expression Library</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {EMOTIONS2.map(e => {
            const active = e === emo
            const g = FACE_EMOTIONS[e].glow
            return (
              <button key={e} onClick={() => switchEmo(e)} style={{
                padding: '10px 8px', borderRadius: 'var(--r-lg)',
                border: `1px solid ${active ? g : 'var(--border-subtle)'}`,
                background: active ? `${g}18` : 'var(--surface-2)',
                color: active ? g : 'var(--text-secondary)',
                fontSize: 12, cursor: 'pointer', textAlign: 'center',
                transition: 'all .2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.05)' : 'scale(1)',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{EMOJI2[e]}</div>
                <div style={{ fontSize: 10, textTransform: 'capitalize', fontWeight: 500 }}>{e}</div>
              </button>
            )
          })}
        </div>

        {/* Sleep-state callout */}
        {isSleeping && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: '#5c6bc015', border: '1px solid #5c6bc030',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#7986cb', marginBottom: 4 }}>
              💤 Sleeping state active
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Eyes render as smooth closed arcs. Breathing is slower (0.6× speed).
              Zzz bubbles drift upward. Brow is featureless and dropped.
              Mouth is flat and neutral — no smile, no attitude.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNavigate }: { active: ScreenId; onNavigate: (id: ScreenId) => void }) {
  const groups = [...new Set(NAV_ITEMS.map(i => i.group))]

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--surface-0)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 18px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, #1d4ed8, #4f8ef7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.02em',
        }}>B</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Buddy AI</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>Control Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '10px 10px' }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 4 }}>
            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--text-tertiary)',
              padding: '10px 8px 6px',
            }}>{group}</div>
            {NAV_ITEMS.filter(i => i.group === group).map(item => {
              const isActive = item.id === active
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '7px 10px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all var(--dur-fast) var(--ease-out)',
                    marginBottom: 1,
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                >
                  <Icon d={Icons[item.icon]} size={15} strokeWidth={isActive ? 2 : 1.6}
                    color={isActive ? 'var(--accent)' : 'currentColor'} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: 8.5, fontWeight: 700, letterSpacing: '0.05em',
                      background: 'var(--red-dim)', color: 'var(--red)',
                      padding: '2px 5px', borderRadius: 4,
                    }}>{item.badge}</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom status */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, boxShadow: '0 0 6px var(--green)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Buddy is Online</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>192.168.1.42 · v2.4.1</div>
        </div>
      </div>
    </aside>
  )
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar({ screen }: { screen: NavItem | undefined }) {
  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: 'var(--surface-0)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 14, flexShrink: 0,
    }}>
      {screen && (
        <>
          <Icon d={Icons[screen.icon]} size={16} color="var(--text-tertiary)" strokeWidth={1.6} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{screen.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 8 }}>{screen.group}</span>
          </div>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip chip-green" style={{ fontSize: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Connected
        </span>
        <button className="btn-ghost" style={{ padding: '5px 10px' }}>
          <Icon d={Icons.bell} size={14} />
        </button>
        <button className="btn-ghost" style={{ padding: '5px 10px' }}>
          <Icon d={Icons.settings} size={14} />
        </button>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg,#1d4ed8,#4f8ef7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: 'white', cursor: 'pointer',
        }}>A</div>
      </div>
    </header>
  )
}

// ─── Screen router ────────────────────────────────────────────────────────────

function renderScreen(id: ScreenId): React.ReactNode {
  const placeholders: Partial<Record<ScreenId, [string, keyof typeof Icons]>> = {
    'parent-dashboard': ['Parent Dashboard', 'family'],
    'camera':           ['Camera',           'camera'],
    'camera-preview':   ['Camera Preview',   'photo'],
    'family':           ['Family',           'family'],
    'face-enrolment':   ['Face Enrolment',   'face'],
    'face-recognition': ['Face Recognition', 'face'],
    'photos':           ['Photos',           'photos'],
    'photo-gallery':    ['Photo Gallery',    'photos'],
    'clock':            ['Clock Settings',   'clock'],
    'weather':          ['Weather Settings', 'weather'],
    'personality':      ['Buddy Personality','personality'],
    'expressions':      ['Expressions',      'mood'],
    'mechanical':       ['Mechanical Base',  'settings'],
    'rgb':              ['RGB Lights',       'rgb'],
    'voice':            ['Voice',            'voice'],
    'memory':           ['Memory',           'memory'],
    'stories':          ['Stories',          'stories'],
    'education':        ['Education',        'education'],
    'routines':         ['Routines',         'routines'],
    'privacy':          ['Privacy',          'privacy'],
    'security':         ['Security',         'security'],
    'developer':        ['Developer',        'developer'],
    'device-status':    ['Device Status',    'device'],
    'telemetry':        ['Live Telemetry',   'telemetry'],
  }
  if (id === 'dashboard') return <DashboardScreen />
  if (id === 'buddy-face') return <BuddyFaceScreen />
  const ph = placeholders[id]
  if (ph) return <PlaceholderScreen title={ph[0]} icon={ph[1]} />
  return null
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('dashboard')
  const navItem = NAV_ITEMS.find(i => i.id === screen)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={screen} onNavigate={setScreen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar screen={navItem} />
        <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {renderScreen(screen)}
        </main>
      </div>
    </div>
  )
}
