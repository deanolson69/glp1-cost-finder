// Server-side entry for the prerender step. Built by Vite via
// `vite build --ssr src/entry-server.jsx --outDir dist/server`, then consumed
// by scripts/prerender.mjs to renderToString each React route into static HTML.
//
// The browser entry (main.jsx) wraps the app in BrowserRouter and uses
// hydrateRoot. This file uses StaticRouter and renderToString so the same
// component tree renders in pure Node without a DOM.

import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.jsx";

export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}
