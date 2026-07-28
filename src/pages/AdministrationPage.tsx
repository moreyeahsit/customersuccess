import { Check, X, ShieldCheck, Link2, FileSpreadsheet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Pill } from '@/components/ui/HealthBadge'
import { useRole } from '@/context/RoleContext'
import { useDataSource } from '@/context/DataSourceContext'
import { ROLES } from '@/types/rbac'
import { EXCEL_SHARE_URL } from '@/excel/msalConfig'

const PERMISSION_COLUMNS: { key: 'canViewFinancials' | 'canViewAllCustomers' | 'canManageTasks' | 'canManageAdmin'; label: string }[] = [
  { key: 'canViewFinancials', label: 'View Financials' },
  { key: 'canViewAllCustomers', label: 'View All Customers' },
  { key: 'canManageTasks', label: 'Manage Tasks' },
  { key: 'canManageAdmin', label: 'Manage Admin' },
]

const INTEGRATIONS = [
  'CRM (QuikCRM)',
  'QuikTrack',
  'QuikFinance',
  'QuikHelpdesk',
  'QuikMeet',
  'Microsoft Teams',
  'Zoom',
  'Outlook',
  'Google Workspace',
  'SharePoint',
  'Power BI',
  'Slack',
  'HubSpot',
  'Salesforce',
  'Jira',
  'Freshdesk',
  'Azure DevOps',
]

const NFR_ITEMS = [
  'Multi-tenant SaaS architecture',
  'Responsive, mobile-first design',
  'Real-time dashboards (<2s refresh)',
  'AI-generated insights',
  'Audit trail',
  'RBAC, SSO, and MFA',
  'API-first architecture',
  'Workflow automation engine',
  'Notification center',
  'Export to PDF, PowerPoint, and Excel',
  'Activity timeline',
  'Scale to 100k+ customers',
]

const STATUS_META: Record<string, { label: string; tone: 'good' | 'warn' | 'bad' | 'brand' | 'neutral' }> = {
  local: { label: 'Local sample data', tone: 'neutral' },
  'signed-out': { label: 'Signed out', tone: 'warn' },
  loading: { label: 'Syncing…', tone: 'brand' },
  ready: { label: 'Connected', tone: 'good' },
  error: { label: 'Sync failed', tone: 'bad' },
}

export function AdministrationPage() {
  const { role, permissions } = useRole()
  const ds = useDataSource()
  const statusMeta = STATUS_META[ds.status]

  return (
    <div>
      <PageHeader title="Administration" subtitle="Roles, permissions, and platform configuration" />

      <Card className="mb-6">
        <CardHeader
          title="Data Source"
          subtitle="Where this portal's data comes from"
          action={<Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>}
        />
        {!ds.configured ? (
          <>
            <p className="text-sm text-slate-600">
              This deployment is running on the bundled sample data — no SharePoint/OneDrive connection is configured.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              To connect a live workbook, set <code className="rounded bg-slate-100 px-1 py-0.5">VITE_MSAL_CLIENT_ID</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">VITE_MSAL_TENANT_ID</code>, and{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">VITE_EXCEL_SHARE_URL</code> (see <code className="rounded bg-slate-100 px-1 py-0.5">.env.example</code> and{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">SETUP.md</code>) and redeploy.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Signed-in users read a shared Excel workbook via Microsoft Graph — no backend server is involved, and the app
              only ever requests read access to files already shared with the signed-in account.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
              {EXCEL_SHARE_URL ? (
                <a href={EXCEL_SHARE_URL} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                  Open the source workbook
                </a>
              ) : (
                <span>No workbook link configured</span>
              )}
              {ds.lastSynced && <span>· Last synced {ds.lastSynced.toLocaleString()}</span>}
            </div>
            {ds.status === 'error' && ds.errorMessage && (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-bad-50 p-2 text-xs text-bad-700">{ds.errorMessage}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => ds.refresh()}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
              >
                Sync now
              </button>
              {ds.status !== 'signed-out' && (
                <button
                  onClick={() => ds.signOut()}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Sign out
                </button>
              )}
            </div>
          </>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader
          title="Current Viewing Role"
          subtitle="Demo-only client-side role switch — not real authentication"
          action={<Pill tone="brand">{role}</Pill>}
        />
        <p className="text-sm text-slate-600">{permissions.description}</p>
        <p className="mt-1 text-xs text-slate-500">Scope: {permissions.scope}</p>
        <p className="mt-3 text-xs text-slate-400">
          This role is switched entirely in the browser for demo purposes (also available via the avatar menu, top right) and does not
          reflect a real login, session, or backend authorization check.
        </p>
      </Card>

      <Card className="mb-6" padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Roles &amp; Permissions" subtitle="All roles defined in this prototype's RBAC model" />
        </div>
        <div className="overflow-x-auto p-5 pt-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Scope</th>
                {PERMISSION_COLUMNS.map((col) => (
                  <th key={col.key} className="py-2 pr-3 text-center">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.role} className={`border-t border-slate-100 ${r.role === role ? 'bg-brand-50/50' : ''}`}>
                  <td className="py-3 pr-3 font-medium text-slate-800">{r.role}</td>
                  <td className="py-3 pr-3 text-slate-600">{r.description}</td>
                  <td className="py-3 pr-3 text-slate-500">{r.scope}</td>
                  {PERMISSION_COLUMNS.map((col) => (
                    <td key={col.key} className="py-3 pr-3 text-center">
                      {r[col.key] ? (
                        <Check className="mx-auto h-4 w-4 text-good-700" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mb-6">
        <CardHeader title="Integrations" subtitle="Target integration surface from the platform PRD" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {INTEGRATIONS.map((name) => {
            const isSharePointLive = name === 'SharePoint' && ds.configured && ds.status !== 'error'
            return (
              <div key={name} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-3">
                <div className="flex items-center gap-2">
                  <Link2 className={`h-4 w-4 shrink-0 ${isSharePointLive ? 'text-good-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-medium text-slate-700">{name}</div>
                    <div className={`text-[11px] ${isSharePointLive ? 'text-good-700' : 'text-slate-400'}`}>
                      {isSharePointLive ? 'Connected (live data source)' : 'Not connected'}
                    </div>
                  </div>
                </div>
                <button
                  disabled
                  title={isSharePointLive ? 'Managed via the Data Source panel above' : 'Connecting integrations is not available in this prototype'}
                  className={`h-5 w-9 shrink-0 cursor-not-allowed rounded-full p-0.5 ${isSharePointLive ? 'bg-good-500' : 'bg-slate-200'}`}
                >
                  <span className="block h-4 w-4 rounded-full bg-white shadow" />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Non-Functional Requirements"
          subtitle="Target-state platform architecture from the PRD — not yet implemented in this frontend prototype"
        />
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {NFR_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-300" />
              {item}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          This checklist reflects the target architecture described in the product requirements — it is a planning reference, not a
          status report on what this frontend currently does.
        </p>
      </Card>
    </div>
  )
}
