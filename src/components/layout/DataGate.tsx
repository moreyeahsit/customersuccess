import type { ReactNode } from 'react'
import { Sparkles, Loader2, AlertTriangle, ShieldCheck, HeartPulse, BarChart3, Lock } from 'lucide-react'
import { useDataSource } from '@/context/DataSourceContext'

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}

function MicrosoftSignInButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
    >
      <MicrosoftLogo />
      Sign in with Microsoft
    </button>
  )
}

const FEATURES = [
  { icon: HeartPulse, text: 'Track health, readiness, and renewal risk across every account' },
  { icon: Sparkles, text: 'Ask the AI Copilot portfolio questions and get instant answers' },
  { icon: BarChart3, text: 'Real-time margin, LTV, and expansion analytics' },
]

function SplitShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-navy-950 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold">Vantage</div>
            <div className="text-xs text-white/60">by Moreyeahs</div>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-semibold leading-snug">
            Your customer success command center.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            One place to see every account's health, readiness, and revenue — kept in sync with your team's own
            SharePoint data.
          </p>
          <ul className="mt-8 space-y-4">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-sm text-white/85">
                <f.icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-white/70" />
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-xs text-white/50">Moreyeahs · Vantage Platform · v1.0 PRD</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}

function MobileBrand() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
        <Sparkles className="h-4.5 w-4.5" />
      </div>
      <div className="text-left leading-tight">
        <div className="text-base font-semibold text-slate-800">Vantage</div>
        <div className="text-[11px] text-slate-400">by Moreyeahs</div>
      </div>
    </div>
  )
}

function SignInScreen() {
  const { signIn } = useDataSource()
  return (
    <SplitShell>
      <MobileBrand />
      <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">
        Sign in with your Microsoft 365 account to load live customer data from your team's shared workbook.
      </p>

      <div className="mt-7">
        <MicrosoftSignInButton onClick={signIn} />
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-lg bg-slate-100/70 p-3 text-xs text-slate-500">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        The app never sees your password, and only requests read access to files already shared with you.
      </div>
    </SplitShell>
  )
}

function LoadingScreen() {
  return (
    <SplitShell>
      <MobileBrand />
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-brand-500" />
        <h1 className="text-xl font-semibold text-slate-800">Loading your data…</h1>
        <p className="mt-2 text-sm text-slate-500">Downloading and reading the workbook from SharePoint. This is usually quick.</p>
      </div>
    </SplitShell>
  )
}

function ErrorScreen() {
  const { errorMessage, refresh, signOut } = useDataSource()
  return (
    <SplitShell>
      <MobileBrand />
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <AlertTriangle className="mb-3 h-8 w-8 text-bad-500" />
        <h1 className="text-xl font-semibold text-slate-800">Couldn't load the workbook</h1>
        <p className="mt-2 w-full whitespace-pre-wrap break-words rounded-lg bg-bad-50 p-3 text-left text-xs text-bad-700">
          {errorMessage}
        </p>
        <div className="mt-6 flex w-full gap-2">
          <button
            onClick={() => refresh()}
            className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Try again
          </button>
          <button
            onClick={signOut}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
        <div className="mt-6 flex items-start gap-2 text-xs text-slate-400">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          If this keeps happening, check that your account has access to the workbook in SharePoint/OneDrive.
        </div>
      </div>
    </SplitShell>
  )
}

export function DataGate({ children }: { children: ReactNode }) {
  const ds = useDataSource()

  // Only gate the *first* load. Once data has synced at least once, keep the
  // app mounted through subsequent background refreshes/errors — those are
  // surfaced as a small status badge (see Topbar) instead of blocking the UI.
  if (ds.configured && ds.dataVersion === 0) {
    if (ds.status === 'signed-out') return <SignInScreen />
    if (ds.status === 'loading') return <LoadingScreen />
    if (ds.status === 'error') return <ErrorScreen />
  }

  return <>{children}</>
}
