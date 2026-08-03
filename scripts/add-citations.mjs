// One-shot: add inline citations to authoritative primary sources across
// the article corpus.
//
// Why: for YMYL health-adjacent content, Google weights primary-source
// citation heavily. An audit found 22 of 28 articles carried zero links to
// fda.gov, cms.gov, medicare.gov, nih.gov, or pubmed — which reads as
// low-trust regardless of how accurate the content actually is.
//
// Design decisions that matter:
//
//   * Citations are placed AT THE CLAIM, by hyperlinking the phrase that
//     states the fact, rather than appended to a footer. A footer link
//     dump does not associate a source with a claim.
//
//   * Every URL below was verified live (HTTP 200, browser UA) before this
//     script was written. Nothing here is guessed. If a source could not be
//     verified it was dropped rather than included speculatively — notably
//     medicaid.gov (403) and two fda.gov compounding paths (404).
//
//   * Replacement is confined to the <main> body and skipped inside any
//     existing <a> element. "Part D" appears inside FAQPage JSON-LD and
//     inside existing links; naive string replacement would corrupt both.
//
//   * First occurrence only, max 3 citations per article, and never the
//     same source twice in one article. The goal is credible sourcing, not
//     link density.
//
// Idempotent: a file already containing a given source URL will not get it
// again. Safe to re-run.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.resolve(__dirname, "..", "public", "articles");

const A = (url, text) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;

// Verified 2026-08-03 via curl (HTTP 200, browser user-agent).
const SRC = {
  shortage: "https://www.accessdata.fda.gov/scripts/drugshortages/",
  compounding:
    "https://www.fda.gov/drugs/drug-alerts-and-statements/fda-clarifies-policies-compounders-national-glp-1-supply-begins-stabilize",
  unapproved:
    "https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss",
  dosingErrors:
    "https://www.fda.gov/drugs/human-drug-compounding/fda-alerts-health-care-providers-compounders-and-patients-dosing-errors-associated-compounded",
  partD: "https://www.medicare.gov/drug-coverage-part-d",
  appeals: "https://www.healthcare.gov/appeal-insurance-company-decision/",
  externalReview:
    "https://www.healthcare.gov/appeal-insurance-company-decision/external-review/",
  niddk:
    "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity",
  step1: "https://pubmed.ncbi.nlm.nih.gov/33567185/",
  surmount1: "https://pubmed.ncbi.nlm.nih.gov/35658024/",
  cmsBridge:
    "https://www.cms.gov/medicare/coverage/prescription-drug-coverage/medicare-glp-1-bridge",
};

