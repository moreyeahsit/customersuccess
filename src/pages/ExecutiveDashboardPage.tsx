import { useNavigate } from 'react-router-dom'
import { Users, AlertTriangle, RefreshCw, TrendingUp, Star, Sparkles } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatTile } from '@/components/ui/StatTile'
import { HealthBadge } from '@/components/ui/HealthBadge'
import { Pill } from '@/components/ui/HealthBadge'
import { CUSTOMERS } from '@/data/customers'
import { formatINR, formatDate } from '@/lib/format'
import { daysUntil } from '@/lib/derive'
import {
  totalArr,
  avgHealthScore,
  avgNps,
  customersAtRisk,
  marginRanked,
  upcomingRenewals,
  expansionOpportunities,
  customersWithoutQbrThisQuarter,
  referenceCustomers,
} from '@/lib/analytics'

export function ExecutiveDashboardPage() {
  const navigate = useNavigate()
  const atRisk = customersAtRisk().slice(0, 6)
  const margins = marginRanked()
  const topMargin = margins.slice(0, 5)
  const bottomMargin = [...margins].reverse().slice(0, 5)
  const renewals = upcomingRenewals(120)
  const expansion = expansionOpportunities().slice(0, 6)
  const noQbr = customersWithoutQbrThisQuarter()
  const refs = referenceCustomers()

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Portfolio-wide view across retention, expansion, and profitability"
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total Customers" value={String(CUSTOMERS.length)} icon={Users} sub="active accounts" />
        <StatTile
          label="Customers at Risk"
          value={String(atRisk.length)}
          delta={-12}
          deltaGoodDirection="down"
          icon={AlertTriangle}
          sub="health below 75"
        />
        <StatTile label="Renewals (90d)" value={String(renewals.length)} icon={RefreshCw} sub="upcoming" />
        <StatTile label="Total ARR" value={formatINR(totalArr())} delta={14} icon={TrendingUp} sub="vs last quarter" />
        <StatTile label="Avg Health Score" value={String(avgHealthScore())} delta={4} icon={TrendingUp} />
        <StatTile label="Avg NPS" value={avgNps().toFixed(1)} delta={6} icon={TrendingUp} />
        <StatTile label="Reference Customers" value={String(refs.length)} icon={Star} sub="testimonial-ready" />
        <StatTile
          label="Expansion Opportunities"
          value={String(expansion.filter((e) => e.score >= 70).length)}
          icon={Sparkles}
          sub="high propensity"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Customers at Risk" subtitle="Sorted by lowest health score" />
          <div className="space-y-2">
            {atRisk.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                    {c.logoInitial}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.industry}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{c.healthScore}</span>
                  <HealthBadge score={c.healthScore} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Expansion Opportunities" subtitle="Readiness + upsell propensity" />
          <div className="space-y-2">
            {expansion.map(({ customer, score }) => (
              <button
                key={customer.id}
                onClick={() => navigate(`/customers/${customer.id}`)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                    {customer.logoInitial}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{customer.name}</div>
                    <div className="text-xs text-slate-500">
                      Upsell {formatINR(customer.ltv.upsellOpportunity)} · Cross-sell {formatINR(customer.ltv.crossSellOpportunity)}
                    </div>
                  </div>
                </div>
                <Pill tone={score >= 75 ? 'good' : 'brand'}>{score}% propensity</Pill>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Highest Margin Customers" />
          <table className="w-full text-sm">
            <tbody>
              {topMargin.map(({ customer, marginPct }) => (
                <tr key={customer.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => navigate(`/customers/${customer.id}`)}>
                  <td className="py-2 pl-1 font-medium text-slate-700">{customer.name}</td>
                  <td className="py-2 text-right pr-1 font-semibold text-good-700">{marginPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Lowest Margin Customers" subtitle="Candidates for profitability review" />
          <table className="w-full text-sm">
            <tbody>
              {bottomMargin.map(({ customer, marginPct }) => (
                <tr key={customer.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => navigate(`/customers/${customer.id}`)}>
                  <td className="py-2 pl-1 font-medium text-slate-700">{customer.name}</td>
                  <td className={`py-2 pr-1 text-right font-semibold ${marginPct < 0 ? 'text-bad-700' : 'text-warn-700'}`}>
                    {marginPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming Renewals" subtitle="Next 120 days" />
          <div className="space-y-2">
            {renewals.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
                <button onClick={() => navigate(`/customers/${c.id}`)} className="text-left text-sm font-medium text-slate-700 hover:underline">
                  {c.name}
                </button>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{formatDate(c.renewalDate)}</div>
                  <div className="text-xs font-medium text-brand-700">in {daysUntil(c.renewalDate)}d</div>
                </div>
              </div>
            ))}
            {renewals.length === 0 && <p className="text-sm text-slate-400">No renewals in this window.</p>}
          </div>
        </Card>

        <Card>
          <CardHeader title="Customers Without a QBR This Quarter" subtitle="Executive meeting coverage gap" />
          <div className="space-y-2">
            {noQbr.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
                <button onClick={() => navigate(`/customers/${c.id}`)} className="text-left text-sm font-medium text-slate-700 hover:underline">
                  {c.name}
                </button>
                <Pill tone="warn">No QBR scheduled</Pill>
              </div>
            ))}
            {noQbr.length === 0 && <p className="text-sm text-slate-400">All customers have a QBR scheduled.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}
