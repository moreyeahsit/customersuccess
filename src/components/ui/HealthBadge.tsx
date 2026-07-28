import { getHealthStatus, HEALTH_STATUS_META } from '@/lib/derive'
import { cn } from '@/lib/cn'

export function HealthBadge({ score, className }: { score: number; className?: string }) {
  const status = getHealthStatus(score)
  const meta = HEALTH_STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        meta.bg,
        meta.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

export function Pill({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'brand'
  children: React.ReactNode
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-slate-100 text-slate-600',
    good: 'bg-good-50 text-good-700',
    warn: 'bg-warn-50 text-warn-700',
    bad: 'bg-bad-50 text-bad-700',
    brand: 'bg-brand-50 text-brand-700',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  )
}
