/**
 * One-off generator: dumps the app's current sample data into the master
 * workbook shape defined in src/excel/schema.ts, so the Excel template
 * ships with realistic, internally-consistent sample data instead of
 * empty sheets.
 *
 * Run with: npx tsx scripts/generate-excel.mts
 */
import * as XLSX from 'xlsx'
import { writeFileSync } from 'node:fs'
import { CUSTOMERS, ALL_TASKS, ALL_TESTIMONIALS } from '../src/data/customers'
import { PLAYBOOKS } from '../src/data/playbooks'
import { AI_TASK_RULES } from '../src/data/aiTaskRules'
import { SHEETS, COLUMNS } from '../src/excel/schema'

function toDateOnly(iso: string) {
  return iso.slice(0, 10)
}

function sheetFromRows(headers: readonly string[], rows: (string | number | boolean)[][]) {
  return XLSX.utils.aoa_to_sheet([[...headers], ...rows])
}

const wb = XLSX.utils.book_new()

// --- ReadMe -----------------------------------------------------------
const readmeLines = [
  ['Vantage — Master Data Workbook'],
  [''],
  ['This workbook is the live data source for the Vantage Customer Success Portal.'],
  ['Edit any sheet below and the app picks up the change the next time it syncs (auto every'],
  ['few minutes, or immediately via the "Refresh" button in the app).'],
  [''],
  ['Rules that keep the app working correctly:'],
  ['  1. Do not rename any sheet (tab) — the app looks them up by exact name.'],
  ['  2. Do not rename, reorder, or delete columns in row 1 of any sheet — add new columns'],
  ['     to the right if you need extra notes; the app ignores columns it does not recognize.'],
  ['  3. CustomerID must match exactly across every sheet that references a customer.'],
  ['  4. Dates should be entered as YYYY-MM-DD text or real Excel dates — both are accepted.'],
  ['  5. TRUE/FALSE columns accept TRUE, FALSE, YES, NO, 1, 0 (case-insensitive).'],
  [''],
  ['Sheet-by-sheet guide:'],
  ['  Customers            One row per customer — core profile, health score, readiness score, NPS/CSAT.'],
  ['  HealthIndicators     Long format: one row per (CustomerID, indicator label, score 0-100).'],
  ['  ReadinessDimensions  Long format: one row per (CustomerID, dimension label, score 0-100).'],
  ['  Financials           One row per (CustomerID, quarter) — revenue and cost line items.'],
  ['  LTV                  One row per customer — lifetime value figures.'],
  ['  LTVTrend             Long format: one row per (CustomerID, quarter, predicted LTV value).'],
  ['  Journey              Long format: one row per (CustomerID, lifecycle stage) with date and status.'],
  ['  Tasks                One row per task, across all customers.'],
  ['  Contacts             One row per stakeholder contact per customer.'],
  ['  ExpansionProducts    Long format: one row per (CustomerID, product) cross-sell/upsell scoring.'],
  ['  QBRs                 One row per quarterly business review per customer.'],
  ['  Testimonials         One row per testimonial/advocacy asset collected.'],
  ['  Playbooks            Long format: one row per (readiness level, task) in that level\'s playbook.'],
  ['  AITaskRules          One row per automation rule (trigger -> generated task).'],
]
const readmeSheet = XLSX.utils.aoa_to_sheet(readmeLines)
readmeSheet['!cols'] = [{ wch: 100 }]
XLSX.utils.book_append_sheet(wb, readmeSheet, SHEETS.README)

// --- Customers ----------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.CUSTOMERS],
    CUSTOMERS.map((c) => [
      c.id, c.name, c.industry, c.geography, toDateOnly(c.customerSince),
      c.accountOwner, c.deliveryManager, c.csm, c.salesOwner, c.technicalSpoc, c.executiveSponsor,
      toDateOnly(c.renewalDate), c.contractValue, c.plan, c.activeProjects, c.teamSize, c.techStack.join(', '),
      c.healthScore, c.nps, c.csat, c.readinessScore, c.hasReferenceAgreement,
    ]),
  ),
  SHEETS.CUSTOMERS,
)

// --- HealthIndicators -----------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.HEALTH_INDICATORS],
    CUSTOMERS.flatMap((c) => c.healthIndicators.map((h) => [c.id, h.label, h.score])),
  ),
  SHEETS.HEALTH_INDICATORS,
)

