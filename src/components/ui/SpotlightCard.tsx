"use client";

import React, { useRef, useEffect, useCallback } from "react";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  glowSize?: "small" | "medium" | "large";
  color?: "purple" | "blue" | "emerald" | "amber";
  lightsEdges?: boolean;
  lag?: "none" | "short" | "normal";
  disabled?: boolean;
  as?: "div" | "button" | "article" | "section";
  type?: "button" | "submit" | "reset";
}

const GLOW_SIZES = {
  small: 260,
  medium: 340,
  large: 440,
};

const GLOW_COLORS = {
  purple: {
    core: "rgba(168, 85, 247, 0.28)",
    mid: "rgba(147, 51, 234, 0.14)",
    edge: "rgba(168, 85, 247, 0.65)",
    edgeDim: "rgba(147, 51, 234, 0.08)",
  },
  blue: {
    core: "rgba(59, 130, 246, 0.28)",
    mid: "rgba(37, 99, 235, 0.14)",
    edge: "rgba(96, 165, 250, 0.65)",
    edgeDim: "rgba(37, 99, 235, 0.08)",
  },
  emerald: {
    core: "rgba(16, 185, 129, 0.28)",
    mid: "rgba(5, 150, 105, 0.14)",
    edge: "rgba(52, 211, 153, 0.65)",
    edgeDim: "rgba(5, 150, 105, 0.08)",
  },
  amber: {
    core: "rgba(245, 158, 11, 0.28)",
    mid: "rgba(217, 119, 6, 0.14)",
    edge: "rgba(251, 191, 36, 0.65)",
    edgeDim: "rgba(217, 119, 6, 0.08)",
  },
};

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  contentClassName = "",
  glowSize = "medium",
  color = "purple",
  lightsEdges = true,
  lag = "short",
  disabled = false,
  as: Component = "div",
  ...restProps
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);
  const edgeRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isInsideRef = useRef<boolean>(false);
  const prefersReducedMotionRef = useRef<boolean>(false);

  const radius = (GLOW_SIZES[glowSize] || GLOW_SIZES.medium) / 2;
  const colorScheme = GLOW_COLORS[color] || GLOW_COLORS.purple;

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;

    const listener = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const card = cardRef.current;
      const light = lightRef.current;
      if (!card || !light || disabled) return;

      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Transform-only translation for the soft round light
      // Offset by radius so center of circle is exact pointer position
      const transformValue = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      light.style.transform = transformValue;

      // Edge lighting via CSS variables on the card container
      if (lightsEdges && edgeRef.current) {
        card.style.setProperty("--spotlight-x", `${x}px`);
        card.style.setProperty("--spotlight-y", `${y}px`);
      }
    },
    [disabled, lightsEdges, radius]
  );

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      isInsideRef.current = true;
      const light = lightRef.current;
      const edge = edgeRef.current;

      if (light) {
        light.style.opacity = "1";
        // Configure lag transition
        if (prefersReducedMotionRef.current || lag === "none") {
          light.style.transition = "opacity 160ms cubic-bezier(0.16, 1, 0.3, 1)";
        } else if (lag === "short") {
          light.style.transition =
            "transform 80ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)";
        } else {
          light.style.transition =
            "transform 160ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)";
        }
      }

      if (edge) {
        edge.style.opacity = "1";
      }

      updatePosition(e.clientX, e.clientY);
    },
    [disabled, lag, updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || !isInsideRef.current) return;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      rafIdRef.current = requestAnimationFrame(() => {
        updatePosition(clientX, clientY);
      });
    },
    [disabled, updatePosition]
  );

  const handlePointerLeave = useCallback(() => {
    if (disabled) return;
    isInsideRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const light = lightRef.current;
    const edge = edgeRef.current;

    if (light) {
      light.style.opacity = "0";
      light.style.transition = "opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)";
    }
    if (edge) {
      edge.style.opacity = "0";
      edge.style.transition = "opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)";
    }
  }, [disabled]);

  // Touch screen support: finger dragging over cards
  useEffect(() => {
    const card = cardRef.current;
    if (!card || disabled) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = card.getBoundingClientRect();

      // Check if current touch position is inside this card
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        if (!isInsideRef.current) {
          isInsideRef.current = true;
          if (lightRef.current) lightRef.current.style.opacity = "1";
          if (edgeRef.current) edgeRef.current.style.opacity = "1";
        }
        updatePosition(touch.clientX, touch.clientY);
      } else if (isInsideRef.current) {
        isInsideRef.current = false;
        if (lightRef.current) lightRef.current.style.opacity = "0";
        if (edgeRef.current) edgeRef.current.style.opacity = "0";
      }
    };

    const handleTouchEnd = () => {
      if (isInsideRef.current) {
        isInsideRef.current = false;
        if (lightRef.current) lightRef.current.style.opacity = "0";
        if (edgeRef.current) edgeRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [disabled, updatePosition]);

  const diameter = radius * 2;

  return (
    <Component
      ref={cardRef as any}
      onPointerEnter={handlePointerEnter as any}
      onPointerMove={handlePointerMove as any}
      onPointerLeave={handlePointerLeave as any}
      className={`relative overflow-hidden group/spotlight ${className}`}
      style={{
        touchAction: "pan-y",
        ...restProps.style,
      }}
      {...(restProps as any)}
    >
      {/* ── 1. Soft Round Purple Spotlight (Transform-only GPU movement) ── */}
      <div
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 will-change-transform z-0"
        style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          borderRadius: "50%",
          opacity: 0,
          background: `radial-gradient(circle at center, ${colorScheme.core} 0%, ${colorScheme.mid} 40%, rgba(147, 51, 234, 0) 72%)`,
          transform: `translate3d(-${radius}px, -${radius}px, 0)`,
          transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          mixBlendMode: "screen",
        }}
      />

      {/* ── 2. Edge Lighting (Closest edge lights up, far edges stay dim) ── */}
      {lightsEdges && (
        <div
          ref={edgeRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 transition-opacity duration-200"
          style={{
            padding: "1px",
            opacity: 0,
            background: `radial-gradient(${diameter}px circle at var(--spotlight-x, -999px) var(--spotlight-y, -999px), ${colorScheme.edge} 0%, ${colorScheme.edgeDim} 50%, transparent 80%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* ── 3. Card Content (Above light effects) ── */}
      <div className={`relative z-[1] w-full h-full ${contentClassName || ""}`}>{children}</div>
    </Component>
  );
};
