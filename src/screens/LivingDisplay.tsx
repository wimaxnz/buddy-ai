import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Weather = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'heavy-rain' | 'storm' | 'wind' | 'snow' | 'fog'
export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'golden' | 'sunset' | 'night' | 'late-night'
export type Theme = 'classic-analogue' | 'modern-analogue' | 'premium-digital' | 'minimal' | 'luxury' | 'kids' | 'futuristic' | 'elegant'
export type AgeMode = 'child' | 'adult' | 'senior'

export function mapWeatherFromCondition(condition?: string | null): Weather {
  const c = String(condition ?? '').toLowerCase()
  if (c.includes('storm') || c.includes('thunder')) return 'storm'
  if (c.includes('heavy') && c.includes('rain')) return 'heavy-rain'
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return 'rain'
  if (c.includes('snow') || c.includes('sleet') || c.includes('blizzard')) return 'snow'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'fog'
  if (c.includes('wind')) return 'wind'
  if (c.includes('cloud') || c.includes('overcast')) return c.includes('partly') ? 'partly-cloudy' : 'cloudy'
  if (c.includes('partly')) return 'partly-cloudy'
  return 'sunny'
}

// ─── Sky palettes ─────────────────────────────────────────────────────────────

const SKY: Record<TimeOfDay, { top: string; mid: string; bot: string }> = {
  'dawn':       { top: '#2c1654', mid: '#c84b31', bot: '#f5a623' },
  'morning':    { top: '#4db8ff', mid: '#80cfff', bot: '#c8ebff' },
  'day':        { top: '#1565c0', mid: '#2196f3', bot: '#64b5f6' },
  'golden':     { top: '#c84b00', mid: '#f57c00', bot: '#ffb74d' },
  'sunset':     { top: '#6a1b9a', mid: '#c62828', bot: '#f57c00' },
  'night':      { top: '#020914', mid: '#0a1628', bot: '#0d2040' },
  'late-night': { top: '#010508', mid: '#050d18', bot: '#080f20' },
}

function getTimeOfDay(h: number): TimeOfDay {
  if (h >= 5  && h < 7)  return 'dawn'
  if (h >= 7  && h < 11) return 'morning'
  if (h >= 11 && h < 16) return 'day'
  if (h >= 16 && h < 18) return 'golden'
  if (h >= 18 && h < 20) return 'sunset'
  if (h >= 20 && h < 23) return 'night'
  return 'late-night'
}

// ─── Moon phase ───────────────────────────────────────────────────────────────

function getMoonPhase(): { phase: number; name: string } {
  const ref = new Date('2000-01-06').getTime()
  const cycle = 29.53058867 * 24 * 3600 * 1000
  const phase = ((Date.now() - ref) % cycle) / cycle
  let name = 'New Moon'
  if (phase < 0.02 || phase > 0.98) name = 'New Moon'
  else if (phase < 0.25) name = 'Waxing Crescent'
  else if (phase < 0.27) name = 'First Quarter'
  else if (phase < 0.50) name = 'Waxing Gibbous'
  else if (phase < 0.52) name = 'Full Moon'
  else if (phase < 0.75) name = 'Waning Gibbous'
  else if (phase < 0.77) name = 'Last Quarter'
  else name = 'Waning Crescent'
  return { phase, name }
}

// ─── SVG Weather Icons ────────────────────────────────────────────────────────

