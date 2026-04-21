import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

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
    selfPay:{price:"$199/mo",where:"TrumpRx",note:"TrumpRx $199/mo at all dose levels. GoodRx $199 first 2 fills then $349. NovoCare self-pay $349/mo.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"NovoCare",url:"https://www.novocare.com/wegovy/savings-offer.html"}]},
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
    selfPay:{price:"$149/mo",where:"TrumpRx, NovoCare, or GoodRx",note:"Starting dose (1.5mg) $149/mo through 8/31/26. Maintenance (25mg) $299/mo. TrumpRx $149/mo at all doses.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"NovoCare",url:"https://www.novocare.com/wegovy/savings-offer.html"}]},
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
    selfPay:{price:"$350/mo",where:"TrumpRx",note:"TrumpRx $350/mo flat at all doses. LillyDirect no longer offers Mounjaro through their self-pay program. GoodRx is not competitive for Lilly drugs ($1,097).",links:[{label:"TrumpRx",url:"https://trumprx.gov"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/mo if covered (max $1,950/yr). Even if NOT covered, up to $499 off per fill (max $8,411/yr, 13 fills). Works either way with commercial insurance."},
    doses:[
      {phase:"Month 1-2",dose:"2.5-5mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 3-4",dose:"7.5-10mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 5+",dose:"12.5-15mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"TrumpRx",p:"$350",hl:true}]}
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
    selfPay:{price:"$149/mo",where:"LillyDirect, Amazon Pharmacy, or GoodRx",note:"Starting dose (0.8mg) $149/mo. Maintenance (9-17.2mg) $299/mo with 45-day refill, $349/mo standard. The most affordable GLP-1 available.",links:[{label:"LillyDirect",url:"https://www.lillydirect.com"},{label:"Amazon Pharmacy",url:"https://pharmacy.amazon.com"}]},
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
const telehealthOptions = [
  {name:"Hims",price:"$79-$199/mo",detail:"Oral kits from $79/mo. Branded injectables from $199/mo.",url:"https://www.forhims.com/weight-loss"},
  {name:"Ro",price:"$149-$449/mo",detail:"Semaglutide from $149 first month. Tirzepatide from $299.",url:"https://ro.co/weight-loss/"},
  {name:"Noom Med",price:"$149-$349/mo",detail:"GLP-1 from $149 first month, then $349/mo ongoing. Includes behavioral coaching.",url:"https://www.noom.com/med/"},
  {name:"LifeMD",price:"Varies",detail:"Now offering Foundayo. Full medical evaluation included.",url:"https://lifemd.com/"},
  {name:"Yucca Health",price:"$146-$275/mo",detail:"Compounded semaglutide+ from $175 first month. Tirzepatide from $258. No live visit required.",url:"https://track.revoffers.com/aff_c?offer_id=1460&aff_id=12255"},
  {name:"Sprout Health",price:"$199-$299/mo",detail:"Compounded semaglutide from $199 first month. Tirzepatide from $249. No hidden fees.",url:"https://track.revoffers.com/aff_c?offer_id=1286&aff_id=12255"},
  {name:"Strut Health",price:"From $99/mo",detail:"Oral semaglutide from $99/mo with auto-refill. Injectable options available.",url:"https://track.revoffers.com/aff_c?offer_id=384&aff_id=12255"}
];

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
function ContactPage() {
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
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [data]);
  return null;
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
      title="Cheapest GLP-1 Without Insurance: 2026 Price Guide"
      description="Compare GLP-1 costs without insurance. Find affordable semaglutide, tirzepatide & other options from $117-$499/month. Manufacturer discounts & savings programs inside."
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
        "price": "349",
        "description": "Monthly self-pay price with vials via Lilly Direct"
      }
    }
  ]
};

function OzempicVsMounjaroCost() {
  const s = legalStyles;
  const t = tableStyles;
  return (
    <SeoPageLayout
      title="Ozempic vs Mounjaro Cost: 2026 Price Comparison"
      description="Compare Ozempic vs Mounjaro costs for 2026. See self-pay pricing, insurance coverage, manufacturer programs & how to get the best price on each medication."
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
      title="Affordable GLP-1 Self-Pay Options: Complete 2026 Guide"
      description="Explore affordable GLP-1 self-pay options in 2026: from compounded semaglutide to brand-name vials. Find which option fits your budget & needs."
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

// ─── MAIN COMPONENT ───
function GLP1CostFinder() {
  const [insurance, setInsurance] = useState(null);
  const [condition, setCondition] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [expandedDrug, setExpandedDrug] = useState(null);
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

  const handleEmail = () => {
    if (!email || !email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    setEmailSubmitting(true);

    const baseUrl = "https://olsoncoaches.us16.list-manage.com/subscribe/post-json";
    // Parameter names match the field tags from Mailchimp's own embed code.
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

    const callbackName = "mc_callback_" + Date.now();
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      setEmailSubmitting(false);
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      const s = document.getElementById(callbackName);
      if (s) s.remove();
    };

    window[callbackName] = (data) => {
      if (data && data.result === "success") {
        setEmailSubmitted(true);
      } else if (data && data.msg && /already subscribed/i.test(data.msg)) {
        setAlreadySubscribed(true);
        setEmailSubmitted(true);
      } else {
        setEmailError("Subscription failed. Please try again.");
      }
      cleanup();
    };

    const script = document.createElement("script");
    script.id = callbackName;
    script.src = baseUrl + "?" + params.toString() + "&c=" + callbackName;
    script.onerror = () => {
      setEmailError("Something went wrong, please try again.");
      cleanup();
    };
    document.body.appendChild(script);

    setTimeout(() => {
      if (!settled) {
        setEmailError("Something went wrong, please try again.");
        cleanup();
      }
    }, 8000);
  };

  const startOver = () => {
    setInsurance(null); setCondition(null); setSelectedState(null);
    setEmail(""); setEmailSubmitted(false); setEmailError("");
    setEmailSubmitting(false); setAlreadySubscribed(false);
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
          <span style={{fontSize:11,fontWeight:600,color:"#10b981",display:"flex",alignItems:"center",gap:4}}>&#9679; Prices verified April 2026</span>
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

            {/* EMAIL SOFT GATE */}
            {!emailSubmitted ? (
              <div style={{background:"#fff",borderRadius:16,padding:"28px 24px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,.08)",textAlign:"center",border:"1px solid #e2e8f0"}}>
                <div style={{fontSize:18,fontWeight:800,color:"#1e293b",marginBottom:6}}>See where to get this price</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:16,maxWidth:400,margin:"0 auto 16px"}}>Enter your email to unlock pharmacy links, telehealth options, step-by-step instructions, and price drop alerts.</div>
                <div style={{display:"flex",gap:8,maxWidth:440,margin:"0 auto"}}>
                  <input type="email" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!emailSubmitting&&handleEmail()} disabled={emailSubmitting}
                    style={{flex:1,padding:"12px 16px",borderRadius:10,border:emailError?"2px solid #f43f5e":"1px solid #e2e8f0",background:"#fff",color:"#1e293b",fontSize:15}}/>
                  <button onClick={handleEmail} disabled={emailSubmitting} style={{padding:"12px 24px",borderRadius:10,border:"none",background:"#3b82f6",color:"#fff",fontSize:14,fontWeight:700,cursor:emailSubmitting?"wait":"pointer",whiteSpace:"nowrap",opacity:emailSubmitting?0.7:1}}>{emailSubmitting?"Sending\u2026":"Unlock"}</button>
                </div>
                {emailError && <div style={{color:"#f43f5e",fontSize:12,marginTop:6}}>{emailError}</div>}
                <div style={{fontSize:11,color:"#94a3b8",marginTop:10}}>No spam. Unsubscribe anytime. We never share your email.</div>

                {/* BLURRED PREVIEW */}
                <div style={{marginTop:20,position:"relative",overflow:"hidden",borderRadius:12,height:180}}>
                  <div style={{filter:"blur(6px)",opacity:.5,pointerEvents:"none",padding:16}}>
                    <div style={{background:"#f0fdf4",borderRadius:10,padding:14,marginBottom:8,textAlign:"left",borderLeft:"3px solid #10b981"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#059669"}}>Step-by-step instructions</div>
                      <div style={{fontSize:12,color:"#64748b"}}>Personalized next steps based on your insurance...</div>
                    </div>
                    <div style={{background:"#eff6ff",borderRadius:10,padding:14,marginBottom:8,textAlign:"left",borderLeft:"3px solid #3b82f6"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#1d4ed8"}}>Pharmacy links and pricing</div>
                      <div style={{fontSize:12,color:"#64748b"}}>Direct links to the lowest prices at each pharmacy...</div>
                    </div>
                    <div style={{background:"#ecfdf5",borderRadius:10,padding:14,textAlign:"left",borderLeft:"3px solid #10b981"}}>
                      <div style={{fontSize:13,fontWeight:700,color:"#059669"}}>Telehealth providers</div>
                      <div style={{fontSize:12,color:"#64748b"}}>Get prescribed and delivered within days...</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{background:"#f0fdf4",borderRadius:12,padding:"12px 16px",marginBottom:16,textAlign:"center",border:"1px solid #bbf7d0"}}>
                <span style={{fontSize:13,color:"#059669",fontWeight:600}}>
                  {alreadySubscribed
                    ? "\u2713 You're already subscribed \u2014 here's your full results."
                    : "\u2713 We'll send price alerts to " + email}
                </span>
              </div>
            )}

            {/* ====== GATED CONTENT ====== */}
            {emailSubmitted && (
              <div className="fade-up">

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
                  <h3 style={{fontSize:17,fontWeight:800,margin:"0 0 4px",color:"#059669"}}>
                    {isUninsured ? "Get Prescribed Online" : "Skip the Insurance Hassle"}
                  </h3>
                  <p style={{fontSize:12,color:"#64748b",margin:"0 0 14px"}}>
                    {isUninsured
                      ? "These telehealth providers prescribe and deliver GLP-1s within days. No insurance needed."
                      : "Don't want to wait for insurance approval? These providers prescribe and deliver GLP-1s within days."}
                  </p>
                  <div style={{display:"grid",gap:8}}>
                    {telehealthOptions.map((opt,i)=>(
                      <div key={i} style={{background:"#fff",borderRadius:10,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,border:"1px solid #d1fae5"}}>
                        <div>
                          <span style={{fontSize:14,fontWeight:700,color:"#1e293b"}}>{opt.name}</span>
                          <span style={{fontSize:13,fontWeight:700,color:"#059669",marginLeft:8}}>{opt.price}</span>
                          <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{opt.detail}</div>
                        </div>
                        <div style={{flexShrink:0,textAlign:"center"}}>
                          <a href={opt.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"8px 16px",borderRadius:8,border:"2px solid #10b981",background:"transparent",color:"#059669",fontSize:11,fontWeight:700,cursor:"pointer",textDecoration:"none"}}>Visit &rarr;</a>
                          <div style={{fontSize:9,color:"#94a3b8",marginTop:2}}>Affiliate link</div>
                        </div>
                      </div>
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

                {/* DISCLAIMER */}
                <div style={{background:"#f8fafc",borderRadius:10,padding:16,marginBottom:16}}>
                  <p style={{fontSize:11,color:"#94a3b8",lineHeight:1.7,margin:0}}>
                    <strong style={{color:"#64748b"}}>Medical disclaimer:</strong> This site provides cost comparison information only and is not medical advice. The condition you selected is used only to show relevant pricing and coverage information. Consult your healthcare provider before starting or changing medication. Prices are estimates and may vary. Data last verified April 2026. Some links are affiliate links.
                  </p>
                </div>

                <div style={{textAlign:"center"}}>
                  <button onClick={startOver} style={{padding:"10px 24px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>&larr; Start Over</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
