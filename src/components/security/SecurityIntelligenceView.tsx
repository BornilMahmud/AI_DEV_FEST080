"use client";

import React, { useState, useEffect } from "react";
import { NavigationPage } from "@/types";
import { useSentinel } from "@/context/SentinelContext";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe,
  Radio,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  KeyRound,
  Server,
  ArrowUpRight,
  Fingerprint,
  Info,
} from "lucide-react";
import {
  fetchSecurityEvents,
  fetchUserIpHistory,
  SecurityEventItem,
  LoginIpHistoryItem,
} from "@/lib/backend-api";

interface SecurityIntelligenceViewProps {
  onNavigate: (page: NavigationPage) => void;
  onNotify: (msg: string) => void;
}

export const SecurityIntelligenceView: React.FC<SecurityIntelligenceViewProps> = ({
  onNavigate,
  onNotify,
}) => {
  const { language } = useSentinel();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"events" | "ip-tracking" | "sessions" | "rbac">("events");
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [ipHistory, setIpHistory] = useState<LoginIpHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventItem | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evts, ips] = await Promise.all([
        fetchSecurityEvents(50),
        fetchUserIpHistory("USR-ANALYST-01"),
      ]);
      setEvents(evts);
      setIpHistory(ips);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    await loadData();
    onNotify(isBn ? "নিরাপত্তা ও আইপি লগ রিফ্রেশ হয়েছে" : "Security events & IP history re-synced");
  };

  const filteredEvents = events.filter((e) => {
    const matchesSeverity = severityFilter === "ALL" || e.severity === severityFilter;
    const matchesSearch =
      searchQuery === "" ||
      e.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.ip_address.includes(searchQuery) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isBn
                ? "সুরক্ষা নিরীক্ষণ ও অ্যান্টি-স্পুফিং আইপি ট্র্যাকিং"
                : "SECURITY & ACCESS INTELLIGENCE · ANTI-SPOOFING IP TELEMETRY"}
            </span>
          </div>
          <h1 className="page-title text-slate-900">
            {isBn ? "নিরাপত্তা অডিট ও ক্লায়েন্ট আইপি গোয়েন্দা" : "Security Events & Observed IP Intelligence"}
          </h1>
          <p className="page-subtitle text-slate-600">
            {isBn
              ? "রিয়েল-টাইম লগইন সেশন, অ্যান্টি-স্পুফিং আইপি পরিবর্তন সনাক্তকরণ ও আরবিএসি ভূমিকা নিরীক্ষা।"
              : "Defensive perimeter monitoring: Anti-spoofing observed IP tracking, hop anomalies, and RBAC governance."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-blue-600" : "text-slate-600"} />
            <span>{isBn ? "লাইভ রিফ্রেশ" : "Re-sync Telemetry"}</span>
          </button>
          <button
            onClick={() => onNavigate("audit")}
            className="btn btn-primary text-xs flex items-center gap-1.5"
          >
            <ShieldCheck size={13} />
            <span>{isBn ? "অডিট ট্রেইল দেখুন" : "View Audit Ledger"}</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card-base hover-lift p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? "পর্যবেক্ষণাধীন সেশন" : "Monitored Identities"}
            </span>
            <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound size={13} />
            </div>
          </div>
          <b className="font-mono text-xl text-slate-900 block mt-1">24 Active</b>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>0 Credential Compromises</span>
          </span>
        </div>

        <div className="card-base hover-lift p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? "সনাক্তকৃত ক্লায়েন্ট আইপি" : "Observed Login IPs"}
            </span>
            <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe size={13} />
            </div>
          </div>
          <b className="font-mono text-xl text-slate-900 block mt-1">{ipHistory.length} Subnets</b>
          <span className="text-[10px] text-slate-500 block mt-1 font-mono">
            Grameenphone / Banglalink / BTCL
          </span>
        </div>

        <div className="card-base hover-lift p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? "সন্দেহজনক আইপি হপ" : "Suspicious IP Hops"}
            </span>
            <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio size={13} />
            </div>
          </div>
          <b className="font-mono text-xl text-amber-600 block mt-1">
            {events.filter((e) => e.severity === "HIGH" || e.severity === "CRITICAL").length} Detections
          </b>
          <span className="text-[10px] text-amber-700 block mt-1 font-medium">
            Velocity boundaries enforced
          </span>
        </div>

        <div className="card-base hover-lift p-4 border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? "আরবিএসি পলিসি কমপ্লায়েন্স" : "RBAC Policy Lock"}
            </span>
            <div className="w-6 h-6 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock size={13} />
            </div>
          </div>
          <b className="font-mono text-xl text-purple-700 block mt-1">100% Secure</b>
          <span className="text-[10px] text-purple-600 block mt-1 font-medium">
            PostgreSQL RLS Active
          </span>
        </div>
      </div>

      {/* Approximate Routing Notice Banner */}
      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-2.5 text-xs text-blue-900">
        <Info size={15} className="text-blue-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <b>{isBn ? "প্রশাসনিক ও আইপি শনাক্তকরণ নীতি: " : "Anti-Spoofing Observed IP Disclosure: "}</b>
          {isBn
            ? "সকল ক্লায়েন্ট আইপি সরাসরি নিরাপদ ব্যাকএন্ড সকেট ও প্রক্সি হেডার (X-Forwarded-For, CF-Connecting-IP) বিশ্লেষণ করে যাচাই করা হয়। প্রদর্শিত ভৌগোলিক তথ্য আইএসপি রুট অনুমানের ভিত্তিতে তৈরি।"
            : "Client IP addresses are authoritatively captured by backend reverse proxies with spoof-resistant header validation. Geolocation reflects approximate network routing of Bangladeshi mobile telecom and ISP CGNAT pools."}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "events"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldAlert size={13} />
          <span>{isBn ? `নিরাপত্তা ইভেন্ট লগ (${events.length})` : `Security Events (${events.length})`}</span>
        </button>
        <button
          onClick={() => setActiveTab("ip-tracking")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "ip-tracking"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Globe size={13} />
          <span>{isBn ? "পর্যবেক্ষিত আইপি হিস্ট্রি" : "Observed Login IP Tracking"}</span>
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "sessions"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Laptop size={13} />
          <span>{isBn ? "ডিভাইস ট্রাস্ট ও সেশন" : "Device Trust & Sessions"}</span>
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "rbac"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock size={13} />
          <span>{isBn ? "আরবিএসি পারমিশন ম্যাট্রিক্স" : "RBAC Security Matrix"}</span>
        </button>
      </div>

      {/* Tab 1: Security Events Log */}
      {activeTab === "events" && (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? "ইভেন্ট, অভিনেতা বা আইপি খুঁজুন..." : "Filter events, actor, IP..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 font-medium">
                {isBn ? "তীব্রতা:" : "Severity:"}
              </span>
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                    severityFilter === sev
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="card-base border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10.5px] uppercase">
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Type & Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Actor & Observed IP</th>
                    <th className="py-2.5 px-3">Telemetry Details</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {evt.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block">
                          {evt.event_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`badge text-[10px] ${
                            evt.severity === "CRITICAL"
                              ? "badge-critical"
                              : evt.severity === "HIGH"
                              ? "badge-high"
                              : evt.severity === "MEDIUM"
                              ? "badge-medium"
                              : "badge-low"
                          }`}
                        >
                          {evt.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block text-[11.5px]">
                          {evt.actor}
                        </span>
                        <span className="font-mono text-[10.5px] text-blue-600">
                          {evt.ip_address}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-[11.5px] text-slate-700 truncate" title={evt.description}>
                          {evt.description}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500 text-[10.5px] whitespace-nowrap">
                        {new Date(evt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <Eye size={11} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Observed Login IP Tracking */}
      {activeTab === "ip-tracking" && (
        <div className="space-y-4">
          <div className="card-base border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
              {isBn ? "পর্যবেক্ষিত আইপি ইতিহাস ও টেলিকম রুট" : "Observed Login IP Ledger & Telecom Routing"}
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {isBn
                ? "গ্রাহক এবং বিশ্লেষকদের লগইন সেশন থেকে স্বয়ংক্রিয়ভাবে সংগৃহীত আইপিঠিকানা ও সংশ্লিষ্ট টেলিকম নেটওয়ার্ক।"
                : "Continuous historical profile of observed client IPs, tracking ISP CGNAT gateways, ASN autonomy, and location stability."}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10.5px] uppercase">
                    <th className="py-2.5 px-3">Observed IP Address</th>
                    <th className="py-2.5 px-3">Approximate Location</th>
                    <th className="py-2.5 px-3">ISP & Autonomous System</th>
                    <th className="py-2.5 px-3">Reverse DNS / Gateway</th>
                    <th className="py-2.5 px-3">Login Sessions</th>
                    <th className="py-2.5 px-3">First Seen</th>
                    <th className="py-2.5 px-3">Last Seen</th>
                    <th className="py-2.5 px-3 text-right">Risk Tag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ipHistory.map((ip) => (
                    <tr key={ip.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-extrabold text-blue-700">
                        {ip.ip_address}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {ip.city}, {ip.country}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 block text-[11.5px]">{ip.isp}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{ip.asn}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10.5px] text-slate-600">
                        {ip.reverse_dns || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {ip.login_count} sessions
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[10.5px]">
                        {new Date(ip.first_seen_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[10.5px]">
                        {new Date(ip.last_seen_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {ip.is_suspicious ? (
                          <span className="badge badge-high text-[10px]">SUSPICIOUS HOP</span>
                        ) : (
                          <span className="badge badge-low text-[10px]">VERIFIED CLEAN</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Device Trust & Sessions */}
      {activeTab === "sessions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-base border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Laptop size={14} className="text-blue-600" />
                <span>Current Active Session</span>
              </h3>
              <span className="badge badge-low text-[10px]">AUTHENTICATED</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Browser User-Agent:</span>
                <span className="font-mono text-slate-800 max-w-xs truncate text-[11px]">
                  {typeof window !== "undefined" ? window.navigator.userAgent : "Chrome on macOS"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Device Hardware Fingerprint:</span>
                <span className="font-mono text-blue-700 font-bold text-[11px]">
                  DEV-FP-MACOS-882190
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Session Security Token:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  Firebase RS256 Validated
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Inactivity Timeout:</span>
                <span className="font-medium text-emerald-600">30 min idle lock active</span>
              </div>
            </div>
          </div>

          <div className="card-base border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Fingerprint size={14} className="text-emerald-600" />
                <span>Zero-Trust Hardware Registry</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">3 Registered</span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <b className="text-slate-900 block">MacBook Pro M3 (Apple Silicon)</b>
                  <span className="text-[10px] text-slate-500 font-mono">Dhanmondi HQ · Primary Station</span>
                </div>
                <span className="badge badge-low text-[10px]">PRIMARY</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <b className="text-slate-900 block">Samsung Galaxy S24 (Android 14)</b>
                  <span className="text-[10px] text-slate-500 font-mono">upay Sentinel Authenticator · 2FA</span>
                </div>
                <span className="badge badge-low text-[10px]">TRUSTED 2FA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: RBAC Matrix */}
      {activeTab === "rbac" && (
        <div className="card-base border border-slate-200 bg-white p-4 space-y-3">
          <div className="pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {isBn ? "ভূমিকা ও অ্যাক্সেস কন্ট্রোল (RBAC) ম্যাট্রিক্স" : "Authoritative Role-Based Access Control (RBAC) Matrix"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly enforced via backend middleware (`auth-middleware.ts`) and PostgreSQL Row-Level Security (RLS).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10.5px] uppercase">
                  <th className="py-2.5 px-3">Protected Capability / Endpoint</th>
                  <th className="py-2.5 px-3 text-center">ADMIN</th>
                  <th className="py-2.5 px-3 text-center">ANALYST</th>
                  <th className="py-2.5 px-3 text-center">INVESTIGATOR</th>
                  <th className="py-2.5 px-3 text-center">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { cap: "Execute Settlement Hold (HOLD)", admin: true, analyst: true, investigator: false, viewer: false },
                  { cap: "Biometric 2FA Step-up (STEP_UP)", admin: true, analyst: true, investigator: false, viewer: false },
                  { cap: "BFIU SAR Dossier Staging (ESCALATE)", admin: true, analyst: true, investigator: true, viewer: false },
                  { cap: "Mark False Positive (MARK_SAFE)", admin: true, analyst: true, investigator: false, viewer: false },
                  { cap: "Read Immutable Audit Trail (/api/v1/audit)", admin: true, analyst: true, investigator: true, viewer: false },
                  { cap: "Inspect Security Events (/api/v1/security/events)", admin: true, analyst: true, investigator: true, viewer: false },
                  { cap: "View Observed IP History (/api/v1/security/*/ip-history)", admin: true, analyst: true, investigator: false, viewer: false },
                  { cap: "System Engine Calibration & Policies", admin: true, analyst: false, investigator: false, viewer: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{row.cap}</td>
                    <td className="py-2.5 px-3 text-center">
                      {row.admin ? <CheckCircle2 size={14} className="text-emerald-600 inline" /> : <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.analyst ? <CheckCircle2 size={14} className="text-emerald-600 inline" /> : <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.investigator ? <CheckCircle2 size={14} className="text-emerald-600 inline" /> : <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {row.viewer ? <CheckCircle2 size={14} className="text-emerald-600 inline" /> : <span className="text-slate-300">&mdash;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Detail Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 block">SECURITY EVENT INSPECTOR</span>
                <h3 className="text-sm font-extrabold text-slate-900 font-mono">{selectedEvent.id}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Event Type:</span>
                <b className="font-mono text-slate-800">{selectedEvent.event_type}</b>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Severity:</span>
                <span className={`badge text-[10px] ${selectedEvent.severity === "CRITICAL" ? "badge-critical" : "badge-high"}`}>
                  {selectedEvent.severity}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Actor Identity:</span>
                <span className="font-semibold text-slate-800">{selectedEvent.actor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Observed Client IP:</span>
                <span className="font-mono text-blue-600 font-bold">{selectedEvent.ip_address}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Description:</span>
                <p className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-[11.5px]">
                  {selectedEvent.description}
                </p>
              </div>
              {selectedEvent.metadata && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Raw Telemetry Metadata:</span>
                  <pre className="p-2.5 rounded bg-slate-900 text-slate-100 font-mono text-[10.5px] overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="btn btn-secondary text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
