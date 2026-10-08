"use client";

import React, { useState } from "react";
import { NavigationPage } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Share2,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
  Lock,
  Smartphone,
  Users,
  Store,
  Landmark,
} from "lucide-react";
import { BangladeshTransactionMap } from "./BangladeshTransactionMap";
import { BangladeshMuleGraph } from "./BangladeshMuleGraph";
import { fetchMoneyTrail, MoneyTrailStep } from "@/lib/backend-api";

interface FraudNetworkViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
  onNotify: (msg: string) => void;
}

export const FraudNetworkView: React.FC<FraudNetworkViewProps> = ({
  onNavigate,
  onOpenCase,
  onNotify,
}) => {
  const { language, t } = useSentinel();
  const [viewMode, setViewMode] = useState<"trail" | "map">("trail");
  const [trailModalOpen, setTrailModalOpen] = useState<boolean>(false);
  const [trailSteps, setTrailSteps] = useState<MoneyTrailStep[]>([]);
  const isBn = language === "bn";

  const handleOpenTrail = async () => {
    setTrailModalOpen(true);
    const steps = await fetchMoneyTrail("01712-894102");
    setTrailSteps(steps);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isBn ? "গ্রাফ টপোলজি ও মিউল সিন্ডিকেট গোয়েন্দা তথ্য" : "GRAPH TOPOLOGY & SYNDICATE DISCOVERY"}</span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? "এমএফএস মানি ট্রেইল ও মিউল নেটওয়ার্ক" : "MFS Money Trail & Fraud Network"}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? "চোরাই তহবিলের গতিপথ ও লেনদেন শৃঙ্খল ট্র্যাক করুন:"
              : "Sequential liquidation pipeline of illicit digital financial funds:"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Switcher: 2D Money Trail vs Geo Flow */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded p-0.5 text-xs">
            <button
              onClick={() => setViewMode("trail")}
              className={`px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "trail"
                  ? "bg-white text-blue-600 border border-slate-200 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Share2 size={13} />
              <span>{isBn ? "২ডি মানি ট্রেইল চক্র" : "2D Money Trail"}</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === "map"
                  ? "bg-white text-blue-600 border border-slate-200 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MapPin size={13} />
              <span>{isBn ? "বাংলাদেশ ভৌগোলিক প্রবাহ" : "Bangladesh Geo Flow"}</span>
            </button>
          </div>

          <button
            onClick={handleOpenTrail}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <Layers size={13} />
            <span>{isBn ? "হপ সিকোয়েন্স পরিদর্শন" : "Inspect Multi-Hop Trail"}</span>
          </button>

          <button
            onClick={() => onNavigate("investigations")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Briefcase size={13} />
            <span>{t("openDossier")}</span>
          </button>
        </div>
      </div>

      {/* 4-Stage MFS Money Trail Pipeline Grid with Arrows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
        {/* Stage 1: Victim Wallets */}
        <div className="relative bg-white border border-rose-200 rounded-xl p-3.5 shadow-none flex flex-col justify-between hover:border-rose-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase tracking-wider">
                {isBn ? "ধাপ ০১ • উৎস" : "STAGE 01 · ORIGIN"}
              </span>
              <div className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                <Smartphone size={13} />
              </div>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              {isBn ? "ভুক্তভোগী ওয়ালেট" : "Victim Wallets"}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              {isBn
                ? "ফিশিং পিন, ওটিপি ফাঁদ অথবা সিম সোয়াপিং এর মাধ্যমে প্রাথমিক ফান্ড হ্যাকিং।"
                : "Initial fund compromise via phished PINs, OTP traps, or SIM swap hijack."}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono">
            <span className="text-slate-400">{isBn ? "গড় ক্ষতি:" : "Avg Loss:"}</span>
            <b className="text-rose-600 font-extrabold">৳48,500</b>
          </div>
          {/* Connecting Arrow for Desktop */}
          <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-500 items-center justify-center shadow-sm">
            <ArrowRight size={13} className="text-blue-600" />
          </div>
        </div>

        {/* Stage 2: Intermediary Mule Conduits */}
        <div className="relative bg-white border border-indigo-200 rounded-xl p-3.5 shadow-none flex flex-col justify-between hover:border-indigo-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                {isBn ? "ধাপ ০২ • লেয়ারিং" : "STAGE 02 · LAYERING"}
              </span>
              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={13} />
              </div>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              {isBn ? "মিউল কনডুইট ওয়ালেট" : "Intermediary Mule Conduits"}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              {isBn
                ? "সুপ্ত স্টুডেন্ট ও সংগৃহীত অ্যাকাউন্টে দ্রুত মাল্টি-হপ ফ্যান-আউট স্থানান্তর।"
                : "Rapid multi-hop fan-out distribution across recruited student wallets."}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono">
            <span className="text-slate-400">{isBn ? "হপ গতি:" : "Hop Speed:"}</span>
            <b className="text-indigo-600 font-extrabold">4-6 hops &lt; 90s</b>
          </div>
          <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-500 items-center justify-center shadow-sm">
            <ArrowRight size={13} className="text-blue-600" />
          </div>
        </div>

        {/* Stage 3: Rogue Agent Points */}
        <div className="relative bg-white border border-amber-200 rounded-xl p-3.5 shadow-none flex flex-col justify-between hover:border-amber-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider">
                {isBn ? "ধাপ ০৩ • ক্যাশ-আউট" : "STAGE 03 · CASH-OUT"}
              </span>
              <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
                <Store size={13} />
              </div>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              {isBn ? "অসাধু এজেন্ট পয়েন্ট" : "Rogue Agent Points"}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              {isBn
                ? "অফ-আওয়ারে ভুয়া এনআইডি ও কমপ্লায়েন্স ফাঁকি দিয়ে একযোগে ভারী ক্যাশ-আউট।"
                : "Coordinated off-hour OTC cash extraction bypassing agent KYC checks."}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono">
            <span className="text-slate-400">{isBn ? "ক্যাশ ড্রেইন:" : "Extraction:"}</span>
            <b className="text-amber-700 font-extrabold">88% Night OTC</b>
          </div>
          <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-500 items-center justify-center shadow-sm">
            <ArrowRight size={13} className="text-blue-600" />
          </div>
        </div>

        {/* Stage 4: Underground Liquidation */}
        <div className="relative bg-white border border-purple-200 rounded-xl p-3.5 shadow-none flex flex-col justify-between hover:border-purple-400 transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase tracking-wider">
                {isBn ? "ধাপ ০৪ • পাচার" : "STAGE 04 · EXFILTRATION"}
              </span>
              <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center">
                <Landmark size={13} />
              </div>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              {isBn ? "অবৈধ চ্যানেল ও হুন্ডি" : "Underground Liquidation"}
            </h4>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              {isBn
                ? "ক্রিপ্টোকারেন্সি ও আন্তর্জাতিক হুন্ডি সিন্ডিকেটে অর্থ চূড়ান্ত পাচার।"
                : "Offshore conversion into cross-border Hawala/Hundi and P2P crypto."}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono">
            <span className="text-slate-400">{isBn ? "রিকভারি ঝুঁকি:" : "Recovery:"}</span>
            <b className="text-purple-700 font-extrabold">Black-box Siphon</b>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "trail" ? (
        <BangladeshMuleGraph onOpenCase={onOpenCase} onNotify={onNotify} />
      ) : (
        <BangladeshTransactionMap />
      )}

      {/* Multi-Hop Money Trail Modal */}
      {trailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block">
                  GRAPH DISCOVERY ENGINE
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isBn ? "মাল্টি-হপ ফান্ড ট্রেইল অনুক্রম" : "Multi-Hop Fund Liquidation Sequence"}
                </h3>
              </div>
              <button
                onClick={() => setTrailModalOpen(false)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              {trailSteps.map((step, idx) => (
                <div
                  key={step.hop}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                    {step.hop}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <b className="text-slate-900 font-semibold">{step.name}</b>
                      <span className="font-mono font-bold text-rose-600">৳{step.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{step.entity} &bull; {step.location}</span>
                      <span>{step.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-200/60 mt-1">
                      <span className="text-slate-600 font-medium">Channel: {step.channel}</span>
                      <span className="badge badge-high text-[9.5px]">Risk {step.riskScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-mono">
                Speed: 4 hops under 13 minutes
              </span>
              <button
                onClick={() => setTrailModalOpen(false)}
                className="btn btn-secondary text-xs"
              >
                Close Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
