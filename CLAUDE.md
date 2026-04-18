# GLP-1 Cost Finder

Consumer tool that helps users find the cheapest legitimate path to GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound, etc.) based on their state, insurance, and medical condition.

## Live URLs
- **Production (custom domain):** https://glp1costfinder.com (SSL pending)
- **Render default:** https://glp1-cost-finder.onrender.com

## Tech Stack
- **Vite 6** + **React 18** single-page app
- No backend — pure client-side; all data is embedded in the bundle
- Deployed as a **Render Static Site**, auto-deploys on push to `main`

## Architecture
Everything lives in a single component file — `src/App.jsx` (~73 KB). Intentional: all data and logic ships together so the app is a single static asset.

### Top-level exports in `src/App.jsx`
| Symbol | Line | Purpose |
|---|---|---|
| `stateData` | 4 | Per-state Medicaid coverage + local pharmacy notes |
| `medications` | 59 | Brand + compounded GLP-1 options, pricing, manufacturer programs |
| `coverageTruth` | 159 | Insurance coverage reality table (what's actually covered vs. marketing) |
| `telehealthOptions` | 168 | Telehealth providers (Hims, Ro, Sesame, etc.) with pricing |
| `insuranceOptions` | 176 | Dropdown options for the insurance selector |
| `conditionOptions` | 183 | Dropdown options for the medical condition selector |
| `allStateCodes` | 191 | Sorted state codes for the state selector |
| `GLP1CostFinder` (default export) | 194 | Main component — state, recommendation engine, UI, email capture |

### Other files
- `src/main.jsx` — React root mount
- `index.html` — Vite entry, single `<div id="root">`
- `public/favicon.svg` — favicon
- `vite.config.js` — Vite + React plugin config

## Local Development
```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
```

Node.js on this machine is installed via winget at:
`C:\Users\deano\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.15.0-win-x64\`
(Node 24.15.0, npm 11.12.1). Restart shell after install for PATH to pick up `node` / `npm`.

## Deployment
- Render Static Site is wired to this repo's `main` branch.
- Every push to `main` triggers an auto-deploy. Render runs `npm install` + `npm run build`, then serves `dist/`.
- Custom domain `glp1costfinder.com` is attached; SSL certificate issuance is in progress at the time of writing.

## Editing Workflow
This project follows the same "describe, edit, commit, push" loop used for PrepareRight. Because the app is a single file, most changes are targeted edits in `src/App.jsx` — finding the relevant data array (medications, telehealthOptions, stateData, etc.) or the recommendation logic in the `GLP1CostFinder` component, then editing in place. Always run `npm run build` locally before pushing to catch errors before Render does.

## Gotchas / Things to Know
- **Single-file architecture is intentional.** Don't refactor `App.jsx` into multiple files unless there's a concrete reason (e.g., a data set gets re-used elsewhere). The shape is "big file of data + one component" by design.
- **No env vars, no secrets in the bundle.** If a feature ever needs one (e.g., an email capture backend API key), it must be injected at build time via `VITE_*` envs configured in Render — never committed.
- **Email capture** is a feature of the main component. Check current implementation before assuming how submissions are delivered.
