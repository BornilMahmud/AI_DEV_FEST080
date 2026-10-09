"use client";

import React, { useState } from "react";
import { UserProfile } from "../auth/LoginPage";

interface UserAvatarProps {
  user?: UserProfile | null;
  className?: string;
  size?: number;
  showBadge?: boolean;
}

export const GmailLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 16,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Gmail Logo"
  >
    {/* Blue left container */}
    <path
      d="M2.5 6.5C2.5 5.12 3.62 4 5 4H6.5v6.5L12 14.25 17.5 10.5V4H19c1.38 0 2.5 1.12 2.5 2.5v11c0 1.38-1.12 2.5-2.5 2.5h-1.5v-7L12 16.5 6.5 13v7H5c-1.38 0-2.5-1.12-2.5-2.5v-11z"
      fill="#4285F4"
    />
    {/* Green right container */}
    <path
      d="M17.5 13v7H19c1.38 0 2.5-1.12 2.5-2.5v-11c0-.42-.1-.82-.29-1.17L17.5 8.5V13z"
      fill="#34A853"
    />
    {/* Red top fold */}
    <path
      d="M5 4C3.62 4 2.5 5.12 2.5 6.5v1.3l2.5 1.7L12 14.5l7-5 2.21-1.63c-.19-.35-.29-.75-.29-1.17 0-1.38-1.12-2.5-2.5-2.5h-13.42z"
      fill="#EA4335"
    />
    {/* Yellow left accent */}
    <path
      d="M2.5 7.8V17.5C2.5 18.88 3.62 20 5 20h1.5v-7L2.5 7.8z"
      fill="#FBBC05"
    />
    {/* Dark red middle fold */}
    <path
      d="M12 14.5L5 9.5 2.5 7.8 12 14.5zm0 0l7-5 2.21-1.63L12 14.5z"
      fill="#C5221F"
    />
  </svg>
);

export const GoogleGLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    aria-label="Google"
  >
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
);

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  className = "",
  size = 28,
  showBadge = false,
}) => {
  const [imgError, setImgError] = useState<boolean>(false);

  const isGoogleOrGmail = Boolean(
    user?.provider === "google" ||
    user?.email?.toLowerCase().includes("@gmail.com") ||
    user?.email?.toLowerCase().includes("google") ||
    user?.name?.toLowerCase().includes("arman") ||
    user?.avatar === "AH"
  );

  const photoURL = user?.photoURL;

  // 1. If photoURL is available and hasn't failed to load:
  if (photoURL && !imgError) {
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={photoURL}
          alt={user?.name || "User Profile Photo"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
        {showBadge && isGoogleOrGmail && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-xs border border-slate-200">
            <GoogleGLogo size={9} />
          </div>
        )}
      </div>
    );
  }

  // 2. If Google/Gmail user (or photo missing/errored):
  if (isGoogleOrGmail) {
    return (
      <div
        className={`relative rounded-md overflow-hidden bg-white border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs ${className}`}
        style={{ width: size, height: size }}
        title={`${user?.name || "User"} (Gmail / Google)`}
      >
        <GmailLogo size={Math.round(size * 0.6)} />
      </div>
    );
  }

  // 3. Fallback to initials
  return (
    <div
      className={`rounded-md overflow-hidden bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
    >
      {user?.avatar || "OP"}
    </div>
  );
};
