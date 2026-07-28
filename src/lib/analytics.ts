import type { Customer } from '@/types/customer'
import { CUSTOMERS, ALL_TASKS } from '@/data/customers'
import { getHealthStatus, latestFinancials, sumFinancials, daysUntil } from '@/lib/derive'

export function totalArr(customers: Customer[] = CUSTOMERS): number {
  return customers.reduce((sum, c) => sum + c.contractValue, 0)
}

export function avgHealthScore(customers: Customer[] = CUSTOMERS): number {
  return Math.round(customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length)
}

export function avgNps(customers: Customer[] = CUSTOMERS): number {
  return Math.round((customers.reduce((sum, c) => sum + c.nps, 0) / customers.length) * 10) / 10
}

export function customersAtRisk(customers: Customer[] = CUSTOMERS): Customer[] {
  return customers.filter((c) => getHealthStatus(c.healthScore) !== 'healthy').sort((a, b) => a.healthScore - b.healthScore)
}

export function customersGrowingFast(customers: Customer[] = CUSTOMERS): Customer[] {
  return [...customers]
    .map((c) => ({ c, growth: sumFinancials(c.financials[c.financials.length - 1]).revenue - sumFinancials(c.financials[0]).revenue }))
    .sort((a, b) => b.growth - a.growth)
    .map((x) => x.c)
}

export function marginRanked(customers: Customer[] = CUSTOMERS): { customer: Customer; marginPct: number }[] {
  return customers
    .map((c) => ({ customer: c, marginPct: sumFinancials(latestFinancials(c)).marginPct }))
    .sort((a, b) => b.marginPct - a.marginPct)
}

export function upcomingRenewals(withinDays = 120, customers: Customer[] = CUSTOMERS): Customer[] {
  return customers
    .filter((c) => {
      const d = daysUntil(c.renewalDate)
      return d >= 0 && d <= withinDays
    })
    .sort((a, b) => daysUntil(a.renewalDate) - daysUntil(b.renewalDate))
}

export function referenceCustomers(customers: Customer[] = CUSTOMERS): Customer[] {
  return customers.filter((c) => c.hasReferenceAgreement)
}

export function expansionOpportunities(customers: Customer[] = CUSTOMERS): { customer: Customer; score: number }[] {
  return customers
    .map((c) => ({ customer: c, score: Math.round((c.ltv.expansionProbability + c.readinessScore) / 2) }))
    .sort((a, b) => b.score - a.score)
}

export function customersWithoutQbrThisQuarter(customers: Customer[] = CUSTOMERS): Customer[] {
  return customers.filter((c) => !c.qbrs.some((q) => q.quarter === '2026-Q3' && q.status !== 'Not Scheduled'))
}

export function openTaskCount(customerId?: string): number {
  return ALL_TASKS.filter((t) => t.status !== 'Done' && (!customerId || t.customerId === customerId)).length
}

export function overdueTaskCount(customerId?: string): number {
  return ALL_TASKS.filter(
    (t) => t.status !== 'Done' && daysUntil(t.dueDate) < 0 && (!customerId || t.customerId === customerId),
  ).length
}