function WeatherIcon({ weather, size = 28, tod }: { weather: Weather; size?: number; tod: TimeOfDay }) {
  const isNight = tod === 'night' || tod === 'late-night'
  const s = size

  switch (weather) {
    case 'sunny':
      return isNight ? (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <path d="M20 8 A10 10 0 1 0 20 24 A6 6 0 1 1 20 8 Z" fill="white" opacity="0.9" />
        </svg>
      ) : (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <defs>
            <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe57a" />
              <stop offset="100%" stopColor="#ffb300" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="7" fill="url(#sunG)" />
          {[0,45,90,135,180,225,270,315].map(deg => (
            <line key={deg}
              x1={16 + 9.5 * Math.cos(deg * Math.PI / 180)}
              y1={16 + 9.5 * Math.sin(deg * Math.PI / 180)}
              x2={16 + 13  * Math.cos(deg * Math.PI / 180)}
              y2={16 + 13  * Math.sin(deg * Math.PI / 180)}
              stroke="#ffcc02" strokeWidth="2" strokeLinecap="round" />
          ))}
        </svg>
      )
    case 'partly-cloudy':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <defs>
            <radialGradient id="sunG2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe57a" /><stop offset="100%" stopColor="#ffb300" />
            </radialGradient>
          </defs>
          <circle cx="11" cy="12" r="6" fill="url(#sunG2)" opacity="0.85" />
          <ellipse cx="19" cy="20" rx="10" ry="6" fill="white" opacity="0.95" />
          <ellipse cx="13" cy="22" rx="7"  ry="5" fill="white" opacity="0.95" />
        </svg>
      )
    case 'cloudy':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <ellipse cx="18" cy="18" rx="11" ry="7" fill="#c8d8e8" />
          <ellipse cx="11" cy="20" rx="8"  ry="6" fill="#d8e8f4" />
          <ellipse cx="16" cy="14" rx="8"  ry="6" fill="#ccdcea" />
        </svg>
      )
    case 'rain':
    case 'heavy-rain':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <ellipse cx="16" cy="12" rx="11" ry="7" fill="#8baabf" />
          <ellipse cx="10" cy="14" rx="7"  ry="5" fill="#9bbacf" />
          {[[10,22],[14,26],[18,22],[22,26],[12,28]].map(([x,y],i) => (
            <line key={i} x1={x} y1={y} x2={x-2} y2={y+4}
              stroke="#6699bb" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          ))}
        </svg>
      )
    case 'storm':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <ellipse cx="16" cy="11" rx="12" ry="7" fill="#556677" />
          <ellipse cx="10" cy="13" rx="8"  ry="5" fill="#667788" />
          <path d="M17 16 L13 22 L17 22 L13 30" stroke="#ffe57a" strokeWidth="2"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'wind':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          {[[8,11,22],[8,16,18],[8,21,20]].map(([x1,y,x2],i) => (
            <path key={i}
              d={`M ${x1} ${y} Q ${(x1+x2)/2} ${y - 4} ${x2} ${y}`}
              fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          ))}
        </svg>
      )
    case 'snow':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          <ellipse cx="16" cy="11" rx="11" ry="6" fill="#a8c8e8" opacity="0.85" />
          {[[10,22],[16,26],[22,22],[13,28],[19,19]].map(([x,y],i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <line x1="-3" y1="0" x2="3" y2="0" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      )
    case 'fog':
      return (
        <svg width={s} height={s} viewBox="0 0 32 32">
          {[10,15,20,25].map((y, i) => (
            <line key={i} x1="4" y1={y} x2="28" y2={y}
              stroke="white" strokeWidth="2.5" strokeLinecap="round"
              opacity={0.3 + i * 0.12} />
          ))}
        </svg>
      )
    default: return null
  }
}

// ─── Moon Phase SVG ───────────────────────────────────────────────────────────

function MoonPhaseIcon({ phase }: { phase: number }) {
  const size = 20
  const r = size / 2 - 1
  const cx = size / 2, cy = size / 2

  if (phase < 0.02 || phase > 0.98) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="#1a2040" stroke="white" strokeWidth="0.8" opacity="0.6" />
      </svg>
    )
  }
  if (phase > 0.48 && phase < 0.52) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.9" />
      </svg>
    )
  }
  const illum = phase <= 0.5 ? phase * 2 : (1 - phase) * 2
  const waxing = phase < 0.5
  const offset = r * (1 - illum * 2) * (waxing ? -1 : 1)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id="moonMask">
          <circle cx={cx} cy={cy} r={r} fill="white" />
          <circle cx={cx + offset} cy={cy} r={r} fill="black" />
        </mask>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#1a2040" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r} fill="white" opacity="0.9" mask="url(#moonMask)" />
    </svg>
  )
}

// ─── Analogue Clock ───────────────────────────────────────────────────────────

