import { cn } from '@/lib/cn'

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            '-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
            active === tab
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
