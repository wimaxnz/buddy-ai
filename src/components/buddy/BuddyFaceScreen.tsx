import { useEffect, useRef, useState } from 'react'
import type { LiveTelemetry } from '@/api/types'

export type Emotion2 = 'idle' | 'happy' | 'listening' | 'thinking' | 'speaking'
  | 'curious' | 'excited' | 'celebrating' | 'worried' | 'sad'
  | 'laughing' | 'love' | 'shy' | 'sleeping'

interface EyeS { openness: number; pupilX: number; pupilY: number; pupilScale: number; squint: number }
interface BrowS { leftY: number; rightY: number; leftAngle: number; rightAngle: number; leftCurve: number; rightCurve: number }
interface MouthS { shape: string; width: number; openness: number }
interface FaceCfg { eye: EyeS; brow: BrowS; mouth: MouthS; cheekOp: number; glow: string }

const FACE_EMOTIONS: Record<Emotion2, FaceCfg> = {
  // Relaxed, soft smile ΓÇö pupils centered, brows at ease
  idle:      { eye:{openness:.82,pupilX:0,pupilY:.04,pupilScale:1,squint:.06},          brow:{leftY:-.04,rightY:-.04,leftAngle:0,rightAngle:0,leftCurve:.08,rightCurve:.08},     mouth:{shape:'tinySmile',width:.96,openness:0},    cheekOp:.28, glow:'#4fc3f7' },
  // Happy squint-smile: lids lower, cheeks lift, brows gently arched
  happy:     { eye:{openness:.52,pupilX:0,pupilY:.06,pupilScale:1.08,squint:.48},        brow:{leftY:-.18,rightY:-.18,leftAngle:5,rightAngle:-5,leftCurve:.38,rightCurve:.38},    mouth:{shape:'smile',width:1.08,openness:.25},     cheekOp:.68, glow:'#ffd54f' },
  // Attentive ΓÇö wide open eyes, subtle brow raise, mouth soft closed
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
  // and featureless, mouth perfectly flat and neutral ΓÇö no hint of attitude.
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

  // ΓöÇΓöÇ Closed-eye rendering ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // When open < 0.07 the lens clip degenerates into a crescent that reads as
  // smug/bored. Instead draw a single smooth arc: the lower eyelid resting on
  // the upper ΓÇö this is exactly how Pixar/Disney characters look when asleep.
  if (open < 0.07) {
    const lx = cx - rx * 0.88, rx2 = cx + rx * 0.88
    // Gentle downward arc ΓÇö lower lid resting naturally, no white showing
    const closedArc = `M ${lx} ${cy - 2} Q ${cx} ${cy + ry * 0.28} ${rx2} ${cy - 2}`
    // Very subtle lash thickness above the line
    const lashArc   = `M ${lx} ${cy - 2} Q ${cx} ${cy + ry * 0.24} ${rx2} ${cy - 2}`
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} overflow="visible">
        {/* Lash shadow ΓÇö soft fill band gives eyelid mass */}
        <path d={`${closedArc} Q ${cx} ${cy + ry * 0.10} ${lx} ${cy - 2} Z`}
          fill="#142038" opacity="0.55" />
        {/* Main closed lid line */}
        <path d={closedArc} fill="none" stroke="#0c1828" strokeWidth="3.6" strokeLinecap="round" />
        {/* Fine lash edge */}
        <path d={lashArc}   fill="none" stroke="#162236" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  // ΓöÇΓöÇ Open-eye lens rendering ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  // Quadratic arc: peak at 0.5*ctrl + 0.25*(P0+P2)
  // To put upper lid peak at cy - ry*open ΓåÆ ctrl.y = cy - 2*ry*open
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
  // All shapes use cubic bezier curves. Open shapes are oval-based ΓÇö amplitude
  // scales the height of the opening, never the corner positions, so the shape
  // can never collapse to a triangle regardless of amplitude value.
  const W = 92 * m.width, cx = W / 2
  const amp01 = Math.min(1, Math.max(0, m.openness + amp * 0.62))

  // Corner lift for smile shapes (corner Y moves up for smiles)
  const getPath = (): { d: string; filled: boolean; teeth: boolean } => {
    switch (m.shape) {

      case 'closed': return {
        // Gently flat ΓÇö almost a straight line with soft curve
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
        const h = 6 + amp01 * 26 // oval height ΓÇö scales with amplitude only
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
        // Big smile arc on top, wide oval opening below ΓÇö always rounded
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
        // Rounded O shape ΓÇö a near-circle
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
      {/* Tooth row ΓÇö only shows when mouth is wide open */}
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
  idle:'≡ƒÿè',happy:'≡ƒÿä',listening:'≡ƒæé',thinking:'≡ƒñö',speaking:'≡ƒÆ¼',
  curious:'≡ƒºÉ',excited:'≡ƒñ⌐',celebrating:'≡ƒÄë',worried:'≡ƒÿƒ',sad:'≡ƒÿó',
  laughing:'≡ƒÿé',love:'Γ¥ñ∩╕Å',shy:'≡ƒÖê',sleeping:'≡ƒÆñ'
}

// ΓöÇΓöÇ Zzz bubble: three staggered letters that drift upward and fade ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // Three Z's at different cycle offsets ΓÇö each completes a 0ΓåÆ1 rise in ~4s
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

// ΓöÇΓöÇ Arousal scale: maps 0-100 onto a smooth eye-openness blend ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const AROUSAL_PRESETS = [
  { label: '100% Awake',  pct: 100, desc: 'Wide, alert eyes' },
  { label: '75% Relaxed', pct: 75,  desc: 'Soft eyelids, easy smile' },
  { label: '50% Sleepy',  pct: 50,  desc: 'Heavy lids, slow blink' },
  { label: '25% Drowsy',  pct: 25,  desc: 'Eyes almost closed' },
  { label: '0% Sleeping', pct: 0,   desc: 'Fully closed, breathing' },
]

export function mapTelemetryEmotion(live: LiveTelemetry | null | undefined): Emotion2 {
  if (!live) return 'idle'
  const state = String(live.state || '').toLowerCase()
  const face = String(live.express_face || live.face_state || live.emotion || '').toLowerCase()
  if (state.includes('sleep') || face.includes('sleep')) return 'sleeping'
  if (live.speaking || state.includes('speaking')) return 'speaking'
  if (live.thinking || state.includes('think')) return 'thinking'
  if (live.listening || state.includes('listen')) return 'listening'
  const map: Record<string, Emotion2> = {
    idle: 'idle', happy: 'happy', listening: 'listening', thinking: 'thinking', speaking: 'speaking',
    curious: 'curious', excited: 'excited', celebrating: 'celebrating', worried: 'worried', sad: 'sad',
    laughing: 'laughing', love: 'love', shy: 'shy', sleeping: 'sleeping', concerned: 'worried',
    confused: 'curious', proud: 'happy', storytelling: 'happy', encouragement: 'happy', wake: 'happy',
  }
  for (const [k, v] of Object.entries(map)) {
    if (face.includes(k)) return v
  }
  if (live.story_mode || live.story_active) return 'happy'
  return 'idle'
}

export function BuddyFaceScreen({ live, liveMode = false, compact = false }: {
  live?: LiveTelemetry | null
  liveMode?: boolean
  compact?: boolean
}) {
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

  // Breathing ΓÇö slower and deeper when sleeping
  useEffect(() => {
    const speed = isSleeping ? 0.006 : 0.016
    const amp   = isSleeping ? 4.8 : 3.2
    const tick = () => { bt.current += speed; setBreathe(Math.sin(bt.current) * amp); requestAnimationFrame(tick) }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [isSleeping])

  // Blink ΓÇö slower when sleeping (only transition blinks, no idle blinks)
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

  useEffect(() => {
    if (!liveMode || !live) return
    const next = mapTelemetryEmotion(live)
    if (next !== emo) switchEmo(next)
  }, [live, liveMode])

  const applyArousal = (baseCfg: FaceCfg): FaceCfg => {
    if (!showArousal || liveMode) return baseCfg
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

  // Speaking amplitude — also when live reports speaking
  useEffect(() => {
    const speaking = emo === 'speaking' || (liveMode && (live?.speaking || String(live?.state).toLowerCase().includes('speaking')))
    if (!speaking) { setSpeakAmp(0); return }
    let run = true, st = 0
    const tick = () => {
      if (!run) return
      st += .065
      setSpeakAmp(Math.max(0, Math.sin(st*3.3)*.38 + Math.sin(st*5.9)*.22 + (Math.random()-.3)*.12))
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => { run = false }
  }, [emo, liveMode, live?.speaking, live?.state])

  const faceW = compact ? 240 : 320
  const faceH = compact ? 180 : 240

  return (
    <div className={`buddy-face-screen${compact ? ' is-compact' : ''}`} style={{ display: 'flex', gap: compact ? 16 : 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ΓöÇΓöÇ Face display ΓöÇΓöÇ */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{
          borderRadius: 20, padding: 3,
          background: `linear-gradient(135deg,${glow}35 0%,transparent)`,
          boxShadow: `0 0 60px ${glow}25`,
          transition: 'box-shadow 0.9s ease',
        }}>
          <div style={{
            width: faceW, height: faceH,
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

            {/* Face group ΓÇö breathe moves entire face gently */}
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

            {/* Zzz overlay ΓÇö only visible when sleeping */}
            <ZzzOverlay visible={isSleeping} />

            {/* State label */}
            <div style={{ position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',fontSize:10,color:'#ffffff30',letterSpacing:'.14em',textTransform:'uppercase',userSelect:'none' }}>
              {EMOJI2[emo]} {emo}
            </div>
          </div>
        </div>

        {!compact && (
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
          {faceW} × {faceH} · M5Stack CoreS3
        </div>
        )}

        {!liveMode && !compact && (
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
        )}
      </div>

      {!liveMode && (
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
              ≡ƒÆñ Sleeping state active
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Eyes render as smooth closed arcs. Breathing is slower (0.6├ù speed).
              Zzz bubbles drift upward. Brow is featureless and dropped.
              Mouth is flat and neutral ΓÇö no smile, no attitude.
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  )
}
