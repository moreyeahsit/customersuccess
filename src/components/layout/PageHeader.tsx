import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  breadcrumb?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {breadcrumb && <div className="mb-1 text-xs text-slate-400">{breadcrumb}</div>}
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
