"use client";

import React, { useState } from "react";
import { Transaction, TransactionType } from "@/types";
import {
  Zap,
  X,
  ShieldAlert,
  Play,
  CheckCircle2,
  Smartphone,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";
import { runBackendSimulation } from "@/lib/backend-api";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectTransaction: (txn: Partial<Transaction>) => void;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  onInjectTransaction,
}) => {
  const { language, t } = useSentinel();
  const [customAmount, setCustomAmount] = useState<number>(45000);
  const [customType, setCustomType] = useState<TransactionType>("Wallet Transfer");
  const [customDevice, setCustomDevice] = useState<string>("DEV-8821");
  const [isNewDevice, setIsNewDevice] = useState<boolean>(true);
  const [customLocation, setCustomLocation] = useState<string>("Dhaka");
  const [customRecipient, setCustomRecipient] = useState<string>("01833-883100");
  const [customCustomer, setCustomCustomer] = useState<string>("01712-894102");
  const [customTime, setCustomTime] = useState<string>("02:45 AM");

  if (!isOpen) return null;
  const isBn = language === "bn";

  const handleScenario = async (scenario: "mule" | "ato" | "velocity" | "normal" | "sim_swap") => {
    // Attempt backend simulation execution
    const scenarioMap: Record<string, "mule_ring" | "smurfing" | "takeover" | "velocity_surge"> = {
      mule: "mule_ring",
      ato: "takeover",
      velocity: "velocity_surge",
      sim_swap: "smurfing",
    };

    if (scenarioMap[scenario]) {
      runBackendSimulation(scenarioMap[scenario]).catch(() => {});
    }
    if (scenario === "mule") {
      onInjectTransaction({
        customer: "01712-894102",
        recipient: "01833-883100",
        amount: 48500,
        type: "Wallet Transfer",
        device: "DEV-8821",
        isNewDevice: true,
        location: "Dhaka",
        isNewLocation: false,
        time: "02:13 AM",
        flags: [
          "Amount 4.8× above normal baseline",
          "Unrecognized hardware device DEV-8821",
          "Target wallet linked to mule syndicate #17",
          "Off-hours nocturnal execution (02:13 AM)",
        ],
      });
    } else if (scenario === "ato") {
      onInjectTransaction({
        customer: "01922-221455",
        recipient: "01733-921099",
        amount: 32000,
        type: "Cash Out",
        device: "DEV-9932",
        isNewDevice: true,
        location: "Chattogram",
        isNewLocation: true,
        time: "03:15 AM",
        flags: [
          "USSD credential reset preceding transaction",
          "Geographic jump: Dhaka to Chattogram in 40 min",
          "Immediate full-balance cash-out attempt",
        ],
      });
    } else if (scenario === "sim_swap") {
      onInjectTransaction({
        customer: "01822-918231",
        recipient: "01911-990144",
        amount: 98000,
        type: "Wallet Transfer",
        device: "DEV-9901",
        isNewDevice: true,
        location: "Sylhet",
        isNewLocation: true,
        time: "03:45 AM",
        flags: [
          "Carrier SIM swap detected 15m prior",
          "Bangladesh Bank 24h cooling violation",
          "Max limit account drain",
        ],
      });
    } else if (scenario === "velocity") {
      onInjectTransaction({
        customer: "01711-882140",
        recipient: "01822-441270",
        amount: 24500,
        type: "Wallet Transfer",
        device: "DEV-8821",
        isNewDevice: false,
        location: "Dhaka",
        isNewLocation: false,
        time: "01:22 AM",
        flags: [
          "Micro-structuring velocity: 6 transfers in 180 seconds",
          "Evading Bangladesh Bank ৳25,000 reporting threshold",
        ],
      });
    } else if (scenario === "normal") {
      onInjectTransaction({
        customer: "01700-291033",
        recipient: "M-291 (Shwapno Superstore)",
        amount: 2450,
        type: "Merchant Pay",
        device: "DEV-2211",
        isNewDevice: false,
        location: "Dhaka",
        isNewLocation: false,
        time: "11:45 AM",
        flags: ["Conforms to 30-day baseline median", "Known trusted device"],
      });
    }
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInjectTransaction({
      customer: customCustomer,
      recipient: customRecipient,
      amount: Number(customAmount),
      type: customType,
      device: customDevice,
      isNewDevice,
      location: customLocation,
      isNewLocation: isNewDevice,
      time: customTime,
      flags: [
        isNewDevice ? "Unregistered device login" : "Registered device",
        customAmount > 30000 ? "High value transaction" : "Normal value",
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-modal animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Zap size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isBn ? "বাংলাদেশ এমএফএস প্রতারণা সিমুলেশন ওয়ার্কবেঞ্চ" : "MFS Attack Simulation Workbench"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isBn ? "বাস্তব লেনদেন তৈরি করে ঝুঁকি ইঞ্জিন পরীক্ষা করুন" : "Inject synthetic attack vectors to verify sub-2ms engine scoring"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Preset Attack Scenarios */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">
              {isBn ? "১-ক্লিক দ্রুত প্রতারণা দৃশ্যকল্প" : "1-Click Standard MFS Attack Scenarios"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleScenario("ato")}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="badge badge-critical text-[9px]">{isBn ? "পিন চুরি" : "ATO"}</span>
                  <span className="text-[10px] font-mono text-slate-500">৳32,000</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">Account Takeover</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  USSD PIN reset + nocturnal cash-out at agent
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleScenario("sim_swap")}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="badge badge-critical text-[9px]">{isBn ? "সিম পরিবর্তন" : "SIM SWAP"}</span>
                  <span className="text-[10px] font-mono text-slate-500">৳98,000</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">SIM Swap Liquidation</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Carrier SIM re-issuance + 24h cooling violation
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleScenario("mule")}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="badge badge-critical text-[9px]">{isBn ? "মিউল চক্র" : "SYNDICATE"}</span>
                  <span className="text-[10px] font-mono text-slate-500">৳48,500</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">Mule Syndicate #17</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Direct transfer into confirmed laundering conduit
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleScenario("velocity")}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="badge badge-high text-[9px]">{isBn ? "স্মার্ফিং" : "SMURFING"}</span>
                  <span className="text-[10px] font-mono text-slate-500">৳24,500</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">Smurfing Split Hop</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Skirting Bangladesh Bank ৳25,000 limit
                </div>
              </button>
            </div>
          </div>

          {/* Custom Transaction Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3 pt-3 border-t border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              {isBn ? "কাস্টম লেনদেন প্যারামিটার তৈরি করুন" : "Or Build Custom MFS Vector"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "প্রেরক ওয়ালেট" : "Customer Wallet"}
                </label>
                <input
                  type="text"
                  value={customCustomer}
                  onChange={(e) => setCustomCustomer(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "প্রাপক / এজেন্ট" : "Beneficiary / Agent"}
                </label>
                <input
                  type="text"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="field w-full"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "পরিমাণ (টাকা ৳)" : "Amount (BDT ৳)"}
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="field w-full font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "লেনদেনের ধরন" : "MFS Type"}
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as TransactionType)}
                  className="field w-full"
                >
                  <option value="Wallet Transfer">P2P Send Money</option>
                  <option value="Cash Out">Agent Cash-Out</option>
                  <option value="Merchant Pay">Merchant Payment</option>
                  <option value="Add Money">Bank Add Money</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "বিভাগ" : "Division"}
                </label>
                <select
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="field w-full"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isBn ? "সময়" : "Time"}
                </label>
                <input
                  type="text"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="field w-full font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="newDevCheck"
                checked={isNewDevice}
                onChange={(e) => setIsNewDevice(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <label htmlFor="newDevCheck" className="text-xs text-slate-700 cursor-pointer">
                {isBn ? "অপরিচিত নতুন ডিভাইস ও সিম ফ্ল্যাগ যোগ করুন" : "Flag as unrecognized new device & SIM pairing"}
              </label>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                {t("close")}
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                {isBn ? "ইনজেক্ট ও মূল্যায়ন করুন" : "Inject & Evaluate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
