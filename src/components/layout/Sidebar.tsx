import { NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'
import { cn } from '@/lib/cn'

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-navy-950 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Vantage</div>
          <div className="text-[11px] text-slate-500">Success Operating System</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-brand-500/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-[11px] text-slate-500">
        Vantage Platform · v1.0 PRD
      </div>
    </aside>
  )
}
