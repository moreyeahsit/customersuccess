import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CUSTOMERS } from '@/data/customers'
import { formatINR } from '@/lib/format'
import { sumFinancials } from '@/lib/derive'
import { useRole } from '@/context/RoleContext'

type Metric = 'revenue' | 'cost' | 'grossMargin' | 'netMargin' | 'marginPct'

const METRICS: { key: Metric; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'cost', label: 'Cost' },
  { key: 'grossMargin', label: 'Gross Margin' },
  { key: 'netMargin', label: 'Net Margin' },
  { key: 'marginPct', label: 'Net Margin %' },
]

export function FinancialPivotPage() {
  const navigate = useNavigate()
  const { permissions } = useRole()
  const [metric, setMetric] = useState<Metric>('revenue')
  const isPercent = metric === 'marginPct'

  const periods = useMemo(() => {
    const set = new Set<string>()
    CUSTOMERS.forEach((c) => c.financials.forEach((f) => set.add(f.period)))
    return [...set].sort()
  }, [])

  // present[i] is true when a given customer/period cell has real data (vs. a zero-filled gap) —
  // used so % metrics average only over real data instead of being dragged down by gaps.
  const rows = useMemo(() => {
    return CUSTOMERS.map((c) => {
      const byPeriod = new Map(c.financials.map((f) => [f.period, sumFinancials(f)]))
      const values = periods.map((p) => byPeriod.get(p)?.[metric] ?? 0)
      const present = periods.map((p) => byPeriod.has(p))
      const presentValues = values.filter((_, i) => present[i])
      const total = isPercent
        ? presentValues.reduce((a, b) => a + b, 0) / Math.max(1, presentValues.length)
        : values.reduce((a, b) => a + b, 0)
      return { customer: c, values, present, total }
    }).sort((a, b) => b.total - a.total)
  }, [periods, metric, isPercent])

  const columnTotals = periods.map((_, i) => {
    const colValues = rows.map((r) => r.values[i])
    const colPresentValues = rows.filter((r) => r.present[i]).map((r) => r.values[i])
    return isPercent
      ? colPresentValues.reduce((a, b) => a + b, 0) / Math.max(1, colPresentValues.length)
      : colValues.reduce((a, b) => a + b, 0)
  })
  const grandTotal = isPercent
    ? columnTotals.reduce((a, b) => a + b, 0) / Math.max(1, columnTotals.length)
    : columnTotals.reduce((a, b) => a + b, 0)

  const formatCell = (v: number) => (isPercent ? `${v.toFixed(1)}%` : formatINR(v))

  if (!permissions.canViewFinancials) {
    return (
      <div>
        <PageHeader title="Financial Pivot Report" subtitle="Every customer's financials, pivoted by quarter" />
        <Card>
          <p className="text-sm text-slate-500">
            Financial data is restricted for your current role. Switch to CEO, Finance, or Customer Success Director
            from the role menu (top right) to view this report.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Financial Pivot Report"
        subtitle="Every customer's financials, pivoted by quarter — switch the metric to compare revenue, cost, or margin"
        action={
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as Metric)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600"
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        }
      />

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="sticky left-0 z-10 bg-white px-4 py-3">Customer</th>
                {periods.map((p) => (
                  <th key={p} className="whitespace-nowrap px-4 py-3 text-right">
                    {p}
                  </th>
                ))}
                <th className="whitespace-nowrap px-4 py-3 text-right">{isPercent ? 'Average' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ customer, values, total }) => (
                <tr
                  key={customer.id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-slate-700">{customer.name}</td>
                  {values.map((v, i) => (
                    <td key={periods[i]} className={`px-4 py-2.5 text-right ${v < 0 ? 'text-bad-700' : 'text-slate-600'}`}>
                      {formatCell(v)}
                    </td>
                  ))}
                  <td className={`px-4 py-2.5 text-right font-semibold ${total < 0 ? 'text-bad-700' : 'text-slate-800'}`}>
                    {formatCell(total)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={periods.length + 2} className="py-6 text-center text-slate-400">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-slate-700">All Customers</td>
                {columnTotals.map((v, i) => (
                  <td key={periods[i]} className={`px-4 py-3 text-right ${v < 0 ? 'text-bad-700' : 'text-slate-800'}`}>
                    {formatCell(v)}
                  </td>
                ))}
                <td className={`px-4 py-3 text-right ${grandTotal < 0 ? 'text-bad-700' : 'text-slate-800'}`}>
                  {formatCell(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}
