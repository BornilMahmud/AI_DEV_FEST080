"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "text" | "rectangular" | "circular" | "card";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full rounded";
      case "circular":
        return "rounded-full aspect-square";
      case "card":
        return "h-32 w-full rounded-2xl border border-slate-200/60";
      case "rectangular":
      default:
        return "rounded-xl";
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden bg-slate-100/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent ${getVariantClasses()} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
