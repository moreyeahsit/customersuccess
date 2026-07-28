import { useMemo } from 'react'
import { FileText, FileSpreadsheet, Presentation, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CUSTOMERS } from '@/data/customers'
import { formatINR } from '@/lib/format'
import { latestFinancials, sumFinancials } from '@/lib/derive'
import { totalArr, avgHealthScore, avgNps, referenceCustomers } from '@/lib/analytics'

const REPORT_LIBRARY = [
  { name: 'Quarterly Business Review Summary', description: 'Health, readiness, and financial snapshot per account for QBR prep.' },
  { name: 'Customer Health Trend Report', description: 'Health score movement across the portfolio over the last four quarters.' },
  { name: 'Renewal Pipeline Report', description: 'Upcoming renewals with contract value and risk flags.' },
  { name: 'Profitability by Account Report', description: 'Margin ranking and cost breakdown for every customer.' },
]

export function ReportsPage() {
  const industryData = useMemo(() => {
    const byIndustry = new Map<string, number>()
    for (const c of CUSTOMERS) {
      byIndustry.set(c.industry, (byIndustry.get(c.industry) ?? 0) + c.contractValue)
    }
    return [...byIndustry.entries()]
      .map(([industry, value]) => ({ industry, value }))
      .sort((a, b) => b.value - a.value)
  }, [])
  const maxIndustryValue = Math.max(...industryData.map((d) => d.value), 1)

  const marginData = useMemo(() => {
    return CUSTOMERS
      .map((c) => ({ name: c.name.length > 14 ? `${c.name.slice(0, 13)}…` : c.name, marginPct: sumFinancials(latestFinancials(c)).marginPct }))
      .sort((a, b) => b.marginPct - a.marginPct)
  }, [])

  const grrProxy = Math.round((CUSTOMERS.filter((c) => c.healthScore >= 50).length / CUSTOMERS.length) * 100)
  const refs = referenceCustomers()

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Portfolio analytics & exports"
        action={
          <>
            <button
              title="Export coming soon"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              <FileText className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button
              title="Export coming soon"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
            </button>
            <button
              title="Export coming soon"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
            >
              <Presentation className="h-3.5 w-3.5" /> Export PowerPoint
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label="Total ARR" value={formatINR(totalArr())} icon={BarChart3} sub="across portfolio" />
        <StatTile label="Avg Health Score" value={String(avgHealthScore())} sub="/ 100" />
        <StatTile label="Avg NPS" value={avgNps().toFixed(1)} sub="/ 10" />
        <StatTile label="Retention Proxy" value={`${grrProxy}%`} sub="illustrative, see caption" />
        <StatTile label="Reference Customers" value={String(refs.length)} sub="testimonial-ready" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Revenue by Industry" subtitle="Contract value summed per industry" />
          <div className="space-y-3">
            {industryData.map((d) => (
              <ProgressBar
                key={d.industry}
                label={`${d.industry} · ${formatINR(d.value)}`}
                value={(d.value / maxIndustryValue) * 100}
                showValue={false}
                colorClass="bg-brand-500"
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Margin Distribution" subtitle="Net margin % by account, sorted descending" />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginData} margin={{ bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                <Bar dataKey="marginPct" name="Net Margin" radius={[4, 4, 0, 0]}>
                  {marginData.map((d) => (
                    <Cell key={d.name} fill={d.marginPct < 0 ? '#e0483e' : '#5b5fe8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <p className="mb-6 -mt-2 text-xs text-slate-400">
        Retention Proxy is an illustrative metric computed from this prototype's mock data (share of customers with a health score of 50 or
        above) — it is not a true Gross Revenue Retention calculation.
      </p>

      <Card>
        <CardHeader title="Report Library" subtitle="Pre-built report templates from the portfolio PRD" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {REPORT_LIBRARY.map((r) => (
            <div key={r.name} className="flex flex-col justify-between rounded-xl border border-slate-100 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-800">{r.name}</div>
                <p className="mt-1 text-xs text-slate-500">{r.description}</p>
              </div>
              <button
                disabled
                title="Report generation coming soon"
                className="mt-4 w-fit cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                Generate
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
