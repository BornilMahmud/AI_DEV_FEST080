"use client";

import React, { useEffect, useState, useRef } from "react";
import { ShieldCheck, Activity } from "lucide-react";

interface SentinelIntroProps {
  onComplete: () => void;
}

export const SentinelIntro: React.FC<SentinelIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<"mark" | "sweep" | "exit">("mark");
  const [statusText, setStatusText] = useState("INITIALIZING SENTINEL SECURE KERNEL");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect reduced motion: skip immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onComplete();
      return;
    }

    // Step 1: Mark & Canvas particles (0 - 450ms)
    const t1 = setTimeout(() => {
      setPhase("sweep");
      setStatusText("VERIFYING 64-DISTRICT MFS TELEMETRY & BFIU PROTOCOLS");
    }, 450);

    // Step 2: Exit fade (850ms)
    const t2 = setTimeout(() => {
      setPhase("exit");
      setStatusText("OPERATIONS CONSOLE READY");
    }, 850);

    // Step 3: Complete & Unmount (1100ms)
    const t3 = setTimeout(() => {
      onComplete();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Subtle background constellation canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Minimal grid nodes
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const nodeCount = Math.min(32, Math.floor(width / 45));
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Controlled subtle grid lines
      ctx.strokeStyle = "rgba(0, 82, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw faint connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(0, 82, 255, ${0.12 * (1 - dist / 120)})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update nodes
      for (const node of nodes) {
        ctx.fillStyle = "rgba(0, 82, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-300 select-none cursor-pointer ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="upay Sentinel Loading Screen"
      role="status"
    >
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Center Intelligence Mark */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-5">
          {/* Subtle Ambient Pulse Ring */}
          <div className="absolute -inset-3 rounded-2xl bg-blue-500/10 animate-ping opacity-60" />
          <div className="relative w-14 h-14 rounded-xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/40">
            u
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-slate-900 tracking-tight">upay</span>
          <span className="text-xl font-bold text-blue-600 tracking-tight">Sentinel</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold tracking-wider">
            MFS v2.4
          </span>
        </div>

        <p className="text-[11px] text-slate-400 font-medium tracking-wide mb-6 uppercase">
          AI-Powered Fraud & Scam Intelligence Console
        </p>

        {/* Dynamic Progress Indicator */}
        <div className="w-56 h-1 rounded-full bg-slate-100 overflow-hidden relative mb-3">
          <div
            className={`h-full bg-blue-600 rounded-full transition-all duration-500 ease-out ${
              phase === "mark" ? "w-1/3" : phase === "sweep" ? "w-4/5" : "w-full"
            }`}
          />
        </div>

        {/* Telemetry Status Line */}
        <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-500">
          <Activity size={12} className="text-blue-600 animate-pulse shrink-0" />
          <span className="tracking-wider">{statusText}</span>
        </div>

        {/* Skip hint */}
        <div className="mt-8 text-[10px] text-slate-300 font-mono">
          [Click or press any key to skip]
        </div>
      </div>
    </div>
  );
};
