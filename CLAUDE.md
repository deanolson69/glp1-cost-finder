# GLP-1 Cost Finder

Consumer tool that helps users find the cheapest legitimate path to GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound, etc.) based on their state, insurance, and medical condition.

## Owner
Dean Olson — dean@olsoncoaches.com — operating under **Olson Coaches**.

## Live URLs
- **Production (custom domain):** https://glp1costfinder.com
- **Render default:** https://glp1-cost-finder.onrender.com

## Tech Stack
- **Vite 6** + **React 18** single-page app
- No backend — pure client-side; all data is embedded in the bundle
- Deployed as a **Render Static Site**, auto-deploys on push to `main`

## Architecture
Everything lives in a single component file — `src/App.jsx` (~73 KB). Intentional: all data and logic ships together so the app is a single static asset.

### Top-level exports in `src/App.jsx`
| Symbol | Purpose |
|---|---|
| `stateData` | Per-state Medicaid coverage + local pharmacy notes |
| `medications` | Brand + compounded GLP-1 options, pricing, manufacturer programs |
| `coverageTruth` | Insurance coverage reality table (what's actually covered vs. marketing) |
| `telehealthOptions` | Telehealth providers (Hims, Ro, Sesame, etc.) with pricing |
| `insuranceOptions` | Dropdown options for the insurance selector |
| `conditionOptions` | Dropdown options for the medical condition selector |
| `allStateCodes` | Sorted state codes for the state selector |
| `GLP1CostFinder` (default export) | Main component — state, recommendation engine, UI, email capture |

### Other files
- `src/main.jsx` — React root mount
- `index.html` — Vite entry, single `<div id="root">`
- `public/favicon.svg` — favicon
- `public/sitemap.xml` — **deployed with the site**; anything in `public/` is copied verbatim into `dist/` and served at the site root
- `vite.config.js` — Vite + React plugin config

## Reference docs (planning only — not deployed)
These live at the repo root for context but are not part of the built site:

- `privacy-policy.md` — privacy policy draft (needs to be rendered as a page before going live)
- `affiliate-program-research.md` — research on telehealth affiliate programs
- `mailchimp-integration-spec.md` — plan for email capture → Mailchimp integration
- `seo-landing-pages.md` — SEO strategy and landing page plan
- `google-search-console-guide.md` — GSC setup notes

Read these for context when working on related features; don't treat them as shipped functionality.

## Local Development
```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the built dist/ locally
```

Node.js on this machine is installed via winget at:
`C:\Users\deano\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.15.0-win-x64\`
(Node 24.15.0, npm 11.12.1). In a fresh shell where `node`/`npm` aren't on PATH, prepend that directory to `$PATH` before running npm commands.

## Deployment
- Render Static Site is wired to this repo's `main` branch.
- Every push to `main` triggers an auto-deploy. Render runs `npm install` + `npm run build`, then serves `dist/`.
- Custom domain `glp1costfinder.com` is attached with SSL.

## Editing Workflow
"Describe, edit, commit, push" — same loop as PrepareRight. Because the app is a single file, most changes are targeted edits in `src/App.jsx`: find the relevant data array (`medications`, `telehealthOptions`, `stateData`, etc.) or the recommendation logic in the `GLP1CostFinder` component, then edit in place. Always run `npm run build` locally before pushing to catch errors before Render does.

## Gotchas
- **Single-file architecture is intentional.** Don't refactor `App.jsx` into multiple files unless there's a concrete reason (e.g., a data set gets re-used elsewhere).
- **No env vars, no secrets in the bundle.** If a feature needs one (e.g., a Mailchimp API key), inject at build time via `VITE_*` envs configured in Render — never commit secrets.
- **`public/` is served as-is.** New static assets (sitemap, robots.txt, images, favicons) go in `public/` and are available at the site root after deploy.
