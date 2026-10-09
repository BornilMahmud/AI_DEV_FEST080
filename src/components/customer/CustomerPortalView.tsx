"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Receipt,
  Building2,
  Globe2,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Laptop,
  MapPin,
  Eye,
  EyeOff,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
  ChevronRight,
  Download,
  Lock,
  LogOut,
  Info,
  CreditCard,
  History,
} from "lucide-react";
import { UserProfile } from "@/components/auth/LoginPage";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface CustomerPortalViewProps {
  currentUser: UserProfile;
  onNavigateAdmin?: () => void;
  onLogout?: () => void;
  onNotify?: (msg: string) => void;
}

interface WalletState {
  balance: number;
  currency: string;
  status: string;
  accountNumber: string;
}

interface TransactionItem {
  id: string;
  type: string;
  recipient: string;
  amount: number;
  fee: number;
  status: "COMPLETED" | "HELD" | "STEP_UP_REQUIRED" | "FAILED";
  timestamp: string;
  reference: string;
  riskLevel?: string;
  riskScore?: number;
}

interface SecurityInfo {
  observedIp: string;
  approximateLocation: string;
  currentDevice: string;
  lastLogin: string;
  sessions: Array<{
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    isCurrent: boolean;
  }>;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  currentUser,
  onNavigateAdmin,
  onLogout,
  onNotify,
}) => {
  // Wallet & Profile State
  const [wallet, setWallet] = useState<WalletState>({
    balance: currentUser.wallet?.balance ?? 25450.75,
    currency: "BDT",
    status: "ACTIVE",
    accountNumber: currentUser.phone || "+880 1712-345678",
  });
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Security info
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>({
    observedIp: "103.145.118.24",
    approximateLocation: "Dhaka, Bangladesh",
    currentDevice: typeof window !== "undefined" ? window.navigator.userAgent.split("(")[1]?.split(";")[0] || "Desktop PC" : "Chrome on Windows",
    lastLogin: new Date().toISOString(),
    sessions: [
      {
        id: "sess-curr",
        ipAddress: "103.145.118.24",
        userAgent: "Chrome 124 on Windows 11",
        createdAt: new Date().toISOString(),
        isCurrent: true,
      },
    ],
  });

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: "TXN-882194",
      type: "Send Money",
      recipient: "01799-882211 (Rahim)",
      amount: 1500,
      fee: 5,
      status: "COMPLETED",
      timestamp: "Today, 10:45 AM",
      reference: "Groceries refund",
      riskLevel: "Low",
      riskScore: 8,
    },
    {
      id: "TXN-881023",
      type: "Add Money",
      recipient: "City Bank (A/C: *4812)",
      amount: 10000,
      fee: 0,
      status: "COMPLETED",
      timestamp: "Yesterday, 04:20 PM",
      reference: "Salary top-up",
      riskLevel: "Low",
      riskScore: 4,
    },
    {
      id: "TXN-879412",
      type: "Mobile Recharge",
      recipient: "01819-334455 (Robi)",
      amount: 200,
      fee: 0,
      status: "COMPLETED",
      timestamp: "Yesterday, 01:10 PM",
      reference: "Data pack bundle",
      riskLevel: "Low",
      riskScore: 2,
    },
    {
      id: "TXN-876201",
      type: "Merchant Pay",
      recipient: "Shwapno Superstore",
      amount: 3250,
      fee: 0,
      status: "COMPLETED",
      timestamp: "07 Oct, 08:30 PM",
      reference: "POS QR Checkout",
      riskLevel: "Low",
      riskScore: 12,
    },
    {
      id: "TXN-874109",
      type: "Cash Out",
      recipient: "Agent 01911-002233",
      amount: 5000,
      fee: 74.5,
      status: "COMPLETED",
      timestamp: "06 Oct, 11:15 AM",
      reference: "ATM Cash Counter",
      riskLevel: "Medium",
      riskScore: 28,
    },
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionItem | null>(null);

  // Form State for active service
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    reference: "",
    channel: "BANK_TRANSFER",
    operator: "Grameenphone",
    biller: "DPDC (Electricity)",
    billAccount: "",
    bankName: "City Bank",
    sourceCountry: "United Arab Emirates",
  });
  const [txProcessing, setTxProcessing] = useState<boolean>(false);
  const [txResult, setTxResult] = useState<any | null>(null);

  // Fetch real security & wallet info on load
  useEffect(() => {
    async function loadCustomerData() {
      try {
        const token = currentUser.token;
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

        // 1. Fetch wallet
        const wRes = await fetch(`${backendUrl}/api/v1/me/wallet`, { headers });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.wallet) {
            setWallet({
              balance: Number(wData.wallet.balance),
              currency: wData.wallet.currency || "BDT",
              status: wData.wallet.status || "ACTIVE",
              accountNumber: currentUser.phone || "+880 1712-345678",
            });
          }
        }

        // 2. Fetch security telemetry (observed IP, approximate location)
        const sRes = await fetch(`${backendUrl}/api/v1/me/security`, { headers });
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.security) {
            setSecurityInfo((prev) => ({
              ...prev,
              observedIp: sData.security.observedIp || prev.observedIp,
              approximateLocation: sData.security.approximateLocation || prev.approximateLocation,
              currentDevice: sData.security.currentDevice?.browser
                ? `${sData.security.currentDevice.browser} on ${sData.security.currentDevice.os}`
                : prev.currentDevice,
            }));
          }
        }

        // 3. Fetch recent transactions
        const tRes = await fetch(`${backendUrl}/api/v1/me/transactions?limit=20`, { headers });
        if (tRes.ok) {
          const tData = await tRes.json();
          if (tData.transactions && tData.transactions.length > 0) {
            const mapped = tData.transactions.map((tx: any) => ({
              id: tx.transaction_reference || tx.id,
              type: tx.channel || tx.type || "Transfer",
              recipient: tx.receiver_phone_masked || tx.destination_account || "Recipient",
              amount: Number(tx.amount),
              fee: Number(tx.fee_amount || 0),
              status: tx.status === "COMPLETED" ? "COMPLETED" : tx.status === "HELD" ? "HELD" : "COMPLETED",
              timestamp: new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              reference: tx.reference_note || "MFS Transaction",
              riskScore: tx.risk_score,
              riskLevel: tx.risk_level,
            }));
            setTransactions(mapped);
          }
        }
      } catch (err) {
        console.warn("[CustomerPortal] Telemetry fallback active:", err);
      }
    }

    loadCustomerData();
  }, [currentUser]);

  // Handle service execution through backend fraud risk engine
  const handleExecuteService = async (serviceEndpoint: string, bodyPayload: any) => {
    setTxProcessing(true);
    setTxResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const token = currentUser.token;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${backendUrl}/api/v1/services/${serviceEndpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTxResult({
          status: data.status,
          decision: data.decision,
          transactionId: data.transaction?.id || `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          amount: bodyPayload.amount,
          recipient: bodyPayload.recipient || bodyPayload.destinationAccount || bodyPayload.billerCode || "Beneficiary",
          message: data.message,
          riskScore: data.riskAssessment?.overallScore || 12,
          riskLevel: data.riskAssessment?.decisionPolicy || "ALLOW",
          newBalance: data.wallet?.newBalance,
        });

        // Update balance if transaction allowed
        if (data.wallet?.newBalance !== undefined) {
          setWallet((prev) => ({ ...prev, balance: data.wallet.newBalance }));
        }

        // Add to local transactions
        const newTx: TransactionItem = {
          id: data.transaction?.id || `TXN-${Date.now().toString().slice(-6)}`,
          type: activeModal?.replace("-", " ").toUpperCase() || "Transaction",
          recipient: bodyPayload.recipient || bodyPayload.destinationAccount || "Upay Beneficiary",
          amount: Number(bodyPayload.amount),
          fee: data.transaction?.fee || 0,
          status: data.status === "COMPLETED" ? "COMPLETED" : "HELD",
          timestamp: "Just now",
          reference: bodyPayload.reference || "MFS Service Execution",
          riskScore: data.riskAssessment?.overallScore,
          riskLevel: data.riskAssessment?.decisionPolicy,
        };
        setTransactions((prev) => [newTx, ...prev]);

        if (onNotify) {
          onNotify(
            data.status === "COMPLETED"
              ? `Success: ৳${bodyPayload.amount} processed securely.`
              : `Security Alert: Transaction ${data.status} for verification.`
          );
        }
      } else {
        setTxResult({
          status: "FAILED",
          decision: "REJECT",
          message: data.error?.message || "Transaction could not be processed. Please try again.",
          riskLevel: "HIGH",
          riskScore: 85,
        });
      }
    } catch (err: any) {
      setTxResult({
        status: "FAILED",
        decision: "REJECT",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      setTxProcessing(false);
    }
  };

  // Revoke other sessions
  const handleRevokeOtherSessions = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const token = currentUser.token;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${backendUrl}/api/v1/me/sessions/revoke-others`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        if (onNotify) onNotify("All other active sessions have been safely revoked.");
        setSecurityInfo((prev) => ({
          ...prev,
          sessions: prev.sessions.filter((s) => s.isCurrent),
        }));
      }
    } catch (err) {
      console.warn("Session revocation error:", err);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "ALL") return matchesSearch;
    if (selectedFilter === "SEND") return matchesSearch && tx.type.toLowerCase().includes("send");
    if (selectedFilter === "ADD") return matchesSearch && tx.type.toLowerCase().includes("add");
    if (selectedFilter === "CASH_OUT") return matchesSearch && tx.type.toLowerCase().includes("cash");
    if (selectedFilter === "PAYMENT") return matchesSearch && tx.type.toLowerCase().includes("merchant");
    return matchesSearch;
  });

  return (
    <div className="w-full space-y-7 animate-fadeIn">
      {/* Simulation / Demo Environment Notice */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">DEMO / SIMULATION ENVIRONMENT:</strong> All external banking, card, and
            telecom services are simulated with live backend risk engine & ML fraud intelligence protection.
          </span>
        </div>
        {currentUser.rawRole && currentUser.rawRole !== "CUSTOMER" && onNavigateAdmin && (
          <button
            onClick={onNavigateAdmin}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px] transition-colors shrink-0 shadow-sm"
          >
            Switch to Admin Center
          </button>
        )}
      </div>

      {/* Top Wallet Overview Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Wallet Card */}
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="lg:col-span-2 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
        >
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Brand & KYC Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-lg text-white border border-white/20">
                u
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-200 font-semibold">upay Wallet</span>
                <div className="text-sm font-bold text-white leading-none">{currentUser.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>BFIU KYC Verified</span>
              </span>
              <button
                onClick={() => setIsSecurityCenterOpen(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors text-xs flex items-center gap-1"
                title="Open Security Center"
              >
                <Lock size={13} />
                <span className="text-[11px] hidden sm:inline">Security</span>
              </button>
            </div>
          </div>

          {/* Middle Row: Balance Display */}
          <div className="my-6 relative z-10">
            <div className="text-xs text-blue-200/90 font-medium flex items-center gap-2 mb-1">
              <span>Available Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-blue-300 hover:text-white transition-colors"
                title={showBalance ? "Hide Balance" : "Show Balance"}
              >
                {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {showBalance ? `৳ ${wallet.balance.toLocaleString("en-BD", { minimumFractionDigits: 2 })}` : "৳ ••••••••"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-200/80">BDT</span>
            </div>
            <div className="text-[11px] text-blue-200/70 mt-1 font-mono">
              A/C: {wallet.accountNumber} • Daily Limit: ৳50,000.00
            </div>
          </div>

          {/* Quick Action Shortcuts inside Wallet Card */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 relative z-10">
            <button
              onClick={() => {
                setActiveModal("send-money");
                setTxResult(null);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center gap-1 text-center"
            >
              <Send size={16} className="text-blue-200" />
              <span className="text-[11px] font-semibold">Send</span>
            </button>
            <button
              onClick={() => {
                setActiveModal("add-money");
                setTxResult(null);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center gap-1 text-center"
            >
              <ArrowDownLeft size={16} className="text-emerald-300" />
              <span className="text-[11px] font-semibold">Add Money</span>
            </button>
            <button
              onClick={() => {
                setActiveModal("cash-out");
                setTxResult(null);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center gap-1 text-center"
            >
              <ArrowUpRight size={16} className="text-amber-300" />
              <span className="text-[11px] font-semibold">Cash Out</span>
            </button>
            <button
              onClick={() => {
                setActiveModal("payment");
                setTxResult(null);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center gap-1 text-center"
            >
              <CreditCard size={16} className="text-purple-300" />
              <span className="text-[11px] font-semibold">Payment</span>
            </button>
          </div>
        </SpotlightCard>

        {/* Security Profile / Observed Telemetry Card */}
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Security Profile
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Protection
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Current observed login IP</div>
                  <div className="font-mono font-bold text-slate-900">{securityInfo.observedIp}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Approximate location: {securityInfo.approximateLocation}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <Laptop size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Current Device</div>
                  <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {securityInfo.currentDevice}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Fingerprint verified via session</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setIsSecurityCenterOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>View Full Security Center</span>
              <ChevronRight size={13} />
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </SpotlightCard>
      </div>

      {/* Full Core Customer Services Grid (Compact One Row) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Financial Services
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">9 Core MFS Services</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {/* 1. Send Money */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("send-money");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <Send size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Send Money</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">MFS Transfer</div>
            </div>
          </button>

          {/* 2. Cash Out */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("cash-out");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <ArrowUpRight size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Cash Out</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Agent & ATM</div>
            </div>
          </button>

          {/* 3. Add Money */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("add-money");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <ArrowDownLeft size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Add Money</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Bank & Card</div>
            </div>
          </button>

          {/* 4. Payment */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("payment");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
              <CreditCard size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Payment</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Merchant QR</div>
            </div>
          </button>

          {/* 5. Mobile Recharge */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("recharge");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shrink-0">
              <Smartphone size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Recharge</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">All BD Telcos</div>
            </div>
          </button>

          {/* 6. Pay Bill */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("pay-bill");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white transition-all shrink-0">
              <Receipt size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Pay Bill</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Utility Bills</div>
            </div>
          </button>

          {/* 7. Bank Transfer */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("bank-transfer");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
              <Building2 size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Bank Transfer</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">NPSB / BEFTN</div>
            </div>
          </button>

          {/* 8. Remittance */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("remittance");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white transition-all shrink-0">
              <Globe2 size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">Remittance</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Inbound Remit</div>
            </div>
          </button>

          {/* 9. QR Payment */}
          <button
            type="button"
            onClick={() => {
              setActiveModal("qr-pay");
              setTxResult(null);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 hover:border-violet-400 hover:bg-violet-50/20 hover:shadow-xs active:scale-[0.97] transition-all flex flex-col items-center justify-center text-center gap-1.5 group cursor-pointer w-full"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
              <QrCode size={15} />
            </div>
            <div className="w-full">
              <div className="text-[11px] font-bold text-slate-900 truncate">QR Pay</div>
              <div className="text-[9.5px] text-slate-400 truncate hidden xl:block">Bangla QR</div>
            </div>
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Your recent financial activity secured by Upay Sentinel</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setSelectedFilter("ALL")}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedFilter === "ALL" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("SEND")}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedFilter === "SEND" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                Send
              </button>
              <button
                onClick={() => setSelectedFilter("ADD")}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedFilter === "ADD" ? "bg-white text-blue-700 shadow-sm" : "hover:text-slate-900"
                }`}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Recipient / Channel</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{tx.type}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-semibold">{tx.recipient}</div>
                      <div className="text-[10px] text-slate-400">{tx.reference}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{tx.timestamp}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          tx.type.toLowerCase().includes("add") ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {tx.type.toLowerCase().includes("add") ? "+ " : "- "}৳{" "}
                        {tx.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                      </span>
                      {tx.fee > 0 && <div className="text-[10px] text-slate-400">Fee: ৳{tx.fee}</div>}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          <Clock size={11} className="text-amber-600" />
                          <span>Under Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SERVICE MODAL: SEND MONEY */}
      {activeModal === "send-money" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Send size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Send Money</h3>
                  <p className="text-[11px] text-slate-500">Transfer to any Upay or MFS recipient</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                    txResult.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {txResult.status === "COMPLETED" ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {txResult.status === "COMPLETED" ? "Transfer Successful!" : "Security Verification Required"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{txResult.message}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-left border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-800">{txResult.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient:</span>
                    <span className="font-semibold text-slate-800">{txResult.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-bold text-slate-900">৳ {txResult.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <span className="font-semibold text-emerald-600">
                      Score: {txResult.riskScore}/100 ({txResult.riskLevel})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("send-money", {
                    recipient: formData.recipient,
                    amount: Number(formData.amount),
                    reference: formData.reference,
                    channel: "WALLET_TRANSFER",
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recipient Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="01712-345678"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="50000"
                    placeholder="৳ 500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Available balance: ৳ {wallet.balance.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reference Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner share"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                  <span>Transaction evaluated in real time by AI Behavioral & Anomaly Engine.</span>
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying Risk Engine...</span>
                    </>
                  ) : (
                    <span>Confirm & Send Money</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: CASH OUT */}
      {activeModal === "cash-out" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cash Out</h3>
                  <p className="text-[11px] text-slate-500">Agent Counter or ATM cash withdrawal</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Cash Out Authorized</h4>
                <p className="text-xs text-slate-500">{txResult.message}</p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-left border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Agent Number:</span>
                    <span className="font-semibold text-slate-800">{txResult.recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Withdrawal Amount:</span>
                    <span className="font-bold text-slate-900">৳ {txResult.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee (1.49%):</span>
                    <span className="text-slate-800">৳ {(Number(txResult.amount) * 0.0149).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("cash-out", {
                    agentPhone: formData.recipient,
                    amount: Number(formData.amount),
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Agent Phone / QR Code</label>
                  <input
                    type="text"
                    required
                    placeholder="01911-223344"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="৳ 2000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Cash Out Fee: 1.49% (৳ {(Number(formData.amount || 0) * 0.0149).toFixed(2)})</span>
                    <span>Max: ৳ 25,000 / txn</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Confirm Cash Out</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: ADD MONEY */}
      {activeModal === "add-money" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ArrowDownLeft size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Money (Simulation)</h3>
                  <p className="text-[11px] text-slate-500">Fund wallet from Bank or Card</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <strong>DEMO SIMULATION:</strong> No real bank account will be charged. This simulates an instant Bank-to-Wallet or Card funding channel.
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Funds Added Successfully</h4>
                <p className="text-xs text-slate-500">৳ {txResult.amount} has been deposited to your wallet.</p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("add-money", {
                    sourceChannel: formData.channel,
                    amount: Number(formData.amount),
                    reference: "Add Money Demo",
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Funding Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank-to-Wallet (City Bank / BRAC Bank / EBL)</option>
                    <option value="VISA_MASTERCARD">Debit / Credit Card (Visa & Mastercard)</option>
                    <option value="AMEX">American Express (City Bank Gateway)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deposit Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="৳ 5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Simulate Add Money</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: PAYMENT / MERCHANT PAY */}
      {activeModal === "payment" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Merchant Payment</h3>
                  <p className="text-[11px] text-slate-500">Pay retail stores, restaurants, or web merchants</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Payment Completed</h4>
                <p className="text-xs text-slate-500">৳ {txResult.amount} paid to {txResult.recipient}.</p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("payment", {
                    merchantId: formData.recipient,
                    amount: Number(formData.amount),
                    reference: formData.reference || "Retail Checkout",
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Merchant Number / Account</label>
                  <input
                    type="text"
                    required
                    placeholder="01700-112233 or MERCH-9921"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="৳ 1200"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Confirm Payment</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: MOBILE RECHARGE */}
      {activeModal === "recharge" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Smartphone size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mobile Recharge</h3>
                  <p className="text-[11px] text-slate-500">Recharge any prepaid/postpaid number in Bangladesh</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Recharge Successful</h4>
                <p className="text-xs text-slate-500">৳ {txResult.amount} sent to {txResult.recipient}.</p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("recharge", {
                    phone: formData.recipient,
                    operator: formData.operator,
                    amount: Number(formData.amount),
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telecom Operator</label>
                  <select
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Grameenphone">Grameenphone (017, 013)</option>
                    <option value="Robi">Robi Axiata (018)</option>
                    <option value="Banglalink">Banglalink (019, 014)</option>
                    <option value="Teletalk">Teletalk (015)</option>
                    <option value="Airtel">Airtel (016)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="01712-345678"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recharge Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="20"
                    placeholder="৳ 100"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Confirm Recharge</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: PAY BILL */}
      {activeModal === "pay-bill" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pay Bill</h3>
                  <p className="text-[11px] text-slate-500">Pay utility bills (Electricity, Gas, Water, Internet)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Bill Payment Completed</h4>
                <p className="text-xs text-slate-500">৳ {txResult.amount} paid for {formData.biller}.</p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteService("pay-bill", {
                    billerCode: formData.biller,
                    accountNumber: formData.billAccount,
                    amount: Number(formData.amount),
                  });
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Utility Biller</label>
                  <select
                    value={formData.biller}
                    onChange={(e) => setFormData({ ...formData, biller: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="DPDC (Electricity)">DPDC (Dhaka Power Distribution)</option>
                    <option value="DESCO (Electricity)">DESCO (Dhaka Electric Supply)</option>
                    <option value="Dhaka WASA (Water)">Dhaka WASA (Water Supply)</option>
                    <option value="Titas Gas (Prepaid)">Titas Gas Prepaid</option>
                    <option value="Link3 Internet">Link3 Internet</option>
                    <option value="Carnival Internet">Carnival Internet</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Meter / Account No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1029384756"
                    value={formData.billAccount}
                    onChange={(e) => setFormData({ ...formData, billAccount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bill Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="৳ 1850"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Confirm Bill Payment</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: BANK TRANSFER & REMITTANCE */}
      {(activeModal === "bank-transfer" || activeModal === "remittance") && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  {activeModal === "bank-transfer" ? <Building2 size={16} /> : <Globe2 size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeModal === "bank-transfer" ? "Wallet to Bank" : "Inbound Remittance"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activeModal === "bank-transfer" ? "NPSB / BEFTN Bank Transfer" : "Claim international remittance"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTxResult(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {txResult ? (
              <div className="space-y-4 text-center py-2 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-base font-bold text-slate-900">Operation Completed</h4>
                <p className="text-xs text-slate-500">{txResult.message}</p>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setTxResult(null);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (activeModal === "bank-transfer") {
                    handleExecuteService("bank-transfer", {
                      bankName: formData.bankName,
                      accountNumber: formData.recipient,
                      amount: Number(formData.amount),
                    });
                  } else {
                    handleExecuteService("remittance", {
                      sourceCountry: formData.sourceCountry,
                      remittancePin: formData.recipient || "PIN-998822",
                      amount: Number(formData.amount),
                    });
                  }
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {activeModal === "bank-transfer" ? "Destination Bank" : "Source Country"}
                  </label>
                  <select
                    value={activeModal === "bank-transfer" ? formData.bankName : formData.sourceCountry}
                    onChange={(e) =>
                      activeModal === "bank-transfer"
                        ? setFormData({ ...formData, bankName: e.target.value })
                        : setFormData({ ...formData, sourceCountry: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {activeModal === "bank-transfer" ? (
                      <>
                        <option value="City Bank">City Bank PLC</option>
                        <option value="BRAC Bank">BRAC Bank PLC</option>
                        <option value="Islami Bank">Islami Bank Bangladesh PLC</option>
                        <option value="Eastern Bank">Eastern Bank PLC (EBL)</option>
                        <option value="Dutch Bangla Bank">Dutch-Bangla Bank (DBBL)</option>
                      </>
                    ) : (
                      <>
                        <option value="United Arab Emirates">United Arab Emirates (AED)</option>
                        <option value="Saudi Arabia">Saudi Arabia (SAR)</option>
                        <option value="United Kingdom">United Kingdom (GBP)</option>
                        <option value="United States">United States (USD)</option>
                        <option value="Malaysia">Malaysia (MYR)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {activeModal === "bank-transfer" ? "Bank Account Number" : "MTCN / Remittance Tracking PIN"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeModal === "bank-transfer" ? "e.g. 110293847501" : "e.g. 984-219-4821"}
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="৳ 5000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={txProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {txProcessing ? <RefreshCw size={14} className="animate-spin" /> : <span>Execute Securely</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SERVICE MODAL: QR PAYMENT */}
      {activeModal === "qr-pay" && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Bangla QR Standard</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto bg-slate-50 border-2 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center p-4">
              <QrCode size={100} className="text-slate-800" />
              <span className="text-[10px] text-blue-600 font-bold mt-2">Scan Bangla QR Merchant</span>
            </div>

            <p className="text-xs text-slate-500">
              Point your camera at any merchant counter QR or enter merchant ID manually to proceed.
            </p>

            <button
              onClick={() => {
                setActiveModal("payment");
                setFormData({ ...formData, recipient: "MERCH-BANGLAQR-01" });
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
            >
              Simulate Merchant Scan
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER SECURITY CENTER MODAL */}
      {isSecurityCenterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Customer Security Center</h3>
                  <p className="text-[11px] text-slate-500">Account login intelligence and active device sessions</p>
                </div>
              </div>
              <button
                onClick={() => setIsSecurityCenterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Session Telemetry */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Current Session Telemetry
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Current observed login IP</span>
                  <div className="font-mono font-bold text-slate-900">{securityInfo.observedIp}</div>
                  <div className="text-[10px] text-slate-500">
                    Location: {securityInfo.approximateLocation}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Device & Browser</span>
                  <div className="font-semibold text-slate-900 truncate">{securityInfo.currentDevice}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">Session Active & Protected</div>
                </div>
              </div>
            </div>

            {/* Active Sessions List */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Active Sessions ({securityInfo.sessions.length})
                </h4>
                <button
                  onClick={handleRevokeOtherSessions}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Sign Out Other Sessions
                </button>
              </div>

              <div className="space-y-1.5">
                {securityInfo.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Laptop size={14} className="text-slate-400" />
                      <div>
                        <div className="font-semibold text-slate-800 text-[11px]">
                          {sess.userAgent} {sess.isCurrent && "(This Device)"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IP: {sess.ipAddress} • {new Date(sess.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {sess.isCurrent ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Current
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Active</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-500 flex items-start gap-2">
              <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Policy:</strong> IP addresses are observed server-side upon login to detect unauthorized account access. IP addresses represent approximate network locations and are never precise physical street addresses.
              </span>
            </div>

            <button
              onClick={() => setIsSecurityCenterOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Close Security Center
            </button>
          </div>
        </div>
      )}

      {/* TRANSACTION RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                u
              </div>
              <h3 className="text-base font-bold text-slate-900">Transaction Receipt</h3>
              <p className="text-[11px] text-slate-500 font-mono">{selectedReceipt.id}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Service:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.recipient}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Amount:</span>
                <span className="font-extrabold text-slate-900">৳ {selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Fee:</span>
                <span className="text-slate-700">৳ {selectedReceipt.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Time:</span>
                <span className="text-slate-700">{selectedReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-600">{selectedReceipt.status}</span>
              </div>
              {selectedReceipt.riskScore !== undefined && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Security Score:</span>
                  <span className="font-semibold text-blue-600">{selectedReceipt.riskScore}/100 (Safe)</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
