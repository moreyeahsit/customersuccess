import type {
  Customer,
  Contact,
  ContactRole,
  ExpansionProduct,
  FinancialPeriod,
  JourneyEvent,
  JourneyStage,
  QbrRecord,
  Task,
  Testimonial,
} from '@/types/customer'

const ALL_STAGES: JourneyStage[] = [
  'Sales Won',
  'Kickoff',
  'Discovery',
  'Implementation',
  'Go Live',
  'Training',
  'Support',
  'Optimization',
  'Renewal',
  'Expansion',
]

const ALL_PRODUCTS = [
  'Core Platform',
  'Analytics Add-on',
  'Automation Studio',
  'Mobile App',
  'Advanced Security Suite',
  'Integration Hub',
]

const READINESS_DIMENSION_LABELS = [
  'Portal Usage',
  'Meetings',
  'Decision Makers',
  'Training Completed',
  'Support Usage',
  'Documentation',
  'Automation',
  'Governance',
  'Innovation',
  'Roadmap',
]

const HEALTH_INDICATOR_LABELS = [
  'Executive Engagement',
  'Product Adoption',
  'Support Satisfaction',
  'Delivery Quality',
  'Revenue Growth',
  'Payment Health',
]

/** Builds a quarterly financial trend ending at the given latest-quarter totals, growing/shrinking backwards by stepPct per quarter. */
function buildFinancialTrend(latest: Omit<FinancialPeriod, 'period'>, quarters: string[], stepPct: number): FinancialPeriod[] {
  const n = quarters.length
  return quarters.map((period, i) => {
    const factor = Math.pow(1 - stepPct, n - 1 - i)
    const scale = (v: number) => Math.round(v * factor)
    return {
      period,
      recurringRevenue: scale(latest.recurringRevenue),
      projectRevenue: scale(latest.projectRevenue),
      cloudRevenue: scale(latest.cloudRevenue),
      supportRevenue: scale(latest.supportRevenue),
      developerCost: scale(latest.developerCost),
      deliveryCost: scale(latest.deliveryCost),
      supportCost: scale(latest.supportCost),
      infrastructureCost: scale(latest.infrastructureCost),
      travelCost: scale(latest.travelCost),
      salesCost: scale(latest.salesCost),
      successCost: scale(latest.successCost),
      cloudCost: scale(latest.cloudCost),
    }
  })
}

function buildContacts(seed: number, roles: ContactRole[]): Contact[] {
  const names = [
    ['Alex Carter', 'alex.carter'],
    ['Priya Nair', 'priya.nair'],
    ['Jordan Lee', 'jordan.lee'],
    ['Sam Whitfield', 'sam.whitfield'],
    ['Meera Iyer', 'meera.iyer'],
    ['Chris Bowman', 'chris.bowman'],
  ]
  const titles: Record<ContactRole, string> = {
    CEO: 'Chief Executive Officer',
    CTO: 'Chief Technology Officer',
    Manager: 'Program Manager',
    Champion: 'Head of Operations',
    Influencer: 'Senior Analyst',
    'Decision Maker': 'VP, Technology',
    Blocked: 'Procurement Lead',
    Inactive: 'Former Stakeholder',
  }
  return roles.map((role, i) => {
    const [name, handle] = names[(seed + i) % names.length]
    return {
      id: `c${seed}-${i}`,
      name,
      title: titles[role],
      role,
      relationshipStrength: role === 'Blocked' || role === 'Inactive' ? 15 + (i * 7) % 20 : 55 + ((seed + i * 13) % 40),
      lastContact: role === 'Inactive' ? '2025-11-02' : `2026-0${(6 + (i % 2)).toString().padStart(1, '0')}-${10 + (i * 3) % 15}`,
      email: `${handle}@company.com`,
    }
  })
}

function buildJourney(currentStageIndex: number, startYear = 2023): JourneyEvent[] {
  return ALL_STAGES.map((stage, i) => {
    const status: JourneyEvent['status'] = i < currentStageIndex ? 'complete' : i === currentStageIndex ? 'current' : 'upcoming'
    const month = ((i * 2) % 12) + 1
    const year = startYear + Math.floor((i * 2) / 12)
    return {
      stage,
      date: `${year}-${month.toString().padStart(2, '0')}-15`,
      status,
    }
  })
}

