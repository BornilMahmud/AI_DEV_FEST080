"use client";

import React, { useEffect } from "react";
import { Shield, X, Command, Zap, Cpu, MapPin, Globe } from "lucide-react";
import { useSentinel } from "@/context/SentinelContext";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulation?: () => void;
  onOpenReport?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onOpenSimulation,
  onOpenReport,
}) => {
  const { language, toggleLanguage, t } = useSentinel();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 text-slate-800 max-h-[90vh] overflow-y-auto shadow-modal animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Shield size={20} />
            </div>
            <div>
              <h2 id="help-modal-title" className="font-bold text-base text-slate-900 leading-tight flex items-center gap-1.5">
                <span>upay Sentinel</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="text-emerald-700 font-medium">
                  {language === "bn" ? "প্ল্যাটফর্ম নির্দেশিকা ও গাইড" : "Platform Operation Guide"}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === "bn"
                  ? "বাংলাদেশ ব্যাংক বিএফআইইউ নির্দেশিকা ও এমএফএস সুরক্ষা কনসোল"
                  : "Bangladesh Bank BFIU Compliance & MFS Fraud Defense Architecture"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            <b className="text-slate-900 font-semibold">upay Sentinel</b>{" "}
            {language === "bn"
              ? "হলো বাংলাদেশের মোবাইল ফাইন্যান্সিয়াল সার্ভিস (MFS)-এর জন্য তৈরি কৃত্রিম বুদ্ধিমত্তাসম্পন্ন ঝুঁকি ও জালিয়াতি শনাক্তকরণ সিস্টেম। এটি ২ মিলিসেকেন্ডের মধ্যে প্রতিটি লেনদেনের ঝুঁকি মূল্যায়ন করে।"
              : "is an enterprise AI Fraud & Scam Intelligence console engineered specifically for Bangladesh's Mobile Financial Services (MFS) ecosystem, providing deterministic risk detection in under 2ms."}
          </p>

          {/* Core Lifecycle Box */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
            <div className="font-bold text-emerald-700 text-[10.5px] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu size={13} />
              {language === "bn" ? "৩টি প্রধান মূলনীতি ও কর্মপ্রক্রিয়া" : "The 3 Core Fraud Intelligence Pillars"}
            </div>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                <div>
                  <b className="text-slate-900">{language === "bn" ? "কি ঘটেছে? (What happened?)" : "What happened?"}</b>
                  <p className="text-slate-500 mt-0.5">
                    {language === "bn"
                      ? "রিয়েল-টাইম রুল ইঞ্জিন প্রতি সেকেন্ডে ১,৪০০+ লেনদেনের মধ্যে সিম সোয়াপ, অস্বাভাবিক পরিমাণ ও অফ-আওয়ার কার্যক্রম শনাক্ত করে।"
                      : "Real-time deterministic rule engine scoring transactions across SIM swap, high velocity, and off-hour nocturnal cash-outs."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                <div>
                  <b className="text-slate-900">{language === "bn" ? "কেন এটি ঝুঁকিপূর্ণ? (Why is it risky?)" : "Why is it risky?"}</b>
                  <p className="text-slate-500 mt-0.5">
                    {language === "bn"
                      ? "TreeSHAP ফিচার এক্সপ্ল্যানিবিলিটি, সেলুলার বিটিএস টাওয়ার বিচ্যুতি এবং ৮টি প্রশাসনিক বিভাগের ভৌগোলিক ফান্ড-ফ্লো বিশ্লেষণ।"
                      : "Multi-factor TreeSHAP feature attributions, cellular BTS tower shifts, and 2D Bangladesh money-mule syndicate tracking."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-purple-100 text-purple-800 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                <div>
                  <b className="text-slate-900">{language === "bn" ? "বিশ্লেষকের করণীয় কি? (What should the analyst do next?)" : "What should the analyst do next?"}</b>
                  <p className="text-slate-500 mt-0.5">
                    {language === "bn"
                      ? "জেমিনি এআই কো-পাইলট ঝুঁকি বিশ্লেষণ করে সরাসরি পরামর্শ দেয়: ওয়ালেট স্থগিত, ওটিপি পুনরায় যাচাই অথবা বিএফআইইউ এসএআর রিপোর্ট পেশ।"
                      : "Gemini AI Copilot generates actionable recommendations with human oversight safeguards (Freeze Wallet, Step-Up OTP, SAR Filing)."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div>
            <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
              <Command size={12} className="text-emerald-600" />
              {language === "bn" ? "কীবোর্ড শর্টকাট" : "Keyboard Shortcuts & Hotkeys"}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{language === "bn" ? "সহায়তা উইন্ডো" : "Help Dialog"}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px] font-bold">?</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{language === "bn" ? "ভাষা পরিবর্তন" : "Toggle Language"}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px] font-bold">L</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{language === "bn" ? "আক্রমণ সিমুলেশন" : "Simulate Scenario"}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px] font-bold">S</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{language === "bn" ? "বিএফআইইউ রিপোর্ট" : "Audit Report"}</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[10px] font-bold">R</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              <Globe size={13} className="text-emerald-600" />
              <span>{language === "en" ? "বাংলা মোড" : "English Mode"}</span>
            </button>
            {onOpenSimulation && (
              <button
                onClick={() => { onClose(); onOpenSimulation(); }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Zap size={13} className="text-amber-500" />
                <span>{language === "bn" ? "আক্রমণ সিমুলেশন" : "Simulate Attack"}</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
          >
            {language === "bn" ? "বুঝেছি" : "Got It"}
          </button>
        </div>
      </div>
    </div>
  );
};
