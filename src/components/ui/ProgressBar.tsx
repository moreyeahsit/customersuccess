import { cn } from '@/lib/cn'

export function ProgressBar({
  value,
  label,
  showValue = true,
  colorClass,
  className,
}: {
  value: number // 0-100
  label?: string
  showValue?: boolean
  colorClass?: string
  className?: string
}) {
  const tone = colorClass ?? (value >= 75 ? 'bg-good-500' : value >= 50 ? 'bg-warn-500' : 'bg-bad-500')
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && <span className="font-medium text-slate-700">{Math.round(value)}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  )
}