function buildExpansion(activeCount: number, seed: number): ExpansionProduct[] {
  return ALL_PRODUCTS.map((name, i) => ({
    name,
    status: i < activeCount ? 'active' : 'not-using',
    crossSellScore: i >= activeCount ? 40 + ((seed + i * 11) % 55) : undefined,
    upsellScore: i < activeCount ? 30 + ((seed + i * 7) % 60) : undefined,
  }))
}

let taskCounter = 0
function task(customerId: string, t: Omit<Task, 'id' | 'customerId'>): Task {
  taskCounter += 1
  return { id: `task-${taskCounter}`, customerId, ...t }
}

let qbrCounter = 0
function qbr(customerId: string, q: Omit<QbrRecord, 'id' | 'customerId'>): QbrRecord {
  qbrCounter += 1
  return { id: `qbr-${qbrCounter}`, customerId, ...q }
}

let testimonialCounter = 0
function testimonial(customerId: string, t: Omit<Testimonial, 'id' | 'customerId'>): Testimonial {
  testimonialCounter += 1
  return { id: `test-${testimonialCounter}`, customerId, ...t }
}

const QUARTERS_4 = ['2025-Q4', '2026-Q1', '2026-Q2', '2026-Q3']

// ---------------------------------------------------------------------------
// Acme Corp — hand-tuned to match the reference dashboard mock exactly
// ---------------------------------------------------------------------------
const acmeFinancials = buildFinancialTrend(
  {
    recurringRevenue: 29_60_000,
    projectRevenue: 12_60_000,
    cloudRevenue: 4_40_000,
    supportRevenue: 2_00_000,
    developerCost: 16_20_000,
    deliveryCost: 8_40_000,
    supportCost: 3_40_000,
    infrastructureCost: 2_80_000,
    travelCost: 1_60_000,
    salesCost: 2_10_000,
    successCost: 1_20_000,
    cloudCost: 50_000,
  },
  QUARTERS_4,
  -0.03, // margin was shrinking, i.e. costs growing faster than revenue in prior quarters
)

const acme: Customer = {
  id: 'acme-corp',
  name: 'Acme Corp',
  logoInitial: 'A',
  industry: 'Healthcare',
  geography: 'Location 10',
  customerSince: '2023-01-15',
  accountOwner: 'Shifan Khan',
  deliveryManager: 'Rahul Verma',
  csm: 'Shifan Khan',
  salesOwner: 'Divya Menon',
  technicalSpoc: 'Arjun Rao',
  executiveSponsor: 'Alex Carter (CEO)',
  renewalDate: '2026-10-15',
  contractValue: 48_60_000,
  plan: 'Enterprise',
  activeProjects: 3,
  teamSize: 42,
  techStack: ['Azure', 'React', '.NET', 'Power BI'],

  healthScore: 89,
  healthIndicators: [
    { label: 'Executive Engagement', score: 88 },
    { label: 'Product Adoption', score: 91 },
    { label: 'Support Satisfaction', score: 86 },
    { label: 'Delivery Quality', score: 90 },
    { label: 'Revenue Growth', score: 84 },
    { label: 'Payment Health', score: 95 },
  ],

  readinessScore: 73,
  readinessDimensions: [
    { label: 'Portal Usage', score: 82 },
    { label: 'Meetings', score: 74 },
    { label: 'Decision Makers', score: 68 },
    { label: 'Training Completed', score: 90 },
    { label: 'Support Usage', score: 60 },
    { label: 'Documentation', score: 75 },
    { label: 'Automation', score: 55 },
    { label: 'Governance', score: 70 },
    { label: 'Innovation', score: 65 },
    { label: 'Roadmap', score: 80 },
  ],

  nps: 8.6,
  csat: 92,

  financials: acmeFinancials,
  ltv: {
    currentAnnualRevenue: 48_60_000,
    expectedRenewalRevenue: 52_00_000,
    crossSellOpportunity: 18_00_000,
    upsellOpportunity: 12_00_000,
    expectedLifetimeYears: 4.4,
    averageAnnualSpend: 54_80_000,
    expansionProbability: 78,
    predictedLtv: 2_42_00_000,
    acquisitionCost: 4_21_000,
    paybackMonths: 4.6,
    ltvTrend: [
      { period: '2025-Q4', value: 1_98_00_000 },
      { period: '2026-Q1', value: 2_12_00_000 },
      { period: '2026-Q2', value: 2_28_00_000 },
      { period: '2026-Q3', value: 2_42_00_000 },
    ],
  },

  journey: buildJourney(8, 2023),

  contacts: [
    ...buildContacts(1, ['CEO', 'CTO', 'Champion', 'Decision Maker']),
  ],
  expansionProducts: buildExpansion(3, 1),

  qbrs: [
    qbr('acme-corp', { quarter: '2025-Q4', date: '2025-12-10', status: 'Completed', attendees: ['Alex Carter', 'Shifan Khan'], summary: 'Reviewed adoption gains, agreed automation rollout for Q1.' }),
    qbr('acme-corp', { quarter: '2026-Q1', date: '2026-03-18', status: 'Completed', attendees: ['Alex Carter', 'Priya Nair', 'Shifan Khan'], summary: 'Discussed margin pressure from support load; proposed premium support tier.' }),
    qbr('acme-corp', { quarter: '2026-Q2', date: '2026-06-20', status: 'Completed', attendees: ['Alex Carter', 'Shifan Khan'], summary: 'Presented ROI report; customer open to Analytics Add-on.' }),
    qbr('acme-corp', { quarter: '2026-Q3', date: '2026-09-15', status: 'Scheduled', attendees: ['Alex Carter', 'Shifan Khan'] }),
  ],

  hasReferenceAgreement: true,
}

