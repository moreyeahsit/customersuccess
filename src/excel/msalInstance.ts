import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig, LIVE_DATA_CONFIGURED } from './msalConfig'

/** Only constructed when Azure AD env vars are present — see .env.example. */
export const msalInstance = LIVE_DATA_CONFIGURED ? new PublicClientApplication(msalConfig) : null

let initPromise: Promise<void> | null = null

/** Safe to call repeatedly — MSAL requires this before any other API call. */
export function ensureMsalInitialized(): Promise<void> {
  if (!msalInstance) return Promise.resolve()
  if (!initPromise) initPromise = msalInstance.initialize()
  return initPromise
}
