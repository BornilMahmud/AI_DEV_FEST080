"use client";

import React from "react";
import { NavigationPage } from "@/types";
import {
  ShieldCheck,
  LayoutGrid,
  Activity,
  ShieldAlert,
  Share2,
  Briefcase,
  Users,
  Bell,
  BarChart3,
  X,
  LogOut,
  Globe,
  Wallet,
  Cpu,
  Database,
  SlidersHorizontal,
  Lock,
  History,
  User,
} from "lucide-react";
import { UserProfile } from "../auth/LoginPage";
import { useSentinel } from "@/context/SentinelContext";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { canAccessPage, isRiskManager } from "@/lib/permissions";

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  unreadAlertsCount: number;
  isOpen?: boolean;
  onClose?: () => void;
  onSettingsClick?: () => void;
  onTourClick?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onHelpClick?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

interface NavItem {
  id: NavigationPage;
  labelEn: string;
  labelBn: string;
  icon: React.ReactNode;
}

interface NavGroup {
  sectionKey: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  unreadAlertsCount,
  isOpen = false,
  onClose,
  currentUser,
  onLogout,
}) => {
  const { language, toggleLanguage, t } = useSentinel();

  const isCustomerPortal = currentPage === "customer-portal";
  const isBn = language === "bn";
  const userRole = currentUser?.rawRole;
  const hasRiskAccess = isRiskManager(userRole);

  const adminNavGroups: NavGroup[] = [
    {
      sectionKey: isBn ? "অ্যাডমিন নিরাপত্তা স্যুট" : "ADMIN SECURITY SUITE",
      items: [
        { id: "overview", labelEn: "Fraud Control Center", labelBn: "জালিয়াতি কন্ট্রোল সেন্টার", icon: <ShieldAlert size={15} /> },
        { id: "transactions", labelEn: "Transaction Monitor", labelBn: "লেনদেন পর্যবেক্ষণ", icon: <Activity size={15} /> },
      ],
    },
    {
      sectionKey: isBn ? "জালিয়াতি গোয়েন্দা ও নেটওয়ার্ক" : "INTELLIGENCE & DETECTION",
      items: [
        { id: "risk", labelEn: "Risk Intelligence", labelBn: "ঝুঁকি গোয়েন্দা তথ্য", icon: <ShieldAlert size={15} /> },
        { id: "network", labelEn: "Fraud Ring Graph", labelBn: "জালিয়াতি নেটওয়ার্ক", icon: <Share2 size={15} /> },
        { id: "alerts", labelEn: "Alert Center", labelBn: "সতর্কবার্তা কেন্দ্র", icon: <Bell size={15} /> },
        { id: "security", labelEn: "Security Intelligence", labelBn: "নিরাপত্তা গোয়েন্দা", icon: <Lock size={15} /> },
      ],
    },
    {
      sectionKey: isBn ? "তদন্ত ও গ্রাহক গোয়েন্দা" : "OPERATIONS & INVESTIGATIONS",
      items: [
        { id: "investigations", labelEn: "Investigation Cases", labelBn: "তদন্ত ও মামলা", icon: <Briefcase size={15} /> },
        { id: "customers", labelEn: "Customer Risk Profile", labelBn: "গ্রাহক ঝুঁকি প্রোফাইল", icon: <Users size={15} /> },
        { id: "audit", labelEn: "Immutable Audit Trail", labelBn: "অডিট ট্রেইল", icon: <History size={15} /> },
      ],
    },
    {
      sectionKey: isBn ? "এমএল মডেল ও সিস্টেম পরিচালনা" : "ML MODELS & PLATFORM GOVERNANCE",
      items: [
        { id: "models", labelEn: "ML Model Registry", labelBn: "মেশিন লার্নিং মডেল", icon: <Cpu size={15} /> },
        { id: "datasets", labelEn: "Dataset Governance", labelBn: "ডেটাবেস গভর্নেন্স", icon: <Database size={15} /> },
        { id: "system-health", labelEn: "System Health & Latency", labelBn: "সিস্টেম স্বাস্থ্য ও স্ট্যাটাস", icon: <SlidersHorizontal size={15} /> },
        { id: "analytics", labelEn: "BFIU & SAR Analytics", labelBn: "বিএফআইইউ ও সার অ্যানালিটিক্স", icon: <BarChart3 size={15} /> },
      ],
    },
  ];

  // Filter groups according to RBAC permissions of the current role
  const filteredNavGroups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessPage(userRole, item.id)),
    }))
    .filter((group) => group.items.length > 0);

  const handleNav = (page: NavigationPage) => {
    if (!canAccessPage(userRole, page)) {
      return;
    }
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Scrim Backdrop */}
      <div
        className={`sidebar-scrim ${isOpen ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Main Navigation">
        {/* Brand Header */}
        <div
          className="brand cursor-pointer"
          onClick={() => handleNav(hasRiskAccess ? (isCustomerPortal ? "customer-portal" : "overview") : "customer-portal")}
        >
          <div className="brand-mark bg-blue-600 text-white rounded-lg font-extrabold text-sm flex items-center justify-center">
            u
          </div>
          <div className="min-w-0 flex-1">
            <div className="brand-name flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              upay <span className="text-blue-600">Sentinel</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                MFS
              </span>
            </div>
            <div className="brand-sub text-[9.5px] text-slate-500 font-medium tracking-wider">
              {!hasRiskAccess
                ? isBn
                  ? "গ্রাহক মোবাইল ওয়ালেট"
                  : "CUSTOMER MOBILE WALLET"
                : isBn
                ? "দ্বিপাক্ষিক MFS ও ঝুঁকি প্ল্যাটফর্ম"
                : "TWO-SIDED MFS ECOSYSTEM"}
            </div>
          </div>
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded"
              aria-label="Close menu"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Portal Switcher — ONLY visible for Risk Managers (Analyst & Admin) */}
        {hasRiskAccess && (
          <div className="my-2 px-1">
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1 text-[11px] font-bold">
              <button
                onClick={() => handleNav("customer-portal")}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isCustomerPortal
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title={isBn ? "গ্রাহক ওয়ালেট ও লেনদেন সেবা" : "Customer Wallet & Services"}
              >
                <Wallet size={13} className={isCustomerPortal ? "text-blue-600" : "text-slate-400"} />
                <span>{isBn ? "ওয়ালেট সেবা" : "Wallet"}</span>
              </button>
              <button
                onClick={() => handleNav("overview")}
                className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  !isCustomerPortal
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title={isBn ? "জালিয়াতি কন্ট্রোল সেন্টার" : "Fraud Control Center"}
              >
                <ShieldAlert size={13} className={!isCustomerPortal ? "text-blue-600" : "text-slate-400"} />
                <span>{isBn ? "কন্ট্রোল সেন্টার" : "Control Center"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Language Switcher Bar in Sidebar */}
        <div className="mb-2 px-1">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.985]"
          >
            <span className="flex items-center gap-1.5 text-[11.5px]">
              <Globe size={13} className="text-blue-600" />
              <span>{isBn ? "ভাষা: বাংলা" : "Language: English"}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-blue-600 font-bold shadow-subtle">
              {isBn ? "EN Switch" : "বাংলা সুইচ"}
            </span>
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto space-y-3 py-1 pr-1">
          {/* Customer Portal Link */}
          <div>
            <div className="nav-section-title text-[9.5px] font-bold text-slate-400 tracking-wider">
              {isBn ? "গ্রাহক সেবা ও পোর্টাল" : "CUSTOMER PORTAL"}
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNav("customer-portal")}
                className={`nav-item nav-customer-portal w-full text-left ${
                  isCustomerPortal ? "active" : ""
                }`}
                aria-current={isCustomerPortal ? "page" : undefined}
                title={isBn ? "ওয়ালেট ও লেনদেন সেবা" : "Upay MFS Wallet & Services"}
              >
                <Wallet size={15} className={isCustomerPortal ? "text-blue-600" : "text-slate-400"} />
                <span className="truncate flex-1 font-medium">
                  {isBn ? "ওয়ালেট ও লেনদেন সেবা" : "Upay MFS Wallet & Services"}
                </span>
              </button>

              <button
                onClick={() => handleNav("profile")}
                className={`nav-item nav-profile w-full text-left ${
                  currentPage === "profile" ? "active" : ""
                }`}
                aria-current={currentPage === "profile" ? "page" : undefined}
                title={isBn ? "প্রোফাইল ও পাসওয়ার্ড ড্যাশবোর্ড" : "Profile & Security Dashboard"}
              >
                <User size={15} className={currentPage === "profile" ? "text-blue-600" : "text-slate-400"} />
                <span className="truncate flex-1 font-medium">
                  {isBn ? "প্রোফাইল ও পাসওয়ার্ড" : "Profile & Security"}
                </span>
              </button>
            </div>
          </div>

          {/* If user is inside Customer Portal AND has Risk Access: Show link back to Fraud Control Center */}
          {isCustomerPortal && hasRiskAccess && (
            <div className="pt-2">
              <div className="nav-section-title text-[9.5px] font-bold text-slate-400 tracking-wider">
                {isBn ? "অ্যাডমিন নিরাপত্তা স্যুট" : "ADMIN SECURITY SUITE"}
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNav("overview")}
                  className="nav-item nav-overview w-full text-left hover:bg-slate-100"
                  title={isBn ? "জালিয়াতি কন্ট্রোল সেন্টারে প্রবেশ করুন" : "Open Fraud Control Center"}
                >
                  <ShieldAlert size={15} className="text-slate-400" />
                  <span className="truncate flex-1">
                    {isBn ? "জালিয়াতি কন্ট্রোল সেন্টার" : "Fraud Control Center"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Admin & Fraud SOC Navigation — Only rendered if user has Risk Access and not on Customer Portal */}
          {!isCustomerPortal && hasRiskAccess && (
            filteredNavGroups.map((group) => (
              <div key={group.sectionKey}>
                <div className="nav-section-title text-[9.5px] font-bold text-slate-400 tracking-wider">
                  {group.sectionKey}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentPage === item.id;
                    const isAlert = item.id === "alerts" && unreadAlertsCount > 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`nav-item nav-${item.id} w-full text-left ${
                          isActive ? "active" : ""
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span className="truncate flex-1">{isBn ? item.labelBn : item.labelEn}</span>
                        {isAlert && <span className="nav-count">{unreadAlertsCount}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Operational Engine Health Status */}
        <div className="engine-status-box border border-slate-200 bg-slate-50">
          <div className="pulse bg-emerald-500" />
          <div className="min-w-0 flex-1">
            <b className="text-xs text-slate-800">
              {!hasRiskAccess
                ? isBn
                  ? "ওয়ালেট সুরক্ষা সক্রিয়"
                  : "Wallet Shield Active"
                : isBn
                ? "দ্বিপাক্ষিক প্ল্যাটফর্ম অনলাইন"
                : "Two-Sided Platform Online"}
            </b>
            <small className="text-[10px] text-slate-500 block truncate">
              {!hasRiskAccess
                ? isBn
                  ? "সেন্টিনেল এআই সার্বক্ষণিক সুরক্ষিত"
                  : "Protected by Sentinel Engine"
                : isBn
                ? "গ্রাহক ওয়ালেট + এআই জালিয়াতি ইঞ্জিন"
                : "Wallet + Scikit & PyTorch Engine"}
            </small>
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="analyst-profile border-t border-slate-200 pt-2 flex items-center gap-2 group">
          <div
            onClick={() => handleNav("profile")}
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer hover:opacity-85 transition-all"
            title={isBn ? "প্রোফাইল ও পাসওয়ার্ড ড্যাশবোর্ডে যান" : "Open Profile & Security Dashboard"}
          >
            <UserAvatar user={currentUser} size={28} className="avatar shadow-xs" showBadge={true} />
            <div className="min-w-0 flex-1">
              <b className="text-xs text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                {currentUser?.name || "Authorized User"}
              </b>
              <small className="text-[10px] text-slate-500 truncate block">
                {currentUser?.role || "Verified User"}
              </small>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
