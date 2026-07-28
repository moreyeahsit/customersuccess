import type { Configuration } from '@azure/msal-browser'

export const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID
export const MSAL_TENANT_ID = import.meta.env.VITE_MSAL_TENANT_ID
export const EXCEL_SHARE_URL = import.meta.env.VITE_EXCEL_SHARE_URL

/** True once all three required env vars are set — gates whether the app runs in "live" or "local sample data" mode. */
export const LIVE_DATA_CONFIGURED = Boolean(MSAL_CLIENT_ID && MSAL_TENANT_ID && EXCEL_SHARE_URL)

// Files.Read alone often isn't enough for files living in a SharePoint team
// site's document library (vs. personal OneDrive or an individually-shared
// file) — Files.Read.All and Sites.Read.All cover that case.
export const GRAPH_SCOPES = ['Files.Read.All', 'Sites.Read.All']

const redirectBase = (import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin).replace(/\/$/, '')

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID ?? 'common'}`,
    // Sign-in uses the full-page redirect flow (not popups) — popups are
    // fragile against modern browsers' cross-origin-opener-policy enforcement,
    // which can sever the popup↔opener link and leave MSAL's "interaction in
    // progress" lock stuck forever. Redirect just navigates back here directly.
    redirectUri: redirectBase,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}
