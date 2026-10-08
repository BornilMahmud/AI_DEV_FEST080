"use client";

import React, { useState } from "react";
import { InvestigationCase, RiskLevel } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  ChevronRight,
  MoreVertical,
  Clock,
  User,
  ShieldAlert,
} from "lucide-react";

interface InvestigationsViewProps {
  onSelectCase: (caseItem: InvestigationCase) => void;
  onNewCaseModal: () => void;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({
  onSelectCase,
  onNewCaseModal,
}) => {
  const { cases, language } = useSentinel();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.reason.toLowerCase().includes(search.toLowerCase()) ||
      c.analyst.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "critical") return matchesSearch && c.riskLevel === "Critical";
    if (activeTab === "high") return matchesSearch && c.riskLevel === "High";
    if (activeTab === "assigned") return matchesSearch && c.analyst.includes("Arman");
    if (activeTab === "resolved") return matchesSearch && c.status === "Resolved";
    return matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {language === "bn"
              ? "তদন্ত ওয়ার্কস্টেশন • বিএফআইইউ রেগুলেটরি অডিট"
              : "CASE WORKSTATION • REGULATORY COMPLIANCE AUDIT"}
          </div>
          <h1 className="page-title text-slate-900">
            {language === "bn" ? "প্রতারণা ও ঝুঁকি কেস ডসিয়ার" : "Fraud Case Dossiers"}
          </h1>
          <p className="page-subtitle text-slate-500">
            {language === "bn"
              ? "চিহ্নিত কেসসমূহ যাচাই করুন, এআই প্রমাণের বিস্তারিত দেখুন এবং অডিট লগসহ কার্যকর পদক্ষেপ নিন।"
              : "Triage flagged cases, inspect AI evidence packages, and execute verified sanctions with tamper-evident audit logging."}
          </p>
        </div>
        <button
          onClick={onNewCaseModal}
          className="btn btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>{language === "bn" ? "+ নতুন তদন্ত শুরু করুন" : "+ New Investigation"}</span>
        </button>
      </div>

      {/* Tabs / Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: language === "bn" ? `সকল কেস (${cases.length})` : `All Open Cases (${cases.length})` },
          { id: "critical", label: language === "bn" ? `মারাত্মক অগ্রাধিকার (${cases.filter(c => c.riskLevel === "Critical").length})` : `Critical Priority (${cases.filter(c => c.riskLevel === "Critical").length})` },
          { id: "high", label: language === "bn" ? `উচ্চ ঝুঁকি (${cases.filter(c => c.riskLevel === "High").length})` : `High Risk (${cases.filter(c => c.riskLevel === "High").length})` },
          { id: "assigned", label: language === "bn" ? "আমার দায়িত্বে" : "Assigned to Me" },
          { id: "resolved", label: language === "bn" ? "নিষ্পত্তি / নিরাপদ" : "Resolved / Safe" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-blue-200 font-bold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="card-base table-card bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Meta & Filters */}
        <div className="table-meta flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 border-b border-slate-200 bg-white">
          <div className="field w-full sm:w-80 flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={language === "bn" ? "কেস আইডি, ওয়ালেট, কারণ বা বিশ্লেষক খুঁজুন..." : "Search case ID, wallet, reason, or analyst..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent w-full text-xs text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              {language === "bn" ? `${filteredCases.length} টি কেস রেকর্ড প্রদর্শিত` : `Showing ${filteredCases.length} case records`}
            </span>
          </div>
        </div>

        {/* Case Table */}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{language === "bn" ? "কেস আইডি" : "Case Identifier"}</th>
                <th>{language === "bn" ? "অগ্রাধিকার" : "Priority"}</th>
                <th>{language === "bn" ? "গ্রাহক ওয়ালেট" : "Subject Customer"}</th>
                <th>{language === "bn" ? "তহবিলের পরিমাণ" : "Disputed Exposure"}</th>
                <th>{language === "bn" ? "ঝুঁকির কারণ" : "Primary Threat Vector"}</th>
                <th>{language === "bn" ? "দায়িত্বপ্রাপ্ত" : "Assigned Lead"}</th>
                <th>{language === "bn" ? "স্ট্যাটাস" : "Workflow Status"}</th>
                <th>{language === "bn" ? "সর্বশেষ আপডেট" : "Last Update"}</th>
                <th className="text-right">{language === "bn" ? "পদক্ষেপ" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="mono font-bold text-slate-900 flex items-center gap-1.5">
                    <Briefcase size={13} className="text-emerald-700" />
                    <span>{c.id}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.riskLevel === "Critical"
                          ? "badge-critical"
                          : c.riskLevel === "High"
                          ? "badge-high"
                          : "badge-medium"
                      }`}
                    >
                      {c.riskLevel}
                    </span>
                  </td>
                  <td className="link font-mono">{c.customer}</td>
                  <td className="amount font-bold text-slate-900 font-mono">
                    ৳{(c.exposure || c.amount || 0).toLocaleString()}
                  </td>
                  <td className="text-slate-800 font-medium text-xs">{c.reason}</td>
                  <td className="text-slate-500 text-xs">{c.analyst}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold border ${
                        c.status === "Investigating"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : c.status === "Pending Review"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs font-mono">{c.updated}</td>
                  <td className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="btn btn-ghost text-xs p-1"
                      title="Inspect Case Dossier"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
