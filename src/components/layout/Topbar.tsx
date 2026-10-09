"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Bell,
  FileDown,
  Zap,
  Menu,
  ShieldCheck,
  Activity,
  LogOut,
  User,
  Globe,
  Wallet,
} from "lucide-react";
import { UserProfile } from "../auth/LoginPage";
import { useSentinel } from "@/context/SentinelContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { isRiskManager } from "@/lib/permissions";
import { NavigationPage } from "@/types";

interface TopbarProps {
  onOpenSimulation: () => void;
  onOpenReport: () => void;
  unreadCount: number;
  onNavigateAlerts: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onOpenHelp: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onNavigateCustomerPortal?: () => void;
  currentPage?: NavigationPage;
  onNavigateOverview?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSimulation,
  onOpenReport,
  unreadCount,
  onNavigateAlerts,
  searchQuery,
  setSearchQuery,
  onToggleSidebar,
  onOpenHelp,
  currentUser,
  onLogout,
  onNavigateCustomerPortal,
  currentPage,
  onNavigateOverview,
}) => {
  const { language, toggleLanguage, t } = useSentinel();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isRiskUser = isRiskManager(currentUser?.rawRole);
  const isCustomerPortal = currentPage === "customer-portal";

  return (
    <header className="topbar">
      {/* Mobile Hamburger & Brand Icon */}
      <div className="flex items-center gap-2">
        <button
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={16} />
        </button>

        {/* Global Search Input */}
        <div className="global-search" role="search">
          <Search size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder={
              !isRiskUser
                ? language === "bn"
                  ? "ওয়ালেট সেবা বা সাহায্য অনুসন্ধান করুন..."
                  : "Search wallet services or help..."
                : t("searchPlaceholder")
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Operational Indicators & Actions */}
      <div className="top-actions shrink-0">
        {/* Real-time Telemetry Status Badges */}
        <div
          className="telemetry-badge hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title={t("realtimeEngine")}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-emerald-700 whitespace-nowrap hidden 2xl:inline">
            {t("latencyOptimal")}
          </span>
          <span className="font-semibold text-emerald-700 whitespace-nowrap 2xl:hidden">
            {language === "bn" ? "< ২ms লেটেন্সি" : "< 2ms Latency"}
          </span>
        </div>

        {/* Bangladesh Bank Compliance Badge */}
        <div className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold whitespace-nowrap shrink-0">
          <ShieldCheck size={13} className="text-amber-600 shrink-0" />
          <span className="whitespace-nowrap">{t("bangladeshBankCompliance")}</span>
        </div>

        {/* English / বাংলা Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all"
          title="Toggle English / বাংলা"
          aria-label="Toggle language"
        >
          <Globe size={13} className="text-blue-600" />
          <span className={language === "en" ? "text-blue-600 font-extrabold" : "text-slate-500"}>
            EN
          </span>
          <span className="text-slate-300">/</span>
          <span className={language === "bn" ? "text-blue-600 font-extrabold" : "text-slate-500"}>
            বাংলা
          </span>
        </button>

        {/* Simulate Attack — Primary Testing CTA (Only for Risk Managers & Admins) */}
        {isRiskUser && (
          <button
            onClick={onOpenSimulation}
            className="btn btn-primary btn-simulate text-xs"
            aria-label="Open attack simulation workbench"
          >
            <Zap size={13} className="shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t("simulateScenario")}</span>
            <span className="sm:hidden">Sim</span>
          </button>
        )}

        {/* Audit Report Export (Only for Risk Managers & Admins) */}
        {isRiskUser && (
          <button
            onClick={onOpenReport}
            className="btn btn-secondary text-xs hidden md:inline-flex"
            aria-label="Export Bangladesh Bank BFIU STR Report"
          >
            <FileDown size={13} className="shrink-0" aria-hidden="true" />
            <span>{t("exportReport")}</span>
          </button>
        )}

        {/* Alert Notification Bell (Only for Risk Managers & Admins) */}
        {isRiskUser && (
          <button
            onClick={onNavigateAlerts}
            className={`icon-btn ${unreadCount > 0 ? "has-alert" : ""}`}
            aria-label={`View ${unreadCount} alerts`}
          >
            <Bell size={15} />
          </button>
        )}

        {/* Help Modal Trigger */}
        <button
          onClick={onOpenHelp}
          className="icon-btn"
          aria-label="Keyboard shortcuts and documentation"
          title="Help & Shortcuts (?)"
        >
          <HelpCircle size={15} />
        </button>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-md hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200 active:scale-95"
            aria-label="User profile options"
            aria-expanded={showUserMenu}
          >
            <UserAvatar user={currentUser} size={28} className="shadow-2xs" showBadge={true} />
            <ChevronDown size={12} className="text-slate-500 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white py-1.5 z-50 shadow-modal animate-scaleUp origin-top-right">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2.5">
                <UserAvatar user={currentUser} size={34} className="shadow-2xs" showBadge={true} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name || "Risk Analyst"}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email || "analyst@upay.com.bd"}
                  </div>
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[9px] font-bold border border-blue-200">
                    {currentUser?.badge || "SOC TIER-2"}
                  </span>
                </div>
              </div>

              {/* Risk managers can toggle between Admin Control Center and Wallet Preview */}
              {isRiskUser && (
                isCustomerPortal ? (
                  onNavigateOverview && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateOverview();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck size={13} className="text-blue-600" />
                      <span>{language === "bn" ? "জালিয়াতি কন্ট্রোল সেন্টার" : "Fraud Control Center"}</span>
                    </button>
                  )
                ) : (
                  onNavigateCustomerPortal && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigateCustomerPortal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Wallet size={13} className="text-blue-600" />
                      <span>{language === "bn" ? "ওয়ালেট ও লেনদেন সেবা" : "Wallet & Transactions"}</span>
                    </button>
                  )
                )
              )}

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenHelp();
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <HelpCircle size={13} className="text-slate-400" />
                <span>Documentation & Guide</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout?.();
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 border-t border-slate-100 mt-1"
              >
                <LogOut size={13} className="text-rose-500" />
                <span>Sign Out Console</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
