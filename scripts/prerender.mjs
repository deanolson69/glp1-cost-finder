// Build-time prerender pass.
//
// Approach: pure-Node SSR (no headless browser needed, works in any Render
// build environment). Vite produces two builds:
//
//   1. `vite build` -> dist/ (client bundle + index.html template)
//   2. `vite build --ssr src/entry-server.jsx --outDir dist/server`
//      -> dist/server/entry-server.js (imports App + renderToString)
//
// This script then:
//   - imports the SSR bundle's `render(url)` function,
//   - renders each React route to an HTML string,
//   - injects route-specific <title>, <meta description>, and canonical link
//     into the client index.html template,
//   - writes the result to dist/<route>/index.html so Render's static-file
//     resolver serves it before the SPA rewrite fires.
//
// useSeoMeta and useCanonical run inside useEffect, which doesn't fire during
// SSR -- so this script injects title/description/canonical from the
// ROUTES_META table below. Keep that table in sync with the matching values
// in src/App.jsx (the React components handle client-side navigation; this
// script handles first-paint HTML). Drift would show up as a mismatch between
// the prerendered <head> and what a user sees after navigating in-app.
//
// JSON-LD is now rendered directly inside the React tree (see JsonLd in
// App.jsx) so it lands in SSR output automatically. No extra injection here.
//
// Article pages in public/articles/*.html are NOT in scope -- they're already
// static HTML and ship through Vite's public/ copy step.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const ORIGIN = "https://glp1costfinder.com";

