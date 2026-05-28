// One-shot upgrade pass for the static article HTML files in public/articles/.
//
// Each article already has unique <title>, <meta description>, canonical,
// partial OG tags (og:title, og:description, og:url, og:type), and JSON-LD
// for Article + FAQPage (+ HowTo on some). What's missing:
//
//   - og:site_name, og:image (+ width/height/alt)
//   - twitter:card / twitter:title / twitter:description / twitter:image
//   - Site-wide JSON-LD: Organization + WebSite
//   - BreadcrumbList JSON-LD
//
// This script reads each file, parses the existing title + description,
// derives the article slug + breadcrumb label, and injects the missing tags.
// It is IDEMPOTENT -- if og:site_name is already present, the file is left
// alone so reruns don't duplicate tags. The existing Article / FAQPage /
// HowTo JSON-LD is preserved untouched in its own <script> block.
//
// Articles live in public/ and are served directly by Render's static-file
// resolver (no React, no prerender). Run after adding a new article:
//   node scripts/upgrade-article-seo.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const ORIGIN = "https://glp1costfinder.com";
const OG_IMAGE_URL = ORIGIN + "/og-image.png";

const articlesDir = path.join(projectRoot, "public", "articles");

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Strip HTML entities just enough to use a <title> as plain text in JSON-LD.
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function siteJsonLd(breadcrumbItems) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORIGIN + "/#organization",
        name: "GLP-1 Cost Finder",
        url: ORIGIN,
        description:
          "Independent GLP-1 medication cost comparison tool helping consumers find the cheapest way to get Ozempic, Wegovy, Mounjaro, Zepbound, and other GLP-1 medications.",
      },
      {
        "@type": "WebSite",
        "@id": ORIGIN + "/#website",
        name: "GLP-1 Cost Finder",
        url: ORIGIN,
        publisher: { "@id": ORIGIN + "/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems,
      },
    ],
  };
}

function upgrade(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const filename = path.basename(filePath);
  const isIndex = filename === "index.html";

  if (/<meta property="og:site_name"/.test(original)) {
    return { filePath, status: "skipped (already upgraded)" };
  }

  const titleMatch = original.match(/<title>([\s\S]*?)<\/title>/);
  const descMatch = original.match(/<meta name="description" content="([^"]*)"\s*\/?>/);
  if (!titleMatch || !descMatch) {
    return { filePath, status: "skipped (no title/description)" };
  }
  const titleText = decodeEntities(titleMatch[1]).trim();
  const descText = decodeEntities(descMatch[1]).trim();

  // Compute breadcrumb. The articles index is /articles/, individual articles
  // sit at /articles/<slug>.html. Breadcrumb label for individual articles is
  // shortened from the <title> by stripping the " — GLP-1 Cost Finder" or
  // " | GLP-1 Cost Finder" suffix and the ":" prefix on long subtitles.
  let breadcrumbItems;
  if (isIndex) {
    breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Articles", item: ORIGIN + "/articles/" },
    ];
  } else {
    const shortLabel = titleText
      .replace(/\s*[—\-|]\s*GLP-1 Cost Finder.*$/i, "")
      .replace(/\s*\(2026\)\s*$/, "")
      .trim();
    const articleUrl = ORIGIN + "/articles/" + filename;
    breadcrumbItems = [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: "Articles", item: ORIGIN + "/articles/" },
      { "@type": "ListItem", position: 3, name: shortLabel, item: articleUrl },
    ];
  }

  // Compose the block we're injecting. og:type already exists per file -- we
  // don't overwrite it (individual articles have og:type=article; the index
  // has og:type=website). We only ADD what's missing.
  const ogTwitterBlock = [
    `  <meta property="og:site_name" content="GLP-1 Cost Finder" />`,
    `  <meta property="og:image" content="${OG_IMAGE_URL}" />`,
    `  <meta property="og:image:width" content="1200" />`,
    `  <meta property="og:image:height" content="630" />`,
    `  <meta property="og:image:alt" content="GLP-1 Cost Finder — compare real GLP-1 prices" />`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    `  <meta name="twitter:title" content="${escAttr(titleText)}" />`,
    `  <meta name="twitter:description" content="${escAttr(descText)}" />`,
    `  <meta name="twitter:image" content="${OG_IMAGE_URL}" />`,
  ].join("\n");

  const jsonLdBlock =
    `  <script type="application/ld+json">\n` +
    JSON.stringify(siteJsonLd(breadcrumbItems), null, 2)
      .split("\n")
      .map((l) => "  " + l)
      .join("\n") +
    `\n  </script>`;

  // Insert just before </head>. Two assets: meta block first, then the
  // BreadcrumbList/site-wide JSON-LD. Both sit alongside the existing
  // Article/FAQPage <script> already in the file.
  let next = original.replace(
    /<\/head>/,
    `${ogTwitterBlock}\n${jsonLdBlock}\n</head>`
  );

  fs.writeFileSync(filePath, next);
  return { filePath, status: "upgraded" };
}

const files = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(articlesDir, f));

const results = files.map(upgrade);

const upgraded = results.filter((r) => r.status === "upgraded");
const skipped = results.filter((r) => r.status !== "upgraded");

for (const r of results) {
  console.log(`${r.status.padEnd(28)} ${path.relative(projectRoot, r.filePath)}`);
}
console.log(
  `\n${upgraded.length} upgraded, ${skipped.length} skipped (of ${files.length} files)`
);
