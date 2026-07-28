export type HealthStatus = 'healthy' | 'attention' | 'critical'

export type ReadinessLevel = 1 | 2 | 3 | 4 | 5 | 6

export const READINESS_LEVELS: Record<ReadinessLevel, { name: string; range: string }> = {
  1: { name: 'Onboarding', range: '0-20' },
  2: { name: 'Stabilization', range: '21-40' },
  3: { name: 'Adoption', range: '41-60' },
  4: { name: 'Optimization', range: '61-80' },
  5: { name: 'Expansion', range: '81-90' },
  6: { name: 'Strategic Partner', range: '91-100' },
}

export interface HealthIndicator {
  label: string
  score: number // 0-100
}

export interface FinancialPeriod {
  period: string // e.g. "2025-Q3"
  recurringRevenue: number
  projectRevenue: number
  cloudRevenue: number
  supportRevenue: number
  developerCost: number
  deliveryCost: number
  supportCost: number
  infrastructureCost: number
  travelCost: number
  salesCost: number
  successCost: number
  cloudCost: number
}

export interface LtvSnapshot {
  currentAnnualRevenue: number
  expectedRenewalRevenue: number
  crossSellOpportunity: number
  upsellOpportunity: number
  expectedLifetimeYears: number
  averageAnnualSpend: number
  expansionProbability: number // 0-100
  predictedLtv: number
  acquisitionCost: number
  paybackMonths: number
  ltvTrend: { period: string; value: number }[]
}

export type JourneyStage =
  | 'Sales Won'
  | 'Kickoff'
  | 'Discovery'
  | 'Implementation'
  | 'Go Live'
  | 'Training'
  | 'Support'
  | 'Optimization'
  | 'Renewal'
  | 'Expansion'

export interface JourneyEvent {
  stage: JourneyStage
  date: string
  status: 'complete' | 'current' | 'upcoming'
  note?: string
}

export type TaskPriority = 'High' | 'Medium' | 'Low'
export type TaskStatus = 'Not Started' | 'In Progress' | 'Done'
export type TaskOwnerTeam = 'Customer Success' | 'Delivery' | 'Sales' | 'Finance'

export interface Task {
  id: string
  customerId: string
  title: string
  team: TaskOwnerTeam
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  source: 'Playbook' | 'AI'
  reason?: string // for AI-generated tasks, the trigger that created it
}

export interface Playbook {
  level: ReadinessLevel
  name: string
  tasks: string[]
}

export type TestimonialType =
  | 'Video'
  | 'Written'
  | 'LinkedIn'
  | 'Google Review'
  | 'G2 Review'
  | 'Clutch Review'
  | 'Success Story'
  | 'NPS Comment'

export interface Testimonial {
  id: string
  customerId: string
  type: TestimonialType
  author: string
  role: string
  quote: string
  date: string
  isReferenceCustomer: boolean
}

export type ContactRole = 'CEO' | 'CTO' | 'Manager' | 'Champion' | 'Influencer' | 'Decision Maker' | 'Blocked' | 'Inactive'

export interface Contact {
  id: string
  name: string
  title: string
  role: ContactRole
  relationshipStrength: number // 0-100
  lastContact: string
  email: string
}

export interface ExpansionProduct {
  name: string
  status: 'active' | 'not-using'
  crossSellScore?: number
  upsellScore?: number
}

export interface QbrRecord {
  id: string
  customerId: string
  quarter: string
  date: string
  status: 'Scheduled' | 'Completed' | 'Overdue' | 'Not Scheduled'
  attendees: string[]
  summary?: string
}

export interface Customer {
  id: string
  name: string
  logoInitial: string
  industry: string
  geography: string
  customerSince: string
  accountOwner: string
  deliveryManager: string
  csm: string
  salesOwner: string
  technicalSpoc: string
  executiveSponsor: string
  renewalDate: string
  contractValue: number
  plan: 'Starter' | 'Growth' | 'Enterprise'
  activeProjects: number
  teamSize: number
  techStack: string[]

  healthScore: number // 0-100
  healthIndicators: HealthIndicator[]

  readinessScore: number // 0-100
  readinessDimensions: HealthIndicator[]

  nps: number // 0-10
  csat: number // 0-100

  financials: FinancialPeriod[]
  ltv: LtvSnapshot

  journey: JourneyEvent[]

  contacts: Contact[]
  expansionProducts: ExpansionProduct[]

  qbrs: QbrRecord[]

  hasReferenceAgreement: boolean
}
