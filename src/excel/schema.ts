/**
 * Single source of truth for the master workbook's shape.
 * The generator script (scripts/generate-excel.mts) and the browser-side
 * parser (src/excel/parseWorkbook.ts) both import this so the two can
 * never drift out of sync.
 */

export const SHEETS = {
  README: 'ReadMe',
  CUSTOMERS: 'Customers',
  HEALTH_INDICATORS: 'HealthIndicators',
  READINESS_DIMENSIONS: 'ReadinessDimensions',
  FINANCIALS: 'Financials',
  LTV: 'LTV',
  LTV_TREND: 'LTVTrend',
  JOURNEY: 'Journey',
  TASKS: 'Tasks',
  CONTACTS: 'Contacts',
  EXPANSION_PRODUCTS: 'ExpansionProducts',
  QBRS: 'QBRs',
  TESTIMONIALS: 'Testimonials',
  PLAYBOOKS: 'Playbooks',
  AI_TASK_RULES: 'AITaskRules',
} as const

/** Column headers, in order, for every sheet except ReadMe (which is free-form text). */
export const COLUMNS = {
  [SHEETS.CUSTOMERS]: [
    'CustomerID', 'Name', 'Industry', 'Geography', 'CustomerSince',
    'AccountOwner', 'DeliveryManager', 'CSM', 'SalesOwner', 'TechnicalSPOC', 'ExecutiveSponsor',
    'RenewalDate', 'ContractValue', 'Plan', 'ActiveProjects', 'TeamSize', 'TechStack',
    'HealthScore', 'NPS', 'CSAT', 'ReadinessScore', 'HasReferenceAgreement',
  ],
  [SHEETS.HEALTH_INDICATORS]: ['CustomerID', 'Label', 'Score'],
  [SHEETS.READINESS_DIMENSIONS]: ['CustomerID', 'Label', 'Score'],
  [SHEETS.FINANCIALS]: [
    'CustomerID', 'Period',
    'RecurringRevenue', 'ProjectRevenue', 'CloudRevenue', 'SupportRevenue',
    'DeveloperCost', 'DeliveryCost', 'SupportCost', 'InfrastructureCost', 'TravelCost',
    'SalesCost', 'SuccessCost', 'CloudCost',
  ],
  [SHEETS.LTV]: [
    'CustomerID', 'CurrentAnnualRevenue', 'ExpectedRenewalRevenue', 'CrossSellOpportunity',
    'UpsellOpportunity', 'ExpectedLifetimeYears', 'AverageAnnualSpend', 'ExpansionProbability',
    'PredictedLTV', 'AcquisitionCost', 'PaybackMonths',
  ],
  [SHEETS.LTV_TREND]: ['CustomerID', 'Period', 'Value'],
  [SHEETS.JOURNEY]: ['CustomerID', 'Stage', 'Date', 'Status', 'Note'],
  [SHEETS.TASKS]: ['TaskID', 'CustomerID', 'Title', 'Team', 'Priority', 'Status', 'DueDate', 'Source', 'Reason'],
  [SHEETS.CONTACTS]: ['ContactID', 'CustomerID', 'Name', 'Title', 'Role', 'RelationshipStrength', 'LastContact', 'Email'],
  [SHEETS.EXPANSION_PRODUCTS]: ['CustomerID', 'ProductName', 'Status', 'CrossSellScore', 'UpsellScore'],
  [SHEETS.QBRS]: ['QbrID', 'CustomerID', 'Quarter', 'Date', 'Status', 'Attendees', 'Summary'],
  [SHEETS.TESTIMONIALS]: ['TestimonialID', 'CustomerID', 'Type', 'Author', 'Role', 'Quote', 'Date', 'IsReferenceCustomer'],
  [SHEETS.PLAYBOOKS]: ['Level', 'PlaybookName', 'Task'],
  [SHEETS.AI_TASK_RULES]: ['Trigger', 'GeneratedTask'],
} as const

export const REQUIRED_SHEETS: string[] = Object.values(SHEETS).filter((s) => s !== SHEETS.README)
