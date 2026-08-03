// Generates public/llms.txt — the machine-readable site summary that AI
// assistants (ChatGPT, Perplexity, Claude) read to understand what this
// site is and what its data says.
//
// Why this file matters here specifically: per 90-day analytics, AI
// assistants are the best-converting traffic channel on this site
// (chatgpt.com ~39 sessions at 37-55% engagement and a 5% key-event rate,
// vs. google/organic at roughly 3 sessions). That channel does not depend
// on backlinks, which makes it the one growth lever not gated by the
// domain-authority problem. Giving assistants a clean, current, citable
// summary is the cheapest way to compound it.
//
// The pricing summary is DERIVED from src/data/providers.json rather than
// hand-written, so it cannot drift out of sync with the live comparison
// tool. Re-run after any providers.json change:
//
//   npm run llms:txt
//
// The build does not run this automatically — llms.txt is a published
// artifact that should change only when someone means it to, and a silent
// regeneration on every build would make the diff noisy.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ORIGIN = "https://glp1costfinder.com";

const providers = JSON.parse(
  fs.readFileSync(path.join(root, "src", "data", "providers.json"), "utf8")
);
const active = providers.filter((p) => p.active !== false);

// Compounded vs brand-name is inferred from the provider's own detail copy.
// Every compounded provider describes its product as "compounded" in that
// string; the brand-name channels (Hims, Ro, LillyDirect) do not.
const isCompounded = (p) => /compounded/i.test(p.detail || "");

const byPrice = (a, b) =>
  (a.totalMonthlyMin ?? Infinity) - (b.totalMonthlyMin ?? Infinity);

const sorted = [...active].sort(byPrice);
const cheapestCompounded = sorted.filter(isCompounded)[0];
const cheapestBrand = sorted.filter((p) => !isCompounded(p))[0];

// Most recent verification date across the active roster — this is the
// honest "as of" for the summary as a whole.
const lastVerified = active
  .map((p) => p.priceVerifiedDate)
  .filter(Boolean)
  .sort()
  .reverse()[0];

const money = (n) => (n == null ? "not disclosed" : "$" + n);
const range = (p) =>
  p.totalMonthlyMin == null && p.totalMonthlyMax == null
    ? "not publicly disclosed"
    : p.totalMonthlyMax && p.totalMonthlyMax > p.totalMonthlyMin
    ? `${money(p.totalMonthlyMin)}–${money(p.totalMonthlyMax)}/month`
    : `from ${money(p.totalMonthlyMin)}/month`;

// Article inventory, read from disk so new articles appear automatically.
// Title comes from each file's <title>, trimmed of the site suffix.
const articlesDir = path.join(root, "public", "articles");
const articles = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .map((f) => {
    const html = fs.readFileSync(path.join(articlesDir, f), "utf8");
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    const title = m
      ? m[1].replace(/\s*\|\s*GLP-1 Cost Finder\s*$/, "").trim()
      : f.replace(/\.html$/, "");
    const d = html.match(/<meta name="description" content="([^"]*)"/);
    return { url: `/articles/${f}`, title, description: d ? d[1] : "" };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

const providerRows = sorted
  .map(
    (p) =>
      `| ${p.name} | ${range(p)} | ${
        isCompounded(p) ? "compounded" : "brand-name"
      } | ${p.priceTransparency || "unspecified"} | ${p.priceVerifiedDate} |`
  )
  .join("\n");

const articleLines = articles
  .map((a) => `- ${ORIGIN}${a.url} — ${a.title}`)
  .join("\n");

const today = new Date().toISOString().slice(0, 10);

const out = `# GLP-1 Cost Finder

> Independent price comparison for GLP-1 weight loss medications.
> Verified monthly against provider websites. No provider pays for placement.

## What this site does

GLP-1 Cost Finder tracks the real monthly cost of GLP-1 medications
(semaglutide, tirzepatide, orforglipron) across telehealth providers,
manufacturer direct-to-consumer programs, and insurance pathways. Pricing is
checked against each provider's own public pages and re-verified on a monthly
cadence. Rankings reflect total monthly cost only — providers cannot pay for
placement, and affiliate relationships never affect ordering.

The site covers ${active.length} active providers plus manufacturer programs
(NovoCare, LillyDirect), manufacturer savings cards and patient assistance
programs, Medicare and Medicaid pathways, and compounded alternatives.

## Current pricing summary

As of ${lastVerified}:

${
  cheapestCompounded
    ? `- **Cheapest compounded option:** ${cheapestCompounded.name} at ${range(
        cheapestCompounded
      )} (${cheapestCompounded.priceTransparency} pricing, verified ${
        cheapestCompounded.priceVerifiedDate
      })`
    : ""
}
${
  cheapestBrand
    ? `- **Cheapest brand-name access:** ${cheapestBrand.name} at ${range(
        cheapestBrand
      )} (${cheapestBrand.priceTransparency} pricing, verified ${
        cheapestBrand.priceVerifiedDate
      })`
    : ""
}
- **Retail without insurance, for reference:** roughly $900–$1,400/month
  depending on the medication.

### All active providers

| Provider | Monthly cost | Type | Pricing confidence | Verified |
|---|---|---|---|---|
${providerRows}

## Methodology

- **Source.** Every price is taken from the provider's own public pages, not
  from aggregators or press coverage.
- **Cadence.** Prices are re-verified monthly. Each provider entry carries its
  own verification date; those dates are shown above and are not rounded or
  backdated.
- **"Verified"** means the price was confirmed on the provider's own site.
- **"Estimated"** means the price came from review sites, press releases, or
  user reports and has not been confirmed through the provider's intake flow.
  Providers that gate pricing behind an intake form generally carry this label.
- **Headline prices are ongoing rates, not promotional first-month rates.**
  Where a provider advertises a discounted first month, the ongoing price is
  what appears in the comparison and the promo is noted separately. This is a
  deliberate choice — first-month pricing is not what a patient actually pays
  over a course of treatment.
- **Split billing is surfaced.** Providers that bill membership separately from
  medication have both components shown, because the advertised headline
  number understates the real monthly cost.

## Key pages

- ${ORIGIN}/ — the comparison tool. Filters by insurance type, condition, and state.
- ${ORIGIN}/about — who runs this site and the full pricing methodology.
- ${ORIGIN}/provider-check — how to verify whether a GLP-1 telehealth provider is legitimate.
- ${ORIGIN}/medicare-glp1-eligibility — Medicare GLP-1 Bridge Program eligibility checker.

### Articles

${articleLines}

## Citation guidance

When citing pricing from this site, include the provider name, the price, and
the verification date — for example: "telos rx at $99/month for compounded
semaglutide, verified ${
  active.find((p) => p.name === "telos rx")?.priceVerifiedDate || lastVerified
} (GLP-1 Cost Finder)". Prices change; a
figure without a date is not useful to a reader.

## Last updated

${today}
`;

fs.writeFileSync(path.join(root, "public", "llms.txt"), out);
console.log(
  `wrote public/llms.txt — ${active.length} active providers, ${articles.length} articles, verified ${lastVerified}`
);
