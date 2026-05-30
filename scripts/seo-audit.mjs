// SEO audit pass: canonicals + indexability + sitemap coverage.
//
// Walks every HTML file in dist/ (the production build), parses the head and
// body, and cross-references against public/sitemap.xml + every internal
// link found across the site. Emits a single structured report for the human.
//
// Run after a fresh `npm run build`, since this reads from dist/, not from
// source. Output is plain text to stdout; redirect to a file if you want to
// diff between runs.
//
//   npm run build && node scripts/seo-audit.mjs
//
// What it checks (per page):
//   - canonical present, absolute, points to self
//   - title + meta description exist and are unique site-wide
//   - no <meta name="robots" content="noindex">
//   - word count >= 300 (rough content-thinness gate)
//   - count of internal links pointing TO this page from elsewhere
//   - present in sitemap.xml
//
// Site-wide:
//   - every dist/ page is reachable from the sitemap
//   - every sitemap URL has a corresponding dist/ page
//   - duplicate <title>s and duplicate descriptions across pages

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const ORIGIN = "https://glp1costfinder.com";
const distDir = path.join(projectRoot, "dist");
const sitemapPath = path.join(projectRoot, "public", "sitemap.xml");

// ─── HELPERS ───────────────────────────────────────────────────────────────

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

function listHtmlFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) out.push(full);
    }
  };
  walk(dir);
  return out;
}

// Map a dist/ filesystem path back to the canonical URL it should serve at.
// Note the trailing-slash distinction: directory index files are reached via
// trailing-slash URLs (/articles/), but the React router routes prerendered
// to dist/<route>/index.html intentionally use bare paths (/privacy,
// /ozempic-vs-mounjaro-cost) since that's what the sitemap + canonical use.
// Render's static-file resolver serves both forms identically; the canonical
// is what tells search engines which form to attribute signals to.
const TRAILING_SLASH_DIRS = new Set(["articles"]);
function distPathToUrl(filePath) {
  const rel = path.relative(distDir, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) {
    const dir = rel.slice(0, -"/index.html".length);
    // Top-level dir matches trailing-slash list -> /<dir>/, else /<dir>.
    // Nested dirs (multi-segment paths like providers/foo) also get the
    // trailing slash, because Render's static-file resolver only auto-
    // resolves bare paths to /index.html at the top level -- nested bare
    // paths get caught by the SPA wildcard rewrite, so canonical URLs for
    // those routes must use the trailing-slash form.
    if (TRAILING_SLASH_DIRS.has(dir) || dir.includes("/")) return "/" + dir + "/";
    return "/" + dir;
  }
  return "/" + rel;
}

// Pages we never want to flag in the audit (verification files, RSS, etc.)
const AUDIT_IGNORE = new Set(["/google08c69e926bf471b2.html"]);

function urlForReport(urlPath) {
  return ORIGIN + urlPath;
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function countMatches(html, re) {
  return (html.match(re) || []).length;
}

function stripTags(html) {
  // Drop scripts/styles entirely, then strip tags, normalize whitespace.
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

// Extract all internal hrefs (relative or pointing to our origin), normalized
// to URL paths like "/articles/foo.html" -- ignores fragments + query strings
// and external links.
function extractInternalHrefs(html) {
  const out = new Set();
  const re = /href="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    let href = m[1].trim();
    if (!href || href.startsWith("#")) continue;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("javascript:")) continue;
    if (/^https?:\/\//i.test(href)) {
      if (href.startsWith(ORIGIN)) href = href.slice(ORIGIN.length);
      else continue;
    }
    // strip query + fragment
    href = href.split("#")[0].split("?")[0];
    if (!href) continue;
    if (!href.startsWith("/")) href = "/" + href;
    out.add(href);
  }
  return [...out];
}

// ─── INPUTS ────────────────────────────────────────────────────────────────

const sitemapXml = readFile(sitemapPath);
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => m[1].trim()
);
const sitemapUrlSet = new Set(sitemapUrls);

const files = listHtmlFiles(distDir).filter(
  (f) => !AUDIT_IGNORE.has(distPathToUrl(f))
);

