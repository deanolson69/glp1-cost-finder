// One-shot generator for the default Open Graph / Twitter card image.
//
// Produces public/og-image.png at 1200x630, the canonical OG dimensions. The
// PNG is committed to the repo and served as a static asset by Render's
// static-site host -- there's no need to regenerate it on every build, so
// `sharp` lives in devDependencies only and never ships to production.
//
// Re-run when the branding changes:
//   npm run og:image
//
// Why SVG -> PNG via sharp: the design is text-heavy and clean, which is a
// strength of vector layout. Sharp uses librsvg under the hood, which picks
// up system fonts via fontconfig. We stick to widely-available system fonts
// ("Arial, Helvetica, sans-serif") so the image renders consistently across
// Windows / Linux / macOS without needing to bundle font files.
//
// Why not generate at build time on Render: librsvg + system fonts on
// Render's static-site builder are unpredictable, and an OG image is a
// "ship once, change rarely" asset -- not worth coupling to every deploy.

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outPath = path.join(projectRoot, "public", "og-image.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="55%" stop-color="#1e3a5f"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#34d399"/>
    </linearGradient>
  </defs>

  <!-- background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- decorative bubbles -->
  <circle cx="1080" cy="120" r="140" fill="#60a5fa" opacity="0.08"/>
  <circle cx="140" cy="540" r="180" fill="#34d399" opacity="0.07"/>

  <!-- top eyebrow rule + label -->
  <rect x="100" y="120" width="60" height="4" rx="2" fill="url(#accent)"/>
  <text x="180" y="130"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22" font-weight="700"
        fill="#93c5fd" letter-spacing="6">
    GLP-1 COST FINDER
  </text>

  <!-- main headline -->
  <text x="100" y="270"
        font-family="Arial, Helvetica, sans-serif"
        font-size="84" font-weight="900"
        fill="#ffffff" letter-spacing="-2">
    Find the cheapest way
  </text>
  <text x="100" y="360"
        font-family="Arial, Helvetica, sans-serif"
        font-size="84" font-weight="900"
        fill="#ffffff" letter-spacing="-2">
    to get your GLP-1.
  </text>

  <!-- subtitle -->
  <text x="100" y="450"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34" font-weight="500"
        fill="#cbd5e1">
    Compare real GLP-1 prices — Ozempic, Wegovy, Mounjaro, Zepbound.
  </text>

  <!-- bottom pill row -->
  <g transform="translate(100, 510)">
    <rect x="0"   y="0" width="180" height="56" rx="28" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    <text x="90"  y="36" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">Self-Pay</text>

    <rect x="200" y="0" width="180" height="56" rx="28" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    <text x="290" y="36" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">Insurance</text>

    <rect x="400" y="0" width="220" height="56" rx="28" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
    <text x="510" y="36" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle">Telehealth</text>
  </g>

  <!-- bottom-right URL -->
  <text x="1100" y="565"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22" font-weight="600"
        fill="#94a3b8" text-anchor="end">
    glp1costfinder.com
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log(`wrote ${path.relative(projectRoot, outPath)} (1200x630)`);
