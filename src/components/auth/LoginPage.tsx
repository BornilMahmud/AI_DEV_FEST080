"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Globe,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { syncFirebaseUserToSupabase } from "@/lib/supabase";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  badge: string;
}

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  isDarkMode?: boolean;
}

const PRESET_ACCOUNTS: UserProfile[] = [
  {
    name: "Arman Hossen",
    email: "arman.hossen@upay.com.bd",
    avatar: "AH",
    role: "Lead Risk Analyst (SOC Tier 3)",
    badge: "PRIMARY ANALYST",
  },
  {
    name: "Siam Ahmed",
    email: "siam.ahmed@upay.com.bd",
    avatar: "SA",
    role: "AML & BFIU Compliance Officer",
    badge: "COMPLIANCE LEAD",
  },
  {
    name: "AI DEV FEST Judge",
    email: "judge.eval@diu-cpc.org",
    avatar: "JD",
    role: "Hackathon Evaluation Auditor",
    badge: "EXECUTIVE OBSERVER",
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedAccount, setSelectedAccount] = useState<UserProfile>(PRESET_ACCOUNTS[0]);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Form Fields
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const isBn = lang === "bn";

  // Helper to extract initials
  const getInitials = (displayName?: string | null, emailAddr?: string | null) => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((p) => p[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 2) || "U";
    }
    if (emailAddr) {
      return emailAddr.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  // 1. Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await syncFirebaseUserToSupabase(user, "analyst");

      const profile: UserProfile = {
        name: user.displayName || user.email?.split("@")[0] || "Analyst",
        email: user.email || "",
        avatar: getInitials(user.displayName, user.email),
        role: "Authorized Financial Investigator",
        badge: "GOOGLE SSO",
      };
      setSuccessMsg(isBn ? "গুগল সাইন-ইন সফল হয়েছে!" : "Google Authentication successful!");
      setTimeout(() => onLogin(profile), 600);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(err.message?.replace("Firebase: ", "") || "Google Authentication failed");
      setIsAuthenticating(false);
    }
  };

  // 2. GitHub OAuth Flow
  const handleGithubSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      await syncFirebaseUserToSupabase(user, "analyst");

      const profile: UserProfile = {
        name: user.displayName || user.email?.split("@")[0] || "Analyst",
        email: user.email || "",
        avatar: getInitials(user.displayName, user.email),
        role: "Authorized Financial Investigator",
        badge: "GITHUB SSO",
      };
      setSuccessMsg(isBn ? "গিটহাব সাইন-ইন সফল হয়েছে!" : "GitHub Authentication successful!");
      setTimeout(() => onLogin(profile), 600);
    } catch (err: any) {
      console.error("GitHub Auth error:", err);
      setErrorMsg(err.message?.replace("Firebase: ", "") || "GitHub Authentication failed");
      setIsAuthenticating(false);
    }
  };

  // 3. Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(isBn ? "অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড প্রদান করুন" : "Please provide email and password");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await syncFirebaseUserToSupabase(user, "analyst");

      const profile: UserProfile = {
        name: user.displayName || email.split("@")[0],
        email: user.email || email,
        avatar: getInitials(user.displayName, email),
        role: "Authorized Financial Investigator",
        badge: "FIREBASE AUTH",
      };
      setSuccessMsg(isBn ? "লগইন সফল হয়েছে!" : "Sign-in successful!");
      setTimeout(() => onLogin(profile), 600);
    } catch (err: any) {
      console.error("Email login error:", err);
      const code = err.code || "";
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setErrorMsg(isBn ? "ভুল ইমেইল অথবা পাসওয়ার্ড" : "Invalid email or password");
      } else {
        setErrorMsg(err.message?.replace("Firebase: ", "") || "Authentication failed");
      }
      setIsAuthenticating(false);
    }
  };

  // 4. Email & Password Register
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(isBn ? "অনুগ্রহ করে সকল তথ্য পূরণ করুন" : "Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(isBn ? "পাসওয়ার্ড দুটি মিলছে না" : "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

      await syncFirebaseUserToSupabase(user, "investigator");

      const profile: UserProfile = {
        name: name.trim() || email.split("@")[0],
        email: user.email || email,
        avatar: getInitials(name || email.split("@")[0], email),
        role: "Registered Financial Investigator",
        badge: "NEW INVESTIGATOR",
      };

      setSuccessMsg(isBn ? "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" : "Account created & registered successfully!");
      setTimeout(() => onLogin(profile), 800);
    } catch (err: any) {
      console.error("Registration error:", err);
      const code = err.code || "";
      if (code === "auth/email-already-in-use") {
        setErrorMsg(isBn ? "এই ইমেইল ইতিমধ্যে নিবন্ধিত আছে" : "This email is already in use. Please sign in.");
      } else {
        setErrorMsg(err.message?.replace("Firebase: ", "") || "Registration failed");
      }
      setIsAuthenticating(false);
    }
  };

  // 5. Fast Preset Role Sign-in (for Judges and Evaluators)
  const handleFastPresetSignIn = (preset: UserProfile) => {
    setIsAuthenticating(true);
    setErrorMsg("");
    setSuccessMsg(isBn ? `${preset.name} হিসেবে সংযুক্ত হচ্ছে...` : `Entering as ${preset.name}...`);
    setTimeout(() => {
      onLogin(preset);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 font-sans select-none">
      {/* Language Switcher Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-sm"
        >
          <Globe size={13} className="text-blue-600" />
          <span>{lang === "en" ? "বাংলা মোড" : "English Mode"}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 space-y-6 shadow-card hover:shadow-cardHover transition-shadow duration-300 animate-scaleUp">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-xl mx-auto shadow-sm">
            u
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            upay <span className="text-blue-600">Sentinel</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {isBn
              ? "বাংলাদেশ মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS) জালিয়াতি প্রতিরোধ ও ঝুঁকি নিয়ন্ত্রণ প্ল্যাটফর্ম"
              : "AI-Powered MFS Fraud Intelligence Platform for Modern Digital Financial Services"}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              mode === "login"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isBn ? "প্রবেশ (Sign In)" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 rounded-md text-center transition-all ${
              mode === "register"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isBn ? "নতুন অ্যাকাউন্ট (Register)" : "Register"}
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700 animate-fadeIn">
            <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-700 animate-fadeIn">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Social Authentication: Google & GitHub */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
          >
            {/* Google SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {mode === "login"
                ? isBn
                  ? "গুগল দিয়ে প্রবেশ করুন"
                  : "Continue with Google"
                : isBn
                ? "গুগল দিয়ে নিবন্ধন করুন"
                : "Sign up with Google"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={isAuthenticating}
            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
          >
            {/* GitHub SVG Icon */}
            <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>
              {mode === "login"
                ? isBn
                  ? "গিটহাব দিয়ে প্রবেশ করুন"
                  : "Continue with GitHub"
                : isBn
                ? "গিটহাব দিয়ে নিবন্ধন করুন"
                : "Sign up with GitHub"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
            {isBn ? "অথবা ইমেইল" : "or with email"}
          </span>
        </div>

        {/* Email & Password Form */}
        {mode === "login" ? (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" />
                <span>{isBn ? "কর্পোরেট ইমেইল" : "Analyst Email"}</span>
              </label>
              <input
                type="email"
                required
                placeholder="analyst@upay.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>{isBn ? "পাসওয়ার্ড" : "Password"}</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>{isBn ? "যাচাই করা হচ্ছে..." : "Verifying..."}</span>
              ) : (
                <>
                  <span>{isBn ? "প্রবেশ করুন" : "Sign In with Email"}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEmailRegister} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                <span>{isBn ? "কর্মকর্তার পূর্ণ নাম" : "Full Name"}</span>
              </label>
              <input
                type="text"
                required
                placeholder="Arman Hossen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" />
                <span>{isBn ? "অফিসিয়াল ইমেইল" : "Official Email"}</span>
              </label>
              <input
                type="email"
                required
                placeholder="investigator@upay.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>{isBn ? "পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" : "Password (min 6 characters)"}</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                <span>{isBn ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>{isBn ? "নিবন্ধন করা হচ্ছে..." : "Registering Account..."}</span>
              ) : (
                <>
                  <span>{isBn ? "নিবন্ধন সম্পন্ন করুন" : "Create Investigator Account"}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Fast Authenticate Roles for Hackathon Judging */}
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              {isBn ? "বিচারক / দ্রুত ডেমো ভূমিকা" : "1-Click Evaluation Roles"}
            </div>
            <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <Sparkles size={11} />
              <span>Instant Access</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleFastPresetSignIn(acc)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between active:scale-[0.985] ${
                  selectedAccount.email === acc.email
                    ? "border-blue-600 bg-blue-50/50 shadow-subtle"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-subtle"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center font-mono">
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">{acc.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{acc.role}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {acc.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Security / Bangladesh Bank Accreditation */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[10.5px] text-slate-500">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>
            {isBn
              ? "বাংলাদেশ ব্যাংক BFIU সার্কুলার ২৫/২০২৩ কমপ্লায়েন্ট ও ফায়ারবেস সিকিউরড গেটওয়ে"
              : "Compliant with Bangladesh Bank BFIU Circular 25/2023 & Firebase SSO"}
          </span>
        </div>
      </div>
    </div>
  );
};
