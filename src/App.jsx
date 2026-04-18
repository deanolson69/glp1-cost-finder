import { useState, useRef, useEffect } from "react";

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
    selfPay:{price:"$199/mo",where:"TrumpRx or GoodRx",note:"TrumpRx $199/mo. GoodRx $199 for first 2 fills through 6/30/26, then $349. Maintenance dose (2mg) $349-$499/mo at higher doses.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"GoodRx",url:"https://www.goodrx.com/ozempic"}]},
    withInsurance:{price:"$25/mo",how:"Novo Nordisk savings card",note:"If your plan covers Ozempic, the savings card drops your copay to $25/mo (max $100/mo savings). 82% of commercial plans cover it for diabetes."},
    doses:[
      {phase:"Month 1-2",dose:"0.25-0.5mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$199",hl:true},{s:"TrumpRx",p:"$199",hl:true}]},
      {phase:"Month 3-4",dose:"1mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$349",hl:true},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 5+",dose:"2mg",prices:[{s:"Retail",p:"$968",hl:false},{s:"GoodRx",p:"$349",hl:true},{s:"TrumpRx",p:"$350",hl:true}]}
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
    selfPay:{price:"$299/mo",where:"LillyDirect",note:"LillyDirect $299/mo starting dose, $399-$449 at higher doses. TrumpRx $350/mo flat. GoodRx is not competitive for Lilly drugs ($1,097).",links:[{label:"LillyDirect",url:"https://www.lillydirect.com"},{label:"TrumpRx",url:"https://trumprx.gov"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/mo if covered (max $1,950/yr). Even if NOT covered, up to $499 off per fill (max $8,411/yr, 13 fills). Works either way with commercial insurance."},
    doses:[
      {phase:"Month 1-2",dose:"2.5-5mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"LillyDirect",p:"$299",hl:true},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 3-4",dose:"7.5-10mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"LillyDirect",p:"$399",hl:true},{s:"TrumpRx",p:"$350",hl:true}]},
      {phase:"Month 5+",dose:"12.5-15mg",prices:[{s:"Retail",p:"$1,070",hl:false},{s:"LillyDirect",p:"$449",hl:false},{s:"TrumpRx",p:"$350",hl:true}]}
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
    selfPay:{price:"$299/mo",where:"TrumpRx or LillyDirect",note:"TrumpRx $299/mo flat. LillyDirect $299 starting, $399-$449 at higher doses.",links:[{label:"TrumpRx",url:"https://trumprx.gov"},{label:"LillyDirect",url:"https://www.lillydirect.com"}]},
    withInsurance:{price:"$25/mo",how:"Lilly savings card",note:"$25/mo if covered. If NOT covered, up to $650 off per fill. Only 30-40% of commercial plans cover Zepbound for weight loss."},
    doses:[
      {phase:"Month 1-2",dose:"2.5-5mg",prices:[{s:"Retail",p:"$1,086",hl:false},{s:"TrumpRx",p:"$299",hl:true},{s:"LillyDirect",p:"$299",hl:true}]},
      {phase:"Month 3-4",dose:"7.5-10mg",prices:[{s:"Retail",p:"$1,086",hl:false},{s:"TrumpRx",p:"$299",hl:true},{s:"LillyDirect",p:"$399",hl:true}]},
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
  {name:"Noom Med",price:"$149-$279/mo",detail:"GLP-1 from $149 first month. Includes behavioral coaching.",url:"https://www.noom.com/med/"},
  {name:"LifeMD",price:"Varies",detail:"Now offering Foundayo. Full medical evaluation included.",url:"https://lifemd.com/"}
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

// ─── MAIN COMPONENT ───
export default function GLP1CostFinder() {
  const [insurance, setInsurance] = useState(null);
  const [condition, setCondition] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
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
    if (!email || !email.includes("@") || !email.includes(".")) { setEmailError("Please enter a valid email"); return; }
    setEmailError(""); setEmailSubmitted(true);
    console.log("Email captured:", {email, state:selectedState, insurance, condition});
  };

  const startOver = () => {
    setInsurance(null); setCondition(null); setSelectedState(null);
    setEmail(""); setEmailSubmitted(false); setEmailError("");
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
                  <input type="email" placeholder="Your email address" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleEmail()}
                    style={{flex:1,padding:"12px 16px",borderRadius:10,border:emailError?"2px solid #f43f5e":"1px solid #e2e8f0",background:"#fff",color:"#1e293b",fontSize:15}}/>
                  <button onClick={handleEmail} style={{padding:"12px 24px",borderRadius:10,border:"none",background:"#3b82f6",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Unlock</button>
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
                <span style={{fontSize:13,color:"#059669",fontWeight:600}}>{"\u2713"} We'll send price alerts to {email}</span>
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
                      const matchesCondition = condition && condition !== "skip" && drug.conditions.includes(condition);
                      return (
                        <div key={drug.name} style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:isOpen?"0 4px 16px rgba(0,0,0,.08)":"0 1px 3px rgba(0,0,0,.04)",border:isRec&&!isOpen?"2px solid #3b82f6":"1px solid #e2e8f0",transition:"box-shadow .2s"}}>
                          <button onClick={()=>setExpandedDrug(isOpen?null:drug.name)}
                            style={{width:"100%",padding:"16px 20px",background:"transparent",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left"}}>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                                {!isUninsured && isRec && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#dbeafe",color:"#1d4ed8",textTransform:"uppercase",letterSpacing:.5}}>Recommended</span>}
                                {isUninsured && isRec && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#d1fae5",color:"#065f46",textTransform:"uppercase",letterSpacing:.5}}>Best Price</span>}
                                {condition && condition !== "skip" && drug.conditions.includes(condition) && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#fef3c7",color:"#92400e",textTransform:"uppercase",letterSpacing:.5}}>FDA-approved for your condition</span>}
                                {matchesCondition && !isRec && <span style={{padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:800,background:"#d1fae5",color:"#059669",textTransform:"uppercase",letterSpacing:.5}}>Matches your condition</span>}
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
        <div style={{textAlign:"center",marginTop:40,paddingTop:20,borderTop:"1px solid #e2e8f0"}}>
          <p style={{fontSize:11,color:"#94a3b8"}}>&copy; 2026 GLP-1 Cost Finder - glp1costfinder.com</p>
          <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:6}}>
            <a href="/privacy" style={{fontSize:10,color:"#cbd5e1",textDecoration:"none"}}>Privacy Policy</a>
            <a href="/terms" style={{fontSize:10,color:"#cbd5e1",textDecoration:"none"}}>Terms of Use</a>
            <a href="/contact" style={{fontSize:10,color:"#cbd5e1",textDecoration:"none"}}>Contact</a>
          </div>
          <p style={{fontSize:10,color:"#cbd5e1",marginTop:6}}>Sources: TrumpRx.gov, GoodRx, NovoCare, LillyDirect, CMS, KFF, FDA.gov</p>
        </div>
      </div>
    </div>
  );
}
