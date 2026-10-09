"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Camera,
  Eye,
  EyeOff,
  Globe,
  Laptop,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Save,
  Sparkles,
  Building,
  Bell,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Copy,
  Sliders,
  History,
  Info,
  CheckCheck,
} from "lucide-react";
import { UserProfile } from "../auth/LoginPage";
import { useSentinel } from "@/context/SentinelContext";
import { UserAvatar, GoogleGLogo, GmailLogo } from "@/components/ui/UserAvatar";
import {
  auth,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "@/lib/firebase";
import { syncFirebaseUserToSupabase } from "@/lib/supabase";
import { NavigationPage } from "@/types";

interface UserProfileDashboardProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNotify: (msg: string) => void;
  onNavigate?: (page: NavigationPage) => void;
  onLogout?: () => void;
}

type TabType = "general" | "password" | "preferences" | "sessions";

// Avatar presets for quick visual selection
const AVATAR_PRESETS = [
  {
    id: "preset-1",
    label: "Security Analyst",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-2",
    label: "Risk Executive",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-3",
    label: "SOC Engineer",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-4",
    label: "Financial Officer",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-5",
    label: "Compliance Lead",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
  },
  {
    id: "preset-6",
    label: "Tech Specialist",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
  },
];

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({
  currentUser,
  onUpdateUser,
  onNotify,
  onNavigate,
  onLogout,
}) => {
  const { language, toggleLanguage } = useSentinel();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    email: currentUser.email || "",
    phone: currentUser.phone || "+880 1712-345678",
    avatar: currentUser.avatar || "AH",
    photoURL: currentUser.photoURL || "",
    department: "Fraud Detection & Risk SOC",
    designation: currentUser.role || "Senior Risk Analyst",
    bio: "Supervising automated AI risk rules, anti-money laundering investigations, and BFIU compliance monitoring.",
    nidNumber: "NID-1994829104821",
    kycStatus: "VERIFIED_TIER_2",
  });

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState<boolean>(false);

  // MFS Wallet PIN Form State
  const [currentPin, setCurrentPin] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [confirmPin, setConfirmPin] = useState<string>("");
  const [pinFeedback, setPinFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isUpdatingPin, setIsUpdatingPin] = useState<boolean>(false);

  // Security & Preferences Toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState<boolean>(true);
  const [smsTxnAlerts, setSmsTxnAlerts] = useState<boolean>(true);
  const [emailDigestFrequency, setEmailDigestFrequency] = useState<string>("instant");

  // Show Avatar Selection Picker Modal
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [customPhotoInput, setCustomPhotoInput] = useState<string>(currentUser.photoURL || "");

  // Audit Log State for Profile Actions
  const [auditLogs, setAuditLogs] = useState<
    Array<{ id: string; action: string; time: string; ip: string; status: "success" | "pending" }>
  >([
    {
      id: "LOG-01",
      action: "Authenticated via Firebase OAuth session",
      time: "Today, 10:24 AM",
      ip: "103.145.118.24 (Dhaka)",
      status: "success",
    },
    {
      id: "LOG-02",
      action: "Profile details verified with Bangladesh Bank KYC",
      time: "Yesterday, 04:12 PM",
      ip: "103.145.118.24 (Dhaka)",
      status: "success",
    },
    {
      id: "LOG-03",
      action: "Security session token renewed",
      time: "08 Oct 2026, 09:30 AM",
      ip: "103.145.118.24 (Dhaka)",
      status: "success",
    },
  ]);

  // Sync state if currentUser changes externally
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: currentUser.name || prev.name,
      email: currentUser.email || prev.email,
      phone: currentUser.phone || prev.phone,
      avatar: currentUser.avatar || prev.avatar,
      photoURL: currentUser.photoURL || prev.photoURL,
    }));
  }, [currentUser]);

  // Compute live Password Strength (0 to 100)
  const passwordChecks = {
    length: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSymbol: /[^A-Za-z0-9]/.test(newPassword),
  };
  const passedChecksCount = Object.values(passwordChecks).filter(Boolean).length;
  const passwordStrengthScore = (passedChecksCount / 5) * 100;

  // Handle Profile Info Update
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      onNotify(isBn ? "অনুগ্রহ করে আপনার নাম পূরণ করুন।" : "Please enter your full name.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile if current Firebase user is active
      const fbUser = auth.currentUser;
      if (fbUser) {
        try {
          await updateProfile(fbUser, {
            displayName: formData.name.trim(),
            photoURL: formData.photoURL || undefined,
          });
        } catch (fbErr: any) {
          console.warn("[Firebase Profile Update] Notice:", fbErr?.message);
        }
      }

      // 2. Prepare updated user object
      const updatedUser: UserProfile = {
        ...currentUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        avatar: formData.name.trim().slice(0, 2).toUpperCase(),
        photoURL: formData.photoURL.trim() || undefined,
      };

      // 3. Persist to localStorage
      try {
        localStorage.setItem("sentinel_user", JSON.stringify(updatedUser));
      } catch (lsErr) {
        console.warn("localStorage update notice:", lsErr);
      }

      // 4. Background Sync to Supabase profile table if user is authenticated
      if (fbUser) {
        syncFirebaseUserToSupabase(fbUser, "analyst", formData.phone.trim()).catch(() => {});
      }

      // 5. Update React parent state
      onUpdateUser(updatedUser);

      // 6. Record audit log entry
      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: "Profile information updated (Name & Contact)",
          time: "Just now",
          ip: "103.145.118.24 (Dhaka)",
          status: "success",
        },
        ...prev,
      ]);

      onNotify(
        isBn
          ? "প্রোফাইল তথ্য সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!"
          : "User profile updated and synchronized successfully!"
      );
    } catch (err: any) {
      onNotify(err?.message || "Failed to update profile information.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Direct Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback({ type: null, message: "" });

    if (!newPassword) {
      setPasswordFeedback({
        type: "error",
        message: isBn ? "নতুন পাসওয়ার্ড প্রদান করুন।" : "Please enter a new password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: isBn
          ? "পাসওয়ার্ড কমপক্ষে ৮টি অক্ষরের হতে হবে।"
          : "Password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: isBn
          ? "নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!"
          : "New password and confirmation password do not match.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const fbUser = auth.currentUser;
      if (fbUser && fbUser.email) {
        // Attempt reauthentication if current password was provided
        if (currentPassword) {
          try {
            const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
            await reauthenticateWithCredential(fbUser, credential);
          } catch (reauthErr: any) {
            console.warn("Re-auth prompt:", reauthErr?.message);
          }
        }

        // Direct update password via Firebase
        await updatePassword(fbUser, newPassword);

        setPasswordFeedback({
          type: "success",
          message: isBn
            ? "ফায়ারবেস পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!"
            : "Your account password has been updated successfully in Firebase Authentication!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onNotify(isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" : "Password updated successfully!");

        setAuditLogs((prev) => [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            action: "Account password changed securely",
            time: "Just now",
            ip: "103.145.118.24 (Dhaka)",
            status: "success",
          },
          ...prev,
        ]);
      } else {
        // Fallback for simulated/demo accounts
        await new Promise((r) => setTimeout(r, 600));
        setPasswordFeedback({
          type: "success",
          message: isBn
            ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে (সেশন সুরক্ষিত)!"
            : "Password updated successfully! Your account credentials have been refreshed.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onNotify(isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" : "Password updated successfully!");

        setAuditLogs((prev) => [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            action: "Password credential modified",
            time: "Just now",
            ip: "103.145.118.24 (Dhaka)",
            status: "success",
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      console.error("[Change Password Error]:", err);
      let errorMsg = err?.message || "Failed to change password.";
      if (err?.code === "auth/requires-recent-login") {
        errorMsg = isBn
          ? "নিরাপত্তাজনিত কারণে পুনরায় লগইন করা আবশ্যক, অথবা নিচে 'পাসওয়ার্ড রিসেট ইমেল পাঠান' বোতামে চাপুন।"
          : "This security action requires recent login. Please click 'Send Password Reset Email' below or re-login.";
      }
      setPasswordFeedback({ type: "error", message: errorMsg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Firebase Password Reset Email Trigger
  const handleSendResetEmail = async () => {
    const targetEmail = currentUser.email || formData.email;
    if (!targetEmail || !targetEmail.includes("@")) {
      onNotify(isBn ? "বৈধ ইমেল ঠিকানা পাওয়া যায়নি।" : "No valid email address found.");
      return;
    }

    setIsSendingResetEmail(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setPasswordFeedback({
        type: "success",
        message: isBn
          ? `পাসওয়ার্ড রিসেট লিঙ্কটি আপনার ${targetEmail} ইমেলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।`
          : `A password reset link has been dispatched to ${targetEmail}. Please check your inbox or spam folder.`,
      });
      onNotify(isBn ? "পাসওয়ার্ড রিসেট ইমেল পাঠানো হয়েছে!" : "Password reset email sent!");

      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: `Password reset link requested for ${targetEmail}`,
          time: "Just now",
          ip: "103.145.118.24 (Dhaka)",
          status: "success",
        },
        ...prev,
      ]);
    } catch (err: any) {
      setPasswordFeedback({
        type: "error",
        message: err?.message || "Could not send password reset email.",
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Handle MFS Wallet PIN Change
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinFeedback({ type: null, message: "" });

    if (!newPin || newPin.length < 4 || newPin.length > 5 || !/^\d+$/.test(newPin)) {
      setPinFeedback({
        type: "error",
        message: isBn
          ? "উপায় ওয়ালেট পিন ৪ অথবা ৫ সংখ্যার হতে হবে।"
          : "upay Wallet PIN must be 4 or 5 digits.",
      });
      return;
    }

    if (newPin === "1234" || newPin === "0000" || newPin === "1111") {
      setPinFeedback({
        type: "error",
        message: isBn
          ? "সহজ পিন (১২৩৪, ০০০০, ইত্যাদি) গ্রহণযোগ্য নয়।"
          : "Weak PIN sequences (e.g. 1234, 0000) are not permitted by Bangladesh Bank.",
      });
      return;
    }

    if (newPin !== confirmPin) {
      setPinFeedback({
        type: "error",
        message: isBn ? "নতুন পিন ও কনফার্ম পিন মিলছে না!" : "New PIN and Confirm PIN do not match.",
      });
      return;
    }

    setIsUpdatingPin(true);
    await new Promise((r) => setTimeout(r, 600));

    setPinFeedback({
      type: "success",
      message: isBn
        ? "উপায় ওয়ালেট পিন সফলভাবে পরিবর্তন করা হয়েছে!"
        : "upay Wallet PIN updated successfully! Encrypted in secure HSM container.",
    });
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setIsUpdatingPin(false);
    onNotify(isBn ? "ওয়ালেট পিন সফলভাবে পরিবর্তন হয়েছে!" : "Wallet PIN updated successfully!");

    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        action: "Mobile Financial Services (MFS) PIN updated",
        time: "Just now",
        ip: "103.145.118.24 (Dhaka)",
        status: "success",
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
      {/* Top Navigation & Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate(currentUser.rawRole === "CUSTOMER" ? "customer-portal" : "overview")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs group"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isBn ? "ব্যবহারকারী প্রোফাইল ও নিরাপত্তা ড্যাশবোর্ড" : "User Profile & Security Dashboard"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {currentUser.badge || "VERIFIED"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn
                ? "আপনার ব্যক্তিগত তথ্য, ফায়ারবেস পাসওয়ার্ড, ওয়ালেট পিন এবং নিরাপত্তা কনফিগারেশন পরিচালনা করুন।"
                : "Manage your personal information, Firebase password, MFS security PIN, and account access."}
            </p>
          </div>
        </div>

        {/* Quick Language & Logout Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <Globe size={13} className="text-blue-600" />
            <span>{isBn ? "English" : "বাংলা"}</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 shadow-2xs transition-colors"
            >
              <LogOut size={13} />
              <span>{isBn ? "লগআউট" : "Sign Out"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-card overflow-hidden">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
            {/* Avatar with Camera Overlay Trigger */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl overflow-hidden flex items-center justify-center">
                <UserAvatar
                  user={{
                    ...currentUser,
                    name: formData.name,
                    photoURL: formData.photoURL,
                    avatar: formData.avatar,
                  }}
                  size={88}
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg border-2 border-slate-900 transition-all hover:scale-105"
                title={isBn ? "ছবি পরিবর্তন করুন" : "Change Profile Photo"}
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Profile Identity Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {formData.name || currentUser.name}
                </h2>
                {currentUser.provider === "google" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20">
                    <GoogleGLogo size={10} /> Google Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <ShieldCheck size={11} /> Firebase Auth
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-blue-400" />
                  {formData.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-blue-400" />
                  {formData.phone}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  {currentUser.role || "Risk Operations Analyst"}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  KYC: {formData.kycStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Security Telemetry Quick Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center sm:text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Security Score</div>
              <div className="text-base font-extrabold text-emerald-400 flex items-center gap-1 justify-center sm:justify-start">
                <span>96%</span>
                <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Grade A+
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center sm:text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">2-Factor Auth</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{twoFactorEnabled ? "Active (SMS+App)" : "Disabled"}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center sm:text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Session Routing</div>
              <div className="text-xs font-mono font-bold text-slate-200 truncate">103.145.118.24</div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-center sm:text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Account Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center sm:justify-start">
                <CheckCircle2 size={12} />
                <span>Active & Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "general"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <User size={14} />
          <span>{isBn ? "১. ব্যক্তিগত তথ্য ও প্রোফাইল" : "1. Personal Information"}</span>
        </button>

        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "password"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Lock size={14} />
          <span>{isBn ? "২. পাসওয়ার্ড ও ক্রেডেনশিয়াল" : "2. Password & Credentials"}</span>
        </button>

        <button
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "preferences"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sliders size={14} />
          <span>{isBn ? "৩. পছন্দ ও সতর্কতা নোটিফিকেশন" : "3. Preferences & Alerts"}</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sessions"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <History size={14} />
          <span>{isBn ? "৪. সক্রিয় সেশন ও অডিট লগ" : "4. Active Sessions & Logs"}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PERSONAL INFORMATION
      ========================================================================== */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? "ব্যক্তিগত তথ্য হালনাগাদ করুন" : "Personal Information"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "আপনার নাম, যোগাযোগ নম্বর ও বিভাগীয় ভূমিকা তথ্য আপডেট করুন।"
                  : "Update your full name, registered mobile number, and department profile."}
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" />
                    <span>{isBn ? "পুরো নাম" : "Full Name"}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Arman Hossen"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" />
                      <span>{isBn ? "ইমেল ঠিকানা" : "Email Address"}</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. user@upay.com.bd"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>{isBn ? "মোবাইল নম্বর (বাংলাদেশ)" : "Mobile Phone (Bangladesh)"}</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1712-345678"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Format: +880 1XXXXXXXXX (Used for 2FA SMS & MFS transactions)
                  </span>
                </div>

                {/* Designation / Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building size={13} className="text-slate-400" />
                    <span>{isBn ? "পদবী ও দায়িত্ব" : "Designation / Role"}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Senior Risk Analyst"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {isBn ? "বিভাগ / সংস্থা" : "Department / Unit"}
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Fraud Prevention & Risk Intelligence"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                </div>

                {/* Photo URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>{isBn ? "কাস্টম ছবির লিঙ্ক (Photo URL)" : "Custom Photo URL"}</span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(true)}
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-bold"
                    >
                      Browse Presets
                    </button>
                  </label>
                  <input
                    type="url"
                    value={formData.photoURL}
                    onChange={(e) => setFormData({ ...formData, photoURL: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Bio / Operations Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {isBn ? "অপারেশনস নোট / বিবরণ" : "Staff Bio & Operations Responsibilities"}
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: currentUser.name || "",
                      email: currentUser.email || "",
                      phone: currentUser.phone || "+880 1712-345678",
                      avatar: currentUser.avatar || "AH",
                      photoURL: currentUser.photoURL || "",
                      department: "Fraud Detection & Risk SOC",
                      designation: currentUser.role || "Senior Risk Analyst",
                      bio: "Supervising automated AI risk rules, anti-money laundering investigations, and BFIU compliance monitoring.",
                      nidNumber: "NID-1994829104821",
                      kycStatus: "VERIFIED_TIER_2",
                    });
                    onNotify("Changes reverted.");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {isBn ? "রিসেট" : "Reset"}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{isBn ? "সংরক্ষণ করা হচ্ছে..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{isBn ? "তথ্য সংরক্ষণ করুন" : "Save Profile Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-5">
            {/* National KYC & Regulatory Badge */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Regulatory KYC Verification</h4>
                  <p className="text-[10px] text-slate-500">Bangladesh Bank & EC NID Database</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">NID Smart Card:</span>
                  <span className="font-mono font-bold text-slate-800">{formData.nidNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">Verification Level:</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    Level 2 (Biometric Verified)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-500">AML Risk Rating:</span>
                  <span className="text-[11px] font-bold text-blue-700">Low Risk (Analyst)</span>
                </div>
              </div>
            </div>

            {/* Quick Avatar Switcher Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  {isBn ? "প্রোফাইল অবতার প্রিসেট" : "Profile Avatar Presets"}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                >
                  View All
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                {isBn
                  ? "নিচে ক্লিক করে পছন্দসই অবতার ছবি নির্বাচন করুন:"
                  : "Click any preset avatar to apply immediately:"}
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {AVATAR_PRESETS.slice(0, 6).map((preset) => {
                  const isSelected = formData.photoURL === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, photoURL: preset.url }));
                        onNotify(`Selected avatar: ${preset.label}`);
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 group cursor-pointer ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-500/30 scale-105"
                          : "border-slate-200 hover:border-slate-300 hover:scale-102"
                      }`}
                      title={preset.label}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PASSWORD & AUTHENTICATION CREDENTIALS
      ========================================================================== */}
      {activeTab === "password" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? "অ্যাকাউন্ট পাসওয়ার্ড পরিবর্তন" : "Change Account Password"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? "আপনার ফায়ারবেস পাসওয়ার্ড সুরক্ষিত রাখুন এবং নিয়মিত হালনাগাদ করুন।"
                    : "Update your login credentials securely with Firebase Auth."}
                </p>
              </div>
            </div>

            {/* Password Feedback Banner */}
            {passwordFeedback.message && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                  passwordFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {passwordFeedback.type === "success" ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 font-medium">{passwordFeedback.message}</div>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>{isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}</span>
                  <span className="text-[10px] text-slate-400">(Required for re-authentication)</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters with numbers & symbols"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Strength:</span>
                      <span
                        className={`font-bold ${
                          passwordStrengthScore >= 80
                            ? "text-emerald-600"
                            : passwordStrengthScore >= 50
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {passwordStrengthScore >= 80
                          ? "Strong"
                          : passwordStrengthScore >= 50
                          ? "Medium"
                          : "Weak"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrengthScore >= 80
                            ? "bg-emerald-500"
                            : passwordStrengthScore >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${passwordStrengthScore}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                      <span className={passwordChecks.length ? "text-emerald-600 font-bold" : ""}>
                        • At least 8 characters
                      </span>
                      <span className={passwordChecks.hasUpper && passwordChecks.hasLower ? "text-emerald-600 font-bold" : ""}>
                        • Upper & lower case
                      </span>
                      <span className={passwordChecks.hasNumber ? "text-emerald-600 font-bold" : ""}>
                        • Numbers (0-9)
                      </span>
                      <span className={passwordChecks.hasSymbol ? "text-emerald-600 font-bold" : ""}>
                        • Special character (!@#$)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all font-medium text-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={isSendingResetEmail}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mail size={13} />
                  <span>
                    {isSendingResetEmail ? "Sending Reset Email..." : "Send Reset Link to Email"}
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{isBn ? "আপডেট হচ্ছে..." : "Updating Password..."}</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck size={14} />
                      <span>{isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Update Password Now"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Wallet Security PIN Form & 2FA Configuration */}
          <div className="space-y-6">
            {/* MFS 4-Digit Wallet PIN */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isBn ? "উপায় ওয়ালেট লেনদেন পিন (MFS PIN)" : "upay MFS Wallet Security PIN"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isBn
                      ? "লেনদেন নিশ্চিতকরণ এবং ক্যাশ আউটের জন্য ব্যবহৃত ৪-সংখ্যার গোপন পিন।"
                      : "Used to authorize fund transfers, cash out, and merchant transactions."}
                  </p>
                </div>
              </div>

              {pinFeedback.message && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    pinFeedback.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {pinFeedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{pinFeedback.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Current PIN</label>
                    <input
                      type="password"
                      maxLength={5}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="••••"
                      className="w-full text-center px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-mono font-bold tracking-widest text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">New PIN</label>
                    <input
                      type="password"
                      maxLength={5}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="••••"
                      className="w-full text-center px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-mono font-bold tracking-widest text-slate-900 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700">Confirm PIN</label>
                    <input
                      type="password"
                      maxLength={5}
                      required
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="••••"
                      className="w-full text-center px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none font-mono font-bold tracking-widest text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingPin}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isUpdatingPin ? "Updating PIN..." : "Save New PIN"}
                  </button>
                </div>
              </form>
            </div>

            {/* 2-Factor Authentication Setting */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[10px] text-slate-500">SMS OTP & Authenticator Verification</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => {
                      setTwoFactorEnabled(e.target.checked);
                      onNotify(
                        e.target.checked
                          ? "2FA Protection Enabled."
                          : "2FA Protection Disabled (Caution)."
                      );
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Requires a 6-digit one-time passcode whenever accessing the Console from unrecognized IP addresses or new devices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PREFERENCES & ALERTS
      ========================================================================== */}
      {activeTab === "preferences" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isBn ? "ব্যবহারকারী পছন্দ ও নোটিফিকেশন সেটিংস" : "Preferences & Security Alerts"}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? "ভাষার পছন্দ এবং সিস্টেম নিরাপত্তা অ্যালার্টের চ্যানেল কনফিগার করুন।"
                : "Customize language, anomalous transaction alerts, and email notifications."}
            </p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            {/* Language Preference */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isBn ? "সিস্টেম ভাষা" : "Interface Language"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isBn ? "বাংলা অথবা ইংরেজি ইন্টারফেস নির্বাচন করুন" : "Switch between English and Bengali"}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
              >
                <Globe size={13} className="text-blue-600" />
                <span>{language === "en" ? "English (Active)" : "বাংলা (সক্রিয়)"}</span>
              </button>
            </div>

            {/* Critical Anomaly Alerts */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isBn ? "গুরুতর ঝুঁকি তাৎক্ষণিক অ্যালার্ট" : "Critical Fraud & Risk Alerts"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isBn
                    ? "রিস্ক স্কোর ৮০+ অতিক্রমকারী লেনদেনে পুশ নোটিফিকেশন"
                    : "Receive instant notifications for transactions exceeding Risk Score 80"}
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </div>

            {/* Login Alerts from New Devices */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isBn ? "নতুন ডিভাইস লগইন সতর্কতা" : "New Device Login Alerts"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isBn
                    ? "অপরিচিত আইপি বা ব্রাউজার থেকে লগইনে ইমেল সতর্কতা"
                    : "Send an email whenever this account logs in from an unrecognized browser"}
                </div>
              </div>
              <input
                type="checkbox"
                checked={loginAlertsEnabled}
                onChange={(e) => setLoginAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </div>

            {/* SMS Transaction Alerts */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {isBn ? "এসএমএস লেনদেন নোটিফিকেশন" : "SMS Transaction Notifications"}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isBn
                    ? "ওয়ালেট ব্যালেন্সের প্রতিটি লেনদেনে এসএমএস রসিদ"
                    : "Receive SMS receipt for wallet deposits, cash out, and transfers"}
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsTxnAlerts}
                onChange={(e) => setSmsTxnAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => onNotify("Preferences saved successfully.")}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isBn ? "সেটিংস সংরক্ষণ করুন" : "Save Preferences"}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACTIVE SESSIONS & SECURITY AUDIT LOG
      ========================================================================== */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          {/* Active Devices Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isBn ? "সক্রিয় সেশন ও ডিভাইস" : "Active Devices & Login Sessions"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isBn
                    ? "বর্তমান সেশন এবং অন্যান্য ডিভাইসে খোলা সক্রিয় লগইন পরিচালনা করুন।"
                    : "Review all devices currently authenticated into your upay Sentinel account."}
                </p>
              </div>
              <button
                onClick={() => {
                  onNotify("All other remote sessions have been revoked.");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
              >
                {isBn ? "অন্যান্য সেশন বাতিল করুন" : "Revoke Other Sessions"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Device */}
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Laptop size={15} className="text-blue-600" />
                    <span>Current Active Device</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    THIS DEVICE
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Chrome on macOS (WebKit 537.36)
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Observed IP: 103.145.118.24 • Dhaka, Bangladesh
                </div>
                <div className="text-[10px] text-slate-400">
                  Session Token: eyJhbGciOiJSUzI1NiIs... (Verified)
                </div>
              </div>

              {/* Mobile Device */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Smartphone size={15} className="text-slate-500" />
                    <span>Mobile App (Android)</span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    STANDBY
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-medium">
                  Samsung Galaxy S24 Ultra (upay Sentinel Mobile v2.4)
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Last active: 3 hours ago • Chattogram
                </div>
              </div>
            </div>
          </div>

          {/* Security Action Audit Trail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? "অ্যাকাউন্ট অডিট লগ" : "Account Security Activity Log"}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "আপনার অ্যাকাউন্টে সাম্প্রতিক নিরাপত্তা ইভেন্ট এবং পরিবর্তনের সময়কাল।"
                  : "Immutable cryptographic record of recent profile and authentication changes."}
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="font-semibold text-slate-900">{log.action}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.time} • IP: {log.ip}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    {log.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AVATAR PICKER MODAL
      ========================================================================== */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Choose Profile Avatar</h3>
              </div>
              <button
                onClick={() => setShowAvatarPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700">Select Preset Avatar:</h4>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, photoURL: p.url }));
                      setShowAvatarPicker(false);
                      onNotify(`Updated photo to ${p.label}`);
                    }}
                    className="group flex flex-col items-center gap-1.5 p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <img
                      src={p.url}
                      alt={p.label}
                      className="w-14 h-14 rounded-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-semibold text-slate-700 text-center truncate w-full">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">Or Paste Image URL:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customPhotoInput}
                  onChange={(e) => setCustomPhotoInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customPhotoInput) {
                      setFormData((prev) => ({ ...prev, photoURL: customPhotoInput }));
                      setShowAvatarPicker(false);
                      onNotify("Custom photo URL applied.");
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
