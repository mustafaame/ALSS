"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ScoreGauge } from "@/components/results/score-gauge"
import { type FileScanResult } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExportPdfButton } from "@/components/results/export-pdf-button"
import { AIInsights } from "@/components/results/ai-insights"

function prettySize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let v = bytes
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export default function FileResultsPage() {
  const [data, setData] = useState<FileScanResult | null>(null)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("alss:lastFileScan") : null
      if (raw) setData(JSON.parse(raw) as FileScanResult)
    } catch {
      setData(null)
    }
  }, [])

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">File Results</h1>
        <p className="text-muted-foreground">No file results found in this session.</p>
        <Button asChild>
          <Link href="/">Go to Scan</Link>
        </Button>
      </div>
    )
  }

  const levelColor = data.level === "high" ? "text-red-400" : data.level === "medium" ? "text-amber-400" : "text-emerald-400"

  const factorStyle = (f: string) => {
    const s = f.toLowerCase()
    if (s.includes("macro") || s.includes("phish") || s.includes("malware") || s.includes("double") || s.includes("exe") || s.includes("danger") || s.includes("suspicious")) {
      return "bg-red-500/15 text-red-300 border-red-500/20"
    }
    if (s.includes("warn") || s.includes("risky") || s.includes("unknown") || s.includes("script") || s.includes("password") || s.includes("large")) {
      return "bg-amber-500/15 text-amber-300 border-amber-500/20"
    }
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
  }

  return (
    <div className="report space-y-8">
      <div className="print-only mb-6">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">ALSS Report — File Scan</div>
          <div className="text-sm">{new Date().toLocaleString()}</div>
        </div>
        <div className="text-xs text-muted-foreground break-all">{data.filename}</div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl font-semibold">File Results</h1>
          <p className="text-sm text-muted-foreground">Analyzed: {new Date().toLocaleString()}</p>
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
            <div className="text-muted-foreground">Filename</div>
            <div className="break-all">{data.filename}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Content Type</div>
            <div>{data.content_type ?? "-"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Format</div>
            <div>{data.format}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Size</div>
            <div>{prettySize(data.size)}</div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.04 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hashes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-muted-foreground">SHA-256</div>
            <div className="break-all text-sm">{data.hashes.sha256}</div>
          </div>
          <div>
            <div className="text-muted-foreground">SHA-1</div>
            <div className="break-all text-sm">{data.hashes.sha1}</div>
          </div>
          <div>
            <div className="text-muted-foreground">MD5</div>
            <div className="break-all text-sm">{data.hashes.md5}</div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.06 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Archive Inspection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {data.zip.has_vba && <Badge className="border bg-amber-500/15 text-amber-300 border-amber-500/20">office_macro</Badge>}
            {(data.zip.double_ext_entries && data.zip.double_ext_entries.length > 0) && <Badge className="border bg-red-500/15 text-red-300 border-red-500/20">zip_double_ext</Badge>}
          </div>
          {data.zip.entries && data.zip.entries.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2">Entries</div>
              <div className="text-xs grid gap-1 max-h-60 overflow-auto rounded border border-border p-3 bg-card">
                {data.zip.entries.map((n, i) => (
                  <div key={i} className="break-all">{n}</div>
                ))}
              </div>
            </div>
          )}
          {!data.zip.entries && (
            <div className="text-sm text-muted-foreground">Not a ZIP archive or no entries listed.</div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.07 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(data.factors || []).length === 0 && <div className="text-sm text-muted-foreground">No flags detected.</div>}
            {(data.factors || []).map((f, i) => (
              <span key={`ff-${i}`}>
                <Badge className={`border ${factorStyle(f)}`}>{f}</Badge>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.08 }}>
        <AIInsights kind="file" data={data} />
      </motion.div>

      <div className="flex gap-3 no-print">
        <Button asChild variant="outline"><Link href="/">New Scan</Link></Button>
        <ExportPdfButton />
      </div>
    </div>
  )
}
