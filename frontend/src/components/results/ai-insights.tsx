"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ExplainResponse, getAiInsights, type URLScanResult, type FileScanResult } from "@/lib/api"
import { Button } from "@/components/ui/button"

type Props = {
  kind: "url" | "file"
  data: URLScanResult | FileScanResult
}

function parseGuidance(text: string): string[] {
  if (!text) return []
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const bullets = lines.map((l) => l.replace(/^[-•]\s*/, "")).filter(Boolean)
  return bullets
}

export function AIInsights({ kind, data }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resp, setResp] = useState<ExplainResponse | null>(null)
  const [cached, setCached] = useState(false)

  const cacheKey = useMemo(() => {
    if (kind === "url") {
      const d = data as URLScanResult
      const target = d.http?.final_url || d.normalized_url || d.input_url
      return `alss:ai:url:${target}`
    } else {
      const d = data as FileScanResult
      const target = d.hashes?.sha256 || d.filename
      return `alss:ai:file:${target}`
    }
  }, [kind, data])

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const cachedRaw = typeof window !== "undefined" ? sessionStorage.getItem(cacheKey) : null
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as ExplainResponse
          if (mounted) {
            setResp(cached)
            setLoading(false)
            setCached(true)
            return
          }
        }
        const res = await getAiInsights({ kind, data })
        if (!mounted) return
        setResp(res)
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(res))
        }
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || "Failed to get AI insights")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [kind, data, cacheKey])

  async function reAnalyze() {
    setLoading(true)
    setError(null)
    setCached(false)
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem(cacheKey)
      const res = await getAiInsights({ kind, data })
      setResp(res)
      if (typeof window !== "undefined") sessionStorage.setItem(cacheKey, JSON.stringify(res))
    } catch (e: any) {
      setError(e?.message || "Failed to re-analyze")
    } finally {
      setLoading(false)
    }
  }

  const guidanceBullets = useMemo(() => parseGuidance(resp?.guidance || ""), [resp])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">AI Insights</CardTitle>
        <div className="flex items-center gap-2">
          {cached && <span className="text-[10px] text-muted-foreground">cached</span>}
          <Button size="sm" variant="outline" onClick={reAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Re-analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <div className="space-y-2">
            <div className="h-4 w-2/3 rounded bg-muted/30 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted/30 animate-pulse" />
            <div className="pt-2 space-y-1">
              <div className="h-3 w-3/4 rounded bg-muted/20 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-muted/20 animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>
        )}
        {error && !loading && <div className="text-sm text-destructive">{error}</div>}
        {!loading && !error && resp && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{resp.summary}</p>
            {guidanceBullets.length > 0 && (
              <ul className="list-disc pl-5 text-sm space-y-1">
                {guidanceBullets.map((g, i) => (
                  <li key={`g-${i}`}>{g}</li>
                ))}
              </ul>
            )}
            {resp.model && (
              <div className="text-[10px] text-muted-foreground">Model: {resp.model}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
