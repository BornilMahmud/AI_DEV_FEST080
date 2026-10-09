"use client";

import React, { useState, useEffect } from "react";
import { NavigationPage, Transaction, InvestigationCase } from "@/types";
import { SentinelProvider, useSentinel } from "@/context/SentinelContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { OverviewView } from "@/components/overview/OverviewView";
import { TransactionMonitorView } from "@/components/transactions/TransactionMonitorView";
import { TransactionDrawer } from "@/components/transactions/TransactionDrawer";
import { RiskIntelligenceView } from "@/components/risk/RiskIntelligenceView";
import { FraudNetworkView } from "@/components/network/FraudNetworkView";
import { InvestigationsView } from "@/components/investigations/InvestigationsView";
import { InvestigationDetailView } from "@/components/investigations/InvestigationDetailView";
import { CustomerIntelligenceView } from "@/components/customers/CustomerIntelligenceView";
import { AlertCenterView } from "@/components/alerts/AlertCenterView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { SimulationModal } from "@/components/simulation/SimulationModal";
import { ReportExportModal } from "@/components/report/ReportExportModal";
import { Toast } from "@/components/ui/Toast";
import { AppTour } from "@/components/ui/AppTour";
import { LoginPage, UserProfile } from "@/components/auth/LoginPage";
import { HelpModal } from "@/components/ui/HelpModal";
import { GlassAiChatbot } from "@/components/chat/GlassAiChatbot";
import { SentinelIntro } from "@/components/ui/SentinelIntro";
import { CustomerPortalView } from "@/components/customer/CustomerPortalView";
import { ModelManagementView } from "@/components/admin/ModelManagementView";
import { DatasetManagementView } from "@/components/admin/DatasetManagementView";
import { SystemHealthView } from "@/components/admin/SystemHealthView";
import { SecurityIntelligenceView } from "@/components/security/SecurityIntelligenceView";
import { ImmutableAuditView } from "@/components/audit/ImmutableAuditView";

