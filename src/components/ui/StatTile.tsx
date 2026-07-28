import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export function StatTile({
  label,
  value,
  delta,
  deltaGoodDirection = 'up',
  icon: Icon,
  sub,
}: {
  label: string
  value: string
  delta?: number // percentage
  deltaGoodDirection?: 'up' | 'down'
  icon?: LucideIcon
  sub?: string
}) {
  const isUp = (delta ?? 0) >= 0
  const isGood = deltaGoodDirection === 'up' ? isUp : !isUp

  return (
    <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn('inline-flex items-center gap-0.5 font-medium', isGood ? 'text-good-700' : 'text-bad-700')}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && <span className="text-slate-400">{sub}</span>}
      </div>
    </div>
  )
}
