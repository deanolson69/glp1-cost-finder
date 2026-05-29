import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import providersData from "./data/providers.json";

// ─── STATE DATA (All 50 states + DC) ───
const stateData = {
  AL:{name:"Alabama",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  AK:{name:"Alaska",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  AZ:{name:"Arizona",medicaid:{wl:"No",diabetes:"Yes",detail:"AHCCCS covers for diabetes and some conditions, not general weight loss."}},
  AR:{name:"Arkansas",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  CA:{name:"California",medicaid:{wl:"No",diabetes:"Yes",detail:"Medi-Cal cut weight loss coverage Jan 2026. Diabetes continues."}},
  CO:{name:"Colorado",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  CT:{name:"Connecticut",medicaid:{wl:"No",diabetes:"Yes",detail:"HUSKY covers for diabetes only."}},
  DE:{name:"Delaware",medicaid:{wl:"No",diabetes:"Yes",detail:"Ended weight loss coverage Jan 2026. Diabetes continues."}},
  DC:{name:"District of Columbia",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  FL:{name:"Florida",medicaid:{wl:"No",diabetes:"Yes",detail:"Never covered for weight loss. Diabetes covered."}},
  GA:{name:"Georgia",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  HI:{name:"Hawaii",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  ID:{name:"Idaho",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  IL:{name:"Illinois",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  IN:{name:"Indiana",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  IA:{name:"Iowa",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  KS:{name:"Kansas",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Covers for both weight loss and diabetes. Prior auth required."}},
  KY:{name:"Kentucky",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  LA:{name:"Louisiana",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  ME:{name:"Maine",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  MD:{name:"Maryland",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  MA:{name:"Massachusetts",medicaid:{wl:"Limited",diabetes:"Yes",detail:"Zepbound (preferred) for obesity. Wegovy removed. Diabetes covered."}},
  MI:{name:"Michigan",medicaid:{wl:"Limited",diabetes:"Yes",detail:"Very restrictive for weight loss as of Jan 2026. Diabetes covered."}},
  MN:{name:"Minnesota",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Covers for both weight loss and diabetes. Prior auth required."}},
  MS:{name:"Mississippi",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Covers for both weight loss and diabetes."}},
  MO:{name:"Missouri",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  MT:{name:"Montana",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  NE:{name:"Nebraska",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  NV:{name:"Nevada",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  NH:{name:"New Hampshire",medicaid:{wl:"No",diabetes:"Yes",detail:"Eliminated weight loss coverage Jan 2026. Diabetes continues."}},
  NJ:{name:"New Jersey",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  NM:{name:"New Mexico",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  NY:{name:"New York",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  NC:{name:"North Carolina",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Reinstated weight loss coverage Dec 2025. Wegovy preferred."}},
  ND:{name:"North Dakota",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  OH:{name:"Ohio",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  OK:{name:"Oklahoma",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  OR:{name:"Oregon",medicaid:{wl:"No",diabetes:"Yes",detail:"Excludes weight loss drugs. Diabetes covered."}},
  PA:{name:"Pennsylvania",medicaid:{wl:"No",diabetes:"Yes",detail:"Cut weight loss coverage for adults Jan 2026. Diabetes continues."}},
  RI:{name:"Rhode Island",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Covers for both weight loss and diabetes."}},
  SC:{name:"South Carolina",medicaid:{wl:"No",diabetes:"Yes",detail:"Eliminated weight loss coverage late 2025. Diabetes continues."}},
  SD:{name:"South Dakota",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  TN:{name:"Tennessee",medicaid:{wl:"No",diabetes:"Yes",detail:"TennCare covers for diabetes, not weight loss."}},
  TX:{name:"Texas",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  UT:{name:"Utah",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  VT:{name:"Vermont",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes, not weight loss."}},
  VA:{name:"Virginia",medicaid:{wl:"Limited",diabetes:"Yes",detail:"Diabetes covered. Weight loss requires BMI 40+ or 35+ with 2+ conditions."}},
  WA:{name:"Washington",medicaid:{wl:"Limited",diabetes:"Yes",detail:"Diabetes covered. Weight loss varies by managed care plan."}},
  WV:{name:"West Virginia",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}},
  WI:{name:"Wisconsin",medicaid:{wl:"Yes",diabetes:"Yes",detail:"Covers for both weight loss and diabetes. Prior auth required."}},
  WY:{name:"Wyoming",medicaid:{wl:"No",diabetes:"Yes",detail:"Covers for diabetes only."}}
};

// ─── MEDICATIONS ───
const medications = [
  { name:"Ozempic", type:"injection", typeLabel:"Weekly injection", maker:"Novo Nordisk",
    conditions:["diabetes","heart","kidney"],
    indications:["Type 2 diabetes","Cardiovascular risk","Kidney disease"],
    coveredFor:"diabetes, cardiovascular risk, kidney disease",
    indicationDetail:"FDA-approved for Type 2 diabetes, reducing cardiovascular events, and kidney disease progression. Commonly prescribed off-label for weight loss.",
    howItWorks:"Mimics GLP-1 hormone to reduce appetite and slow digestion. Injected once weekly with a pre-filled pen.",
    selfPay:{price:"$199/mo",where:"TrumpRx or GoodRx",note:"TrumpRx $199/mo. GoodRx $199 for first 2 fills through 6/30/26, then $349. Maintenance dose (2mg) $499/mo.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"GoodRx",url:"https://www.goodrx.com/ozempic"}]},
    withInsurance:{price:"$25/mo",how:"Novo Nordisk savings card",note:"If your plan covers Ozempic, the savings card drops your copay to $25/mo (max $100/mo savings). 82% of commercial plans cover it for diabetes."},
    doses:[
      {phase:"Month 1-2",dose:"0.25-0.5mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$199",hl:true},{s:"TrumpRx",p:"$199",hl:true}]},
      {phase:"Month 3-4",dose:"1mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$349",hl:true},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 5+",dose:"2mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$499",hl:false},{s:"TrumpRx",p:"$350",hl:true}]}
    ],
    savingsCard:{copay:"$25/mo",detail:"Commercial insurance only. Max $100/mo savings. Not available for government insurance or uninsured.",url:"https://www.ozempic.com/savings-and-resources/save-on-ozempic.html"},
    pap:{available:true,detail:"FREE via Novo Nordisk PAP. Must be uninsured, income under ~$31,200/yr, and have a diabetes prescription. Up to 12 months, renewable.",url:"https://www.novocare.com/pap.html"}
  },
  { name:"Wegovy", type:"injection", typeLabel:"Weekly injection", maker:"Novo Nordisk",
    conditions:["weightloss","heart","liver"],
    indications:["Weight management","Cardiovascular risk","MASH (liver)"],
    coveredFor:"weight management, cardiovascular risk, MASH",
    indicationDetail:"FDA-approved for weight management (BMI 30+, or 27+ with related condition), reducing cardiovascular events, and noncirrhotic MASH (liver disease).",
    howItWorks:"Same active ingredient as Ozempic (semaglutide) at higher doses for weight loss. Injected once weekly.",
    selfPay:{price:"$199/mo",where:"TrumpRx",note:"TrumpRx, GoodRx, and NovoCare all offer $199/mo for the first 2 fills (0.25mg/0.5mg only) through 6/30/26. After that, $349/mo for 0.25-2.4mg doses; $399/mo for HD 7.2mg.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"NovoCare",url:"https://www.novocare.com/wegovy/savings-offer.html"}]},
    withInsurance:{price:"$25/mo",how:"Novo Nordisk savings card",note:"If covered, savings card drops copay to $25/mo. Only 30-40% of commercial plans cover Wegovy for weight loss."},
    doses:[
      {phase:"Month 1",dose:"0.25mg",prices:[{s:"Retail",p:"$1,350",hl:false},{s:"TrumpRx",p:"$199",hl:true},{s:"GoodRx",p:"$199",hl:true}]},
      {phase:"Month 2-4",dose:"0.5-1.7mg",prices:[{s:"Retail",p:"$1,350",hl:false},{s:"TrumpRx",p:"$199",hl:true},{s:"GoodRx",p:"$299-$349",hl:false}]},
      {phase:"Month 5+",dose:"2.4mg",prices:[{s:"Retail",p:"$1,350",hl:false},{s:"TrumpRx",p:"$199",hl:true},{s:"GoodRx",p:"$349",hl:true}]}
    ],
    savingsCard:{copay:"$25/mo",detail:"Commercial insurance only. Max $100/mo. Not available for government insurance or uninsured.",url:"https://www.novocare.com/eligibility/wegovy-savings-card.html"},
    pap:{available:false,detail:"Wegovy is NOT covered by Novo Nordisk's Patient Assistance Program."}
  },
  { name:"Wegovy Pill", type:"pill", typeLabel:"Daily pill", maker:"Novo Nordisk",
    conditions:["weightloss"],
    indications:["Weight management"],
    coveredFor:"weight management",
    indicationDetail:"Oral semaglutide approved Dec 2025 for weight management. Same ingredient as Wegovy injection in pill form.",
    howItWorks:"Take daily on an empty stomach with a small sip of water. Wait 30 minutes before eating or taking other medications.",
    selfPay:{price:"$149/mo",where:"TrumpRx, NovoCare, or GoodRx",note:"1.5mg permanently $149/mo. 4mg $149/mo through 8/31/26, then $199/mo. Maintenance 9mg and 25mg are $299/mo on TrumpRx and NovoCare.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"NovoCare",url:"https://www.novocare.com/wegovy/savings-offer.html"}]},
    withInsurance:{price:"$25/mo",how:"Novo Nordisk savings card",note:"Coverage for oral Wegovy is still emerging. If covered, savings card drops copay to $25/mo."},
    doses:[
      {phase:"Starting",dose:"1.5mg",prices:[{s:"Retail",p:"$1,349",hl:false},{s:"TrumpRx",p:"$149",hl:true},{s:"NovoCare",p:"$149",hl:true}]},
      {phase:"Escalation",dose:"4-9mg",prices:[{s:"Retail",p:"$1,349",hl:false},{s:"TrumpRx",p:"$149",hl:true},{s:"NovoCare (4mg)",p:"$149",hl:true}]},
      {phase:"Maintenance",dose:"25mg",prices:[{s:"Retail",p:"$1,349",hl:false},{s:"TrumpRx",p:"$149",hl:true},{s:"NovoCare",p:"$299",hl:true}]}
    ],
    savingsCard:{copay:"$25/mo",detail:"Commercial insurance only. Not available for government insurance or uninsured.",url:"https://www.novocare.com/eligibility/wegovy-savings-card.html"},
    pap:{available:false,detail:"No patient assistance program exists for oral Wegovy."}
  },
  { name:"Mounjaro", type:"injection", typeLabel:"Weekly injection", maker:"Eli Lilly",
    conditions:["diabetes","sleep"],
    indications:["Type 2 diabetes","Sleep apnea"],
    coveredFor:"diabetes, sleep apnea",
    indicationDetail:"FDA-approved for Type 2 diabetes and obstructive sleep apnea. Commonly prescribed off-label for weight loss.",
    howItWorks:"Dual GIP/GLP-1 receptor agonist that targets two appetite hormones. Some studies show greater weight loss than semaglutide. Injected once weekly.",
    selfPay:{price:"$1,097/mo",where:"GoodRx",note:"If you're self-pay, Zepbound (same active ingredient — tirzepatide) is $299/mo and is the right choice for most uninsured patients. Mounjaro itself is NOT on TrumpRx (404) and not offered through LillyDirect self-pay; GoodRx ~$1,097/mo is the only verified Mounjaro self-pay channel. With commercial insurance, the Lilly savings card brings copay to $25/mo (~82% of plans cover Mounjaro for diabetes).",links:[{label:"GoodRx",url:"https://www.goodrx.com/mounjaro"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/mo if covered (max $1,950/yr). Even if NOT covered, up to $499 off per fill (max $8,411/yr, 13 fills). Works either way with commercial insurance."},
    doses:[
      {phase:"Month 1-2",dose:"2.5-5mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"GoodRx",p:"$1,097",hl:false}]},
      {phase:"Month 3-4",dose:"7.5-10mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"GoodRx",p:"$1,097",hl:false}]},
      {phase:"Month 5+",dose:"12.5-15mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"GoodRx",p:"$1,097",hl:false}]}
    ],
    savingsCard:{copay:"$25/mo (covered) or up to $499 off (not covered)",detail:"Works with commercial insurance whether your plan covers Mounjaro or not. Max 13 fills/yr. Expires 12/31/2026. Not for government insurance or uninsured.",url:"https://mounjaro.lilly.com/savings-resources"},
    pap:{available:false,detail:"Mounjaro is NOT on the Lilly Cares available medications list."}
  },
  { name:"Zepbound", type:"injection", typeLabel:"Weekly injection", maker:"Eli Lilly",
    conditions:["weightloss","sleep"],
    indications:["Weight management","Sleep apnea"],
    coveredFor:"weight management, sleep apnea",
    indicationDetail:"FDA-approved for chronic weight management and obstructive sleep apnea. Same active ingredient as Mounjaro (tirzepatide).",
    howItWorks:"Dual-action GIP/GLP-1 receptor agonist. Injected once weekly with a pre-filled pen.",
    selfPay:{price:"$299/mo",where:"TrumpRx or LillyDirect",note:"LillyDirect $299 (2.5mg), $399 (5mg), $449 (7.5mg+). TrumpRx $299/mo flat at all doses.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"LillyDirect",url:"https://www.lillydirect.com"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/mo if covered. If NOT covered, up to $650 off per fill. Only 30-40% of commercial plans cover Zepbound for weight loss."},
    doses:[
      {phase:"Month 1",dose:"2.5mg",prices:[{s:"Retail",p:"$1,086",hl:false},{s:"TrumpRx",p:"$299",hl:true},{s:"LillyDirect",p:"$299",hl:true}]},
      {phase:"Month 2-3",dose:"5-10mg",prices:[{s:"Retail",p:"$1,086",hl:false},{s:"TrumpRx",p:"$299",hl:true},{s:"LillyDirect",p:"$399-$449",hl:true}]},
      {phase:"Month 5+",dose:"12.5-15mg",prices:[{s:"Retail",p:"$1,086",hl:false},{s:"TrumpRx",p:"$299",hl:true},{s:"LillyDirect",p:"$449",hl:false}]}
    ],
    savingsCard:{copay:"$25/mo (covered) or up to $650 off (not covered)",detail:"Works with commercial insurance whether your plan covers Zepbound or not. Expires 12/31/2026. Not for government insurance or uninsured.",url:"https://zepbound.lilly.com/savings"},
    pap:{available:false,detail:"Zepbound is NOT covered by Lilly Cares."}
  },
  { name:"Foundayo", type:"pill", typeLabel:"Daily pill", maker:"Eli Lilly",
    conditions:["weightloss"],
    indications:["Weight management"],
    coveredFor:"weight management",
    indicationDetail:"FDA-approved April 1, 2026. Newest GLP-1 on the market. 12.4% body weight loss in Phase 3 trials at highest dose (17.2mg).",
    howItWorks:"Oral orforglipron. Unlike the Wegovy pill, does NOT require an empty stomach. Take once daily at any time, with or without food.",
    selfPay:{price:"$149/mo",where:"LillyDirect, Amazon Pharmacy, or GoodRx",note:"LillyDirect: 0.8mg $149/mo, 2.5mg $199/mo, 5.5mg and 9mg $299/mo (no refill rule). 14.5mg and 17.2mg are $299/mo with 45-day refill, $349/mo otherwise. Amazon Pharmacy matches at $149/mo cash, $25/mo with insurance. The most affordable GLP-1 available.",links:[{label:"LillyDirect",url:"https://www.lillydirect.com"},{label:"Amazon Pharmacy",url:"https://pharmacy.amazon.com"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/fill, max $100/mo savings, $1,000/yr cap, 10 fills/yr. Foundayo is only weeks old so most insurers haven't made coverage decisions yet."},
    doses:[
      {phase:"Starting",dose:"0.8mg",prices:[{s:"Retail",p:"~$900",hl:false},{s:"LillyDirect",p:"$149",hl:true},{s:"Amazon",p:"$149",hl:true}]},
      {phase:"Escalation",dose:"2.5-5.5mg",prices:[{s:"Retail",p:"~$900",hl:false},{s:"LillyDirect",p:"$199-$299",hl:true},{s:"Amazon",p:"$199-$299",hl:true}]},
      {phase:"Maintenance",dose:"9-17.2mg",prices:[{s:"Retail",p:"~$900",hl:false},{s:"LillyDirect (45-day)",p:"$299",hl:true},{s:"LillyDirect (std)",p:"$349",hl:false}]}
    ],
    savingsCard:{copay:"$25/fill",detail:"Commercial insurance only. Max $100/mo, $1,000/yr cap, 10 fills/yr. Expires 12/31/2026. Not for government insurance or uninsured.",url:"https://foundayo.lilly.com/coverage-savings"},
    pap:{available:false,detail:"Too new. Not yet in any patient assistance program."}
  }
];

// ─── COVERAGE TABLE ───
const coverageTruth = [
  {condition:"Type 2 Diabetes", commercial:"82%", aca:"82%", medicare:"Yes ($50/mo cap)", medicaid:"All states", color:"#10b981", bg:"#d1fae5"},
  {condition:"Cardiovascular Risk", commercial:"~80%", aca:"~75%", medicare:"Yes ($50/mo cap)", medicaid:"Most states", color:"#3b82f6", bg:"#dbeafe"},
  {condition:"Sleep Apnea", commercial:"~40-50%", aca:"Varies", medicare:"Check your plan", medicaid:"Some states", color:"#8b5cf6", bg:"#ede9fe"},
  {condition:"MASH (Liver Disease)", commercial:"Emerging", aca:"Rarely", medicare:"Not yet", medicaid:"Rarely", color:"#f59e0b", bg:"#fef3c7"},
  {condition:"Weight Loss", commercial:"30-40%", aca:"Less than 1%", medicare:"July 2026*", medicaid:"13 states only", color:"#f43f5e", bg:"#ffe4e6"}
];

// ─── TELEHEALTH ───
// Telehealth provider list -- single source of truth lives in
// src/data/providers.json. Monthly verification pass edits that JSON file
// only, no React code changes needed. `scripts/price-check.mjs` reports
// which entries are stale (>35 days since priceVerifiedDate) or have all-
// null pricing.
//
// `active: false` entries (e.g. Strut Health currently offline) are
// preserved in the JSON so the data can be re-enabled later, but are
// filtered out of the rendered list here.
const telehealthOptions = providersData.filter((p) => p.active !== false);

// ─── INTAKE OPTIONS ───
const insuranceOptions = [
  {label:"No insurance",value:"uninsured",icon:"\uD83D\uDCB3",desc:"I'm paying out of pocket"},
  {label:"Private insurance",value:"commercial",icon:"\uD83C\uDFE2",desc:"Employer, ACA, or marketplace plan"},
  {label:"Medicaid",value:"medicaid",icon:"\uD83C\uDFDB",desc:"State Medicaid program"},
  {label:"Medicare",value:"medicare",icon:"\uD83C\uDFE5",desc:"Medicare Part D"}
];

const conditionOptions = [
  {label:"Type 2 Diabetes",value:"diabetes",icon:"\uD83E\uDE78",desc:"Diagnosed with Type 2 diabetes"},
  {label:"Weight Loss",value:"weightloss",icon:"\u2696\uFE0F",desc:"Looking to lose weight (BMI 27+)"},
  {label:"Heart Health",value:"heart",icon:"\u2764\uFE0F",desc:"Cardiovascular risk reduction"},
  {label:"Sleep Apnea",value:"sleep",icon:"\uD83D\uDE34",desc:"Obstructive sleep apnea"},
  {label:"I'd rather not say",value:"skip",icon:"\uD83D\uDD12",desc:"Just show me the cheapest options"}
];

const allStateCodes = Object.keys(stateData).sort((a,b) => stateData[a].name.localeCompare(stateData[b].name));

// ─── PRIVACY POLICY PAGE ───
// Source of truth is privacy-policy.md at repo root; mirror changes here.
function PrivacyPage() {
  useSeoMeta(
    "Privacy Policy | GLP-1 Cost Finder",
    "How GLP-1 Cost Finder collects, uses, and protects your information. Email capture, analytics, affiliate links, and your rights."
  );
  const { wrap, inner, h1, h2, h3, p, ul, hr, link, backBtn } = legalStyles;
  return (
    <div style={wrap}>
      <div style={inner}>
        <Link to="/" style={backBtn}>&larr; Back to Home</Link>
        <h1 style={h1}>Privacy Policy for GLP-1 Cost Finder</h1>
        <p style={p}><strong>Effective Date:</strong> April 18, 2026<br/><strong>Last Updated:</strong> April 19, 2026</p>

        <h2 style={h2}>Our Commitment to Your Privacy</h2>
        <p style={p}>GLP-1 Cost Finder ("we," "us," "our," or "Website") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information.</p>
        <hr style={hr}/>

        <h2 style={h2}>1. Information We Collect</h2>
        <h3 style={h3}>Email Addresses</h3>
        <p style={p}>When you submit your email address through our email capture form, we collect that email address to add you to our mailing list (via Mailchimp). This is the primary way we collect personal information.</p>
        <h3 style={h3}>Information from Google Analytics</h3>
        <p style={p}>We use Google Analytics 4 to understand how people use our Website. This automatically collects:</p>
        <ul style={ul}>
          <li>Pages you visit and how long you spend on them</li>
          <li>Your general location (city/region level, not specific)</li>
          <li>Device information (browser type, operating system, device type)</li>
          <li>Referral source (how you found us)</li>
          <li>Interaction data (clicks, form submissions, scroll depth)</li>
        </ul>
        <p style={p}>Google Analytics uses cookies and similar tracking technologies to collect this data.</p>
        <h3 style={h3}>Information from Microsoft Clarity</h3>
        <p style={p}>We use Microsoft Clarity to understand how visitors interact with our Website. Clarity collects:</p>
        <ul style={ul}>
          <li>Mouse movements, clicks, and scroll behavior</li>
          <li>Session recordings (anonymized replays of how you navigate the site)</li>
          <li>Heatmap data (which areas of each page receive the most interaction)</li>
          <li>Page performance data (load times, errors)</li>
          <li>Device and browser information</li>
        </ul>
        <p style={p}>Clarity automatically masks sensitive content on the page. It does not collect passwords, payment information, or personal health data from form fields.</p>
        <h3 style={h3}>Other Information</h3>
        <ul style={ul}>
          <li><strong>IP Address:</strong> Automatically logged by our hosting provider for security and analytics purposes</li>
          <li><strong>Volunteer Information:</strong> Any information you provide when contacting us (e.g., support inquiries)</li>
        </ul>
        <hr style={hr}/>

        <h2 style={h2}>2. How We Use Your Information</h2>
        <h3 style={h3}>Email Addresses</h3>
        <p style={p}>We use your email address to:</p>
        <ul style={ul}>
          <li>Send you updates about GLP-1 pricing, news, and educational content</li>
          <li>Notify you of changes to our Website or services</li>
          <li>Respond to your inquiries or feedback</li>
        </ul>
        <h3 style={h3}>Analytics Data</h3>
        <p style={p}>We use Google Analytics and Microsoft Clarity data to:</p>
        <ul style={ul}>
          <li>Understand how visitors use our Website</li>
          <li>Improve Website performance and user experience</li>
          <li>Identify usability issues through session recordings and heatmaps (Clarity)</li>
          <li>Test new features and content</li>
          <li>Measure the effectiveness of our marketing efforts</li>
        </ul>
        <h3 style={h3}>General Uses</h3>
        <p style={p}>We may use information (in aggregated or anonymized form) to comply with legal obligations and protect our Website from fraud or abuse.</p>
        <hr style={hr}/>

        <h2 style={h2}>3. Email Communications and Your Choices</h2>
        <p style={p}>When you subscribe to our email list, you're consenting to receive promotional and informational emails. <strong>You can unsubscribe at any time</strong> by:</p>
        <ul style={ul}>
          <li>Clicking the "Unsubscribe" link at the bottom of any email we send</li>
          <li>Emailing us at <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a> with your request</li>
        </ul>
        <p style={p}>We will honor unsubscribe requests within 10 business days. You may also contact us to opt out of specific types of emails while remaining subscribed to others.</p>
        <hr style={hr}/>

        <h2 style={h2}>4. Third-Party Links and Affiliate Relationships</h2>
        <p style={p}>Our Website contains links to telehealth providers, pharmacies, manufacturers, and other third-party sites, including:</p>
        <ul style={ul}>
          <li>LillyDirect</li>
          <li>TrumpRx</li>
          <li>GoodRx</li>
          <li>NovoCare</li>
          <li>Other healthcare providers and retailers</li>
        </ul>
        <p style={p}><strong>We disclose that some of these links are affiliate links.</strong> This means we may earn a commission if you click through and make a purchase. This does not affect the price you pay&mdash;it's a way we help sustain the Website.</p>
        <p style={p}><strong>Important:</strong> We are not responsible for the privacy practices of linked websites. Each site has its own privacy policy. We encourage you to review the privacy policy of any third-party site before providing your information or making a purchase.</p>
        <hr style={hr}/>

        <h2 style={h2}>5. Cookies and Tracking Technologies</h2>
        <h3 style={h3}>Google Analytics Cookies</h3>
        <p style={p}>Google Analytics uses cookies to track your activity on our Website. These are persistent cookies that help Google Analytics recognize you on return visits. These cookies are used solely for analytics purposes and do not identify you personally.</p>
        <h3 style={h3}>Microsoft Clarity Cookies</h3>
        <p style={p}>Microsoft Clarity uses cookies and local storage to record session data, including mouse movements, clicks, and scrolling behavior. Clarity generates session recordings and heatmaps to help us understand how visitors interact with our pages. Clarity does not track you across other websites and masks sensitive content by default.</p>
        <h3 style={h3}>Your Cookie Choices</h3>
        <p style={p}>Most browsers allow you to control cookies through settings:</p>
        <ul style={ul}>
          <li>You can disable cookies in your browser settings</li>
          <li>You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={link}>Google Analytics Opt-Out Browser Add-On</a></li>
          <li>You can learn more about Microsoft Clarity's data practices at <a href="https://clarity.microsoft.com/faq" target="_blank" rel="noopener noreferrer" style={link}>Microsoft Clarity FAQ</a></li>
        </ul>
        <p style={p}><strong>We do not use cookies for purposes other than analytics and user experience improvement.</strong></p>
        <hr style={hr}/>

        <h2 style={h2}>6. Data Sharing and Third Parties</h2>
        <h3 style={h3}>We Do NOT:</h3>
        <ul style={ul}>
          <li>Sell your email address or personal data to third parties</li>
          <li>Share your information with unaffiliated marketers</li>
          <li>Provide your data to data brokers</li>
        </ul>
        <h3 style={h3}>We DO Share Data With:</h3>
        <ul style={ul}>
          <li><strong>Mailchimp:</strong> To manage our email list (subject to Mailchimp's privacy policy)</li>
          <li><strong>Google Analytics:</strong> To track Website usage (subject to Google's privacy policy)</li>
          <li><strong>Microsoft Clarity:</strong> To record session behavior and generate heatmaps (subject to Microsoft's privacy policy)</li>
          <li><strong>Render:</strong> Our hosting provider (subject to Render's privacy policy)</li>
          <li>Legal authorities: Only if required by law or to protect our rights, your safety, or others' safety</li>
        </ul>
        <hr style={hr}/>

        <h2 style={h2}>7. Data Retention</h2>
        <ul style={ul}>
          <li><strong>Email Addresses:</strong> Retained as long as you remain subscribed to our mailing list, or until you request deletion</li>
          <li><strong>Analytics Data:</strong> Retained by Google Analytics according to their standard retention policies (typically 14 months of inactivity); Microsoft Clarity retains session data for up to 30 days</li>
          <li><strong>Server Logs:</strong> Retained by our hosting provider for up to 90 days for security purposes</li>
        </ul>
        <p style={p}>If you wish to have your email address deleted from our records, contact us at <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a>.</p>
        <hr style={hr}/>

        <h2 style={h2}>8. Children's Privacy (COPPA)</h2>
        <p style={p}>Our Website is intended for adults seeking health information about GLP-1 medications. We do not knowingly collect information from children under 13 years old. If we become aware that a child under 13 has provided us with personal information, we will delete that information promptly. If you believe a child under 13 has provided us with information, please contact us immediately at <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a>.</p>
        <hr style={hr}/>

        <h2 style={h2}>9. California Privacy Rights (CCPA Basics)</h2>
        <p style={p}>If you are a California resident, you have certain privacy rights under the California Consumer Privacy Act (CCPA), including:</p>
        <ul style={ul}>
          <li>The right to know what personal information is collected</li>
          <li>The right to know whether your personal information is sold or disclosed</li>
          <li>The right to delete personal information collected from you</li>
          <li>The right to opt out of the sale of your personal information</li>
        </ul>
        <p style={p}>To exercise these rights, email us at <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a> with your request. We will respond within 45 days.</p>
        <p style={p}><strong>Note:</strong> We do not sell personal information, so there is no opt-out needed for data sales. However, our analytics and email marketing tools may involve data sharing as described in Section 6.</p>
        <hr style={hr}/>

        <h2 style={h2}>10. Data Security</h2>
        <p style={p}>We implement reasonable technical and organizational measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security.</p>
        <hr style={hr}/>

        <h2 style={h2}>11. Contact Us</h2>
        <p style={p}>If you have questions about this Privacy Policy, wish to access, correct, or delete your information, or want to exercise your privacy rights, please contact:</p>
        <p style={p}><strong>Dean Olson</strong><br/><strong>Olson Coaches</strong><br/><strong>Email:</strong> <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a></p>
        <p style={p}>We will respond to your inquiry within 30 days.</p>
        <hr style={hr}/>

        <h2 style={h2}>12. Changes to This Privacy Policy</h2>
        <p style={p}>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable laws. We will notify you of material changes by updating the "Last Updated" date at the top of this page, and where legally required, by email.</p>
        <p style={p}>Your continued use of the Website after changes become effective constitutes your acceptance of the updated Privacy Policy.</p>
        <hr style={hr}/>

        <h2 style={h2}>Summary: What You Should Know</h2>
        <ul style={ul}>
          <li>We collect your <strong>email address</strong> if you sign up, and <strong>analytics data</strong> from Google Analytics and Microsoft Clarity</li>
          <li><strong>Microsoft Clarity</strong> records anonymized session replays and heatmaps to help us improve the site experience</li>
          <li>We <strong>do not sell your data</strong> or use it for purposes beyond email marketing and Website improvement</li>
          <li>You can <strong>unsubscribe anytime</strong> from our emails</li>
          <li>We use <strong>affiliate links</strong> and disclose this relationship</li>
          <li>We work with <strong>Mailchimp, Google Analytics, and Microsoft Clarity</strong>, each with their own privacy policies</li>
          <li>You can <strong>opt out of Google Analytics</strong> tracking and manage cookies in your browser settings</li>
          <li><strong>Your email is kept safe</strong> and deleted upon request</li>
        </ul>
        <p style={p}>Questions? Reach out to <a href="mailto:dean@olsoncoaches.com" style={link}>dean@olsoncoaches.com</a>.</p>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// Shared typography/layout for the legal pages (Privacy/Terms/Contact).
const legalStyles = {
  wrap: {minHeight:"100vh",background:"#f8fafc",color:"#1e293b",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"},
  inner: {maxWidth:760,margin:"0 auto",padding:"28px 24px 64px"},
  h1: {fontSize:28,fontWeight:800,color:"#0f172a",margin:"24px 0 8px"},
  h2: {fontSize:20,fontWeight:800,color:"#0f172a",margin:"36px 0 10px",paddingTop:4},
  h3: {fontSize:15,fontWeight:700,color:"#1e293b",margin:"18px 0 6px"},
  p: {fontSize:15,lineHeight:1.7,color:"#334155",margin:"0 0 12px"},
  ul: {fontSize:15,lineHeight:1.7,color:"#334155",margin:"0 0 14px",paddingLeft:22},
  hr: {border:"none",borderTop:"1px solid #e2e8f0",margin:"28px 0"},
  link: {color:"#2563eb",textDecoration:"underline"},
  backBtn: {display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,border:"1px solid #cbd5e1",background:"#fff",color:"#475569",fontSize:13,fontWeight:600,cursor:"pointer",textDecoration:"none"},
};

// ─── TERMS OF USE PAGE ───
function TermsPage() {
  useSeoMeta(
    "Terms of Use | GLP-1 Cost Finder",
    "Terms of use for GLP-1 Cost Finder. Site purpose, medical disclaimer, affiliate disclosure, limitations of liability, governing law."
  );
  const s = legalStyles;
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        <h1 style={s.h1}>Terms of Use</h1>
        <p style={s.p}><strong>Effective Date:</strong> April 18, 2026<br/><strong>Last Updated:</strong> April 18, 2026</p>

        <h2 style={s.h2}>1. Acceptance of Terms</h2>
        <p style={s.p}>By accessing or using GLP-1 Cost Finder (the "Website"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Website. We may update these Terms at any time; continued use after changes constitutes acceptance of the updated Terms.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>2. Purpose of the Website</h2>
        <p style={s.p}>GLP-1 Cost Finder is an <strong>educational price comparison tool</strong> for GLP-1 medications (such as Ozempic, Wegovy, Mounjaro, Zepbound, and Foundayo). We aggregate publicly available pricing, coverage, and program information from manufacturers, pharmacies, telehealth providers, and government sources to help you understand your options.</p>
        <p style={s.p}><strong>This Website does not provide medical advice, diagnosis, or treatment.</strong> It is not a substitute for professional medical care.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>3. Medical Disclaimer</h2>
        <p style={s.p}>We are not physicians, pharmacists, nurses, or licensed healthcare professionals. Nothing on this Website constitutes medical advice. You should <strong>always consult a qualified healthcare provider</strong> before:</p>
        <ul style={s.ul}>
          <li>Starting, stopping, or changing any medication</li>
          <li>Making decisions about your treatment plan</li>
          <li>Interpreting coverage, insurance, or eligibility information</li>
          <li>Acting on anything you read on this Website</li>
        </ul>
        <p style={s.p}>Your reliance on any information provided here is solely at your own risk. Individual responses to medication, eligibility, and pricing vary.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>4. Affiliate Disclosure</h2>
        <p style={s.p}>Some links on this Website are <strong>affiliate links</strong>. If you click through and take a qualifying action (such as starting a telehealth consultation or filling a prescription), we may earn a commission at no additional cost to you.</p>
        <p style={s.p}><strong>Affiliate relationships do not influence our comparisons or recommendations.</strong> We rank options by the same criteria regardless of whether a partner pays a commission. When affiliate links exist alongside non-affiliate alternatives, we include both so you can make an informed choice.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>5. No Guarantees on Pricing, Availability, or Coverage</h2>
        <p style={s.p}>Drug pricing, manufacturer savings programs, insurance formularies, and pharmacy availability <strong>change frequently and without notice</strong>. Prices shown on this Website are estimates compiled from publicly available sources at a specific point in time and may not reflect the price you are actually charged.</p>
        <p style={s.p}>Before purchasing or enrolling, verify the current price, eligibility requirements, and terms directly with the pharmacy, manufacturer, telehealth provider, or insurer. We are not responsible for discrepancies between information on this Website and information provided by third parties at the time of your transaction.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>6. Intellectual Property</h2>
        <p style={s.p}>All original content on this Website&mdash;including text, layout, recommendation logic, coverage tables, and compiled data sets&mdash;is the property of Olson Coaches and is protected by U.S. copyright law. You may view and share individual pages for personal, non-commercial use. You may not scrape, copy, republish, or redistribute our content, in whole or in part, for commercial purposes without prior written permission.</p>
        <p style={s.p}>Trademarks, brand names, and product names referenced on this Website (such as Ozempic<sup>&reg;</sup>, Wegovy<sup>&reg;</sup>, Mounjaro<sup>&reg;</sup>, Zepbound<sup>&reg;</sup>) are the property of their respective owners and are used for identification only. Mention of a brand does not imply endorsement by that brand of this Website.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>7. Limitation of Liability</h2>
        <p style={s.p}>To the fullest extent permitted by law, <strong>Olson Coaches, Dean Olson, and any contributors to this Website are not liable</strong> for any direct, indirect, incidental, consequential, special, or punitive damages arising from:</p>
        <ul style={s.ul}>
          <li>Your use of, or inability to use, the Website</li>
          <li>Any inaccuracy in pricing, coverage, or eligibility information</li>
          <li>Any decision you make based on information from this Website</li>
          <li>Any transaction you enter into with a third-party pharmacy, telehealth provider, manufacturer, or insurer</li>
          <li>Any loss of data, profits, or business opportunity</li>
        </ul>
        <p style={s.p}>This Website is provided "as is" and "as available" without warranties of any kind, express or implied.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>8. Governing Law</h2>
        <p style={s.p}>These Terms are governed by the laws of the <strong>State of Washington</strong>, without regard to its conflict-of-laws principles. Any dispute arising out of or relating to these Terms or your use of the Website shall be resolved exclusively in the state or federal courts located in Washington, and you consent to personal jurisdiction in those courts.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>9. Contact</h2>
        <p style={s.p}>Questions about these Terms? Contact:</p>
        <p style={s.p}><strong>Dean Olson</strong><br/><strong>Olson Coaches</strong><br/><strong>Email:</strong> <a href="mailto:dean@olsoncoaches.com" style={s.link}>dean@olsoncoaches.com</a></p>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ───
// ─── MEDICARE GLP-1 BRIDGE ELIGIBILITY CHECKER ───
//
// Five-step quiz. Early exits at Q1 (no Medicare) and Q2 (BMI < 27).
// Conditional Q3 only fires when Q2's BMI tier needs comorbidity check.
// Q4 / Q5 are answered for context, never disqualify on their own.
//
// SSR rendering: default `step === 1`, so Q1 is in the prerender HTML and
// crawlers see real content (per spec). useEffect-based GA4 events only
// fire client-side via the typeof-window guard.
//
// gtag emits four events: quiz_started, quiz_completed, quiz_result_type,
// email_captured. All wrapped in try-catch -- analytics failure should
// never break the quiz.
function fireGtag(name, params) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    }
  } catch (e) { /* swallow; analytics shouldn't break UX */ }
}

const MEDICARE_BRIDGE_STYLE = {
  wrap: { minHeight: "100vh", background: "#f8fafc", color: "#1e293b" },
  inner: { maxWidth: 720, margin: "0 auto", padding: "28px 20px 64px" },
  disclaimer: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#78350f", lineHeight: 1.55 },
  h1: { fontSize: 26, fontWeight: 800, color: "#0f172a", margin: "12px 0 6px", letterSpacing: "-0.01em" },
  sub: { fontSize: 14, color: "#475569", lineHeight: 1.55, margin: "0 0 24px" },
  progress: { fontSize: 11, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  progressBar: { background: "#e2e8f0", borderRadius: 999, height: 6, marginBottom: 24, overflow: "hidden" },
  progressFill: { background: "linear-gradient(90deg,#0369a1,#0891b2)", height: "100%", transition: "width .25s ease" },
  card: { background: "#fff", borderRadius: 16, padding: "26px 22px", boxShadow: "0 1px 3px rgba(0,0,0,.06)", border: "1px solid #e2e8f0", marginBottom: 16 },
  qHeading: { fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 14px", lineHeight: 1.35 },
  option: { display: "block", width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", marginBottom: 8, fontSize: 14, color: "#1e293b", fontWeight: 600, transition: "all .15s ease" },
  optionHover: { borderColor: "#0369a1", background: "#f0f9ff" },
  backBtn: { marginTop: 12, padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "transparent", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  resultBanner: (color) => ({ background: color.bg, border: "1px solid " + color.border, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }),
  resultTitle: (color) => ({ fontSize: 18, fontWeight: 800, color: color.title, margin: "0 0 4px" }),
  resultBody: { fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 },
  stepsList: { margin: "10px 0 0", paddingLeft: 22, fontSize: 14, color: "#334155", lineHeight: 1.7 },
  note: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 16px", marginTop: 14, fontSize: 13, color: "#78350f", lineHeight: 1.55 },
  cta: { display: "inline-block", marginTop: 16, padding: "10px 18px", borderRadius: 8, background: "#0369a1", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" },
  ctaSecondary: { display: "inline-block", marginTop: 8, marginLeft: 8, padding: "10px 18px", borderRadius: 8, background: "transparent", color: "#0369a1", fontSize: 13, fontWeight: 700, textDecoration: "underline" },
};

function MedicareGlp1Eligibility() {
  useSeoMeta(
    "Am I Eligible for the Medicare GLP-1 Bridge Program? | Free Eligibility Checker",
    "Answer 5 quick questions to check if you qualify for the Medicare GLP-1 Bridge Program starting July 2026. Free, instant results — no email required."
  );

  const s = MEDICARE_BRIDGE_STYLE;
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    medicare: null,    // "partd" | "ma" | "no"
    bmi: null,         // "35+" | "30-34" | "27-29" | "<27" | "unknown"
    conditions: null,  // condition string | "none"
    medication: null,  // "wegovy" | "zepbound" | "foundayo" | "ozempic" | "mounjaro" | "other"
    lis: null,         // "yes" | "no" | "unsure"
  });

  // Fire quiz_started exactly once on client mount.
  useEffect(() => {
    fireGtag("quiz_started", { quiz: "medicare_bridge_eligibility" });
  }, []);

  // Total step count for the progress bar. Q3 only counted when reachable.
  const needsQ3 = answers.bmi === "30-34" || answers.bmi === "27-29";
  const totalSteps = needsQ3 ? 5 : 4;
  const visibleStep =
    step === 1 ? 1 :
    step === 2 ? 2 :
    step === 3 ? 3 :
    step === 4 ? (needsQ3 ? 4 : 3) :
    step === 5 ? (needsQ3 ? 5 : 4) : 0;

  function setAnswer(key, value, nextStep) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (typeof nextStep === "string" || typeof nextStep === "number") {
      setStep(nextStep);
    }
  }

  // ── EARLY EXITS ──────────────────────────────────────────────────────
  function ExitNoMedicare() {
    useEffect(() => {
      fireGtag("quiz_completed", { quiz: "medicare_bridge_eligibility", exit: "no_medicare" });
      fireGtag("quiz_result_type", { result: "likely_not_eligible", reason: "no_medicare" });
    }, []);
    return (
      <div style={s.card}>
        <div style={s.resultBanner({ bg: "#f1f5f9", border: "#cbd5e1", title: "#334155" })}>
          <h2 style={s.resultTitle({ title: "#334155" })}>The Bridge Program requires Medicare drug coverage</h2>
          <p style={s.resultBody}>You'll need to be enrolled in Medicare Part D or a Medicare Advantage plan with drug coverage to access the Bridge. If you're not on Medicare yet, this program won't apply to you.</p>
        </div>
        <p style={{fontSize:14,color:"#475569",lineHeight:1.6}}>While you wait, you can still compare current self-pay GLP-1 prices across all major telehealth providers.</p>
        <Link to="/" style={s.cta}>Compare self-pay GLP-1 prices &rarr;</Link>
        <Link to="/articles/medicare-glp1-bridge-program-2026.html" style={s.ctaSecondary}>Read full program details</Link>
        <button onClick={() => setStep(1)} style={s.backBtn}>&larr; Start over</button>
      </div>
    );
  }

  function ExitLowBmi() {
    useEffect(() => {
      fireGtag("quiz_completed", { quiz: "medicare_bridge_eligibility", exit: "low_bmi" });
      fireGtag("quiz_result_type", { result: "likely_not_eligible", reason: "low_bmi" });
    }, []);
    return (
      <div style={s.card}>
        <div style={s.resultBanner({ bg: "#f1f5f9", border: "#cbd5e1", title: "#334155" })}>
          <h2 style={s.resultTitle({ title: "#334155" })}>BMI below current Bridge thresholds</h2>
          <p style={s.resultBody}>Current eligibility criteria require a BMI of at least 27 with qualifying health conditions. Based on your answer, you may not qualify — but self-pay options are available and don't require Medicare.</p>
        </div>
        <Link to="/" style={s.cta}>Compare self-pay GLP-1 prices &rarr;</Link>
        <Link to="/articles/medicare-glp1-bridge-program-2026.html" style={s.ctaSecondary}>Read full program details</Link>
        <button onClick={() => setStep(1)} style={s.backBtn}>&larr; Start over</button>
      </div>
    );
  }

  function ExitNoConditions() {
    useEffect(() => {
      fireGtag("quiz_completed", { quiz: "medicare_bridge_eligibility", exit: "no_conditions" });
      fireGtag("quiz_result_type", { result: "likely_not_eligible", reason: "no_conditions" });
    }, []);
    return (
      <div style={s.card}>
        <div style={s.resultBanner({ bg: "#f1f5f9", border: "#cbd5e1", title: "#334155" })}>
          <h2 style={s.resultTitle({ title: "#334155" })}>You may not qualify based on current rules</h2>
          <p style={s.resultBody}>The Bridge requires a qualifying health condition at your BMI level. Talk to your doctor — they can review your full medical history. Eligibility criteria may also be updated by CMS.</p>
        </div>
        <Link to="/" style={s.cta}>Compare self-pay GLP-1 prices &rarr;</Link>
        <Link to="/articles/medicare-glp1-bridge-program-2026.html" style={s.ctaSecondary}>Read full program details</Link>
        <button onClick={() => setStep(1)} style={s.backBtn}>&larr; Start over</button>
      </div>
    );
  }

  // ── FULL RESULT ──────────────────────────────────────────────────────
  function FullResult() {
    // Tier logic:
    //   - bmi "unknown" -> "may be eligible" tier (yellow)
    //   - else -> "likely eligible" tier (green)
    const tier = answers.bmi === "unknown" ? "may" : "likely";
    const isDiabetesMed =
      answers.medication === "ozempic" || answers.medication === "mounjaro";
    const isExtraHelp = answers.lis === "yes";

    useEffect(() => {
      fireGtag("quiz_completed", { quiz: "medicare_bridge_eligibility" });
      fireGtag("quiz_result_type", {
        result: tier === "likely" ? "likely_eligible" : "may_be_eligible",
        bmi: answers.bmi,
        medication: answers.medication,
        lis: answers.lis,
      });
    }, []);

    const colors = tier === "likely"
      ? { bg: "#ecfdf5", border: "#a7f3d0", title: "#047857" }
      : { bg: "#fef9c3", border: "#fde68a", title: "#854d0e" };

    return (
      <div>
        <div style={{...s.card, padding: 0, overflow: "hidden"}}>
          <div style={{padding:"20px 22px",...s.resultBanner(colors),margin:0,borderRadius:0,borderLeft:0,borderRight:0,borderTop:0}}>
            <h2 style={s.resultTitle(colors)}>
              {tier === "likely"
                ? "Based on your answers, you likely qualify for the Medicare GLP-1 Bridge Program."
                : "You may qualify — we need a bit more information to be sure."}
            </h2>
            <p style={s.resultBody}>
              {tier === "likely"
                ? "Your responses match the published CMS eligibility criteria. The next step is confirming with your doctor and submitting prior authorization."
                : "Your BMI determines part of your eligibility. Your doctor can confirm it from your most recent measurements."}
            </p>
          </div>

          <div style={{padding:"18px 22px"}}>
            <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 8px"}}>What to do next</h3>
            <ol style={s.stepsList}>
              {tier === "likely" ? (
                <>
                  <li>Talk to your doctor about the Bridge Program and prior authorization.</li>
                  <li>The program starts <strong>July 1, 2026</strong> — you can discuss this at your next appointment.</li>
                  <li>Your doctor submits a prior authorization request to the central CMS processor (operated by Humana, not your individual plan).</li>
                  <li>If approved, your pharmacy fills the prescription at the $50/month copay.</li>
                </>
              ) : (
                <>
                  <li>Confirm your BMI with your doctor (height + most recent weight).</li>
                  <li>Discuss whether you have any of the qualifying conditions for your BMI tier.</li>
                  <li>If you meet the criteria, your doctor can submit the prior authorization when the program opens July 1, 2026.</li>
                </>
              )}
            </ol>

            {isDiabetesMed && (
              <div style={s.note}>
                <strong>Heads up:</strong> Ozempic and Mounjaro are <strong>not</strong> covered under the Bridge — they're FDA-approved for diabetes, not weight loss. If you take them for diabetes, your standard Part D coverage doesn't change. If your goal is weight loss, ask your doctor about Wegovy, Zepbound (KwikPen), or Foundayo, all of which can run through the Bridge if you qualify.
              </div>
            )}

            {isExtraHelp && (
              <div style={s.note}>
                <strong>Important — Extra Help recipients:</strong> The Bridge's $50/month copay <strong>does not</strong> use your Low-Income Subsidy cost-sharing. Depending on your existing Part D coverage of Wegovy or Zepbound, you might actually pay <em>less</em> under your regular plan. Ask your Part D plan what your current copay would be before opting in.
              </div>
            )}

            <div style={{marginTop:16}}>
              <Link to="/articles/medicare-glp1-bridge-program-2026.html" style={s.cta}>Read full program details &rarr;</Link>
              <Link to="/" style={s.ctaSecondary}>Compare current self-pay prices</Link>
            </div>
            <button onClick={() => setStep(1)} style={s.backBtn}>&larr; Start over</button>
          </div>
        </div>

        {/* Non-blocking email capture */}
        <EmailCapture
          variant="banner"
          headline="Get notified when the Bridge Program opens enrollment"
          description="We'll send you a reminder when enrollment begins and alert you to any program changes."
          buttonLabel="Notify Me"
          tags="medicare-bridge"
        />
      </div>
    );
  }

  // ── RENDER ──────────────────────────────────────────────────────────

  // Question 1
  if (step === 1) {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Am I eligible for the Medicare GLP-1 Bridge Program?</h1>
          <p style={s.sub}>Five quick questions, instant result. No email required. Based on CMS eligibility criteria as of May 28, 2026.</p>

          {/* Quiz context — pre-question framing. Always visible in SSR
              regardless of quiz step (initial render). Boosts indexable
              content depth and gives first-time visitors the "what is
              this?" answer before they start clicking. */}
          <div style={{...s.card, marginBottom: 18}}>
            <h2 style={{fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 10px"}}>About the Bridge Program</h2>
            <p style={{fontSize:14,color:"#334155",lineHeight:1.65,margin:"0 0 10px"}}>
              The <strong>Medicare GLP-1 Bridge Program</strong> is a temporary CMS payment demonstration launching <strong>July 1, 2026</strong>. It allows eligible Medicare beneficiaries to access certain GLP-1 weight-loss medications &mdash; Wegovy, Zepbound (KwikPen formulation only), and Foundayo &mdash; for a flat <strong>$50/month copay</strong> through their existing Part D or Medicare Advantage drug plan.
            </p>
            <p style={{fontSize:14,color:"#334155",lineHeight:1.65,margin:"0 0 10px"}}>
              The Bridge is not a permanent benefit. It runs through <strong>December 31, 2027</strong>. Ozempic and Mounjaro are <strong>not</strong> covered because they're FDA-approved for diabetes, not weight loss &mdash; their standard Part D coverage is unaffected. The program does not change Medicare's general policy on GLP-1s for weight loss; it sits on top as a separate, time-limited program.
            </p>
            <p style={{fontSize:14,color:"#334155",lineHeight:1.65,margin:"0 0 14px"}}>
              This checker walks through the five eligibility factors CMS uses: drug-plan enrollment, BMI threshold, qualifying health conditions at lower BMI tiers, the specific medication you're considering, and whether you receive Low-Income Subsidy (Extra Help). It takes about a minute. Your answers are not stored or sent anywhere.
            </p>
            <div style={{padding:"10px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,color:"#475569",lineHeight:1.55}}>
              Want the full picture first? Read the <Link to="/articles/medicare-glp1-bridge-program-2026.html" style={{color:"#0369a1",textDecoration:"underline",fontWeight:600}}>complete 2026 Bridge Program guide</Link> (covered medications, prior authorization process, post-2027 outlook).
            </div>
          </div>

          <Progress visible={visibleStep} total={totalSteps} />
          <div style={s.card}>
            <h2 style={s.qHeading}>Are you currently enrolled in Medicare Part D or a Medicare Advantage plan with drug coverage?</h2>
            <button style={s.option} onClick={() => setAnswer("medicare", "partd", 2)}>Yes, Medicare Part D (standalone)</button>
            <button style={s.option} onClick={() => setAnswer("medicare", "ma", 2)}>Yes, Medicare Advantage with drug coverage</button>
            <button style={s.option} onClick={() => setAnswer("medicare", "no", "exit-no-medicare")}>No / I'm not sure</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "exit-no-medicare") {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Your result</h1>
          <ExitNoMedicare />
        </div>
      </div>
    );
  }

  // Question 2
  if (step === 2) {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Am I eligible for the Medicare GLP-1 Bridge Program?</h1>
          <Progress visible={visibleStep} total={totalSteps} />
          <div style={s.card}>
            <h2 style={s.qHeading}>What is your BMI (or what was it when you started or were prescribed GLP-1 medication)?</h2>
            <button style={s.option} onClick={() => setAnswer("bmi", "35+", 4)}>35 or higher</button>
            <button style={s.option} onClick={() => setAnswer("bmi", "30-34", 3)}>30 to 34.9</button>
            <button style={s.option} onClick={() => setAnswer("bmi", "27-29", 3)}>27 to 29.9</button>
            <button style={s.option} onClick={() => setAnswer("bmi", "<27", "exit-low-bmi")}>Below 27</button>
            <button style={s.option} onClick={() => setAnswer("bmi", "unknown", 4)}>I don't know my BMI</button>
            <button onClick={() => setStep(1)} style={s.backBtn}>&larr; Previous</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "exit-low-bmi") {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Your result</h1>
          <ExitLowBmi />
        </div>
      </div>
    );
  }

  // Question 3 — conditional on Q2's BMI tier
  if (step === 3) {
    const bmi30 = answers.bmi === "30-34";
    const bmi27 = answers.bmi === "27-29";
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Am I eligible for the Medicare GLP-1 Bridge Program?</h1>
          <Progress visible={visibleStep} total={totalSteps} />
          <div style={s.card}>
            <h2 style={s.qHeading}>Do you have any of the following conditions?</h2>
            {bmi30 && (
              <>
                <button style={s.option} onClick={() => setAnswer("conditions", "heart_failure", 4)}>Heart failure</button>
                <button style={s.option} onClick={() => setAnswer("conditions", "uncontrolled_hypertension", 4)}>Uncontrolled hypertension</button>
                <button style={s.option} onClick={() => setAnswer("conditions", "ckd_3a_plus", 4)}>Chronic kidney disease (stage 3a or higher)</button>
              </>
            )}
            {bmi27 && (
              <>
                <button style={s.option} onClick={() => setAnswer("conditions", "prediabetes", 4)}>Pre-diabetes</button>
                <button style={s.option} onClick={() => setAnswer("conditions", "prior_heart_attack", 4)}>Prior heart attack</button>
                <button style={s.option} onClick={() => setAnswer("conditions", "prior_stroke", 4)}>Prior stroke</button>
                <button style={s.option} onClick={() => setAnswer("conditions", "pad", 4)}>Symptomatic peripheral artery disease</button>
              </>
            )}
            <button style={s.option} onClick={() => setAnswer("conditions", "none", "exit-no-conditions")}>None of the above</button>
            <button onClick={() => setStep(2)} style={s.backBtn}>&larr; Previous</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "exit-no-conditions") {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Your result</h1>
          <ExitNoConditions />
        </div>
      </div>
    );
  }

  // Question 4
  if (step === 4) {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Am I eligible for the Medicare GLP-1 Bridge Program?</h1>
          <Progress visible={visibleStep} total={totalSteps} />
          <div style={s.card}>
            <h2 style={s.qHeading}>Which medication are you taking or considering?</h2>
            <button style={s.option} onClick={() => setAnswer("medication", "wegovy", 5)}>Wegovy (semaglutide for weight loss)</button>
            <button style={s.option} onClick={() => setAnswer("medication", "zepbound", 5)}>Zepbound (tirzepatide for weight loss)</button>
            <button style={s.option} onClick={() => setAnswer("medication", "foundayo", 5)}>Foundayo (orforglipron)</button>
            <button style={s.option} onClick={() => setAnswer("medication", "ozempic", 5)}>Ozempic (semaglutide for diabetes)</button>
            <button style={s.option} onClick={() => setAnswer("medication", "mounjaro", 5)}>Mounjaro (tirzepatide for diabetes)</button>
            <button style={s.option} onClick={() => setAnswer("medication", "other", 5)}>Other / Not sure</button>
            <button onClick={() => setStep(needsQ3 ? 3 : 2)} style={s.backBtn}>&larr; Previous</button>
          </div>
        </div>
      </div>
    );
  }

  // Question 5
  if (step === 5) {
    return (
      <div style={s.wrap}>
        <div style={s.inner}>
          <Disclaimer />
          <h1 style={s.h1}>Am I eligible for the Medicare GLP-1 Bridge Program?</h1>
          <Progress visible={visibleStep} total={totalSteps} />
          <div style={s.card}>
            <h2 style={s.qHeading}>Do you currently receive Medicare's Low-Income Subsidy (Extra Help) for prescription drugs?</h2>
            <button style={s.option} onClick={() => setAnswer("lis", "yes", "result")}>Yes</button>
            <button style={s.option} onClick={() => setAnswer("lis", "no", "result")}>No</button>
            <button style={s.option} onClick={() => setAnswer("lis", "unsure", "result")}>I'm not sure</button>
            <button onClick={() => setStep(4)} style={s.backBtn}>&larr; Previous</button>
          </div>
        </div>
      </div>
    );
  }

  // Result
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Disclaimer />
        <h1 style={s.h1}>Your result</h1>
        <FullResult />
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div style={MEDICARE_BRIDGE_STYLE.disclaimer}>
      <strong>This tool provides general guidance only.</strong> It is not a determination of eligibility. Only CMS and your Medicare plan can confirm your eligibility. Program details are based on CMS announcements as of May 28, 2026 and may change.
    </div>
  );
}

function Progress({ visible, total }) {
  const pct = Math.min(100, Math.round((visible / total) * 100));
  return (
    <>
      <div style={MEDICARE_BRIDGE_STYLE.progress}>Step {visible} of {total}</div>
      <div style={MEDICARE_BRIDGE_STYLE.progressBar}>
        <div style={{...MEDICARE_BRIDGE_STYLE.progressFill, width: pct + "%"}} />
      </div>
    </>
  );
}

// ─── PROVIDER LEGITIMACY CHECKER ───
//
// Consumer-safety reference page. Not an article -- a checklist + red-flag
// guide + verified-provider snapshot. Schema deliberately omits Article
// (per spec) and lives in prerender.mjs as a FAQPage + BreadcrumbList
// alongside the site-wide Organization + WebSite.
const PROVIDER_CHECK_STYLE = {
  intro: { fontSize: 15, lineHeight: 1.7, color: "#334155", margin: "0 0 14px" },
  numCircle: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "#0369a1", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 },
  step: { display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid #e2e8f0" },
  stepBody: { flex: 1, minWidth: 0 },
  stepTitle: { fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  stepText: { fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "0 0 6px" },
  stepLink: { fontSize: 13, color: "#0369a1", textDecoration: "underline", wordBreak: "break-word" },
  warnBox: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "18px 20px", margin: "8px 0 18px" },
  warnTitle: { fontSize: 16, fontWeight: 800, color: "#78350f", margin: "0 0 10px" },
  warnList: { margin: 0, paddingLeft: 0, listStyle: "none" },
  warnItem: { fontSize: 14, color: "#78350f", lineHeight: 1.55, padding: "6px 0", paddingLeft: 26, position: "relative" },
  warnIcon: { position: "absolute", left: 0, top: 6, color: "#b45309", fontWeight: 800 },
  table: { width: "100%", borderCollapse: "collapse", margin: "10px 0 14px", fontSize: 13, background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" },
  tableWrap: { overflowX: "auto", margin: "12px 0 14px" },
  th: { textAlign: "left", padding: "10px 12px", background: "#1e3a5f", color: "#fff", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top", color: "#334155", lineHeight: 1.5 },
  verifiedBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "#047857" },
  resourceItem: { padding: "10px 0", borderBottom: "1px solid #e2e8f0" },
  resourceName: { fontSize: 14, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" },
  resourceDesc: { fontSize: 13, color: "#475569", lineHeight: 1.55, margin: "0 0 4px" },
  resourceLink: { fontSize: 12, color: "#0369a1", textDecoration: "underline", wordBreak: "break-all" },
};

const VERIFIED_PROVIDERS = [
  { name: "Hims", domain: "forhims.com", notes: "Publicly traded (NYSE: HIMS). Licensed telehealth platform. Prescriptions filled by licensed pharmacies." },
  { name: "Ro", domain: "ro.co", notes: "Licensed telehealth platform. Backed by major healthcare investors. Prescriptions filled by licensed pharmacies." },
  { name: "Noom Med", domain: "noom.com/med", notes: "Established digital health company. Medical program staffed by licensed clinicians." },
  { name: "LillyDirect", domain: "lilly.com/lillydirect", notes: "Direct from Eli Lilly (NYSE: LLY), the manufacturer of Zepbound, Mounjaro, and Foundayo." },
  { name: "Oak Weight Loss", domain: "oaklovesyou.com", notes: "Telehealth platform by Oak Longevity. Business registration verified." },
  { name: "Yucca Health", domain: "tryyucca.com", notes: "Licensed telehealth provider. Business registration verified." },
  { name: "Sprout Health", domain: "joinsprouthealth.com", notes: "Licensed telehealth provider. Business registration verified." },
  { name: "SHED", domain: "tryshed.com", notes: "Licensed telehealth provider. Business registration verified." },
  { name: "Wellorithm", domain: "wellorithm.com", notes: "Licensed telehealth provider. Business registration verified." },
];

const PROVIDER_CHECK_FAQ = [
  { q: "How do I know if a GLP-1 provider is legitimate?", a: "Work through the six-step checklist on this page: check the FDA warning letter database, verify state pharmacy licensing via NABP, confirm a named licensed prescriber reviews your medical history, look up the business on your Secretary of State registry or BBB.org, confirm the provider requires a real prescription, and inspect any medication you receive for FDA-approved labels from the manufacturer with your name and prescriber on the pharmacy label." },
  { q: "What are the red flags for fake GLP-1 providers?", a: "Top warning signs: no medical questionnaire or prescriber consultation, prices far below market rate, no verifiable pharmacy license or prescriber credentials, no clear cancellation/refund policy, high-pressure urgency tactics, claims of \"exclusive\" formulations, plain or foreign-language packaging on received medication, no physical address or About page, payment by crypto or wire transfer only, and unsolicited social-media or email ads selling GLP-1s without a prescription." },
  { q: "Is it safe to buy GLP-1 medications from a telehealth provider?", a: "Yes, when the provider is a licensed telehealth platform that requires a real medical questionnaire, has a named licensed prescriber sign off on your prescription, and fills through a state-licensed pharmacy. Major telehealth providers like Hims, Ro, Noom Med, and the others verified on this page meet those criteria. The risk is not telehealth itself -- it's illegitimate sellers who skip those steps." },
  { q: "How can I check if a pharmacy is licensed in my state?", a: "Use the National Association of Boards of Pharmacy (NABP) state-board directory at nabp.pharmacy/members/boards-of-pharmacy/ to find your state's pharmacy licensing board, then look up the pharmacy by name. NABP's safe.pharmacy site also lists VIPPS-accredited online pharmacies. Verify the license is active in YOUR state, not just the state the pharmacy is based in." },
  { q: "What should I do if I think I received counterfeit GLP-1 medication?", a: "Stop using it immediately and don't dispose of it -- you'll need it for any investigation. Report to the FDA MedWatch program (fda.gov/safety/medwatch), file an FTC complaint at reportfraud.ftc.gov, and contact your prescriber to discuss what to do next. If you paid by credit card, contact your card issuer to dispute the charge. If you have safety concerns, contact your doctor or poison control (1-800-222-1222)." },
  { q: "Are compounded GLP-1 medications safe?", a: "Compounded medications occupy a different regulatory category from FDA-approved drugs. FDA-registered 503B outsourcing facilities can legally compound certain medications during drug shortages, and 503A pharmacies can compound on a per-prescription basis. Compounded products are NOT FDA-approved, and the FDA has issued warnings about some compounded semaglutide products. Check whether your specific medication comes from a 503B facility (more oversight) vs. a 503A pharmacy. The GLP-1 shortage situation has been evolving -- check FDA.gov for the current status of any specific drug shortage before relying on compounded as a long-term option." },
];

function ProviderCheckPage() {
  useSeoMeta(
    "Is This GLP-1 Provider Legitimate? | Provider Safety Checker",
    "Check if a telehealth GLP-1 provider is legitimate. Verification checklist, red flags to watch for, and verified provider status for 9 major telehealth platforms."
  );
  const s = legalStyles;
  const p = PROVIDER_CHECK_STYLE;

  const verificationSteps = [
    { title: "Check for FDA warning letters", body: "Search the FDA's pharmaceutical warning letter database for the provider or pharmacy name. Look for warning letters about unapproved GLP-1 products, compounding violations, or misleading claims.", linkLabel: "FDA Warning Letters Database", linkHref: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters" },
    { title: "Verify the pharmacy is state-licensed", body: "Every pharmacy dispensing medication must be licensed in the state it ships to. Use the NABP state-board directory to find YOUR state's pharmacy board, then verify the pharmacy's license is active in your state -- not just the state they're based in. NABP also publishes a list of VIPPS-accredited online pharmacies.", linkLabel: "NABP state-board directory + VIPPS lookup", linkHref: "https://safe.pharmacy/" },
    { title: "Confirm a licensed prescriber reviews your medical history", body: "Legitimate providers require a medical questionnaire, health-history review, and prescriber sign-off before dispensing. Look for a named, verifiable prescriber (MD, DO, NP, PA) -- not just \"our medical team.\" Red flag: any provider that ships medication without collecting health information.", linkLabel: null, linkHref: null },
    { title: "Check for a physical business address", body: "Legitimate companies have a verifiable business address, not just a PO box or no address at all. Search the company name on your state's Secretary of State business registry, or look the company up on BBB.org.", linkLabel: "BBB business lookup", linkHref: "https://www.bbb.org/search" },
    { title: "Verify they require a prescription", body: "GLP-1 medications are prescription-only in the U.S. Any provider that sells them without requiring a prescription is operating illegally. This includes sites that claim to sell \"research-grade\" or \"peptide\" semaglutide/tirzepatide without a prescription -- those products are not legal for human use and are not what real telehealth providers dispense.", linkLabel: null, linkHref: null },
    { title: "Check that medication has proper FDA labeling", body: "When you receive medication, it should have an FDA-approved label from the manufacturer (Novo Nordisk for Wegovy / Ozempic; Eli Lilly for Zepbound / Mounjaro / Foundayo), dispensed by a named pharmacy with your name and prescriber on the label. Red flag: medication arriving without proper pharmacy labeling, in plain packaging, or with foreign-language labels.", linkLabel: null, linkHref: null },
  ];

  const redFlags = [
    "No medical questionnaire or doctor consultation required",
    "Prices significantly below market rate (e.g., \"Wegovy for $50/month\" without Medicare)",
    "No verifiable pharmacy license or prescriber credentials",
    "No clear cancellation or refund policy",
    "High-pressure sales tactics or urgency language (\"Only 3 left!\" \"Price expires tonight!\")",
    "Claims of \"exclusive\" or \"special\" formulations not available elsewhere",
    "No FDA-approved medication labels on received products",
    "Website has no About page, no physical address, no contact information",
    "Payment only via cryptocurrency, wire transfer, or non-refundable methods",
    "Unsolicited emails, texts, or social media ads offering GLP-1s without a prescription",
  ];

  const resources = [
    { name: "FDA Warning Letters Database", desc: "Search for warning letters issued to pharmaceutical companies and pharmacies.", href: "https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/compliance-actions-and-activities/warning-letters" },
    { name: "FDA BeSafeRx", desc: "FDA's program for safe online medication purchasing.", href: "https://www.fda.gov/drugs/quick-tips-buying-medicines-over-internet/besaferx-your-source-online-pharmacy-information" },
    { name: "NABP Safe Pharmacy", desc: "Verify a pharmacy's VIPPS accreditation (Verified Internet Pharmacy Practice Sites).", href: "https://safe.pharmacy/" },
    { name: "State Boards of Pharmacy", desc: "Find your state's pharmacy licensing board.", href: "https://nabp.pharmacy/members/boards-of-pharmacy/" },
    { name: "DEA Registration Verification", desc: "Verify a provider's DEA registration (GLP-1s aren't controlled, but DEA registration is one signal of provider legitimacy).", href: "https://www.deadiversion.usdoj.gov/drugreg/" },
    { name: "BBB Business Lookup", desc: "Check ratings and complaints for any business.", href: "https://www.bbb.org/search" },
    { name: "FTC Complaint Filing", desc: "Report a suspected scam provider.", href: "https://reportfraud.ftc.gov/" },
    { name: "FDA MedWatch", desc: "Report a suspected counterfeit or unsafe medication.", href: "https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program" },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        <h1 style={s.h1}>Is this GLP-1 provider legitimate?</h1>
        <p className="updated" style={{fontSize:12,color:"#94a3b8",margin:"4px 0 18px"}}>Last updated: May 28, 2026</p>

        <div style={{background:"#fef3c7",border:"1px solid #fde68a",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:12,color:"#78350f",lineHeight:1.55}}>
          <strong>Consumer-protection resource.</strong> This page is informational and not medical, legal, or financial advice. Always verify provider legitimacy through official channels (FDA, NABP, your state board of pharmacy). Report suspected fraud to the FTC and any safety concerns to FDA MedWatch.
        </div>

        {/* Section 1 — Intro */}
        <p style={p.intro}>The GLP-1 market has exploded, and so have illegitimate sellers offering counterfeit, improperly compounded, or completely fake medications. The FDA has issued multiple warning letters to unapproved GLP-1 sellers over the past two years, and the agency has flagged compounded semaglutide products that don't meet safety standards.</p>
        <p style={p.intro}>Consumers are right to be cautious. The price difference between a legitimate telehealth provider and a scam site can look superficially small &mdash; until you receive a product with no proper labeling, no clear ingredient list, and no way to trace it back to a licensed pharmacy. The damage from a bad GLP-1 purchase is health damage, not just a refund headache.</p>
        <p style={p.intro}>This guide gives you a working checklist to verify any GLP-1 provider before you give them money or personal health information. We've also published our internal verification snapshot for the providers we link to in the comparison tool &mdash; below. <strong>Verification doesn't equal endorsement</strong> &mdash; do your own due diligence regardless.</p>

        {/* Section 2 — Verification checklist */}
        <h2 style={s.h2}>How to verify a GLP-1 telehealth provider</h2>
        <p style={p.intro}>Work through these six steps for any provider you're considering. None of them require special expertise &mdash; just a few minutes with the official lookup tools below.</p>
        <div style={{margin:"4px 0 20px"}}>
          {verificationSteps.map((step, i) => (
            <div key={i} style={p.step}>
              <div style={p.numCircle}>{i + 1}</div>
              <div style={p.stepBody}>
                <div style={p.stepTitle}>{step.title}</div>
                <div style={p.stepText}>{step.body}</div>
                {step.linkHref && (
                  <a href={step.linkHref} target="_blank" rel="noopener noreferrer" style={p.stepLink}>
                    {step.linkLabel} &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Section 3 — Red flags */}
        <h2 style={s.h2}>Red flags &mdash; warning signs of a scam provider</h2>
        <p style={p.intro}>Any single one of these is reason to walk away. Two or more, and you're almost certainly looking at a scam.</p>
        <div style={p.warnBox}>
          <div style={p.warnTitle}>Stop and reconsider if you see:</div>
          <ul style={p.warnList}>
            {redFlags.map((flag, i) => (
              <li key={i} style={p.warnItem}>
                <span style={p.warnIcon}>&#9888;</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 4 — Verified providers */}
        <h2 style={s.h2}>Our verified provider snapshot</h2>
        <p style={p.intro}>These are the providers featured in our comparison tool. For each, we've confirmed business registration and that they operate as licensed telehealth platforms with real prescribers and licensed-pharmacy fulfillment.</p>
        <div style={p.tableWrap}>
          <table style={p.table}>
            <thead>
              <tr>
                <th style={p.th}>Provider</th>
                <th style={p.th}>Website</th>
                <th style={p.th}>Status</th>
                <th style={p.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {VERIFIED_PROVIDERS.map((row, i) => (
                <tr key={i} style={{background: i % 2 === 0 ? "#fff" : "#fafafa"}}>
                  <td style={{...p.td, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap"}}>{row.name}</td>
                  <td style={{...p.td, color: "#0369a1", whiteSpace: "nowrap"}}>{row.domain}</td>
                  <td style={p.td}>
                    <span style={p.verifiedBadge}>
                      <span aria-hidden="true">&#10003;</span>
                      <span>Verified</span>
                    </span>
                  </td>
                  <td style={p.td}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 16px",fontSize:12,color:"#475569",lineHeight:1.6,margin:"4px 0 14px"}}>
          <strong>Important:</strong> Verification means we have confirmed the provider's business registration and that they operate as a licensed telehealth platform. It does <strong>not</strong> constitute an endorsement or guarantee of service quality, clinical outcomes, or fitness for your specific situation. Always do your own due diligence using the steps above before signing up.
        </div>
        <Link to="/" style={{display:"inline-block",padding:"10px 18px",borderRadius:8,background:"#0369a1",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none",margin:"4px 0 22px"}}>Compare prices from these verified providers &rarr;</Link>

        {/* Section 5 — External resources */}
        <h2 style={s.h2}>Useful external resources</h2>
        <p style={p.intro}>Government and standards-body tools you can use to verify any provider, pharmacy, or medication. All open in new tabs.</p>
        <div style={{margin:"4px 0 22px"}}>
          {resources.map((r, i) => (
            <div key={i} style={p.resourceItem}>
              <div style={p.resourceName}>{r.name}</div>
              <div style={p.resourceDesc}>{r.desc}</div>
              <a href={r.href} target="_blank" rel="noopener noreferrer" style={p.resourceLink}>{r.href}</a>
            </div>
          ))}
        </div>

        {/* Section 6 — FAQ */}
        <h2 style={s.h2}>Frequently asked questions</h2>
        {PROVIDER_CHECK_FAQ.map((item, i) => (
          <div key={i}>
            <h3 style={{...s.h3, marginTop: i === 0 ? 8 : 18}}>{item.q}</h3>
            <p style={s.p}>{item.a}</p>
          </div>
        ))}

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───
function AboutPage() {
  useSeoMeta(
    "About GLP-1 Cost Finder",
    "GLP-1 Cost Finder is an independent cost comparison tool. Learn about our methodology, editorial standards, and how we verify pricing."
  );
  const s = legalStyles;
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        <h1 style={s.h1}>About GLP-1 Cost Finder</h1>
        <p style={s.p}>GLP-1 Cost Finder is an independent research tool that helps consumers compare the real cost of GLP-1 medications like Ozempic, Wegovy, Mounjaro, Zepbound, and Foundayo across telehealth providers, pharmacies, and assistance programs.</p>

        <h2 style={s.h2}>Who We Are</h2>
        <p style={s.p}>This site is built and maintained by <strong>Dean Olson</strong>, an independent researcher and consumer advocate. GLP-1 Cost Finder is not affiliated with any pharmaceutical company, telehealth provider, or insurance company.</p>

        <h2 style={s.h2}>Our Methodology</h2>
        <p style={s.p}>Pricing data is collected directly from provider websites and verified monthly. We include the <strong>full cost</strong> &mdash; not just the medication price, but membership fees, consultation charges, shipping, and dose escalation costs where applicable. When we can't verify a price directly, we say so.</p>

        <h2 style={s.h2}>How We Make Money</h2>
        <p style={s.p}>Some links on this site are affiliate links. If you click through and make a purchase, we may earn a commission at no additional cost to you. <strong>This never affects our rankings or recommendations.</strong> Providers cannot pay for higher placement. Our full affiliate disclosure is available on every page with affiliate links.</p>

        <h2 style={s.h2}>Editorial Standards</h2>
        <ul style={s.ul}>
          <li>We never recommend a provider we haven't independently verified through our <Link to="/provider-check" style={s.link}>provider legitimacy checker</Link> process &mdash; business registration, licensed prescriber sign-off, and licensed-pharmacy fulfillment.</li>
          <li>Pricing is updated monthly and dated so you know how current it is.</li>
          <li>We disclose affiliate relationships on every page where they exist.</li>
          <li>We do not accept paid placements or sponsored content.</li>
          <li>If a provider's pricing changes, we update within 30 days.</li>
        </ul>

        <h2 style={s.h2}>Contact</h2>
        <p style={s.p}>Questions, corrections, or pricing updates? Email <a href="mailto:dean@olsoncoaches.com" style={s.link}>dean@olsoncoaches.com</a>.</p>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function ContactPage() {
  useSeoMeta(
    "Contact | GLP-1 Cost Finder",
    "Contact GLP-1 Cost Finder. Email dean@olsoncoaches.com for questions, partnerships, or to report a pricing issue. Response within 48 hours."
  );
  const s = legalStyles;
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        <h1 style={s.h1}>Contact</h1>
        <p style={s.p}>We'd love to hear from you. Whether you have a question about the tool, spotted a pricing error, or want to explore a partnership, the best way to reach us is by email.</p>

        <h2 style={s.h2}>Email Us</h2>
        <p style={s.p}><a href="mailto:dean@olsoncoaches.com" style={s.link}>dean@olsoncoaches.com</a></p>
        <p style={s.p}>We typically respond within <strong>48 hours</strong> on business days.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>Affiliate &amp; Partnership Inquiries</h2>
        <p style={s.p}>Interested in partnering with GLP-1 Cost Finder? We work with telehealth providers, pharmacies, and manufacturers whose offerings fit our mission of helping consumers access GLP-1 medications affordably.</p>
        <p style={s.p}>Send partnership proposals to <a href="mailto:dean@olsoncoaches.com" style={s.link}>dean@olsoncoaches.com</a> with "Partnership" in the subject line. Please include your program details, commission structure, and target audience.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>Report an Issue</h2>
        <p style={s.p}>Spotted something wrong? We rely on user reports to keep our pricing and coverage data accurate. Please let us know if you find:</p>
        <ul style={s.ul}>
          <li>A price on the site that doesn't match what a pharmacy or manufacturer currently charges</li>
          <li>A broken link or outdated URL to a third-party resource</li>
          <li>A coverage detail that no longer reflects your state's Medicaid policy</li>
          <li>A typo, formatting bug, or anything that just seems off</li>
        </ul>
        <p style={s.p}>Email <a href="mailto:dean@olsoncoaches.com" style={s.link}>dean@olsoncoaches.com</a> with "Report" in the subject line and include the URL and a short description. If you can include a screenshot, even better.</p>
        <hr style={s.hr}/>

        <h2 style={s.h2}>About</h2>
        <p style={s.p}>GLP-1 Cost Finder is operated by Dean Olson under <strong>Olson Coaches</strong>.</p>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
    </div>
  );
}

// ─── SHARED FOOTER ───
function Footer() {
  const linkStyle = {color:"#94a3b8",textDecoration:"underline",cursor:"pointer"};
  const guideLinkStyle = {color:"#94a3b8",textDecoration:"underline"};
  const sep = <span style={{margin:"0 8px",color:"#cbd5e1"}}>|</span>;
  return (
    <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:"1px solid #e2e8f0"}}>
      <p style={{fontSize:11,color:"#94a3b8",margin:0}}>
        &copy; 2026 Olson Coaches
        {sep}<Link to="/about" style={linkStyle}>About</Link>
        {sep}<Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
        {sep}<Link to="/terms" style={linkStyle}>Terms of Use</Link>
        {sep}<Link to="/contact" style={linkStyle}>Contact</Link>
        {sep}<a href="/articles/" style={{fontSize:10,color:"#cbd5e1",textDecoration:"none"}}>Pricing Guides</a>
      </p>
      <p style={{fontSize:10,color:"#94a3b8",margin:"8px auto 0",maxWidth:640}}>
        <span style={{color:"#cbd5e1",marginRight:6}}>Guides:</span>
        <Link to="/cheapest-glp1-without-insurance" style={guideLinkStyle}>Cheapest GLP-1 Without Insurance</Link>
        <span style={{margin:"0 6px",color:"#cbd5e1"}}>&middot;</span>
        <Link to="/ozempic-vs-mounjaro-cost" style={guideLinkStyle}>Ozempic vs Mounjaro Cost</Link>
        <span style={{margin:"0 6px",color:"#cbd5e1"}}>&middot;</span>
        <Link to="/glp1-self-pay-options" style={guideLinkStyle}>Self-Pay Options</Link>
      </p>
      <p style={{fontSize:10,color:"#94a3b8",margin:"6px auto 0",maxWidth:640}}>
        <span style={{color:"#cbd5e1",marginRight:6}}>Tools:</span>
        <Link to="/medicare-glp1-eligibility" style={guideLinkStyle}>Medicare Bridge eligibility checker</Link>
        <span style={{margin:"0 6px",color:"#cbd5e1"}}>&middot;</span>
        <Link to="/provider-check" style={guideLinkStyle}>Provider legitimacy checker</Link>
      </p>
      <p style={{fontSize:10,color:"#94a3b8",margin:"6px auto 0",maxWidth:640}}>
        <span style={{color:"#cbd5e1",marginRight:6}}>Medicare:</span>
        <a href="/articles/medicare-glp1-bridge-program-2026.html" style={guideLinkStyle}>Bridge Program 2026 guide</a>
      </p>
      <p style={{fontSize:10,color:"#94a3b8",lineHeight:1.6,maxWidth:560,margin:"10px auto 0"}}>
        <strong>Affiliate Disclosure:</strong> We may earn commissions from partner links.
      </p>
      <p style={{fontSize:10,color:"#cbd5e1",marginTop:8}}>Sources: TrumpRx.gov, GoodRx, NovoCare, LillyDirect, CMS, KFF, FDA.gov</p>
    </div>
  );
}

// ─── APP ROUTER ───
// ─── SEO PAGE HELPERS ───
// Updates <title> and <meta name="description"> for the duration of the page,
// then restores the previous values on unmount so navigating back to another
// route leaves correct metadata in place.
function useSeoMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const metaEl = document.querySelector('meta[name="description"]');
    const prevDesc = metaEl ? metaEl.getAttribute("content") : null;
    document.title = title;
    if (metaEl && description) metaEl.setAttribute("content", description);
    return () => {
      document.title = prevTitle;
      if (metaEl && prevDesc != null) metaEl.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}

// Keeps a single <link rel="canonical"> in <head> pointing at the current
// route. Called once from <App /> inside <BrowserRouter>, so every route
// transition updates href. If the link didn't exist before this effect ran
// we remove it on cleanup; otherwise we leave the pre-existing element alone.
const SITE_ORIGIN = "https://glp1costfinder.com";
function useCanonical() {
  const { pathname } = useLocation();
  useEffect(() => {
    const href = SITE_ORIGIN + pathname;
    let link = document.querySelector('link[rel="canonical"]');
    let createdByUs = false;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
      createdByUs = true;
    }
    link.setAttribute("href", href);
    return () => {
      if (createdByUs) link.remove();
    };
  }, [pathname]);
}

// Appends a JSON-LD <script> to <head> for the lifetime of the component.
function JsonLd({ data }) {
  // Render the JSON-LD script tag directly into the React tree so it appears
  // in both SSR-rendered HTML (for crawlers) and client-rendered output. Google
  // accepts JSON-LD anywhere in the document, including inside <body>.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// FTC disclosure banner used on the comparison tool and every SEO page.
function AffiliateBanner({ style }) {
  return (
    <div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"flex-start",gap:10,...style}}>
      <span aria-hidden="true" style={{fontSize:14,lineHeight:1.2,flexShrink:0,marginTop:1}}>&#9432;</span>
      <p style={{fontSize:12,lineHeight:1.55,color:"#713f12",margin:0}}>
        <strong>Affiliate disclosure:</strong> Some links below are affiliate links. If you sign up through one of these links, we may earn a commission at no extra cost to you. This does not influence our comparisons or recommendations.
      </p>
    </div>
  );
}

// Shared table styling for data-heavy SEO content.
const tableStyles = {
  table: {width:"100%",borderCollapse:"collapse",margin:"18px 0",fontSize:14,lineHeight:1.5,boxShadow:"0 1px 3px rgba(0,0,0,.06)",borderRadius:8,overflow:"hidden"},
  th: {textAlign:"left",padding:"10px 12px",background:"#1e3a5f",color:"#fff",fontWeight:700,fontSize:13,borderBottom:"1px solid #1e40af"},
  td: {padding:"10px 12px",borderBottom:"1px solid #e2e8f0",verticalAlign:"top",color:"#334155"},
  tdStrong: {fontWeight:700,color:"#0f172a"},
};

function PrimaryCta({ children = "Compare GLP-1 Prices Now" }) {
  return (
    <div style={{textAlign:"center",margin:"32px 0 24px"}}>
      <Link to="/" style={{display:"inline-block",padding:"14px 32px",background:"linear-gradient(135deg, #1e3a5f, #1e40af)",color:"#fff",borderRadius:10,fontSize:15,fontWeight:700,textDecoration:"none",boxShadow:"0 4px 12px rgba(30,58,95,.25)"}}>
        {children} &rarr;
      </Link>
    </div>
  );
}

function SeoCrossLink({ to, children }) {
  return (
    <div style={{textAlign:"center",margin:"12px 0 28px"}}>
      <Link to={to} style={{fontSize:14,color:"#2563eb",textDecoration:"underline",fontWeight:600}}>
        {children}
      </Link>
    </div>
  );
}

// Shared wrapper for the SEO landing pages: back link + FTC banner + <h1>,
// then page-specific {children}, then standard CTA + cross-link + footer.
function SeoPageLayout({ title, description, h1, jsonLd, nextTo, nextLabel, ctaLabel, children }) {
  const s = legalStyles;
  useSeoMeta(title, description);
  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        <AffiliateBanner style={{margin:"18px 0 22px"}} />
        <h1 style={s.h1}>{h1}</h1>
        {children}
        <PrimaryCta>{ctaLabel}</PrimaryCta>
        {nextTo && <SeoCrossLink to={nextTo}>{nextLabel}</SeoCrossLink>}
        <div style={{marginTop:20,paddingTop:20,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <Link to="/" style={s.backBtn}>&larr; Back to Home</Link>
        </div>
        <Footer />
      </div>
      <JsonLd data={jsonLd} />
    </div>
  );
}

// ─── SEO PAGE 1: CHEAPEST GLP-1 WITHOUT INSURANCE ───
const PAGE1_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the cheapest GLP-1 without insurance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compounded semaglutide at $117-$250/month is the cheapest. For FDA-approved options, Wegovy oral at $149/month is most affordable."
      }
    },
    {
      "@type": "Question",
      "name": "How much does Ozempic cost without insurance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ozempic lists at $978-$1,000 but costs $499/month with Novo Nordisk's patient assistance program."
      }
    }
  ]
};

function CheapestGlp1WithoutInsurance() {
  const s = legalStyles;
  return (
    <SeoPageLayout
      title="Cheapest GLP-1 Without Insurance in 2026 | GLP-1 Cost Finder"
      description="Compare the cheapest ways to get Ozempic, Wegovy, Mounjaro, and Zepbound without insurance. Real self-pay prices from 9+ telehealth providers."
      h1="Cheapest GLP-1 Without Insurance: Your 2026 Pricing Guide"
      jsonLd={PAGE1_JSONLD}
      ctaLabel="Compare GLP-1 Prices Now"
      nextTo="/ozempic-vs-mounjaro-cost"
      nextLabel="Compare specific medications &rarr;"
    >
      <p style={s.p}>GLP-1 medications like Ozempic, Wegovy, and Mounjaro aren't cheap. Without insurance, you're looking at brand-name prices that can exceed $1,000 per month. But there's good news: if you know where to look, you can access GLP-1 medications for a fraction of that cost.</p>
      <p style={s.p}>This guide walks you through every affordable option available in 2026&mdash;from manufacturer programs to compounded alternatives&mdash;so you can find the lowest price without sacrificing safety or quality.</p>

      <h2 style={s.h2}>The Price Range: What to Expect</h2>
      <p style={s.p}>GLP-1 medications without insurance typically cost between $117 and $1,500 per month, depending on the medication type, dose, and how you purchase it. The widest variation happens between brand-name drugs at full price and compounded or discounted alternatives.</p>
      <p style={s.p}>Here's what the price floor looks like across the most common options:</p>
      <ul style={s.ul}>
        <li><strong>Compounded semaglutide</strong>: $117&ndash;$250/month (most affordable, not FDA-approved)</li>
        <li><strong>Wegovy oral (pill)</strong>: $149/month (introductory pricing through August 2026)</li>
        <li><strong>Zepbound vials</strong>: $299&ndash;$449/month (FDA-approved tirzepatide)</li>
        <li><strong>Ozempic with manufacturer card</strong>: $499/month (prescription semaglutide)</li>
        <li><strong>Mounjaro with SingleCare</strong>: $872/month (tirzepatide option)</li>
        <li><strong>Brand-name at list price</strong>: $900&ndash;$1,500/month (avoid this if possible)</li>
      </ul>

      <h2 style={s.h2}>Best Budget Option: Wegovy Oral for $149/Month</h2>
      <p style={s.p}>If you want an FDA-approved GLP-1 at the lowest possible price, Wegovy oral semaglutide is your answer. Through August 31, 2026, Novo Nordisk is running an introductory offer that lets eligible self-pay patients get the daily pill for just $149/month for the first two months. After the promotion ends, pricing is expected to stabilize around $199&ndash;$349/month.</p>
      <p style={s.p}>The main trade-off: the oral version may not be quite as effective as weekly injectables for some patients, and you have to take it daily. But for budget-conscious shoppers, this is the sweet spot for FDA-approved safety with a rock-bottom price.</p>
      <h3 style={s.h3}>How to get Wegovy oral at $149/month:</h3>
      <ol style={s.ul}>
        <li>Visit Novo Nordisk's official Wegovy website or work through a telehealth partner that offers the program</li>
        <li>Complete a consultation with a licensed clinician (usually $50&ndash;$100 if not covered by the program)</li>
        <li>Receive your prescription and activate the $149/month pricing</li>
        <li>Refill each month at the same rate through the program</li>
      </ol>

      <h2 style={s.h2}>Most Affordable Option: Compounded Semaglutide ($117&ndash;$250/month)</h2>
      <p style={s.p}>Compounded semaglutide is the absolute cheapest GLP-1 option you can find, sometimes starting as low as $117 per month through licensed telehealth providers. But it comes with a crucial caveat: it's not FDA-approved.</p>
      <p style={s.p}>Compounded medications are made by licensed pharmacists in accordance with a doctor's prescription, and the FDA does oversee compounding facilities. However, they're not manufactured under the same rigorous standards as brand-name drugs, and your insurance won't cover them.</p>
      <p style={s.p}><strong>When compounded makes sense:</strong> You're budget-constrained, have had success with semaglutide before, and you're comfortable with slightly less regulatory oversight.</p>
      <p style={s.p}><strong>When to avoid compounded:</strong> You're new to GLP-1s and want the assurance of an FDA-approved medication, or you have concerns about product consistency.</p>

      <h2 style={s.h2}>Best Brand-Name Option: Zepbound Vials ($299&ndash;$449/month)</h2>
      <p style={s.p}>If you want to stick with a brand-name, FDA-approved medication but minimize cost, Zepbound (tirzepatide, made by Eli Lilly) in single-dose vial format beats the pre-filled pen versions by $200&ndash;$500 per month.</p>
      <p style={s.p}>Pre-filled Zepbound pens can cost over $1,000 per month. The same medication in vial form through Lilly's Direct program costs $349&ndash;$499/month depending on dose. You inject from the vial yourself using a standard syringe, which takes practice but saves significant money.</p>

      <h2 style={s.h2}>Second Brand-Name Option: Ozempic with Savings Card ($499/month)</h2>
      <p style={s.p}>Novo Nordisk's patient assistance program makes Ozempic (semaglutide injection) available for $499/month for eligible self-pay patients. This is higher than Zepbound vials but can be a good alternative if:</p>
      <ul style={s.ul}>
        <li>Your doctor has prescribed Ozempic specifically and you're already on it</li>
        <li>You want a weekly injection instead of a vial you have to draw from</li>
        <li>You've responded well to semaglutide in the past</li>
      </ul>

      <h2 style={s.h2}>Smart Shopping: Price Comparison Across Pharmacies</h2>
      <p style={s.p}>Even with the same medication and dose, pharmacy prices can vary by $100&ndash;$200 per month. Always compare prices across multiple chains before filling your prescription:</p>
      <ul style={s.ul}>
        <li>Check big-box chains: Walmart, CVS, Walgreens</li>
        <li>Use GoodRx or SingleCare to see discounted rates</li>
        <li>Call independent pharmacies&mdash;they sometimes negotiate better prices</li>
        <li>Ask your telehealth provider which pharmacy they recommend (some have direct relationships)</li>
      </ul>

      <h2 style={s.h2}>How to Find Current Discounts and Promotions</h2>
      <p style={s.p}>Pricing and promotions change frequently. Before you commit to any option, verify current pricing:</p>
      <ul style={s.ul}>
        <li><strong>Novo Nordisk Direct Programs:</strong> Wegovy.com and Ozempic.com for self-pay pricing and eligibility</li>
        <li><strong>Eli Lilly Direct:</strong> LillyDirect.com for Mounjaro and Zepbound self-pay options</li>
        <li><strong>GoodRx:</strong> Shows real-time pharmacy prices and available coupons</li>
        <li><strong>Manufacturer Coupons:</strong> Check the official medication websites for savings cards</li>
      </ul>

      <h2 style={s.h2}>Important Questions to Ask Before You Buy</h2>
      <p style={s.p}>Price isn't the only factor. Before choosing your GLP-1, ask:</p>
      <ol style={s.ul}>
        <li><strong>Is this medication FDA-approved?</strong> (Matters for safety and long-term confidence)</li>
        <li><strong>What's the total monthly cost including doctor visits?</strong> (Some telehealth adds $40&ndash;$100 per month)</li>
        <li><strong>Can I switch medications if this one doesn't work?</strong> (Good safety net)</li>
        <li><strong>What happens after introductory pricing ends?</strong> (Plan for the real long-term cost)</li>
        <li><strong>Is there a refund or money-back guarantee if I have side effects?</strong></li>
      </ol>

      <h2 style={s.h2}>Bottom Line</h2>
      <p style={s.p}>The cheapest GLP-1 without insurance is compounded semaglutide at $117&ndash;$250/month. If you want FDA approval, Wegovy oral at $149/month is unbeatable. For a brand-name injectable, Zepbound vials at $299&ndash;$449/month offer the best value.</p>
      <p style={s.p}>Don't pay list price. Use our tool to find your lowest-cost, safest option today.</p>
    </SeoPageLayout>
  );
}

// ─── SEO PAGE 2: OZEMPIC VS MOUNJARO COST ───
const PAGE2_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Ozempic vs Mounjaro Cost Comparison",
  "itemListElement": [
    {
      "@type": "Product",
      "name": "Ozempic",
      "brand": {"@type": "Brand", "name": "Novo Nordisk"},
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "499",
        "description": "Monthly self-pay price with manufacturer program"
      }
    },
    {
      "@type": "Product",
      "name": "Mounjaro",
      "brand": {"@type": "Brand", "name": "Eli Lilly"},
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "1097",
        "description": "Monthly self-pay price via GoodRx (TrumpRx and LillyDirect no longer offer Mounjaro)"
      }
    }
  ]
};

function OzempicVsMounjaroCost() {
  const s = legalStyles;
  const t = tableStyles;
  return (
    <SeoPageLayout
      title="Ozempic vs Mounjaro Cost Comparison 2026 | GLP-1 Cost Finder"
      description="Side-by-side cost comparison of Ozempic vs Mounjaro — insurance, copay cards, telehealth, and self-pay prices compared."
      h1="Ozempic vs Mounjaro Cost: Complete 2026 Price Comparison"
      jsonLd={PAGE2_JSONLD}
      ctaLabel="Find Your Best Price"
      nextTo="/glp1-self-pay-options"
      nextLabel="View all self-pay options &rarr;"
    >
      <p style={s.p}>If you're deciding between Ozempic and Mounjaro, price is probably a big factor. Both are powerful GLP-1 medications, but they're made by different companies with different pricing strategies. Your actual out-of-pocket cost depends on whether you have insurance, whether you qualify for discounts, and where you fill your prescription.</p>
      <p style={s.p}>This guide breaks down exactly what each medication costs in 2026 so you can make a real comparison, not just look at list prices.</p>

      <h2 style={s.h2}>Quick Price Comparison: Head-to-Head</h2>
      <div style={{overflowX:"auto"}}>
      <table style={t.table}>
        <thead>
          <tr>
            <th style={t.th}>Medication</th>
            <th style={t.th}>List Price</th>
            <th style={t.th}>Manufacturer Discount</th>
            <th style={t.th}>Pharmacy Coupon</th>
            <th style={t.th}>Best Budget</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{...t.td,...t.tdStrong}}>Ozempic (Semaglutide)</td>
            <td style={t.td}>$978&ndash;$1,000/mo</td>
            <td style={t.td}>$499/mo</td>
            <td style={t.td}>$400&ndash;$600/mo</td>
            <td style={t.td}>$199/mo (intro)</td>
          </tr>
          <tr>
            <td style={{...t.td,...t.tdStrong}}>Mounjaro (Tirzepatide)</td>
            <td style={t.td}>$1,069&ndash;$1,079/mo</td>
            <td style={t.td}>$499/mo (vials)</td>
            <td style={t.td}>$800&ndash;$900/mo</td>
            <td style={t.td}>$349/mo (vials)</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p style={s.p}><strong>Quick verdict:</strong> For self-pay patients, Mounjaro vials are typically cheaper ($349&ndash;$499) than Ozempic ($499), but Ozempic wins if you can access the current introductory offer ($199/month). Insurance coverage varies widely and depends on your plan.</p>

      <h2 style={s.h2}>Ozempic Pricing Breakdown</h2>
      <h3 style={s.h3}>List Price</h3>
      <p style={s.p}>Ozempic's full retail price is approximately $978&ndash;$1,000 per month for a standard dose. This is what you'd pay without any discounts, insurance, or savings programs. Avoid this if possible.</p>
      <h3 style={s.h3}>Novo Nordisk Patient Assistance Program: $499/Month</h3>
      <p style={s.p}>Novo Nordisk, the manufacturer of Ozempic, offers a patient assistance program for self-pay eligible patients. The cost is a flat $499/month, and the medication ships directly to your home.</p>
      <p style={s.p}><strong>Who qualifies:</strong> You must be a U.S. resident without commercial insurance coverage (or your insurance doesn't cover the medication). You don't need to prove income, which makes this accessible to many people.</p>
      <p style={s.p}><strong>How to access:</strong> Go to Novo Nordisk's official website or ask your healthcare provider to enroll you.</p>
      <h3 style={s.h3}>GoodRx and SingleCare: $400&ndash;$600/Month</h3>
      <p style={s.p}>If you have a discount card like GoodRx or SingleCare, Ozempic prices vary by pharmacy, but you're typically looking at $400&ndash;$600/month. This is cheaper than list price but more expensive than the manufacturer's direct program, so it's less optimal for uninsured patients.</p>
      <h3 style={s.h3}>Insurance Coverage</h3>
      <p style={s.p}>With commercial insurance, Ozempic copayments can range from $25 to $200/month depending on your plan and deductible. Many insurance plans now cover Ozempic, but some require prior authorization or proof that you've tried other medications first.</p>
      <h3 style={s.h3}>Current Promotional Pricing: $199/Month (Limited Time)</h3>
      <p style={s.p}>As of 2026, Novo Nordisk is running an introductory offer: eligible new patients can get Wegovy oral semaglutide (same active ingredient as Ozempic) for $199/month for the first two months. After the promotion, pricing moves to $349&ndash;$499/month. This is technically a different formulation (oral vs. injectable), but if you're open to the pill version, it's an excellent entry price.</p>

      <h2 style={s.h2}>Mounjaro Pricing Breakdown</h2>
      <h3 style={s.h3}>List Price</h3>
      <p style={s.p}>Mounjaro (tirzepatide), made by Eli Lilly, has a list price of $1,069&ndash;$1,079 per month for a standard one-month supply (four pens). Like Ozempic, this list price is rarely what anyone pays in practice.</p>
      <h3 style={s.h3}>Lilly Direct Self-Pay Program: $349&ndash;$499/Month</h3>
      <p style={s.p}>Eli Lilly launched the Zepbound Self-Pay Journey Program (Zepbound is the weight-loss version of tirzepatide; Mounjaro is the diabetes version, but pricing is identical). When you buy directly through LillyDirect, you access vials instead of pre-filled pens, which dramatically reduces cost.</p>
      <p style={s.p}><strong>Dosing structure:</strong></p>
      <ul style={s.ul}>
        <li>2.5 mg (starting dose): $349/month for the first fill</li>
        <li>5 mg and above: $499/month</li>
      </ul>
      <p style={s.p}><strong>Why vials cost less:</strong> Pre-filled pens cost $900&ndash;$1,200/month because they're more convenient. Vials require you to draw the dose yourself with a syringe, which takes about 30 seconds and saves $200&ndash;$700/month. If you're comfortable with a needle, it's a no-brainer.</p>
      <h3 style={s.h3}>SingleCare and Other Coupons: $800&ndash;$900/Month</h3>
      <p style={s.p}>If you use a discount card like SingleCare, Mounjaro prices fall to around $800&ndash;$900/month. Better than list price, but more expensive than Lilly Direct, so less ideal if you don't have insurance.</p>
      <h3 style={s.h3}>Insurance Coverage</h3>
      <p style={s.p}>Insurance coverage for Mounjaro varies widely. Some plans cover it; others exclude it or require extensive prior authorization. If your plan covers Mounjaro, your copay might be as low as $25&ndash;$150/month. If it doesn't cover it, you're paying out-of-pocket, and Lilly Direct becomes your best option.</p>

      <h2 style={s.h2}>Which Is Cheaper: Ozempic or Mounjaro?</h2>
      <h3 style={s.h3}>For Self-Pay Patients (No Insurance)</h3>
      <p style={s.p}><strong>Mounjaro wins.</strong> At $349/month for starting doses and $499/month for higher doses, Mounjaro vials beat Ozempic's $499/month flat rate. The difference is $150/month at the starting dose&mdash;that's $1,800/year.</p>
      <p style={s.p}>Exception: If you qualify for Novo Nordisk's current $199/month promotion for Wegovy oral, that beats Mounjaro. But once the promotion ends, Mounjaro is cheaper.</p>
      <h3 style={s.h3}>For Insured Patients</h3>
      <p style={s.p}>Your plan determines the winner. Ask your insurance company what the copay is for each medication. It could be as low as $25&ndash;$50/month for either one if your plan covers it well. Some plans prefer one drug over the other and charge a lower copay as an incentive.</p>
      <h3 style={s.h3}>Overall Cost Comparison (Full Picture)</h3>
      <p style={s.p}>The most honest answer: costs are nearly identical for both medications when you account for real-world pricing through manufacturer programs ($349&ndash;$499/month for both). The choice should come down to efficacy, tolerability, and convenience, not price.</p>

      <h2 style={s.h2}>What About Convenience and Format?</h2>
      <h3 style={s.h3}>Ozempic</h3>
      <ul style={s.ul}>
        <li>Pre-filled injection pen (easier)</li>
        <li>Weekly injection</li>
        <li>Available through multiple access channels (telehealth, local pharmacies, direct programs)</li>
      </ul>
      <h3 style={s.h3}>Mounjaro</h3>
      <ul style={s.ul}>
        <li>Pre-filled injection pen (easier) at higher cost</li>
        <li>Single-dose vials (cheaper but requires manual injection) at $349&ndash;$499/month</li>
        <li>Weekly injection</li>
        <li>Primarily through Lilly Direct for lowest self-pay pricing</li>
      </ul>

      <h2 style={s.h2}>How to Reduce Your Actual Costs Further</h2>
      <ol style={s.ul}>
        <li><strong>Use manufacturer programs first.</strong> Both Novo Nordisk and Eli Lilly offer the best discounts directly, not through insurance or pharmacies.</li>
        <li><strong>Choose vials over pens if you can.</strong> The savings are substantial (30&ndash;50% cheaper).</li>
        <li><strong>Shop pharmacies for pen versions.</strong> Even within a manufacturer program, some pharmacies charge different amounts. Walmart and independent pharmacies often beat chain drugstores.</li>
        <li><strong>Ask about prior authorization delays.</strong> Insurance may require your doctor to request special approval, which takes time but sometimes results in better coverage.</li>
        <li><strong>Review your insurance plan annually.</strong> Coverage and copays change each year; you might find a better plan during open enrollment.</li>
      </ol>

      <h2 style={s.h2}>Side-by-Side Decision Matrix</h2>
      <div style={{overflowX:"auto"}}>
      <table style={t.table}>
        <thead>
          <tr><th style={t.th}>Factor</th><th style={t.th}>Ozempic</th><th style={t.th}>Mounjaro</th></tr>
        </thead>
        <tbody>
          <tr><td style={{...t.td,...t.tdStrong}}>Cheapest self-pay price</td><td style={t.td}>$199/mo (promo) / $499 (regular)</td><td style={t.td}>$349&ndash;$499/mo</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Easiest access</td><td style={t.td}>More telehealth options available</td><td style={t.td}>Lilly Direct is primary route</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Convenience</td><td style={t.td}>Pre-filled pen (no preparation)</td><td style={t.td}>Vial (manual injection) or pen</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Active ingredient</td><td style={t.td}>Semaglutide (GLP-1 only)</td><td style={t.td}>Tirzepatide (GLP-1 + GIP receptor)</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Insurance coverage likelihood</td><td style={t.td}>Moderately common</td><td style={t.td}>Less common, more prior auth</td></tr>
        </tbody>
      </table>
      </div>

      <h2 style={s.h2}>What Patients Actually Report Spending</h2>
      <p style={s.p}>Based on real user experiences from 2026:</p>
      <ul style={s.ul}>
        <li><strong>Ozempic via manufacturer program:</strong> $499/month + $50&ndash;$100 for telehealth visit = $550&ndash;$600/month total</li>
        <li><strong>Mounjaro vials via Lilly Direct:</strong> $349&ndash;$499/month + $50&ndash;$100 for telehealth = $400&ndash;$600/month total</li>
        <li><strong>Either medication with insurance:</strong> $25&ndash;$150/month copay, depending on plan</li>
      </ul>

      <h2 style={s.h2}>Bottom Line</h2>
      <p style={s.p}>For uninsured patients, Mounjaro vials are typically $150&ndash;$200/month cheaper than Ozempic. For insured patients, the winner depends on your specific plan's coverage and copay structure. Don't assume one is cheaper without checking your actual insurance benefits&mdash;and always use manufacturer programs, not list prices, for self-pay options.</p>
    </SeoPageLayout>
  );
}

// ─── SEO PAGE 3: GLP-1 SELF-PAY OPTIONS AFFORDABLE ───
const PAGE3_JSONLD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Find Affordable GLP-1 Self-Pay Options",
  "description": "Complete guide to selecting and accessing affordable GLP-1 self-pay options in 2026",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Determine if you want FDA approval",
      "text": "Decide whether FDA approval is important to you. If cost is the only factor, compounded options are cheapest."
    },
    {
      "@type": "HowToStep",
      "name": "Choose injection format",
      "text": "Decide between daily pills (Wegovy oral) or weekly injections (Mounjaro vials, Ozempic)."
    },
    {
      "@type": "HowToStep",
      "name": "Compare prices across providers",
      "text": "Get quotes from manufacturer programs and telehealth providers to find the lowest price for your chosen format."
    }
  ]
};

function Glp1SelfPayOptions() {
  const s = legalStyles;
  const t = tableStyles;
  return (
    <SeoPageLayout
      title="GLP-1 Self-Pay Options Ranked by Price | GLP-1 Cost Finder"
      description="Every GLP-1 self-pay option ranked by real monthly cost. Telehealth providers, compounding pharmacies, and manufacturer programs compared."
      h1="Affordable GLP-1 Self-Pay Options: Your Complete 2026 Guide"
      jsonLd={PAGE3_JSONLD}
      ctaLabel="Find My Best Self-Pay Option"
      nextTo="/cheapest-glp1-without-insurance"
      nextLabel="Find the absolute lowest cost &rarr;"
    >
      <p style={s.p}>GLP-1 medications have become more accessible in 2026, but affordability still depends on knowing which options exist and how to access them. If you're paying out-of-pocket, you have more choices than ever&mdash;and they range from budget options under $200/month to premium brands that cost $500 and up.</p>
      <p style={s.p}>This guide breaks down every self-pay option available so you can find one that fits your budget and your health needs.</p>

      <h2 style={s.h2}>The Full Spectrum of Self-Pay Options (Ranked by Price)</h2>

      <h3 style={s.h3}>1. Compounded Semaglutide: $117&ndash;$250/Month</h3>
      <p style={s.p}><strong>What it is:</strong> Semaglutide (the same active ingredient as Ozempic and Wegovy) mixed by a licensed pharmacist based on a doctor's prescription. Not FDA-approved as a final product, but made by licensed pharmacies under FDA oversight.</p>
      <p style={s.p}><strong>How to access:</strong> Telehealth providers specializing in weight loss or compounded medications can prescribe and source this for you. Companies like Ro, Calibrate, and various independent clinics offer it.</p>
      <p style={s.p}><strong>Pros:</strong></p>
      <ul style={s.ul}>
        <li>Lowest price point available</li>
        <li>Same active ingredient as brand-name options</li>
        <li>Often includes doctor visits and support</li>
      </ul>
      <p style={s.p}><strong>Cons:</strong></p>
      <ul style={s.ul}>
        <li>Not FDA-approved as a finished medication</li>
        <li>Less regulatory oversight on manufacturing consistency</li>
        <li>Insurance won't cover it</li>
        <li>Some quality variation between compounding pharmacies</li>
      </ul>
      <p style={s.p}><strong>Best for:</strong> Cost-conscious patients who've used semaglutide before, or those who want to try GLP-1 at the lowest risk investment before committing to brand-name medications.</p>

      <h3 style={s.h3}>2. Wegovy Oral (Pill): $149&ndash;$199/Month</h3>
      <p style={s.p}><strong>What it is:</strong> Semaglutide in pill form (Rybelsus is the generic name), manufactured by Novo Nordisk. FDA-approved, taken daily.</p>
      <p style={s.p}><strong>Current promotion:</strong> Through August 31, 2026, eligible patients can get Wegovy oral for $149/month for the first two months. After the promotion, expect $199&ndash;$349/month.</p>
      <p style={s.p}><strong>How to access:</strong> Through Novo Nordisk's official Wegovy program or participating telehealth providers.</p>
      <p style={s.p}><strong>Pros:</strong></p>
      <ul style={s.ul}>
        <li>FDA-approved (safety and consistency guaranteed)</li>
        <li>Unbeatable introductory price ($149/month)</li>
        <li>Easy to take (no needles)</li>
        <li>Direct from manufacturer (no middleman pricing)</li>
      </ul>
      <p style={s.p}><strong>Cons:</strong></p>
      <ul style={s.ul}>
        <li>Daily pill (less convenient than weekly injection)</li>
        <li>May be slightly less effective than injectables for some people</li>
        <li>Introductory pricing ends August 2026</li>
      </ul>
      <p style={s.p}><strong>Best for:</strong> Patients who want FDA approval at the cheapest price, and who don't mind taking a daily pill instead of weekly injection.</p>

      <h3 style={s.h3}>3. Mounjaro/Zepbound Vials: $349&ndash;$499/Month</h3>
      <p style={s.p}><strong>What it is:</strong> Tirzepatide (dual GLP-1/GIP receptor agonist) in single-dose vials. FDA-approved, made by Eli Lilly, self-injected weekly.</p>
      <p style={s.p}><strong>How to access:</strong> Primarily through Eli Lilly's LillyDirect self-pay program.</p>
      <p style={s.p}><strong>Dosing &amp; pricing:</strong></p>
      <ul style={s.ul}>
        <li>2.5 mg (starting dose): $349/month</li>
        <li>5 mg and above: $499/month</li>
      </ul>
      <p style={s.p}><strong>Pros:</strong></p>
      <ul style={s.ul}>
        <li>FDA-approved brand name</li>
        <li>Dual-action mechanism (often more effective than semaglutide-only for weight loss)</li>
        <li>Vial format = 30&ndash;50% cheaper than pre-filled pens</li>
        <li>Weekly injection</li>
      </ul>
      <p style={s.p}><strong>Cons:</strong></p>
      <ul style={s.ul}>
        <li>Requires manual injection from a vial (not pre-filled)</li>
        <li>Steeper learning curve for injection technique</li>
        <li>Slightly higher price than Ozempic at standard dose</li>
      </ul>
      <p style={s.p}><strong>Best for:</strong> Patients comfortable with self-injecting who want the most effective option at a reasonable price.</p>

      <h3 style={s.h3}>4. Ozempic Injectables: $199&ndash;$499/Month</h3>
      <p style={s.p}><strong>What it is:</strong> Semaglutide (same as Wegovy, but in injectable form). FDA-approved for type 2 diabetes (and widely used off-label for weight loss).</p>
      <p style={s.p}><strong>Current promotion:</strong> $199/month for the first two months if you're a new patient through Novo Nordisk's program.</p>
      <p style={s.p}><strong>Regular self-pay price:</strong> $499/month through Novo Nordisk's patient assistance program.</p>
      <p style={s.p}><strong>How to access:</strong> Novo Nordisk's official program, or through telehealth providers who partner with Novo Nordisk.</p>
      <p style={s.p}><strong>Pros:</strong></p>
      <ul style={s.ul}>
        <li>FDA-approved</li>
        <li>Pre-filled pens (no drawing from vials)</li>
        <li>Introductory pricing available ($199/month)</li>
        <li>Weekly injection</li>
        <li>Widely available through telehealth</li>
      </ul>
      <p style={s.p}><strong>Cons:</strong></p>
      <ul style={s.ul}>
        <li>$499/month after intro pricing (more than Mounjaro vials)</li>
        <li>Semaglutide-only (less mechanism variety than tirzepatide)</li>
      </ul>
      <p style={s.p}><strong>Best for:</strong> Patients who want a pre-filled pen for maximum convenience, or who have previously done well on semaglutide.</p>

      <h3 style={s.h3}>5. Mounjaro/Zepbound Pens: $900&ndash;$1,200/Month</h3>
      <p style={s.p}><strong>What it is:</strong> Tirzepatide in pre-filled pens. FDA-approved, made by Eli Lilly.</p>
      <p style={s.p}><strong>How to access:</strong> Through traditional pharmacies with SingleCare, GoodRx, or other discount cards. More expensive than vials because of the pre-filled convenience.</p>
      <p style={s.p}><strong>Pros:</strong></p>
      <ul style={s.ul}>
        <li>FDA-approved</li>
        <li>Pre-filled pens (easiest to use)</li>
        <li>Dual-action mechanism</li>
        <li>Widely available</li>
      </ul>
      <p style={s.p}><strong>Cons:</strong></p>
      <ul style={s.ul}>
        <li>Most expensive option (except brand-name list price)</li>
        <li>Only makes sense if your insurance has good coverage</li>
      </ul>
      <p style={s.p}><strong>Best for:</strong> Insured patients whose plans cover Mounjaro well. If you're self-pay, get vials instead ($500&ndash;$700 cheaper per month).</p>

      <h2 style={s.h2}>How to Choose the Right Self-Pay Option for You</h2>
      <h3 style={s.h3}>Decision Tree</h3>
      <p style={s.p}><strong>Question 1: Do you want FDA approval?</strong></p>
      <ul style={s.ul}>
        <li><strong>Yes:</strong> Go to Question 2</li>
        <li><strong>No:</strong> Compounded semaglutide ($117&ndash;$250) is your answer</li>
      </ul>
      <p style={s.p}><strong>Question 2: Do you prefer daily pills or weekly injections?</strong></p>
      <ul style={s.ul}>
        <li><strong>Daily pill:</strong> Wegovy oral ($149&ndash;$199/month) is your answer</li>
        <li><strong>Weekly injection:</strong> Go to Question 3</li>
      </ul>
      <p style={s.p}><strong>Question 3: Are you comfortable manually injecting from a vial, or do you want a pre-filled pen?</strong></p>
      <ul style={s.ul}>
        <li><strong>Vial (save money):</strong> Mounjaro vials ($349&ndash;$499) is your answer</li>
        <li><strong>Pre-filled pen (easier):</strong> Ozempic ($199&ndash;$499) or Mounjaro pen ($900+ if no insurance)</li>
      </ul>

      <h2 style={s.h2}>Real Self-Pay Costs (All-In, Including Doctor Visits)</h2>
      <p style={s.p}>The medication price is only part of your total cost. Most people also pay for telehealth consultations, follow-up visits, and potentially membership fees.</p>
      <div style={{overflowX:"auto"}}>
      <table style={t.table}>
        <thead>
          <tr><th style={t.th}>Option</th><th style={t.th}>Medication/mo</th><th style={t.th}>Doctor Visits/mo*</th><th style={t.th}>Total/mo</th></tr>
        </thead>
        <tbody>
          <tr><td style={{...t.td,...t.tdStrong}}>Compounded Semaglutide</td><td style={t.td}>$117&ndash;$250</td><td style={t.td}>$30&ndash;$75</td><td style={t.td}>$147&ndash;$325</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Wegovy Oral ($149 promo)</td><td style={t.td}>$149</td><td style={t.td}>$25&ndash;$50</td><td style={t.td}>$174&ndash;$199</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Mounjaro Vials</td><td style={t.td}>$349&ndash;$499</td><td style={t.td}>$25&ndash;$75</td><td style={t.td}>$374&ndash;$574</td></tr>
          <tr><td style={{...t.td,...t.tdStrong}}>Ozempic ($499 regular)</td><td style={t.td}>$499</td><td style={t.td}>$25&ndash;$75</td><td style={t.td}>$524&ndash;$574</td></tr>
        </tbody>
      </table>
      </div>
      <p style={{...s.p,fontSize:12,color:"#64748b"}}>*Doctor visit costs vary; some programs bundle visits with medication, some charge separately.</p>

      <h2 style={s.h2}>Strategies to Minimize Your Total Cost</h2>
      <ol style={s.ul}>
        <li><strong>Start with compounded or Wegovy oral.</strong> Test GLP-1 at the lowest price before upgrading to more expensive brands.</li>
        <li><strong>Use vials instead of pens.</strong> This saves $150&ndash;$500/month for the same medication.</li>
        <li><strong>Buy directly from manufacturers.</strong> Lilly Direct and Novo Nordisk's programs beat pharmacies and discount cards for self-pay patients.</li>
        <li><strong>Look for bundled programs.</strong> Some telehealth providers include doctor visits, medication, and follow-up in one monthly fee (often $300&ndash;$400/month all-in).</li>
        <li><strong>Ask about annual discounts.</strong> Some programs offer 5&ndash;10% off if you pay 3 or 6 months upfront.</li>
        <li><strong>Monitor for promos.</strong> Novo Nordisk's current $149/month Wegovy offer is time-limited; similar programs rotate through different medications. Sign up for manufacturer newsletters to catch deals.</li>
      </ol>

      <h2 style={s.h2}>Insurance vs. Self-Pay: When Self-Pay Actually Wins</h2>
      <p style={s.p}>It might seem like insurance is always better, but for GLP-1s, self-pay sometimes costs less:</p>
      <ul style={s.ul}>
        <li><strong>If your deductible is high:</strong> You might pay full price until hitting your deductible. Self-pay programs cap your cost at $149&ndash;$499/month regardless of deductible.</li>
        <li><strong>If insurance requires prior auth:</strong> Waiting weeks for authorization while managing weight makes self-pay's speed valuable.</li>
        <li><strong>If insurance denies coverage:</strong> Some plans exclude GLP-1s or only cover them for diabetes, not weight loss. Self-pay becomes your only option.</li>
        <li><strong>If your copay is high:</strong> If insurance's copay is $200+/month, Wegovy oral at $149 or Mounjaro vials at $349 might be cheaper.</li>
      </ul>

      <h2 style={s.h2}>Questions to Ask Before Choosing</h2>
      <ul style={s.ul}>
        <li><strong>What's included in the monthly cost?</strong> (Medication only, or does it include doctor visits?)</li>
        <li><strong>What happens after I reach my goal weight or stop?</strong> (Can I pause, refund policy?)</li>
        <li><strong>Is there a contract or commitment?</strong> (Some require 3&ndash;6 month minimums)</li>
        <li><strong>Are medication adjustments included?</strong> (Or will I pay extra if I need a different dose?)</li>
        <li><strong>What if I have side effects?</strong> (Can I try a different medication at no extra cost?)</li>
        <li><strong>How do I reach my doctor if I have questions?</strong> (24/7 support, or business hours only?)</li>
      </ul>

      <h2 style={s.h2}>Bottom Line</h2>
      <p style={s.p}>Affordable GLP-1 self-pay options range from $117/month (compounded semaglutide) to $499/month (brand-name injectables). The cheapest FDA-approved option is Wegovy oral at $149/month during the current promotion. For longer-term affordability, Mounjaro vials at $349&ndash;$499/month offer excellent value and efficacy. Start by identifying your priorities&mdash;cost, FDA approval, injection comfort&mdash;and choose accordingly. Use our tool to compare your exact options today.</p>
    </SeoPageLayout>
  );
}

export default function App() {
  useCanonical();
  return (
    <Routes>
      <Route path="/" element={<GLP1CostFinder />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/medicare-glp1-eligibility" element={<MedicareGlp1Eligibility />} />
      <Route path="/provider-check" element={<ProviderCheckPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cheapest-glp1-without-insurance" element={<CheapestGlp1WithoutInsurance />} />
      <Route path="/ozempic-vs-mounjaro-cost" element={<OzempicVsMounjaroCost />} />
      <Route path="/glp1-self-pay-options" element={<Glp1SelfPayOptions />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── EMAIL CAPTURE (reusable, non-blocking) ───
// Submits to the same Mailchimp list with the same MERGE fields the old gated
// form used (STATE, INSTYPE, CONDITION). variant="banner" is the downstream
// "price drop alerts" card; variant="inline" is the per-provider expand-on-click
// form on each telehealth card. Provider name is shown in the UI for context
// but not submitted as a separate MERGE field -- the audience doesn't have a
// PROVIDER field set up, and adding unknown fields causes Mailchimp to reject
// the submission. Segmentation by provider can be added later by setting up a
// PROVIDER merge field in Mailchimp and passing it through here.
function EmailCapture({
  selectedState,
  insurance,
  condition,
  variant = "banner",
  headline,
  description,
  buttonLabel = "Subscribe",
  providerName,
  tags,           // optional Mailchimp tag(s) to associate with this signup
}) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const submit = () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email");
      return;
    }
    setError("");
    setSubmitting(true);

    const baseUrl = "https://olsoncoaches.us16.list-manage.com/subscribe/post-json";
    const params = new URLSearchParams({
      u: "de1492a2adba6ccde526379b6",
      id: "83c9757d1b",
      f_id: "00212be0f0",
      EMAIL: email,
      STATE: selectedState || "",
      INSTYPE: insurance || "",
      CONDITION: condition || "",
      "b_de1492a2adba6ccde526379b6_83c9757d1b": "",
    });
    // Mailchimp tag pre-assignment. Passed as `tags=tag1,tag2` on the
    // signup URL; whether the audience actually applies the tag depends
    // on how the form/audience is configured in Mailchimp. Safe to pass
    // either way -- Mailchimp ignores it if not configured.
    if (tags) params.set("tags", Array.isArray(tags) ? tags.join(",") : tags);

    const callbackName = "mc_callback_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      setSubmitting(false);
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      const s = document.getElementById(callbackName);
      if (s) s.remove();
    };

    window[callbackName] = (data) => {
      if (data && data.result === "success") {
        setSubmitted(true);
      } else if (data && data.msg && /already subscribed/i.test(data.msg)) {
        setAlreadySubscribed(true);
        setSubmitted(true);
      } else {
        setError("Subscription failed. Please try again.");
      }
      cleanup();
    };

    const script = document.createElement("script");
    script.id = callbackName;
    script.src = baseUrl + "?" + params.toString() + "&c=" + callbackName;
    script.onerror = () => {
      setError("Something went wrong, please try again.");
      cleanup();
    };
    document.body.appendChild(script);

    setTimeout(() => {
      if (!settled) {
        setError("Something went wrong, please try again.");
        cleanup();
      }
    }, 8000);
  };

  // ── INLINE (per-provider) ──
  if (variant === "inline") {
    if (submitted) {
      return (
        <div style={{fontSize:11,color:"#059669",fontWeight:600,marginTop:8}}>
          {alreadySubscribed
            ? "✓ You're already on the list — we'll keep you posted."
            : "✓ Got it. We'll alert you when " + (providerName || "this provider") + " moves on price."}
        </div>
      );
    }
    if (!expanded) {
      return (
        <button
          onClick={() => setExpanded(true)}
          style={{marginTop:8,padding:0,background:"none",border:"none",color:"#0369a1",fontSize:11,fontWeight:600,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
        >
          Get price alerts for {providerName}
        </button>
      );
    }
    return (
      <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
        <div style={{display:"flex",gap:6}}>
          <input
            type="email"
            placeholder={"Email for " + providerName + " alerts"}
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !submitting && submit()}
            disabled={submitting}
            style={{flex:1,padding:"6px 10px",borderRadius:6,border:error?"1px solid #f43f5e":"1px solid #cbd5e1",fontSize:12,background:"#fff",color:"#1e293b",minWidth:0}}
          />
          <button
            onClick={submit}
            disabled={submitting}
            style={{padding:"6px 12px",borderRadius:6,border:"none",background:"#0369a1",color:"#fff",fontSize:11,fontWeight:700,cursor:submitting?"wait":"pointer",whiteSpace:"nowrap",opacity:submitting?0.7:1}}
          >
            {submitting ? "…" : "Alert me"}
          </button>
        </div>
        {error && <div style={{color:"#f43f5e",fontSize:10}}>{error}</div>}
      </div>
    );
  }

  // ── BANNER (downstream) ──
  if (submitted) {
    return (
      <div style={{background:"#f0fdf4",borderRadius:12,padding:"14px 18px",marginBottom:16,textAlign:"center",border:"1px solid #bbf7d0"}}>
        <span style={{fontSize:13,color:"#059669",fontWeight:600}}>
          {alreadySubscribed
            ? "✓ You're already subscribed — we'll keep sending you alerts."
            : "✓ You're in. We'll email you when GLP-1 prices move."}
        </span>
      </div>
    );
  }
  return (
    <div style={{background:"#fff",borderRadius:16,padding:"22px 24px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #e2e8f0"}}>
      <div style={{fontSize:16,fontWeight:800,color:"#1e293b",marginBottom:4}}>{headline}</div>
      <div style={{fontSize:13,color:"#64748b",marginBottom:14,lineHeight:1.55}}>{description}</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !submitting && submit()}
          disabled={submitting}
          style={{flex:"1 1 200px",padding:"10px 14px",borderRadius:8,border:error?"2px solid #f43f5e":"1px solid #cbd5e1",background:"#fff",color:"#1e293b",fontSize:14,minWidth:0}}
        />
        <button
          onClick={submit}
          disabled={submitting}
          style={{padding:"10px 20px",borderRadius:8,border:"none",background:"#0369a1",color:"#fff",fontSize:13,fontWeight:700,cursor:submitting?"wait":"pointer",whiteSpace:"nowrap",opacity:submitting?0.7:1}}
        >
          {submitting ? "Sending…" : buttonLabel}
        </button>
      </div>
      {error && <div style={{color:"#f43f5e",fontSize:12,marginTop:6}}>{error}</div>}
      <div style={{fontSize:11,color:"#94a3b8",marginTop:8}}>No spam. Unsubscribe anytime.</div>
    </div>
  );
}

// ─── PROVIDER CARD (cost breakdown) ─────────────────────────────────────
// Renders one telehealth provider with a prominent total cost, an
// expand-to-see-breakdown grid, and the per-provider email capture.
//
// Rendering rules for unknown fees:
//   - null         -> "Not disclosed"  (we couldn't verify it publicly)
//   - 0            -> "Free" / "Included"  (verified to be no charge)
//   - number > 0   -> "$X/mo" (or "$X" for one-time)
//
// Total-cost label:
//   - both totalMonthlyMin + Max known  -> "$X-$Y/mo"
//   - only Min known                    -> "From $X/mo"
//   - neither known                     -> "Pricing not disclosed"
function formatRecurring(value) {
  if (value === null || value === undefined) return "Not disclosed";
  if (value === 0) return "Included";
  return "$" + value + "/mo";
}
function formatOneTime(value) {
  if (value === null || value === undefined) return "Not disclosed";
  if (value === 0) return "Included";
  return "$" + value;
}
function formatShipping(value) {
  if (value === null || value === undefined) return "Not disclosed";
  if (value === 0) return "Free";
  return "$" + value + "/order";
}
function formatVerifiedDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return months[m - 1] + " " + d + ", " + y;
}
function totalCostLabel(opt) {
  if (opt.totalMonthlyMin == null && opt.totalMonthlyMax == null) {
    return "Pricing not disclosed";
  }
  if (
    opt.totalMonthlyMin != null &&
    opt.totalMonthlyMax != null &&
    opt.totalMonthlyMax > opt.totalMonthlyMin
  ) {
    return "$" + opt.totalMonthlyMin + "–$" + opt.totalMonthlyMax + "/mo";
  }
  if (opt.totalMonthlyMin != null) {
    return "From $" + opt.totalMonthlyMin + "/mo";
  }
  return "Pricing not disclosed";
}

function ProviderCard({ opt, selectedState, insurance, condition }) {
  const [expanded, setExpanded] = useState(false);
  const hasUndisclosed =
    opt.membershipFee === null ||
    opt.consultationFee === null ||
    opt.shippingFee === null;

  return (
    <div style={{background:"#fff",borderRadius:10,padding:"14px 16px",border:"1px solid #d1fae5"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{minWidth:0,flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{opt.name}</span>
            <span style={{fontSize:13,fontWeight:700,color:"#059669"}}>
              Total: {totalCostLabel(opt)}
            </span>
          </div>
          {opt.website && (
            <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>
              {opt.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </div>
          )}
          <div style={{fontSize:12,color:"#64748b",marginTop:3,lineHeight:1.5}}>{opt.detail}</div>
        </div>
        <div style={{flexShrink:0,textAlign:"center"}}>
          <a href={opt.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"8px 16px",borderRadius:8,border:"2px solid #10b981",background:"transparent",color:"#059669",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none"}}>Visit &rarr;</a>
          <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Affiliate link</div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{marginTop:10,padding:0,background:"none",border:"none",color:"#0369a1",fontSize:11,fontWeight:600,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:2}}
      >
        {expanded ? "Hide cost breakdown" : "See cost breakdown"}
      </button>

      {expanded && (
        <div style={{marginTop:8,padding:"10px 12px",borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0"}}>
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",columnGap:14,rowGap:5,fontSize:12}}>
            <span style={{color:"#64748b"}}>Medication</span>
            <span style={{color:"#1e293b",fontWeight:600}}>{formatRecurring(opt.baseMedPrice)}</span>
            <span style={{color:"#64748b"}}>Membership</span>
            <span style={{color:"#1e293b",fontWeight:600}}>
              {formatRecurring(opt.membershipFee)}
              {opt.membershipFeeNote && (
                <span style={{display:"block",fontSize:10,fontWeight:500,color:"#94a3b8",marginTop:2}}>
                  ({opt.membershipFeeNote})
                </span>
              )}
            </span>
            <span style={{color:"#64748b"}}>Consultation</span>
            <span style={{color:"#1e293b",fontWeight:600}}>{formatOneTime(opt.consultationFee)}</span>
            <span style={{color:"#64748b"}}>Shipping</span>
            <span style={{color:"#1e293b",fontWeight:600}}>{formatShipping(opt.shippingFee)}</span>
            <span style={{color:"#64748b"}}>Cancellation</span>
            <span style={{color:"#1e293b",fontWeight:600}}>{opt.cancellationPolicy || "Not disclosed"}</span>
          </div>
          {hasUndisclosed && (
            <div style={{marginTop:8,fontSize:10,color:"#94a3b8",lineHeight:1.5}}>
              Fields marked "Not disclosed" are not published on the provider's public site. Confirm fees during intake before signing up.
            </div>
          )}
        </div>
      )}

      <div style={{marginTop:8,fontSize:10,color:"#94a3b8"}}>
        Prices verified {formatVerifiedDate(opt.priceVerifiedDate)}
      </div>

      <EmailCapture
        variant="inline"
        selectedState={selectedState}
        insurance={insurance}
        condition={condition}
        providerName={opt.name}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───
function GLP1CostFinder() {
  const [insurance, setInsurance] = useState(null);
  const [condition, setCondition] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [expandedDrug, setExpandedDrug] = useState(null);
  const [providerSort, setProviderSort] = useState("totalLow");  // "totalLow" | "default"
  const [showMore, setShowMore] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [showDD, setShowDD] = useState(false);
  const ddRef = useRef(null);
  const resultsRef = useRef(null);

  const state = selectedState ? stateData[selectedState] : null;
  const ready = insurance && condition && (insurance !== "medicaid" || selectedState);

  const isGovIns = insurance === "medicaid" || insurance === "medicare";
  const isPrivate = insurance === "commercial";
  const isUninsured = insurance === "uninsured";

  // Smart recommendation: factor in condition + price
  const getRecommendation = () => {
    if (!condition || !insurance) return medications[0];
    const sortByPrice = (arr) => [...arr].sort((a,b) => {
      const pa = parseFloat(a.selfPay.price.replace(/[^0-9.]/g,''));
      const pb = parseFloat(b.selfPay.price.replace(/[^0-9.]/g,''));
      return pa - pb;
    });
    if (insurance === "uninsured" || condition === "skip") {
      return sortByPrice(medications)[0];
    }
    const matching = medications.filter(m => m.conditions.includes(condition));
    if (matching.length === 0) return sortByPrice(medications)[0];
    return sortByPrice(matching)[0];
  };

  const topPick = getRecommendation();

  const sortedMeds = [...medications].sort((a,b) => {
    const pa = parseFloat(a.selfPay.price.replace(/[^0-9.]/g,''));
    const pb = parseFloat(b.selfPay.price.replace(/[^0-9.]/g,''));
    return pa - pb;
  });

  const filteredStates = stateSearch.trim()
    ? allStateCodes.filter(c => c.toLowerCase().includes(stateSearch.toLowerCase()) || stateData[c].name.toLowerCase().includes(stateSearch.toLowerCase()))
    : allStateCodes;

  useEffect(() => {
    const h = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setShowDD(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (ready && resultsRef.current) setTimeout(() => resultsRef.current.scrollIntoView({behavior:"smooth",block:"start"}), 150);
  }, [ready, selectedState, insurance, condition]);

  const selectState = (c) => { setSelectedState(c); setStateSearch(stateData[c].name); setShowDD(false); };

  const startOver = () => {
    setInsurance(null); setCondition(null); setSelectedState(null);
    setExpandedDrug(null); setShowMore(false); setStateSearch(""); setShowDD(false);
  };

  const getRetailSavings = () => {
    const retail = {Ozempic:968,Wegovy:1350,"Wegovy Pill":1349,Mounjaro:1070,Zepbound:1086,Foundayo:900};
    const selfPayNum = parseFloat(topPick.selfPay.price.replace(/[^0-9.]/g,''));
    const retailNum = retail[topPick.name] || 1000;
    const monthlySavings = retailNum - selfPayNum;
    const yearlySavings = monthlySavings * 12;
    return "$" + yearlySavings.toLocaleString() + "/yr";
  };

  const getRecLabel = () => {
    if (!condition || condition === "skip") return "Lowest starting price";
    const labels = {diabetes:"Lowest guaranteed price for diabetes",weightloss:"Lowest guaranteed price for weight loss",heart:"Lowest guaranteed price for heart health",sleep:"Lowest guaranteed price for sleep apnea"};
    return labels[condition] || "Your cheapest option";
  };

  const getRecDescription = () => {
    const base = topPick.selfPay.price + " through " + topPick.selfPay.where;
    if (condition === "skip" || !condition) return "At " + base + ", this is the lowest-cost GLP-1 available.";
    if (condition === "diabetes" && topPick.name === "Ozempic") return "FDA-approved for Type 2 diabetes with 82% commercial insurance coverage. " + base + ".";
    if (condition === "weightloss" && topPick.type === "pill") return "A daily pill (no injections) at " + base + ". The most affordable weight-loss GLP-1.";
    if (condition === "heart") return "FDA-approved for cardiovascular risk reduction. " + base + ".";
    if (condition === "sleep") return "FDA-approved for sleep apnea. " + base + ".";
    return "At " + base + ", this is the best-priced option for your condition.";
  };

  const getNextSteps = () => {
    if (!insurance) return [];
    const steps = [];
    steps.push({n:"1",t:"Talk to your doctor",d:"Tell them you're interested in a GLP-1. They'll evaluate whether it's right for you and write a prescription.",link:null});

    if (isUninsured) {
      steps.push({n:"2",t:"Choose your medication and pharmacy",d:"Compare self-pay prices below. LillyDirect, TrumpRx, and telehealth providers are usually the best value.",link:null});
      steps.push({n:"3",t:"Check if you qualify for free medication",d:"If your income is under ~$31,200/yr and you have a diabetes prescription, Novo Nordisk's Patient Assistance Program provides free Ozempic.",link:{label:"Check eligibility",url:"https://www.novocare.com/pap.html"}});
    } else if (isGovIns) {
      steps.push({n:"2",t:"Your doctor submits for coverage",d:"They'll handle the paperwork (called prior authorization). This takes 1-3 weeks. You'll hear back through your doctor's office.",link:null});
      steps.push({n:"3",t:"Check your plan's preferred drug list",d:"Government plans (Medicare and Medicaid) have specific drugs they prefer. Your doctor can check which GLP-1s are on your plan's list.",link:insurance==="medicare"?{label:"Medicare.gov drug search",url:"https://www.medicare.gov/plan-compare"}:null});
      steps.push({n:"4",t:"If denied, have your doctor appeal",d:"Appeals succeed 44-80% of the time. Your doctor resubmits with additional documentation. This is free.",link:null});
      steps.push({n:"5",t:"If the appeal fails, go self-pay",d:"You still have your prescription. Use the self-pay prices below. Note: manufacturer savings cards are not available for government insurance, but self-pay prices start at $149/mo.",link:null});
    } else {
      steps.push({n:"2",t:"Your doctor submits for insurance coverage",d:"They'll handle the paperwork (called prior authorization). This takes 1-3 weeks. You'll hear back through your doctor's office.",link:null});
      steps.push({n:"3",t:"If approved, get the manufacturer savings card",d:"Novo Nordisk and Eli Lilly both offer cards that drop your copay to about $25/mo. Links are in each medication's details below.",link:null});
      steps.push({n:"4",t:"If denied, have your doctor appeal",d:"Appeals succeed 44-80% of the time. Your doctor resubmits with additional documentation. This is free.",link:null});
      steps.push({n:"5",t:"If the appeal fails, go self-pay",d:"You still have your prescription. Use the self-pay prices below. Most people find an option under $350/mo.",link:null});
    }
    return steps;
  };

  const tc = (type) => type === "pill" ? {bg:"#ede9fe",fg:"#7c3aed"} : {bg:"#dbeafe",fg:"#2563eb"};

  const insComplete = !!insurance;
  const condComplete = !!condition;

  return (
    <div style={{minHeight:"100vh",background:"#f8fafc"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",color:"#fff"}}>
        <div style={{maxWidth:720,margin:"0 auto",padding:"40px 24px 44px",textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:"#60a5fa",marginBottom:12}}>GLP-1 Cost Finder</div>
          <h1 style={{fontSize:34,fontWeight:900,margin:"0 0 12px",lineHeight:1.15,letterSpacing:"-0.02em"}}>Find the Cheapest Way<br/>to Get Your GLP-1</h1>
          <p style={{fontSize:16,color:"#94a3b8",maxWidth:480,margin:"0 auto",lineHeight:1.65}}>Real prices for diabetes, weight loss, heart health, and sleep apnea. No jargon. No guesswork.</p>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"8px 24px"}}>
        <div style={{maxWidth:720,margin:"0 auto",display:"flex",justifyContent:"center",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:4}}>&#9679; Prices verified May 2026</span>
          <span style={{fontSize:11,color:"#cbd5e1"}}>|</span>
          <span style={{fontSize:11,color:"#64748b"}}>Sources: FDA, CMS, GoodRx, LillyDirect, NovoCare, TrumpRx.gov</span>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"0 24px 60px"}}>
        <div style={{marginTop:-24}}>

          {/* Q1: INSURANCE */}
          <div style={{background:"#fff",borderRadius:16,padding:"24px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:insComplete?"#10b981":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:insComplete?"#fff":"#64748b"}}>{insComplete?"\u2713":"1"}</div>
              <span style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>What's your insurance situation?</span>
            </div>
            <div className="intake-grid" style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:8}}>
              {insuranceOptions.map(opt=>(
                <button key={opt.value} onClick={()=>{setInsurance(opt.value);setSelectedState(null);setStateSearch("");}}
                  style={{padding:"16px 14px",borderRadius:12,border:insurance===opt.value?"2px solid #3b82f6":"1px solid #e2e8f0",background:insurance===opt.value?"#eff6ff":"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:20}}>{opt.icon}</span>
                    <span style={{fontSize:14,fontWeight:700,color:insurance===opt.value?"#1d4ed8":"#1e293b"}}>{opt.label}</span>
                  </div>
                  <div style={{fontSize:11,color:"#64748b",paddingLeft:28}}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Q2: CONDITION */}
          {insurance && (
            <div className="fade-up" style={{background:"#fff",borderRadius:16,padding:"24px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:condComplete?"#10b981":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:condComplete?"#fff":"#64748b"}}>{condComplete?"\u2713":"2"}</div>
                <span style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>What are you looking to treat?</span>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:14,paddingLeft:38}}>This helps us show medications most likely to be covered. We don't store this information.</div>
              <div className="intake-grid" style={{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:8}}>
                {conditionOptions.map(opt=>(
                  <button key={opt.value} onClick={()=>setCondition(opt.value)}
                    style={{padding:"14px 14px",borderRadius:12,border:condition===opt.value?"2px solid #3b82f6":"1px solid #e2e8f0",background:condition===opt.value?"#eff6ff":"#fff",cursor:"pointer",textAlign:"left",transition:"all .15s",gridColumn:opt.value==="skip"?"1 / -1":"auto"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontSize:18}}>{opt.icon}</span>
                      <span style={{fontSize:14,fontWeight:700,color:condition===opt.value?"#1d4ed8":"#1e293b"}}>{opt.label}</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748b",paddingLeft:26}}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Q3: STATE - only for Medicaid */}
          {insurance === "medicaid" && condition && (
            <div className="fade-up" style={{background:"#fff",borderRadius:16,padding:"24px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 4px 12px rgba(0,0,0,.04)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:selectedState?"#10b981":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:selectedState?"#fff":"#64748b"}}>{selectedState?"\u2713":"3"}</div>
                <span style={{fontSize:15,fontWeight:700,color:"#1e293b"}}>What state are you in?</span>
                <span style={{fontSize:11,color:"#94a3b8"}}>(Medicaid coverage varies by state)</span>
              </div>
              <div ref={ddRef} style={{position:"relative"}}>
                <input type="text" placeholder="Type your state..." value={stateSearch}
                  onChange={e=>{setStateSearch(e.target.value);setShowDD(true);if(selectedState)setSelectedState(null);}}
                  onFocus={()=>setShowDD(true)}
                  style={{width:"100%",padding:"12px 16px",borderRadius:10,border:selectedState?"2px solid #10b981":"1px solid #e2e8f0",background:selectedState?"#f0fdf4":"#fff",color:"#1e293b",fontSize:15,fontWeight:selectedState?600:400}}/>
                {showDD && filteredStates.length > 0 && (
                  <div style={{position:"absolute",top:"100%",left:0,right:0,maxHeight:220,overflowY:"auto",background:"#fff",border:"1px solid #e2e8f0",borderRadius:"0 0 10px 10px",zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
                    {filteredStates.map(code => (
                      <button key={code} onClick={()=>selectState(code)}
                        style={{width:"100%",padding:"10px 16px",background:"transparent",border:"none",borderBottom:"1px solid #f1f5f9",color:"#1e293b",fontSize:14,cursor:"pointer",textAlign:"left"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <strong style={{color:"#10b981",marginRight:8}}>{code}</strong>{stateData[code].name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedState && state && (
                <div style={{marginTop:12,padding:"12px 14px",background:state.medicaid.wl==="Yes"?"#f0fdf4":state.medicaid.wl==="Limited"?"#fefce8":"#fef2f2",borderRadius:10,border:state.medicaid.wl==="Yes"?"1px solid #bbf7d0":state.medicaid.wl==="Limited"?"1px solid #fde68a":"1px solid #fecaca"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{state.name} Medicaid</span>
                    <div style={{display:"flex",gap:4}}>
                      <span style={{padding:"2px 8px",borderRadius:8,fontSize:10,fontWeight:700,background:state.medicaid.wl==="Yes"?"#d1fae5":state.medicaid.wl==="Limited"?"#fef3c7":"#ffe4e6",color:state.medicaid.wl==="Yes"?"#059669":state.medicaid.wl==="Limited"?"#d97706":"#e11d48"}}>Weight loss: {state.medicaid.wl==="Yes"?"Covered":state.medicaid.wl==="Limited"?"Limited":"Not covered"}</span>
                      <span style={{padding:"2px 8px",borderRadius:8,fontSize:10,fontWeight:700,background:"#d1fae5",color:"#059669"}}>Diabetes: Covered</span>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#475569",lineHeight:1.5}}>{state.medicaid.detail}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========= RESULTS ========= */}
        {ready && (
          <div ref={resultsRef} className="fade-up" style={{marginTop:8}}>

            {/* FTC AFFILIATE DISCLOSURE */}
            <AffiliateBanner style={{marginBottom:14}} />

            {/* RECOMMENDATION */}
            <div style={{background:"linear-gradient(135deg, #1e3a5f, #1e40af)",borderRadius:20,padding:"32px 28px",marginBottom:16,color:"#fff",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(96,165,250,.1)"}}/>
              <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(139,92,246,.08)"}}/>
              <div style={{position:"relative",zIndex:1}}>
                <div style={{display:"inline-block",padding:"4px 12px",borderRadius:20,background:"rgba(250,204,21,.15)",color:"#fde047",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>{getRecLabel()}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:200}}>
                    <h2 style={{fontSize:28,fontWeight:900,margin:"0 0 4px"}}>{topPick.name}</h2>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:12}}>
                      <span style={{padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,background:topPick.type==="pill"?"rgba(167,139,250,.2)":"rgba(96,165,250,.2)",color:topPick.type==="pill"?"#c4b5fd":"#93c5fd"}}>{topPick.typeLabel}</span>
                      <span style={{fontSize:12,color:"#94a3b8"}}>{topPick.maker}</span>
                    </div>
                    <p style={{fontSize:14,color:"#cbd5e1",lineHeight:1.6,margin:0}}>{getRecDescription()}</p>
                    {!isUninsured && (
                      <div style={{marginTop:10,padding:"8px 14px",borderRadius:8,background:"rgba(250,204,21,.12)",border:"1px solid rgba(250,204,21,.25)"}}>
                        <span style={{fontSize:13,fontWeight:700,color:"#fde047"}}>*</span>
                        <span style={{fontSize:13,fontWeight:600,color:"#fde047"}}>
                          {isPrivate
                            ? " If your insurance covers it, you could pay as little as " + topPick.withInsurance.price + " with a savings card."
                            : " If your plan covers it, your out-of-pocket cost may be significantly lower."}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{textAlign:"center",background:"rgba(255,255,255,.08)",borderRadius:16,padding:"20px 28px",backdropFilter:"blur(8px)"}}>
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:4}}>Self-pay price</div>
                    <div style={{fontSize:36,fontWeight:900,color:"#fbbf24",lineHeight:1}}>{topPick.selfPay.price}{!isUninsured && "*"}</div>
                    <div style={{fontSize:11,color:"#93c5fd",marginTop:6,maxWidth:160}}>{topPick.selfPay.where}</div>
                    <div style={{marginTop:8,padding:"4px 10px",borderRadius:6,background:"rgba(16,185,129,.15)",border:"1px solid rgba(16,185,129,.25)"}}>
                      <span style={{fontSize:11,fontWeight:700,color:"#34d399"}}>Save {getRetailSavings()} vs retail</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ====== RESULTS (no longer gated; visible immediately) ====== */}
            <div className="fade-up">

                {/* PROVIDER LEGITIMACY BANNER — sits above the results so
                    it's the first safety-relevant thing a visitor sees once
                    they've picked their selections. */}
                <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <div style={{minWidth:0,flex:"1 1 280px"}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#78350f",marginBottom:2}}>Not sure about a provider?</div>
                    <div style={{fontSize:12,color:"#92400e",lineHeight:1.5}}>Check our legitimacy guide before you buy &mdash; 6-step checklist plus the verified-provider snapshot for every brand below.</div>
                  </div>
                  <Link to="/provider-check" style={{flexShrink:0,padding:"8px 14px",borderRadius:8,background:"#b45309",color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>Provider check &rarr;</Link>
                </div>

                {/* MEDICARE BRIDGE BANNER — surfaces the $50/mo program for
                    Medicare-enrolled visitors and the eligibility checker for
                    everyone else evaluating their options. */}
                {insurance === "medicare" && (
                  <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #93c5fd",borderRadius:14,padding:"16px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{minWidth:0,flex:"1 1 300px"}}>
                      <div style={{fontSize:14,fontWeight:800,color:"#1e3a5f",marginBottom:3}}>On Medicare? You may qualify for $50/month GLP-1 medications starting July 2026.</div>
                      <div style={{fontSize:12,color:"#475569",lineHeight:1.55}}>The Medicare GLP-1 Bridge covers Wegovy, Zepbound (KwikPen), and Foundayo at a flat $50 copay for qualifying beneficiaries.</div>
                    </div>
                    <Link to="/medicare-glp1-eligibility" style={{flexShrink:0,padding:"10px 18px",borderRadius:8,background:"#1d4ed8",color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>Check eligibility &rarr;</Link>
                  </div>
                )}

                {/* HERE'S WHAT TO DO */}
                <div style={{background:"#fff",borderRadius:16,padding:"24px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                  <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 16px",color:"#1e293b"}}>Here's What to Do</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    {getNextSteps().map((s,i)=>(
                      <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#3b82f6",flexShrink:0}}>{s.n}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:"#1e293b",marginBottom:2}}>{s.t}</div>
                          <div style={{fontSize:13,color:"#64748b",lineHeight:1.55}}>{s.d}</div>
                          {s.link && (
                            <a href={s.link.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:6,padding:"5px 14px",borderRadius:6,background:"#eff6ff",color:"#1d4ed8",fontSize:12,fontWeight:600,textDecoration:"none",border:"1px solid #bfdbfe"}}>{s.link.label} &rarr;</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TELEHEALTH */}
                <div style={{background:"linear-gradient(135deg, #ecfdf5, #f0fdf4)",borderRadius:16,padding:"24px",marginBottom:16,border:"1px solid #a7f3d0"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                    <div style={{minWidth:0}}>
                      <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 4px",color:"#059669"}}>
                        {isUninsured ? "Get Prescribed Online" : "Skip the Insurance Hassle"}
                      </h3>
                      <p style={{fontSize:12,color:"#64748b",margin:"0 0 14px"}}>
                        {isUninsured
                          ? "These telehealth providers prescribe and deliver GLP-1s within days. No insurance needed."
                          : "Don't want to wait for insurance approval? These providers prescribe and deliver GLP-1s within days."}
                      </p>
                    </div>
                    <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#475569",whiteSpace:"nowrap"}}>
                      <span style={{fontWeight:600}}>Sort:</span>
                      <select
                        value={providerSort}
                        onChange={(e) => setProviderSort(e.target.value)}
                        style={{padding:"5px 8px",borderRadius:6,border:"1px solid #cbd5e1",background:"#fff",fontSize:11,color:"#1e293b",cursor:"pointer"}}
                      >
                        <option value="totalLow">Total monthly cost (lowest first)</option>
                        <option value="default">Default order</option>
                      </select>
                    </label>
                  </div>

                  <div style={{display:"grid",gap:8}}>
                    {([...telehealthOptions]
                      .sort((a, b) => {
                        if (providerSort === "totalLow") {
                          // Nulls sort to the bottom so undisclosed pricing
                          // doesn't sneak above a verified low price.
                          const aPrice = a.totalMonthlyMin ?? Infinity;
                          const bPrice = b.totalMonthlyMin ?? Infinity;
                          return aPrice - bPrice;
                        }
                        return 0;
                      })
                    ).map((opt, i) => (
                      <ProviderCard
                        key={opt.name}
                        opt={opt}
                        selectedState={selectedState}
                        insurance={insurance}
                        condition={condition}
                      />
                    ))}
                  </div>
                </div>

                {/* COVERAGE TABLE */}
                <div style={{background:"#fff",borderRadius:16,padding:"24px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                  <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 4px",color:"#1e293b"}}>The Truth About Coverage</h3>
                  <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 16px"}}>Approval rates vary dramatically by condition. Here's the reality.</p>

                  {/* Desktop table */}
                  <div className="coverage-grid" style={{borderRadius:12,overflow:"hidden",border:"1px solid #e2e8f0"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr 1fr",background:"#f8fafc",padding:"10px 14px",gap:4,borderBottom:"2px solid #e2e8f0"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>Condition</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,textAlign:"center"}}>Private</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,textAlign:"center"}}>ACA</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,textAlign:"center"}}>Medicare</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5,textAlign:"center"}}>Medicaid</div>
                    </div>
                    {coverageTruth.map((row,i) => (
                      <div key={i} style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr 1fr",padding:"10px 14px",gap:4,borderBottom:i<coverageTruth.length-1?"1px solid #f1f5f9":"none",background:i%2===0?"#fff":"#fafafa"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:row.color,flexShrink:0}}/>
                          <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{row.condition}</span>
                        </div>
                        <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#475569"}}>{row.commercial}</div>
                        <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#475569"}}>{row.aca}</div>
                        <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#475569"}}>{row.medicare}</div>
                        <div style={{textAlign:"center",fontSize:12,fontWeight:600,color:"#475569"}}>{row.medicaid}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile cards */}
                  <div className="coverage-cards" style={{display:"none",flexDirection:"column",gap:10}}>
                    {coverageTruth.map((row,i) => (
                      <div key={i} style={{borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
                        <div style={{padding:"10px 14px",background:row.bg,display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:"50%",background:row.color}}/>
                          <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{row.condition}</span>
                        </div>
                        <div style={{padding:"10px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          <div><span style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase"}}>Private</span><div style={{fontSize:13,fontWeight:600,color:"#475569"}}>{row.commercial}</div></div>
                          <div><span style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase"}}>ACA</span><div style={{fontSize:13,fontWeight:600,color:"#475569"}}>{row.aca}</div></div>
                          <div><span style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase"}}>Medicare</span><div style={{fontSize:13,fontWeight:600,color:"#475569"}}>{row.medicare}</div></div>
                          <div><span style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase"}}>Medicaid</span><div style={{fontSize:13,fontWeight:600,color:"#475569"}}>{row.medicaid}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginTop:10,fontSize:11,color:"#94a3b8"}}>
                    *Medicare GLP-1 Bridge covers Wegovy and Zepbound at $50/mo from July-Dec 2026. All percentages indicate plans that include at least one GLP-1 on their approved drug list. Prior authorization required in nearly all cases. Sources: KFF, CMS, AMA, GoodRx/MMIT.
                  </div>

                  <div style={{marginTop:12,padding:"12px 16px",background:"#fef3c7",borderRadius:10,border:"1px solid #fde68a"}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#92400e",marginBottom:2}}>What this means for you</div>
                    <div style={{fontSize:12,color:"#78350f",lineHeight:1.55}}>
                      {isUninsured
                        ? "Without insurance, self-pay is your path. The good news: prices start at just $149/mo, and there are more affordable options than ever."
                        : isGovIns
                          ? "Government insurance coverage for GLP-1s varies widely. If your plan doesn't cover it, self-pay prices start at $149/mo. Note: manufacturer savings cards are not available for Medicare or Medicaid."
                          : "Even with insurance, 48% of GLP-1 prescriptions are denied on the first try. If that happens, appeals work 44-80% of the time. Either way, self-pay options start at $149/mo."}
                    </div>
                  </div>
                </div>

                {/* WHAT IS A GLP-1? */}
                <div style={{background:"linear-gradient(135deg, #eff6ff, #f0f9ff)",borderRadius:16,padding:"24px",marginBottom:16,border:"1px solid #bfdbfe"}}>
                  <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 12px",color:"#1e3a5f"}}>What Is a GLP-1?</h3>
                  <div style={{display:"grid",gap:12}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>How they work</div>
                      <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>GLP-1 medications mimic a natural hormone that regulates appetite and blood sugar. They slow digestion, reduce hunger, and help your body process insulin more effectively. There are two types:</div>
                      <div style={{marginTop:8,display:"grid",gap:6}}>
                        <div style={{padding:"10px 14px",background:"rgba(255,255,255,.7)",borderRadius:8,border:"1px solid #dbeafe"}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#1d4ed8"}}>Semaglutide (Novo Nordisk)</span>
                          <span style={{fontSize:12,color:"#475569"}}> - Ozempic, Wegovy, Wegovy Pill. Targets GLP-1 hormone. Average 15% body weight loss in clinical trials.</span>
                        </div>
                        <div style={{padding:"10px 14px",background:"rgba(255,255,255,.7)",borderRadius:8,border:"1px solid #dbeafe"}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#1d4ed8"}}>Tirzepatide (Eli Lilly)</span>
                          <span style={{fontSize:12,color:"#475569"}}> - Mounjaro, Zepbound, Foundayo. Targets two hormones (GIP + GLP-1). Up to 21% body weight loss in clinical trials (Foundayo: 12.4% at highest dose).</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>What to expect</div>
                      <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>Most people start seeing noticeable results by month 2-3. Common side effects include nausea (usually mild, goes away as your body adjusts) and reduced appetite. You start at a low dose and gradually increase over several months.</div>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b",marginBottom:3}}>Injection vs. pill</div>
                      <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>Injections are once weekly with a tiny pre-filled pen (most people say it's painless). Pills are daily. The Wegovy Pill must be taken on an empty stomach, but Foundayo (Eli Lilly) can be taken any time with or without food. Injectable forms currently show slightly greater weight loss in trials.</div>
                    </div>
                  </div>
                </div>

                {/* ALL MEDICATIONS */}
                <div style={{marginBottom:16}}>
                  <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 4px",color:"#1e293b"}}>All GLP-1 Medications Compared</h3>
                  <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 12px"}}>Sorted by self-pay price, cheapest first. Tap any card for full details.</p>
                  <div style={{display:"grid",gap:8}}>
                    {sortedMeds.map((drug,i) => {
                      const isOpen = expandedDrug === drug.name;
                      const isRec = drug.name === topPick.name;
                      const tcc = tc(drug.type);
                      return (
                        <div key={drug.name} style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:isOpen?"0 4px 16px rgba(0,0,0,.08)":"0 1px 3px rgba(0,0,0,.04)",border:isRec&&!isOpen?"2px solid #3b82f6":"1px solid #e2e8f0",transition:"box-shadow .2s"}}>
                          <button onClick={()=>setExpandedDrug(isOpen?null:drug.name)}
                            style={{width:"100%",padding:"16px 20px",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                {!isUninsured && isRec && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#dbeafe",color:"#1d4ed8",textTransform:"uppercase",letterSpacing:.5}}>Recommended</span>}
                                {isUninsured && isRec && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#d1fae5",color:"#065f46",textTransform:"uppercase",letterSpacing:.5}}>Best Price</span>}
                                {condition && condition !== "skip" && drug.conditions.includes(condition) && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#fef3c7",color:"#92400e",textTransform:"uppercase",letterSpacing:.5}}>FDA-approved for your condition</span>}
                                <span style={{fontSize:17,fontWeight:800,color:"#1e293b"}}>{drug.name}</span>
                                <span style={{padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,background:tcc.bg,color:tcc.fg}}>{drug.typeLabel}</span>
                              </div>
                              <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{drug.maker} - {drug.typeLabel}</div>
                            </div>
                            <div style={{textAlign:"right",flexShrink:0}}>
                              <div style={{fontSize:22,fontWeight:900,color:isRec?"#1d4ed8":"#1e293b"}}>{drug.selfPay.price}</div>
                              {isPrivate && (
                                <div style={{fontSize:11,color:"#10b981",fontWeight:600}}>{drug.withInsurance.price} w/ savings card</div>
                              )}
                            </div>
                            <div style={{color:"#94a3b8",fontSize:12,flexShrink:0,marginLeft:4}}>{isOpen?"\u25B2":"\u25BC"}</div>
                          </button>

                          {isOpen && (
                            <div style={{padding:"0 20px 20px"}}>
                              <div style={{background:"#f0fdf4",borderRadius:10,padding:"12px 14px",marginBottom:12,borderLeft:"3px solid #10b981"}}>
                                <div style={{fontSize:11,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>Self-pay pricing</div>
                                <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{drug.selfPay.note}</div>
                                {drug.selfPay.links && (
                                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                                    {drug.selfPay.links.map((l,li)=>(
                                      <a key={li} href={l.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"6px 14px",borderRadius:6,background:"#059669",color:"#fff",fontSize:12,fontWeight:700,textDecoration:"none"}}>Get price at {l.label} &rarr;</a>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {isPrivate && (
                                <div style={{background:"#eff6ff",borderRadius:10,padding:"12px 14px",marginBottom:12,borderLeft:"3px solid #3b82f6"}}>
                                  <div style={{fontSize:11,fontWeight:700,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>If your insurance covers it</div>
                                  <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>{drug.withInsurance.note}</div>
                                </div>
                              )}

                              {isGovIns && (
                                <div style={{background:"#fef3c7",borderRadius:10,padding:"12px 14px",marginBottom:12,borderLeft:"3px solid #f59e0b"}}>
                                  <div style={{fontSize:11,fontWeight:700,color:"#92400e",textTransform:"uppercase",letterSpacing:.5,marginBottom:3}}>{insurance === "medicare" ? "Medicare" : "Medicaid"} coverage</div>
                                  <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}>
                                    {insurance === "medicare"
                                      ? "Medicare Part D may cover this medication depending on your plan and diagnosis. Manufacturer savings cards are NOT available for Medicare. The Medicare GLP-1 Bridge program (July-Dec 2026) will cover Wegovy and Zepbound at $50/mo."
                                      : "Medicaid coverage varies by state and diagnosis. Manufacturer savings cards are NOT available for Medicaid. Check with your state program for specific coverage details."}
                                  </div>
                                </div>
                              )}

                              <div style={{marginBottom:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10}}>
                                <span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>Insurance most likely to cover for: </span>
                                <span style={{fontSize:12,color:"#475569"}}>{drug.coveredFor}</span>
                              </div>

                              <div style={{marginBottom:12}}>
                                <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>About</div>
                                <div style={{fontSize:13,color:"#475569",lineHeight:1.6}}><strong style={{color:"#1e293b"}}>{drug.maker}</strong> - {drug.indicationDetail}</div>
                                <div style={{fontSize:12,color:"#94a3b8",marginTop:3}}>{drug.howItWorks}</div>
                              </div>

                              <div style={{marginBottom:12}}>
                                <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Price by dose</div>
                                {drug.doses.map((d,di) => (
                                  <div key={di} style={{marginBottom:di<drug.doses.length-1?8:0}}>
                                    <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginBottom:4}}>{d.phase} <span style={{fontWeight:400,color:"#94a3b8"}}>({d.dose})</span></div>
                                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                                      {d.prices.map((p,pi) => (
                                        <span key={pi} style={{padding:"4px 10px",borderRadius:6,fontSize:11,background:p.hl?"#eff6ff":"#f8fafc",border:p.hl?"1px solid #bfdbfe":"1px solid #f1f5f9",color:p.s.includes("Retail")?"#94a3b8":p.hl?"#1d4ed8":"#475569",fontWeight:p.hl?600:400,textDecoration:p.s.includes("Retail")?"line-through":"none"}}>
                                          {p.s}: {p.p}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                                <div style={{background:isPrivate?"#faf5ff":"#f8fafc",borderRadius:10,padding:14,border:isPrivate?"1px solid #e9d5ff":"1px solid #e2e8f0"}}>
                                  <div style={{fontSize:10,fontWeight:700,color:isPrivate?"#7c3aed":"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Savings Card</div>
                                  {isPrivate ? (
                                    <>
                                      <div style={{fontSize:13,fontWeight:700,color:"#6d28d9"}}>{drug.savingsCard.copay}</div>
                                      <div style={{fontSize:11,color:"#6b7280",marginTop:2,lineHeight:1.4}}>{drug.savingsCard.detail}</div>
                                      {drug.savingsCard.url && (
                                        <a href={drug.savingsCard.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:11,color:"#7c3aed",marginTop:4,textDecoration:"none",fontWeight:600,padding:"4px 10px",borderRadius:4,background:"#ede9fe"}}>Get card &rarr;</a>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <div style={{fontSize:12,fontWeight:600,color:"#94a3b8"}}>Not eligible</div>
                                      <div style={{fontSize:11,color:"#94a3b8",marginTop:2,lineHeight:1.4}}>
                                        {isUninsured
                                          ? "Savings cards require commercial (private) insurance. They are not available for self-pay patients."
                                          : "Savings cards are not available for " + (insurance==="medicare"?"Medicare":"Medicaid") + " beneficiaries. This is a federal restriction."}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div style={{background:drug.pap.available?"#f0fdf4":"#fef2f2",borderRadius:10,padding:14,border:drug.pap.available?"1px solid #bbf7d0":"1px solid #fecaca"}}>
                                  <div style={{fontSize:10,fontWeight:700,color:drug.pap.available?"#059669":"#dc2626",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Patient Assistance</div>
                                  {drug.pap.available ? (
                                    <>
                                      <div style={{fontSize:13,fontWeight:700,color:"#059669"}}>FREE</div>
                                      <div style={{fontSize:11,color:"#6b7280",marginTop:2,lineHeight:1.4}}>{drug.pap.detail}</div>
                                      {drug.pap.url && (
                                        <a href={drug.pap.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",fontSize:11,color:"#059669",marginTop:4,textDecoration:"none",fontWeight:600,padding:"4px 10px",borderRadius:4,background:"#d1fae5"}}>Check eligibility &rarr;</a>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <div style={{fontSize:12,fontWeight:600,color:"#dc2626"}}>Not available</div>
                                      <div style={{fontSize:11,color:"#6b7280",marginTop:2,lineHeight:1.4}}>{drug.pap.detail}</div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SHOW MORE */}
                {!showMore && (
                  <div style={{textAlign:"center",marginBottom:16}}>
                    <button onClick={()=>setShowMore(true)} style={{padding:"10px 28px",borderRadius:10,border:"1px solid #e2e8f0",background:"#fff",color:"#3b82f6",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>More resources &#9660;</button>
                  </div>
                )}

                {showMore && (
                  <div className="fade-up">
                    <div style={{background:"#fff",borderRadius:14,padding:"20px 24px",marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
                      <h4 style={{fontSize:15,fontWeight:700,margin:"0 0 12px",color:"#1e293b"}}>Coming Soon</h4>
                      <div style={{display:"grid",gap:8}}>
                        <div style={{padding:"10px 14px",background:"#ede9fe",borderRadius:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontWeight:700,color:"#1e293b",fontSize:13}}>Medicare GLP-1 Bridge</span>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:"#8b5cf6",color:"#fff",fontWeight:600}}>July 2026</span>
                          </div>
                          <div style={{fontSize:12,color:"#475569",marginTop:3}}>Covers Wegovy and Zepbound at $50/mo for Medicare beneficiaries.</div>
                        </div>
                        <div style={{padding:"10px 14px",background:"#fef3c7",borderRadius:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontWeight:700,color:"#1e293b",fontSize:13}}>CMS BALANCE Model</span>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:"#f59e0b",color:"#fff",fontWeight:600}}>May 2026</span>
                          </div>
                          <div style={{fontSize:12,color:"#475569",marginTop:3}}>Could expand Medicaid GLP-1 coverage. Medicare Part D expansion Jan 2027.</div>
                        </div>
                        <div style={{padding:"10px 14px",background:"#d1fae5",borderRadius:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontWeight:700,color:"#1e293b",fontSize:13}}>Canadian Generic Semaglutide</span>
                            <span style={{fontSize:10,padding:"2px 8px",borderRadius:6,background:"#10b981",color:"#fff",fontWeight:600}}>Mid-2026</span>
                          </div>
                          <div style={{fontSize:12,color:"#475569",marginTop:3}}>Six generics approved in Canada. Expected ~$75-95/mo. Not yet available in US.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRICE-DROP ALERTS (downstream, non-blocking) */}
                <EmailCapture
                  variant="banner"
                  selectedState={selectedState}
                  insurance={insurance}
                  condition={condition}
                  headline="Get notified when prices drop"
                  description="We check GLP-1 prices monthly. Enter your email to get alerts when any provider lowers their price."
                  buttonLabel="Subscribe"
                />

                {/* DISCLAIMER */}
                <div style={{background:"#f8fafc",borderRadius:10,padding:16,marginBottom:16}}>
                  <p style={{fontSize:11,color:"#94a3b8",lineHeight:1.7,margin:0}}>
                    <strong style={{color:"#64748b"}}>Medical disclaimer:</strong> This site provides cost comparison information only and is not medical advice. The condition you selected is used only to show relevant pricing and coverage information. Consult your healthcare provider before starting or changing medication. Prices are estimates and may vary. Data last verified May 2026. Some links are affiliate links.
                  </p>
                </div>

                <div style={{textAlign:"center"}}>
                  <button onClick={startOver} style={{padding:"10px 24px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>&larr; Start Over</button>
                </div>
              </div>
          </div>
        )}

        {/* ABOUT — static, always visible, no interaction required.
            Lives outside the {ready && ...} block so it's in the SSR
            output regardless of whether the visitor has picked options.
            Adds context for first-time visitors and standing content
            for crawlers (the comparison results are conditionally
            rendered, so the SSR shell would otherwise look thin). */}
        <div style={{background:"#fff",borderRadius:16,padding:"28px 24px",marginTop:8,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #e2e8f0"}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#1e293b",margin:"0 0 12px",letterSpacing:"-0.01em"}}>What this tool does</h2>
          <p style={{fontSize:14,color:"#475569",lineHeight:1.65,margin:"0 0 14px"}}>
            GLP-1 medications — Ozempic, Wegovy, Mounjaro, Zepbound, Foundayo, and others — can cost anywhere from <strong>$79 to over $1,300 per month</strong> depending on how you get them. Insurance coverage varies dramatically by condition, plan type, and state. Self-pay prices differ across telehealth providers, compounding pharmacies, and manufacturer programs. The right path for you depends on a few specific questions that most price articles never ask.
          </p>
          <p style={{fontSize:14,color:"#475569",lineHeight:1.65,margin:"0 0 18px"}}>
            This tool surfaces the cheapest realistic path for your situation in under a minute.
          </p>

          <div style={{display:"grid",gap:14}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:3}}>How the comparison works</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Pick your insurance type and the condition you're treating. If you're on Medicaid, pick your state too — Medicaid coverage for GLP-1s varies enormously between states, from fully covered to entirely excluded. We then show the cheapest real-world path, naming the specific pharmacy, telehealth provider, or manufacturer program where you'd actually get that price.</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:3}}>What we cover</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>All major GLP-1s for diabetes, weight loss, heart health, and sleep apnea: Ozempic, Wegovy, Wegovy Pill, Mounjaro, Zepbound, Foundayo, Saxenda, and Trulicity. We also track the compounded semaglutide and tirzepatide sold through national telehealth providers, <a href="/articles/glp1-savings-cards-patient-assistance.html" style={{color:"#0369a1",textDecoration:"underline"}}>manufacturer savings cards and patient assistance programs</a> from Novo Nordisk and Eli Lilly, the LillyDirect and TrumpRx direct-to-consumer programs, the Medicare GLP-1 Bridge launching July 2026, and state-level Medicaid coverage.</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:3}}>Why the price spread is so wide</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Brand-name GLP-1s are still under patent protection in the US, which keeps retail prices above $1,000/mo for most. The cheaper paths exist because of specific regulatory carve-outs — the FDA shortage list (which made compounded semaglutide and tirzepatide legal under licensed compounding pharmacies), manufacturer-funded patient assistance programs, and copay cards tied to commercial insurance. Each carve-out has real tradeoffs in quality control, availability, and continuity, which we name explicitly in each comparison rather than skipping past.</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:3}}>What we don't do</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>We don't prescribe medications, sell them, or run a pharmacy. We're an independent comparison tool. Some telehealth provider links in the results are affiliate links — we earn a small commission if you sign up through one. Every affiliate link is disclosed inline, and rankings reflect real prices, not commission rates.</div>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:"#1e293b",marginBottom:3}}>What to expect</div>
              <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>Prices change. We re-verify monthly across all providers, manufacturer programs, and state Medicaid policies, and stamp the verification date on every result. Where we can't verify a number directly, we say so and link to the source. Where one option is clearly better than another for your specific situation, we say that — instead of treating every option as equally valid.</div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
