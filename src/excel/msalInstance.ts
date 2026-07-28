import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, LIVE_DATA_CONFIGURED } from './msalConfig'

/** Only constructed when Azure AD env vars are present — see .env.example. */
export const msalInstance = LIVE_DATA_CONFIGURED ? new PublicClientApplication(msalConfig) : null

let readyPromise: Promise<void> | null = null

/**
 * Safe to call repeatedly — initializes MSAL and, on the page load that
 * follows a loginRedirect()/acquireTokenRedirect() round-trip, processes the
 * response so the resulting account lands in the cache before the app
 * decides what to render.
 */
export function ensureMsalReady(): Promise<void> {
  if (!msalInstance) return Promise.resolve()
  if (!readyPromise) {
    readyPromise = msalInstance
      .initialize()
      .then(() => msalInstance!.handleRedirectPromise())
      .then((result) => {
        if (result?.account) msalInstance!.setActiveAccount(result.account)
      })
  }
  return readyPromise
}