function ClassicAnalogueClock({ h, m, s, ageMode }: { h: number; m: number; s: number; ageMode: AgeMode }) {
  // Fit inside the safe center zone: cx=160, cy=120, radius capped so it doesn't
  // overlap the four info positions (top=40, bot=200, left=46, right=274)
  const R = ageMode === 'senior' ? 72 : 68
  const cx = 160, cy = 120

  const hourAngle   = ((h % 12) + m / 60) * 30 * Math.PI / 180 - Math.PI / 2
  const minuteAngle = (m + s / 60) * 6     * Math.PI / 180 - Math.PI / 2
  const secondAngle = s            * 6     * Math.PI / 180 - Math.PI / 2

  const hp = (ratio: number, angle: number) => ({
    x: cx + R * ratio * Math.cos(angle),
    y: cy + R * ratio * Math.sin(angle),
  })

  // Hour hand tip + tail
  const hTip  = hp(0.55, hourAngle)
  const hTail = hp(-0.12, hourAngle)
  // Minute hand
  const mTip  = hp(0.78, minuteAngle)
  const mTail = hp(-0.12, minuteAngle)
  // Second hand
  const sTip  = hp(0.82, secondAngle)
  const sTail = hp(-0.2, secondAngle)

  const markers = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * Math.PI / 180 - Math.PI / 2
    const inner = R * (i % 3 === 0 ? 0.84 : 0.90)
    return {
      x1: cx + inner * Math.cos(a),
      y1: cy + inner * Math.sin(a),
      x2: cx + R * 0.97 * Math.cos(a),
      y2: cy + R * 0.97 * Math.sin(a),
      thick: i % 3 === 0,
    }
  })

  return (
    <svg
      width={320} height={240}
      viewBox="0 0 320 240"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
        </radialGradient>
        <filter id="handShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Dial */}
      <circle cx={cx} cy={cy} r={R} fill="url(#faceGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r={R - 4} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />

      {/* Hour markers */}
      {markers.map((mk, i) => (
        <line key={i}
          x1={mk.x1} y1={mk.y1} x2={mk.x2} y2={mk.y2}
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={mk.thick ? 2.2 : 1}
          strokeLinecap="round" />
      ))}

      {/* Roman numerals at 12, 3, 6, 9 */}
      {[['XII', 0], ['III', 3], ['VI', 6], ['IX', 9]].map(([label, idx]) => {
        const a = Number(idx) * 30 * Math.PI / 180 - Math.PI / 2
        const tr = R * 0.72
        return (
          <text key={String(label)}
            x={cx + tr * Math.cos(a)} y={cy + tr * Math.sin(a) + 4}
            textAnchor="middle" fill="rgba(255,255,255,0.7)"
            fontSize={ageMode === 'senior' ? 10 : 8.5}
            fontFamily="Georgia, serif" fontWeight="400"
          >{label}</text>
        )
      })}

      {/* Hour hand */}
      <line x1={hTail.x} y1={hTail.y} x2={hTip.x} y2={hTip.y}
        stroke="white" strokeWidth={ageMode === 'senior' ? 4 : 3.5}
        strokeLinecap="round" filter="url(#handShadow)" />

      {/* Minute hand */}
      <line x1={mTail.x} y1={mTail.y} x2={mTip.x} y2={mTip.y}
        stroke="white" strokeWidth={ageMode === 'senior' ? 2.8 : 2.2}
        strokeLinecap="round" filter="url(#handShadow)" />

      {/* Second hand */}
      <line x1={sTail.x} y1={sTail.y} x2={sTip.x} y2={sTip.y}
        stroke="#ff4444" strokeWidth={1.3}
        strokeLinecap="round" />

      {/* Centre cap */}
      <circle cx={cx} cy={cy} r={3.5} fill="white" />
      <circle cx={cx} cy={cy} r={2} fill="#ff4444" />
    </svg>
  )
}

