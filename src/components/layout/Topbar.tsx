import { useState } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { ROLES } from '@/types/rbac'
import { cn } from '@/lib/cn'
import { DataSyncBadge } from './DataSyncBadge'

export function Topbar() {
  const { role, setRole } = useRole()
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search customers, tasks…"
            className="w-56 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <DataSyncBadge />

        <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-bad-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-2.5 text-sm hover:bg-slate-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
              SK
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-xs font-medium text-slate-700">Shifan Khan</div>
              <div className="text-[10px] text-slate-400">{role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  View as (RBAC demo)
                </div>
                {ROLES.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setRole(r.role)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full flex-col items-start rounded-lg px-2 py-2 text-left hover:bg-slate-50',
                      role === r.role && 'bg-brand-50',
                    )}
                  >
                    <span className={cn('text-sm font-medium', role === r.role ? 'text-brand-700' : 'text-slate-700')}>
                      {r.role}
                    </span>
                    <span className="text-[11px] text-slate-500">{r.scope}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