const acmeTasks: Task[] = [
  task('acme-corp', { title: 'Quarterly Review', team: 'Customer Success', priority: 'High', status: 'In Progress', dueDate: '2026-07-15', source: 'Playbook' }),
  task('acme-corp', { title: 'ROI Presentation', team: 'Customer Success', priority: 'High', status: 'Not Started', dueDate: '2026-07-20', source: 'Playbook' }),
  task('acme-corp', { title: 'New Module Demo', team: 'Sales', priority: 'Medium', status: 'Not Started', dueDate: '2026-07-25', source: 'Playbook' }),
  task('acme-corp', { title: 'Automation Suggestions', team: 'Delivery', priority: 'Medium', status: 'In Progress', dueDate: '2026-07-18', source: 'Playbook' }),
  task('acme-corp', { title: 'Review project profitability', team: 'Finance', priority: 'High', status: 'Not Started', dueDate: '2026-07-22', source: 'AI', reason: 'Profit margin below 20% threshold on Support line' }),
  task('acme-corp', { title: 'Prepare renewal strategy', team: 'Customer Success', priority: 'High', status: 'Not Started', dueDate: '2026-08-01', source: 'AI', reason: 'Renewal in 90 days' }),
  task('acme-corp', { title: 'Collect testimonial', team: 'Customer Success', priority: 'Low', status: 'Not Started', dueDate: '2026-07-28', source: 'AI', reason: 'NPS score of 8.6 and recent successful go-live' }),
  task('acme-corp', { title: 'Book executive alignment', team: 'Customer Success', priority: 'Medium', status: 'Done', dueDate: '2026-07-05', source: 'AI', reason: 'Low meeting attendance in prior quarter' }),
]

const acmeTestimonials: Testimonial[] = [
  testimonial('acme-corp', { type: 'Video', author: 'Alex Carter', role: 'CEO, Acme Corp', quote: 'The team feels like an extension of ours.', date: '2026-05-02', isReferenceCustomer: true }),
  testimonial('acme-corp', { type: 'G2 Review', author: 'Priya Nair', role: 'Head of Operations', quote: 'Adoption tripled within two quarters.', date: '2026-06-11', isReferenceCustomer: true }),
]

// ---------------------------------------------------------------------------
// Factory for the remaining portfolio customers
// ---------------------------------------------------------------------------
interface Blueprint {
  id: string
  name: string
  industry: string
  geography: string
  plan: Customer['plan']
  since: string
  renewalDate: string
  contractValue: number
  healthScore: number
  readinessScore: number
  nps: number
  csat: number
  marginPct: number // target net margin % of revenue, drives cost scaling
  journeyStageIndex: number
  contactRoles: ContactRole[]
  activeProducts: number
  reference: boolean
  costTrendPct: number // positive = costs shrinking over time (margin improving)
}

