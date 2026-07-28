import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronRight,
  Calendar,
  Users as UsersIcon,
  Sparkles,
  Video,
  Star,
  Mail,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { HealthBadge, Pill } from '@/components/ui/HealthBadge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getCustomer, tasksForCustomer, testimonialsForCustomer } from '@/data/customers'
import { formatINR, formatDate, formatDateShort } from '@/lib/format'
import { getReadinessLevel, getHealthStatus, sumFinancials, latestFinancials, daysUntil } from '@/lib/derive'
import { READINESS_LEVELS, type ReadinessLevel } from '@/types/customer'
import { playbookForLevel } from '@/data/playbooks'
import { useRole } from '@/context/RoleContext'

const TABS = [
  '360° Overview',
  'Health & Readiness',
  'Financials',
  'Customer LTV',
  'Journey',
  'Tasks & Playbook',
  'Relationships',
  'Expansion',
  'QBR',
] as const

export function Customer360Page() {
  const { id } = useParams()
  const navigate = useNavigate()
  const customer = id ? getCustomer(id) : undefined
  const [tab, setTab] = useState<(typeof TABS)[number]>('360° Overview')
  const { permissions } = useRole()

  if (!customer) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Customer not found.</p>
        <button onClick={() => navigate('/customers')} className="mt-3 text-sm font-medium text-brand-600 hover:underline">
          Back to Customer Directory
        </button>
      </Card>
    )
  }

  const level = getReadinessLevel(customer.readinessScore)
  const latest = latestFinancials(customer)
  const fin = sumFinancials(latest)
  const tasks = tasksForCustomer(customer.id)
  const testimonials = testimonialsForCustomer(customer.id)

  return (
    <div>
      <PageHeader
        breadcrumb={
          <button onClick={() => navigate('/customers')} className="inline-flex items-center gap-1 hover:text-slate-600">
            Customers <ChevronRight className="h-3 w-3" /> {customer.name}
          </button>
        }
        title={customer.name}
        subtitle={`${customer.industry} · ${customer.geography} · Customer since ${formatDate(customer.customerSince)}`}
        action={
          <>
            <HealthBadge score={customer.healthScore} />
            <Pill tone="brand">{customer.plan}</Pill>
            {customer.hasReferenceAgreement && <Pill tone="good">Reference Customer</Pill>}
          </>
        }
      />

      <Tabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as (typeof TABS)[number])} />

      <div className="pt-5">
        {tab === '360° Overview' && <OverviewTab customer={customer} fin={fin} level={level} tasks={tasks} showFinancials={permissions.canViewFinancials} />}
        {tab === 'Health & Readiness' && <HealthReadinessTab customer={customer} level={level} />}
        {tab === 'Financials' && (permissions.canViewFinancials ? <FinancialsTab customer={customer} /> : <RestrictedNotice />)}
        {tab === 'Customer LTV' && (permissions.canViewFinancials ? <LtvTab customer={customer} /> : <RestrictedNotice />)}
        {tab === 'Journey' && <JourneyTab customer={customer} />}
        {tab === 'Tasks & Playbook' && <TasksPlaybookTab tasks={tasks} level={level} />}
        {tab === 'Relationships' && <RelationshipsTab customer={customer} testimonials={testimonials} />}
        {tab === 'Expansion' && <ExpansionTab customer={customer} />}
        {tab === 'QBR' && <QbrTab customer={customer} />}
      </div>
    </div>
  )
}

function RestrictedNotice() {
  return (
    <Card>
      <p className="text-sm text-slate-500">
        Financial data is restricted for your current role. Switch to CEO, Finance, or Customer Success Director from the
        role menu (top right) to view this tab.
      </p>
    </Card>
  )
}

