export type Role =
  | 'CEO'
  | 'Customer Success Director'
  | 'Customer Success Manager'
  | 'Delivery Manager'
  | 'Finance'
  | 'Sales / Account Manager'
  | 'Executive Sponsor'

export interface RolePermissions {
  role: Role
  description: string
  canViewFinancials: boolean
  canViewAllCustomers: boolean
  canManageTasks: boolean
  canManageAdmin: boolean
  scope: string
}

export const ROLES: RolePermissions[] = [
  {
    role: 'CEO',
    description: 'Full visibility across all customers and financials.',
    canViewFinancials: true,
    canViewAllCustomers: true,
    canManageTasks: true,
    canManageAdmin: true,
    scope: 'All customers, all portfolios',
  },
  {
    role: 'Customer Success Director',
    description: 'Manage teams, KPIs, renewals, and customer portfolio.',
    canViewFinancials: true,
    canViewAllCustomers: true,
    canManageTasks: true,
    canManageAdmin: true,
    scope: 'All customers, team performance',
  },
  {
    role: 'Customer Success Manager',
    description: 'Manage assigned customers, tasks, playbooks, and communications.',
    canViewFinancials: false,
    canViewAllCustomers: false,
    canManageTasks: true,
    canManageAdmin: false,
    scope: 'Assigned customers only',
  },
  {
    role: 'Delivery Manager',
    description: 'View delivery health, projects, SLAs, and resource utilization.',
    canViewFinancials: false,
    canViewAllCustomers: true,
    canManageTasks: true,
    canManageAdmin: false,
    scope: 'Delivery & project data across customers',
  },
  {
    role: 'Finance',
    description: 'Access customer P&L, invoices, margins, and profitability metrics.',
    canViewFinancials: true,
    canViewAllCustomers: true,
    canManageTasks: false,
    canManageAdmin: false,
    scope: 'Financial data across all customers',
  },
  {
    role: 'Sales / Account Manager',
    description: 'Manage renewals, upsell opportunities, and account growth.',
    canViewFinancials: false,
    canViewAllCustomers: true,
    canManageTasks: true,
    canManageAdmin: false,
    scope: 'Renewals & expansion pipeline',
  },
  {
    role: 'Executive Sponsor',
    description: 'View strategic account summaries and executive reports.',
    canViewFinancials: true,
    canViewAllCustomers: true,
    canManageTasks: false,
    canManageAdmin: false,
    scope: 'Strategic accounts, read-only',
  },
]

export function permissionsFor(role: Role): RolePermissions {
  return ROLES.find((r) => r.role === role) ?? ROLES[2]
}