// Route table.
//
// `breadcrumb` is an array of {name, url} pairs ordered Home -> deepest. Empty
// (or omitted) on the homepage, since a one-item breadcrumb is a smell. The
// `breadcrumbName` is the visible label used in the BreadcrumbList JSON-LD.
const ROUTES_META = {
  "/": {
    title: "GLP-1 Cost Finder — Find the Cheapest Way to Get Your GLP-1",
    description:
      "Find the cheapest way to get GLP-1 medications like Ozempic, Wegovy, Mounjaro, Zepbound, and Foundayo. Compare real self-pay prices by insurance type and condition. No jargon. No guesswork.",
    breadcrumb: [],
    includeWebApplication: true,
  },
  "/about": {
    title: "About GLP-1 Cost Finder",
    description:
      "GLP-1 Cost Finder is an independent cost comparison tool. Learn about our methodology, editorial standards, and how we verify pricing.",
    breadcrumb: [{ name: "About", url: "/about" }],
    pageType: "AboutPage",
  },
  "/medicare-glp1-eligibility": {
    title: "Am I Eligible for the Medicare GLP-1 Bridge Program? | Free Eligibility Checker",
    description:
      "Answer 5 quick questions to check if you qualify for the Medicare GLP-1 Bridge Program starting July 2026. Free, instant results — no email required.",
    breadcrumb: [{ name: "Medicare Bridge eligibility checker", url: "/medicare-glp1-eligibility" }],
    includeWebApplication: true,
  },
  // Provider detail routes use a TRAILING SLASH in their canonical URL.
  // Render's SPA wildcard rewrite catches bare nested paths
  // (/providers/foo) before its directory-index auto-resolution runs, so
  // the bare URL serves the SPA shell instead of the prerendered HTML.
  // The trailing-slash URL hits the directory directly and serves the
  // prerendered file correctly. Sitemap and internal links use the
  // trailing-slash form too.
  "/providers/ro-weight-loss-cost/": {
    title: "Ro Weight Loss Cost 2026: What You'll Actually Pay Per Month",
    description:
      "Ro advertises GLP-1 programs \"from $39/mo\" but that's just the first month. Here's what Ro Body actually costs month after month, including the membership and medication fees they don't show upfront.",
    breadcrumb: [
      { name: "Providers", url: "/" },
      { name: "Ro Weight Loss Cost", url: "/providers/ro-weight-loss-cost/" },
    ],
  },
  "/providers/hims-glp1-cost/": {
    title: "Hims Weight Loss Cost 2026: Real Monthly Prices for GLP-1 Medications",
    description:
      "Hims charges a $149/mo membership AND separate medication fees starting at $149/mo. Here's the complete cost breakdown for Wegovy, Zepbound, and Foundayo through Hims.",
    breadcrumb: [
      { name: "Providers", url: "/" },
      { name: "Hims GLP-1 Cost", url: "/providers/hims-glp1-cost/" },
    ],
  },
  "/providers/noom-med-cost/": {
    title: "Noom Med GLP-1 Cost 2026: Microdose vs Brand-Name Pricing Explained",
    description:
      "Noom Med offers compounded microdose GLP-1s from $99/mo all-in, or brand-name access from $69/mo plus medication costs. Here's exactly what each path costs.",
    breadcrumb: [
      { name: "Providers", url: "/" },
      { name: "Noom Med Cost", url: "/providers/noom-med-cost/" },
    ],
  },
  "/provider-check": {
    title: "Is This GLP-1 Provider Legitimate? | Provider Safety Checker",
    description:
      "Check if a telehealth GLP-1 provider is legitimate. Verification checklist, red flags to watch for, and verified provider status for 9 major telehealth platforms.",
    breadcrumb: [{ name: "Provider safety checker", url: "/provider-check" }],
    faq: [
      { q: "How do I know if a GLP-1 provider is legitimate?", a: "Work through the six-step checklist on this page: check the FDA warning letter database, verify state pharmacy licensing via NABP, confirm a named licensed prescriber reviews your medical history, look up the business on your Secretary of State registry or BBB.org, confirm the provider requires a real prescription, and inspect any medication you receive for FDA-approved labels from the manufacturer with your name and prescriber on the pharmacy label." },
      { q: "What are the red flags for fake GLP-1 providers?", a: "Top warning signs: no medical questionnaire or prescriber consultation, prices far below market rate, no verifiable pharmacy license or prescriber credentials, no clear cancellation/refund policy, high-pressure urgency tactics, claims of \"exclusive\" formulations, plain or foreign-language packaging on received medication, no physical address or About page, payment by crypto or wire transfer only, and unsolicited social-media or email ads selling GLP-1s without a prescription." },
      { q: "Is it safe to buy GLP-1 medications from a telehealth provider?", a: "Yes, when the provider is a licensed telehealth platform that requires a real medical questionnaire, has a named licensed prescriber sign off on your prescription, and fills through a state-licensed pharmacy. Major telehealth providers like Hims, Ro, Noom Med, and the others verified on this page meet those criteria. The risk is not telehealth itself -- it's illegitimate sellers who skip those steps." },
      { q: "How can I check if a pharmacy is licensed in my state?", a: "Use the National Association of Boards of Pharmacy (NABP) state-board directory at nabp.pharmacy/members/boards-of-pharmacy/ to find your state's pharmacy licensing board, then look up the pharmacy by name. NABP's safe.pharmacy site also lists VIPPS-accredited online pharmacies. Verify the license is active in YOUR state, not just the state the pharmacy is based in." },
      { q: "What should I do if I think I received counterfeit GLP-1 medication?", a: "Stop using it immediately and don't dispose of it -- you'll need it for any investigation. Report to the FDA MedWatch program (fda.gov/safety/medwatch), file an FTC complaint at reportfraud.ftc.gov, and contact your prescriber to discuss what to do next. If you paid by credit card, contact your card issuer to dispute the charge. If you have safety concerns, contact your doctor or poison control (1-800-222-1222)." },
      { q: "Are compounded GLP-1 medications safe?", a: "Compounded medications occupy a different regulatory category from FDA-approved drugs. FDA-registered 503B outsourcing facilities can legally compound certain medications during drug shortages, and 503A pharmacies can compound on a per-prescription basis. Compounded products are NOT FDA-approved, and the FDA has issued warnings about some compounded semaglutide products. Check whether your specific medication comes from a 503B facility (more oversight) vs. a 503A pharmacy. The GLP-1 shortage situation has been evolving -- check FDA.gov for the current status of any specific drug shortage before relying on compounded as a long-term option." },
    ],
  },
  "/privacy": {
    title: "Privacy Policy | GLP-1 Cost Finder",
    description:
      "How GLP-1 Cost Finder collects, uses, and protects your information. Email capture, analytics, affiliate links, and your rights.",
    breadcrumb: [{ name: "Privacy Policy", url: "/privacy" }],
  },
  "/terms": {
    title: "Terms of Use | GLP-1 Cost Finder",
    description:
      "Terms of use for GLP-1 Cost Finder. Site purpose, medical disclaimer, affiliate disclosure, limitations of liability, governing law.",
    breadcrumb: [{ name: "Terms of Use", url: "/terms" }],
  },
  "/contact": {
    title: "Contact | GLP-1 Cost Finder",
    description:
      "Contact GLP-1 Cost Finder. Email dean@olsoncoaches.com for questions, partnerships, or to report a pricing issue. Response within 48 hours.",
    breadcrumb: [{ name: "Contact", url: "/contact" }],
  },
  "/cheapest-glp1-without-insurance": {
    title: "Cheapest GLP-1 Without Insurance in 2026 | GLP-1 Cost Finder",
    description:
      "Compare the cheapest ways to get Ozempic, Wegovy, Mounjaro, and Zepbound without insurance. Real self-pay prices from 9+ telehealth providers.",
    breadcrumb: [{ name: "Cheapest GLP-1 Without Insurance", url: "/cheapest-glp1-without-insurance" }],
  },
  "/ozempic-vs-mounjaro-cost": {
    title: "Ozempic vs Mounjaro Cost Comparison 2026 | GLP-1 Cost Finder",
    description:
      "Side-by-side cost comparison of Ozempic vs Mounjaro — insurance, copay cards, telehealth, and self-pay prices compared.",
    breadcrumb: [{ name: "Ozempic vs Mounjaro Cost", url: "/ozempic-vs-mounjaro-cost" }],
  },
  "/glp1-self-pay-options": {
    title: "GLP-1 Self-Pay Options Ranked by Price | GLP-1 Cost Finder",
    description:
      "Every GLP-1 self-pay option ranked by real monthly cost. Telehealth providers, compounding pharmacies, and manufacturer programs compared.",
    breadcrumb: [{ name: "GLP-1 Self-Pay Options", url: "/glp1-self-pay-options" }],
  },
};