function ModernAnalogueClock({ h, m, s, ageMode }: { h: number; m: number; s: number; ageMode: AgeMode }) {
  const R = ageMode === 'senior' ? 72 : 68
  const cx = 160, cy = 120

  const hourAngle   = ((h % 12) + m / 60) * 30 * Math.PI / 180 - Math.PI / 2
  const minuteAngle = (m + s / 60) * 6     * Math.PI / 180 - Math.PI / 2
  const secondAngle = s            * 6     * Math.PI / 180 - Math.PI / 2

  const pt = (ratio: number, angle: number) => ({
    x: cx + R * ratio * Math.cos(angle),
    y: cy + R * ratio * Math.sin(angle),
  })

  const hTip  = pt(0.52, hourAngle),  hTail = pt(-0.14, hourAngle)
  const mTip  = pt(0.78, minuteAngle), mTail = pt(-0.14, minuteAngle)
  const sTip  = pt(0.86, secondAngle), sTail = pt(-0.24, secondAngle)

  // Dot markers instead of tick lines
  const dots = Array.from({ length: 60 }, (_, i) => {
    const a = i * 6 * Math.PI / 180 - Math.PI / 2
    const r2 = i % 5 === 0 ? R * 0.93 : R * 0.96
    return { x: cx + r2 * Math.cos(a), y: cy + r2 * Math.sin(a), main: i % 5 === 0 }
  })

  // Minute arc (progress ring)
  const mProgress = (m + s / 60) / 60
  const arcAngle = mProgress * 2 * Math.PI
  const arcX = cx + R * Math.cos(-Math.PI / 2 + arcAngle)
  const arcY = cy + R * Math.sin(-Math.PI / 2 + arcAngle)
  const largeArc = arcAngle > Math.PI ? 1 : 0

  return (
    <svg width={320} height={240} viewBox="0 0 320 240"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Minute progress arc */}
      {mProgress > 0.005 && (
        <path
          d={`M ${cx} ${cy - R} A ${R} ${R} 0 ${largeArc} 1 ${arcX} ${arcY}`}
          fill="none" stroke="rgba(120,200,255,0.45)" strokeWidth="2"
          strokeLinecap="round" />
      )}

      {/* Dot markers */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y}
          r={d.main ? 2 : 0.9}
          fill={d.main ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'} />
      ))}

      {/* Hour hand — wide tapered */}
      <line x1={hTail.x} y1={hTail.y} x2={hTip.x} y2={hTip.y}
        stroke="rgba(255,255,255,0.95)" strokeWidth={ageMode === 'senior' ? 4.5 : 3.5}
        strokeLinecap="round" />

      {/* Minute hand */}
      <line x1={mTail.x} y1={mTail.y} x2={mTip.x} y2={mTip.y}
        stroke="rgba(255,255,255,0.85)" strokeWidth={ageMode === 'senior' ? 2.8 : 2}
        strokeLinecap="round" />

      {/* Second hand — accent colour, thin */}
      <line x1={sTail.x} y1={sTail.y} x2={sTip.x} y2={sTip.y}
        stroke="#78c8ff" strokeWidth="1.2" strokeLinecap="round"
        filter="url(#glow)" />

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.95)" />
      <circle cx={cx} cy={cy} r={2.2} fill="#78c8ff" />
    </svg>
  )
}

// ─── Particle systems ─────────────────────────────────────────────────────────

interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; id: number }

function useParticles(
  count: number,
  active: boolean,
  initFn: () => Particle,
  updateFn: (p: Particle, dt: number) => Particle,
  resetFn: (p: Particle) => boolean
): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([])
  const rafRef = useRef(0)
  const lastT = useRef(0)

  useEffect(() => {
    if (!active) { setParticles([]); return }
    setParticles(Array.from({ length: count }, (_, i) => ({ ...initFn(), id: i })))
  }, [active, count])

  useEffect(() => {
    if (!active) return
    const tick = (ts: number) => {
      const dt = Math.min((ts - lastT.current) / 16, 3)
      lastT.current = ts
      setParticles(prev => prev.map(p => {
        const updated = updateFn(p, dt)
        return resetFn(updated) ? { ...initFn(), id: p.id } : updated
      }))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, updateFn, resetFn, initFn])

  return particles
}

// ─── Rain layer ───────────────────────────────────────────────────────────────

function RainLayer({ heavy }: { heavy?: boolean }) {
  const count = heavy ? 55 : 28
  const speed = heavy ? 14 : 8

  const init = useCallback((): Particle => ({
    x: Math.random() * 340 - 10, y: Math.random() * 260 - 20,
    vx: -1.2, vy: speed + Math.random() * 4,
    size: heavy ? 1.2 : 0.9, opacity: 0.35 + Math.random() * 0.3, id: 0,
  }), [speed, heavy])

  const update = useCallback((p: Particle, dt: number) => ({
    ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt,
  }), [])

  const reset = useCallback((p: Particle) => p.y > 250, [])
  const particles = useParticles(count, true, init, update, reset)

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {particles.map(p => (
        <line key={p.id}
          x1={p.x} y1={p.y} x2={p.x + p.vx * 4} y2={p.y - p.vy * 1.5}
          stroke="#88bbdd" strokeWidth={p.size} strokeLinecap="round" opacity={p.opacity} />
      ))}
    </svg>
  )
}

// ─── Snow layer ───────────────────────────────────────────────────────────────

function SnowLayer() {
  const init = useCallback((): Particle => ({
    x: Math.random() * 340 - 10, y: Math.random() * -40,
    vx: (Math.random() - 0.5) * 0.8, vy: 0.8 + Math.random() * 1.2,
    size: 1.5 + Math.random() * 2.5, opacity: 0.5 + Math.random() * 0.4, id: 0,
  }), [])

  const phaseRef = useRef(Math.random() * Math.PI * 2)
  const update = useCallback((p: Particle, dt: number) => {
    phaseRef.current += 0.01
    return { ...p, x: p.x + p.vx * dt + Math.sin(p.y * 0.05 + phaseRef.current) * 0.3, y: p.y + p.vy * dt }
  }, [])

  const reset = useCallback((p: Particle) => p.y > 250, [])
  const particles = useParticles(36, true, init, update, reset)

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {particles.map(p => (
        <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill="white" opacity={p.opacity} />
      ))}
    </svg>
  )
}

