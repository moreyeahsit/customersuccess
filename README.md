# Vantage — Customer Success Portal

An AI-oriented Customer Success operating system: portfolio-wide executive dashboard,
per-customer 360° view (health, readiness, financials/P&L, LTV, journey, tasks &
playbooks, relationships, expansion, QBRs), a role-based access demo, and an AI Copilot
over the customer data.

## Running locally

```bash
npm install
npm run dev
```

By default the app runs on **bundled local sample data** — no setup required.

## Connecting it to live data

The app can instead read its data from an Excel workbook hosted on SharePoint/OneDrive,
synced automatically via Microsoft Graph (no backend server involved). See
**[SETUP.md](./SETUP.md)** for the full walkthrough, and
**`excel-template/Vantage_Data.xlsx`** for the workbook template (with its own `ReadMe`
tab describing every sheet).

## Tech stack

React + TypeScript + Vite + Tailwind CSS, React Router, Recharts, MSAL (`@azure/msal-browser`
/ `@azure/msal-react`) for sign-in, and SheetJS (`xlsx`) for parsing the workbook client-side.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck and build for production
- `npm run lint` — run oxlint
- `npx tsx scripts/generate-excel.mts` — regenerate the sample workbook from the current
  in-app mock data
