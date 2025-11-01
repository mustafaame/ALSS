"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { scanUrl, type URLScanResult, API_BASE } from "@/lib/api"
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

export default function UrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<URLScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const valid = useMemo(() => isLikelyUrl(url), [url])

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!valid) return
      setSubmitting(true)
      setError(null)
      setResult(null)
      try {
        try {
          // Trigger organic orb absorption animation (non-blocking)
          ;(window as any).ALSSCore?.absorb?.()
        } catch {}
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
      className={cn("glass rounded-xl p-6")}
    >
      <div className="space-y-2">
        <Label htmlFor="scan-url">Enter a URL to scan</Label>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            id="scan-url"
            name="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={url.length > 0 && !valid}
            autoComplete="off"
            className="md:flex-1"
          />
          <Button type="submit" disabled={!valid || submitting} className="md:w-40">
            {submitting ? "Scanning..." : "Scan"}
          </Button>
        </div>
        {url.length > 0 && !valid && (
          <p className="text-xs text-destructive">Please enter a valid URL.</p>
        )}
        <p className="text-xs text-muted-foreground">Backend: {API_BASE}</p>
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
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
