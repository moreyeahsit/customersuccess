import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RoleProvider } from '@/context/RoleContext'
import { DataSourceProvider } from '@/context/DataSourceContext'
import { DataGate } from '@/components/layout/DataGate'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/layout/AppLayout'
import { ExecutiveDashboardPage } from '@/pages/ExecutiveDashboardPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { Customer360Page } from '@/pages/Customer360Page'
import { TasksPage } from '@/pages/TasksPage'
import { PlaybooksPage } from '@/pages/PlaybooksPage'
import { RenewalsPage } from '@/pages/RenewalsPage'
import { HealthCenterPage } from '@/pages/HealthCenterPage'
import { CustomerJourneyPage } from '@/pages/CustomerJourneyPage'
import { TestimonialsPage } from '@/pages/TestimonialsPage'
import { QbrPage } from '@/pages/QbrPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { FinancialPivotPage } from '@/pages/FinancialPivotPage'
import { AiCopilotPage } from '@/pages/AiCopilotPage'
import { AdministrationPage } from '@/pages/AdministrationPage'

function App() {
  return (
    <ErrorBoundary>
      <DataSourceProvider>
        <DataGate>
          <RoleProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<ExecutiveDashboardPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/customers/:id" element={<Customer360Page />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/playbooks" element={<PlaybooksPage />} />
                  <Route path="/renewals" element={<RenewalsPage />} />
                  <Route path="/health-center" element={<HealthCenterPage />} />
                  <Route path="/journey" element={<CustomerJourneyPage />} />
                  <Route path="/testimonials" element={<TestimonialsPage />} />
                  <Route path="/qbr" element={<QbrPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/financial-pivot" element={<FinancialPivotPage />} />
                  <Route path="/copilot" element={<AiCopilotPage />} />
                  <Route path="/admin" element={<AdministrationPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </RoleProvider>
        </DataGate>
      </DataSourceProvider>
    </ErrorBoundary>
  )
}

export default App