// --- ReadinessDimensions --------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.READINESS_DIMENSIONS],
    CUSTOMERS.flatMap((c) => c.readinessDimensions.map((r) => [c.id, r.label, r.score])),
  ),
  SHEETS.READINESS_DIMENSIONS,
)

// --- Financials -----------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.FINANCIALS],
    CUSTOMERS.flatMap((c) =>
      c.financials.map((f) => [
        c.id, f.period,
        f.recurringRevenue, f.projectRevenue, f.cloudRevenue, f.supportRevenue,
        f.developerCost, f.deliveryCost, f.supportCost, f.infrastructureCost, f.travelCost,
        f.salesCost, f.successCost, f.cloudCost,
      ]),
    ),
  ),
  SHEETS.FINANCIALS,
)

// --- LTV --------------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.LTV],
    CUSTOMERS.map((c) => [
      c.id, c.ltv.currentAnnualRevenue, c.ltv.expectedRenewalRevenue, c.ltv.crossSellOpportunity,
      c.ltv.upsellOpportunity, c.ltv.expectedLifetimeYears, c.ltv.averageAnnualSpend, c.ltv.expansionProbability,
      c.ltv.predictedLtv, c.ltv.acquisitionCost, c.ltv.paybackMonths,
    ]),
  ),
  SHEETS.LTV,
)

// --- LTVTrend -----------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.LTV_TREND],
    CUSTOMERS.flatMap((c) => c.ltv.ltvTrend.map((t) => [c.id, t.period, t.value])),
  ),
  SHEETS.LTV_TREND,
)

// --- Journey ------------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.JOURNEY],
    CUSTOMERS.flatMap((c) => c.journey.map((j) => [c.id, j.stage, toDateOnly(j.date), j.status, j.note ?? ''])),
  ),
  SHEETS.JOURNEY,
)

// --- Tasks --------------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.TASKS],
    ALL_TASKS.map((t) => [
      t.id, t.customerId, t.title, t.team, t.priority, t.status, toDateOnly(t.dueDate), t.source, t.reason ?? '',
    ]),
  ),
  SHEETS.TASKS,
)

// --- Contacts -----------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.CONTACTS],
    CUSTOMERS.flatMap((c) =>
      c.contacts.map((ct) => [ct.id, c.id, ct.name, ct.title, ct.role, ct.relationshipStrength, toDateOnly(ct.lastContact), ct.email]),
    ),
  ),
  SHEETS.CONTACTS,
)

// --- ExpansionProducts ----------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.EXPANSION_PRODUCTS],
    CUSTOMERS.flatMap((c) =>
      c.expansionProducts.map((p) => [c.id, p.name, p.status, p.crossSellScore ?? '', p.upsellScore ?? '']),
    ),
  ),
  SHEETS.EXPANSION_PRODUCTS,
)

// --- QBRs -----------------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.QBRS],
    CUSTOMERS.flatMap((c) =>
      c.qbrs.map((q) => [q.id, c.id, q.quarter, toDateOnly(q.date), q.status, q.attendees.join(', '), q.summary ?? '']),
    ),
  ),
  SHEETS.QBRS,
)

// --- Testimonials -----------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.TESTIMONIALS],
    ALL_TESTIMONIALS.map((t) => [
      t.id, t.customerId, t.type, t.author, t.role, t.quote, toDateOnly(t.date), t.isReferenceCustomer,
    ]),
  ),
  SHEETS.TESTIMONIALS,
)

// --- Playbooks ----------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.PLAYBOOKS],
    PLAYBOOKS.flatMap((p) => p.tasks.map((task) => [p.level, p.name, task])),
  ),
  SHEETS.PLAYBOOKS,
)

// --- AITaskRules --------------------------------------------------------
XLSX.utils.book_append_sheet(
  wb,
  sheetFromRows(
    COLUMNS[SHEETS.AI_TASK_RULES],
    AI_TASK_RULES.map((r) => [r.trigger, r.generatedTask]),
  ),
  SHEETS.AI_TASK_RULES,
)

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
writeFileSync('excel-template/Vantage_Data.xlsx', buf)
console.log('Wrote excel-template/Vantage_Data.xlsx')