// ─── Stars layer ──────────────────────────────────────────────────────────────

function StarsLayer({ visible }: { visible: boolean }) {
  const [twinkle, setTwinkle] = useState(0)
  const stars = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * 320, y: Math.random() * 160,
      r: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2, id: i,
    }))
  )
  const rt = useRef(0)

  useEffect(() => {
    if (!visible) return
    const tick = () => { rt.current += 0.02; setTwinkle(rt.current); requestAnimationFrame(tick) }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [visible])

  if (!visible) return null
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {stars.current.map(s => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r} fill="white"
          opacity={0.4 + 0.5 * Math.abs(Math.sin(twinkle + s.phase))} />
      ))}
    </svg>
  )
}

// ─── Cloud layer ──────────────────────────────────────────────────────────────

interface Cloud { x: number; y: number; scale: number; opacity: number; speed: number; id: number }

function CloudLayer({ weather }: { weather: Weather }) {
  const visible = ['partly-cloudy', 'cloudy', 'rain', 'heavy-rain', 'storm', 'wind', 'fog'].includes(weather)
  const count = weather === 'cloudy' || weather === 'fog' ? 5 : 3
  const colorMap: Partial<Record<Weather, string>> = {
    'rain': '#8899aa', 'heavy-rain': '#667788', 'storm': '#445566',
    'fog': '#aabbcc', 'cloudy': '#99aabb',
  }
  const cloudColor = colorMap[weather] ?? '#c8d8e8'

  const [clouds, setClouds] = useState<Cloud[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    if (!visible) { setClouds([]); return }
    setClouds(Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 400, y: 10 + Math.random() * 60,
      scale: 0.7 + Math.random() * 0.8,
      opacity: 0.55 + Math.random() * 0.35,
      speed: 0.15 + Math.random() * 0.25, id: i,
    })))
  }, [visible, count])

  useEffect(() => {
    if (!visible) return
    const tick = () => {
      setClouds(prev => prev.map(c => ({
        ...c, x: c.x <= -160 ? 360 + Math.random() * 80 : c.x - c.speed,
      })))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible])

  if (!visible) return null

  const cloudPath = (cx: number, cy: number, sc: number) =>
    `M ${cx} ${cy + 12 * sc}
     q 0 ${-8 * sc} ${10 * sc} ${-8 * sc}
     q ${2 * sc} ${-10 * sc} ${16 * sc} ${-8 * sc}
     q ${4 * sc} ${-8 * sc} ${16 * sc} ${-2 * sc}
     q ${10 * sc} 0 ${10 * sc} ${8 * sc}
     q ${8 * sc} 0 ${8 * sc} ${10 * sc} Z`

  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {clouds.map(c => (
        <path key={c.id} d={cloudPath(c.x, c.y, c.scale)} fill={cloudColor} opacity={c.opacity} />
      ))}
    </svg>
  )
}

// ─── Fog / Lightning / Sun / Wind layers ─────────────────────────────────────

function FogLayer({ visible }: { visible: boolean }) {
  const [off, setOff] = useState(0)
  const rt = useRef(0)
  useEffect(() => {
    if (!visible) return
    const tick = () => { rt.current += 0.003; setOff(rt.current); requestAnimationFrame(tick) }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [visible])
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'linear-gradient(180deg, transparent 0%, rgba(180,200,220,0.18) 40%, rgba(180,200,220,0.28) 100%)',
      transform: `translateX(${Math.sin(off) * 8}px)`,
    }} />
  )
}