const BLUEPRINTS: Blueprint[] = [
  {
    id: 'stark-industries', name: 'Stark Industries', industry: 'Manufacturing', geography: 'Location 3',
    plan: 'Enterprise', since: '2022-04-01', renewalDate: '2026-08-05', contractValue: 62_00_000,
    healthScore: 41, readinessScore: 38, nps: 4.1, csat: 58, marginPct: -8,
    journeyStageIndex: 6, contactRoles: ['CTO', 'Blocked', 'Influencer'], activeProducts: 2, reference: false, costTrendPct: -0.05,
  },
  {
    id: 'wayne-enterprises', name: 'Wayne Enterprises', industry: 'Financial Services', geography: 'Location 1',
    plan: 'Enterprise', since: '2020-02-20', renewalDate: '2027-02-20', contractValue: 1_85_00_000,
    healthScore: 95, readinessScore: 96, nps: 9.4, csat: 97, marginPct: 34,
    journeyStageIndex: 9, contactRoles: ['CEO', 'CTO', 'Champion', 'Decision Maker'], activeProducts: 6, reference: true, costTrendPct: 0.02,
  },
  {
    id: 'umbrella-corp', name: 'Umbrella Corp', industry: 'Pharmaceuticals', geography: 'Location 6',
    plan: 'Growth', since: '2024-06-10', renewalDate: '2026-09-01', contractValue: 34_00_000,
    healthScore: 62, readinessScore: 55, nps: 6.5, csat: 71, marginPct: 8,
    journeyStageIndex: 7, contactRoles: ['Manager', 'Influencer'], activeProducts: 3, reference: false, costTrendPct: 0.01,
  },
  {
    id: 'initech', name: 'Initech', industry: 'Software', geography: 'Location 4',
    plan: 'Growth', since: '2024-11-05', renewalDate: '2026-11-05', contractValue: 22_50_000,
    healthScore: 81, readinessScore: 78, nps: 8.0, csat: 88, marginPct: 21,
    journeyStageIndex: 7, contactRoles: ['Champion', 'Decision Maker'], activeProducts: 4, reference: true, costTrendPct: 0.015,
  },
  {
    id: 'hooli', name: 'Hooli', industry: 'Technology', geography: 'Location 8',
    plan: 'Enterprise', since: '2026-05-01', renewalDate: '2027-05-01', contractValue: 41_00_000,
    healthScore: 70, readinessScore: 14, nps: 7.2, csat: 80, marginPct: 5,
    journeyStageIndex: 1, contactRoles: ['CTO', 'Manager'], activeProducts: 1, reference: false, costTrendPct: 0.03,
  },
  {
    id: 'globex-corp', name: 'Globex Corporation', industry: 'Retail', geography: 'Location 2',
    plan: 'Growth', since: '2024-01-20', renewalDate: '2026-07-30', contractValue: 28_00_000,
    healthScore: 54, readinessScore: 33, nps: 5.4, csat: 63, marginPct: 6,
    journeyStageIndex: 5, contactRoles: ['Manager', 'Inactive'], activeProducts: 2, reference: false, costTrendPct: -0.01,
  },
  {
    id: 'soylent-corp', name: 'Soylent Corp', industry: 'Food & Beverage', geography: 'Location 9',
    plan: 'Starter', since: '2025-03-12', renewalDate: '2026-08-20', contractValue: 9_50_000,
    healthScore: 33, readinessScore: 22, nps: 2.8, csat: 41, marginPct: -22,
    journeyStageIndex: 4, contactRoles: ['Manager', 'Blocked'], activeProducts: 1, reference: false, costTrendPct: -0.06,
  },
  {
    id: 'aperture-science', name: 'Aperture Science', industry: 'R&D', geography: 'Location 5',
    plan: 'Enterprise', since: '2023-08-01', renewalDate: '2026-08-01', contractValue: 76_00_000,
    healthScore: 84, readinessScore: 87, nps: 8.9, csat: 90, marginPct: 26,
    journeyStageIndex: 8, contactRoles: ['CEO', 'CTO', 'Champion'], activeProducts: 5, reference: true, costTrendPct: 0.02,
  },
  {
    id: 'massive-dynamic', name: 'Massive Dynamic', industry: 'Conglomerate', geography: 'Location 7',
    plan: 'Enterprise', since: '2019-09-09', renewalDate: '2026-12-09', contractValue: 2_10_00_000,
    healthScore: 91, readinessScore: 93, nps: 9.1, csat: 95, marginPct: 30,
    journeyStageIndex: 9, contactRoles: ['CEO', 'Decision Maker', 'Champion'], activeProducts: 6, reference: true, costTrendPct: 0.01,
  },
]