// Ordered by specificity — the most claim-specific anchors run first so a
// generic one doesn't consume an article's citation budget.
const RULES = [
  {
    src: SRC.shortage,
    re: /\b((?:FDA(?:'s)?\s+)?(?:national\s+)?drug\s+shortage\s+list)\b/i,
    link: (m) => A(SRC.shortage, m),
  },
  {
    src: SRC.shortage,
    re: /\b(shortage\s+list)\b/i,
    link: (m) => A(SRC.shortage, m),
  },
  {
    src: SRC.compounding,
    re: /\b(503B\s+outsourcing\s+facilit(?:y|ies))\b/i,
    link: (m) => A(SRC.compounding, m),
  },
  {
    src: SRC.compounding,
    re: /\b(503A\s+pharmac(?:y|ies))\b/i,
    link: (m) => A(SRC.compounding, m),
  },
  {
    src: SRC.unapproved,
    re: /\b(not\s+FDA-approved)\b/i,
    link: (m) => A(SRC.unapproved, m),
  },
  // Broader compounded-product anchor. Several pricing-led articles discuss
  // compounded GLP-1s without ever using the 503A/503B or "not FDA-approved"
  // phrasing the rules above key on; this catches those.
  {
    src: SRC.unapproved,
    re: /\b(compounded\s+(?:semaglutide|tirzepatide|GLP-1s?))\b/i,
    link: (m) => A(SRC.unapproved, m),
  },
  {
    src: SRC.dosingErrors,
    re: /\b(dosing\s+errors?)\b/i,
    link: (m) => A(SRC.dosingErrors, m),
  },
  {
    src: SRC.externalReview,
    re: /\b(external\s+appeal)\b/i,
    link: (m) => A(SRC.externalReview, m),
  },
  {
    src: SRC.appeals,
    re: /\b(prior\s+authorization)\b/i,
    link: (m) => A(SRC.appeals, m),
  },
  {
    src: SRC.cmsBridge,
    re: /\b(Medicare\s+GLP-1\s+Bridge(?:\s+Program)?)\b/,
    link: (m) => A(SRC.cmsBridge, m),
  },
  {
    src: SRC.partD,
    re: /\b(Medicare\s+Part\s+D)\b/,
    link: (m) => A(SRC.partD, m),
  },
  { src: SRC.partD, re: /\b(Part\s+D)\b/, link: (m) => A(SRC.partD, m) },
  {
    src: SRC.niddk,
    re: /\b(chronic\s+weight\s+management)\b/i,
    link: (m) => A(SRC.niddk, m),
  },
  // Clinical-outcome anchors. These point at the actual NEJM trials behind
  // the weight-loss figures the site quotes, verified by PMID:
  //   33567185 = "Once-Weekly Semaglutide in Adults with Overweight or
  //              Obesity" (STEP 1, NEJM 2021)
  //   35658024 = "Tirzepatide Once Weekly for the Treatment of Obesity"
  //              (SURMOUNT-1, NEJM 2022)
  {
    src: SRC.step1,
    re: /\b(average\s+weight\s+loss)\b/i,
    link: (m) => A(SRC.step1, m),
  },
  {
    src: SRC.surmount1,
    re: /\b(clinical\s+trials?)\b/i,
    link: (m) => A(SRC.surmount1, m),
  },
  // General framing anchor — NIDDK is the primary-source reference for
  // obesity as a treatable condition and for prescription weight-management
  // medications. Runs last so it only consumes a slot when nothing more
  // claim-specific matched.
  { src: SRC.niddk, re: /\b(obesity)\b/i, link: (m) => A(SRC.niddk, m) },
];

const MAX_PER_FILE = 3;

// Split HTML into segments, marking which are "safe" to edit. Unsafe:
// anything inside an <a> element, any tag, and anything inside <script>.
function segments(html) {
  const out = [];
  const re = /<a\b[\s\S]*?<\/a>|<script[\s\S]*?<\/script>|<[^>]+>/gi;
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) out.push({ safe: true, text: html.slice(last, m.index) });
    out.push({ safe: false, text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < html.length) out.push({ safe: true, text: html.slice(last) });
  return out;
}

const files = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .map((f) => path.join(articlesDir, f));

let totalAdded = 0;
const report = [];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  // Only touch the <main> body. Head, schema, and footer are off limits.
  const mainStart = src.indexOf("<main");
  const mainEnd = src.indexOf("</main>");
  if (mainStart === -1 || mainEnd === -1) {
    report.push({ file: path.basename(file), added: 0, note: "no <main>" });
    continue;
  }

  const head = src.slice(0, mainStart);
  let body = src.slice(mainStart, mainEnd);
  const tail = src.slice(mainEnd);

  let added = 0;
  const usedSources = new Set();

  // Sources already cited anywhere in the file count against reuse, so a
  // re-run doesn't double up and articles that already had citations get
  // topped up with different sources rather than duplicates.
  for (const key of Object.keys(SRC)) {
    if (src.includes(SRC[key])) usedSources.add(SRC[key]);
  }

  for (const rule of RULES) {
    if (added >= MAX_PER_FILE) break;
    if (usedSources.has(rule.src)) continue;

    const segs = segments(body);
    let done = false;

    for (let i = 0; i < segs.length && !done; i++) {
      if (!segs[i].safe) continue;
      const m = segs[i].text.match(rule.re);
      if (!m) continue;
      segs[i].text = segs[i].text.replace(rule.re, (full) => rule.link(full));
      done = true;
    }

    if (done) {
      body = segs.map((s) => s.text).join("");
      usedSources.add(rule.src);
      added++;
    }
  }

  if (added > 0) {
    fs.writeFileSync(file, head + body + tail);
    totalAdded += added;
  }
  report.push({ file: path.basename(file), added });
}

report
  .sort((a, b) => b.added - a.added)
  .forEach((r) =>
    console.log(`  +${r.added}  ${r.file}${r.note ? "  (" + r.note + ")" : ""}`)
  );
console.log(`\n${totalAdded} citations added across ${files.length} articles`);
