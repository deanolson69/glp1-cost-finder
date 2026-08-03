// One-shot: replace the Organization author on every article's Article
// schema with a resolvable Person entity for Dean Olson.
//
// Why: Article schema already existed, but "author" pointed at the same
// Organization as "publisher", which makes the author a non-entity. For
// YMYL content Google weights a named, credentialed, resolvable author.
//
// The Person is emitted inline on each page (rather than as a bare @id
// reference) so each article validates standalone, while the stable @id
// lets parsers consolidate all of them into one entity that resolves to
// the /about page.
//
// Credential framing is deliberately narrow: Dean is a Dave Ramsey
// certified financial coach doing consumer pricing research. He is NOT a
// clinician, and the schema does not imply medical credentials. Overstating
// that on a YMYL health-adjacent site would be worse than claiming nothing.
//
// Idempotent — files already carrying the Person block are skipped.
// Re-run safely:  node scripts/add-author-person.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.resolve(__dirname, "..", "public", "articles");

const PERSON_ID = "https://glp1costfinder.com/about#dean-olson";

// Matches every Organization author variant on the site: single-line and
// multi-line, with or without the trailing "url" field. The older articles
// (April-era) omit "url"; the ones written later include it.
const ORG_AUTHOR =
  /"author":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"GLP-1 Cost Finder"(?:,\s*"url":\s*"https:\/\/glp1costfinder\.com")?\s*\}/g;

function personBlock(indent) {
  const i = " ".repeat(indent);
  return `"author": {
${i}  "@type": "Person",
${i}  "@id": "${PERSON_ID}",
${i}  "name": "Dean Olson",
${i}  "jobTitle": "Founder and Lead Researcher",
${i}  "url": "https://glp1costfinder.com/about",
${i}  "description": "Independent consumer researcher tracking GLP-1 medication pricing. Verifies every listed price against the provider's own published pages on a monthly cadence. Financial coach by training, not a clinician \\u2014 this site covers cost and coverage, not medical advice.",
${i}  "knowsAbout": [
${i}    "GLP-1 medication pricing",
${i}    "Telehealth provider cost comparison",
${i}    "Medicare Part D prescription drug coverage",
${i}    "Manufacturer savings cards and patient assistance programs",
${i}    "Compounded medication regulation"
${i}  ],
${i}  "hasCredential": {
${i}    "@type": "EducationalOccupationalCredential",
${i}    "credentialCategory": "certification",
${i}    "name": "Ramsey Solutions Master Financial Coach"
${i}  },
${i}  "worksFor": { "@id": "https://glp1costfinder.com/#organization" }
${i}}`;
}

const files = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(articlesDir, f));

let changed = 0;
let skipped = 0;
let noSchema = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  if (src.includes(PERSON_ID)) {
    skipped++;
    continue;
  }
  if (!ORG_AUTHOR.test(src)) {
    noSchema++;
    ORG_AUTHOR.lastIndex = 0;
    continue;
  }
  ORG_AUTHOR.lastIndex = 0;

  // Preserve the indentation of the line the author key sits on so the
  // emitted JSON stays readable in the source file.
  const out = src.replace(ORG_AUTHOR, (match, offset) => {
    const lineStart = src.lastIndexOf("\n", offset) + 1;
    const indent = offset - lineStart;
    return personBlock(indent);
  });

  fs.writeFileSync(file, out);
  changed++;
  console.log("  author -> Person  " + path.basename(file));
}

console.log(
  `\n${changed} updated, ${skipped} already had it, ${noSchema} without a matching author block (of ${files.length} files)`
);
