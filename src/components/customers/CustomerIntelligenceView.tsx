"use client";

import React from "react";
import { NavigationPage } from "@/types";
import { customerU1042 } from "@/lib/data";
import { useSentinel } from "@/context/SentinelContext";
import {
  User,
  ShieldAlert,
  Smartphone,
  MapPin,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface CustomerIntelligenceViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
}

export const CustomerIntelligenceView: React.FC<CustomerIntelligenceViewProps> = ({
  onNavigate,
  onOpenCase,
}) => {
  const { language } = useSentinel();
  const customer = customerU1042;

  // 30 days transaction volume bars
  const volumeData = [
    22, 30, 18, 38, 45, 25, 32, 28, 48, 35, 20, 24, 30, 40, 27, 31, 42, 22, 34,
    38, 29, 45, 32, 21, 28, 40, 35, 88, 54, 96,
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === "bn"
              ? "গ্রাহক ৩৬০ • আচরণগত ঝুঁকি বিশ্লেষণ ও প্রোফাইলিং"
              : "CUSTOMER 360 • LONGITUDINAL BEHAVIORAL PROFILING"}
          </div>
          <h1 className="page-title text-slate-900">
            {language === "bn" ? "গ্রাহক ঝুঁকি ডসিয়ার" : "Customer Risk Dossier"}
          </h1>
          <p className="page-subtitle text-slate-500">
            {language === "bn"
              ? `৯০ দিনের স্বাভাবিক আচরণ, অস্বাভাবিক বিচ্যুতি এবং সিম/ডিভাইস ইতিহাস (ওয়ালেট: ${customer.id})`
              : `90-day behavioral baselines, deviation anomalies, and hardware pairing history for wallet ${customer.id}`}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 px-3.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-none select-none">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{language === "bn" ? "উচ্চ ঝুঁকি প্রোফাইল" : "HIGH RISK PROFILE"}</span>
          </div>
          <button
            onClick={() => onNavigate("investigation")}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-none"
          >
            <span>{language === "bn" ? "INV-1042 কেস খুলুন" : "Open Case INV-1042"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Profile Card */}
        <div className="lg:col-span-5 card-base p-4 flex items-center gap-3.5 border border-slate-200 bg-white">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <div className="eyebrow text-slate-400 text-[9.5px]">
              {language === "bn" ? "যাচাইকৃত এমএফএস অ্যাকাউন্ট" : "VERIFIED MFS ACCOUNT"}
            </div>
            <h2 className="text-base font-bold text-slate-900 truncate">{customer.name}</h2>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              <span>{customer.id}</span> &middot; <span>{customer.phone}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="badge badge-low text-[9px] flex items-center gap-1">
                <CheckCircle2 size={10} /> {language === "bn" ? "জাতীয় পরিচয়পত্র যাচাইকৃত" : "KYC Verified"}
              </span>
              <span className="text-[10.5px] text-slate-400">
                {language === "bn" ? "মার্চ ২০২২ থেকে সক্রিয়" : "Since March 2022"}
              </span>
            </div>
          </div>

          <div className="pl-3.5 border-l border-slate-200 text-center shrink-0">
            <span className="text-[9.5px] text-slate-400 uppercase font-mono font-semibold">
              {language === "bn" ? "ঝুঁকি স্কোর" : "Risk Score"}
            </span>
            <b className="text-2xl text-rose-600 block mt-0.5 font-mono font-black">
              <AnimatedNumber value={customer.riskScore} />
            </b>
            <span className="text-[9.5px] text-slate-400 font-mono">/ 100</span>
          </div>
        </div>

        {/* 5 Stats Grid - Numbers Big and Bold */}
        <div className="lg:col-span-7 card-base p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-center border border-slate-200 bg-white items-center">
          <div className="p-2 sm:px-2">
            <span className="text-[10.5px] text-slate-500 font-medium block">
              {language === "bn" ? "অ্যাকাউন্ট বয়স" : "Account Age"}
            </span>
            <b className="text-base sm:text-lg font-black text-slate-900 block mt-1 font-mono tracking-tight">{customer.accountAge}</b>
          </div>
          <div className="p-2 sm:px-2">
            <span className="text-[10.5px] text-slate-500 font-medium block">
              {language === "bn" ? "৩০ দিনের লেনদেন" : "30d Volume"}
            </span>
            <b className="text-base sm:text-lg font-black text-slate-900 block mt-1 font-mono tracking-tight">৳1.42M</b>
          </div>
          <div className="p-2 sm:px-2">
            <span className="text-[10.5px] text-slate-500 font-medium block">
              {language === "bn" ? "গড় লেনদেন" : "Avg Transfer"}
            </span>
            <b className="text-base sm:text-lg font-black text-slate-900 block mt-1 font-mono tracking-tight">৳6,800</b>
          </div>
          <div className="p-2 sm:px-2">
            <span className="text-[10.5px] text-slate-500 font-medium block">
              {language === "bn" ? "পরিচিত ডিভাইস" : "Known Devices"}
            </span>
            <b className="text-base sm:text-lg font-black text-slate-900 block mt-1 font-mono tracking-tight">
              2 <span className="text-xs font-bold text-slate-500">{language === "bn" ? "টি" : "Devices"}</span>
            </b>
          </div>
          <div className="p-2 sm:px-2">
            <span className="text-[10.5px] text-slate-500 font-medium block">
              {language === "bn" ? "পরিচিত এলাকা" : "Known Hubs"}
            </span>
            <b className="text-base sm:text-lg font-black text-slate-900 block mt-1 font-mono tracking-tight">
              3 <span className="text-xs font-bold text-slate-500">{language === "bn" ? "টি" : "Locations"}</span>
            </b>
          </div>
        </div>
      </div>

      {/* Baseline vs Deviations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Behavioral Baseline (90 days) */}
        <div className="lg:col-span-6 card-base p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {language === "bn" ? "৯০ দিনের আচরণগত বেসলাইন" : "Behavioral Baseline (90 Days)"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "bn"
                  ? "ঐতিহাসিক অভ্যাস ও স্বাভাবিক লেনদেন প্যাটার্ন"
                  : "Trained distribution profile across habit vectors"}
              </p>
            </div>
            <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-semibold">
              90-DAY WINDOW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <CreditCard size={13} className="text-emerald-600" />
                {language === "bn" ? "গড় লেনদেন" : "Average Transaction"}
              </span>
              <b className="text-sm font-bold text-slate-900 mt-1 block font-mono">৳6,800 BDT</b>
              <span className="text-[10px] text-slate-400 font-mono">Std dev &plusmn;৳2,100</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <Clock size={13} className="text-emerald-600" />
                {language === "bn" ? "সক্রিয় সময়" : "Active Hours"}
              </span>
              <b className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                10:00 AM – 09:00 PM
              </b>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === "bn" ? "রাত ১১টার পর কোন রেকর্ড নেই" : "0% historic activity past 11 PM"}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <Smartphone size={13} className="text-emerald-600" />
                {language === "bn" ? "বিশ্বস্ত ডিভাইস" : "Trusted Hardware"}
              </span>
              <b className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                DEV-2211 (iPhone)
              </b>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === "bn" ? "নভেম্বর ২০২৩ থেকে পেয়ার্ড" : "Paired since Nov 2023"}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-600" />
                {language === "bn" ? "প্রধান এলাকা" : "Primary Location"}
              </span>
              <b className="text-sm font-bold text-slate-900 mt-1 block">
                {language === "bn" ? "গুলশান, ঢাকা" : "Gulshan, Dhaka"}
              </b>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === "bn" ? "বিটিএস টাওয়ার আইডি #৪০৯২" : "Base cell tower ID #4092"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Recent Deviations */}
        <div className="lg:col-span-6 card-base p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {language === "bn" ? "সাম্প্রতিক আচরণগত বিচ্যুতি" : "Recent Behavioral Departures"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "bn"
                  ? "আইসোলেশন ফরেস্ট দ্বারা শনাক্তকৃত পরিসংখ্যানগত অসঙ্গতি"
                  : "Statistically significant deviations detected by Isolation Forest"}
              </p>
            </div>
            <span className="badge badge-high text-[9.5px]">
              3 {language === "bn" ? "টি অসঙ্গতি" : "ANOMALIES"}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-1">
            {customer.recentDeviations.map((dev, i) => (
              <div key={i} className="py-2.5 flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                    dev.severity === "Critical"
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-amber-50 text-amber-600 border-amber-200"
                  }`}
                >
                  !
                </div>
                <div className="flex-1 text-xs">
                  <b className="text-slate-900 block">{dev.title}</b>
                  <p className="text-slate-500 text-[11.5px]">{dev.value}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dev.timestamp}
                  </span>
                </div>
                <span
                  className={`badge ${
                    dev.severity === "Critical" ? "badge-critical" : "badge-high"
                  }`}
                >
                  {dev.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-Day Transaction Volume Timeline */}
      <div className="card-base p-4 border border-slate-200 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {language === "bn" ? "৩০ দিনের লেনদেন ভলিউম টাইমলাইন" : "30-Day Transaction Volume Timeline"}
            </h2>
            <p className="text-[11px] text-slate-500">
              {language === "bn"
                ? "২৮–৩০ তম দিনে হঠাৎ সন্দেহজনক অস্বাভাবিক লেনদেন বৃদ্ধি চিহ্নিত"
                : "Daily transaction volume highlighting recent anomalous surge on Day 28–30"}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              {language === "bn" ? "স্বাভাবিক দৈনিক পরিমাণ" : "Normal Daily Volume"}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              {language === "bn" ? "অস্বাভাবিক বৃদ্ধি (সতর্কবার্তা)" : "Flagged Anomaly Surge"}
            </span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-32 flex items-end gap-1 pt-4">
          {volumeData.map((h, i) => {
            const isFlagged = i >= 27;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[9.5px] py-0.5 px-2 rounded pointer-events-none transition-opacity font-mono z-10 whitespace-nowrap">
                  {language === "bn" ? `দিন ${i + 1}` : `Day ${i + 1}`}: ৳{(h * 500).toLocaleString()}
                </div>
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-sm transition-all ${
                    isFlagged
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[9.5px] text-slate-400 font-mono pt-2 border-t border-slate-100">
          <span>{language === "bn" ? "দিন ১ (৩০ দিন আগে)" : "Day 1 (30 days ago)"}</span>
          <span>{language === "bn" ? "দিন ১০" : "Day 10"}</span>
          <span>{language === "bn" ? "দিন ২০" : "Day 20"}</span>
          <span className="text-rose-600 font-bold">
            {language === "bn" ? "দিন ২৮–৩০ (বর্তমান অসঙ্গতি)" : "Day 28–30 (Current Anomaly)"}
          </span>
        </div>
      </div>
    </div>
  );
};
