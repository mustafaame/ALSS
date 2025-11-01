"use client"

import { cn } from "@/lib/utils"

export default function NeonShield({ className = "", size = 280 }: { className?: string; size?: number }) {
  const w = size
  const h = size
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_0_30px_rgba(0,224,184,0.35)]", className)}
      role="img"
      aria-label="ALSS Shield"
    >
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e0b8" />
          <stop offset="100%" stopColor="#19f59f" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#00e0b8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        <ellipse cx="100" cy="120" rx="88" ry="88" fill="url(#glow)" />
        <path
          d="M100 16 C120 28 142 34 168 36 L168 118 C168 158 140 190 100 206 C60 190 32 158 32 118 L32 36 C58 34 80 28 100 16 Z"
          fill="rgba(2,10,16,0.6)"
          stroke="url(#g1)"
          strokeWidth="3"
        />
        <path
          d="M100 30 C118 40 138 46 158 48 L158 118 C158 150 134 176 100 190 C66 176 42 150 42 118 L42 48 C62 46 82 40 100 30 Z"
          fill="rgba(0,224,184,0.06)"
          stroke="rgba(25,245,159,0.35)"
          strokeWidth="1.5"
        />
        <g transform="translate(100,115)">
          <path d="M0 -38 L22 26 L10 26 L6 15 L-6 15 L-10 26 L-22 26 Z M0 -6 L-2 0 L2 0 Z" fill="#0b0f14" opacity="0.85" />
          <path d="M0 -38 L22 26 L10 26 L6 15 L-6 15 L-10 26 L-22 26 Z M0 -6 L-2 0 L2 0 Z" fill="none" stroke="url(#g1)" strokeWidth="2" />
        </g>
        <circle cx="100" cy="120" r="88" fill="none" stroke="rgba(0,224,184,0.25)" strokeWidth="2" />
      </g>
    </svg>
  )
}
