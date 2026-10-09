"use client";

import React, { useState } from "react";
import { AlertItem, NavigationPage, RiskLevel } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Bell,
  Search,
  Share2,
  ShieldAlert,
  Activity,
  Smartphone,
  Check,
  Eye,
  ArrowRight,
  Filter,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface AlertCenterViewProps {
  onNavigate: (page: NavigationPage) => void;
  onOpenCase: (caseId: string) => void;
  onNotify: (msg: string) => void;
}

export const AlertCenterView: React.FC<AlertCenterViewProps> = ({
  onNavigate,
  onOpenCase,
  onNotify,
}) => {
  const { alerts, markAlertAsRead, language } = useSentinel();
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");

  const filteredAlerts = alerts.filter(
    (a) => selectedSeverity === "All" || a.severity === selectedSeverity
  );

  const handleDismiss = (id: string) => {
    markAlertAsRead(id);
    onNotify(language === "bn" ? `অ্যালার্ট ${id} বাতিল করা হয়েছে` : `Alert ${id} acknowledged and dismissed.`);
  };

  const handleMarkAsRead = (id: string) => {
    markAlertAsRead(id);
    onNotify(language === "bn" ? `অ্যালার্ট ${id} পঠিত হিসেবে চিহ্নিত` : `Alert ${id} marked as read.`);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === "bn"
              ? "রিয়েল-টাইম সিগন্যাল ট্রিয়াজ • এসওসি অপারেশনস"
              : "REAL-TIME SIGNAL TRIAGE • SOC OPERATIONS"}
          </div>
          <h1 className="page-title text-slate-900">
            {language === "bn" ? "অ্যালার্ট ট্রিয়াজ সেন্টার" : "Alert Triage Center"}
          </h1>
          <p className="page-subtitle text-slate-500">
            {language === "bn"
              ? "রিস্ক ইঞ্জিন থেকে প্রাপ্ত ঝুঁকিপূর্ণ লেনদেনের সিগন্যাল পর্যবেক্ষণ, পর্যালোচনা ও পদক্ষেপ গ্রহণ করুন।"
              : "Triage, acknowledge, and escalate multi-signal fraud alerts emitted by the streaming risk engine."}
          </p>
        </div>
        <div className="live-label">
          <span className="pulse bg-rose-500" />
          <span className="text-slate-900 font-mono">
            {alerts.filter((a) => a.unread).length}{" "}
            {language === "bn" ? "টি অপঠিত গুরুতর অ্যালার্ট" : "UNREAD CRITICAL ALERTS"}
          </span>
        </div>
      </div>

      {/* Priority Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "All", labelEn: "All Priority", labelBn: "সকল অগ্রাধিকার", count: alerts.length },
          {
            key: "Critical",
            labelEn: "Critical Priority",
            labelBn: "মারাত্মক ঝুঁকি",
            count: alerts.filter((a) => a.severity === "Critical").length,
            activeColor: "bg-rose-600 text-white border-rose-600 shadow-sm",
            dotColor: "bg-rose-500",
          },
          {
            key: "High",
            labelEn: "High Priority",
            labelBn: "উচ্চ ঝুঁকি",
            count: alerts.filter((a) => a.severity === "High").length,
            activeColor: "bg-amber-600 text-white border-amber-600 shadow-sm",
            dotColor: "bg-amber-500",
          },
          {
            key: "Medium",
            labelEn: "Medium Priority",
            labelBn: "মধ্যম ঝুঁকি",
            count: alerts.filter((a) => a.severity === "Medium").length,
            activeColor: "bg-blue-600 text-white border-blue-600 shadow-sm",
            dotColor: "bg-blue-500",
          },
        ].map((tab) => {
          const isActive = selectedSeverity === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedSeverity(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                isActive
                  ? tab.activeColor || "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {tab.dotColor && !isActive && (
                <span className={`w-2 h-2 rounded-full ${tab.dotColor}`} />
              )}
              <span>{language === "bn" ? tab.labelBn : tab.labelEn}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert Cards List & Alert Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Alert Feed */}
        <div className="lg:col-span-8 space-y-2.5">
          {filteredAlerts.length === 0 ? (
            <div className="card-base p-8 text-center text-slate-400 border border-slate-200 bg-white rounded-xl">
              {language === "bn"
                ? "নির্বাচিত ফিল্টারে কোন অ্যালার্ট পাওয়া যায়নি।"
                : "No alerts match the selected priority filter."}
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <SpotlightCard
                key={alert.id}
                color={
                  alert.severity === "Critical"
                    ? "purple"
                    : alert.severity === "High"
                    ? "amber"
                    : "blue"
                }
                glowSize="small"
                lightsEdges={true}
                lag="short"
                className={`p-3.5 sm:p-4 transition-all border bg-white rounded-xl shadow-subtle hover-lift animate-fadeUp ${
                  alert.unread
                    ? "border-l-4 border-l-rose-500 border-slate-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 w-full">
                  {/* Left: Icon Badge + Content */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                        alert.severity === "Critical"
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : alert.severity === "High"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-blue-50 text-blue-600 border-blue-200"
                      }`}
                    >
                      {alert.iconType === "network" ? (
                        <Share2 size={18} />
                      ) : alert.iconType === "shield" ? (
                        <ShieldAlert size={18} />
                      ) : alert.iconType === "activity" ? (
                        <Activity size={18} />
                      ) : (
                        <Smartphone size={18} />
                      )}
                    </div>

                    {/* Copy Body */}
                    <div className="flex-1 min-w-0">
                      {/* Priority Tag, Time, Unread, Confidence */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            alert.severity === "Critical"
                              ? "bg-rose-100 text-rose-700 border-rose-300"
                              : alert.severity === "High"
                              ? "bg-amber-100 text-amber-700 border-amber-300"
                              : "bg-blue-100 text-blue-700 border-blue-300"
                          }`}
                        >
                          {alert.severity}
                        </span>

                        <span className="text-[11px] text-slate-400 font-mono">
                          {alert.timeAgo}
                        </span>

                        {alert.unread && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>UNREAD</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                          AI Confidence: <b className="text-slate-900 font-bold">{alert.confidence}%</b>
                        </span>
                      </div>

                      {/* Alert Title */}
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {alert.title}
                      </h3>

                      {/* Description */}
                      <p className="text-[11.5px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-2.5 mt-2 text-[10.5px] text-slate-400 font-mono">
                        <span className="font-semibold text-slate-500">{alert.id}</span>
                        <span>&bull;</span>
                        <span>Entity: <b className="text-slate-700">{alert.relatedId}</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center self-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      {language === "bn" ? "খারিজ" : "Dismiss"}
                    </button>
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
                      title={language === "bn" ? "পঠিত হিসেবে চিহ্নিত করুন" : "Mark as Read"}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => {
                        onOpenCase(alert.relatedId);
                        onNavigate("investigation");
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{language === "bn" ? "তদন্ত" : "Dossier"}</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))
          )}
        </div>

        {/* Right: Alert Summary */}
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="lg:col-span-4 p-4 flex flex-col justify-between space-y-4 border border-slate-200 bg-white rounded-xl shadow-subtle h-fit"
        >
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-200">
              {language === "bn" ? "২৪ ঘণ্টার সারসংক্ষেপ" : "24h Triage Rollup"}
            </h3>

            <div className="text-center py-3.5 border-b border-slate-200">
              <span className="text-3xl font-bold text-slate-900 block font-mono">
                284
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {language === "bn" ? "আজকের মোট শনাক্তকৃত সিগন্যাল" : "Total Signals Detected Today"}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { label: language === "bn" ? "মারাত্মক ঝুঁকি" : "Critical Priority", count: 12, pct: "4.2%", badge: "badge-critical" },
                { label: language === "bn" ? "উচ্চ ঝুঁকি" : "High Risk", count: 38, pct: "13.4%", badge: "badge-high" },
                { label: language === "bn" ? "মধ্যম সতর্কতা" : "Medium Warning", count: 96, pct: "33.8%", badge: "badge-medium" },
                { label: language === "bn" ? "তথ্যমূলক" : "Low Informational", count: 138, pct: "48.6%", badge: "badge-low" },
              ].map((row) => (
                <div key={row.label} className="py-2 flex items-center justify-between">
                  <span className={`badge ${row.badge} text-[9.5px]`}>
                    {row.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <b className="text-slate-900 font-mono text-xs">{row.count}</b>
                    <span className="text-slate-400 text-[10.5px] font-mono">({row.pct})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>{language === "bn" ? "গড় শনাক্তকরণ সময় (MTTD):" : "Mean Time to Detect (MTTD):"}</span>
              <b className="font-mono text-slate-900">1.2 sec</b>
            </div>
            <div className="flex justify-between">
              <span>{language === "bn" ? "বিশ্লেষক পর্যালোচনার সময়:" : "Analyst Triage Latency:"}</span>
              <b className="font-mono text-slate-900">4m 12s</b>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
