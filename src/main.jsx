import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Dual-mode boot: hydrate when the page was served from a prerendered HTML
// snapshot (so the existing DOM is preserved and only event listeners attach),
// otherwise fall back to a fresh client render. This lets the same bundle work
// for prerendered routes (`/`, `/privacy`, `/terms`, `/contact`, and the three
// SEO landing pages) and for any other path that ever ends up at the SPA shell.
const rootEl = document.getElementById('root')
const tree = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

if (rootEl.firstElementChild) {
  ReactDOM.hydrateRoot(rootEl, tree)
} else {
  ReactDOM.createRoot(rootEl).render(tree)
}
