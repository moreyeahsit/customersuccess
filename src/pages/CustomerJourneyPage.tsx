import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Pill } from '@/components/ui/HealthBadge'
import { CUSTOMERS } from '@/data/customers'
import { formatDate } from '@/lib/format'
import type { Customer, JourneyStage } from '@/types/customer'

const STAGES: JourneyStage[] = [
  'Sales Won',
  'Kickoff',
  'Discovery',
  'Implementation',
  'Go Live',
  'Training',
  'Support',
  'Optimization',
  'Renewal',
  'Expansion',
]

function currentStageOf(customer: Customer): JourneyStage {
  const current = customer.journey.find((e) => e.status === 'current')
  if (current) return current.stage
  const completed = customer.journey.filter((e) => e.status === 'complete')
  if (completed.length > 0) return completed[completed.length - 1].stage
  // No journey rows for this customer yet (e.g. added to Excel without a Journey entry) — default to the earliest stage.
  return customer.journey[0]?.stage ?? STAGES[0]
}

export function CustomerJourneyPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(CUSTOMERS[0].id)
  const customer = CUSTOMERS.find((c) => c.id === selectedId) ?? CUSTOMERS[0]

  const stageCounts = STAGES.map((stage) => ({
    stage,
    count: CUSTOMERS.filter((c) => currentStageOf(c) === stage).length,
  }))

  return (
    <div>
      <PageHeader
        title="Customer Journey"
        subtitle="Lifecycle stage progression, per customer and across the portfolio"
        action={
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            {CUSTOMERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={`${customer.name} — Journey`} subtitle="Lifecycle stage progression" />
          <div className="flex flex-col gap-0">
            {customer.journey.map((event, i) => (
              <div key={event.stage} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      event.status === 'complete'
                        ? 'bg-good-500 text-white'
                        : event.status === 'current'
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < customer.journey.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 ${event.status === 'complete' ? 'bg-good-300' : 'bg-slate-200'}`}
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{event.stage}</span>
                    {event.status === 'current' && <Pill tone="brand">Current</Pill>}
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(event.date)}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="mt-2 text-xs font-medium text-brand-600 hover:underline"
          >
            View full 360° profile →
          </button>
        </Card>

        <Card>
          <CardHeader title="Portfolio Distribution" subtitle={`Current stage across ${CUSTOMERS.length} customers`} />
          <div className="space-y-3">
            {stageCounts.map(({ stage, count }) => (
              <div key={stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{stage}</span>
                  <span className="font-medium text-slate-700">
                    {count} customer{count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${CUSTOMERS.length ? (count / CUSTOMERS.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
