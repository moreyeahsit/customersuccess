# Connecting Vantage to a live Excel workbook on SharePoint/OneDrive

This app can run two ways:

- **Local sample data** (default, zero config) — the bundled mock data, exactly as before.
- **Live data** — reads a master Excel workbook hosted on SharePoint or OneDrive, via
  Microsoft Graph, with users signing in with their own Microsoft 365 account. There is
  no backend server / middleware involved — auth and the Graph calls happen entirely in
  the browser.

Switching to live data is just: upload the workbook, register an Azure AD app once, set
three environment variables, and rebuild.

## 0. Important limitation — read this first

**The app's role switcher (CEO / Finance / CSM / etc., top-right avatar menu and the
Administration page) is a UI demo only.** It changes what's *rendered*, not what data is
actually sent to the browser. Once the workbook is downloaded, all of it — including
financial data — is parsed client-side, in every signed-in user's browser, regardless of
which role they're "viewing as."

The **real** access boundary is whatever permissions you set on the Excel file itself in
SharePoint/OneDrive:

- If someone shouldn't see customer P&L or LTV data, don't give them read access to the
  workbook — full stop. The in-app role switcher will not stop them.
- If different teams should see different slices of data (e.g. Finance sees P&L, CS
  doesn't), you need separate workbooks with separate SharePoint permissions, not one
  shared file. That's a bigger change than what's described here — ask if you want that
  built out.

For now, treat this workbook as visible-to-everyone-who-can-sign-in.

## 1. Upload the workbook

1. Take `excel-template/Vantage_Data.xlsx` from this repo (it ships pre-filled with the
   current sample data as a starting point — replace the rows with real data whenever
   you're ready).
2. Upload it to a SharePoint document library or a OneDrive folder.
3. Share it with whoever should have access (e.g. "People in your organization," or
   specific people/groups) and copy the sharing link (**Share → Copy link**). Any of the
   standard link formats work (`https://yourtenant.sharepoint.com/...` or
   `https://yourtenant-my.sharepoint.com/...`).
4. Keep that link — it's the `VITE_EXCEL_SHARE_URL` value below.

Do not rename sheet tabs or the header row of any sheet — the app looks them up by exact
name. See the **ReadMe** tab inside the workbook for the full sheet-by-sheet guide.

## 2. Register an Azure AD (Entra ID) app — one-time, needs a tenant admin

This is a configuration step in your Microsoft 365 admin center, not a deployed server.

1. Go to [entra.microsoft.com](https://entra.microsoft.com) (or the Azure Portal →
   Microsoft Entra ID) → **App registrations** → **New registration**.
2. Name it something like `Vantage CS Portal`.
3. **Supported account types**: "Accounts in this organizational directory only" (single
   tenant) — this is an internal tool.
4. **Redirect URI**: platform = **Single-page application (SPA)**, value =
   `http://localhost:5174/auth-redirect.html` for local development. Note the
   `/auth-redirect.html` suffix — it must point at that blank page, not the app's root
   URL, or sign-in will fail with a `block_nested_popups` error. Add your production
   URL's equivalent (`https://your-domain/auth-redirect.html`) too once you've deployed
   (see step 4) — you can add multiple redirect URIs later under **Authentication**.
5. Click **Register**. On the **Overview** page, copy:
   - **Application (client) ID** → `VITE_MSAL_CLIENT_ID`
   - **Directory (tenant) ID** → `VITE_MSAL_TENANT_ID`
6. Go to **API permissions** → **Add a permission** → **Microsoft Graph** →
   **Delegated permissions** → search `Files.Read` → check it → **Add permissions**.
7. Click **Grant admin consent for `<your org>`** so users aren't individually prompted
   for admin approval (regular users can still consent to this specific low-privilege
   permission themselves even without this step, but pre-granting is smoother).
8. Under **Authentication**, leave the "Access tokens" / "ID tokens" (implicit flow)
   checkboxes **unchecked** — this app uses the modern auth-code + PKCE flow, which
   doesn't need them.

## 3. Configure the app

Copy `.env.example` to `.env.local` in the project root and fill in the three values:

```
VITE_MSAL_CLIENT_ID=<Application (client) ID from step 2>
VITE_MSAL_TENANT_ID=<Directory (tenant) ID from step 2>
VITE_EXCEL_SHARE_URL=<sharing link from step 1>
```

Run `npm run dev` and open the app — you should see a "Sign in with Microsoft" screen
instead of the app shell. Sign in with a Microsoft 365 account that has access to the
file. First-time sign-in will show a one-time consent screen for the `Files.Read`
permission.

## 4. Deploying it somewhere real

**Important:** because this is a static single-page app, the three `VITE_*` values above
get baked into the JavaScript bundle at *build time* — not read from a running server at
request time. That means:

- Changing them requires re-running `npm run build` and re-deploying the output, not just
  editing an environment variable on a live server.
- The Excel *data* itself is fully dynamic (edit the sheet, the app picks it up on its
  next sync) — it's only the *connection settings* (client ID, tenant ID, file link) that
  are baked in at build time.

Any static file host works — there's still no backend/middleware, just files being
served (a SharePoint site page, Azure Static Web Apps' free tier, Netlify, GitHub Pages,
an internal IIS/nginx box serving static files, etc.). Whatever URL you land on, add
`<that-url>/auth-redirect.html` as an additional Redirect URI (platform: Single-page
application) on the Azure AD app from step 2.

## 5. Keeping data fresh

- The app automatically re-syncs every 5 minutes while it's open (only while signed in).
- Users can force an immediate sync by clicking the status badge in the top-right of the
  app, or via **Administration → Data Source → Sync now**.
- There is intentionally no push/webhook mechanism (that would require a server to
  receive Microsoft's change notifications, which is the "middleware" this setup avoids)
  — data freshness is poll-based, not real-time-push.

## Troubleshooting

- **"Couldn't load the workbook" with a 403/Forbidden** — the signed-in user doesn't have
  access to the file. Check the SharePoint/OneDrive sharing settings.
- **"...missing required sheet(s)..."** — a tab was renamed or deleted. Compare against
  the ReadMe tab's sheet list and restore the exact names.
- **Stuck on "Signing in..." / popup blocked** — some browsers block the sign-in popup on
  first load; allow popups for the app's domain and retry.
