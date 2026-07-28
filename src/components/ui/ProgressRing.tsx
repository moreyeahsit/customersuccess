export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  sublabel,
  color = '#5b5fe8',
  trackColor = '#eef0fb',
}: {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
  trackColor?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-slate-800">{label ?? `${Math.round(value)}%`}</span>
        {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
      </div>
    </div>
  )
}
