import type { HealthStatus, ReadinessLevel, FinancialPeriod, Customer } from '@/types/customer'

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 75) return 'healthy'
  if (score >= 50) return 'attention'
  return 'critical'
}

export const HEALTH_STATUS_META: Record<HealthStatus, { label: string; dot: string; text: string; bg: string }> = {
  healthy: { label: 'Healthy', dot: 'bg-good-500', text: 'text-good-700', bg: 'bg-good-50' },
  attention: { label: 'Needs Attention', dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50' },
  critical: { label: 'Critical', dot: 'bg-bad-500', text: 'text-bad-700', bg: 'bg-bad-50' },
}

export function getReadinessLevel(score: number): ReadinessLevel {
  if (score <= 20) return 1
  if (score <= 40) return 2
  if (score <= 60) return 3
  if (score <= 80) return 4
  if (score <= 90) return 5
  return 6
}

/** A row-less customer (e.g. one added to the Customers sheet without a matching Financials row) falls back to this. */
export const EMPTY_FINANCIAL_PERIOD: FinancialPeriod = {
  period: '—',
  recurringRevenue: 0,
  projectRevenue: 0,
  cloudRevenue: 0,
  supportRevenue: 0,
  developerCost: 0,
  deliveryCost: 0,
  supportCost: 0,
  infrastructureCost: 0,
  travelCost: 0,
  salesCost: 0,
  successCost: 0,
  cloudCost: 0,
}

export function sumFinancials(f: FinancialPeriod | undefined) {
  const period = f ?? EMPTY_FINANCIAL_PERIOD
  const revenue = period.recurringRevenue + period.projectRevenue + period.cloudRevenue + period.supportRevenue
  const deliveryCosts = period.developerCost + period.deliveryCost + period.supportCost + period.infrastructureCost + period.travelCost
  const overheadCosts = period.salesCost + period.successCost + period.cloudCost
  const cost = deliveryCosts + overheadCosts
  const grossMargin = revenue - deliveryCosts
  const netMargin = grossMargin - overheadCosts
  const marginPct = revenue === 0 ? 0 : (netMargin / revenue) * 100
  return { revenue, cost, deliveryCosts, overheadCosts, grossMargin, netMargin, marginPct }
}

export function latestFinancials(c: Customer): FinancialPeriod {
  return c.financials[c.financials.length - 1] ?? EMPTY_FINANCIAL_PERIOD
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime()
  // fixed "today" so results are stable across renders/tests
  const today = new Date('2026-07-17').getTime()
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}
