import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useDataSource } from '@/context/DataSourceContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function AppLayout() {
  const { dataVersion } = useDataSource()
  const location = useLocation()
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Keyed on route + data version so a crash on one page doesn't stick around
              after navigating elsewhere or after a fresh sync fixes the underlying data. */}
          <ErrorBoundary compact key={`${location.pathname}:${dataVersion}`}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
