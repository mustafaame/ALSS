"use client"

import { cn } from "@/lib/utils"

type Hop = {
  url: string
  status?: number | null
}

function statusColor(s?: number | null) {
  if (!s) return "text-muted-foreground"
  if (s >= 500) return "text-red-400"
  if (s >= 400) return "text-red-400"
  if (s >= 300) return "text-amber-400"
  if (s >= 200) return "text-emerald-400"
  return "text-muted-foreground"
}

export function RedirectTimeline({
  hops,
  fallback,
  finalUrl,
}: {
  hops: Hop[]
  fallback: string[]
  finalUrl?: string | null
}) {
  const items: { url: string; status?: number | null }[] =
    (hops && hops.length > 0 ? hops.map(h => ({ url: h.url, status: h.status })) : (fallback || []).map(u => ({ url: u })))

  return (
    <div className="space-y-3">
      {items.length === 0 && <div className="text-sm text-muted-foreground">-</div>}
      {items.map((h, i) => (
        <div key={i} className="relative pl-8">
          <div className="absolute left-3 top-1 h-full border-l border-border" />
          <div className={cn("absolute left-1.5 top-1 grid h-4 w-4 place-items-center rounded-full bg-background border", h.status ? "border-current" : "border-border", statusColor(h.status))}>
            <div className={cn("h-2 w-2 rounded-full", h.status ? statusColor(h.status) : "bg-muted-foreground/40")}></div>
          </div>
          <div className="text-sm break-all">
            <span className={cn("mr-2 text-xs", statusColor(h.status))}>[{h.status ?? "-"}]</span>
            {h.url}
          </div>
        </div>
      ))}
      {finalUrl && (
        <div className="relative pl-8">
          <div className="absolute left-3 top-1 h-full border-l border-transparent" />
          <div className="absolute left-1.5 top-1 grid h-4 w-4 place-items-center rounded-full bg-background border border-emerald-500/40 text-emerald-400">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
          </div>
          <div className="text-sm break-all">
            <span className="mr-2 text-xs text-emerald-400">[final]</span>
            {finalUrl}
          </div>
        </div>
      )}
    </div>
  )
}
