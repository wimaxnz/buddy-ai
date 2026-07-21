import { useEffect, useRef, useState } from 'react'

export function MiniFace({ emotion }: { emotion: string }) {
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
      <path d="M 28 46 C 34 54 48 54 54 46"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
