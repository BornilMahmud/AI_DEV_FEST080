"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Globe,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Phone,
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
  Smartphone,
  X,
  Bell,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "@/lib/firebase";
import { syncFirebaseUserToSupabase } from "@/lib/supabase";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  badge: string;
  rawRole?: "CUSTOMER" | "ADMIN" | "ANALYST" | "INVESTIGATOR" | "VIEWER";
  phone?: string;
  token?: string;
  photoURL?: string;
  provider?: "google" | "phone" | "email" | "demo";
  wallet?: {
    id?: string;
    balance: number;
    currency: string;
    status: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  };
}

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  isDarkMode?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Form Fields
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phonePin, setPhonePin] = useState<string>("");
  const [confirmPhonePin, setConfirmPhonePin] = useState<string>("");

  // Forgot Password / OTP Flow States
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotChannel, setForgotChannel] = useState<"phone" | "email">("phone");
  const [forgotIdentifier, setForgotIdentifier] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [receivedOtp, setReceivedOtp] = useState<string>("");
  const [newResetPassword, setNewResetPassword] = useState<string>("");
  const [confirmResetPassword, setConfirmResetPassword] = useState<string>("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(300);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [incomingMessagePopup, setIncomingMessagePopup] = useState<{
    show: boolean;
    otp: string;
    sender: string;
    time: string;
  } | null>(null);
  const [isCopiedOtp, setIsCopiedOtp] = useState<boolean>(false);

  const isBn = lang === "bn";

  // Pre-configured Verified Demo Accounts for Instant Verification
  const DEMO_PHONE_ACCOUNTS: Record<
    string,
    {
      pin: string;
      name: string;
      role: "CUSTOMER" | "ADMIN" | "ANALYST";
      balance: number;
      email: string;
    }
  > = {
    "01712894102": {
      pin: "1234",
      name: "Tanvir Ahmed",
      role: "CUSTOMER",
      balance: 45250,
      email: "customer@upay.mfs",
    },
    "01700112233": {
      pin: "1234",
      name: "Arman Hossen",
      role: "ANALYST",
      balance: 125000,
      email: "analyst@upay.mfs",
    },
    "01711223344": {
      pin: "1234",
      name: "Admin Supervisor",
      role: "ADMIN",
      balance: 250000,
      email: "admin@upay.mfs",
    },
  };

  const normalizeBdDigits = (raw: string): string => {
    let digits = (raw || "").replace(/\D/g, "");
    if (digits.startsWith("880") && digits.length === 13) {
      digits = "0" + digits.slice(3);
    }
    return digits;
  };

  // System auto-detection of role based on Gmail/email or phone number
  const detectRoleFromIdentifier = (identifier: string): "CUSTOMER" | "ADMIN" | "ANALYST" => {
    const val = (identifier || "").toLowerCase().trim();
    if (
      val.includes("admin") ||
      val.includes("judge") ||
      val.includes("control") ||
      val.includes("super")
    ) {
      return "ADMIN";
    }
    if (
      val.includes("analyst") ||
      val.includes("investigator") ||
      val.includes("soc") ||
      val.includes("arman") ||
      val.includes("siam") ||
      val.includes("01700112233")
    ) {
      return "ANALYST";
    }
    return "CUSTOMER";
  };

  // Check for redirect result on mount
  React.useEffect(() => {
    getRedirectResult(auth)
      .then(async (result: any) => {
        if (result && result.user) {
          const user = result.user;
          const detected = detectRoleFromIdentifier(user.email || user.displayName || "");
          const syncResult = await syncFirebaseUserToSupabase(user, detected.toLowerCase() as any);
          const resolvedRole = (syncResult?.user?.role || detected) as any;
          const { role, badge } = mapRoleToDisplay(resolvedRole);

          const profile: UserProfile = {
            name: user.displayName || syncResult?.user?.display_name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            avatar: getInitials(user.displayName, user.email),
            role,
            badge,
            rawRole: resolvedRole,
            photoURL: user.photoURL || undefined,
            provider: "google",
            token: syncResult?.token,
            wallet: syncResult?.wallet,
          };

          setSuccessMsg(isBn ? "গুগল সাইন-ইন সফল হয়েছে!" : "Google Authentication successful!");
          setTimeout(() => onLogin(profile), 500);
        }
      })
      .catch((err: any) => {
        console.warn("[Auth Redirect]", err);
      });
  }, [isBn, onLogin]);

  // Helper to extract initials
  const getInitials = (displayName?: string | null, emailAddr?: string | null) => {
    if (displayName) {
      return (
        displayName
          .split(" ")
          .map((p) => p[0]?.toUpperCase() || "")
          .join("")
          .slice(0, 2) || "U"
      );
    }
    if (emailAddr) {
      return emailAddr.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  const mapRoleToDisplay = (rawRole: string) => {
    switch (rawRole) {
      case "CUSTOMER":
        return { role: "Upay MFS Wallet Customer", badge: "CUSTOMER WALLET" };
      case "ADMIN":
        return { role: "System Administrator", badge: "SYSTEM ADMIN" };
      case "ANALYST":
        return { role: "Lead Risk Analyst (SOC Tier 3)", badge: "RISK ANALYST" };
      case "INVESTIGATOR":
        return { role: "Financial Fraud Investigator", badge: "INVESTIGATOR" };
      default:
        return { role: "Upay Verified User", badge: "VERIFIED USER" };
    }
  };

  // 1. Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const detected = detectRoleFromIdentifier(user.email || user.displayName || "");
      const syncResult = await syncFirebaseUserToSupabase(user, detected.toLowerCase() as any);

      const resolvedRole = (syncResult?.user?.role || detected) as any;
      const { role, badge } = mapRoleToDisplay(resolvedRole);

      const profile: UserProfile = {
        name: user.displayName || syncResult?.user?.display_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: getInitials(user.displayName, user.email),
        role,
        badge,
        rawRole: resolvedRole,
        photoURL: user.photoURL || undefined,
        provider: "google",
        token: syncResult?.token,
        wallet: syncResult?.wallet,
      };

      setSuccessMsg(isBn ? "গুগল সাইন-ইন সফল হয়েছে!" : "Google Authentication successful!");
      setTimeout(() => onLogin(profile), 500);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      const code = err.code || "";
      if (code === "auth/popup-blocked") {
        setErrorMsg(
          isBn
            ? "ব্রাউজার পপ-আপ উইন্ডো ব্লক করেছে। অনুগ্রহ করে ব্রাউজারের পপ-আপ অনুমোদন করুন অথবা নিচে সরাসরি ১-ক্লিক ডেমো লগইন ব্যবহার করুন।"
            : "Browser blocked the Google popup window. Please allow popups or use 1-click Demo Login below."
        );
      } else if (code === "auth/popup-closed-by-user") {
        setErrorMsg(
          isBn
            ? "গুগল সাইন-ইন উইন্ডোটি সম্পন্ন করার আগেই বন্ধ করা হয়েছে।"
            : "Google Sign-in window was closed before completion."
        );
      } else if (code === "auth/unauthorized-domain") {
        setErrorMsg(
          isBn
            ? "ডোমেইনটি ফায়ারবেস কনসোলে অনুমোদিত নয় (Firebase Authorized Domains)। 'localhost' থেকে চালান অথবা নিচে ডেমো লগইন ব্যবহার করুন।"
            : "Domain not authorized in Firebase Console. Please open via localhost or use 1-click Demo Login below."
        );
      } else if (code === "auth/operation-not-allowed") {
        setErrorMsg(
          isBn
            ? "ফায়ারবেস কনসোলে গুগল প্রোভাইডার সক্রিয় করা নেই। নিচে ১-ক্লিক ডেমো লগইন বাটন ব্যবহার করুন।"
            : "Google Provider is disabled in Firebase Console. Please use 1-click Demo Login below."
        );
      } else if (code === "auth/network-request-failed") {
        setErrorMsg(
          isBn
            ? "নেটওয়ার্ক ত্রুটি বা ব্রাউজারের থার্ড-পার্টি কুকি ব্লক রয়েছে।"
            : "Network error or 3rd-party cookies blocked by your browser."
        );
      } else {
        setErrorMsg(err.message?.replace("Firebase: ", "") || "Google Authentication failed");
      }
      setIsAuthenticating(false);
    }
  };

  // Countdown Timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isCountingDown && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            setIsCountingDown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCountingDown, otpCountdown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOpenForgot = (channel: "phone" | "email") => {
    setForgotChannel(channel);
    setForgotIdentifier(channel === "phone" ? phoneNumber : email);
    setForgotStep("request");
    setErrorMsg("");
    setSuccessMsg("");
    setEnteredOtp("");
    setReceivedOtp("");
    setIsOtpModalOpen(false);
    setMode("forgot");
  };

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে আপনার মোবাইল নম্বর বা ইমেইল লিখুন"
          : "Please enter your mobile phone number or email"
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    let sentOtp = "";

    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || (isBn ? "ওটিপি পাঠাতে ব্যর্থ হয়েছে" : "Failed to generate OTP"));
      }

      sentOtp = data.otp || Math.floor(100000 + Math.random() * 900000).toString();
    } catch (err: any) {
      console.warn("Backend OTP request notice (using local simulation fallback):", err.message);
      sentOtp = Math.floor(100000 + Math.random() * 900000).toString();
    } finally {
      setIsAuthenticating(false);
    }

    setReceivedOtp(sentOtp);
    setOtpCountdown(300);
    setIsCountingDown(true);
    setIsOtpModalOpen(true);

    // Show floating incoming SMS / Email push popup banner
    setIncomingMessagePopup({
      show: true,
      otp: sentOtp,
      sender: forgotChannel === "phone" ? "upay OTP SMS (+880)" : "upay Security (Email)",
      time: "Just now",
    });

    setSuccessMsg(
      isBn
        ? `৬-ডিজিটের সিকিউরিটি ওটিপি কোড পাঠানো হয়েছে (${forgotIdentifier})`
        : `6-digit security OTP sent to ${forgotIdentifier}`
    );
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setErrorMsg(isBn ? "৬ সংখ্যার ওটিপি কোড লিখুন" : "Please enter the full 6-digit OTP code");
      return;
    }

    setErrorMsg("");
    setIsAuthenticating(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    let verified = false;

    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim(), otp: enteredOtp.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        verified = true;
      } else {
        if (enteredOtp.trim() === receivedOtp) {
          verified = true;
        } else {
          throw new Error(data.error?.message || (isBn ? "ভুল ওটিপি কোড" : "Incorrect OTP code"));
        }
      }
    } catch (err: any) {
      if (enteredOtp.trim() === receivedOtp) {
        verified = true;
      } else {
        setErrorMsg(err.message || (isBn ? "ভুল ওটিপি কোড" : "Incorrect OTP code"));
        setIsAuthenticating(false);
        return;
      }
    }

    if (verified) {
      setIsAuthenticating(false);
      setIsOtpModalOpen(false);
      setForgotStep("reset");
      setSuccessMsg(
        isBn
          ? "ওটিপি সফলভাবে যাচাই করা হয়েছে! এখন নতুন পিন বা পাসওয়ার্ড সেট করুন।"
          : "OTP verified! Please set your new password or PIN below."
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResetPassword || !confirmResetPassword) {
      setErrorMsg(isBn ? "সকল তথ্য পূরণ করুন" : "Please fill in all fields");
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg(isBn ? "পাসওয়ার্ড দুটি মিলছে না" : "Passwords / PINs do not match");
      return;
    }
    if (newResetPassword.length < 4) {
      setErrorMsg(isBn ? "পাসওয়ার্ড বা পিন কমপক্ষে ৪ সংখ্যার হতে হবে" : "Password or PIN must be at least 4 digits");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    try {
      await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          otp: enteredOtp || receivedOtp,
          newPassword: newResetPassword,
        }),
      });

      if (forgotChannel === "email" && forgotIdentifier.includes("@")) {
        sendPasswordResetEmail(auth, forgotIdentifier.trim()).catch(() => {});
      }
    } catch (err) {
      console.warn("Reset password call note:", err);
    }

    // Save updated password in local credential store
    if (forgotChannel === "phone") {
      const cleanPhone = forgotIdentifier.replace(/\D/g, "");
      if (typeof window !== "undefined") {
        try {
          const usersDb = JSON.parse(localStorage.getItem("upay_phone_users") || "{}");
          usersDb[cleanPhone] = {
            ...(usersDb[cleanPhone] || {}),
            phone: cleanPhone,
            password: newResetPassword,
            name: usersDb[cleanPhone]?.name || `Customer ${cleanPhone.slice(-4)}`,
            role: usersDb[cleanPhone]?.role || "CUSTOMER",
          };
          localStorage.setItem("upay_phone_users", JSON.stringify(usersDb));
        } catch {}
      }
    }

    setIsAuthenticating(false);
    setSuccessMsg(
      isBn
        ? "পাসওয়ার্ড/পিন সফলভাবে পরিবর্তন করা হয়েছে! লগইন পেজে রিডাইরেক্ট করা হচ্ছে..."
        : "PIN/Password reset successfully! Redirecting to login page..."
    );

    // Pre-fill fields on login screen for smooth sign-in
    if (forgotChannel === "phone") {
      setAuthMethod("phone");
      setPhoneNumber(forgotIdentifier);
      setPhonePin(newResetPassword);
    } else {
      setAuthMethod("email");
      setEmail(forgotIdentifier);
      setPassword(newResetPassword);
    }

    setNewResetPassword("");
    setConfirmResetPassword("");
    setEnteredOtp("");
    setReceivedOtp("");

    setTimeout(() => {
      setMode("login");
      setSuccessMsg(
        isBn
          ? "পাসওয়ার্ড আপডেট সম্পন্ন। আপনার নতুন পিন/পাসওয়ার্ড দিয়ে সাইন ইন করুন।"
          : "Credentials updated! Please sign in with your new PIN/Password."
      );
    }, 1200);
  };

  // 2. Upay MFS Phone Number Sign In (Strict Registration & PIN Verification)
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !phonePin) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে মোবাইল নম্বর ও গোপন পিন/পাসওয়ার্ড প্রদান করুন"
          : "Please provide mobile number and PIN/password"
      );
      return;
    }

    const cleanDigits = normalizeBdDigits(phoneNumber);
    if (cleanDigits.length !== 11 || !cleanDigits.startsWith("01")) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712-894102)"
          : "Please enter a valid 11-digit mobile number (e.g. 01712-894102)"
      );
      return;
    }

    if (phonePin.length < 4) {
      setErrorMsg(
        isBn
          ? "গোপন পিন কমপক্ষে ৪ সংখ্যার হতে হবে"
          : "PIN / Password must be at least 4 digits"
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    // 1. Check local credential registry (saves across resets & registrations)
    let localUsers: Record<string, any> = {};
    if (typeof window !== "undefined") {
      try {
        localUsers = JSON.parse(localStorage.getItem("upay_phone_users") || "{}");
      } catch {}
    }

    const localAccount = localUsers[cleanDigits];
    const demoAccount = DEMO_PHONE_ACCOUNTS[cleanDigits];
    const registeredAccount = localAccount || demoAccount;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const autoRole = detectRoleFromIdentifier(phoneNumber).toLowerCase();

    let backendSuccess = false;
    let userData: any = null;
    let tokenData: string | undefined = undefined;

    // First attempt to verify with backend API if running
    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/phone-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          password: phonePin,
          role: autoRole,
          deviceFingerprint:
            typeof window !== "undefined" ? window.navigator.userAgent : "browser",
        }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      // Backend says user account does not exist
      if (res.status === 404 || data?.error?.code === "USER_NOT_FOUND") {
        setErrorMsg(
          isBn
            ? "এই মোবাইল নম্বরটি নিবন্ধিত নয়! অনুগ্রহ করে প্রথমে নতুন অ্যাকাউন্ট খুলুন।"
            : "This mobile number is not registered. Please create an account first."
        );
        setIsAuthenticating(false);
        return;
      }

      // Backend says password / PIN does not match
      if (res.status === 401 || data?.error?.code === "INVALID_CREDENTIALS") {
        setErrorMsg(
          isBn
            ? "ভুল গোপন পিন বা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Incorrect secret PIN or password. Please try again."
        );
        setIsAuthenticating(false);
        return;
      }

      if (res.ok && data?.success) {
        backendSuccess = true;
        userData = data.user;
        tokenData = data.token;
      } else if (data?.error?.message) {
        setErrorMsg(data.error.message);
        setIsAuthenticating(false);
        return;
      }
    } catch (networkErr) {
      console.warn("Backend phone login unreachable, checking local credential registry:", networkErr);
    }

    // Backend authenticated successfully
    if (backendSuccess && userData) {
      const detected = detectRoleFromIdentifier(phoneNumber);
      const { role, badge } = mapRoleToDisplay(userData.role || detected);

      const profile: UserProfile = {
        name: userData.displayName || userData.name || `User ${userData.phone?.slice(-4) || ""}`,
        email: userData.email || `${userData.rawPhone || cleanDigits}@upay.mfs`,
        avatar: getInitials(userData.displayName, userData.email),
        role,
        badge,
        rawRole: userData.role || detected,
        phone: userData.phone || phoneNumber,
        provider: "phone",
        token: tokenData,
        wallet: userData.wallet,
      };

      setSuccessMsg(
        isBn
          ? "মোবাইল নম্বর ও পিন সফলভাবে যাচাই হয়েছে!"
          : "Authenticated successfully via Upay Mobile Number!"
      );
      setTimeout(() => onLogin(profile), 500);
      return;
    }

    // IF BACKEND IS NOT REACHABLE (offline / client-side resilience):
    // 1. STRICT CHECK: Is this phone number registered?
    if (!registeredAccount) {
      setErrorMsg(
        isBn
          ? "এই মোবাইল নম্বরটি নিবন্ধিত নয়! অনুগ্রহ করে প্রথমে নতুন অ্যাকাউন্ট খুলুন।"
          : "This mobile number is not registered. Please create an account first."
      );
      setIsAuthenticating(false);
      return;
    }

    // 2. STRICT CHECK: Does the PIN match the registered account?
    const expectedPin = String(registeredAccount.password || registeredAccount.pin || "");
    if (expectedPin && expectedPin !== phonePin) {
      setErrorMsg(
        isBn
          ? "ভুল গোপন পিন বা পাসওয়ার্ড! অনুগ্রহ করে আবার চেষ্টা করুন।"
          : "Incorrect secret PIN or password. Please try again."
      );
      setIsAuthenticating(false);
      return;
    }

    // 3. User is registered AND PIN matches!
    const formatted = `+880 ${cleanDigits.slice(-10, -6)}-${cleanDigits.slice(-6)}`;
    const assignedRole = registeredAccount.role || detectRoleFromIdentifier(phoneNumber);
    const { role, badge } = mapRoleToDisplay(assignedRole);

    const fallbackProfile: UserProfile = {
      name: registeredAccount.name || `Customer ${cleanDigits.slice(-4)}`,
      email: registeredAccount.email || `${cleanDigits}@upay.mfs`,
      avatar: getInitials(registeredAccount.name, registeredAccount.email),
      role,
      badge,
      rawRole: assignedRole,
      phone: formatted,
      provider: "phone",
      wallet: {
        balance: registeredAccount.balance ?? 45250,
        currency: "BDT",
        status: "ACTIVE",
        dailyLimit: 100000,
        monthlyLimit: 500000,
      },
    };

    setSuccessMsg(
      isBn
        ? "মোবাইল নম্বর ও পিন সফলভাবে যাচাই হয়েছে!"
        : "Authenticated successfully via Upay Mobile Number!"
    );
    setTimeout(() => onLogin(fallbackProfile), 500);
  };

  // 3. Upay MFS Phone Number Register
  const handlePhoneRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !phonePin || !confirmPhonePin || !name.trim()) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে সকল তথ্য পূরণ করুন (নাম, মোবাইল নম্বর ও পিন)"
          : "Please fill in all fields (Name, Phone number, and PIN)"
      );
      return;
    }

    const cleanDigits = normalizeBdDigits(phoneNumber);
    if (cleanDigits.length !== 11 || !cleanDigits.startsWith("01")) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712-894102)"
          : "Please enter a valid 11-digit mobile number (e.g. 01712-894102)"
      );
      return;
    }

    if (phonePin !== confirmPhonePin) {
      setErrorMsg(isBn ? "পিন দুটি মিলছে না" : "PINs / Passwords do not match");
      return;
    }
    if (phonePin.length < 4) {
      setErrorMsg(
        isBn ? "পিন কমপক্ষে ৪ অক্ষরের হতে হবে" : "PIN must be at least 4 digits"
      );
      return;
    }

    // Check if account already exists
    let usersDb: Record<string, any> = {};
    if (typeof window !== "undefined") {
      try {
        usersDb = JSON.parse(localStorage.getItem("upay_phone_users") || "{}");
      } catch {}
    }
    if (usersDb[cleanDigits] || DEMO_PHONE_ACCOUNTS[cleanDigits]) {
      setErrorMsg(
        isBn
          ? "এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত! অনুগ্রহ করে সাইন ইন করুন।"
          : "This mobile number is already registered! Please sign in."
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsAuthenticating(true);

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const autoRole = detectRoleFromIdentifier(phoneNumber + " " + name).toLowerCase();

    // Persist new user in local registry immediately
    usersDb[cleanDigits] = {
      phone: cleanDigits,
      password: phonePin,
      name: name.trim() || `User ${cleanDigits.slice(-4)}`,
      role: autoRole.toUpperCase(),
      balance: 45250,
      email: `${cleanDigits}@upay.mfs`,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("upay_phone_users", JSON.stringify(usersDb));
      } catch {}
    }

    try {
      const res = await fetch(`${backendUrl}/api/v1/auth/phone-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          password: phonePin,
          name: name.trim() || `User ${cleanDigits.slice(-4)}`,
          role: autoRole,
          deviceFingerprint:
            typeof window !== "undefined" ? window.navigator.userAgent : "browser",
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (res.ok && data?.success) {
        const user = data.user;
        const detected = detectRoleFromIdentifier(cleanDigits + " " + name);
        const { role, badge } = mapRoleToDisplay(user.role || detected);

        const profile: UserProfile = {
          name: user.displayName || name.trim() || "Wallet User",
          email: user.email || `${user.rawPhone || cleanDigits}@upay.mfs`,
          avatar: getInitials(name || user.displayName, user.email),
          role,
          badge,
          rawRole: user.role || detected,
          phone: user.phone || `+880 ${cleanDigits.slice(-10, -6)}-${cleanDigits.slice(-6)}`,
          provider: "phone",
          token: data.token,
          wallet: user.wallet,
        };

        setSuccessMsg(
          isBn
            ? "মোবাইল ওয়ালেট সফলভাবে নিবন্ধিত হয়েছে!"
            : "Upay Wallet account registered successfully!"
        );
        setTimeout(() => onLogin(profile), 600);
        return;
      } else if (data?.error?.message) {
        setErrorMsg(data.error.message);
        setIsAuthenticating(false);
        return;
      }
    } catch (networkErr) {
      console.warn("Backend registration unreachable, local storage created:", networkErr);
    }

    // Client registration completed
    const formatted = `+880 ${cleanDigits.slice(-10, -6)}-${cleanDigits.slice(-6)}`;
    const fallbackRole = detectRoleFromIdentifier(cleanDigits + " " + name);
    const { role, badge } = mapRoleToDisplay(fallbackRole);

    const fallbackProfile: UserProfile = {
      name: name.trim() || `User ${cleanDigits.slice(-4) || "Wallet"}`,
      email: `${cleanDigits || "01700000000"}@upay.mfs`,
      avatar: getInitials(name || "User", "user@upay.mfs"),
      role,
      badge,
      rawRole: fallbackRole,
      phone: formatted,
      provider: "phone",
      wallet: {
        balance: 45250,
        currency: "BDT",
        status: "ACTIVE",
        dailyLimit: 100000,
        monthlyLimit: 500000,
      },
    };
    setSuccessMsg(
      isBn
        ? "মোবাইল ওয়ালেট সফলভাবে নিবন্ধিত হয়েছে!"
        : "Upay Wallet account registered successfully!"
    );
    setTimeout(() => onLogin(fallbackProfile), 600);
  };

  // 4. Email & Password Sign In
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
      const detected = detectRoleFromIdentifier(email);
      const syncResult = await syncFirebaseUserToSupabase(user, detected.toLowerCase() as any);

      const resolvedRole = (syncResult?.user?.role || detected) as any;
      const { role, badge } = mapRoleToDisplay(resolvedRole);

      const profile: UserProfile = {
        name: user.displayName || syncResult?.user?.display_name || email.split("@")[0],
        email: user.email || email,
        avatar: getInitials(user.displayName, email),
        role,
        badge,
        rawRole: resolvedRole,
        photoURL: user.photoURL || undefined,
        provider: email.toLowerCase().includes("@gmail.com") ? "google" : "email",
        token: syncResult?.token,
        wallet: syncResult?.wallet,
      };

      setSuccessMsg(isBn ? "লগইন সফল হয়েছে!" : "Sign-in verified via Firebase!");
      setTimeout(() => onLogin(profile), 500);
    } catch (err: any) {
      console.error("Email login error:", err);
      const code = err.code || "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
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
    if (!email || !password || !phoneNumber) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে সকল তথ্য পূরণ করুন (ইমেইল, মোবাইল নম্বর ও পাসওয়ার্ড)"
          : "Please fill in all required fields (Email, Phone number, and Password)"
      );
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

      const cleanDigits = phoneNumber.replace(/\D/g, "");
      const formattedPhone = cleanDigits.length >= 10
        ? `+880 ${cleanDigits.slice(-10, -6)}-${cleanDigits.slice(-6)}`
        : phoneNumber.trim();

      const detected = detectRoleFromIdentifier(email + " " + name + " " + cleanDigits);
      const syncResult = await syncFirebaseUserToSupabase(user, detected.toLowerCase() as any, formattedPhone);
      const resolvedRole = (syncResult?.user?.role || detected) as any;
      const { role, badge } = mapRoleToDisplay(resolvedRole);

      // Best effort sync with Upay phone credentials store
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      fetch(`${backendUrl}/api/v1/auth/phone-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanDigits,
          password: password,
          name: name.trim(),
          role: resolvedRole,
        }),
      }).catch(() => {});

      const profile: UserProfile = {
        name: name.trim() || email.split("@")[0],
        email: user.email || email,
        avatar: getInitials(name || email.split("@")[0], email),
        role,
        badge,
        rawRole: resolvedRole,
        phone: formattedPhone,
        token: syncResult?.token,
        wallet: syncResult?.wallet,
      };

      setSuccessMsg(
        isBn
          ? "অ্যাকাউন্ট সফলভাবে তৈরি এবং অনুমোদিত হয়েছে!"
          : "Account created and authorized in Firebase!"
      );
      setTimeout(() => onLogin(profile), 600);
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
              ? "বাংলাদেশ মোবাইল ফাইন্যান্সিয়াল সার্ভিসেস (MFS) গ্রাহক ওয়ালেট ও এআই জালিয়াতি প্রতিরোধ ব্যবস্থা"
              : "AI-Powered MFS Customer Wallet & Enterprise Fraud Intelligence Platform"}
          </p>
        </div>

        {mode === "forgot" ? (
          /* Dedicated Forgot Password / PIN & OTP Page */
          <div className="space-y-4 animate-fadeIn">
            {/* Header with Back to Sign In Redirect Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                  setIsOtpModalOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors py-1 px-1.5 rounded-md hover:bg-slate-100"
              >
                <ArrowLeft size={14} />
                <span>{isBn ? "লগইন পেজে ফিরে যান" : "Back to Sign In"}</span>
              </button>
              <span className="text-[10px] font-bold tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase">
                {isBn ? "রিসেট সিকিউরিটি" : "Security Reset"}
              </span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                {forgotStep === "request"
                  ? isBn
                    ? "পিন বা পাসওয়ার্ড ভুলে গেছেন?"
                    : "Reset Password or PIN"
                  : isBn
                  ? "নতুন পাসওয়ার্ড বা পিন সেট করুন"
                  : "Set New Password / PIN"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {forgotStep === "request"
                  ? isBn
                    ? "নিবন্ধিত মোবাইল নম্বর বা ইমেইলে একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হবে।"
                    : "Enter your registered phone or email to receive a 6-digit OTP code."
                  : isBn
                  ? "আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই করা হয়েছে। নতুন পিন/পাসওয়ার্ড দিন।"
                  : "OTP verified! Please set your new credentials to sign in."}
              </p>
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

            {forgotStep === "request" ? (
              <div className="space-y-4">
                {/* Channel Switcher */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotChannel("phone");
                      setForgotIdentifier(phoneNumber || "");
                      setErrorMsg("");
                    }}
                    className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      forgotChannel === "phone"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Phone size={13} className={forgotChannel === "phone" ? "text-blue-600" : "text-slate-400"} />
                    <span>{isBn ? "মোবাইল ওটিপি" : "Phone SMS OTP"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotChannel("email");
                      setForgotIdentifier(email || "");
                      setErrorMsg("");
                    }}
                    className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                      forgotChannel === "email"
                        ? "bg-white text-blue-700 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Mail size={13} className={forgotChannel === "email" ? "text-blue-600" : "text-slate-400"} />
                    <span>{isBn ? "ইমেইল ওটিপি" : "Email OTP"}</span>
                  </button>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-3">
                  {forgotChannel === "phone" ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-400" />
                        <span>{isBn ? "উপায় মোবাইল নম্বর" : "Upay Mobile Number"}</span>
                      </label>
                      <div className="flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 bg-white overflow-hidden transition-all">
                        <span className="px-3 py-2 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center select-none">
                          +880
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="01712-894102"
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {isBn ? "১১ ডিজিট (যেমন: 017XXXXXXXX বা 019XXXXXXXX)" : "11 digits (e.g. 017XXXXXXXX)"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        <span>{isBn ? "নিবন্ধিত ইমেইল ঠিকানা" : "Registered Email Address"}</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <span>{isBn ? "ওটিপি তৈরি হচ্ছে..." : "Dispatching OTP Code..."}</span>
                    ) : (
                      <>
                        <span>{isBn ? "৬-সংখ্যার ওটিপি কোড পাঠান" : "Send 6-Digit OTP Code"}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {isBn ? "← সাইন ইন পেজে ফিরে যান" : "← Cancel and Back to Login"}
                  </button>
                </div>
              </div>
            ) : (
              /* Set New Password / PIN Step */
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>{isBn ? "যাচাইকৃত:" : "Verified Account:"} {forgotIdentifier}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {isBn ? "অনুমোদিত" : "OTP OK"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <KeyRound size={12} className="text-slate-400" />
                    <span>
                      {forgotChannel === "phone"
                        ? isBn
                          ? "নতুন গোপন পিন (৪-৬ সংখ্যা)"
                          : "New Secret PIN (4-6 digits)"
                        : isBn
                        ? "নতুন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                        : "New Password (min 4 characters)"}
                    </span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <KeyRound size={12} className="text-slate-400" />
                    <span>
                      {forgotChannel === "phone"
                        ? isBn
                          ? "নতুন পিন নিশ্চিত করুন"
                          : "Confirm New Secret PIN"
                        : isBn
                        ? "নতুন পাসওয়ার্ড নিশ্চিত করুন"
                        : "Confirm New Password"}
                    </span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <span>{isBn ? "সংরক্ষণ করা হচ্ছে..." : "Updating Credentials..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন ও লগইন করুন" : "Save & Redirect to Login"}</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg("");
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {isBn ? "← বাতিল করে লগইনে ফিরুন" : "← Cancel and Back to Login"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Normal Sign In / Register Forms */
          <>
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

            {/* Social Authentication: Google */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-700 hover:border-slate-400"
              >
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
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                {isBn ? "অথবা সরাসরি লগইন" : "or direct sign in"}
              </span>
            </div>

            {/* Auth Method Switcher: Mobile Phone (upay MFS) vs Email */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setErrorMsg("");
                }}
                className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "phone"
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Phone size={13} className={authMethod === "phone" ? "text-blue-600" : "text-slate-400"} />
                <span>{isBn ? "মোবাইল নম্বর" : "Mobile Number"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setErrorMsg("");
                }}
                className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "email"
                    ? "bg-white text-blue-700 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail size={13} className={authMethod === "email" ? "text-blue-600" : "text-slate-400"} />
                <span>{isBn ? "ইমেইল" : "Email"}</span>
              </button>
            </div>

            {/* Phone Number Authentication Form */}
            {authMethod === "phone" ? (
              mode === "login" ? (
                <form onSubmit={handlePhoneSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{isBn ? "উপায় মোবাইল ওয়ালেট নম্বর" : "Upay Mobile Wallet Number"}</span>
                    </label>
                    <div className="flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 bg-white overflow-hidden transition-all">
                      <span className="px-3 py-2 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center select-none">
                        +880
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="01712-894102"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? "১১ ডিজিট (যেমন: 017XXXXXXXX বা 019XXXXXXXX)" : "11 digits (e.g. 017XXXXXXXX or 019XXXXXXXX)"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <KeyRound size={12} className="text-slate-400" />
                        <span>{isBn ? "গোপন পিন / পাসওয়ার্ড" : "Secret PIN / Password"}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenForgot("phone")}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {isBn ? "পিন ভুলে গেছেন?" : "Forgot PIN?"}
                      </button>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder={isBn ? "৪-৬ সংখ্যার পিন বা পাসওয়ার্ড" : "4-6 digit secret PIN / password"}
                      value={phonePin}
                      onChange={(e) => setPhonePin(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <span>{isBn ? "যাচাই করা হচ্ছে..." : "Verifying with Upay Backend..."}</span>
                    ) : (
                      <>
                        <span>{isBn ? "মোবাইল নম্বর দিয়ে প্রবেশ করুন" : "Sign In with Mobile"}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  {/* Registered Demo Accounts Quick-Fill Badge */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600">
                        {isBn ? "💡 টেস্ট অ্যাকাউন্ট (পিন: 1234):" : "💡 Test Demo Accounts (PIN: 1234):"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber("01712894102");
                          setPhonePin("1234");
                          setErrorMsg("");
                        }}
                        className="py-1 px-1.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-center font-medium transition-colors border border-slate-200/60 truncate"
                        title="Customer: 01712894102 / 1234"
                      >
                        👤 Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber("01700112233");
                          setPhonePin("1234");
                          setErrorMsg("");
                        }}
                        className="py-1 px-1.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-center font-medium transition-colors border border-slate-200/60 truncate"
                        title="Analyst: 01700112233 / 1234"
                      >
                        🔍 Analyst
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber("01711223344");
                          setPhonePin("1234");
                          setErrorMsg("");
                        }}
                        className="py-1 px-1.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-center font-medium transition-colors border border-slate-200/60 truncate"
                        title="Admin: 01711223344 / 1234"
                      >
                        🛡️ Admin
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePhoneRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span>{isBn ? "পূর্ণ নাম" : "Full Name"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tanvir Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{isBn ? "উপায় মোবাইল নম্বর" : "Upay Mobile Number"}</span>
                    </label>
                    <div className="flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 bg-white overflow-hidden transition-all">
                      <span className="px-3 py-2 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center select-none">
                        +880
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="01712-894102"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? "১১ ডিজিট (যেমন: 017XXXXXXXX)" : "11 digits (e.g. 017XXXXXXXX)"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound size={12} className="text-slate-400" />
                      <span>{isBn ? "গোপন পিন / পাসওয়ার্ড (কমপক্ষে ৪ সংখ্যা)" : "Secret PIN / Password (min 4 digits)"}</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={phonePin}
                      onChange={(e) => setPhonePin(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound size={12} className="text-slate-400" />
                      <span>{isBn ? "পিন নিশ্চিত করুন" : "Confirm PIN / Password"}</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••"
                      value={confirmPhonePin}
                      onChange={(e) => setConfirmPhonePin(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <span>{isBn ? "নিবন্ধন করা হচ্ছে..." : "Registering with Upay..."}</span>
                    ) : (
                      <>
                        <span>
                          {isBn
                            ? "মোবাইল ওয়ালেট নিবন্ধন করুন"
                            : "Register Upay Mobile Wallet"}
                        </span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )
            ) : (
              /* Email & Password Form */
              mode === "login" ? (
                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      <span>{isBn ? "নিবন্ধিত ইমেইল" : "Registered Email"}</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="customer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Lock size={12} className="text-slate-400" />
                        <span>{isBn ? "পাসওয়ার্ড" : "Password"}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleOpenForgot("email")}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot Password?"}
                      </button>
                    </div>
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
                      <span>{isBn ? "যাচাই করা হচ্ছে..." : "Verifying with Firebase..."}</span>
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
                      <span>{isBn ? "পূর্ণ নাম" : "Full Name"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tanvir Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />
                      <span>{isBn ? "ইমেইল ঠিকানা" : "Email Address"}</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="user@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{isBn ? "মোবাইল ওয়ালেট নম্বর" : "Mobile Phone Number"}</span>
                    </label>
                    <div className="flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 bg-white overflow-hidden transition-all">
                      <span className="px-3 py-2 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center select-none">
                        +880
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="01712-894102"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {isBn ? "১১ ডিজিট (যেমন: 017XXXXXXXX)" : "11 digits (e.g. 017XXXXXXXX)"}
                    </p>
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
                      <span>{isBn ? "নিবন্ধন করা হচ্ছে..." : "Registering with Firebase..."}</span>
                    ) : (
                      <>
                        <span>
                          {isBn
                            ? "অ্যাকাউন্ট তৈরি করুন"
                            : "Create Account"}
                        </span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </form>
              )
            )}
          </>
        )}

        {/* Security / Bangladesh Bank Accreditation */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-[10.5px] text-slate-500">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <span>
            {isBn
              ? "বাংলাদেশ ব্যাংক BFIU সার্কুলার ২৫/২০২৩ কমপ্লায়েন্ট ও ফায়ারবেস অথরাইজড গেটওয়ে"
              : "Compliant with Bangladesh Bank BFIU Circular 25/2023 & Firebase Authentication"}
          </span>
        </div>
      </div>

      {/* 6-Digit OTP Verification Modal Dialog */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isBn ? "সিকিউরিটি ওটিপি যাচাই" : "Security OTP Verification"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBn ? "৬ সংখ্যার কোডটি দিন" : "Enter the 6-digit code"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Smartphone size={13} className="text-blue-600" />
                <span>
                  {isBn
                    ? `কোড পাঠানো হয়েছে: ${forgotIdentifier}`
                    : `Code sent to: ${forgotIdentifier}`}
                </span>
              </p>
              <p className="text-[11px] text-blue-700/80">
                {isBn
                  ? "আপনার ফোনের মেসেজ বা উপরের নোটিফিকেশন চেক করুন।"
                  : "Check your phone messages or the popup banner above."}
              </p>
            </div>

            {/* Simulated Live Received OTP Helper Badge */}
            {receivedOtp && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Bell size={13} className="text-emerald-600" />
                  <span>
                    {isBn ? "সিমুলেটেড কোড:" : "Incoming OTP:"}{" "}
                    <strong className="font-mono tracking-widest text-emerald-950 font-black">
                      {receivedOtp}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(receivedOtp)}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] transition-colors shadow-xs"
                >
                  {isBn ? "বসান" : "Auto-fill"}
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block text-center">
                  {isBn ? "৬-ডিজিটের ভেরিফিকেশন কোড" : "6-Digit Verification Code"}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-2xl font-mono font-black tracking-[0.4em] py-2.5 px-3 border-2 border-blue-400 focus:border-blue-600 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-blue-900"
                />
              </div>

              {/* Countdown & Resend */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  {isCountingDown
                    ? `${isBn ? "মেয়াদ বাকি:" : "Expires in:"} ${formatCountdown(otpCountdown)}`
                    : isBn
                    ? "কোডের মেয়াদ শেষ হয়েছে"
                    : "OTP expired"}
                </span>
                <button
                  type="button"
                  disabled={isCountingDown && otpCountdown > 240}
                  onClick={() => handleRequestOtp()}
                  className="text-blue-600 hover:text-blue-800 font-bold disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11} className={isAuthenticating ? "animate-spin" : ""} />
                  <span>{isBn ? "পুনরায় পাঠান" : "Resend OTP"}</span>
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(false)}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating || enteredOtp.length < 6}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isAuthenticating ? (
                    <span>{isBn ? "যাচাই..." : "Verifying..."}</span>
                  ) : (
                    <>
                      <span>{isBn ? "যাচাই করুন" : "Verify Code"}</span>
                      <Check size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realistic Simulated Incoming SMS / Message Push Alert Popup */}
      {incomingMessagePopup?.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-slate-900/95 backdrop-blur-md text-white border border-slate-700 rounded-2xl p-3.5 shadow-2xl animate-bounce-short">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-200">
                    {incomingMessagePopup.sender}
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9.5px] text-slate-400">{incomingMessagePopup.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                  {isBn ? "আপনার সিকিউরিটি ওটিপি কোড:" : "Your security OTP code is:"}{" "}
                  <strong className="font-mono font-black text-amber-300 text-sm tracking-wider">
                    {incomingMessagePopup.otp}
                  </strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingMessagePopup(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              {isBn ? "🔒 ৫ মিনিট কার্যকর" : "🔒 Valid for 5 minutes"}
            </span>
            <button
              type="button"
              onClick={() => {
                setEnteredOtp(incomingMessagePopup.otp);
                setIsOtpModalOpen(true);
                setIncomingMessagePopup(null);
              }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check size={12} />
              <span>{isBn ? "ওটিপি বসান (Auto-fill)" : "Auto-fill OTP"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
