"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Store,
  User,
  ShieldAlert,
  ArrowRight,
  Lock,
  FileCheck,
  AlertOctagon,
  Layers,
  Sparkles,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export interface MFSGraphNode {
  id: string;
  label: string;
  bnLabel: string;
  role: "victim" | "mule_conduit" | "rogue_agent" | "hundi_hub";
  walletNumber: string;
  location: string;
  riskScore: number;
  amountHandled: number;
  simStatus: string;
  nidStatus: string;
  details: string;
  bnDetails: string;
  x: number;
  y: number;
}

export interface MFSGraphLink {
  sourceId: string;
  targetId: string;
  amount: number;
  label: string;
  bnLabel: string;
  isHot: boolean;
}

const MFS_NODES: MFSGraphNode[] = [
  {
    id: "N-VICTIM",
    label: "Origin Victim Wallet",
    bnLabel: "ভুক্তভোগী মূল ওয়ালেট",
    role: "victim",
    walletNumber: "+880 1712-894102",
    location: "Gulshan, Dhaka",
    riskScore: 24,
    amountHandled: 48500,
    simStatus: "Grameenphone (Age: 3.2 yrs)",
    nidStatus: "Smart NID Verified (10-digit)",
    details: "Legitimate customer compromised via active call social engineering coaching.",
    bnDetails: "ফোনে লটারি ও পিন প্রতারণার শিকার হয়ে প্রতারকের ওয়ালেটে টাকা ট্রান্সফার করেন।",
    x: 100,
    y: 200,
  },
  {
    id: "N-MULE1",
    label: "Conduit Mule #1",
    bnLabel: "মধ্যবর্তী মিউল একাউন্ট ০১",
    role: "mule_conduit",
    walletNumber: "+880 1833-883100",
    location: "Agrabad, Chattogram",
    riskScore: 94,
    amountHandled: 48500,
    simStatus: "Robi (Sim swap: 4 hours ago)",
    nidStatus: "Flagged NID linked to 6 accounts",
    details: "First-tier conduit account in Mule Syndicate Cluster #17. Immediate outbound pass-through.",
    bnDetails: "সিন্ডিকেট চক্র ১৭-এর প্রথম সারির মিউল ওয়ালেট। টাকা ঢোকামাত্রই অন্যত্র স্থানান্তর।",
    x: 360,
    y: 120,
  },
  {
    id: "N-MULE2",
    label: "Conduit Mule #2",
    bnLabel: "মধ্যবর্তী মিউল একাউন্ট ০২",
    role: "mule_conduit",
    walletNumber: "+880 1911-772154",
    location: "Zindabazar, Sylhet",
    riskScore: 91,
    amountHandled: 24500,
    simStatus: "Banglalink (New device pairing)",
    nidStatus: "Sub-threshold registration",
    details: "Secondary smurfing splitter routing cash towards unauthorized night cash-out point.",
    bnDetails: "সীমা ফাঁকি দিতে টাকা একাধিক ভাগে ভাগ করে তোলার প্রস্তুতি নেওয়া হচ্ছে।",
    x: 360,
    y: 280,
  },
  {
    id: "N-AGENT",
    label: "Rogue Agent POS",
    bnLabel: "অসাধু এজেন্ট আউটলেট",
    role: "rogue_agent",
    walletNumber: "AG-8821 (Rahman Telecom)",
    location: "Mirpur-10, Dhaka",
    riskScore: 97,
    amountHandled: 73000,
    simStatus: "Merchant Terminal POS-441",
    nidStatus: "Agent License Suspended 2x",
    details: "Agent processing unauthorized nocturnal cash-outs without customer physical presence.",
    bnDetails: "গ্রাহকের সশরীরে উপস্থিতি ছাড়াই রাত ৩টায় নগদ টাকা উত্তোলনের সুযোগ দেওয়া এজেন্ট।",
    x: 640,
    y: 160,
  },
  {
    id: "N-HUNDI",
    label: "Underground Hundi Hub",
    bnLabel: "হুন্ডি ও চোরাই সিন্ডিকেট হাব",
    role: "hundi_hub",
    walletNumber: "SYN-17 (Chattogram Cross-border)",
    location: "Khatunganj, Chattogram",
    riskScore: 99,
    amountHandled: 340000,
    simStatus: "Layered Bank Conduits",
    nidStatus: "BFIU AML Watchlist #2026-08",
    details: "Central money aggregation ring coordinating cross-border remittance diversion.",
    bnDetails: "অবৈধ হুন্ডি ও সীমান্ত পাচারকারী সিন্ডিকেট, যা বিএফআইইউ কালো তালিকাভুক্ত।",
    x: 820,
    y: 240,
  },
];

