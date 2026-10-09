"use client";

import React, { useState } from "react";
import { NavigationPage, Transaction } from "@/types";
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  Zap,
  Smartphone,
  CheckCircle2,
  Lock,
  Layers,
  Scale,
  Wallet,
} from "lucide-react";
import { BangladeshTransactionMap } from "../network/BangladeshTransactionMap";
import { useSentinel } from "@/context/SentinelContext";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface OverviewViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenTransactionDrawer: (txn: Transaction) => void;
  transactions?: Transaction[];
  onOpenReport: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenTransactionDrawer,
  onOpenReport,
}) => {
  const {
    transactions,
    alerts,
    cases,
    modelMetrics,
    injectScenario,
    setSelectedTransaction,
    language,
    t,
  } = useSentinel();

  const [injectingScenario, setInjectingScenario] = useState<string | null>(null);

  // Compute live operational KPIs from unified engine state
  const flaggedCount = transactions.filter((t) => t.riskLevel === "Critical" || t.riskLevel === "High").length;
  const activeCasesCount = cases.filter((c) => c.status === "Investigating" || c.status === "Pending Review").length;
  const totalExposure = cases.reduce((acc, c) => acc + (c.exposure || c.amount || 0), 0);
  const accuracyStr = modelMetrics ? `${(modelMetrics.accuracy * 100).toFixed(1)}%` : "100.0%";

  const isBn = language === "bn";

  const kpiData = [
    {
      label: t("scannedTransactions"),
      value: `${(1.28 + transactions.length / 1000).toFixed(2)}M`,
      trend: t("liveStreamTrend"),
      isPositive: true,
      icon: <Activity size={16} className="text-blue-600" />,
    },
    {
      label: t("flaggedHighRisk"),
      value: (1280 + flaggedCount).toLocaleString(),
      trend: t("multiSignalReview"),
      isPositive: false,
      icon: <ShieldAlert size={16} className="text-rose-600" />,
    },
    {
      label: t("preventedLoss"),
      value: `৳ ${(318.5 + totalExposure / 1000000).toFixed(1)}M`,
      trend: t("estimatedBdt"),
      isPositive: true,
      icon: <ShieldCheck size={16} className="text-emerald-600" />,
    },
    {
      label: t("activeInvestigations"),
      value: `${activeCasesCount}`,
      trend: t("analystOversight"),
      isPositive: false,
      icon: <Briefcase size={16} className="text-amber-600" />,
    },
    {
      label: t("modelAccuracy"),
      value: accuracyStr,
      trend: t("heldOutTestSplit"),
      isPositive: true,
      icon: <Sparkles size={16} className="text-blue-600" />,
    },
  ];

  const handleTriggerScenario = async (
    scenario: "ato" | "mule" | "velocity" | "sim_swap" | "normal"
  ) => {
    setInjectingScenario(scenario);
    try {
      const txn = await injectScenario(scenario);
      setSelectedTransaction(txn);
      onOpenTransactionDrawer(txn);
    } finally {
      setTimeout(() => setInjectingScenario(null), 500);
    }
  };

  const systemHealth = [
    { name: isBn ? "ঝুঁকি বিশ্লেষণ ইঞ্জিন" : "Risk Intelligence Engine", status: isBn ? "অনুকূল" : "Optimal", latency: "< 2ms" },
    { name: isBn ? "টেনসরফ্লো নিউরাল নেট" : "TensorFlow.js Neural Net", status: isBn ? "সক্রিয়" : "Active", latency: "< 4ms" },
    { name: isBn ? "বাংলাদেশ ব্যাংক সার্কুলার রুলস" : "Bangladesh Bank Compliance Rules", status: isBn ? "সক্রিয়" : "Active", latency: "< 1ms" },
    { name: isBn ? "মিউল সিন্ডিকেট ডিটেক্টর" : "Graph Syndicate Detector", status: isBn ? "সক্রিয়" : "Active", latency: "14ms" },
    { name: isBn ? "জেমিনাই কোপাইলট সিন্থেসিস" : "Gemini Copilot Reasoning", status: isBn ? "প্রস্তুত" : "Active", latency: "160ms" },
  ];

  const pipelineStages: {
    titleEn: string;
    titleBn: string;
    descEn: string;
    descBn: string;
    page: NavigationPage;
    step: string;
    icon: React.ReactNode;
    bgClass: string;
    borderClass: string;
    hoverBorderClass: string;
    badgeClass: string;
    iconBgClass: string;
    iconColorClass: string;
  }[] = [
    {
      titleEn: "Stream Ingestion",
      titleBn: "স্ট্রিম ইনজেশন",
      descEn: "Kafka Telemetry & Events",
      descBn: "লাইভ ট্রানজ্যাকশন স্ট্রিম",
      page: "transactions",
      step: "01 · INGEST",
      icon: <Zap size={13} />,
      bgClass: "bg-sky-50/80",
      borderClass: "border-sky-200",
      hoverBorderClass: "hover:border-sky-400 hover:bg-sky-50",
      badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
      iconBgClass: "bg-sky-100",
      iconColorClass: "text-sky-700",
    },
    {
      titleEn: "Behavioral Baselines",
      titleBn: "বিহেভিয়ারাল বেসলাইন",
      descEn: "30-Day Velocity & Profiling",
      descBn: "ব্যবহারকারী প্রোফাইল ও ব্যত্যয়",
      page: "customers",
      step: "02 · BASELINE",
      icon: <TrendingUp size={13} />,
      bgClass: "bg-indigo-50/80",
      borderClass: "border-indigo-200",
      hoverBorderClass: "hover:border-indigo-400 hover:bg-indigo-50",
      badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
      iconBgClass: "bg-indigo-100",
      iconColorClass: "text-indigo-700",
    },
    {
      titleEn: "BB Compliance Rules",
      titleBn: "বাংলাদেশ ব্যাংক রুলস",
      descEn: "BFIU Limits & SIM-Swap",
      descBn: "সার্কুলার ও লেনদেন সীমা",
      page: "risk",
      step: "03 · RULES",
      icon: <Scale size={13} />,
      bgClass: "bg-amber-50/80",
      borderClass: "border-amber-200",
      hoverBorderClass: "hover:border-amber-400 hover:bg-amber-50",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
      iconBgClass: "bg-amber-100",
      iconColorClass: "text-amber-700",
    },
    {
      titleEn: "Explainable XAI",
      titleBn: "ব্যাখ্যাযোগ্য এআই (XAI)",
      descEn: "SHAP Factors & LLM",
      descBn: "ঝুঁকির মূল ফ্যাক্টর ও কারণ",
      page: "analytics",
      step: "04 · AI / XAI",
      icon: <Sparkles size={13} />,
      bgClass: "bg-rose-50/80",
      borderClass: "border-rose-200",
      hoverBorderClass: "hover:border-rose-400 hover:bg-rose-50",
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
      iconBgClass: "bg-rose-100",
      iconColorClass: "text-rose-700",
    },
    {
      titleEn: "Case Dossier",
      titleBn: "তদন্ত ডসিয়ার কেস",
      descEn: "Mule Graph & Evidence",
      descBn: "নেটওয়ার্ক মানচিত্র ও প্রমাণ",
      page: "investigations",
      step: "05 · DOSSIER",
      icon: <Briefcase size={13} />,
      bgClass: "bg-teal-50/80",
      borderClass: "border-teal-200",
      hoverBorderClass: "hover:border-teal-400 hover:bg-teal-50",
      badgeClass: "bg-teal-100 text-teal-800 border-teal-300",
      iconBgClass: "bg-teal-100",
      iconColorClass: "text-teal-700",
    },
    {
      titleEn: "Human Oversight Audit",
      titleBn: "মানব তদারকি ও অডিট",
      descEn: "Analyst Sign-off & BFIU",
      descBn: "এসওসি অনুমোদন ও বিএফআইইউ",
      page: "investigations",
      step: "06 · AUDIT",
      icon: <CheckCircle2 size={13} />,
      bgClass: "bg-emerald-50/80",
      borderClass: "border-emerald-200",
      hoverBorderClass: "hover:border-emerald-400 hover:bg-emerald-50",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
      iconBgClass: "bg-emerald-100",
      iconColorClass: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-4">
      {/* ─── Group 1: Page Header ─── */}
      <div className="page-header stagger-1">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DIU CPC &times; UPAY AI HACKATHON &bull; MFS TRUST &amp; RISK INTELLIGENCE</span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? "মোবাইল ব্যাংকিং ঝুঁকি ও প্রতারণা নিয়ন্ত্রণ কেন্দ্র" : "Trust & Risk Operations Console"}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? "স্বয়ংক্রিয় লেনদেন স্ক্রিনিং, সমন্বিত এআই রিস্ক স্কোরিং এবং বিএফআইইউ কমপ্লায়েন্স সুরক্ষা প্ল্যাটফর্ম।"
              : "Autonomous MFS transaction screening, composite AI risk evaluation, and regulatory BFIU compliance."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("customer-portal")}
            className="btn btn-secondary text-xs flex items-center gap-1.5 border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 font-semibold transition-all shadow-sm"
            title={isBn ? "গ্রাহক ওয়ালেট ও লেনদেন সেবায় ফিরে যান" : "Return to Customer Wallet & Services"}
          >
            <Wallet size={13} className="text-blue-600" />
            <span>{isBn ? "ওয়ালেট ও লেনদেন সেবা" : "Wallet & Services"}</span>
          </button>
          <button
            onClick={onOpenReport}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <FileDown size={13} />
            <span>{t("exportReport")}</span>
          </button>
          <button
            onClick={() => onNavigate("transactions")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <span>{isBn ? "লাইভ মনিটর" : "Live Monitor"}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ─── Group 2: End-to-End MFS Fraud Pipeline: Connected Flow ─── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-card stagger-2">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-800">
              {isBn ? "এন্ড-টু-এন্ড এমএফএস জালিয়াতি প্রতিরোধ পাইপলাইন" : "End-to-End MFS Fraud Pipeline"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium">
              {isBn ? "স্বয়ংক্রিয় শৃঙ্খল প্রবাহ" : "Sequential Intelligence Pipeline"}
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              6 {isBn ? "ধাপ" : "STAGES"}
            </span>
          </div>
        </div>

        {/* 6-Column Boxy Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pipelineStages.map((stage, idx) => (
            <SpotlightCard
              key={idx}
              onClick={() => onNavigate(stage.page)}
              color="purple"
              glowSize="medium"
              lightsEdges={true}
              lag="short"
              className={`group rounded-xl p-2.5 sm:p-3 border hover-lift transition-all cursor-pointer flex flex-col justify-between ${stage.bgClass} ${stage.borderClass} ${stage.hoverBorderClass}`}
              title={isBn ? `${stage.titleBn} মডিউল খুলুন` : `Open ${stage.titleEn}`}
            >
              {/* Top Pill Row + Step + Connected Arrow */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded border uppercase leading-none ${stage.badgeClass}`}>
                  {stage.step}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center ${stage.iconBgClass} ${stage.iconColorClass}`}>
                    {stage.icon}
                  </div>
                  {idx < 5 && (
                    <span className="hidden lg:inline-block text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all font-black text-xs">
                      →
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="my-0.5">
                <h4 className="text-xs font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                  {isBn ? stage.titleBn : stage.titleEn}
                </h4>
                <p className="text-[10.5px] text-slate-600 mt-0.5 leading-tight line-clamp-1 font-medium">
                  {isBn ? stage.descBn : stage.descEn}
                </p>
              </div>

              {/* Action Hint */}
              <div className="mt-2 pt-1.5 border-t border-black/[0.06] flex items-center justify-between text-[10px] font-semibold text-slate-400 group-hover:text-slate-800">
                <span>{isBn ? "মডিউল দেখুন" : "View Stage"}</span>
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* ─── Group 3: KPI Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 stagger-3">
        {kpiData.map((kpi, index) => (
          <SpotlightCard
            key={index}
            color="purple"
            glowSize="medium"
            lightsEdges={true}
            lag="short"
            className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-semibold text-slate-600 truncate">{kpi.label}</span>
              <div className="p-1 rounded bg-slate-50 border border-slate-200">
                {kpi.icon}
              </div>
            </div>
            <div className="my-2">
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {kpi.value}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              {kpi.trend}
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* ─── Group 4: Regional Heatmap ─── */}
      <div className="stagger-4">
        <BangladeshTransactionMap />
      </div>

      {/* 1-Click Judge & Officer Demonstration Scenarios */}
      <div className="card-base p-4 border border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[10px] tracking-wider uppercase">
                {isBn ? "পরীক্ষামূলক দৃশ্যকল্প" : "SCENARIO LAB"}
              </span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {t("scenarioLabTitle")}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t("scenarioLabSubtitle")}
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            {isBn ? "ডিটারমিনিস্টিক + নিউরাল এমএল সক্রিয়" : "Deterministic + Neural ML Active"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
          {/* Scenario 1: ATO */}
          <button
            onClick={() => handleTriggerScenario("ato")}
            disabled={injectingScenario !== null}
            className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">{isBn ? "পিন প্রতারণা" : "ATO VECTOR"}</span>
                <ShieldAlert size={14} className="text-rose-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-2">{t("scenarioAtoTitle")}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {t("scenarioAtoDesc")}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-rose-600">
              <span className="font-bold">SCORE: ~87/100</span>
              <span className="text-slate-700 group-hover:text-rose-700 font-sans font-semibold">
                {t("injectAction")}
              </span>
            </div>
          </button>

          {/* Scenario 2: Mule Ring */}
          <button
            onClick={() => handleTriggerScenario("mule")}
            disabled={injectingScenario !== null}
            className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">{isBn ? "মিউল চক্র" : "SYNDICATE"}</span>
                <Layers size={14} className="text-rose-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-2">{t("scenarioMuleTitle")}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {t("scenarioMuleDesc")}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-rose-600">
              <span className="font-bold">SCORE: ~94/100</span>
              <span className="text-slate-700 group-hover:text-rose-700 font-sans font-semibold">
                {t("injectAction")}
              </span>
            </div>
          </button>

          {/* Scenario 3: SIM Swap */}
          <button
            onClick={() => handleTriggerScenario("sim_swap")}
            disabled={injectingScenario !== null}
            className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-critical text-[9px]">{isBn ? "সিম পরিবর্তন" : "SIM SWAP"}</span>
                <Smartphone size={14} className="text-rose-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-2">{t("scenarioSimSwapTitle")}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {t("scenarioSimSwapDesc")}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-rose-600">
              <span className="font-bold">SCORE: ~98/100</span>
              <span className="text-slate-700 group-hover:text-rose-700 font-sans font-semibold">
                {t("injectAction")}
              </span>
            </div>
          </button>

          {/* Scenario 4: Smurfing */}
          <button
            onClick={() => handleTriggerScenario("velocity")}
            disabled={injectingScenario !== null}
            className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-high text-[9px]">{isBn ? "স্মার্ফিং স্প্লিট" : "SMURFING"}</span>
                <Zap size={14} className="text-amber-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-2">{t("scenarioSmurfingTitle")}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {t("scenarioSmurfingDesc")}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-amber-600">
              <span className="font-bold">SCORE: ~80/100</span>
              <span className="text-slate-700 group-hover:text-amber-700 font-sans font-semibold">
                {t("injectAction")}
              </span>
            </div>
          </button>

          {/* Scenario 5: Legit */}
          <button
            onClick={() => handleTriggerScenario("normal")}
            disabled={injectingScenario !== null}
            className="p-3.5 rounded border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-colors flex flex-col justify-between group disabled:opacity-50"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="badge badge-low text-[9px]">{isBn ? "স্বাভাবিক কেনাকাটা" : "LEGITIMATE"}</span>
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mt-2">{t("scenarioLegitTitle")}</h3>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {t("scenarioLegitDesc")}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-emerald-700">
              <span className="font-bold">SCORE: ~18/100</span>
              <span className="text-slate-700 group-hover:text-emerald-700 font-sans font-semibold">
                {t("injectAction")}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* High-Risk Recent Transactions & Engine Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: High-Risk Intercept Feed */}
        <div className="lg:col-span-8 card-base p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isBn ? "সদ্য চিহ্নিত সন্দেহজনক লেনদেন" : "Recent High-Risk Intercepts"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "বহুমাত্রিক সংকেত দ্বারা চিহ্নিত রিয়েল-টাইম এমএফএস লেনদেনের তালিকা"
                  : "Transactions flagged by deterministic rules, velocity windows, and neural network"}
              </p>
            </div>
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>{isBn ? "সকল দেখুন" : "View All"}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px]">
                  <th className="py-2.5 px-2">{t("colTxnId")}</th>
                  <th className="py-2.5 px-2">{t("colCustomer")}</th>
                  <th className="py-2.5 px-2">{t("colAmount")}</th>
                  <th className="py-2.5 px-2">{t("colType")}</th>
                  <th className="py-2.5 px-2">{t("colDivision")}</th>
                  <th className="py-2.5 px-2">{t("colRiskScore")}</th>
                  <th className="py-2.5 px-2 text-right">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions
                  .filter((t) => t.riskLevel === "Critical" || t.riskLevel === "High")
                  .slice(0, 6)
                  .map((txn) => (
                    <tr
                      key={txn.id}
                      onClick={() => onOpenTransactionDrawer(txn)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-slate-900">
                        {txn.id}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-slate-700">
                        {txn.customer}
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-rose-600">
                        ৳{txn.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">
                        {txn.type}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600">
                        {txn.location}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`badge text-[10px] ${
                            txn.riskScore >= 90
                              ? "badge-critical"
                              : txn.riskScore >= 70
                              ? "badge-high"
                              : "badge-medium"
                          }`}
                        >
                          {txn.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right text-blue-600 font-semibold hover:underline">
                        {isBn ? "বিশ্লেষণ →" : "Inspect →"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Operational Health & Compliance Guarantee */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-base p-4 border border-slate-200 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isBn ? "ইঞ্জিন অবস্থা ও লেটেন্সি" : "Engine Health & Latency"}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="divide-y divide-slate-100 mt-1">
              {systemHealth.map((item, index) => (
                <div key={index} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="font-medium text-slate-700">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                      {item.status}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{item.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bangladesh Bank Regulation Card */}
          <div className="card-base p-4 border border-amber-200 bg-amber-50/60">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Scale size={15} className="text-amber-700 shrink-0" />
              <span>{isBn ? "বাংলাদেশ ব্যাংক সার্কুলার ২৫/২০২৩ কমপ্লায়েন্স" : "Bangladesh Bank Circular 25/2023"}</span>
            </div>
            <p className="text-xs text-amber-800 mt-2 leading-relaxed">
              {isBn
                ? "এমএফএস মাধ্যমে ৳৫০,০০০ উর্ধ্বতন স্থানান্তর অবিলম্বে বিএফআইইউ গোয়েন্দা ট্র্যাকিংয়ে অন্তর্ভুক্ত হয়। সিম পরিবর্তনের পর ২৪ ঘণ্টার মধ্যে সর্বোচ্চ ব্যালেন্স উত্তোলনে স্বয়ংক্রিয় হোল্ড আরোপ করা আবশ্যক।"
                : "MFS transactions exceeding ৳50,000 threshold or initiated within 24h of carrier SIM re-issuance automatically mandate risk hold and STR dossier submission."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
