import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { MsalProvider, useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { LIVE_DATA_CONFIGURED, EXCEL_SHARE_URL, GRAPH_SCOPES } from '@/excel/msalConfig'
import { msalInstance, ensureMsalInitialized } from '@/excel/msalInstance'
import { downloadSharedWorkbook } from '@/excel/graphDownload'
import { parseWorkbook } from '@/excel/parseWorkbook'
import { applyParsedData } from '@/excel/liveData'

export type DataSourceStatus = 'local' | 'signed-out' | 'loading' | 'ready' | 'error'

export interface DataSourceContextValue {
  /** Whether the app was built with Azure AD + Excel share URL configured at all. */
  configured: boolean
  status: DataSourceStatus
  errorMessage: string | null
  lastSynced: Date | null
  /** Bumped on every successful sync — pages key off this to force a fresh read of the (reassigned) data module exports. */
  dataVersion: number
  signIn: () => Promise<void>
  signOut: () => void
  refresh: () => Promise<void>
}

const DataSourceContext = createContext<DataSourceContextValue | null>(null)

export function useDataSource(): DataSourceContextValue {
  const ctx = useContext(DataSourceContext)
  if (!ctx) throw new Error('useDataSource must be used within DataSourceProvider')
  return ctx
}

const AUTO_REFRESH_MS = 5 * 60 * 1000

function LocalDataSourceProvider({ children }: { children: ReactNode }) {
  const value: DataSourceContextValue = {
    configured: false,
    status: 'local',
    errorMessage: null,
    lastSynced: null,
    dataVersion: 0,
    signIn: async () => {},
    signOut: () => {},
    refresh: async () => {},
  }
  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

function LiveDataSourceProvider({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal()
  const [status, setStatus] = useState<DataSourceStatus>('signed-out')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const hasAccount = accounts.length > 0
  const refreshingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return
    if (accounts.length === 0) {
      setStatus('signed-out')
      return
    }
    refreshingRef.current = true
    setStatus('loading')
    setErrorMessage(null)
    try {
      await ensureMsalInitialized()
      const account = accounts[0]
      let token
      try {
        token = await instance.acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          token = await instance.acquireTokenPopup({ scopes: GRAPH_SCOPES, account })
        } else {
          throw err
        }
      }
      const buffer = await downloadSharedWorkbook(EXCEL_SHARE_URL!, token.accessToken)
      const parsed = parseWorkbook(buffer)
      applyParsedData(parsed)
      setLastSynced(new Date())
      setDataVersion((v) => v + 1)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      refreshingRef.current = false
    }
  }, [accounts, instance])

  const signIn = useCallback(async () => {
    setErrorMessage(null)
    try {
      await ensureMsalInitialized()
      await instance.loginPopup({ scopes: GRAPH_SCOPES })
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }, [instance])

  const signOut = useCallback(() => {
    instance.logoutPopup().catch(() => {})
  }, [instance])

  useEffect(() => {
    if (hasAccount) refresh()
    else setStatus('signed-out')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccount])

  useEffect(() => {
    if (!hasAccount) return
    const id = window.setInterval(() => refresh(), AUTO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [hasAccount, refresh])

  const value: DataSourceContextValue = {
    configured: true,
    status,
    errorMessage,
    lastSynced,
    dataVersion,
    signIn,
    signOut,
    refresh,
  }
  return <DataSourceContext.Provider value={value}>{children}</DataSourceContext.Provider>
}

export function DataSourceProvider({ children }: { children: ReactNode }) {
  if (!LIVE_DATA_CONFIGURED || !msalInstance) {
    return <LocalDataSourceProvider>{children}</LocalDataSourceProvider>
  }
  return (
    <MsalProvider instance={msalInstance}>
      <LiveDataSourceProvider>{children}</LiveDataSourceProvider>
    </MsalProvider>
  )
}