// ─── PER-PAGE ANALYSIS ────────────────────────────────────────────────────

const pages = files.map((filePath) => {
  const html = readFile(filePath);
  const urlPath = distPathToUrl(filePath);
  const absUrl = urlForReport(urlPath);

  const title = extract(html, /<title>([\s\S]*?)<\/title>/);
  const description = extract(
    html,
    /<meta\s+name="description"\s+content="([^"]*)"/i
  );
  const canonicalCount = countMatches(html, /<link\s+rel="canonical"/gi);
  const canonical = extract(
    html,
    /<link\s+rel="canonical"\s+href="([^"]+)"/i
  );
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex[^"]*"/i.test(
    html
  );
  // Word count: extract body, strip tags
  const bodyMatch = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? stripTags(bodyMatch[1]) : "";
  const words = wordCount(bodyText);

  const internalHrefs = extractInternalHrefs(html);

  return {
    filePath,
    urlPath,
    absUrl,
    title,
    description,
    canonicalCount,
    canonical,
    noindex,
    words,
    internalHrefs,
  };
});

// ─── CROSS-PAGE DATA ──────────────────────────────────────────────────────

const titleToPages = new Map();
const descToPages = new Map();
for (const p of pages) {
  const t = p.title || "(missing)";
  const d = p.description || "(missing)";
  if (!titleToPages.has(t)) titleToPages.set(t, []);
  if (!descToPages.has(d)) descToPages.set(d, []);
  titleToPages.get(t).push(p.urlPath);
  descToPages.get(d).push(p.urlPath);
}

// Map: urlPath -> count of internal links pointing TO it from other pages.
// We normalize:
//   /             can be referenced as /, /index.html
//   /privacy      can be /privacy or /privacy/ or /privacy/index.html
//   /articles/    can be /articles or /articles/ or /articles/index.html
// Compute aliases for each page and accept any of them as "pointing to" it.
function aliasesFor(urlPath) {
  const out = new Set([urlPath]);
  if (urlPath === "/") {
    out.add("/index.html");
  } else if (urlPath.endsWith("/")) {
    out.add(urlPath.slice(0, -1));
    out.add(urlPath + "index.html");
  } else if (!urlPath.endsWith(".html")) {
    out.add(urlPath + "/");
    out.add(urlPath + "/index.html");
  }
  return out;
}

const incomingByUrl = new Map();
for (const p of pages) incomingByUrl.set(p.urlPath, 0);

for (const p of pages) {
  for (const href of p.internalHrefs) {
    for (const target of pages) {
      if (target.urlPath === p.urlPath) continue; // don't count self-links
      if (aliasesFor(target.urlPath).has(href)) {
        incomingByUrl.set(target.urlPath, incomingByUrl.get(target.urlPath) + 1);
      }
    }
  }
}

// ─── REPORT ───────────────────────────────────────────────────────────────

const issues = [];

function issue(scope, msg) {
  issues.push({ scope, msg });
}

console.log("# SEO AUDIT REPORT");
console.log("# build dir:    " + path.relative(projectRoot, distDir));
console.log("# sitemap urls: " + sitemapUrls.length);
console.log("# dist pages:   " + pages.length);
console.log();

// Sort pages: React routes first, then articles, then others
const sortKey = (p) => {
  if (p.urlPath === "/") return "0_";
  if (p.urlPath.startsWith("/articles/")) return "2_" + p.urlPath;
  return "1_" + p.urlPath;
};
pages.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

const tableRows = [];
tableRows.push([
  "URL",
  "InSitemap",
  "Canonical",
  "CanonCount",
  "TitleOK",
  "DescOK",
  "Words",
  "InLinks",
  "Noindex",
  "Issues",
]);

