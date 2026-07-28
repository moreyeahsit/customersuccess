import { useNavigate } from 'react-router-dom'
import { AlertTriangle, HeartPulse, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { HealthBadge, Pill } from '@/components/ui/HealthBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { CUSTOMERS } from '@/data/customers'
import { getHealthStatus } from '@/lib/derive'
import { avgHealthScore, avgNps } from '@/lib/analytics'
import type { Customer } from '@/types/customer'

export function HealthCenterPage() {
  const navigate = useNavigate()

  const healthy = CUSTOMERS.filter((c) => getHealthStatus(c.healthScore) === 'healthy').sort((a, b) => b.healthScore - a.healthScore)
  const attention = CUSTOMERS.filter((c) => getHealthStatus(c.healthScore) === 'attention').sort((a, b) => a.healthScore - b.healthScore)
  const critical = CUSTOMERS.filter((c) => getHealthStatus(c.healthScore) === 'critical').sort((a, b) => a.healthScore - b.healthScore)

  const indicatorMap = new Map<string, number[]>()
  CUSTOMERS.forEach((c) =>
    c.healthIndicators.forEach((h) => {
      const scores = indicatorMap.get(h.label) ?? []
      scores.push(h.score)
      indicatorMap.set(h.label, scores)
    }),
  )
  const indicatorAverages = Array.from(indicatorMap.entries()).map(([label, scores]) => ({
    label,
    avg: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
  }))

  return (
    <div>
      <PageHeader
        title="Health Center"
        subtitle={`Portfolio-wide health monitoring across ${CUSTOMERS.length} customers · ${critical.length} need immediate attention`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatTile label="Avg Health Score" value={String(avgHealthScore())} icon={HeartPulse} />
        <StatTile label="Healthy" value={String(healthy.length)} icon={TrendingUp} sub="score ≥ 75" />
        <StatTile label="Needs Attention" value={String(attention.length)} icon={AlertTriangle} sub="score 50-74" />
        <StatTile label="Critical" value={String(critical.length)} icon={AlertTriangle} sub="score < 50" />
        <StatTile label="Avg NPS" value={avgNps().toFixed(1)} icon={Users} />
      </div>

      {critical.length > 0 && (
        <Card className="mb-6 border-bad-500/30 bg-bad-50">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-bad-700" />
            <h3 className="text-sm font-semibold text-bad-700">Critical — CSM Intervention Needed</h3>
          </div>
          <div className="space-y-2">
            {critical.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/customers/${c.id}`)}
                className="flex w-full items-center justify-between rounded-lg bg-white/70 px-3 py-2.5 text-left hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bad-500/10 text-sm font-semibold text-bad-700">
                    {c.logoInitial}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      {c.industry} · NPS {c.nps}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-bad-700">{c.healthScore}</span>
                  <HealthBadge score={c.healthScore} />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader title="Portfolio Health Indicators" subtitle="Average score across all customers, by dimension" />
        <div className="space-y-3">
          {indicatorAverages.map((i) => (
            <ProgressBar key={i.label} label={i.label} value={i.avg} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <HealthColumn title="Healthy" tone="good" customers={healthy} onSelect={(id) => navigate(`/customers/${id}`)} />
        <HealthColumn title="Needs Attention" tone="warn" customers={attention} onSelect={(id) => navigate(`/customers/${id}`)} />
        <HealthColumn title="Critical" tone="bad" customers={critical} onSelect={(id) => navigate(`/customers/${id}`)} />
      </div>
    </div>
  )
}

function HealthColumn({
  title,
  tone,
  customers,
  onSelect,
}: {
  title: string
  tone: 'good' | 'warn' | 'bad'
  customers: Customer[]
  onSelect: (id: string) => void
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={`${customers.length} customer${customers.length === 1 ? '' : 's'}`} />
      <div className="space-y-2">
        {customers.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-slate-50"
          >
            <div>
              <div className="text-sm font-medium text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-500">
                {c.industry} · NPS {c.nps}
              </div>
            </div>
            <Pill tone={tone}>{c.healthScore}</Pill>
          </button>
        ))}
        {customers.length === 0 && <p className="text-sm text-slate-400">No customers in this segment.</p>}
      </div>
    </Card>
  )
}
