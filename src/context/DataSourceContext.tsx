import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { MsalProvider, useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from '@azure/msal-browser'
import { LIVE_DATA_CONFIGURED, EXCEL_SHARE_URL, GRAPH_SCOPES } from '@/excel/msalConfig'
import { msalInstance, ensureMsalReady } from '@/excel/msalInstance'
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
const SYNC_TIMEOUT_MS = 25 * 1000

/** Guarantees refresh() always settles — a hung fetch would otherwise leave refreshingRef
 * stuck forever, silently no-op'ing every future "Sync now" click with no visible error. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s — check your connection and try again.`)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

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
  // Sign-in uses a full-page redirect (see msalConfig.ts) — until the app has
  // processed a possible pending redirect response on this load, we don't yet
  // know the real auth state, so treat it as loading rather than flashing
  // "signed-out" incorrectly.
  const [msalReady, setMsalReady] = useState(false)
  const [status, setStatus] = useState<DataSourceStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const hasAccount = accounts.length > 0
  const refreshingRef = useRef(false)

  useEffect(() => {
    ensureMsalReady()
      .then(() => setMsalReady(true))
      .catch((err) => {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : String(err))
        setMsalReady(true)
      })
  }, [])

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
      await withTimeout(
        (async () => {
          const account = accounts[0]
          let token
          try {
            token = await instance.acquireTokenSilent({ scopes: GRAPH_SCOPES, account })
          } catch (err) {
            if (err instanceof InteractionRequiredAuthError) {
              // Navigates away — execution picks back up via ensureMsalReady()
              // processing the redirect response on the next page load.
              await instance.acquireTokenRedirect({ scopes: GRAPH_SCOPES, account })
              return
            }
            throw err
          }
          const buffer = await downloadSharedWorkbook(EXCEL_SHARE_URL!, token.accessToken)
          const parsed = parseWorkbook(buffer)
          applyParsedData(parsed)
          setLastSynced(new Date())
          setDataVersion((v) => v + 1)
          setStatus('ready')
        })(),
        SYNC_TIMEOUT_MS,
        'Sync',
      )
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
      await ensureMsalReady()
      await instance.loginRedirect({ scopes: GRAPH_SCOPES })
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }, [instance])

  const signOut = useCallback(() => {
    instance.logoutRedirect().catch(() => {})
  }, [instance])

  useEffect(() => {
    if (!msalReady) return
    if (hasAccount) refresh()
    else setStatus('signed-out')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msalReady, hasAccount])

  useEffect(() => {
    if (!hasAccount) return
    const id = window.setInterval(() => refresh(), AUTO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [hasAccount, refresh])

  const value: DataSourceContextValue = {
    configured: true,
    status: msalReady ? status : 'loading',
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
