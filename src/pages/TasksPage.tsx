import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, AlertTriangle, Sparkles, BookOpen, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { Pill } from '@/components/ui/HealthBadge'
import { ALL_TASKS, getCustomer } from '@/data/customers'
import { AI_TASK_RULES } from '@/data/aiTaskRules'
import { formatDateShort } from '@/lib/format'
import { daysUntil } from '@/lib/derive'
import type { TaskOwnerTeam, TaskStatus } from '@/types/customer'

const TEAMS: TaskOwnerTeam[] = ['Customer Success', 'Delivery', 'Sales', 'Finance']
const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Done']

const PRIORITY_TONE: Record<string, 'bad' | 'warn' | 'neutral'> = { High: 'bad', Medium: 'warn', Low: 'neutral' }
const STATUS_TONE: Record<TaskStatus, 'good' | 'brand' | 'neutral'> = {
  Done: 'good',
  'In Progress': 'brand',
  'Not Started': 'neutral',
}

export function TasksPage() {
  const navigate = useNavigate()
  const [team, setTeam] = useState<'All' | TaskOwnerTeam>('All')
  const [status, setStatus] = useState<'All' | TaskStatus>('All')
  const [source, setSource] = useState<'All' | 'Playbook' | 'AI'>('All')

  const openCount = useMemo(() => ALL_TASKS.filter((t) => t.status !== 'Done').length, [])
  const overdueCount = useMemo(
    () => ALL_TASKS.filter((t) => t.status !== 'Done' && daysUntil(t.dueDate) < 0).length,
    [],
  )
  const aiCount = useMemo(() => ALL_TASKS.filter((t) => t.source === 'AI').length, [])
  const playbookCount = useMemo(() => ALL_TASKS.filter((t) => t.source === 'Playbook').length, [])

  const filtered = useMemo(() => {
    return [...ALL_TASKS]
      .filter((t) => (team === 'All' ? true : t.team === team))
      .filter((t) => (status === 'All' ? true : t.status === status))
      .filter((t) => (source === 'All' ? true : t.source === source))
      .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
  }, [team, status, source])

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${openCount} open tasks across the customer portfolio`} />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Total Open Tasks" value={String(openCount)} icon={CheckSquare} sub="not yet done" />
        <StatTile label="Overdue Tasks" value={String(overdueCount)} icon={AlertTriangle} sub="past due date" />
        <StatTile label="AI-Generated" value={String(aiCount)} icon={Sparkles} sub="auto-created by rules" />
        <StatTile label="Playbook-Generated" value={String(playbookCount)} icon={BookOpen} sub="from readiness playbooks" />
      </div>

      <Card className="mb-6 border-brand-100 bg-brand-50/50">
        <CardHeader
          title="AI Task Automation"
          subtitle="Tasks are never manually assigned — these rules watch account signals and generate tasks automatically"
          action={<Sparkles className="h-4 w-4 text-brand-600" />}
        />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {AI_TASK_RULES.map((rule) => (
            <div
              key={rule.trigger}
              className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2.5 text-sm"
            >
              <span className="text-slate-600">{rule.trigger}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-brand-400" />
              <span className="font-medium text-brand-700">{rule.generatedTask}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="All Tasks" subtitle={`${filtered.length} of ${ALL_TASKS.length} tasks`} />

        <div className="mb-4 flex flex-wrap gap-3">
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value as typeof team)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600"
          >
            <option value="All">All Teams</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600"
          >
            <option value="All">All Sources</option>
            <option value="Playbook">Playbook</option>
            <option value="AI">AI</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-2">Customer</th>
                <th className="py-2 pr-2">Task</th>
                <th className="py-2 pr-2">Team</th>
                <th className="py-2 pr-2">Priority</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 pr-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const customer = getCustomer(t.customerId)
                return (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="py-2.5 pr-2">
                      <button
                        onClick={() => navigate(`/customers/${t.customerId}`)}
                        className="font-medium text-slate-700 hover:text-brand-600 hover:underline"
                      >
                        {customer?.name ?? t.customerId}
                      </button>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="font-medium text-slate-700">{t.title}</div>
                      {t.source === 'AI' && t.reason && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-600">
                          <Sparkles className="h-3 w-3" /> {t.reason}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-slate-600">{t.team}</td>
                    <td className="py-2.5 pr-2">
                      <Pill tone={PRIORITY_TONE[t.priority]}>{t.priority}</Pill>
                    </td>
                    <td className="py-2.5 pr-2">
                      <Pill tone={STATUS_TONE[t.status]}>{t.status}</Pill>
                    </td>
                    <td className="py-2.5 pr-2 text-slate-600">{formatDateShort(t.dueDate)}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No tasks match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