function buildFromBlueprint(bp: Blueprint, seed: number): { customer: Customer; tasks: Task[]; testimonials: Testimonial[] } {
  const revenue = bp.contractValue
  const recurringRevenue = Math.round(revenue * 0.62)
  const projectRevenue = Math.round(revenue * 0.26)
  const cloudRevenue = Math.round(revenue * 0.09)
  const supportRevenue = revenue - recurringRevenue - projectRevenue - cloudRevenue

  const targetCost = Math.round(revenue * (1 - bp.marginPct / 100))
  const developerCost = Math.round(targetCost * 0.42)
  const deliveryCost = Math.round(targetCost * 0.24)
  const supportCost = Math.round(targetCost * 0.12)
  const infrastructureCost = Math.round(targetCost * 0.09)
  const travelCost = Math.round(targetCost * 0.04)
  const salesCost = Math.round(targetCost * 0.05)
  const successCost = Math.round(targetCost * 0.03)
  const cloudCost = targetCost - developerCost - deliveryCost - supportCost - infrastructureCost - travelCost - salesCost - successCost

  const financials = buildFinancialTrend(
    { recurringRevenue, projectRevenue, cloudRevenue, supportRevenue, developerCost, deliveryCost, supportCost, infrastructureCost, travelCost, salesCost, successCost, cloudCost },
    QUARTERS_4,
    bp.costTrendPct,
  )

  const predictedLtv = Math.round(revenue * (2.2 + bp.marginPct / 40))
  const ltv: Customer['ltv'] = {
    currentAnnualRevenue: revenue,
    expectedRenewalRevenue: Math.round(revenue * (1 + bp.marginPct / 200)),
    crossSellOpportunity: Math.round(revenue * 0.3),
    upsellOpportunity: Math.round(revenue * 0.2),
    expectedLifetimeYears: Math.round((predictedLtv / revenue) * 10) / 10,
    averageAnnualSpend: revenue,
    expansionProbability: Math.max(5, Math.min(95, bp.readinessScore + 5)),
    predictedLtv,
    acquisitionCost: Math.round(revenue * 0.08),
    paybackMonths: Math.round((10 - bp.marginPct / 10) * 10) / 10,
    ltvTrend: QUARTERS_4.map((period, i) => ({ period, value: Math.round(predictedLtv * (0.82 + i * 0.06)) })),
  }

  const healthIndicators = HEALTH_INDICATOR_LABELS.map((label, i) => ({
    label,
    score: Math.max(5, Math.min(100, bp.healthScore + (((seed + i * 17) % 21) - 10))),
  }))
  const readinessDimensions = READINESS_DIMENSION_LABELS.map((label, i) => ({
    label,
    score: Math.max(5, Math.min(100, bp.readinessScore + (((seed + i * 13) % 25) - 12))),
  }))

  const customer: Customer = {
    id: bp.id,
    name: bp.name,
    logoInitial: bp.name[0],
    industry: bp.industry,
    geography: bp.geography,
    customerSince: bp.since,
    accountOwner: 'Shifan Khan',
    deliveryManager: ['Rahul Verma', 'Neha Kapoor', 'Vikram Singh'][seed % 3],
    csm: 'Shifan Khan',
    salesOwner: ['Divya Menon', 'Karan Malhotra'][seed % 2],
    technicalSpoc: ['Arjun Rao', 'Sanya Kapoor'][seed % 2],
    executiveSponsor: `${bp.contactRoles.includes('CEO') ? 'CEO Sponsor' : 'Exec Sponsor'} — ${bp.name}`,
    renewalDate: bp.renewalDate,
    contractValue: bp.contractValue,
    plan: bp.plan,
    activeProjects: 1 + (seed % 4),
    teamSize: 8 + seed * 6,
    techStack: ['Azure', 'React', '.NET'].slice(0, 1 + (seed % 3)),

    healthScore: bp.healthScore,
    healthIndicators,

    readinessScore: bp.readinessScore,
    readinessDimensions,

    nps: bp.nps,
    csat: bp.csat,

    financials,
    ltv,

    journey: buildJourney(bp.journeyStageIndex, 2023 + (seed % 3)),

    contacts: buildContacts(seed, bp.contactRoles),
    expansionProducts: buildExpansion(bp.activeProducts, seed),

    qbrs: [
      qbr(bp.id, { quarter: '2026-Q1', date: '2026-03-05', status: 'Completed', attendees: ['Shifan Khan'] }),
      qbr(bp.id, {
        quarter: '2026-Q3',
        date: bp.healthScore < 55 ? '2026-09-30' : '2026-08-12',
        status: bp.healthScore < 55 ? 'Not Scheduled' : 'Scheduled',
        attendees: ['Shifan Khan'],
      }),
    ],

    hasReferenceAgreement: bp.reference,
  }

  const tasks: Task[] = []
  if (bp.healthScore < 55) {
    tasks.push(task(bp.id, { title: 'Schedule adoption meeting', team: 'Customer Success', priority: 'High', status: 'Not Started', dueDate: '2026-07-21', source: 'AI', reason: `Health score dropped to ${bp.healthScore}` }))
  }
  if (bp.marginPct < 15) {
    tasks.push(task(bp.id, { title: 'Review project profitability', team: 'Finance', priority: 'High', status: 'Not Started', dueDate: '2026-07-24', source: 'AI', reason: `Margin at ${bp.marginPct}%, below 15% threshold` }))
  }
  const daysToRenewal = Math.round((new Date(bp.renewalDate).getTime() - new Date('2026-07-17').getTime()) / 86400000)
  if (daysToRenewal <= 120) {
    tasks.push(task(bp.id, { title: 'Prepare renewal strategy', team: 'Customer Success', priority: 'High', status: 'In Progress', dueDate: bp.renewalDate, source: 'AI', reason: 'Renewal within 120 days' }))
  }
  if (bp.reference) {
    tasks.push(task(bp.id, { title: 'Request updated testimonial', team: 'Customer Success', priority: 'Low', status: 'Not Started', dueDate: '2026-08-05', source: 'AI', reason: `NPS of ${bp.nps} qualifies for advocacy outreach` }))
  }
  tasks.push(task(bp.id, { title: 'Quarterly usage report', team: 'Customer Success', priority: 'Medium', status: 'Not Started', dueDate: '2026-07-30', source: 'Playbook' }))

  const testimonials: Testimonial[] = bp.reference
    ? [testimonial(bp.id, { type: 'Written', author: bp.contactRoles.includes('CEO') ? 'CEO' : 'Program Sponsor', role: `Leadership, ${bp.name}`, quote: 'A genuine long-term partner in our growth.', date: '2026-04-18', isReferenceCustomer: true })]
    : []

  return { customer, tasks, testimonials }
}

