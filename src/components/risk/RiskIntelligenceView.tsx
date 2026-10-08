"use client";

import React, { useState } from "react";
import { NavigationPage } from "@/types";
import { riskFactorsTXN8F42 } from "@/lib/data";
import { useSentinel } from "@/context/SentinelContext";
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  AlertOctagon,
  FileCheck,
  Share2,
  Lock,
  UserCheck,
  Scale,
} from "lucide-react";

interface RiskIntelligenceViewProps {
  onNavigate: (page: NavigationPage) => void;
  onNotify: (msg: string) => void;
}

export const RiskIntelligenceView: React.FC<RiskIntelligenceViewProps> = ({
  onNavigate,
  onNotify,
}) => {
  const { language, t, executeAnalystAction } = useSentinel();
  const [selectedTxnId, setSelectedTxnId] = useState("TXN-8F42");
  const isBn = language === "bn";

  const currentScore = selectedTxnId === "TXN-8F42" ? 94 : selectedTxnId === "TXN-92KD" ? 87 : 89;
  const currentThreat = currentScore >= 90 ? "Critical" : "High";

  const reasoningItems = isBn
    ? [
        {
          title: "আর্থিক পরিমাণের অস্বাভাবিক বিচ্যুতি",
          description: "৳৪৮,৫০০ লেনদেনের অনুরোধ গ্রাহকের ৩০ দিনের গড় লেনদেন ৳৬,৮০০-এর তুলনায় ৪.৮ গুণ বেশি।",
          score: 92,
          evidence: "৩০ দিনের সাধারণ বেসলাইন: ৳৬,৮০০ · পূর্ববর্তী সর্বোচ্চ লেনদেন: ৳১৫,০০০",
        },
        {
          title: "ডিভাইস ও সিম পেয়ারিং অসঙ্গতি",
          description: "নতুন অ্যান্ড্রয়েড ডিভাইস DEV-8821 লেনদেনের মাত্র ১২ মিনিট আগে প্রথম লগইন করেছে।",
          evidence: "হার্ডওয়্যার ফিঙ্গারপ্রিন্ট: Samsung S23 · সিম পরিবর্তন সনাক্তকরণ সক্রিয়",
          score: 78,
        },
        {
          title: "প্রাপক ওয়ালেটের উচ্চ ঝুঁকি সঞ্চয়ন",
          description: "প্রাপক ওয়ালেট U-8831 বিগত ৪৮ ঘণ্টায় ৪টি প্রতারণার শিকার ওয়ালেট থেকে টাকা গ্রহণ করেছে।",
          evidence: "ইনবাউন্ড স্মার্ফিং হাব: আজ ৯টি অনন্য অ্যাকাউন্ট থেকে মোট ৳৩,৮০,০০০ সংগ্রহ করেছে",
          score: 91,
        },
        {
          title: "উচ্চ গতির বহির্গামী লেনদেন স্পাইক",
          description: "৮ মিনিটের মধ্যে পরপর ৬টি দ্রুতগতির বহির্গামী লেনদেন নিষ্পত্তির চেষ্টা করা হয়েছে।",
          evidence: "গতিসীমা লঙ্ঘন: গ্রাহকের স্বাভাবিক গতি প্রতি ৪৮ ঘণ্টায় ১টি লেনদেন",
          score: 84,
        },
        {
          title: "মিউল সিন্ডিকেট চক্রের সাথে সান্নিধ্য",
          description: "প্রাপক ওয়ালেটটি চিহ্নিত মানি মিউল চক্র ১৭-এর মূল ক্যাশ-আউট অ্যাকাউন্টের সাথে ১-হপ দূরত্বে সংযুক্ত।",
          evidence: "ক্যাশ-আউট ওয়ালেট U-9288-এ অবিলম্বে টাকা স্থানান্তরের শিডিউল",
          score: 88,
        },
      ]
    : [
        {
          title: "Behavioral amount anomaly",
          description: "Transfer volume of ৳48,500 is 4.8× higher than customer U-1042's 30-day median.",
          score: 92,
          evidence: "30-day baseline: ৳6,800 · Maximum prior single transfer: ৳15,000",
        },
        {
          title: "Hardware device pairing mismatch",
          description: "Originating device DEV-8821 has zero historical pairing with customer U-1042.",
          score: 78,
          evidence: "Hardware fingerprint: Samsung S23 · Registered 12 minutes prior to transaction",
        },
        {
          title: "Beneficiary risk accumulation",
          description: "Recipient wallet U-8831 has confirmed topological ties to 4 flagged mule wallets.",
          score: 91,
          evidence: "Inbound smurfing hub: Aggregated ৳380,000 from 9 unique accounts today",
        },
        {
          title: "Rapid velocity burst",
          description: "Six consecutive outgoing fund transfers executed within an 8-minute window.",
          score: 84,
          evidence: "Rate limit threshold: Normal frequency is 1 transfer per 48 hours",
        },
        {
          title: "Topological syndicate proximity",
          description: "Target wallet is exactly one hop from organized money-mule syndicate Cluster #17.",
          score: 88,
          evidence: "Direct flow into liquidation wallet U-9288 scheduled in 14 minutes",
        },
      ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isBn ? "গভীর ব্যাখ্যাযোগ্যতা ও এক্সএআই ফিচার অ্যাট্রিবিউশন" : "EXPLAINABLE AI & FEATURE ATTRIBUTION"}</span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? "ঝুঁকি গোয়েন্দা ইঞ্জিন ও এক্সএআই বিশ্লেষণ" : "Risk Intelligence & Explainability"}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? `লেনদেন ${selectedTxnId}-এর প্রতিটি আচরণগত সংকেত এবং বাংলাদেশ ব্যাংক সার্কুলার নিয়মের অবদান বিশ্লেষণ।`
              : `Explainable AI (XAI) feature contribution breakdown and signal attribution for transaction ${selectedTxnId}.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTxnId}
            onChange={(e) => setSelectedTxnId(e.target.value)}
            className="field text-xs cursor-pointer font-mono font-semibold"
          >
            <option value="TXN-8F42">TXN-8F42 (৳48,500 - Critical 94)</option>
            <option value="TXN-92KD">TXN-92KD (৳32,000 - High 87)</option>
            <option value="TXN-37LM">TXN-37LM (৳76,200 - High 89)</option>
          </select>
        </div>
      </div>

      {/* Top Gauge + Factor Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Risk Gauge Card */}
        <div className="lg:col-span-4 card-base p-5 flex flex-col items-center justify-between text-center border border-slate-200 bg-white">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block font-mono">
              {isBn ? "গণনাকৃত সমন্বিত ঝুঁকি স্কোর" : "Calculated Risk Score"}
            </span>
            <span className="text-[11px] text-slate-400">
              {isBn ? "ডিটারমিনিস্টিক রুলস + নিউরাল নেট" : "Deterministic Rules + Neural ML"}
            </span>
          </div>

          {/* Semi-circle Gauge SVG */}
          <div className="relative w-52 h-28 my-3">
            <svg viewBox="0 0 220 125" className="w-full h-full">
              {/* Gauge Background Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Gauge Active Value Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#DC2626"
                strokeWidth="14"
                strokeDasharray="283"
                strokeDashoffset="18"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
              <span className="text-4xl font-extrabold text-rose-600 leading-none font-mono">
                {currentScore}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 font-mono">
                / 100 {currentThreat.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <span className="badge badge-critical text-xs px-3 py-1">
              {isBn ? "চরম ঝুঁকিপূর্ণ সতর্কতা" : `${currentThreat.toUpperCase()} RISK PRIORITY`}
            </span>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 pt-1">
              <Sparkles size={13} className="text-blue-600" />
              <span>
                {isBn ? "মডেল নির্ভুলতা: " : "AI Confidence: "}
                <b className="text-slate-900 font-bold font-mono">96%</b>
              </span>
            </div>
          </div>
        </div>

        {/* Feature Contribution Bars */}
        <div className="lg:col-span-8 card-base p-5 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isBn ? "ফিচার অবদান ও শ্যাপ (SHAP) অ্যাট্রিবিউশন" : "Feature Contribution Analysis (SHAP)"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "আচরণগত প্রতিটি প্যারামিটারের গাণিতিক প্রভাবের শতকরা হিসাব"
                  : "Mathematical contribution of individual behavioral vectors to the overall risk"}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              TreeSHAP v2.4 Engine
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {riskFactorsTXN8F42.map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{factor.name}</span>
                    <span className="text-[11px] text-slate-500">({factor.description})</span>
                  </div>
                  <b
                    className={`font-mono text-xs ${
                      factor.score >= 85
                        ? "text-rose-600"
                        : factor.score >= 70
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {factor.score}%
                  </b>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.score >= 85
                        ? "bg-rose-500"
                        : factor.score >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Reasoning and Recommended Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: AI Reasoning List */}
        <div className="lg:col-span-8 card-base p-5 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isBn ? "প্রমাণভিত্তিক সংকেত: লেনদেনটি কেন ঝুঁকিপূর্ণ?" : "Signal Attribution: Why is this transaction risky?"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "বাংলাদেশ এমএফএস আর্থিক অপরাধ শ্রেণিবিন্যাসের সাথে সরাসরি ম্যাপিং"
                  : "Structured evidentiary signals mapped directly to the financial crime taxonomy"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded font-mono font-semibold">
              <Sparkles size={12} />
              <span>EVIDENCE-GROUNDED</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {reasoningItems.map((item, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-slate-100 border border-slate-300 text-slate-800 font-bold text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <b className="text-slate-900 text-xs block">{item.title}</b>
                  <p className="text-slate-600 text-[11.5px] mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-50 border border-slate-200 p-1.5 rounded inline-block">
                    ↳ {isBn ? "প্রমাণ" : "Evidence"}: {item.evidence}
                  </p>
                </div>
                <div className="w-7 h-7 rounded border border-rose-200 bg-rose-50 text-rose-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recommended Analyst Action Card */}
        <div className="lg:col-span-4 card-base hover-lift p-5 flex flex-col justify-between border border-slate-200 bg-white">
          <div>
            <div className="w-9 h-9 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
              <AlertOctagon size={20} />
            </div>

            <div className="eyebrow text-rose-600">{isBn ? "অবিলম্বে পদক্ষেপ আবশ্যক" : "ACTION REQUIRED"}</div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {isBn ? "বিশ্লেষক অনুমোদন ও তহবিল স্থগিত" : "Escalate for Analyst Sanction"}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
              {isBn
                ? "একাধিক নির্ভরযোগ্য সংকেত নির্দেশ করে যে এটি সংগঠিত প্রতারণা ও মিউল অ্যাকাউন্টের মাধ্যমে অর্থ স্থানান্তরের ঘটনা। টাকা ছাড় করার পূর্বে গ্রাহকের বায়োমেট্রিক আঙুলের ছাপ যাচাই করুন।"
                : "Multiple high-confidence signals indicate coordinated fraud and money-mule activity. Verify customer ownership via biometric step-up before releasing held funds."}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "প্রস্তাবিত পদক্ষেপ" : "Recommended"}:</span>
                <span className="font-bold text-rose-700 font-mono">HOLD_SETTLEMENT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "বিএফআইইউ নোটিশ" : "BFIU Notice"}:</span>
                <span className="font-semibold text-slate-800">Mandatory SAR Draft</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                executeAnalystAction("INV-1042", "HOLD");
                onNotify(
                  isBn
                    ? "লেনদেনটি সফলভাবে স্থগিত (Hold) করা হয়েছে। অডিট লগ নথিভুক্ত।"
                    : "Settlement hold executed. Immutable audit logged."
                );
              }}
              className="w-full btn btn-action-hold text-xs flex items-center justify-center gap-1.5"
            >
              <Lock size={13} />
              <span>{t("actionHold")}</span>
            </button>
            <button
              onClick={() => {
                executeAnalystAction("INV-1042", "STEP_UP");
                onNotify(
                  isBn
                    ? "গ্রাহকের নিবন্ধিত সিমে বায়োমেট্রিক ২এফএ যাচাই পাঠানো হয়েছে।"
                    : "Biometric 2FA challenge dispatched to customer."
                );
              }}
              className="w-full btn btn-action-stepup text-xs flex items-center justify-center gap-1.5"
            >
              <UserCheck size={13} />
              <span>{t("actionStepUp")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
