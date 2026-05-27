// Orchestrates the post-`vite build` SSR + prerender phase.
//
// Why this wrapper exists: Render's static-site build environment has shown
// itself to be touchier than expected on multi-step build commands. This
// wrapper logs each phase distinctly (so a failure points to a clear step in
// the build log) and treats a prerender failure as a soft failure -- the
// deploy still proceeds with the client-only bundle from `vite build`. That
// way a hiccup in the SSR or prerender step never breaks production; it just
// means crawlers see the empty SPA shell for that deploy, which is the same
// situation production was in before this work landed.
//
// Phases:
//   1. vite build --ssr -> dist/server/entry-server.js
//   2. node scripts/prerender.mjs -> dist/<route>/index.html
//
// `vite build` (the client build) is run separately by package.json before
// invoking this script, so dist/index.html and dist/assets/* already exist.

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function run(label, cmd, args) {
  return new Promise((resolve) => {
    console.log(`\n[prerender:${label}] ${cmd} ${args.join(" ")}`);
    const isWin = process.platform === "win32";
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell: isWin,
    });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", (err) => {
      console.error(`[prerender:${label}] spawn error:`, err.message);
      resolve(1);
    });
  });
}

const ssrCode = await run("ssr-build", "npx", [
  "vite",
  "build",
  "--ssr",
  "src/entry-server.jsx",
  "--outDir",
  "dist/server",
]);

if (ssrCode !== 0) {
  console.error(
    "\n[prerender] SSR build failed. Skipping prerender; deploying client-only bundle."
  );
  process.exit(0); // soft failure -- don't break the deploy
}

const renderCode = await run("prerender", "node", ["scripts/prerender.mjs"]);

if (renderCode !== 0) {
  console.error(
    "\n[prerender] Prerender step failed. The client bundle still ships, but per-route prerendered HTML did not. Check the log above for the specific error."
  );
  process.exit(0); // soft failure
}

console.log("\n[prerender] full pipeline complete");