function OverviewTab({
  customer,
  fin,
  level,
  tasks,
  showFinancials,
}: {
  customer: ReturnType<typeof getCustomer>
  fin: ReturnType<typeof sumFinancials>
  level: ReadinessLevel
  tasks: ReturnType<typeof tasksForCustomer>
  showFinancials: boolean
}) {
  if (!customer) return null
  const openTasks = tasks.filter((t) => t.status !== 'Done')
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader title="Account Profile" />
        <dl className="space-y-2.5 text-sm">
          {[
            ['Account Owner', customer.accountOwner],
            ['Delivery Manager', customer.deliveryManager],
            ['CSM', customer.csm],
            ['Sales Owner', customer.salesOwner],
            ['Technical SPOC', customer.technicalSpoc],
            ['Executive Sponsor', customer.executiveSponsor],
            ['Team Size', String(customer.teamSize)],
            ['Tech Stack', customer.techStack.join(', ')],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-slate-700">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-xs font-medium text-slate-500">Customer Health Score</span>
        <ProgressRing
          value={customer.healthScore}
          label={String(customer.healthScore)}
          sublabel="/ 100"
          color={{ healthy: '#12b76a', attention: '#f79009', critical: '#f04438' }[getHealthStatus(customer.healthScore)]}
        />
        <HealthBadge score={customer.healthScore} />
      </Card>

      <Card className="flex flex-col items-center justify-center gap-2 text-center">
        <span className="text-xs font-medium text-slate-500">Customer Readiness Index</span>
        <ProgressRing value={customer.readinessScore} color="#5b5fe8" />
        <Pill tone="brand">
          Level {level} · {READINESS_LEVELS[level].name}
        </Pill>
      </Card>

      {showFinancials && (
        <Card>
          <CardHeader title="Key Financials (This Quarter)" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-500">Revenue</div>
              <div className="text-lg font-bold text-slate-800">{formatINR(fin.revenue)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Cost</div>
              <div className="text-lg font-bold text-slate-800">{formatINR(fin.cost)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Net Margin</div>
              <div className="text-lg font-bold text-good-700">{formatINR(fin.netMargin)}</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Customer Lifetime Value" />
        <div className="text-center">
          <div className="text-xs text-slate-500">Predicted LTV</div>
          <div className="text-2xl font-bold text-slate-800">{formatINR(customer.ltv.predictedLtv)}</div>
          <div className="mt-1 text-xs text-slate-500">Expected lifetime {customer.ltv.expectedLifetimeYears} yrs</div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Open Items" />
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500">Active Projects</div>
            <div className="text-lg font-bold text-slate-800">{customer.activeProjects}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Open Tasks</div>
            <div className="text-lg font-bold text-slate-800">{openTasks.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">NPS Score</div>
            <div className="text-lg font-bold text-slate-800">{customer.nps}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Renewal In</div>
            <div className="text-lg font-bold text-slate-800">{daysUntil(customer.renewalDate)}d</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function HealthReadinessTab({ customer, level }: { customer: NonNullable<ReturnType<typeof getCustomer>>; level: ReadinessLevel }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Health Indicators" subtitle={`Overall score ${customer.healthScore}/100`} />
        <div className="space-y-3">
          {customer.healthIndicators.map((h) => (
            <ProgressBar key={h.label} label={h.label} value={h.score} />
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader title="Readiness Dimensions" subtitle={`Level ${level} · ${READINESS_LEVELS[level].name}`} />
        <div className="space-y-3">
          {customer.readinessDimensions.map((r) => (
            <ProgressBar key={r.label} label={r.label} value={r.score} colorClass="bg-brand-500" />
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader title="Readiness Levels" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {Object.entries(READINESS_LEVELS).map(([lvl, meta]) => (
            <div
              key={lvl}
              className={`rounded-xl border p-3 text-center ${Number(lvl) === level ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}
            >
              <div className="text-xs text-slate-400">Level {lvl}</div>
              <div className="text-sm font-semibold text-slate-700">{meta.name}</div>
              <div className="text-[11px] text-slate-400">{meta.range}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function FinancialsTab({ customer }: { customer: NonNullable<ReturnType<typeof getCustomer>> }) {
  const latest = latestFinancials(customer)
  const fin = sumFinancials(latest)
  const trend = customer.financials.map((f) => ({ period: f.period, ...sumFinancials(f) }))
  const revenueBreakdown = [
    { label: 'Recurring Revenue', value: latest.recurringRevenue },
    { label: 'Project Revenue', value: latest.projectRevenue },
    { label: 'Cloud Revenue', value: latest.cloudRevenue },
    { label: 'Support Revenue', value: latest.supportRevenue },
  ]
  const costBreakdown = [
    { label: 'Developer Cost', value: latest.developerCost },
    { label: 'Delivery Cost', value: latest.deliveryCost },
    { label: 'Support Cost', value: latest.supportCost },
    { label: 'Infrastructure Cost', value: latest.infrastructureCost },
    { label: 'Travel Cost', value: latest.travelCost },
    { label: 'Sales Cost', value: latest.salesCost },
    { label: 'Customer Success Cost', value: latest.successCost },
    { label: 'Cloud Cost', value: latest.cloudCost },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Revenue Breakdown" subtitle={latest.period} />
        <BreakdownList items={revenueBreakdown} total={fin.revenue} tone="good" />
      </Card>
      <Card>
        <CardHeader title="Cost Breakdown" subtitle={latest.period} />
        <BreakdownList items={costBreakdown} total={fin.cost} tone="bad" />
      </Card>

      <Card>
        <CardHeader title="Total Revenue" />
        <div className="text-3xl font-bold text-slate-800">{formatINR(fin.revenue)}</div>
      </Card>
      <Card>
        <CardHeader title="Total Cost" />
        <div className="text-3xl font-bold text-slate-800">{formatINR(fin.cost)}</div>
      </Card>
      <Card>
        <CardHeader title="Gross Margin" />
        <div className={`text-3xl font-bold ${fin.grossMargin >= 0 ? 'text-good-700' : 'text-bad-700'}`}>{formatINR(fin.grossMargin)}</div>
      </Card>
      <Card>
        <CardHeader title="Net Margin" />
        <div className={`text-3xl font-bold ${fin.netMargin >= 0 ? 'text-good-700' : 'text-bad-700'}`}>{formatINR(fin.netMargin)}</div>
        <div className="mt-1 text-xs text-slate-500">{fin.marginPct.toFixed(1)}% of revenue</div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Margin Trend" subtitle="Last 4 quarters" />
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b5fe8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5b5fe8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} width={70} />
              <Tooltip formatter={(v) => formatINR(Number(v))} />
              <Area type="monotone" dataKey="netMargin" name="Net Margin" stroke="#5b5fe8" fill="url(#marginGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-2 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-sm text-brand-800">
            <span className="font-semibold">AI Insight: </span>
            {fin.marginPct < 15
              ? `Net margin has compressed to ${fin.marginPct.toFixed(1)}% — support and delivery costs are outpacing revenue growth. Consider reviewing project profitability.`
              : `Margin is healthy at ${fin.marginPct.toFixed(1)}%. Delivery and support costs are well controlled relative to revenue.`}
          </p>
        </div>
      </Card>
    </div>
  )
}

function BreakdownList({ items, total, tone }: { items: { label: string; value: number }[]; total: number; tone: 'good' | 'bad' }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-slate-600">{item.label}</span>
            <span className="font-medium text-slate-700">{formatINR(item.value)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${tone === 'good' ? 'bg-good-500' : 'bg-bad-400'}`}
              style={{ width: `${total === 0 ? 0 : (item.value / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function LtvTab({ customer }: { customer: NonNullable<ReturnType<typeof getCustomer>> }) {
  const { ltv } = customer
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader title="Predicted LTV" />
        <div className="text-3xl font-bold text-slate-800">{formatINR(ltv.predictedLtv)}</div>
      </Card>
      <Card>
        <CardHeader title="Current Annual Revenue" />
        <div className="text-3xl font-bold text-slate-800">{formatINR(ltv.currentAnnualRevenue)}</div>
      </Card>
      <Card>
        <CardHeader title="Expected Renewal Revenue" />
        <div className="text-3xl font-bold text-slate-800">{formatINR(ltv.expectedRenewalRevenue)}</div>
      </Card>
      <Card>
        <CardHeader title="Cross-Sell Opportunity" />
        <div className="text-2xl font-bold text-brand-700">{formatINR(ltv.crossSellOpportunity)}</div>
      </Card>
      <Card>
        <CardHeader title="Upsell Opportunity" />
        <div className="text-2xl font-bold text-brand-700">{formatINR(ltv.upsellOpportunity)}</div>
      </Card>
      <Card>
        <CardHeader title="Expansion Probability" />
        <div className="text-2xl font-bold text-slate-800">{ltv.expansionProbability}%</div>
        <ProgressBar value={ltv.expansionProbability} showValue={false} className="mt-2" />
      </Card>
      <Card>
        <CardHeader title="Expected Lifetime" />
        <div className="text-2xl font-bold text-slate-800">{ltv.expectedLifetimeYears} yrs</div>
      </Card>
      <Card>
        <CardHeader title="Average Annual Spend" />
        <div className="text-2xl font-bold text-slate-800">{formatINR(ltv.averageAnnualSpend)}</div>
      </Card>
      <Card>
        <CardHeader title="Customer Acquisition Cost" />
        <div className="text-2xl font-bold text-slate-800">{formatINR(ltv.acquisitionCost)}</div>
        <div className="mt-1 text-xs text-slate-500">Payback {ltv.paybackMonths} months</div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader title="LTV Trend" />
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ltv.ltvTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f5" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} width={70} />
              <Tooltip formatter={(v) => formatINR(Number(v))} />
              <Bar dataKey="value" name="Predicted LTV" fill="#5b5fe8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

function JourneyTab({ customer }: { customer: NonNullable<ReturnType<typeof getCustomer>> }) {
  return (
    <Card>
      <CardHeader title="Customer Journey" subtitle="Lifecycle stage progression" />
      <div className="relative flex flex-col gap-0">
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
                <div className={`w-0.5 flex-1 ${event.status === 'complete' ? 'bg-good-300' : 'bg-slate-200'}`} style={{ minHeight: 28 }} />
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
    </Card>
  )
}

function TasksPlaybookTab({
  tasks,
  level,
}: {
  tasks: ReturnType<typeof tasksForCustomer>
  level: ReadinessLevel
}) {
  const playbook = playbookForLevel(level)
  const priorityTone: Record<string, 'bad' | 'warn' | 'neutral'> = { High: 'bad', Medium: 'warn', Low: 'neutral' }
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Tasks" subtitle={`${tasks.filter((t) => t.status !== 'Done').length} open`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2">Task</th>
                <th className="py-2">Team</th>
                <th className="py-2">Priority</th>
                <th className="py-2">Due</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="py-2.5 pr-2">
                    <div className="font-medium text-slate-700">{t.title}</div>
                    {t.source === 'AI' && t.reason && (
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-600">
                        <Sparkles className="h-3 w-3" /> {t.reason}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-600">{t.team}</td>
                  <td className="py-2.5">
                    <Pill tone={priorityTone[t.priority]}>{t.priority}</Pill>
                  </td>
                  <td className="py-2.5 text-slate-600">{formatDateShort(t.dueDate)}</td>
                  <td className="py-2.5">
                    <Pill tone={t.status === 'Done' ? 'good' : t.status === 'In Progress' ? 'brand' : 'neutral'}>{t.status}</Pill>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    No tasks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Playbook · Level ${level}`} subtitle={playbook.name} />
        <ul className="space-y-2">
          {playbook.tasks.map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

const ROLE_ICON: Record<string, string> = {
  CEO: '👑',
  CTO: '🛠️',
  Manager: '📋',
  Champion: '⭐',
  Influencer: '💬',
  'Decision Maker': '✅',
  Blocked: '⛔',
  Inactive: '💤',
}

function RelationshipsTab({
  customer,
  testimonials,
}: {
  customer: NonNullable<ReturnType<typeof getCustomer>>
  testimonials: ReturnType<typeof testimonialsForCustomer>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Relationship Map" subtitle={`${customer.contacts.length} contacts tracked`} />
        <div className="space-y-3">
          {customer.contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-base">
                  {ROLE_ICON[c.role] ?? <UsersIcon className="h-4 w-4 text-slate-500" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <Mail className="h-3 w-3" /> {c.email}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Pill tone={c.role === 'Blocked' || c.role === 'Inactive' ? 'bad' : 'brand'}>{c.role}</Pill>
                <div className="mt-1 text-[11px] text-slate-400">Strength {c.relationshipStrength}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Testimonial Center" subtitle="Advocacy assets collected" />
        {testimonials.length === 0 && (
          <div className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            No testimonials yet — NPS is {customer.nps}. Consider requesting one via the AI Copilot.
          </div>
        )}
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-lg border border-slate-100 p-3">
              <div className="mb-1 flex items-center gap-2">
                {t.type === 'Video' ? <Video className="h-3.5 w-3.5 text-brand-600" /> : <Star className="h-3.5 w-3.5 text-warn-500" />}
                <span className="text-xs font-medium text-slate-500">{t.type}</span>
                {t.isReferenceCustomer && <Pill tone="good">Reference</Pill>}
              </div>
              <p className="text-sm italic text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-1 text-xs text-slate-500">
                {t.author}, {t.role} · {formatDate(t.date)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ExpansionTab({ customer }: { customer: NonNullable<ReturnType<typeof getCustomer>> }) {
  return (
    <Card>
      <CardHeader title="Product Expansion" subtitle="Cross-sell and upsell scoring" />
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2">Product</th>
            <th className="py-2">Status</th>
            <th className="py-2">Cross-Sell Score</th>
            <th className="py-2">Upsell Score</th>
          </tr>
        </thead>
        <tbody>
          {customer.expansionProducts.map((p) => (
            <tr key={p.name} className="border-t border-slate-100">
              <td className="py-2.5 font-medium text-slate-700">{p.name}</td>
              <td className="py-2.5">
                <Pill tone={p.status === 'active' ? 'good' : 'neutral'}>{p.status === 'active' ? 'Active' : 'Not Using'}</Pill>
              </td>
              <td className="py-2.5">{p.crossSellScore ? <ProgressBar value={p.crossSellScore} colorClass="bg-brand-500" /> : <span className="text-slate-300">—</span>}</td>
              <td className="py-2.5">{p.upsellScore ? <ProgressBar value={p.upsellScore} colorClass="bg-good-500" /> : <span className="text-slate-300">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function QbrTab({ customer }: { customer: NonNullable<ReturnType<typeof getCustomer>> }) {
  const statusTone: Record<string, 'good' | 'brand' | 'bad' | 'neutral'> = {
    Completed: 'good',
    Scheduled: 'brand',
    Overdue: 'bad',
    'Not Scheduled': 'neutral',
  }
  return (
    <Card>
      <CardHeader title="Quarterly Business Reviews" />
      <div className="space-y-3">
        {customer.qbrs.map((q) => (
          <div key={q.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-sm font-medium text-slate-800">{q.quarter}</div>
                <div className="text-xs text-slate-500">{formatDate(q.date)} · {q.attendees.join(', ')}</div>
                {q.summary && <div className="mt-1 text-xs text-slate-600">{q.summary}</div>}
              </div>
            </div>
            <Pill tone={statusTone[q.status]}>{q.status}</Pill>
          </div>
        ))}
      </div>
    </Card>
  )
}
