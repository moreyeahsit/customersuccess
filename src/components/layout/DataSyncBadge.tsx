import { Loader2, RefreshCw, AlertTriangle, HardDrive, CheckCircle2 } from 'lucide-react'
import { useDataSource } from '@/context/DataSourceContext'

function relativeTime(date: Date | null): string {
  if (!date) return ''
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  return `${hours}h ago`
}

export function DataSyncBadge() {
  const ds = useDataSource()

  if (!ds.configured) {
    return (
      <div
        className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 md:flex"
        title="No SharePoint/OneDrive connection configured — showing bundled sample data. See .env.example / SETUP.md."
      >
        <HardDrive className="h-3.5 w-3.5" />
        Local sample data
      </div>
    )
  }

  if (ds.status === 'loading') {
    return (
      <div className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 md:flex">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Syncing…
      </div>
    )
  }

  if (ds.status === 'error') {
    return (
      <button
        onClick={() => ds.refresh()}
        title={ds.errorMessage ?? 'Sync failed'}
        className="hidden items-center gap-1.5 rounded-full bg-bad-50 px-3 py-1.5 text-xs font-medium text-bad-700 hover:bg-bad-100 md:flex"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Sync failed — retry
      </button>
    )
  }

  if (ds.status === 'signed-out') {
    return (
      <button
        onClick={() => ds.signIn()}
        className="hidden items-center gap-1.5 rounded-full bg-warn-50 px-3 py-1.5 text-xs font-medium text-warn-700 hover:bg-warn-100 md:flex"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Signed out — sign in
      </button>
    )
  }

  return (
    <button
      onClick={() => ds.refresh()}
      title="Click to sync now"
      className="hidden items-center gap-1.5 rounded-full bg-good-50 px-3 py-1.5 text-xs font-medium text-good-700 hover:bg-good-100 md:flex"
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      Synced {relativeTime(ds.lastSynced)}
      <RefreshCw className="h-3 w-3 opacity-60" />
    </button>
  )
}
