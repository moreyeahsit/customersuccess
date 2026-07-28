import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { HealthBadge } from '@/components/ui/HealthBadge'
import { Pill } from '@/components/ui/HealthBadge'
import { CUSTOMERS } from '@/data/customers'
import { formatINR, formatDate } from '@/lib/format'
import { getReadinessLevel } from '@/lib/derive'
import { READINESS_LEVELS } from '@/types/customer'

type SortKey = 'name' | 'healthScore' | 'readinessScore' | 'contractValue' | 'renewalDate'

const PLAN_OPTIONS = ['All Plans', 'Starter', 'Growth', 'Enterprise'] as const
const HEALTH_OPTIONS = ['All Health', 'Healthy', 'Needs Attention', 'Critical'] as const

export function CustomersPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [plan, setPlan] = useState<(typeof PLAN_OPTIONS)[number]>('All Plans')
  const [health, setHealth] = useState<(typeof HEALTH_OPTIONS)[number]>('All Health')
  const [sortKey, setSortKey] = useState<SortKey>('healthScore')
  const [sortAsc, setSortAsc] = useState(false)

  const filtered = useMemo(() => {
    let list = CUSTOMERS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.industry.toLowerCase().includes(query.toLowerCase()))
    if (plan !== 'All Plans') list = list.filter((c) => c.plan === plan)
    if (health !== 'All Health') {
      const target = health === 'Needs Attention' ? 'attention' : health.toLowerCase()
      list = list.filter((c) => {
        const status = c.healthScore >= 75 ? 'healthy' : c.healthScore >= 50 ? 'attention' : 'critical'
        return status === target
      })
    }
    list = [...list].sort((a, b) => {
      const dir = sortAsc ? 1 : -1
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir
      if (sortKey === 'renewalDate') return (new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()) * dir
      return ((a[sortKey] as number) - (b[sortKey] as number)) * dir
    })
    return list
  }, [query, plan, health, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const columns: { key: SortKey | 'readiness' | 'plan'; label: string }[] = [
    { key: 'name', label: 'Customer' },
    { key: 'plan', label: 'Plan' },
    { key: 'healthScore', label: 'Health' },
    { key: 'readiness', label: 'Readiness' },
    { key: 'contractValue', label: 'ARR' },
    { key: 'renewalDate', label: 'Renewal' },
  ]

  return (
    <div>
      <PageHeader title="Customer Directory" subtitle={`${filtered.length} of ${CUSTOMERS.length} customers`} />

      <Card className="mb-4" padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or industry…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <select value={plan} onChange={(e) => setPlan(e.target.value as typeof plan)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            {PLAN_OPTIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select value={health} onChange={(e) => setHealth(e.target.value as typeof health)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            {HEALTH_OPTIONS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium hover:text-slate-600"
                    onClick={() => col.key !== 'readiness' && col.key !== 'plan' && toggleSort(col.key as SortKey)}
                  >
                    {col.label}
                    {sortKey === col.key && (sortAsc ? ' ▲' : ' ▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const level = getReadinessLevel(c.readinessScore)
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                          {c.logoInitial}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.industry} · {c.geography}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Pill tone="neutral">{c.plan}</Pill>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{c.healthScore}</span>
                        <HealthBadge score={c.healthScore} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{c.readinessScore}%</span>
                      <span className="ml-1.5 text-xs text-slate-500">L{level} {READINESS_LEVELS[level].name}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{formatINR(c.contractValue)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(c.renewalDate)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-400">No customers match these filters.</p>}
        </div>
      </Card>
    </div>
  )
}
