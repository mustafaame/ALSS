"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ScoreGauge } from "@/components/results/score-gauge"
import { type URLScanResult } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { RedirectTimeline } from "@/components/results/redirect-timeline"

const AIInsightsLazy = dynamic(() => import("@/components/results/ai-insights").then(m => m.AIInsights), {
  ssr: false,
  loading: () => <div className="text-sm text-muted-foreground">Loading AI insights...</div>,
})
const ExportPdfButtonLazy = dynamic(() => import("@/components/results/export-pdf-button").then(m => m.ExportPdfButton), {
  ssr: false,
  loading: () => <div />,
})

export default function ResultsPage() {
  const [data, setData] = useState<URLScanResult | null>(null)
  const [insightsVisible, setInsightsVisible] = useState(false)
  const insightsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("alss:lastScan") : null
      if (raw) setData(JSON.parse(raw) as URLScanResult)
    } catch {
      setData(null)
    }
  }, [])

  // T6: map threat score to ALSSCore visual mode (if homepage canvas is mounted)
  useEffect(() => {
    if (!data) return
    const s = data.score ?? 0
    const mode = s >= 60 ? "danger" : s >= 20 ? "warn" : "calm"
    try { (window as any).ALSSCore?.setMode?.(mode) } catch {}
  }, [data])

  useEffect(() => {
    const el = insightsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInsightsVisible(true)
        obs.disconnect()
      }
    }, { rootMargin: "200px" })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Results</h1>
        <p className="text-muted-foreground">No results found in this session.</p>
        <Button asChild>
          <Link href="/">Go to Scan</Link>
        </Button>
      </div>
    )
  }

  const levelColor = data.level === "high" ? "text-red-400" : data.level === "medium" ? "text-amber-400" : "text-emerald-400"

  const factorStyle = (f: string) => {
    const s = f.toLowerCase()
    if (s.includes("phish") || s.includes("malware") || s.includes("danger") || s.includes("suspicious") || s.includes("blacklist") || s.includes("ip") || s.includes("download") || s.includes("redirect")) {
      return "bg-red-500/15 text-red-300 border-red-500/20"
    }
    if (s.includes("warn") || s.includes("risky") || s.includes("unknown") || s.includes("short") || s.includes("new") || s.includes("mismatch") || s.includes("ttl")) {
      return "bg-amber-500/15 text-amber-300 border-amber-500/20"
    }
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
  }

  const daysBadge = (days?: number | null) => {
    if (days == null) return null
    const cls = days <= 14 ? "bg-red-500/15 text-red-300 border-red-500/20" : days <= 30 ? "bg-amber-500/15 text-amber-300 border-amber-500/20" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
    const label = days <= 14 ? "expiring" : days <= 30 ? "soon" : "ok"
    return <span className={`rounded-md border px-2 py-0.5 text-xs ${cls}`}>{label}</span>
  }

  return (
    <div className="report space-y-8">
      <div className="print-only mb-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">ALSS Report — URL Scan</div>
          <div className="text-sm">{new Date().toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted-foreground break-all">{data.http.final_url || data.input_url}</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl font-semibold">Results</h1>
          <p className="text-sm text-muted-foreground">Scanned: {new Date().toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreGauge score={data.score} level={data.level} />
          <div>
            <div className={`text-3xl font-bold ${levelColor}`}>{data.score}</div>
            <div className="text-xs text-muted-foreground uppercase">{data.level}</div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.02 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Input URL</div>
            <div className="break-all">{data.input_url}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Final URL</div>
            <div className="break-all">{data.http.final_url ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">HTTP</div>
            <div>{data.http.status ?? "-"} {data.http.reason ?? ""}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Server</div>
            <div>{data.http.server ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Content-Type</div>
            <div>{data.http.content_type ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Time</div>
            <div>{data.http.elapsed_ms ?? 0} ms</div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.04 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">DNS & Redirects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-muted-foreground">DNS IPs</div>
            <div className="break-all text-sm">{data.dns.ips.join(", ") || "-"}</div>
          </div>
          <Separator />
          <div>
            <div className="text-muted-foreground">Redirects</div>
            <RedirectTimeline hops={data.http.redirect_hops || []} fallback={data.http.redirects || []} finalUrl={data.http.final_url} />
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.06 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WHOIS</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Domain</div>
            <div className="break-all">{data.whois.domain_name ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Registrar</div>
            <div>{data.whois.registrar ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Created</div>
            <div>{data.whois.creation_date ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Expires</div>
            <div>{data.whois.expiration_date ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Updated</div>
            <div>{data.whois.updated_date ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Country</div>
            <div>{data.whois.country ?? "-"}</div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SSL Certificate</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Subject</div>
            <div className="break-all">{data.ssl.subject ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Issuer</div>
            <div className="break-all">{data.ssl.issuer ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Valid From</div>
            <div>{data.ssl.not_before ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Valid To</div>
            <div>{data.ssl.not_after ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Days Remaining</div>
            <div className="flex items-center gap-2">{data.ssl.days_remaining ?? "-"} {daysBadge(data.ssl.days_remaining)}</div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(data.factors || []).length === 0 && <div className="text-sm text-muted-foreground">No flags detected.</div>}
            {(data.factors || []).map((f, i) => (
              <span key={`f-${i}`}>
                <Badge className={`border ${factorStyle(f)}`}>{f}</Badge>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div ref={insightsRef} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.12 }}>
        {insightsVisible && <AIInsightsLazy kind="url" data={data} />}
      </motion.div>

      <div className="flex gap-3 no-print">
        <Button asChild variant="outline"><Link href="/">New Scan</Link></Button>
        <Button asChild><Link href="/docs">Learn More</Link></Button>
        <ExportPdfButtonLazy />
      </div>
    </div>
  )
}
