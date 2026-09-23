# Good Showroom Accounting Suite

React 18, TypeScript, Vite and Tailwind frontend for the Dandenong Hyundai demo.

## Run

```sh
npm install
npm run dev
npm run build
```

The development server uses the backend configured by `VITE_API_URL`; see
`.env.example`. The value must include the `/api` prefix. Restart Vite after
changing an environment variable.

Create an account at `/signup`, choosing either Dealership or Admin. Login
requires the same role selected during signup. Password recovery is available
at `/forgot-password`.

## Screens

- CFO Command Centre: live KPIs, departmental contributions, drill-downs and exception links.
- Accounts Payable: filterable invoice register, inline extraction panel, supplier and GL coding, PO matching, approval, payment-run preparation and ageing.
- Cash & Treasury: cash balances, scenario chart, reconciliation state, matching, splitting, statement import and reconciliation packs.
- Inventory & Floorplan: aging bands, class and search filters, VIN cost details, deal jackets and facility balances.
- General Ledger: grouped trial balance, account search, journal register, account drills, manual journals, reconciliations and evidence export.

The five screens share the reference design's black navigation rail, compact
context header, off-white canvas, blue accents, square controls and thin table
rules. Screenshot document captions and surrounding presentation margins are
not part of the application.

## API integration

API adapters in `src/api` normalize the actual sibling backend's response shapes.
They handle bare arrays and records, trial-balance debit/credit balances,
invoice extraction fields, paginated facility draws, account drill lines,
match candidates and reconciliation exports.

Corrected routes include PATCH invoice extraction, invoice resolution,
bank match candidates, POST reconciliation packs, journal creation and
split allocation payloads. Payment runs are created as drafts and then
explicitly approved through the backend's approval endpoint.

Registers load all API pages before calculating summaries, then filter locally.
Requests have a 30-second timeout. The new screens show loading, empty and error
states, and discard stale responses. Authentication expiry returns to sign-in.
Successful mutations refresh the shell's exception counts and close readiness.

## Available data

The interface uses backend values. The Contribution by Department presentation
dataset is intentionally fixed in the backend dashboard response.
The current backend exposes only its active accounting period. Earlier gross
trend months remain unplotted; prior-period variance narratives are unavailable.

The cash chart is a clearly labelled frontend estimate based on the last eight
weeks of imported receipts and payments. Upside/downside scenarios change
receipts by +/-10%. It is not a committed-position forecast.

Inventory aging uses floorplan draw date, falling back to record creation date.
Interest is accrued interest from the API; forward interest rates and
curtailment schedules are not supplied.

Statutory, tax and OEM books, the inactive sidebar modules, and an ABA file
download are not provided by this backend. The payment-run UI does not claim
to generate a bank file.

## Verification

`npm run build` runs TypeScript checking and the production Vite build.

`node scripts/ui-smoke.mjs` runs read-only browser checks against the local
application and API. It uses installed Chrome on Windows, captures the five
screens, checks API read adapters,
exercises filters and drawers, and checks mobile layouts. Results and
screenshots are written to the ignored `test-artifacts/` directory.

Browser verification does not upload documents, post journals, allocate cash
or approve payments against the existing database. Those write flows are
connected to the backend but are not exercised by the smoke script.
