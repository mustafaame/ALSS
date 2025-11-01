"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { scanUrl, type URLScanResult, API_BASE, scanUrlSimple, NODE_API_BASE, type SimpleScanResponse } from "@/lib/api"
import { useRouter } from "next/navigation"
import { addUrlHistory } from "@/lib/history"
import { ensureAnonAuth, logScanResult, firebaseEnabled } from "@/lib/firebase"

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ""
  try {
    const _u = new URL(trimmed)
    return trimmed
  } catch {
    try {
      const withHttp = `http://${trimmed}`
      const _u2 = new URL(withHttp)
      return withHttp
    } catch {
      return trimmed
    }
  }
}

function isLikelyUrl(value: string): boolean {
  if (!value) return false
  const v = normalizeUrl(value)
  try {
    const _u = new URL(v)
    return true
  } catch {
    return false
  }
}

export default function UrlForm({ className, variant = "default", hideLabel = false }: { className?: string; variant?: "default" | "hero"; hideLabel?: boolean }) {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<URLScanResult | null>(null)
  const [simple, setSimple] = useState<SimpleScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const valid = useMemo(() => isLikelyUrl(url), [url])

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!valid) return
      setSubmitting(true)
      setError(null)
      setResult(null)
      setSimple(null)
      try {
        try {
          // Trigger organic orb absorption animation (non-blocking)
          ;(window as any).ALSSCore?.absorb?.()
        } catch {}
        if (variant === "hero" && NODE_API_BASE) {
          const simpleRes = await scanUrlSimple(normalizeUrl(url))
          setSimple(simpleRes)
        } else {
          const data = await scanUrl(normalizeUrl(url))
          setResult(data)
          addUrlHistory(data)
          try {
            if (firebaseEnabled) {
              await ensureAnonAuth()
              await logScanResult("url", { target: data.http?.final_url || data.normalized_url || data.input_url, score: data.score, level: data.level })
            }
          } catch {}
          if (typeof window !== "undefined") {
            sessionStorage.setItem("alss:lastScan", JSON.stringify(data))
          }
          router.push("/results")
        }
      } catch (err: any) {
        setError(err?.message || "Failed to scan")
      } finally {
        setSubmitting(false)
      }
    },
    [url, valid, router]
  )

  return (
    <motion.form
      id="scan"
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        variant === "hero"
          ? "rounded-xl border border-accent/30 bg-background/70 backdrop-blur-md p-4 md:p-5 shadow-[0_0_40px_rgba(25,245,159,0.12)]"
          : "glass rounded-xl p-6",
        "relative overflow-hidden",
        submitting && "ring-1 ring-accent/40",
        className,
      )}
      aria-busy={submitting}
    >
      {submitting && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
          <div className="mt-4 h-14 w-14 rounded-full bg-teal-400/10 backdrop-blur-md border border-teal-300/20 shadow-glow">
            <div className="h-full w-full animate-ping rounded-full bg-emerald-400/20" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="scan-url" className={hideLabel ? "sr-only" : undefined}>Enter a URL to scan</Label>
        <div className={cn("flex flex-col gap-3 md:flex-row", variant === "hero" && "items-stretch") }>
          <Input
            id="scan-url"
            name="url"
            placeholder={variant === "hero" ? "Paste your suspicious link here..." : "https://example.com"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={url.length > 0 && !valid}
            autoComplete="off"
            className={cn(
              "md:flex-1",
              variant === "hero" &&
                "h-11 md:h-12 text-base bg-[#00131a]/60 border-[#00C2FF]/30 placeholder:text-[#7ccfff] text-[#E6F9FF] focus-visible:ring-[#00C2FF]"
            )}
          />
          <Button type="submit" disabled={!valid || submitting} className={cn(
            "md:w-40",
            variant === "hero" &&
              "h-11 md:h-12 bg-transparent border border-[#00C2FF]/60 text-[#E6F9FF] hover:border-[#00C2FF] hover:shadow-[0_0_30px_rgba(0,194,255,0.5)]"
          ) }>
            {submitting ? "Scanning..." : variant === "hero" ? "Scan Now" : "Scan"}
          </Button>
        </div>
        <div aria-live="polite" className="sr-only">{submitting ? "Scanning in progress" : "Ready"}</div>
        {url.length > 0 && !valid && (
          <p className="text-xs text-destructive">Please enter a valid URL.</p>
        )}
        <p className="text-xs text-muted-foreground">Backend: {NODE_API_BASE || API_BASE}</p>
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
      {simple && (
        <Card className="mt-6 border border-[#00C2FF]/30 bg-[#00131a]/50 backdrop-blur-lg shadow-[0_0_40px_rgba(0,194,255,0.25)]">
          <CardHeader>
            <CardTitle className="text-lg">Scan Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-[#00C2FF]">Status: {simple.status}</div>
            <div className="text-muted-foreground">{simple.details}</div>
          </CardContent>
        </Card>
      )}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Scan Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Input URL</div>
                <div className="break-all">{result.input_url}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Final URL</div>
                <div className="break-all">{result.http.final_url ?? "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">HTTP</div>
                <div>{result.http.status ?? "-"} {result.http.reason ?? ""}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Server</div>
                <div>{result.http.server ?? "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Content-Type</div>
                <div>{result.http.content_type ?? "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div>{result.http.elapsed_ms ?? 0} ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Redirects</div>
                <div>{result.http.redirects?.length ?? 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">DNS IPs</div>
                <div className="break-all">{result.dns.ips.join(", ") || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.form>
  )
}