for (const p of pages) {
  const expectedCanonical = urlForReport(p.urlPath);
  const canonicalOK =
    p.canonical === expectedCanonical && p.canonicalCount === 1;
  const inSitemap = sitemapUrlSet.has(expectedCanonical);
  const titleDupes = titleToPages.get(p.title || "(missing)") || [];
  const descDupes = descToPages.get(p.description || "(missing)") || [];
  const titleUnique = titleDupes.length === 1 && !!p.title;
  const descUnique = descDupes.length === 1 && !!p.description;
  const inLinks = incomingByUrl.get(p.urlPath);

  const pageIssues = [];
  if (!p.canonical) pageIssues.push("no canonical");
  else if (p.canonical !== expectedCanonical)
    pageIssues.push(`canonical -> ${p.canonical}`);
  if (p.canonicalCount > 1) pageIssues.push(`${p.canonicalCount} canonicals`);
  if (!inSitemap) pageIssues.push("not in sitemap");
  if (!p.title) pageIssues.push("no title");
  if (!p.description) pageIssues.push("no description");
  if (!titleUnique && p.title) pageIssues.push(`title dup x${titleDupes.length}`);
  if (!descUnique && p.description)
    pageIssues.push(`desc dup x${descDupes.length}`);
  if (p.noindex) pageIssues.push("NOINDEX");
  if (p.words < 300) pageIssues.push(`thin (${p.words} words)`);
  if (inLinks === 0 && p.urlPath !== "/")
    pageIssues.push("no internal inbound links");

  for (const msg of pageIssues) issue(p.urlPath, msg);

  tableRows.push([
    p.urlPath,
    inSitemap ? "yes" : "NO",
    canonicalOK ? "ok" : (p.canonical || "(none)"),
    String(p.canonicalCount),
    titleUnique ? "ok" : "DUP",
    descUnique ? "ok" : "DUP",
    String(p.words),
    String(inLinks),
    p.noindex ? "YES" : "",
    pageIssues.join("; ") || "—",
  ]);
}

// Column-align
const widths = tableRows[0].map((_, i) =>
  Math.max(...tableRows.map((r) => String(r[i]).length))
);
for (const row of tableRows) {
  console.log(row.map((c, i) => String(c).padEnd(widths[i])).join("  "));
}
console.log();

// Sitemap URLs that have no corresponding dist/ file
const distUrlSet = new Set(pages.map((p) => urlForReport(p.urlPath)));
const orphanSitemapEntries = sitemapUrls.filter((u) => !distUrlSet.has(u));
if (orphanSitemapEntries.length > 0) {
  console.log("# sitemap entries with no built page:");
  for (const u of orphanSitemapEntries) console.log("  - " + u);
  console.log();
  for (const u of orphanSitemapEntries) issue("sitemap", `${u}: no built page`);
}

// dist/ pages missing from sitemap
const missingFromSitemap = pages.filter(
  (p) => !sitemapUrlSet.has(urlForReport(p.urlPath))
);
if (missingFromSitemap.length > 0) {
  console.log("# built pages missing from sitemap:");
  for (const p of missingFromSitemap)
    console.log("  - " + urlForReport(p.urlPath));
  console.log();
}

// Duplicate titles / descriptions
const dupTitles = [...titleToPages.entries()].filter(([, urls]) => urls.length > 1);
const dupDescs = [...descToPages.entries()].filter(([, urls]) => urls.length > 1);
if (dupTitles.length > 0) {
  console.log("# duplicate titles:");
  for (const [t, urls] of dupTitles) {
    console.log("  - " + JSON.stringify(t.slice(0, 80)));
    for (const u of urls) console.log("    - " + u);
  }
  console.log();
}
if (dupDescs.length > 0) {
  console.log("# duplicate descriptions:");
  for (const [d, urls] of dupDescs) {
    console.log("  - " + JSON.stringify(d.slice(0, 80)));
    for (const u of urls) console.log("    - " + u);
  }
  console.log();
}

console.log("# summary");
console.log("  pages with no issues:    " + pages.filter((p) => {
  const expected = urlForReport(p.urlPath);
  return (
    p.canonical === expected &&
    p.canonicalCount === 1 &&
    sitemapUrlSet.has(expected) &&
    p.title &&
    p.description &&
    !p.noindex &&
    p.words >= 300 &&
    (incomingByUrl.get(p.urlPath) > 0 || p.urlPath === "/")
  );
}).length + " / " + pages.length);
console.log("  total issues found:      " + issues.length);

process.exit(issues.length > 0 ? 0 : 0); // never fail; this is a report
