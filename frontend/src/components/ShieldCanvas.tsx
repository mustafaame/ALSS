"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// Modes for color pulse
type Mode = "default" | "safe" | "danger"

export default function ShieldCanvas({ className }: { className?: string }) {
  const [mode, setMode] = useState<Mode>("default")
  const timeoutRef = useRef<number | null>(null)

  // Expose a global controller for the hero scan to trigger pulses
  useEffect(() => {
    ;(window as any).ALSSShield = {
      pulse: (m: Mode) => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
        setMode(m)
        timeoutRef.current = window.setTimeout(() => setMode("default"), 2000)
      },
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      try { delete (window as any).ALSSShield } catch {}
    }
  }, [])

  const color =
    mode === "safe" ? "#22c55e" : mode === "danger" ? "#ef4444" : "#00FFFF"

  return (
    <div className={cn("relative aspect-square w-full max-w-[460px]", className)}>
      {/* Background gradient per spec (#020617 → #0B1222) */}
      <div className="absolute inset-0 rounded-3xl opacity-0" />

      {/* Beam sweep */}
      <div
        className="pointer-events-none absolute inset-0 [background:linear-gradient(115deg,transparent,rgba(0,255,255,0.15),transparent_60%)] [background-size:200%_200%] animate-beam mix-blend-screen"
        aria-hidden
      />

      {/* Particles lens flares near edges */}
      <div
        className="pointer-events-none absolute -inset-10 blur-3xl mix-blend-screen"
        style={{
          background:
            "radial-gradient(120px 120px at 20% 30%, rgba(59,130,246,0.25), transparent 60%)," +
            "radial-gradient(160px 160px at 80% 70%, rgba(168,85,247,0.20), transparent 60%)",
        }}
      />

      {/* Outer glow halos */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full blur-2xl mix-blend-screen"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}66, transparent 60%)` }}
      />

      {/* Shield base constructed with layered divs + mask */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[76%] w-[62%] -translate-x-1/2 -translate-y-1/2"
        initial={{ y: 4 }}
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner core light */}
        <div
          className="absolute inset-[-12%] blur-2xl mix-blend-screen"
          style={{ background: `radial-gradient(circle at 50% 45%, #ffffffaa, transparent 55%)` }}
        />
        {/* Shield outline (SVG for crisp edges) */}
        <svg viewBox="0 0 200 240" className="relative z-10">
          <defs>
            <linearGradient id="edge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C2FF" />
              <stop offset="100%" stopColor="#FF00FF" />
            </linearGradient>
          </defs>
          <path
            d="M100 16 C120 28 142 34 168 36 L168 118 C168 158 140 190 100 206 C60 190 32 158 32 118 L32 36 C58 34 80 28 100 16 Z"
            fill="rgba(2,10,22,0.65)"
            stroke="url(#edge)"
            strokeWidth={3}
          />
          <circle cx="100" cy="120" r="82" fill="rgba(0,194,255,0.10)" />
          {/* A letter */}
          <g transform="translate(100,120)">
            <path d="M0 -38 L22 26 L10 26 L6 15 L-6 15 L-10 26 L-22 26 Z M0 -6 L-2 0 L2 0 Z" fill="#0b1222" opacity={0.95} />
            <path d="M0 -38 L22 26 L10 26 L6 15 L-6 15 L-10 26 L-22 26 Z M0 -6 L-2 0 L2 0 Z" fill="none" stroke="#00FFFF" strokeWidth={2} />
          </g>
        </svg>
        {/* Mode pulse ring */}
        <div
          className={cn(
            "pointer-events-none absolute -inset-4 rounded-[40%]",
            mode !== "default" ? "animate-ping" : ""
          )}
          style={{ boxShadow: `0 0 60px ${color}55` }}
        />
      </motion.div>

      {/* Subtle flicker grid */}
      <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-screen animate-flicker" style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
    </div>
  )
}
