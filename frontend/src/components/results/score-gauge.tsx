"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Props = {
  score: number
  level: "low" | "medium" | "high"
  className?: string
}

export function ScoreGauge({ score, level, className }: Props) {
  const c = level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#22c55e"
  const pct = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("relative h-32 w-32 rounded-full", className)}
      style={{
        background: `conic-gradient(${c} ${pct}%, rgba(255,255,255,0.08) 0)`,
      }}
      aria-label="Threat score gauge"
      role="img"
    >
      <div className="absolute inset-1 rounded-full bg-card border border-border grid place-content-center">
        <div className="text-center">
          <div className="text-2xl font-bold leading-none">{pct}</div>
          <div className="text-xs text-muted-foreground uppercase mt-1">{level}</div>
        </div>
      </div>
    </motion.div>
  )
}
