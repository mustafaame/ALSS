"use client"

import { cn } from "@/lib/utils"

type Props = {
  variant?: "full" | "icon"
  className?: string
  size?: number
}

export function ALSSLogo({ variant = "full", className, size = 28 }: Props) {
  if (variant === "icon") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-label="ALSS logo"
        role="img"
      >
        <defs>
          <radialGradient id="g" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#19f59f" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00e0b8" stopOpacity="0.05" />
          </radialGradient>
          <linearGradient id="s" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#19f59f" />
            <stop offset="100%" stopColor="#00e0b8" />
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="22" ry="14" fill="url(#g)" />
        <ellipse cx="32" cy="32" rx="22" ry="14" fill="none" stroke="url(#s)" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="6.5" fill="#0b0f14" opacity="0.65" />
      </svg>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ALSSLogo variant="icon" size={22} />
      <svg
        width={64}
        height={24}
        viewBox="0 0 128 48"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#19f59f" />
            <stop offset="100%" stopColor="#00e0b8" />
          </linearGradient>
        </defs>
        <text x="0" y="34" fontFamily="Inter, ui-sans-serif, system-ui" fontSize="34" fontWeight="700" fill="url(#t)">
          ALSS
        </text>
      </svg>
    </div>
  )
}
