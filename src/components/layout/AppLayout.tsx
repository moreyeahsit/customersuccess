import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useDataSource } from '@/context/DataSourceContext'

export function AppLayout() {
  const { dataVersion } = useDataSource()
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet key={dataVersion} />
        </main>
      </div>
    </div>
  )
}
