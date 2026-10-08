export type Language = "en" | "bn";

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  bangladeshBankCompliance: string;
  bfiuCircular: string;
  realtimeEngine: string;
  latencyOptimal: string;

  // Navigation
  navOverview: string;
  navTransactions: string;
  navRisk: string;
  navNetwork: string;
  navInvestigations: string;
  navCustomers: string;
  navAlerts: string;
  navAnalytics: string;
  navSecurity: string;
  navAudit: string;
  navSimulator: string;

  // Actions
  simulateScenario: string;
  exportReport: string;
  searchPlaceholder: string;
  liveFeed: string;
  pauseFeed: string;
  resumeFeed: string;
  filterBy: string;
  allDivisions: string;
  allTypes: string;
  allRiskTiers: string;
  viewDetails: string;
  openDossier: string;
  close: string;
  save: string;
  cancel: string;

  // KPI Metrics
  scannedTransactions: string;
  flaggedHighRisk: string;
  preventedLoss: string;
  activeInvestigations: string;
  modelAccuracy: string;
  liveStreamTrend: string;
  multiSignalReview: string;
  estimatedBdt: string;
  analystOversight: string;
  heldOutTestSplit: string;

  // Risk Tiers
  critical: string;
  high: string;
  medium: string;
  low: string;
  approved: string;
  monitoring: string;
  flagged: string;
  investigating: string;
  blocked: string;

  // Scenario Workbench
  scenarioLabTitle: string;
  scenarioLabSubtitle: string;
  scenarioAtoTitle: string;
  scenarioAtoDesc: string;
  scenarioMuleTitle: string;
  scenarioMuleDesc: string;
  scenarioSimSwapTitle: string;
  scenarioSimSwapDesc: string;
  scenarioSmurfingTitle: string;
  scenarioSmurfingDesc: string;
  scenarioLegitTitle: string;
  scenarioLegitDesc: string;
  injectAction: string;

  // Bangladesh Map & Geo
  divisionRiskTitle: string;
  divisionRiskSubtitle: string;
  divisionDhaka: string;
  divisionChattogram: string;
  divisionSylhet: string;
  divisionRajshahi: string;
  divisionKhulna: string;
  divisionBarishal: string;
  divisionRangpur: string;
  divisionMymensingh: string;
  activeTps: string;
  volume24h: string;
  highRiskAgents: string;

  // Table Headers
  colTxnId: string;
  colCustomer: string;
  colRecipient: string;
  colAmount: string;
  colType: string;
  colDivision: string;
  colDeviceSim: string;
  colRiskScore: string;
  colStatus: string;
  colActions: string;

  // Transaction Types
  typeWalletTransfer: string;
  typeCashOut: string;
  typeMerchantPay: string;
  typeAddMoney: string;
  typeMobileRecharge: string;
  typeUtilityBill: string;

  // Decision & Analyst Actions
  actionHold: string;
  actionHoldDesc: string;
  actionStepUp: string;
  actionStepUpDesc: string;
  actionFreeze: string;
  actionFreezeDesc: string;
  actionRelease: string;
  actionReleaseDesc: string;
  actionBfiuEscalate: string;
  actionBfiuEscalateDesc: string;
  analystGovernanceNotice: string;

  // AI Copilot
  aiCopilotTitle: string;
  aiCopilotSubtitle: string;
  aiWhatHappened: string;
  aiWhyRisky: string;
  aiWhatNext: string;
  aiConfidence: string;
  aiEvidenceGrounded: string;

  // Mule Network
  muleNetworkTitle: string;
  muleNetworkSubtitle: string;
  moneyTrailView: string;
  clusterView: string;
  sourceVictim: string;
  conduitMule: string;
  rogueAgent: string;
  undergroundHundi: string;

  // BFIU Report
  bfiuReportTitle: string;
  bfiuReportSubtitle: string;
  strNotice: string;
  downloadPdf: string;
  printReport: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandTitle: "upay Sentinel",
    brandSubtitle: "Bangladesh MFS Fraud Intelligence & Risk Operations",
    bangladeshBankCompliance: "BFIU Circular 25/2023 Compliant",
    bfiuCircular: "Bangladesh Bank Financial Intelligence Unit Guard",
    realtimeEngine: "Deterministic & Neural Risk Engine Active",
    latencyOptimal: "< 2ms Latency · Dhaka Primary Gateway",

    navOverview: "Overview Console",
    navTransactions: "Live Transactions",
    navRisk: "Risk Signals & XAI",
    navNetwork: "Mule Syndicate Network",
    navInvestigations: "Investigation Dossiers",
    navCustomers: "Customer 360",
    navAlerts: "Alert Center",
    navAnalytics: "BFIU Benchmarks & SAR",
    navSecurity: "Security & IP Tracking",
    navAudit: "Immutable Audit Trail",
    navSimulator: "Risk Sandbox",

    simulateScenario: "Simulate Vector",
    exportReport: "BFIU SAR Report",
    searchPlaceholder: "Search wallet (e.g. 01712...), agent code, NID, or TXN ID...",
    liveFeed: "Live Stream Active",
    pauseFeed: "Pause Stream",
    resumeFeed: "Resume Stream",
    filterBy: "Filter by",
    allDivisions: "All 8 Divisions",
    allTypes: "All Transaction Types",
    allRiskTiers: "All Risk Tiers",
    viewDetails: "Inspect Details",
    openDossier: "Open Case File",
    close: "Close",
    save: "Save",
    cancel: "Cancel",

    scannedTransactions: "Scanned Transactions",
    flaggedHighRisk: "Flagged High-Risk",
    preventedLoss: "Prevented Capital Loss",
    activeInvestigations: "Active Case Dossiers",
    modelAccuracy: "Benchmark Accuracy",
    liveStreamTrend: "+8.4% live MFS volume",
    multiSignalReview: "Multi-signal scrutiny required",
    estimatedBdt: "Estimated BDT saved",
    analystOversight: "Human oversight required",
    heldOutTestSplit: "100-sample held-out benchmark",

    critical: "Critical Risk",
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low / Normal",
    approved: "Approved",
    monitoring: "Monitoring",
    flagged: "Flagged",
    investigating: "Under Investigation",
    blocked: "Blocked / Held",

    scenarioLabTitle: "1-Click Bangladesh MFS Fraud Attack Workbench",
    scenarioLabSubtitle: "Inject authentic Bangladesh MFS attack vectors to verify sub-2ms multi-layer detection and case generation.",
    scenarioAtoTitle: "Account Takeover (ATO)",
    scenarioAtoDesc: "Recent USSD PIN reset (*268#) followed by ৳32,000 nocturnal cash-out at an unverified agent in Chattogram.",
    scenarioMuleTitle: "Money Mule Syndicate",
    scenarioMuleDesc: "৳48,500 transferred to U-8831 (Mule Cluster #17 conduit) via shared suspicious phone hardware.",
    scenarioSimSwapTitle: "SIM Swap Liquidation",
    scenarioSimSwapDesc: "Full balance drain (৳98,000) within 15 minutes of mobile carrier SIM re-issuance violating the 24h cooling-off rule.",
    scenarioSmurfingTitle: "Smurfing / Limit Evading",
    scenarioSmurfingDesc: "6 rapid transfers of ৳24,500 skirting Bangladesh Bank's ৳25,000 / ৳50,000 threshold within 180 seconds.",
    scenarioLegitTitle: "Legitimate Merchant Pay",
    scenarioLegitDesc: "৳2,450 grocery checkout at registered merchant QR from user's trusted device during business hours.",
    injectAction: "Inject Vector →",

    divisionRiskTitle: "Bangladesh Regional MFS Risk Heatmap & Fund Flows",
    divisionRiskSubtitle: "Geographic MFS volume distribution, active inter-division transfer corridors, and rogue agent alerts.",
    divisionDhaka: "Dhaka Central",
    divisionChattogram: "Chattogram Port",
    divisionSylhet: "Sylhet Remittance Corridor",
    divisionRajshahi: "Rajshahi North-West",
    divisionKhulna: "Khulna Industrial",
    divisionBarishal: "Barishal Riverine",
    divisionRangpur: "Rangpur Frontier",
    divisionMymensingh: "Mymensingh Agricultural",
    activeTps: "Transactions/sec",
    volume24h: "24h Volume (৳)",
    highRiskAgents: "Flagged Agent Outlets",

    colTxnId: "TXN ID",
    colCustomer: "Customer Wallet",
    colRecipient: "Recipient / Agent",
    colAmount: "Amount (৳)",
    colType: "MFS Type",
    colDivision: "Division",
    colDeviceSim: "Device / SIM Status",
    colRiskScore: "Risk Score",
    colStatus: "Status",
    colActions: "Actions",

    typeWalletTransfer: "P2P Send Money",
    typeCashOut: "Agent Cash-Out",
    typeMerchantPay: "Merchant Payment",
    typeAddMoney: "Bank Add Money",
    typeMobileRecharge: "Mobile Recharge",
    typeUtilityBill: "Utility Bill Pay",

    actionHold: "Hold Settlement",
    actionHoldDesc: "Temporarily withhold fund release to agent pending analyst clearance.",
    actionStepUp: "Request Biometric 2FA",
    actionStepUpDesc: "Challenge customer with live facial or NID fingerprint verification.",
    actionFreeze: "Freeze Wallet",
    actionFreezeDesc: "Lock wallet from all outgoing USSD and App cash-out transactions.",
    actionRelease: "Clear & Approve",
    actionReleaseDesc: "Verify transaction as legitimate customer activity and release funds.",
    actionBfiuEscalate: "Escalate to BFIU (STR)",
    actionBfiuEscalateDesc: "Generate automated Suspicious Transaction Report for Bangladesh Bank.",
    analystGovernanceNotice: "Human-in-the-Loop Governance: Autonomous irreversible fund seizures are prohibited.",

    aiCopilotTitle: "Gemini AI Investigation Copilot",
    aiCopilotSubtitle: "Grounding multi-signal risk telemetry into structured executive reasoning.",
    aiWhatHappened: "1. What Happened?",
    aiWhyRisky: "2. Why is this Risky?",
    aiWhatNext: "3. What Should upay Do Next?",
    aiConfidence: "AI Confidence Score",
    aiEvidenceGrounded: "Evidence Grounded in MFS Logs",

    muleNetworkTitle: "MFS Money Trail & Syndicate Link Topology",
    muleNetworkSubtitle: "Map the flow of stolen funds: Victim Accounts → Intermediary Conduits → Rogue Agent Points → Underground Liquidation.",
    moneyTrailView: "2D Money Flow Trail",
    clusterView: "Syndicate Proximity",
    sourceVictim: "Victim / Origin Wallet",
    conduitMule: "Conduit Mule Wallet",
    rogueAgent: "Rogue Agent Cashout",
    undergroundHundi: "Underground Hundi Hub",

    bfiuReportTitle: "Bangladesh Bank BFIU Suspicious Transaction Dossier",
    bfiuReportSubtitle: "Official Anti-Money Laundering (AML) / CFT report generated under Bangladesh Bank Circular 25/2023.",
    strNotice: "CONFIDENTIAL & PRIVILEGED · SUBMISSION UNDER MONEY LAUNDERING PREVENTION ACT, 2012",
    downloadPdf: "Export PDF",
    printReport: "Print Dossier",
  },
  bn: {
    brandTitle: "উপায় সেন্টিনেল",
    brandSubtitle: "বাংলাদেশ মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS) জালিয়াতি প্রতিরোধ ও ঝুঁকি নিয়ন্ত্রণ",
    bangladeshBankCompliance: "বাংলাদেশ ব্যাংক BFIU সার্কুলার ২৫/২০২৩ কমপ্লায়েন্ট",
    bfiuCircular: "বাংলাদেশ ব্যাংক ফাইন্যান্সিয়াল ইন্টেলিজেন্স ইউনিট নজরদারি",
    realtimeEngine: "রিয়েল-টাইম ডিটারমিনিস্টিক ও নিউরাল রিস্ক ইঞ্জিন সক্রিয়",
    latencyOptimal: "< ২ মিলি-সেকেন্ড লেটেন্সি · ঢাকা প্রাইমারি গেটওয়ে",

    navOverview: "নির্বাহী ড্যাশবোর্ড",
    navTransactions: "লাইভ লেনদেন পর্যবেক্ষণ",
    navRisk: "ঝুঁকি সংকেত ও XAI",
    navNetwork: "মিউল সিন্ডিকেট নেটওয়ার্ক",
    navInvestigations: "তদন্ত কেস ডসিয়ার",
    navCustomers: "গ্রাহক ৩৬০ প্রোফাইল",
    navAlerts: "জরুরি অ্যালার্ট সেন্টার",
    navAnalytics: "বিএফআইইউ বেঞ্চমার্ক ও এসএআর",
    navSecurity: "নিরাপত্তা ও আইপি ট্র্যাকিং",
    navAudit: "অপরিবর্তনীয় অডিট ট্রেইল",
    navSimulator: "ঝুঁকি সিমুলেটর",

    simulateScenario: "প্রতারণা সিমুলেট করুন",
    exportReport: "বিএফআইইউ এসটিআর রিপোর্ট",
    searchPlaceholder: "গ্রাহক ওয়ালেট (যেমন: ০১৭১২...), এজেন্ট কোড, এনআইডি বা ট্রানজ্যাকশন আইডি খুঁজুন...",
    liveFeed: "লাইভ ট্রানজ্যাকশন স্ট্রিম চালু",
    pauseFeed: "স্ট্রিম বিরতি",
    resumeFeed: "স্ট্রিম চালু করুন",
    filterBy: "ফিল্টার",
    allDivisions: "সকল ৮টি বিভাগ",
    allTypes: "সকল ধরনের লেনদেন",
    allRiskTiers: "সকল ঝুঁকি মাত্রা",
    viewDetails: "বিস্তারিত দেখুন",
    openDossier: "কেস ফাইল খুলুন",
    close: "বন্ধ করুন",
    save: "সংরক্ষণ",
    cancel: "বাতিল",

    scannedTransactions: "স্ক্যানকৃত মোট লেনদেন",
    flaggedHighRisk: "চিহ্নিত উচ্চ-ঝুঁকিপূর্ণ",
    preventedLoss: "প্রতিরোধকৃত আর্থিক ক্ষতি",
    activeInvestigations: "চলমান তদন্ত কেস",
    modelAccuracy: "বেঞ্চমার্ক নির্ভুলতা",
    liveStreamTrend: "+৮.৪% লাইভ এমএফএস ভলিউম",
    multiSignalReview: "মাল্টি-সিগন্যাল মানব পর্যালোচনা প্রয়োজন",
    estimatedBdt: "আনুমানিক সংরক্ষিত টাকা",
    analystOversight: "ঝুঁকি বিশ্লেষকের অনুমোদন আবশ্যক",
    heldOutTestSplit: "১০০টি সংরক্ষিত টেস্ট ডাটাবেস মূল্যায়ন",

    critical: "চরম ঝুঁকিপূর্ণ (ক্রিটিক্যাল)",
    high: "উচ্চ ঝুঁকিপূর্ণ",
    medium: "মাঝারি ঝুঁকি",
    low: "স্বাভাবিক / নিরাপদ",
    approved: "অনুমোদিত",
    monitoring: "নজরদারিতে",
    flagged: "চিহ্নিত",
    investigating: "তদন্তাধীন",
    blocked: "স্থগিত / অবরুদ্ধ",

    scenarioLabTitle: "১-ক্লিক বাংলাদেশ এমএফএস জালিয়াতি আক্রমণ সিমুলেশন ওয়ার্কবেঞ্চ",
    scenarioLabSubtitle: "বাস্তব বাংলাদেশি মোবাইল ব্যাংকিং আক্রমণ ভেক্টর ইনজেক্ট করে ২ মিলিসেকেন্ডের ঝুঁকি ইঞ্জিন ও কেস তৈরি পরীক্ষা করুন।",
    scenarioAtoTitle: "অ্যাকাউন্ট দখল (ATO / পিন জালিয়াতি)",
    scenarioAtoDesc: "ইউএসএসডি (*২৬৮#) পিন রিসেট করার পর গভীর রাতে চট্টগ্রামের অপরিচিত এজেন্ট থেকে ৳৩২,০০০ ক্যাশ আউটের চেষ্টা।",
    scenarioMuleTitle: "মানি মিউল সিন্ডিকেট চক্র",
    scenarioMuleDesc: "একটি সন্দেহভাজন যৌথ ডিভাইস ব্যবহার করে চক্র ১৭-এর মিউল ওয়ালেট U-8831-এ ৳৪৮,৫০০ ট্রান্সফার।",
    scenarioSimSwapTitle: "সিম সোয়াপ একাউন্ট খালি",
    scenarioSimSwapDesc: "টেলিকো অপারেটর থেকে সিম পুনরুত্তোলনের ১৫ মিনিটের মাথায় বাংলাদেশ ব্যাংকের ২৪ ঘণ্টার কুলিং নিয়ম ভঙ্গ করে ৳৯৮,০০০ উত্তোলন।",
    scenarioSmurfingTitle: "স্মার্ফিং (সীমা ফাঁকি ক্ষুদ্র লেনদেন)",
    scenarioSmurfingDesc: "বাংলাদেশ ব্যাংকের ৳২৫,০০০ / ৳৫০,০০০ রিপোর্টিং সীমা এড়াতে ১৮০ সেকেন্ডে ৬ বার ৳২৪,৫০০ করে দ্রুত লেনদেন।",
    scenarioLegitTitle: "স্বাভাবিক মার্চেন্ট পেমেন্ট",
    scenarioLegitDesc: "গ্রাহকের বিশ্বস্ত ডিভাইস থেকে দিনের বেলায় নিবন্ধিত মুদি দোকানে ৳২,৪৫০ সাধারণ কিউআর পেমেন্ট।",
    injectAction: "ইনজেক্ট করুন →",

    divisionRiskTitle: "বাংলাদেশ বিভাগীয় এমএফএস ঝুঁকি হিটম্যাপ ও লেনদেন প্রবাহ",
    divisionRiskSubtitle: "ভৌগোলিক লেনদেনের ঘনত্ব, বিভাগগুলোর মধ্যকার সন্দেহজনক টাকার প্রবাহ এবং ঝুঁকিপূর্ণ এজেন্ট আউটলেটের চিত্র।",
    divisionDhaka: "ঢাকা কেন্দ্রীয় গেটওয়ে",
    divisionChattogram: "চট্টগ্রাম বাণিজ্যিক হাব",
    divisionSylhet: "সিলেট প্রবাসী রেমিট্যান্স হাব",
    divisionRajshahi: "রাজশাহী উত্তর-পশ্চিম গেটওয়ে",
    divisionKhulna: "খুলনা শিল্প এলাকা নোড",
    divisionBarishal: "বরিশাল উপকূলীয় নেটওয়ার্ক",
    divisionRangpur: "রংপুর উত্তরাঞ্চলীয় করিডোর",
    divisionMymensingh: "ময়মনসিংহ কৃষি বাণিজ্য জংশন",
    activeTps: "প্রতি সেকেন্ডে লেনদেন",
    volume24h: "২৪ ঘণ্টার ভলিউম (৳)",
    highRiskAgents: "ঝুঁকিপূর্ণ এজেন্ট পয়েন্ট",

    colTxnId: "আইডি",
    colCustomer: "গ্রাহক ওয়ালেট",
    colRecipient: "প্রাপক / এজেন্ট",
    colAmount: "পরিমাণ (৳)",
    colType: "লেনদেনের ধরন",
    colDivision: "বিভাগ",
    colDeviceSim: "ডিভাইস ও সিম অবস্থা",
    colRiskScore: "ঝুঁকি স্কোর",
    colStatus: "অবস্থা",
    colActions: "পদক্ষেপ",

    typeWalletTransfer: "সেন্ড মানি (P2P)",
    typeCashOut: "এজেন্ট ক্যাশ আউট",
    typeMerchantPay: "মার্চেন্ট পেমেন্ট",
    typeAddMoney: "ব্যাংক থেকে অ্যাড মানি",
    typeMobileRecharge: "মোবাইল রিচার্জ",
    typeUtilityBill: "ইউটিলিটি বিল পে",

    actionHold: "লেনদেন স্থগিত রাখুন",
    actionHoldDesc: "এজেন্ট থেকে নগদ টাকা উত্তোলনের পূর্বে সাময়িকভাবে লেনদেন আটকে দিন।",
    actionStepUp: "বায়োমেট্রিক ২এফএ যাচাই",
    actionStepUpDesc: "গ্রাহকের ফেসিয়াল বা এনআইডি আঙুলের ছাপ দিয়ে পুনরায় পরিচয় নিশ্চিত করুন।",
    actionFreeze: "ওয়ালেট সাময়িক ব্লক",
    actionFreezeDesc: "যেকোনো ধরনের অ্যাপ ও ইউএসএসডি ক্যাশ আউট সম্পূর্ণভাবে সাময়িক বন্ধ রাখুন।",
    actionRelease: "অনুমোদন ও রিলিজ",
    actionReleaseDesc: "লেনদেনটি সম্পূর্ণ বৈধ প্রমাণিত হওয়ায় আটকে রাখা টাকা ছেড়ে দিন।",
    actionBfiuEscalate: "বিএফআইইউতে রিপোর্ট (STR)",
    actionBfiuEscalateDesc: "বাংলাদেশ ব্যাংকের জন্য স্বয়ংক্রিয় সন্দেহজনক লেনদেন রিপোর্ট তৈরি করুন।",
    analystGovernanceNotice: "হিউম্যান-ইন-দ্য-লুপ নিরাপত্তা নীতি: কোনো স্বয়ংক্রিয় এআই সরাসরি টাকা জব্দ বা একাউন্ট বাতিল করতে পারবে না।",

    aiCopilotTitle: "জেমিনাই এআই তদন্ত কোপাইলট",
    aiCopilotSubtitle: "মাল্টি-সিগন্যাল টেলিম্যাট্রি তথ্য থেকে কাঠামোগত ব্যবসায়িক বিশ্লেষণ ও যৌক্তিক ব্যাখ্যা।",
    aiWhatHappened: "১. কী ঘটেছে?",
    aiWhyRisky: "২. কেন এটি ঝুঁকিপূর্ণ?",
    aiWhatNext: "৩. উপায়ের করণীয় কী?",
    aiConfidence: "এআই কনফিডেন্স স্কোর",
    aiEvidenceGrounded: "এমএফএস লগ নির্ভর প্রমাণপত্র",

    muleNetworkTitle: "এমএফএস মানি ট্রেইল ও মিউল সিন্ডিকেট নেটওয়ার্ক",
    muleNetworkSubtitle: "চুরিকৃত অর্থের প্রবাহ পর্যবেক্ষণ: ভুক্তভোগী ওয়ালেট → মধ্যবর্তী মিউল অ্যাকাউন্ট → অসাধু এজেন্ট পয়েন্ট → হুন্ডি বা নগদ পাচার।",
    moneyTrailView: "২ডি মানি ট্রেইল ভিউ",
    clusterView: "সিন্ডিকেট সান্নিধ্য",
    sourceVictim: "উৎস / ভুক্তভোগী ওয়ালেট",
    conduitMule: "কন্ডুইট মিউল ওয়ালেট",
    rogueAgent: "অসাধু এজেন্ট ক্যাশ-আউট",
    undergroundHundi: "হুন্ডি ও চোরাই চ্যানেল",

    bfiuReportTitle: "বাংলাদেশ ব্যাংক বিএফআইইউ সন্দেহজনক লেনদেন ডসিয়ার (STR)",
    bfiuReportSubtitle: "মানি লন্ডারিং প্রতিরোধ আইন, ২০১২ এবং বাংলাদেশ ব্যাংক সার্কুলার ২৫/২০২৩ অনুযায়ী প্রস্তুতকৃত সরকারি রিপোর্ট।",
    strNotice: "গোপনীয় ও বিশেষাধিকার প্রাপ্ত · বাংলাদেশ ফাইন্যান্সিয়াল ইন্টেলিজেন্স ইউনিট (BFIU)",
    downloadPdf: "পিডিএফ ডাউনলোড",
    printReport: "প্রিন্ট করুন",
  },
};
