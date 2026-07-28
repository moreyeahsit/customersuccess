import type { Configuration } from '@azure/msal-browser'

export const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID
export const MSAL_TENANT_ID = import.meta.env.VITE_MSAL_TENANT_ID
export const EXCEL_SHARE_URL = import.meta.env.VITE_EXCEL_SHARE_URL

/** True once all three required env vars are set — gates whether the app runs in "live" or "local sample data" mode. */
export const LIVE_DATA_CONFIGURED = Boolean(MSAL_CLIENT_ID && MSAL_TENANT_ID && EXCEL_SHARE_URL)

export const GRAPH_SCOPES = ['Files.Read']

const redirectBase = (import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin).replace(/\/$/, '')

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID ?? '',
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID ?? 'common'}`,
    // Popup/silent flows load this URL in a transient window — keep it a blank
    // static page (public/auth-redirect.html) so the app never re-mounts there.
    // Pointing this at the app's own root causes MSAL's "block_nested_popups"
    // error once the app's own auth logic boots inside the popup itself.
    redirectUri: `${redirectBase}/auth-redirect.html`,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}
