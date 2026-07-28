import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, DollarSign, HeartPulse, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { HealthBadge, Pill } from '@/components/ui/HealthBadge'
import { CUSTOMERS } from '@/data/customers'
import { formatINR, formatDate } from '@/lib/format'
import { daysUntil } from '@/lib/derive'
import { upcomingRenewals, totalArr } from '@/lib/analytics'

function riskTone(score: number): { tone: 'bad' | 'warn' | 'good'; label: string } {
  if (score < 50) return { tone: 'bad', label: 'High Risk' }
  if (score < 75) return { tone: 'warn', label: 'Medium Risk' }
  return { tone: 'good', label: 'Low Risk' }
}

export function RenewalsPage() {
  const navigate = useNavigate()

  const renewals120 = useMemo(() => upcomingRenewals(120), [])
  const renewals90 = useMemo(() => upcomingRenewals(90), [])
  const renewals30 = useMemo(() => upcomingRenewals(30), [])
  const arr120 = useMemo(() => totalArr(renewals120), [renewals120])

  // At-risk renewals: health below 75 and renewing within 90 days — these need urgent attention.
  const atRiskRenewals = useMemo(
    () => renewals90.filter((c) => c.healthScore < 75),
    [renewals90],
  )
  const avgAtRiskHealth = useMemo(() => {
    if (atRiskRenewals.length === 0) return 0
    return Math.round(atRiskRenewals.reduce((sum, c) => sum + c.healthScore, 0) / atRiskRenewals.length)
  }, [atRiskRenewals])

  const sortedCustomers = useMemo(
    () => [...CUSTOMERS].sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate)),
    [],
  )

  return (
    <div>
      <PageHeader
        title="Renewals"
        subtitle={`${renewals120.length} renewals in the next 120 days · ${formatINR(arr120)} combined ARR`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label="Renewals (30d)" value={String(renewals30.length)} icon={RefreshCw} sub="upcoming" />
        <StatTile label="Renewals (90d)" value={String(renewals90.length)} icon={RefreshCw} sub="upcoming" />
        <StatTile label="Renewals (120d)" value={String(renewals120.length)} icon={RefreshCw} sub="upcoming" />
        <StatTile label="ARR Up for Renewal" value={formatINR(arr120)} icon={DollarSign} sub="next 120 days" />
        <StatTile
          label="Avg Health (At Risk)"
          value={atRiskRenewals.length > 0 ? String(avgAtRiskHealth) : '—'}
          icon={HeartPulse}
          sub={`${atRiskRenewals.length} at-risk renewals`}
        />
      </div>

      {atRiskRenewals.length > 0 && (
        <Card className="mb-6 border-bad-100 bg-bad-50/50">
          <CardHeader
            title="At-Risk Renewals"
            subtitle="Health below 75 and renewing within 90 days — needs urgent attention"
            action={<AlertTriangle className="h-4 w-4 text-bad-600" />}
          />
          <div className="space-y-2">
            {atRiskRenewals.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2.5 text-left hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    Renews {formatDate(c.renewalDate)} · in {daysUntil(c.renewalDate)}d
                  </div>
                </div>
                <HealthBadge score={c.healthScore} />
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Renewal Pipeline" subtitle="Sorted by soonest renewal date" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2">Customer</th>
                <th className="py-2 pr-2">Plan</th>
                <th className="py-2 pr-2">ARR</th>
                <th className="py-2 pr-2">Renewal Date</th>
                <th className="py-2 pr-2">Days Until Renewal</th>
                <th className="py-2 pr-2">Health</th>
                <th className="py-2 pr-2">Renewal Risk</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((c) => {
                const days = daysUntil(c.renewalDate)
                const risk = riskTone(c.healthScore)
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                    onClick={() => navigate(`/customers/${c.id}`)}
                  >
                    <td className="py-2.5 pr-2 font-medium text-slate-700">{c.name}</td>
                    <td className="py-2.5 pr-2">
                      <Pill tone="brand">{c.plan}</Pill>
                    </td>
                    <td className="py-2.5 pr-2 text-slate-600">{formatINR(c.contractValue)}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{formatDate(c.renewalDate)}</td>
                    <td className="py-2.5 pr-2 text-slate-600">{days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</td>
                    <td className="py-2.5 pr-2">
                      <HealthBadge score={c.healthScore} />
                    </td>
                    <td className="py-2.5 pr-2">
                      <Pill tone={risk.tone}>{risk.label}</Pill>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
