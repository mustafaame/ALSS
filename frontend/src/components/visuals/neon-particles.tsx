"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

type Particle = { x: number; y: number; s: number; d: number; c: string; delay: number }

export default function NeonParticles({ count = 40, className }: { count?: number; className?: string }) {
  const parts = useMemo<Particle[]>(() => {
    const colors = ["#00C2FF", "#FF00FF", "#7C3AED"]
    return Array.from({ length: count }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 2.5 + 0.5,
      d: Math.random() * 2 + 2.5,
      c: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }))
  }, [count])

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden mix-blend-screen", className)}>
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.s}px`,
            height: `${p.s}px`,
            backgroundColor: p.c,
            filter: `drop-shadow(0 0 ${p.d * 6}px ${p.c})`,
            animationDelay: `${p.delay}s`,
          }}
          className="absolute rounded-full animate-particles"
        />
      ))}
    </div>
  )
}
