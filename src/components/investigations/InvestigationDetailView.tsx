"use client";

import React, { useState } from "react";
import { InvestigationCase, NavigationPage } from "@/types";
import { evidenceTimelineINV1042 } from "@/lib/data";
import { SentinelAssistant } from "./SentinelAssistant";
import { useSentinel } from "@/context/SentinelContext";
import {
  ChevronRight,
  ShieldAlert,
  Users,
  Activity,
  Share2,
  DollarSign,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  History,
  Lock,
  PauseCircle,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface InvestigationDetailViewProps {
  caseData?: InvestigationCase;
  onNavigate: (page: NavigationPage) => void;
  onNotify: (msg: string) => void;
}

export const InvestigationDetailView: React.FC<InvestigationDetailViewProps> = ({
  caseData,
  onNavigate,
  onNotify,
}) => {
  const { executeAnalystAction, auditEvents, language, t } = useSentinel();
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "audit">("overview");
  const isBn = language === "bn";

  const activeCase = caseData || {
    id: "INV-1042",
    riskLevel: "Critical",
    customer: "01712-894102",
    amount: 48500,
    reason: isBn ? "মানি মিউল নেটওয়ার্ক ও অ্যাকাউন্ট দখল" : "Mule network & Account Takeover",
    analyst: "Arman Hossen",
    status: "Investigating",
    updated: "2 min ago",
    createdTime: "Today at 02:18 AM",
    exposure: 184000,
    transactionsCount: 27,
    networkConnections: 12,
    riskScore: 94,
    summary: isBn
      ? "গ্রাহক 01712-894102-এর ওয়ালেট থেকে রাত ০২:১৩ মিনিটে একটি নতুন অ্যান্ড্রয়েড ডিভাইস DEV-8821 দিয়ে অস্বাভাবিক ৳৪৮,৫০০ ট্রান্সফার করা হয়েছে। প্রাপক 01833-883100 পূর্বে চিহ্নিত মিউল সিন্ডিকেট চক্র ১৭-এর সাথে যুক্ত।"
      : "Customer U-1042 performed an unusually large transfer of ৳48,500 from a newly registered device DEV-8821 at 02:13 AM. The recipient U-8831 is connected to previously flagged transaction cluster #17.",
    recommendation: isBn
      ? "প্রাপক ওয়ালেটে টাকা ছাড় সাময়িক স্থগিত (Hold) রাখুন এবং গ্রাহকের সিমে অবিলম্বে বায়োমেট্রিক ২এফএ যাচাই সক্রিয় করুন।"
      : "Freeze pending outgoing transfers to recipient, initiate immediate biometric step-up verification on primary customer device.",
    confidence: 96,
  };

  const caseId = activeCase.id;
  const customer = activeCase.customer;
  const riskScore = activeCase.riskScore;
  const exposure = activeCase.exposure || activeCase.amount * 1.5;

  const caseAuditEvents = auditEvents.filter(
    (e) => e.relatedId === caseId || e.relatedId?.includes(customer) || e.details.includes(customer)
  );

  const handleAction = (
    action: "HOLD" | "STEP_UP" | "RELEASE" | "ESCALATE" | "MARK_SAFE",
    label: string
  ) => {
    executeAnalystAction(caseId, action);
    onNotify(`${label}. ${isBn ? "অপরিবর্তনীয় অডিট লগ নথিভুক্ত।" : "Immutable audit record logged."}`);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="case-breadcrumb flex items-center gap-1.5 text-xs text-slate-500">
        <span
          onClick={() => onNavigate("investigations")}
          className="cursor-pointer hover:underline hover:text-slate-800"
        >
          {t("navInvestigations")}
        </span>
        <ChevronRight size={12} className="text-slate-400" />
        <b className="text-slate-900 font-mono">{caseId}</b>
      </div>

      {/* Case Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>CASE DOSSIER &bull; AUDIT VERIFIED</span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? `তদন্ত কেস ডসিয়ার ${caseId}` : `Investigation ${caseId}`}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? `তৈরি: ${activeCase.createdTime} · সর্বশেষ আপডেট: ${activeCase.updated} (তদন্তকারী: ${activeCase.analyst})`
              : `Opened ${activeCase.createdTime} · Last updated ${activeCase.updated} by ${activeCase.analyst}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`badge text-xs px-2.5 py-1 ${
              activeCase.riskLevel === "Critical"
                ? "badge-critical"
                : activeCase.riskLevel === "High"
                ? "badge-high"
                : "badge-medium"
            }`}
          >
            {activeCase.riskLevel.toUpperCase()} PRIORITY
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold">
            Status: {activeCase.status}
          </span>
        </div>
      </div>

      {/* KPI Exposure Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
        >
          <span className="text-[11px] text-slate-500 block">{t("colCustomer")}</span>
          <b className="font-mono text-sm text-blue-600 block mt-1">{customer}</b>
        </SpotlightCard>
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
        >
          <span className="text-[11px] text-slate-500 block">{t("colRiskScore")}</span>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <AnimatedNumber value={riskScore} durationMs={350} className="text-sm font-bold text-rose-600" />
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </SpotlightCard>
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
        >
          <span className="text-[11px] text-slate-500 block">{isBn ? "মোট লেনদেন" : "Transactions"}</span>
          <b className="font-mono text-sm text-slate-800 block mt-1">{activeCase.transactionsCount} Txns</b>
        </SpotlightCard>
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
        >
          <span className="text-[11px] text-slate-500 block">{isBn ? "সিন্ডিকেট সংযোগ" : "Syndicate Ties"}</span>
          <b className="font-mono text-sm text-slate-800 block mt-1">{activeCase.networkConnections} Nodes</b>
        </SpotlightCard>
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="hover-lift p-3.5 border border-slate-200 bg-white rounded-xl shadow-subtle flex flex-col justify-between"
        >
          <span className="text-[11px] text-slate-500 block">{isBn ? "ঝুঁকিপূর্ণ আর্থিক এক্সপোজার" : "Capital Exposure"}</span>
          <b className="font-mono text-sm text-rose-600 block mt-1">৳{exposure.toLocaleString()}</b>
        </SpotlightCard>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === "overview"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isBn ? "প্রমাণ বিবরণ ও ওভারভিউ" : "Evidence Overview"}
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
            activeTab === "timeline"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {isBn ? "ঘটনার সময়রেখা (Timeline)" : "Incident Telemetry Timeline"}
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <History size={12} />
          <span>{isBn ? `অডিট ট্রেইল (${caseAuditEvents.length})` : `Audit Trail (${caseAuditEvents.length})`}</span>
        </button>
      </div>

      {/* Main 2-Column Workstation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Dossier Details */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === "overview" && (
            <>
              {/* Executive Summary Card */}
              <div className="card-base p-4 space-y-2 border border-slate-200 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="eyebrow text-slate-500">
                    {isBn ? "তদন্তকারী কর্মকর্তার সংক্ষিপ্ত বিবরণ" : "EXECUTIVE INCIDENT SUMMARY"}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeCase.reason}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{activeCase.summary}</p>
              </div>

              {/* Multi-Signal Breakdown Card */}
              <div className="card-base p-4 space-y-2.5 border border-slate-200 bg-white">
                <div className="eyebrow text-slate-500 pb-2 border-b border-slate-200">
                  {isBn ? "কাঠামোগত ঝুঁকির প্রমাণ সংকেত" : "STRUCTURED RISK EVIDENCE SIGNALS"}
                </div>
                <div className="space-y-2">
                  {[
                    {
                      signal: isBn ? "লেনদেনের পরিমাণ অস্বাভাবিক বৃদ্ধি" : "Transaction Amount Velocity Spike",
                      desc: isBn ? "পরিমাণটি গ্রাহকের ৩০ দিনের স্বাভাবিক লেনদেনের তুলনায় ৪.৮ গুণ বেশি।" : "Amount is 4.8× above customer 30-day baseline median of ৳6,800.",
                      score: 92,
                    },
                    {
                      signal: isBn ? "হার্ডওয়্যার ও সিম পেয়ারিং অমিল" : "Hardware Fingerprint Mismatch",
                      desc: isBn ? "নতুন ডিভাইস DEV-8821 লেনদেনের মাত্র ১২ মিনিট আগে প্রথম লগইন করেছে।" : "Device DEV-8821 first observed 12 minutes prior to transfer with zero wallet pairing history.",
                      score: 78,
                    },
                    {
                      signal: isBn ? "মিউল ক্লাস্টার ১৭-এর সাথে সংযোগ" : "Topological Mule Cluster Proximity",
                      desc: isBn ? "প্রাপক ওয়ালেটটি চিহ্নিত মানি মিউল চক্র ১৭-এর কনডুইট একাউন্ট।" : "Beneficiary wallet U-8831 is an intermediary conduit linked to Mule Syndicate Cluster #17.",
                      score: 91,
                    },
                    {
                      signal: isBn ? "গভীর রাতের ঝুঁকিপূর্ণ উইন্ডো" : "Nocturnal Dormant Hours Execution",
                      desc: isBn ? "লেনদেনটি রাত ০২:১৩ মিনিটে সংঘটিত হয় যখন গ্রাহকের কোনো পূর্ববর্তী লেনদেনের ইতিহাস নেই।" : "Executed at 02:13 AM. User has zero historic transactions between 11:30 PM and 7:00 AM.",
                      score: 74,
                    },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <b className="text-xs text-slate-900 block">{s.signal}</b>
                        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug">{s.desc}</p>
                      </div>
                      <span className="badge badge-critical text-[9.5px] shrink-0 font-mono">
                        {s.score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "timeline" && (
            <div className="card-base p-4 border border-slate-200 bg-white">
              <div className="eyebrow text-slate-500 pb-2.5 border-b border-slate-200">
                {isBn ? "ধারাবাহিক ঘটনাপঞ্জি (CHRONOLOGICAL TIMELINE)" : "CHRONOLOGICAL INCIDENT TELEMETRY"}
              </div>
              <div className="space-y-3 mt-3">
                {evidenceTimelineINV1042.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 relative pb-2">
                    <span className="text-[10px] text-slate-500 font-mono w-16 shrink-0 pt-0.5">
                      {ev.time}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        ev.isCritical ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="text-xs flex-1">
                      <b className={ev.isCritical ? "text-rose-700 font-bold" : "text-slate-900"}>
                        {ev.title}
                      </b>
                      <p className="text-slate-600 text-[11px] mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="card-base p-4 space-y-2.5 border border-slate-200 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <div className="eyebrow text-slate-500">
                    {isBn ? "অপরিবর্তনীয় সেশন অডিট ট্রেইল" : "IMMUTABLE SESSION AUDIT TRAIL"}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {isBn ? "মানব সিদ্ধান্ত ও পদক্ষেপ লগ" : "Human Decision & Action Log"}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  BFIU AUDIT COMPLIANT
                </span>
              </div>

              {caseAuditEvents.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">
                  {isBn
                    ? "এই কেসের জন্য এখনও কোনো ব্যবস্থা নেওয়া হয়নি। নিচের অ্যাকশন বার থেকে পদক্ষেপ নিন।"
                    : "No analyst interventions recorded yet for this case. Use the action bar below."}
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {caseAuditEvents.map((event) => (
                    <div key={event.id} className="py-2.5 space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-mono">{event.actor}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{event.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-snug">{event.details}</p>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        ID: {event.id} &middot; Type: {event.eventType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Recommended Intervention Banner */}
          <div className="card-base p-3.5 flex items-center justify-between gap-3 border border-blue-200 bg-blue-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="eyebrow text-blue-700 text-[9.5px]">
                  {isBn ? "এআই প্রস্তাবিত পদক্ষেপ" : "RECOMMENDED INTERVENTION"}
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isBn ? "তহবিল স্থগিত ও বায়োমেট্রিক চ্যালেঞ্জ" : "Settlement Quarantine & Biometric Challenge"}
                </h4>
                <p className="text-[11.5px] text-slate-700 mt-0.5">
                  {activeCase.recommendation}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-white text-slate-800 text-[10px] font-bold font-mono shrink-0 border border-slate-200">
              {activeCase.confidence}% Confidence
            </span>
          </div>
        </div>

        {/* Right Column: Sentinel Copilot Assistant */}
        <div className="lg:col-span-5">
          <SentinelAssistant
            caseId={caseId}
            customer={customer}
            onNotify={onNotify}
          />
        </div>
      </div>

      {/* Persistent Bottom Action Bar with Human Oversight Safeguards */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-drawer">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldAlert size={15} className="text-amber-600 shrink-0" />
          <span>
            <b className="text-slate-900">
              {isBn ? "হিউম্যান-ইন-দ্য-লুপ নীতি: " : "Human-in-the-Loop Safeguard: "}
            </b>
            {isBn
              ? "যেকোনো অ্যাকাউন্ট ব্লক বা অর্থ জব্দের ক্ষেত্রে অনুমোদিত বিশ্লেষকের নিশ্চিতকরণ আবশ্যক।"
              : "High-impact account sanctions require verified analyst confirmation."}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("MARK_SAFE", isBn ? "ভুয়া সতর্কবার্তা হিসেবে চিহ্নিত" : "Marked false positive")}
            className="btn btn-action-safe text-xs"
          >
            {isBn ? "ভুয়া সতর্কতা" : "False Positive"}
          </button>
          <button
            onClick={() => handleAction("STEP_UP", isBn ? "গ্রাহককে বায়োমেট্রিক ২এফএ পাঠানো হয়েছে" : "Biometric 2FA requested")}
            className="btn btn-action-stepup text-xs flex items-center gap-1"
          >
            <KeyRound size={12} />
            <span>{t("actionStepUp")}</span>
          </button>
          <button
            onClick={() => handleAction("HOLD", isBn ? "লেনদেন সফলভাবে স্থগিত রাখা হয়েছে" : "Settlement hold executed")}
            className="btn btn-action-hold text-xs flex items-center gap-1"
          >
            <PauseCircle size={13} />
            <span>{t("actionHold")}</span>
          </button>
          <button
            onClick={() => handleAction("RELEASE", isBn ? "কেস নিষ্পন্ন ও তহবিল অবমুক্ত" : "Case closed")}
            className="btn btn-action-release text-xs flex items-center gap-1"
          >
            <CheckCircle2 size={13} />
            <span>{isBn ? "কেস নিষ্পত্তি" : "Close Case"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
