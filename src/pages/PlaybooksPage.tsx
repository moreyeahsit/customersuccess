import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Route } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Pill } from '@/components/ui/HealthBadge'
import { PLAYBOOKS } from '@/data/playbooks'
import { CUSTOMERS } from '@/data/customers'
import { getReadinessLevel } from '@/lib/derive'
import { READINESS_LEVELS } from '@/types/customer'
import type { ReadinessLevel } from '@/types/customer'

export function PlaybooksPage() {
  const navigate = useNavigate()

  const customersByLevel = useMemo(() => {
    const groups: Record<ReadinessLevel, typeof CUSTOMERS> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
    CUSTOMERS.forEach((c) => {
      groups[getReadinessLevel(c.readinessScore)].push(c)
    })
    return groups
  }, [])

  return (
    <div>
      <PageHeader
        title="Playbooks"
        subtitle="Auto-assigned by the Customer Readiness Engine based on each account's lifecycle level — no manual task creation required"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PLAYBOOKS.map((playbook) => (
          <Card key={playbook.level}>
            <CardHeader
              title={`Level ${playbook.level} · ${playbook.name}`}
              subtitle={`Readiness score ${READINESS_LEVELS[playbook.level].range}`}
              action={<Route className="h-4 w-4 text-brand-500" />}
            />
            <ul className="space-y-2">
              {playbook.tasks.map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {t}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          title="Customers by Playbook Level"
          subtitle="Which accounts are currently assigned to each playbook"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLAYBOOKS.map((playbook) => {
            const customers = customersByLevel[playbook.level]
            return (
              <div key={playbook.level} className="rounded-xl border border-slate-100 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Level {playbook.level} · {playbook.name}
                  </span>
                  <Pill tone="brand">{customers.length}</Pill>
                </div>
                <div className="space-y-1">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/customers/${c.id}`)}
                      className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-600"
                    >
                      {c.name}
                    </button>
                  ))}
                  {customers.length === 0 && <p className="px-2 py-1.5 text-xs text-slate-400">No customers at this level.</p>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