function LightningLayer({ visible }: { visible: boolean }) {
  const [flash, setFlash] = useState(0)
  useEffect(() => {
    if (!visible) return
    const schedule = () => {
      const t = setTimeout(() => {
        setFlash(1); setTimeout(() => setFlash(0), 80); schedule()
      }, 4000 + Math.random() * 8000)
      return t
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [visible])
  if (!visible || flash === 0) return null
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(220,230,255,0.14)' }} />
}

function SunGlow({ tod }: { tod: TimeOfDay }) {
  const show = tod === 'morning' || tod === 'day' || tod === 'dawn' || tod === 'golden'
  const sunY = tod === 'dawn' ? 200 : tod === 'morning' ? 30 : tod === 'golden' ? 180 : 20
  const color = tod === 'golden' || tod === 'dawn' ? '#ff8c00' : '#ffe57a'
  if (!show) return null
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy={`${(sunY / 240) * 100}%`} r="40%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="240" fill="url(#sunGlow)" />
    </svg>
  )
}

function WindLayer() {
  const init = useCallback((): Particle => ({
    x: Math.random() * 360 + 10, y: Math.random() * 220,
    vx: -(2 + Math.random() * 3), vy: (Math.random() - 0.5) * 0.4,
    size: 40 + Math.random() * 80, opacity: 0.08 + Math.random() * 0.12, id: 0,
  }), [])
  const update = useCallback((p: Particle, dt: number) => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt }), [])
  const reset = useCallback((p: Particle) => p.x < -100, [])
  const particles = useParticles(12, true, init, update, reset)
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      width="320" height="240" viewBox="0 0 320 240">
      {particles.map(p => (
        <line key={p.id} x1={p.x} y1={p.y} x2={p.x + p.size} y2={p.y + p.vy * 8}
          stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity={p.opacity} />
      ))}
    </svg>
  )
}

// ─── Digital clock style config ───────────────────────────────────────────────

interface ClockStyle {
  timeColor: string
  timeFontSize: number
  timeFontWeight: string | number
  timeFontFamily: string
  timeLetterSpacing: string
  secondsOpacity: number
  shadow: string
}

const DIGITAL_THEME_STYLES: Record<string, ClockStyle> = {
  'premium-digital': {
    timeColor: 'rgba(255,255,255,0.96)',
    timeFontSize: 72, timeFontWeight: 200,
    timeFontFamily: "'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
    timeLetterSpacing: '-0.04em', secondsOpacity: 0.45,
    shadow: '0 2px 40px rgba(0,0,0,0.5)',
  },
  'minimal': {
    timeColor: 'rgba(255,255,255,0.88)',
    timeFontSize: 68, timeFontWeight: 100,
    timeFontFamily: "'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
    timeLetterSpacing: '-0.05em', secondsOpacity: 0.3,
    shadow: 'none',
  },
  'luxury': {
    timeColor: '#f5d78e',
    timeFontSize: 66, timeFontWeight: 300,
    timeFontFamily: "'Georgia', 'Times New Roman', serif",
    timeLetterSpacing: '0.02em', secondsOpacity: 0.5,
    shadow: '0 0 30px rgba(245,215,142,0.25)',
  },
  'kids': {
    timeColor: 'white',
    timeFontSize: 64, timeFontWeight: 700,
    timeFontFamily: "'Arial Rounded MT Bold', 'Arial', sans-serif",
    timeLetterSpacing: '0.01em', secondsOpacity: 0.6,
    shadow: '0 3px 12px rgba(0,0,0,0.4)',
  },
  'futuristic': {
    timeColor: '#00f5e4',
    timeFontSize: 70, timeFontWeight: 300,
    timeFontFamily: "'Courier New', monospace",
    timeLetterSpacing: '0.06em', secondsOpacity: 0.6,
    shadow: '0 0 24px rgba(0,245,228,0.35)',
  },
  'elegant': {
    timeColor: 'rgba(255,255,255,0.92)',
    timeFontSize: 64, timeFontWeight: 200,
    timeFontFamily: "'Palatino', 'Book Antiqua', serif",
    timeLetterSpacing: '0.03em', secondsOpacity: 0.4,
    shadow: '0 2px 20px rgba(0,0,0,0.35)',
  },
}

const AGE_OVERRIDES: Record<AgeMode, Partial<ClockStyle>> = {
  child:  { timeFontSize: 62, timeFontWeight: 700 },
  adult:  {},
  senior: { timeFontSize: 80, timeFontWeight: 400, timeLetterSpacing: '-0.01em' },
}

// ─── Living Display canvas ────────────────────────────────────────────────────

