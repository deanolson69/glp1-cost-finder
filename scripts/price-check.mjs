// Monthly price-verification report for src/data/providers.json.
//
// The Cowork agent runs this on a schedule to identify which provider
// entries need a manual re-verification pass. Two conditions surface a row:
//
//   STALE    : priceVerifiedDate is more than 35 days old (one month-ish,
//              with a one-week grace window to absorb the operator's busy
//              days). The agent should re-check the provider's public page
//              and update prices + bump the date.
//
//   ALL-NULL : every fee field is null (baseMedPrice, membershipFee,
//              consultationFee, shippingFee, totalMonthlyMin,
//              totalMonthlyMax). The card on the live site will read
//              "Pricing not disclosed" -- that's honest, but worth keeping
//              tabs on in case the provider starts publishing pricing.
//
// `active: false` providers (e.g. when a brand's site is offline) are
// listed at the bottom of the report under DISABLED, so we don't lose
// track of them.
//
// Usage:  npm run price:check

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const providersPath = path.join(projectRoot, "src", "data", "providers.json");

const STALE_THRESHOLD_DAYS = 35;

const providers = JSON.parse(fs.readFileSync(providersPath, "utf8"));

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function daysAgo(isoDate) {
  if (!isoDate) return Infinity;
  const d = new Date(isoDate + "T00:00:00Z");
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((today - d) / 86400000);
}

function isAllNull(p) {
  return (
    p.baseMedPrice === null &&
    p.membershipFee === null &&
    p.consultationFee === null &&
    p.shippingFee === null &&
    p.totalMonthlyMin === null &&
    p.totalMonthlyMax === null
  );
}

const active = providers.filter((p) => p.active !== false);
const disabled = providers.filter((p) => p.active === false);

console.log("# price:check report");
console.log("# providers.json:    " + path.relative(projectRoot, providersPath));
console.log("# active providers:  " + active.length);
console.log("# disabled:          " + disabled.length);
console.log("# stale threshold:   " + STALE_THRESHOLD_DAYS + " days");
console.log("# run date:          " + today.toISOString().slice(0, 10));
console.log();

const rows = [["Provider", "Verified", "Age(d)", "AllNull", "Website", "Flags"]];
const issues = [];

for (const p of active) {
  const age = daysAgo(p.priceVerifiedDate);
  const stale = age > STALE_THRESHOLD_DAYS;
  const allNull = isAllNull(p);
  const flags = [];
  if (stale) flags.push("STALE");
  if (allNull) flags.push("ALL-NULL");

  if (flags.length > 0) {
    issues.push({ name: p.name, flags });
  }

  rows.push([
    p.name,
    p.priceVerifiedDate || "(none)",
    isFinite(age) ? String(age) : "?",
    allNull ? "yes" : "",
    p.website ? p.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "(missing)",
    flags.join(",") || "ok",
  ]);
}

// Column-align
const widths = rows[0].map((_, i) =>
  Math.max(...rows.map((r) => String(r[i]).length))
);
for (const row of rows) {
  console.log(row.map((c, i) => String(c).padEnd(widths[i])).join("  "));
}

if (disabled.length > 0) {
  console.log("\n# DISABLED (preserved, not rendered):");
  for (const p of disabled) {
    console.log(
      "  - " +
        p.name +
        (p.inactiveReason ? "  -- " + p.inactiveReason : "")
    );
  }
}

console.log();
if (issues.length === 0) {
  console.log("OK: all active providers verified within " + STALE_THRESHOLD_DAYS + " days and at least one pricing field populated.");
  process.exit(0);
}
console.log("ATTENTION: " + issues.length + " provider(s) need follow-up:");
for (const i of issues) {
  console.log("  - " + i.name + ": " + i.flags.join(", "));
}
// Non-zero exit so CI / scheduled-task wrappers can surface the alert.
process.exit(1);
