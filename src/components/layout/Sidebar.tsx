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
  HelpCircle,
  LogOut,
  Globe,
  Sliders,
} from "lucide-react";
import { UserProfile } from "../auth/LoginPage";
import { useSentinel } from "@/context/SentinelContext";

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

interface NavGroup {
  sectionKey: string;
  items: {
    id: NavigationPage;
    labelKey: "navOverview" | "navTransactions" | "navRisk" | "navNetwork" | "navInvestigations" | "navCustomers" | "navAlerts" | "navAnalytics";
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  unreadAlertsCount,
  isOpen = false,
  onClose,
  onSettingsClick,
  onTourClick,
  onHelpClick,
  currentUser,
  onLogout,
}) => {
  const { language, toggleLanguage, t } = useSentinel();

  const navGroups: NavGroup[] = [
    {
      sectionKey: language === "bn" ? "ড্যাশবোর্ড ও নিরীক্ষণ" : "MONITORING & OVERVIEW",
      items: [
        { id: "overview", labelKey: "navOverview", icon: <LayoutGrid size={15} /> },
        { id: "transactions", labelKey: "navTransactions", icon: <Activity size={15} /> },
      ],
    },
    {
      sectionKey: language === "bn" ? "ঝুঁকি ও গোয়েন্দা তথ্য" : "INTELLIGENCE & DETECTION",
      items: [
        { id: "risk", labelKey: "navRisk", icon: <ShieldAlert size={15} /> },
        { id: "network", labelKey: "navNetwork", icon: <Share2 size={15} /> },
        { id: "alerts", labelKey: "navAlerts", icon: <Bell size={15} /> },
      ],
    },
    {
      sectionKey: language === "bn" ? "তদন্ত ও পরিচালনা" : "OPERATIONS & INVESTIGATIONS",
      items: [
        { id: "investigations", labelKey: "navInvestigations", icon: <Briefcase size={15} /> },
        { id: "customers", labelKey: "navCustomers", icon: <Users size={15} /> },
      ],
    },
    {
      sectionKey: language === "bn" ? "নিয়ন্ত্রণ ও বিএফআইইউ" : "BFIU GOVERNANCE & SAR",
      items: [
        { id: "analytics", labelKey: "navAnalytics", icon: <BarChart3 size={15} /> },
      ],
    },
  ];

  const handleNav = (page: NavigationPage) => {
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
        <div className="brand" onClick={() => handleNav("overview")}>
          <div className="brand-mark bg-blue-600 text-white rounded font-extrabold text-sm flex items-center justify-center">
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
              {language === "bn" ? "জালিয়াতি প্রতিরোধ প্ল্যাটফর্ম" : "BANGLADESH RISK CONSOLE"}
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

        {/* Language Switcher Bar in Sidebar */}
        <div className="my-2.5 px-2">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:scale-[0.985]"
          >
            <span className="flex items-center gap-1.5 text-[11.5px]">
              <Globe size={13} className="text-blue-600" />
              <span>{language === "bn" ? "ভাষা: বাংলা" : "Language: English"}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-blue-600 font-bold shadow-subtle">
              {language === "bn" ? "EN Switch" : "বাংলা সুইচ"}
            </span>
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto space-y-3 py-1 pr-1">
          {navGroups.map((group) => (
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
                      <span className="truncate flex-1">{t(item.labelKey)}</span>
                      {isAlert && <span className="nav-count">{unreadAlertsCount}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Operational Engine Health Status */}
        <div className="engine-status-box border border-slate-200 bg-slate-50">
          <div className="pulse bg-emerald-500" />
          <div className="min-w-0 flex-1">
            <b className="text-xs text-slate-800">
              {language === "bn" ? "ডিটারমিনিস্টিক ইঞ্জিন সক্রিয়" : "Deterministic Engine Online"}
            </b>
            <small className="text-[10px] text-slate-500 block truncate">
              {language === "bn" ? "বাংলাদেশ ব্যাংক BFIU সংযোগ চালু" : "BFIU Link & Rule Engine v2.4"}
            </small>
          </div>
        </div>

        {/* Analyst Profile & Sign Out */}
        <div className="analyst-profile border-t border-slate-200 pt-2">
          <div className="avatar bg-blue-50 text-blue-700 border border-blue-200">
            {currentUser?.avatar || "OP"}
          </div>
          <div className="min-w-0 flex-1">
            <b className="text-xs text-slate-800">{currentUser?.name || "Risk Analyst"}</b>
            <small className="text-[10px] text-slate-500">{currentUser?.role || "SOC Lead"}</small>
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