export function BuddyLivingDisplay({
  weather, theme, ageMode, todOverride, tempDisplay,
}: {
  weather: Weather; theme: Theme; ageMode: AgeMode; todOverride: TimeOfDay | 'auto'
  tempDisplay?: string
}) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds()
  const tod: TimeOfDay = todOverride === 'auto' ? getTimeOfDay(h) : todOverride
  const sky = SKY[tod]
  const moon = getMoonPhase()
  const isNight = tod === 'night' || tod === 'late-night'
  const isLateNight = tod === 'late-night'

  const hh = String(h % 12 || 12).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  const ampm = h < 12 ? 'AM' : 'PM'
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const day = days[now.getDay()]

  const isAnalogue = theme === 'classic-analogue' || theme === 'modern-analogue'
  const baseStyle = DIGITAL_THEME_STYLES[theme] ?? DIGITAL_THEME_STYLES['premium-digital']
  const ageOvr = AGE_OVERRIDES[ageMode]
  const cs: ClockStyle = { ...baseStyle, ...ageOvr }

  const infoStyle = {
    color: ageMode === 'senior' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.82)',
    fontSize: ageMode === 'senior' ? 15 : 12,
    fontWeight: ageMode === 'senior' ? 600 : 400,
    letterSpacing: '0.04em',
    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
    userSelect: 'none' as const,
  }

  return (
    <div style={{
      width: 320, height: 240,
      background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 55%, ${sky.bot} 100%)`,
      position: 'relative', overflow: 'hidden',
      borderRadius: 17,
      opacity: isLateNight ? 0.72 : 1,
      transition: 'opacity 2s ease',
    }}>
      <SunGlow tod={tod} />
      <StarsLayer visible={isNight} />
      <CloudLayer weather={weather} />
      <FogLayer visible={weather === 'fog'} />
      {(weather === 'rain' || weather === 'storm') && <RainLayer />}
      {weather === 'heavy-rain' && <RainLayer heavy />}
      {weather === 'snow' && <SnowLayer />}
      {weather === 'wind' && <WindLayer />}
      <LightningLayer visible={weather === 'storm'} />

      {/* ── Analogue clocks (SVG overlay) ── */}
      {theme === 'classic-analogue' && <ClassicAnalogueClock h={h} m={m} s={s} ageMode={ageMode} />}
      {theme === 'modern-analogue'  && <ModernAnalogueClock  h={h} m={m} s={s} ageMode={ageMode} />}

      {/* ── 12 o'clock — weather icon ── */}
      <div style={{
        position: 'absolute', top: 10, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center',
      }}>
        <WeatherIcon weather={weather} size={26} tod={tod} />
      </div>

      {/* ── 9 o'clock — temperature ── */}
      <div style={{
        position: 'absolute', left: 14, top: '50%',
        transform: 'translateY(-50%)', ...infoStyle,
        fontSize: ageMode === 'senior' ? 17 : 13,
        fontWeight: ageMode === 'senior' ? 700 : 500,
      }}>{tempDisplay ?? '18°'}</div>

      {/* ── 3 o'clock — weekday ── */}
      <div style={{
        position: 'absolute', right: 14, top: '50%',
        transform: 'translateY(-50%)', ...infoStyle,
        fontWeight: ageMode === 'senior' ? 700 : 500,
      }}>{day}</div>

      {/* ── 6 o'clock — moon phase ── */}
      <div style={{
        position: 'absolute', bottom: 10, left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <MoonPhaseIcon phase={moon.phase} />
      </div>

      {/* ── Centre: digital time (only for non-analogue themes) ── */}
      {!isAnalogue && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          userSelect: 'none',
        }}>
          <div style={{
            fontSize: cs.timeFontSize, fontWeight: cs.timeFontWeight,
            fontFamily: cs.timeFontFamily, color: cs.timeColor,
            letterSpacing: cs.timeLetterSpacing, lineHeight: 1,
            textShadow: cs.shadow, fontVariantNumeric: 'tabular-nums',
          }}>
            {hh}<span style={{ opacity: 0.7 + 0.3 * (s % 2) }}>:</span>{mm}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
            opacity: cs.secondsOpacity, color: cs.timeColor,
            fontSize: ageMode === 'senior' ? 16 : 13,
            fontFamily: cs.timeFontFamily, fontWeight: cs.timeFontWeight,
            letterSpacing: cs.timeLetterSpacing, textShadow: cs.shadow,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span>{ss}</span>
            <span style={{ fontSize: ageMode === 'senior' ? 13 : 10, opacity: 0.7 }}>{ampm}</span>
          </div>
        </div>
      )}

      {/* Analogue: digital time below dial as small label */}
      {isAnalogue && (
        <div style={{
          position: 'absolute', bottom: 34, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: ageMode === 'senior' ? 15 : 12,
          color: 'rgba(255,255,255,0.55)',
          fontFamily: "'SF Pro Display', system-ui, sans-serif",
          fontWeight: 300, letterSpacing: '0.05em',
          fontVariantNumeric: 'tabular-nums',
          userSelect: 'none', whiteSpace: 'nowrap',
        }}>
          {hh}:{mm}:{ss} {ampm}
        </div>
      )}

      {/* Theme watermark */}
      <div style={{
        position: 'absolute', top: 6, right: 10,
        fontSize: 7.5, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)', userSelect: 'none',
      }}>{theme}</div>
    </div>
  )
}

// ─── Control bar ──────────────────────────────────────────────────────────────

function ControlBtn<T extends string>({
  options, value, onChange, label,
}: {
  options: { v: T; label: string }[]; value: T; onChange: (v: T) => void; label: string
}) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            padding: '5px 10px', borderRadius: 8,
            border: `1px solid ${value === o.v ? 'var(--accent)' : 'var(--border-subtle)'}`,
            background: value === o.v ? 'var(--accent-dim)' : 'var(--surface-2)',
            color: value === o.v ? 'var(--accent)' : 'var(--text-secondary)',
            fontSize: 11, cursor: 'pointer', fontWeight: value === o.v ? 600 : 400,
            transition: 'all 0.15s',
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

// ─── Main exported screen ─────────────────────────────────────────────────────

export default function LivingDisplayScreen() {
  const [weather, setWeather] = useState<Weather>('sunny')
  const [theme, setTheme]     = useState<Theme>('classic-analogue')
  const [ageMode, setAgeMode] = useState<AgeMode>('adult')
  const [tod, setTod]         = useState<TimeOfDay | 'auto'>('auto')

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <div style={{
          borderRadius: 20, padding: 3,
          background: 'linear-gradient(135deg, rgba(79,142,247,0.25) 0%, transparent)',
          boxShadow: '0 0 60px rgba(79,142,247,0.15)',
        }}>
          <BuddyLivingDisplay weather={weather} theme={theme} ageMode={ageMode} todOverride={tod} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
          320 × 240 · CoreS3 · Living Display
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 20 }}>

        <ControlBtn<Theme>
          label="Clock Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { v: 'classic-analogue', label: '🕰 Classic Analogue' },
            { v: 'modern-analogue',  label: '⌚ Modern Analogue' },
            { v: 'premium-digital',  label: '💠 Premium Digital' },
            { v: 'minimal',          label: '· Minimal' },
            { v: 'luxury',           label: '✦ Luxury' },
            { v: 'kids',             label: '🎈 Kids' },
            { v: 'futuristic',       label: '⬡ Futuristic' },
            { v: 'elegant',          label: '❧ Elegant' },
          ]}
        />

        <ControlBtn<Weather>
          label="Weather Condition"
          value={weather}
          onChange={setWeather}
          options={[
            { v: 'sunny',        label: '☀️ Sunny' },
            { v: 'partly-cloudy',label: '⛅ Part Cloud' },
            { v: 'cloudy',       label: '☁️ Cloudy' },
            { v: 'rain',         label: '🌧 Rain' },
            { v: 'heavy-rain',   label: '⛈ Heavy Rain' },
            { v: 'storm',        label: '🌩 Storm' },
            { v: 'wind',         label: '🌬 Wind' },
            { v: 'snow',         label: '❄️ Snow' },
            { v: 'fog',          label: '🌫 Fog' },
          ]}
        />

        <ControlBtn<TimeOfDay | 'auto'>
          label="Time of Day"
          value={tod}
          onChange={setTod}
          options={[
            { v: 'auto',       label: '🕐 Auto' },
            { v: 'dawn',       label: '🌄 Dawn' },
            { v: 'morning',    label: '🌅 Morning' },
            { v: 'day',        label: '☀️ Day' },
            { v: 'golden',     label: '🌇 Golden' },
            { v: 'sunset',     label: '🌆 Sunset' },
            { v: 'night',      label: '🌙 Night' },
            { v: 'late-night', label: '💤 Late Night' },
          ]}
        />

        <ControlBtn<AgeMode>
          label="Age Mode"
          value={ageMode}
          onChange={setAgeMode}
          options={[
            { v: 'child',  label: '🧒 Child' },
            { v: 'adult',  label: '👤 Adult' },
            { v: 'senior', label: '👴 Senior' },
          ]}
        />

        <div style={{
          background: 'var(--surface-1)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-lg)', padding: '14px 16px',
          fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, fontSize: 12 }}>Fixed Info Layout</div>
          <div>☁️ <strong style={{ color: 'var(--text-secondary)' }}>12 o'clock</strong> — Weather icon</div>
          <div>🌡 <strong style={{ color: 'var(--text-secondary)' }}>9 o'clock</strong> — Temperature</div>
          <div>📅 <strong style={{ color: 'var(--text-secondary)' }}>3 o'clock</strong> — Weekday</div>
          <div>🌙 <strong style={{ color: 'var(--text-secondary)' }}>6 o'clock</strong> — Moon phase</div>
        </div>
      </div>
    </div>
  )
}
