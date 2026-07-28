import * as XLSX from 'xlsx'
import type {
  Customer,
  Contact,
  ContactRole,
  ExpansionProduct,
  JourneyEvent,
  JourneyStage,
  Playbook,
  QbrRecord,
  Task,
  TaskOwnerTeam,
  TaskPriority,
  TaskStatus,
  Testimonial,
  TestimonialType,
} from '@/types/customer'
import type { AiTaskRule } from '@/data/aiTaskRules'
import { SHEETS, REQUIRED_SHEETS } from './schema'
import { toNum, toOptionalNum, toStr, toBool, toIsoDate, toList } from './coerce'

export interface ParsedWorkbookData {
  customers: Customer[]
  tasks: Task[]
  testimonials: Testimonial[]
  playbooks: Playbook[]
  aiTaskRules: AiTaskRule[]
}

export class WorkbookValidationError extends Error {}

function rows(wb: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const sheet = wb.Sheets[sheetName]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

export function parseWorkbook(buffer: ArrayBuffer): ParsedWorkbookData {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })

  const missing = REQUIRED_SHEETS.filter((s) => !wb.SheetNames.includes(s))
  if (missing.length > 0) {
    throw new WorkbookValidationError(
      `The workbook is missing required sheet(s): ${missing.join(', ')}. Check that no tabs were renamed or deleted.`,
    )
  }

  const customerRows = rows(wb, SHEETS.CUSTOMERS)
  if (customerRows.length === 0) {
    throw new WorkbookValidationError(`The "${SHEETS.CUSTOMERS}" sheet has no data rows.`)
  }

  const byCustomer = new Map<string, Customer>()
  const knownIds = new Set<string>()

  for (const r of customerRows) {
    const id = toStr(r.CustomerID)
    if (!id) continue
    knownIds.add(id)
    byCustomer.set(id, {
      id,
      name: toStr(r.Name),
      logoInitial: toStr(r.Name).charAt(0).toUpperCase() || '?',
      industry: toStr(r.Industry),
      geography: toStr(r.Geography),
      customerSince: toIsoDate(r.CustomerSince),
      accountOwner: toStr(r.AccountOwner),
      deliveryManager: toStr(r.DeliveryManager),
      csm: toStr(r.CSM),
      salesOwner: toStr(r.SalesOwner),
      technicalSpoc: toStr(r.TechnicalSPOC),
      executiveSponsor: toStr(r.ExecutiveSponsor),
      renewalDate: toIsoDate(r.RenewalDate),
      contractValue: toNum(r.ContractValue),
      plan: (toStr(r.Plan) || 'Growth') as Customer['plan'],
      activeProjects: toNum(r.ActiveProjects),
      teamSize: toNum(r.TeamSize),
      techStack: toList(r.TechStack),
      healthScore: toNum(r.HealthScore),
      healthIndicators: [],
      readinessScore: toNum(r.ReadinessScore),
      readinessDimensions: [],
      nps: toNum(r.NPS),
      csat: toNum(r.CSAT),
      financials: [],
      ltv: {
        currentAnnualRevenue: 0,
        expectedRenewalRevenue: 0,
        crossSellOpportunity: 0,
        upsellOpportunity: 0,
        expectedLifetimeYears: 0,
        averageAnnualSpend: 0,
        expansionProbability: 0,
        predictedLtv: 0,
        acquisitionCost: 0,
        paybackMonths: 0,
        ltvTrend: [],
      },
      journey: [],
      contacts: [],
      expansionProducts: [],
      qbrs: [],
      hasReferenceAgreement: toBool(r.HasReferenceAgreement),
    })
  }

  function withCustomer(id: unknown, fn: (c: Customer) => void) {
    const key = toStr(id)
    const c = byCustomer.get(key)
    if (!c) return // silently skip rows referencing an unknown CustomerID
    fn(c)
  }

  for (const r of rows(wb, SHEETS.HEALTH_INDICATORS)) {
    withCustomer(r.CustomerID, (c) => c.healthIndicators.push({ label: toStr(r.Label), score: toNum(r.Score) }))
  }

  for (const r of rows(wb, SHEETS.READINESS_DIMENSIONS)) {
    withCustomer(r.CustomerID, (c) => c.readinessDimensions.push({ label: toStr(r.Label), score: toNum(r.Score) }))
  }

  for (const r of rows(wb, SHEETS.FINANCIALS)) {
    withCustomer(r.CustomerID, (c) =>
      c.financials.push({
        period: toStr(r.Period),
        recurringRevenue: toNum(r.RecurringRevenue),
        projectRevenue: toNum(r.ProjectRevenue),
        cloudRevenue: toNum(r.CloudRevenue),
        supportRevenue: toNum(r.SupportRevenue),
        developerCost: toNum(r.DeveloperCost),
        deliveryCost: toNum(r.DeliveryCost),
        supportCost: toNum(r.SupportCost),
        infrastructureCost: toNum(r.InfrastructureCost),
        travelCost: toNum(r.TravelCost),
        salesCost: toNum(r.SalesCost),
        successCost: toNum(r.SuccessCost),
        cloudCost: toNum(r.CloudCost),
      }),
    )
  }

  for (const r of rows(wb, SHEETS.LTV)) {
    withCustomer(r.CustomerID, (c) => {
      c.ltv.currentAnnualRevenue = toNum(r.CurrentAnnualRevenue)
      c.ltv.expectedRenewalRevenue = toNum(r.ExpectedRenewalRevenue)
      c.ltv.crossSellOpportunity = toNum(r.CrossSellOpportunity)
      c.ltv.upsellOpportunity = toNum(r.UpsellOpportunity)
      c.ltv.expectedLifetimeYears = toNum(r.ExpectedLifetimeYears)
      c.ltv.averageAnnualSpend = toNum(r.AverageAnnualSpend)
      c.ltv.expansionProbability = toNum(r.ExpansionProbability)
      c.ltv.predictedLtv = toNum(r.PredictedLTV)
      c.ltv.acquisitionCost = toNum(r.AcquisitionCost)
      c.ltv.paybackMonths = toNum(r.PaybackMonths)
    })
  }

  for (const r of rows(wb, SHEETS.LTV_TREND)) {
    withCustomer(r.CustomerID, (c) => c.ltv.ltvTrend.push({ period: toStr(r.Period), value: toNum(r.Value) }))
  }

  for (const r of rows(wb, SHEETS.JOURNEY)) {
    withCustomer(r.CustomerID, (c) => {
      const event: JourneyEvent = {
        stage: toStr(r.Stage) as JourneyStage,
        date: toIsoDate(r.Date),
        status: (toStr(r.Status) || 'upcoming') as JourneyEvent['status'],
      }
      const note = toStr(r.Note)
      if (note) event.note = note
      c.journey.push(event)
    })
  }

  for (const r of rows(wb, SHEETS.CONTACTS)) {
    withCustomer(r.CustomerID, (c) => {
      const contact: Contact = {
        id: toStr(r.ContactID) || `${c.id}-contact-${c.contacts.length}`,
        name: toStr(r.Name),
        title: toStr(r.Title),
        role: toStr(r.Role) as ContactRole,
        relationshipStrength: toNum(r.RelationshipStrength),
        lastContact: toIsoDate(r.LastContact),
        email: toStr(r.Email),
      }
      c.contacts.push(contact)
    })
  }

  for (const r of rows(wb, SHEETS.EXPANSION_PRODUCTS)) {
    withCustomer(r.CustomerID, (c) => {
      const product: ExpansionProduct = {
        name: toStr(r.ProductName),
        status: (toStr(r.Status) || 'not-using') as ExpansionProduct['status'],
        crossSellScore: toOptionalNum(r.CrossSellScore),
        upsellScore: toOptionalNum(r.UpsellScore),
      }
      c.expansionProducts.push(product)
    })
  }

  for (const r of rows(wb, SHEETS.QBRS)) {
    withCustomer(r.CustomerID, (c) => {
      const qbr: QbrRecord = {
        id: toStr(r.QbrID) || `${c.id}-qbr-${c.qbrs.length}`,
        customerId: c.id,
        quarter: toStr(r.Quarter),
        date: toIsoDate(r.Date),
        status: (toStr(r.Status) || 'Not Scheduled') as QbrRecord['status'],
        attendees: toList(r.Attendees),
      }
      const summary = toStr(r.Summary)
      if (summary) qbr.summary = summary
      c.qbrs.push(qbr)
    })
  }

  const tasks: Task[] = []
  for (const r of rows(wb, SHEETS.TASKS)) {
    if (!knownIds.has(toStr(r.CustomerID))) continue
    const t: Task = {
      id: toStr(r.TaskID) || `task-${tasks.length}`,
      customerId: toStr(r.CustomerID),
      title: toStr(r.Title),
      team: (toStr(r.Team) || 'Customer Success') as TaskOwnerTeam,
      priority: (toStr(r.Priority) || 'Medium') as TaskPriority,
      status: (toStr(r.Status) || 'Not Started') as TaskStatus,
      dueDate: toIsoDate(r.DueDate),
      source: (toStr(r.Source) || 'Playbook') as Task['source'],
    }
    const reason = toStr(r.Reason)
    if (reason) t.reason = reason
    tasks.push(t)
  }

  const testimonials: Testimonial[] = []
  for (const r of rows(wb, SHEETS.TESTIMONIALS)) {
    if (!knownIds.has(toStr(r.CustomerID))) continue
    testimonials.push({
      id: toStr(r.TestimonialID) || `testimonial-${testimonials.length}`,
      customerId: toStr(r.CustomerID),
      type: (toStr(r.Type) || 'Written') as TestimonialType,
      author: toStr(r.Author),
      role: toStr(r.Role),
      quote: toStr(r.Quote),
      date: toIsoDate(r.Date),
      isReferenceCustomer: toBool(r.IsReferenceCustomer),
    })
  }

  const playbookMap = new Map<number, Playbook>()
  for (const r of rows(wb, SHEETS.PLAYBOOKS)) {
    const level = toNum(r.Level) as Playbook['level']
    if (!playbookMap.has(level)) {
      playbookMap.set(level, { level, name: toStr(r.PlaybookName), tasks: [] })
    }
    const task = toStr(r.Task)
    if (task) playbookMap.get(level)!.tasks.push(task)
  }
  const playbooks = [...playbookMap.values()].sort((a, b) => a.level - b.level)

  const aiTaskRules: AiTaskRule[] = rows(wb, SHEETS.AI_TASK_RULES)
    .map((r) => ({ trigger: toStr(r.Trigger), generatedTask: toStr(r.GeneratedTask) }))
    .filter((r) => r.trigger && r.generatedTask)

  return { customers: [...byCustomer.values()], tasks, testimonials, playbooks, aiTaskRules }
}