function SentinelAppShell() {
  const {
    transactions,
    alerts,
    cases,
    selectedCase,
    selectedTransaction,
    setSelectedCase,
    setSelectedTransaction,
    isStreaming,
    toggleStreaming,
    unreadAlertsCount,
    injectScenario,
    language,
    toggleLanguage,
    t,
  } = useSentinel();

  const [currentPage, setCurrentPage] = useState<NavigationPage>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  // Restore session from localStorage on client mount & enforce white-theme
  useEffect(() => {
    setHasMounted(true);
    document.documentElement.classList.remove("dark");
    try {
      const seen = sessionStorage.getItem("sentinel_intro_seen");
      if (seen) {
        setShowIntro(false);
      }
      const saved = localStorage.getItem("sentinel_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        if (parsed.rawRole === "CUSTOMER") {
          setCurrentPage("customer-portal");
        }
      }
    } catch {
      // Fallback if localStorage unavailable
    }
  }, []);

  // Global '?' and 'L' shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        toggleLanguage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleLanguage]);

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("sentinel_user");
    } catch {
      // ignore
    }
    showNotification("Signed out of upay Sentinel Console");
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    setSelectedTransaction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Background stream simulator running through unified risk engine pipeline
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      const locations = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna"];
      const types = ["Wallet Transfer", "Cash Out", "Merchant Pay", "Add Money", "Mobile Recharge"] as const;
      const isAnomalous = Math.random() < 0.12; // 12% probability of an anomaly

      const randomAmount = isAnomalous
        ? Math.floor(Math.random() * 45000) + 25000
        : Math.floor(Math.random() * 4000) + 500;

      const randomCustNum = Math.floor(Math.random() * 9000) + 1000;
      const randomRecipNum = Math.floor(Math.random() * 9000) + 1000;
      const randomDev = isAnomalous
        ? `DEV-${Math.floor(Math.random() * 9000) + 1000}`
        : "DEV-2211";

      const streamTxnPartial: Partial<Transaction> = {
        id: `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        customer: `U-${randomCustNum}`,
        recipient: isAnomalous ? "U-8831" : `U-${randomRecipNum}`,
        amount: randomAmount,
        type: types[Math.floor(Math.random() * types.length)],
        device: randomDev,
        isNewDevice: isAnomalous,
        location: locations[Math.floor(Math.random() * locations.length)],
        isNewLocation: isAnomalous,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const resultTxn = await injectScenario(streamTxnPartial);

      if (resultTxn.riskLevel === "Critical") {
        showNotification(
          `Critical Risk Detected: ৳${resultTxn.amount.toLocaleString()} on ${resultTxn.customer} (Score: ${resultTxn.riskScore}/100)`
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isStreaming, injectScenario]);

  // Inject attack / custom transaction handler from Modal or Topbar
  const handleInjectTransaction = async (txnData: Partial<Transaction>) => {
    const injected = await injectScenario(txnData);
    showNotification(
      `Injected ${injected.riskLevel} Transaction: ৳${injected.amount.toLocaleString()} (Score: ${injected.riskScore}/100)`
    );
    setSelectedTransaction(injected);
  };

  if (hasMounted && !currentUser) {
    return (
      <>
        {showIntro && (
          <SentinelIntro
            onComplete={() => {
              try {
                sessionStorage.setItem("sentinel_intro_seen", "true");
              } catch {}
              setShowIntro(false);
            }}
          />
        )}
        <LoginPage
          onLogin={(profile) => {
            setCurrentUser(profile);
            try {
              localStorage.setItem("sentinel_user", JSON.stringify(profile));
            } catch {
              // ignore
            }
            if (profile.rawRole === "CUSTOMER") {
              setCurrentPage("customer-portal");
            } else {
              setCurrentPage("overview");
            }
            showNotification(`Welcome, ${profile.name} — Authenticated via Firebase`);
          }}
        />
      </>
    );
  }

  return (
    <div className="app flex min-h-screen bg-[var(--bg)]">
      {showIntro && (
        <SentinelIntro
          onComplete={() => {
            try {
              sessionStorage.setItem("sentinel_intro_seen", "true");
            } catch {}
            setShowIntro(false);
          }}
        />
      )}
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        unreadAlertsCount={unreadAlertsCount}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onTourClick={() => setIsTourOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Shell */}
      <div className="main-wrapper flex-1">
        {/* Topbar */}
        <Topbar
          onOpenSimulation={() => setIsSimModalOpen(true)}
          onOpenReport={() => setIsReportModalOpen(true)}
          unreadCount={unreadAlertsCount}
          onNavigateAlerts={() => handleNavigate("alerts")}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
          onOpenHelp={() => setIsHelpOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-5 md:p-7 max-w-[1600px] w-full mx-auto">
          {currentPage === "overview" && (
            <OverviewView
              onNavigate={handleNavigate}
              onOpenTransactionDrawer={(txn) => setSelectedTransaction(txn)}
              transactions={transactions}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          )}

          {currentPage === "transactions" && (
            <TransactionMonitorView
              transactions={transactions}
              onSelectTransaction={(txn) => setSelectedTransaction(txn)}
              isStreaming={isStreaming}
              onToggleStreaming={() => {
                toggleStreaming();
                showNotification(
                  isStreaming ? "Live simulation paused" : "Live simulation streaming resumed"
                );
              }}
              onOpenSimulation={() => setIsSimModalOpen(true)}
            />
          )}

          {currentPage === "risk" && (
            <RiskIntelligenceView
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}

          {currentPage === "network" && (
            <FraudNetworkView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
              onNotify={showNotification}
            />
          )}

          {currentPage === "investigations" && (
            <InvestigationsView
              onSelectCase={(c) => {
                setSelectedCase(c);
                handleNavigate("investigation");
              }}
              onNewCaseModal={() => {
                showNotification("New case wizard initiated. Auto-filling risk telemetry.");
                handleNavigate("investigation");
              }}
            />
          )}

          {currentPage === "investigation" && (
            <InvestigationDetailView
              caseData={selectedCase}
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}

          {currentPage === "customers" && (
            <CustomerIntelligenceView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
            />
          )}

          {currentPage === "alerts" && (
            <AlertCenterView
              onNavigate={handleNavigate}
              onOpenCase={() => handleNavigate("investigation")}
              onNotify={showNotification}
            />
          )}

          {currentPage === "analytics" && (
            <AnalyticsView
              onNavigate={handleNavigate}
              onOpenReport={() => setIsReportModalOpen(true)}
            />
          )}

          {currentPage === "customer-portal" && currentUser && (
            <CustomerPortalView
              currentUser={currentUser}
              onNavigateAdmin={() => handleNavigate("overview")}
              onLogout={handleLogout}
            />
          )}

          {currentPage === "security" && (
            <SecurityIntelligenceView
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}

          {currentPage === "models" && (
            <ModelManagementView onNotify={showNotification} />
          )}

          {currentPage === "datasets" && (
            <DatasetManagementView />
          )}

          {currentPage === "system-health" && (
            <SystemHealthView />
          )}

          {currentPage === "audit" && (
            <ImmutableAuditView
              onNavigate={handleNavigate}
              onNotify={showNotification}
            />
          )}
        </main>
      </div>

      {/* Slide-out Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onOpenInvestigation={(txn) => {
          setSelectedTransaction(null);
          const relatedCase = cases.find((c) => c.customer === txn.customer);
          if (relatedCase) setSelectedCase(relatedCase);
          handleNavigate("investigation");
          showNotification(`Opened Investigation workspace for ${txn.id}`);
        }}
      />

      {/* Simulation / Attack Injector Modal */}
      <SimulationModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onInjectTransaction={handleInjectTransaction}
      />

      {/* Export Report / Compliance Modal */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onNotify={showNotification}
      />

      {/* Toast Notification Container */}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Onboarding / App Tour */}
      <AppTour run={isTourOpen} onFinish={() => setIsTourOpen(false)} />

      {/* Centered Help & Shortcuts Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenSimulation={() => setIsSimModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              {language === "bn" ? "সিস্টেম ও রিস্ক ইঞ্জিন কনফিগারেশন" : "System & Engine Settings"}
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {language === "bn"
                ? "এআই আত্মবিশ্বাস সীমা, নোটিফিকেশন অ্যালার্ট ও বাংলাদেশ ব্যাংক বিএফআইইউ রেগুলেটরি সেটিং সামঞ্জস্য করুন।"
                : "Adjust AI confidence thresholds, configure notification alerts, and manage regulatory compliance endpoints."}
            </p>
            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {language === "bn" ? "এআই স্বয়ংক্রিয় সানকশন সেফগার্ড" : "AI Auto-Mitigation Safeguard"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === "bn" ? "ঝুঁকি স্কোর ৯০ অতিক্রম করলে লেনদেন অটোমেটিক ব্লক" : "Automatically block transactions exceeding Risk Score 90"}
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {language === "bn" ? "অপারেশনস সেন্টার ওয়েবহুক অ্যালার্ট" : "Operations Center Alerts"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === "bn" ? "মারাত্মক (CRITICAL) ঝুঁকির ক্ষেত্রে তাৎক্ষণিক ওয়েবহুক নোটিফিকেশন" : "Dispatch real-time webhooks for CRITICAL tier anomalies"}
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {language === "bn" ? "বাংলাদেশ ব্যাংক BFIU মিররিং" : "Bangladesh Bank BFIU Mirror"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === "bn" ? "অটোমেটিক মানি লন্ডারিং সন্দেহভাজন রিপোর্ট ড্রাফট তৈরি" : "Stream automated AML SAR drafts to secure regulator endpoint"}
                  </div>
                </div>
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="btn-secondary text-xs"
              >
                {language === "bn" ? "বাতিল" : "Close"}
              </button>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  showNotification(language === "bn" ? "কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে" : "Configuration saved successfully");
                }}
                className="btn-primary text-xs"
              >
                {language === "bn" ? "সংরক্ষণ করুন" : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Right-Side Glass Bubble AI Chatbot Demo */}
      <GlassAiChatbot
        onNavigate={setCurrentPage}
        onNotify={showNotification}
      />
    </div>
  );
}

export default function Home() {
  return (
    <SentinelProvider>
      <SentinelAppShell />
    </SentinelProvider>
  );
}
