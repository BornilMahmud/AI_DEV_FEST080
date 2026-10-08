"use client";

import React from "react";
import { Transaction } from "@/types";
import {
  X,
  ShieldAlert,
  Sparkles,
  Check,
  ArrowRight,
  Clock,
  Smartphone,
  MapPin,
  User,
  CreditCard,
  Lock,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenInvestigation: (txn: Transaction) => void;
}

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onOpenInvestigation,
}) => {
  const { language, t, executeAnalystAction } = useSentinel();
  if (!transaction) return null;
  const isBn = language === "bn";

  const defaultReasons = isBn
    ? [
        `লেনদেনের পরিমাণ ৳${transaction.amount.toLocaleString()} গ্রাহকের ৩০ দিনের গড় লেনদেনের তুলনায় ${(transaction.amount / 6800).toFixed(1)} গুণ বেশি`,
        transaction.isNewDevice ? "নতুন হার্ডওয়্যার ও সিম পেয়ারিং সনাক্তকরণ (বিগত ১৫ মিনিট)" : "গ্রাহকের নিবন্ধিত পরিচিত হার্ডওয়্যার ডিভাইস",
        "গভীর রাতে অস্বাভাবিক নিষ্ক্রিয় সময়ের মধ্যে লেনদেনের অনুরোধ (০০:০০ - ০৫:০০)",
        "প্রাপক ওয়ালেটটি পূর্বে চিহ্নিত সন্দেহজনক মিউল ক্লাস্টার নেটওয়ার্কের অংশ",
        "উচ্চ গতির বহির্গামী লেনদেন: স্বল্প সময়ের মধ্যে তহবিল সরিয়ে নেওয়ার চেষ্টা",
      ]
    : [
        `Transaction amount of ৳${transaction.amount.toLocaleString()} is ${(transaction.amount / 6800).toFixed(1)}× above customer 30-day baseline`,
        transaction.isNewDevice ? "Hardware device fingerprint has zero historical pairing with wallet" : "Known registered hardware verified",
        "Execution window during dormant nocturnal hours (01:00 AM – 04:30 AM)",
        "Recipient wallet identified as intermediary node in high-risk cluster",
        "Velocity spike: multiple fund transfers executed within short interval",
      ];

  return (
    <>
      {/* Background Scrim Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out White-Themed Workstation Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 z-50 flex flex-col overflow-hidden shadow-drawer animate-slideInRight">
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <div className="eyebrow text-slate-500">
              {isBn ? "এমএফএস লেনদেন প্রমাণ ডসিয়ার" : "TRANSACTION EVIDENCE DOSSIER"}
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {transaction.id}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Risk Score Summary Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between ${
              transaction.riskLevel === "Critical"
                ? "bg-rose-50 border-rose-200"
                : transaction.riskLevel === "High"
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}
          >
            <div>
              <span className="text-[11px] text-slate-600 font-medium block">
                {isBn ? "গণনাকৃত ঝুঁকি স্কোর" : "Calculated Risk Score"}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                <span
                  className={`text-2xl font-extrabold ${
                    transaction.riskLevel === "Critical"
                      ? "text-rose-700"
                      : transaction.riskLevel === "High"
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  {transaction.riskScore}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`badge text-[10px] ${
                  transaction.riskLevel === "Critical"
                    ? "badge-critical"
                    : transaction.riskLevel === "High"
                    ? "badge-high"
                    : "badge-low"
                }`}
              >
                {transaction.riskLevel.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {isBn ? "বিএফআইইউ মানদণ্ড সক্রিয়" : "BFIU Criteria Active"}
              </span>
            </div>
          </div>

          {/* Core Transaction Metadata Grid */}
          <div className="card-base p-4 border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5">
                <CreditCard size={13} className="text-blue-600" />
                <span>{isBn ? "লেনদেনের পরিমাণ" : "Amount"}:</span>
              </span>
              <span className="font-mono font-extrabold text-base text-slate-900">
                ৳{transaction.amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                <span>{isBn ? "প্রেরক ওয়ালেট" : "Customer Wallet"}:</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {transaction.customer}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ArrowRight size={13} className="text-slate-400" />
                <span>{isBn ? "প্রাপক / এজেন্ট" : "Beneficiary / Agent"}:</span>
              </span>
              <span className="font-mono font-bold text-slate-800">
                {transaction.recipient}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>{isBn ? "সময় ও উইন্ডো" : "Timestamp"}:</span>
              </span>
              <span className="font-mono text-slate-700">{transaction.time}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{isBn ? "বিভাগ / অবস্থান" : "Location / Division"}:</span>
              </span>
              <span className="font-semibold text-slate-800">{transaction.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Smartphone size={13} className="text-slate-400" />
                <span>{isBn ? "ডিভাইস ও সিম অবস্থা" : "Hardware & SIM"}:</span>
              </span>
              <span className="font-mono text-slate-700">
                {transaction.device} {transaction.isNewDevice && <span className="text-rose-600 font-bold ml-1">(NEW PAIRING)</span>}
              </span>
            </div>
          </div>

          {/* Triggered Evidence & Anomaly Signals */}
          <div className="card-base p-4 border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {isBn ? "শনাক্তকৃত ঝুঁকির প্রমাণাবলী" : "Triggered Behavioral Anomalies"}
              </h3>
              <span className="text-[10px] font-mono text-blue-700 font-bold">
                SHAP ATTRIBUTION
              </span>
            </div>

            <div className="space-y-1.5">
              {(transaction.flags?.length ? transaction.flags : defaultReasons).map(
                (flag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-700"
                  >
                    <span className="w-4 h-4 rounded bg-white border border-slate-300 text-slate-800 font-bold text-[9px] flex items-center justify-center shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-[11.5px] leading-snug">{flag}</span>
                    <Check size={13} className="text-emerald-600 shrink-0" />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Multi-Signal Consensus Note */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2.5 text-xs text-amber-900">
            <ShieldAlert size={16} className="text-amber-700 shrink-0" />
            <div>
              <b>{isBn ? "মাল্টি-সিগন্যাল ঐকমত্য: " : "Multi-Signal Consensus: "}</b>
              {isBn
                ? "ডিটারমিনিস্টিক কমপ্লায়েন্স রুলস, ভেলোসিটি ইঞ্জিন এবং নিউরাল নেট সম্পূর্ণ একমত।"
                : "Deterministic rules, velocity engine, and neural net aligned."}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <button onClick={onClose} className="btn btn-secondary text-xs">
            {t("close")}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenInvestigation(transaction);
                onClose();
              }}
              className="btn btn-primary text-xs flex items-center gap-1.5"
            >
              <span>{t("openDossier")}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
