"use client";

import React, { useState } from "react";
import { Transaction, RiskLevel } from "@/types";
import {
  Search,
  Filter,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";

interface TransactionMonitorViewProps {
  transactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenSimulation: () => void;
}

export const TransactionMonitorView: React.FC<TransactionMonitorViewProps> = ({
  transactions,
  onSelectTransaction,
  isStreaming,
  onToggleStreaming,
  onOpenSimulation,
}) => {
  const { language, t } = useSentinel();
  const [search, setSearch] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const isBn = language === "bn";

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.recipient.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.device.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      selectedRisk === "All" || t.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
    const matchesType = selectedType === "All" || t.type === selectedType;
    const matchesLocation =
      selectedLocation === "All" || t.location === selectedLocation;

    return matchesSearch && matchesRisk && matchesType && matchesLocation;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isBn ? "লাইভ এমএফএস ইনজেশন স্ট্রিম" : "REAL-TIME INGESTION ENGINE · TELEMETRY STREAM"}</span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? "লাইভ লেনদেন পর্যবেক্ষণ মনিটর" : "Transaction Monitor"}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? "রিয়েল-টাইম এমএফএস লেনদেন স্ক্রিনিং, সমন্বিত ঝুঁকি স্কোর এবং অনিয়ম সনাক্তকরণ।"
              : "Live digital financial stream inspection, composite multi-signal risk scores, and anomaly detection."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live Streaming Toggle */}
          <button
            onClick={onToggleStreaming}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            {isStreaming ? (
              <>
                <Pause size={13} className="text-amber-600" />
                <span>{isBn ? "স্ট্রিম বিরতি" : "Pause Stream"}</span>
              </>
            ) : (
              <>
                <Play size={13} className="text-emerald-600" />
                <span>{isBn ? "স্ট্রিম চালু" : "Resume Stream"}</span>
              </>
            )}
          </button>

          {/* Test Inject Vector CTA */}
          <button
            onClick={onOpenSimulation}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <Zap size={13} />
            <span>{isBn ? "আক্রমণ টেস্ট" : "Inject Vector"}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-base p-3 border border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box with crisp icon and border */}
          <div className="relative min-w-[250px] sm:min-w-[280px] flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
              <Search size={15} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder={isBn ? "ওয়ালেট, আইডি বা প্রাপক খুঁজুন..." : "Search wallet, TXN, recipient..."}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-8 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                title="Clear"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="field text-xs cursor-pointer font-medium"
          >
            <option value="All">{isBn ? "সকল ঝুঁকি মাত্রা" : "All Risk Levels"}</option>
            <option value="Critical">{isBn ? "চরম ঝুঁকি (Critical)" : "Critical Risk"}</option>
            <option value="High">{isBn ? "উচ্চ ঝুঁকি (High)" : "High Risk"}</option>
            <option value="Medium">{isBn ? "মাঝারি ঝুঁকি (Medium)" : "Medium Risk"}</option>
            <option value="Low">{isBn ? "স্বাভাবিক (Low)" : "Low Risk"}</option>
          </select>

          {/* Transaction Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="field text-xs cursor-pointer font-medium"
          >
            <option value="All">{isBn ? "সকল লেনদেনের ধরন" : "All Transaction Types"}</option>
            <option value="Wallet Transfer">{isBn ? "সেন্ড মানি (P2P)" : "Wallet Transfer"}</option>
            <option value="Cash Out">{isBn ? "এজেন্ট ক্যাশ আউট" : "Cash Out"}</option>
            <option value="Merchant Pay">{isBn ? "মার্চেন্ট পেমেন্ট" : "Merchant Pay"}</option>
            <option value="Add Money">{isBn ? "অ্যাড মানি" : "Add Money"}</option>
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCurrentPage(1);
            }}
            className="field text-xs cursor-pointer font-medium"
          >
            <option value="All">{isBn ? "সকল ৮টি বিভাগ" : "All 8 Divisions"}</option>
            <option value="Dhaka">{isBn ? "ঢাকা বিভাগ" : "Dhaka"}</option>
            <option value="Chattogram">{isBn ? "চট্টগ্রাম বিভাগ" : "Chattogram"}</option>
            <option value="Sylhet">{isBn ? "সিলেট বিভাগ" : "Sylhet"}</option>
            <option value="Rajshahi">{isBn ? "রাজশাহী বিভাগ" : "Rajshahi"}</option>
            <option value="Khulna">{isBn ? "খুলনা বিভাগ" : "Khulna"}</option>
          </select>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-500 font-mono">
          {filtered.length} {isBn ? "টি লেনদেন প্রদর্শিত" : "records matched"}
        </div>
      </div>

      {/* High-Density Transactions Table */}
      <div className="card-base border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[11px]">
                <th className="py-3 px-3">{t("colTxnId")}</th>
                <th className="py-3 px-3">{t("colCustomer")}</th>
                <th className="py-3 px-3">{t("colRecipient")}</th>
                <th className="py-3 px-3">{t("colAmount")}</th>
                <th className="py-3 px-3">{t("colType")}</th>
                <th className="py-3 px-3">{t("colDivision")}</th>
                <th className="py-3 px-3">{t("colDeviceSim")}</th>
                <th className="py-3 px-3">{t("colRiskScore")}</th>
                <th className="py-3 px-3">{t("colStatus")}</th>
                <th className="py-3 px-3 text-right">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => onSelectTransaction(txn)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 group"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {txn.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-800">
                    {txn.customer}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {txn.recipient}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    <span className={txn.amount >= 40000 ? "text-rose-600" : "text-slate-900"}>
                      ৳{txn.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {txn.type}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {txn.location}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-mono text-slate-500">
                      {txn.device} {txn.isNewDevice && <span className="text-rose-600 font-bold ml-1">(NEW)</span>}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`badge text-[10px] ${
                        txn.riskScore >= 90
                          ? "badge-critical"
                          : txn.riskScore >= 70
                          ? "badge-high"
                          : txn.riskScore >= 50
                          ? "badge-medium"
                          : "badge-low"
                      }`}
                    >
                      {txn.riskScore}/100
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-slate-700 font-medium">
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">
                    <span className="inline-flex items-center gap-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700 transition-all">
                      {isBn ? "বিবরণ →" : "Inspect →"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>
              {isBn
                ? `মোট ${filtered.length} টির মধ্যে ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filtered.length)} টি প্রদর্শিত`
                : `Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length} records`}
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{isBn ? "প্রতি পৃষ্ঠায়:" : "Per page:"}</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-7 px-1.5 text-xs rounded border border-slate-300 bg-white font-medium cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">
              {isBn
                ? `পৃষ্ঠা ${currentPage} / ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