const OG_IMAGE_URL = ORIGIN + "/og-image.png";

const ssrEntryPath = path.join(projectRoot, "dist", "server", "entry-server.js");
if (!fs.existsSync(ssrEntryPath)) {
  console.error(`SSR bundle not found at ${ssrEntryPath}`);
  console.error(
    `Run "vite build --ssr src/entry-server.jsx --outDir dist/server" first.`
  );
  process.exit(1);
}

const { render } = await import(pathToFileURL(ssrEntryPath).href);
const templatePath = path.join(projectRoot, "dist", "index.html");
const template = fs.readFileSync(templatePath, "utf8");

function escAttr(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function escText(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Rewrites a meta tag with a given property/name; appends one before </head>
// if it doesn't yet exist. Two helpers so we don't construct two slightly
// different regexes inline at every call site.
function setMetaProperty(html, property, content) {
  const re = new RegExp(`<meta property="${property}" content="[^"]*"\\s*/?>`);
  const tag = `<meta property="${property}" content="${escAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}
function setMetaName(html, name, content) {
  const re = new RegExp(`<meta name="${name}" content="[^"]*"\\s*/?>`);
  const tag = `<meta name="${name}" content="${escAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

// Per-route JSON-LD. Site-wide Organization + WebSite already live in the
// index.html template, so this script only adds the route-specific layers:
// WebApplication (homepage) and BreadcrumbList (anything deeper than home).
function buildRouteJsonLd(route, meta) {
  const graph = [];

  if (meta.includeWebApplication) {
    // Homepage uses the long-standing comparison-tool name; other routes
    // (e.g. /medicare-glp1-eligibility) get a route-specific name derived
    // from their page title.
    const isHome = route === "/";
    graph.push({
      "@type": "WebApplication",
      name: isHome
        ? "GLP-1 Cost Comparison Tool"
        : meta.title.replace(/\s*\|.*$/, "").trim(),
      url: ORIGIN + route,
      applicationCategory: "HealthApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      provider: { "@id": ORIGIN + "/#organization" },
    });
  }

  // pageType is the schema.org WebPage subtype this route represents -- e.g.
  // "AboutPage" for /about. Only emit when explicitly set; most routes don't
  // need a specific WebPage subtype since they're either the homepage
  // (WebApplication covers it) or just generic content.
  if (meta.pageType) {
    graph.push({
      "@type": meta.pageType,
      "@id": ORIGIN + route + "#" + meta.pageType.toLowerCase(),
      url: ORIGIN + route,
      name: meta.title,
      description: meta.description,
      isPartOf: { "@id": ORIGIN + "/#website" },
      about: { "@id": ORIGIN + "/#organization" },
    });
  }

  if (meta.faq && meta.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: meta.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  if (meta.breadcrumb && meta.breadcrumb.length > 0) {
    const items = [
      { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN + "/" },
    ];
    meta.breadcrumb.forEach((crumb, i) => {
      items.push({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: ORIGIN + crumb.url,
      });
    });
    graph.push({ "@type": "BreadcrumbList", itemListElement: items });
  }

  if (graph.length === 0) return "";
  const doc = { "@context": "https://schema.org", "@graph": graph };
  return `    <script type="application/ld+json">\n${JSON.stringify(doc, null, 2)
    .split("\n")
    .map((l) => "    " + l)
    .join("\n")}\n    </script>\n  `;
}

function buildPage(route, meta, appHtml) {
  const canonical = ORIGIN + route;
  let out = template
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escText(meta.title)}</title>`
    )
    .replace(
      /<meta name="description" content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escAttr(meta.description)}" />`
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    );

  // Canonical
  if (/rel="canonical"/.test(out)) {
    out = out.replace(
      /<link rel="canonical"[^>]*\/?>/,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    out = out.replace(
      "</head>",
      `    <link rel="canonical" href="${canonical}" />\n  </head>`
    );
  }

  // Open Graph (per-route values). og:type stays "website" for all React
  // routes -- only static article HTMLs use og:type="article".
  out = setMetaProperty(out, "og:type", "website");
  out = setMetaProperty(out, "og:site_name", "GLP-1 Cost Finder");
  out = setMetaProperty(out, "og:title", meta.title);
  out = setMetaProperty(out, "og:description", meta.description);
  out = setMetaProperty(out, "og:url", canonical);
  out = setMetaProperty(out, "og:image", OG_IMAGE_URL);
  out = setMetaProperty(out, "og:image:width", "1200");
  out = setMetaProperty(out, "og:image:height", "630");
  out = setMetaProperty(out, "og:image:alt", "GLP-1 Cost Finder — compare real GLP-1 prices");

  // Twitter
  out = setMetaName(out, "twitter:card", "summary_large_image");
  out = setMetaName(out, "twitter:title", meta.title);
  out = setMetaName(out, "twitter:description", meta.description);
  out = setMetaName(out, "twitter:image", OG_IMAGE_URL);

  // Per-route JSON-LD (WebApplication / BreadcrumbList). Injected just
  // before </head> so it sits alongside the site-wide Organization +
  // WebSite block already in the template.
  const routeJsonLd = buildRouteJsonLd(route, meta);
  if (routeJsonLd) {
    out = out.replace("</head>", `${routeJsonLd}</head>`);
  }

  return out;
}

const failures = [];
for (const [route, meta] of Object.entries(ROUTES_META)) {
  process.stdout.write(`prerender ${route.padEnd(38)} `);
  let appHtml;
  try {
    appHtml = render(route);
  } catch (err) {
    failures.push({ route, error: err.message });
    console.log(`FAIL render: ${err.message}`);
    continue;
  }

  const html = buildPage(route, meta, appHtml);
  const outPath =
    route === "/"
      ? path.join(projectRoot, "dist", "index.html")
      : path.join(projectRoot, "dist", route.slice(1), "index.html");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log(`→ ${path.relative(projectRoot, outPath)}`);
  console.log(`    title: "${meta.title}"`);
}

// Clean up the SSR bundle — it's only needed during the build, not deployed.
const serverDir = path.join(projectRoot, "dist", "server");
if (fs.existsSync(serverDir)) {
  fs.rmSync(serverDir, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error("\nprerender failures:");
  for (const f of failures) console.error(`  ${f.route}: ${f.error}`);
  process.exit(1);
}
console.log(`\nprerender complete: ${Object.keys(ROUTES_META).length} routes`);
