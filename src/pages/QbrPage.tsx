import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { Pill } from '@/components/ui/HealthBadge'
import { CUSTOMERS } from '@/data/customers'
import { customersWithoutQbrThisQuarter } from '@/lib/analytics'
import { formatDate } from '@/lib/format'

const QUARTER = '2026-Q3'

const STATUS_TONE: Record<string, 'good' | 'brand' | 'bad' | 'neutral'> = {
  Completed: 'good',
  Scheduled: 'brand',
  Overdue: 'bad',
  'Not Scheduled': 'neutral',
}

function truncate(text: string | undefined, max = 60): string {
  if (!text) return '—'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function QbrPage() {
  const navigate = useNavigate()
  const needsScheduling = customersWithoutQbrThisQuarter()

  const rows = CUSTOMERS.map((c) => ({
    customer: c,
    record: c.qbrs.find((q) => q.quarter === QUARTER),
  }))

  const statuses = rows.map((r) => r.record?.status ?? 'Not Scheduled')
  const completed = statuses.filter((s) => s === 'Completed').length
  const scheduled = statuses.filter((s) => s === 'Scheduled').length
  const overdue = statuses.filter((s) => s === 'Overdue').length
  const notScheduled = statuses.filter((s) => s === 'Not Scheduled').length
  const completionRate = rows.length ? Math.round((completed / rows.length) * 100) : 0

  return (
    <div>
      <PageHeader
        title="QBR Center"
        subtitle={`${QUARTER} completion rate: ${completionRate}% (${completed} of ${rows.length} completed)`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label="Completed" value={String(completed)} icon={Calendar} sub={QUARTER} />
        <StatTile label="Scheduled" value={String(scheduled)} icon={Calendar} />
        <StatTile label="Not Scheduled" value={String(notScheduled)} icon={AlertTriangle} />
        <StatTile label="Overdue" value={String(overdue)} icon={AlertTriangle} />
        <StatTile label="Completion Rate" value={`${completionRate}%`} icon={Calendar} />
      </div>

      {needsScheduling.length > 0 && (
        <Card className="mb-6">
          <CardHeader
            title="Needs QBR Scheduled"
            subtitle={`${needsScheduling.length} customers without a confirmed ${QUARTER} QBR`}
          />
          <div className="space-y-2">
            {needsScheduling.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
                <button
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="text-left text-sm font-medium text-slate-700 hover:underline"
                >
                  {c.name}
                </button>
                <Pill tone="warn">No QBR scheduled</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="All Customer QBRs" subtitle={QUARTER} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Customer</th>
                <th className="py-2">Quarter</th>
                <th className="py-2">Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Attendees</th>
                <th className="py-2">Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ customer, record }) => (
                <tr key={customer.id} className="border-t border-slate-100">
                  <td className="py-2.5 pr-2">
                    <button
                      onClick={() => navigate(`/customers/${customer.id}`)}
                      className="font-medium text-slate-700 hover:underline"
                    >
                      {customer.name}
                    </button>
                  </td>
                  <td className="py-2.5 text-slate-600">{record?.quarter ?? QUARTER}</td>
                  <td className="py-2.5 text-slate-600">{record ? formatDate(record.date) : '—'}</td>
                  <td className="py-2.5">
                    <Pill tone={STATUS_TONE[record?.status ?? 'Not Scheduled']}>{record?.status ?? 'Not Scheduled'}</Pill>
                  </td>
                  <td className="py-2.5 text-slate-600">{record?.attendees.length ? record.attendees.join(', ') : '—'}</td>
                  <td className="py-2.5 text-slate-600">{truncate(record?.summary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
