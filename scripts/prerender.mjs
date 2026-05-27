// Build-time prerender pass.
//
// 1. Spawns `vite preview` against the just-built dist/.
// 2. Loads each React-router route in headless Chromium.
// 3. Waits for #root to render and useEffect side effects to fire (so the
//    title set by useSeoMeta and the canonical link set by useCanonical are
//    present in the live DOM).
// 4. Writes the post-hydration HTML to dist/<route>/index.html so Render's
//    static-file resolver serves a fully-formed page before any JS executes.
//
// Article pages in public/articles/*.html are already static HTML and ship
// through Vite's public/ copy step; they don't go through this script.
//
// Run via `npm run build` (which chains vite build → this script) or
// `npm run prerender` standalone after a vite build.

import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const ROUTES = [
  "/",
  "/privacy",
  "/terms",
  "/contact",
  "/cheapest-glp1-without-insurance",
  "/ozempic-vs-mounjaro-cost",
  "/glp1-self-pay-options",
];

const PORT = 4173;
const HOST = `http://localhost:${PORT}`;

function startPreview() {
  const isWin = process.platform === "win32";
  const npxCmd = isWin ? "npx.cmd" : "npx";
  const child = spawn(
    npxCmd,
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWin,
    }
  );
  child.stdout.on("data", () => {});
  child.stderr.on("data", () => {});
  return child;
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`${HOST}/`);
      if (res.ok) return;
    } catch (_) {}
    await sleep(500);
  }
  throw new Error("preview server did not become ready in 30 seconds");
}

const preview = startPreview();

try {
  await waitForServer();
  console.log(`preview server ready on ${HOST}`);

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const failures = [];

  for (const route of ROUTES) {
    const url = `${HOST}${route}`;
    process.stdout.write(`prerender ${route.padEnd(38)} `);
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

      // Wait for React to mount AND useEffect side effects to land.
      await page.waitForFunction(
        () => {
          const root = document.getElementById("root");
          return (
            root &&
            root.children.length > 0 &&
            document.title &&
            document.title.length > 0
          );
        },
        { timeout: 10000 }
      );

      // Settle for any trailing effects (canonical link, JSON-LD injection,
      // any other useEffect-based head mutations).
      await sleep(300);

      const html = await page.content();
      const title = await page.title();
      const outPath =
        route === "/"
          ? path.join(projectRoot, "dist", "index.html")
          : path.join(projectRoot, "dist", route.replace(/^\//, ""), "index.html");
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html);
      console.log(`→ ${path.relative(projectRoot, outPath)}`);
      console.log(`    title: "${title}"`);
    } catch (err) {
      failures.push({ route, error: err.message });
      console.log(`FAIL: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  if (failures.length > 0) {
    console.error("\nprerender failures:");
    for (const f of failures) console.error(`  ${f.route}: ${f.error}`);
    process.exitCode = 1;
  } else {
    console.log(`\nprerender complete: ${ROUTES.length} routes`);
  }
} finally {
  preview.kill("SIGTERM");
  // Give the OS a moment to release the port before this script exits.
  await sleep(500);
}