const rest = BLUEPRINTS.map((bp, i) => buildFromBlueprint(bp, i + 2))

const DEFAULT_CUSTOMERS: Customer[] = [acme, ...rest.map((r) => r.customer)]
const DEFAULT_TASKS: Task[] = [...acmeTasks, ...rest.flatMap((r) => r.tasks)]
const DEFAULT_TESTIMONIALS: Testimonial[] = [...acmeTestimonials, ...rest.flatMap((r) => r.testimonials)]

/**
 * These start out as the bundled sample data and can be swapped for live
 * data loaded from the Excel workbook (see src/excel/liveData.ts). Because
 * ES module bindings are live, every existing `import { CUSTOMERS } from
 * '@/data/customers'` elsewhere in the app automatically sees the new value
 * once setLiveCustomerData() reassigns these — no other file needs to change.
 */
export let CUSTOMERS: Customer[] = DEFAULT_CUSTOMERS
export let ALL_TASKS: Task[] = DEFAULT_TASKS
export let ALL_TESTIMONIALS: Testimonial[] = DEFAULT_TESTIMONIALS

export function setLiveCustomerData(data: { customers: Customer[]; tasks: Task[]; testimonials: Testimonial[] }) {
  CUSTOMERS = data.customers
  ALL_TASKS = data.tasks
  ALL_TESTIMONIALS = data.testimonials
}

export function resetToSampleCustomerData() {
  CUSTOMERS = DEFAULT_CUSTOMERS
  ALL_TASKS = DEFAULT_TASKS
  ALL_TESTIMONIALS = DEFAULT_TESTIMONIALS
}

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id)
}

export function tasksForCustomer(id: string): Task[] {
  return ALL_TASKS.filter((t) => t.customerId === id)
}

export function testimonialsForCustomer(id: string): Testimonial[] {
  return ALL_TESTIMONIALS.filter((t) => t.customerId === id)
}