const MFS_LINKS: MFSGraphLink[] = [
  { sourceId: "N-VICTIM", targetId: "N-MULE1", amount: 48500, label: "P2P Phishing Transfer", bnLabel: "ফিশিং ট্রান্সফার", isHot: true },
  { sourceId: "N-MULE1", targetId: "N-MULE2", amount: 24500, label: "Smurfing Split Hop", bnLabel: "স্মার্ফিং স্প্লিট", isHot: true },
  { sourceId: "N-MULE1", targetId: "N-AGENT", amount: 24000, label: "Night Cash-out Request", bnLabel: "নৈশ ক্যাশ-আউট", isHot: true },
  { sourceId: "N-MULE2", targetId: "N-AGENT", amount: 24500, label: "Second Cash-out Layer", bnLabel: "দ্বিতীয় ক্যাশ-আউট", isHot: true },
  { sourceId: "N-AGENT", targetId: "N-HUNDI", amount: 48500, label: "Illicit Settlement", bnLabel: "অবৈধ হুন্ডি সেটেলমেন্ট", isHot: true },
];

interface BangladeshMuleGraphProps {
  onOpenCase?: (caseId: string) => void;
  onNotify?: (msg: string) => void;
}

export const BangladeshMuleGraph: React.FC<BangladeshMuleGraphProps> = ({
  onOpenCase,
  onNotify,
}) => {
  const { language, t } = useSentinel();
  const [selectedNodeId, setSelectedNodeId] = useState<string>("N-MULE1");
  const isBn = language === "bn";

  const selectedNode = MFS_NODES.find((n) => n.id === selectedNodeId) || MFS_NODES[1];

  return (
    <div className="card-base p-4 border border-slate-200 bg-white">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-[10px] uppercase">
              2D MONEY TRAIL
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t("muleNetworkTitle")}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {t("muleNetworkSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            {isBn ? "চক্র #১৭: ৫টি নোড সক্রিয়" : "Cluster #17: 5 Intercepted Nodes"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-lg p-3 relative flex items-center justify-center min-h-[380px] overflow-hidden">
          <svg viewBox="0 0 920 400" className="w-full h-full max-h-[380px] select-none">
            {/* Background grid & flow animations */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="1" />
              </pattern>
              <style>{`
                @keyframes flowPulse {
                  from { stroke-dashoffset: 18; }
                  to { stroke-dashoffset: 0; }
                }
                .edge-flow {
                  animation: flowPulse 0.85s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                  .edge-flow {
                    animation: none;
                  }
                }
              `}</style>
            </defs>
            <rect width="920" height="400" fill="url(#grid)" />

            {/* Connecting Edges with flow beam */}
            {MFS_LINKS.map((link, idx) => {
              const src = MFS_NODES.find((n) => n.id === link.sourceId);
              const tgt = MFS_NODES.find((n) => n.id === link.targetId);
              if (!src || !tgt) return null;

              const isConnected = link.sourceId === selectedNode.id || link.targetId === selectedNode.id;

              return (
                <g key={idx}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isConnected ? "#DC2626" : "#94A3B8"}
                    strokeWidth={isConnected ? "3" : "1.8"}
                    strokeDasharray={isConnected ? "6 3" : "4 4"}
                    strokeOpacity={isConnected ? "1" : "0.45"}
                    className={isConnected ? "edge-flow transition-all duration-200" : "transition-all duration-200"}
                  />
                  {/* Amount Badge in middle of edge */}
                  <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="20"
                      rx="4"
                      fill="#FFFFFF"
                      stroke={isConnected ? "#DC2626" : "#CBD5E1"}
                      strokeWidth={isConnected ? "1.5" : "1"}
                      className="transition-all duration-200 shadow-sm"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isConnected ? "#DC2626" : "#64748B"}
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ৳{link.amount.toLocaleString()}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Nodes */}
            {MFS_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isVictim = node.role === "victim";
              const isAgent = node.role === "rogue_agent";
              const isHundi = node.role === "hundi_hub";

              const color = isVictim ? "#0052FF" : isAgent ? "#D97706" : isHundi ? "#7C3AED" : "#DC2626";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Selected spotlight halo & pulse */}
                  {isSelected && (
                    <>
                      <circle
                        r="34"
                        fill="rgba(168, 85, 247, 0.12)"
                        stroke="rgba(168, 85, 247, 0.5)"
                        strokeWidth="1.5"
                        className="animate-statusPulse"
                      />
                      <circle
                        r="27"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="opacity-90"
                      />
                    </>
                  )}

                  {/* Outer circle */}
                  <circle
                    r="20"
                    fill="#FFFFFF"
                    stroke={color}
                    strokeWidth="3"
                    className="transition-transform duration-150 group-hover:scale-110"
                    style={{ transformOrigin: "0 0" }}
                  />

                  {/* Icon label representation */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill={color}
                    fontSize="13"
                    fontWeight="bold"
                  >
                    {isVictim ? "👤" : isAgent ? "🏪" : isHundi ? "🌐" : "⚠️"}
                  </text>

                  {/* Node label box */}
                  <rect
                    x="-65"
                    y="25"
                    width="130"
                    height="32"
                    rx="4"
                    fill="#FFFFFF"
                    stroke={isSelected ? color : "#CBD5E1"}
                    strokeWidth={isSelected ? "1.5" : "1"}
                  />
                  <text
                    x="0"
                    y="39"
                    textAnchor="middle"
                    fill="#0F172A"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {isBn ? node.bnLabel : node.label}
                  </text>
                  <text
                    x="0"
                    y="51"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="monospace"
                  >
                    {node.walletNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Telemetry Dossier Panel with Purple Spotlight */}
        <SpotlightCard
          color="purple"
          glowSize="medium"
          lightsEdges={true}
          lag="short"
          className="lg:col-span-4 p-4 rounded-xl border border-slate-200 bg-white shadow-subtle flex flex-col justify-between space-y-3"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {isBn ? "নোড বিশদ বিশ্লেষণ" : "NODE TELEMETRY"}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  selectedNode.riskScore >= 90
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                RISK: {selectedNode.riskScore}/100
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? selectedNode.bnLabel : selectedNode.label}
              </h3>
              <div className="text-xs font-mono font-bold text-blue-600 mt-0.5">
                {selectedNode.walletNumber}
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {isBn ? selectedNode.bnDetails : selectedNode.details}
              </p>
            </div>

            <div className="space-y-2 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "অবস্থান" : "Location"}:</span>
                <span className="font-semibold text-slate-800">{selectedNode.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "সিম ও ক্যারিয়ার" : "SIM / Carrier"}:</span>
                <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[180px]">
                  {selectedNode.simStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "জাতীয় পরিচয়পত্র" : "NID Status"}:</span>
                <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[180px]">
                  {selectedNode.nidStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{isBn ? "লেনদেনের পরিমাণ" : "Volume Routed"}:</span>
                <span className="font-mono font-bold text-rose-600 text-sm">
                  ৳{selectedNode.amountHandled.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                onNotify?.(
                  isBn
                    ? `${selectedNode.walletNumber} ওয়ালেটটির সকল ক্যাশ-আউট লেনদেন সাময়িক হোল্ড করা হয়েছে।`
                    : `Settlement held for ${selectedNode.walletNumber}. BFIU log recorded.`
                );
              }}
              className="w-full btn btn-danger text-xs flex items-center justify-center gap-1.5"
            >
              <Lock size={13} />
              <span>{t("actionHold")}</span>
            </button>
            <button
              onClick={() => onOpenCase?.("INV-1042")}
              className="w-full btn btn-secondary text-xs flex items-center justify-center gap-1.5"
            >
              <FileCheck size={13} />
              <span>{t("openDossier")}</span>
            </button>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};
