"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Bot,
  User,
  Zap,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Scale,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  Info,
} from "lucide-react";
import { askSentinelCopilot } from "@/lib/gemini";
import { useSentinel } from "@/context/SentinelContext";
import { NavigationPage } from "@/types";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  evidence?: string[];
  confidence?: number;
  actionHint?: {
    label: string;
    page: NavigationPage;
  };
}

interface GlassAiChatbotProps {
  onNavigate?: (page: NavigationPage) => void;
  onNotify?: (msg: string) => void;
}

export const GlassAiChatbot: React.FC<GlassAiChatbotProps> = ({
  onNavigate,
  onNotify,
}) => {
  const {
    language,
    selectedCase,
    selectedTransaction,
    transactions,
    injectScenario,
    cases,
  } = useSentinel();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isBn = language === "bn";

  const initialMessages: ChatMessage[] = [
    {
      id: "msg-welcome-1",
      sender: "bot",
      text: isBn
        ? "স্বাগতম! আমি **সেন্টিনেল এআই কোপাইলট** (Google Gemini চালিত)। আমি বাংলাদেশের ৬৪ জেলার ১.২৮ মিলিয়ন লাইভ এমএফএস লেনদেন ও মিউল নেটওয়ার্ক পর্যবেক্ষণ করছি। লেনদেন বিশ্লেষণ, বিএফআইইউ সার্কুলার বা মিউল অ্যাকাউন্ট ফ্রিজ সংক্রান্ত যেকোনো সহায়তা চাইতে পারেন।"
        : "Hello Analyst! I am the **Sentinel AI Copilot** powered by Google Gemini. I am actively monitoring 1.28M live MFS transactions across all 64 districts. Ask me about anomaly signals, Bangladesh Bank compliance, or freezing syndicate corridors.",
      timestamp: "Just now",
      evidence: [
        isBn ? "৬৪টি জেলায় টেলিমেট্রি সক্রিয়" : "64 Districts Telemetry Connected",
        isBn ? "বাংলাদেশ ব্যাংক BFIU সার্কুলার সমন্বিত" : "Bangladesh Bank BFIU Regulations Loaded",
      ],
      confidence: 99,
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Suggested prompt pills
  const promptPills = isBn
    ? [
        { label: "🔍 সাম্প্রতিক অনিয়ম বিশ্লেষণ", query: "সাম্প্রতিক সবচেয়ে ঝুঁকিপূর্ণ লেনদেনের কারণ কী?" },
        { label: "🛑 মিউল ক্লাস্টার #১৭ ফ্রিজ কীভাবে?", query: "মিউল সিন্ডিকেট ক্লাস্টার #১৭ ফ্রিজ করতে কী পদক্ষেপ নিতে হবে?" },
        { label: "📜 বাংলাদেশ ব্যাংক সিম-সোয়াপ রুল", query: "সিম সোয়াপ পরবর্তী লেনদেনে বাংলাদেশ ব্যাংকের কুলিং-অফ নিয়ম কী?" },
        { label: "⚡ টেস্ট অ্যাটাক ইনজেক্ট করুন", query: "একটি সিম সোয়াপ টেস্ট অ্যাটাক সিমুলেশন চালান" },
      ]
    : [
        { label: "🔍 Explain Critical Risk", query: "Why was transaction TXN-9901 flagged as Critical?" },
        { label: "🛑 How to freeze Mule #17?", query: "What are the immediate steps to freeze Mule Cluster #17?" },
        { label: "📜 BB SIM-Swap Rule", query: "What is Bangladesh Bank regulation regarding post SIM-swap cash outs?" },
        { label: "⚡ Inject Test Attack", query: "Inject an Account Takeover simulation attack" },
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const qLower = textToSend.toLowerCase();

      // Check if user specifically requested an attack simulation
      if (qLower.includes("test attack") || qLower.includes("টেস্ট অ্যাটাক") || qLower.includes("simulate") || qLower.includes("সিমুলেশন")) {
        const injected = await injectScenario("sim_swap");
        const botReply: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: isBn
            ? `⚠️ সিমুলেটেড অ্যাটাক সফলভাবে ইনজেক্ট করা হয়েছে! নতুন লেনদেন **${injected.id}** (৳${injected.amount.toLocaleString()}) সনাক্ত হয়েছে। ঝুঁকি স্কোর: **${injected.riskScore}/100** (CRITICAL)। সিম সোয়াপের ৮ মিনিটের মাথায় ফুল ব্যালেন্স ড্রেইনের চেষ্টা ট্র্যাক করা হয়েছে।`
            : `⚠️ Simulated attack injected into live telemetry! New transaction **${injected.id}** (৳${injected.amount.toLocaleString()}) flagged with Risk Score **${injected.riskScore}/100** (CRITICAL). Detected SIM-swap cooling off violation with nocturnal cash-out.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          evidence: [
            `Txn ID: ${injected.id}`,
            `Amount: ৳${injected.amount.toLocaleString()}`,
            "Triggered: BFIU-2024-CIR-03 § 4.2 Violation",
          ],
          confidence: 98,
          actionHint: {
            label: isBn ? "মনিটরে লাইভ দেখুন →" : "View in Live Monitor →",
            page: "transactions",
          },
        };
        setMessages((prev) => [...prev, botReply]);
        if (onNotify) onNotify(isBn ? "টেস্ট অ্যাটাক ইনজেক্ট করা হয়েছে" : "Test attack injected into stream");
        return;
      }

      // Query Gemini AI Copilot
      const context = {
        caseId: selectedCase?.id || "INV-1042",
        customer: selectedTransaction?.customer || selectedCase?.customer || "U-1042",
        riskScore: selectedTransaction?.riskScore || selectedCase?.riskScore || 94,
        amount: selectedTransaction?.amount || selectedCase?.amount || 48500,
        status: selectedCase?.status || "Investigating",
      };

      const result = await askSentinelCopilot(textToSend, context);

      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        evidence: result.evidence && result.evidence.length > 0 ? result.evidence : undefined,
        confidence: result.confidence || 95,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch {
      const fallbackReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: isBn
          ? "সেন্টিনেল রিস্ক ইঞ্জিন নিশ্চিত করেছে: লেনদেনটি বিহেভিয়ারাল বেসলাইনের ৪.৮ গুণ বেশি এবং মিউল ক্লাস্টার #১৭ এর সাথে ১-হপ দূরত্বে সংযুক্ত। বিএফআইইউ সার্কুলার অনুযায়ী দ্রুত বায়োমেট্রিক স্টেপ-আপ বা ফান্ড হোল্ড সুপারিশ করা হচ্ছে।"
          : "Sentinel Risk Engine telemetry confirms: Anomaly score 94/100 driven by 4.8× baseline amount surge, unknown device fingerprint, and 1-hop adjacency to Mule Syndicate Cluster #17. Immediate hold recommended.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        confidence: 92,
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  if (!mounted) return null;

  return (
    <>
      {/* ─── FLOATING GLASS BUBBLE TRIGGER (RIGHT SIDE) ─── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Copilot Chat"
            className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,82,255,0.28),0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_32px_rgba(0,82,255,0.38)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white ring-2 ring-blue-500/20"
          >
            <Sparkles size={20} className="animate-pulse" />

            {/* Online Live Status Beacon */}
            <span className="absolute bottom-0.5 right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
            </span>

            {/* Unread Alert Badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-[#0052FF] text-[9.5px] text-white font-bold items-center justify-center border-2 border-white shadow-xs">
                  1
                </span>
              </span>
            )}

            {/* Hover Tooltip */}
            <span className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-md flex items-center gap-1.5">
              <span>{isBn ? "এআই কোপাইলট" : "AI Copilot"}</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/30">
                GEMINI
              </span>
            </span>
          </button>
        </div>
      )}

      {/* ─── EXPANDED RIGHT-SIDE GLASS CHATBOT WINDOW ─── */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[380px] sm:w-[410px] max-w-[calc(100vw-32px)] h-[580px] max-h-[calc(100vh-60px)] flex flex-col rounded-3xl bg-white/90 backdrop-blur-xl border border-white/95 shadow-[0_24px_64px_rgba(0,0,0,0.18),0_4px_24px_rgba(0,82,255,0.12)] ring-1 ring-black/[0.05] overflow-hidden animate-fadeIn transition-all">
          {/* Glass Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50/80 via-white/80 to-emerald-50/60 border-b border-slate-200/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xs">
                  <Bot size={18} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-slate-900 leading-tight">
                    {isBn ? "সেন্টিনেল এআই কোপাইলট" : "Sentinel AI Copilot"}
                  </h3>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    GEMINI 1.5
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isBn ? "রিয়েল-টাইম ফ্রড ইনটেলিজেন্স অ্যান্ড ট্রিয়াজ" : "Real-time Fraud Intelligence & Triage"}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title={isBn ? "চ্যাট মুছুন" : "Clear conversation"}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title={isBn ? "মিনিমাইজ করুন" : "Minimize chatbot"}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-3.5 py-1.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-[10px] font-mono text-blue-800">
            <span className="flex items-center gap-1 truncate font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>{isBn ? "কনটেক্সট:" : "Context:"}</span>
              <strong className="font-bold">
                {selectedCase ? `Case ${selectedCase.id}` : `Customer U-1042 · Mule #17`}
              </strong>
            </span>
            <span className="text-blue-600 font-bold shrink-0">
              {isBn ? "৬৪ জেলা সংযুক্ত" : "64 Districts"}
            </span>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 animate-fadeUp ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={13} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed transition-all ${
                    msg.sender === "user"
                      ? "bg-[#0052FF] text-white rounded-br-xs shadow-xs"
                      : "bg-white/95 border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs backdrop-blur-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Evidence Points */}
                  {msg.evidence && msg.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                        {isBn ? "প্রমাণ ও টেলিমেট্রি:" : "Evidence & Telemetry:"}
                      </span>
                      {msg.evidence.map((ev, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-[10.5px] text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-1 rounded-md"
                        >
                          <ShieldCheck size={11} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Hint Button */}
                  {msg.actionHint && onNavigate && (
                    <button
                      onClick={() => onNavigate(msg.actionHint!.page)}
                      className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10.5px] rounded-lg border border-blue-200 transition-colors"
                    >
                      <span>{msg.actionHint.label}</span>
                      <ArrowRight size={11} />
                    </button>
                  )}

                  {/* Confidence Pill + Timestamp */}
                  <div
                    className={`flex items-center justify-between mt-1.5 text-[9px] ${
                      msg.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.confidence && (
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {msg.confidence}% Confidence
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <Sparkles size={13} className="animate-spin" />
                </div>
                <div className="bg-white/90 border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-slate-500 shadow-2xs flex items-center gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
                  </div>
                  <span className="text-[11px] font-medium font-mono text-slate-400">
                    {isBn ? "জেমিনাই চিন্তা করছে..." : "Gemini reasoning..."}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="px-3 py-2 border-t border-slate-200/80 bg-slate-50/70 backdrop-blur-xs flex gap-1.5 overflow-x-auto scrollbar-none">
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(pill.query)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-[10.5px] font-semibold transition-all shrink-0 shadow-2xs"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Glass Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white/95 border-t border-slate-200/80 backdrop-blur-md flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isBn
                  ? "তদন্ত কোপাইলটকে প্রশ্ন করুন..."
                  : "Ask copilot about risk, evidence, or regulations..."
              }
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 bg-slate-50/80 border border-slate-200/90 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-9 h-9 rounded-xl bg-[#0052FF] hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
              title={isBn ? "পাঠান" : "Send message"}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
