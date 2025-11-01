"use client"

import { useCallback, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { scanFile, type FileScanResult } from "@/lib/api"
import { useRouter } from "next/navigation"
import { addFileHistory } from "@/lib/history"
import { ensureAnonAuth, logScanResult, firebaseEnabled } from "@/lib/firebase"

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

export default function FileForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<FileScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const valid = useMemo(() => !!file && file.size > 0, [file])

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!valid || !file) return
      setSubmitting(true)
      setError(null)
      setResult(null)
      try {
        const data = await scanFile(file)
        setResult(data)
        addFileHistory(data)
        try {
          if (firebaseEnabled) {
            await ensureAnonAuth()
            await logScanResult("file", { target: data.filename, score: data.score, level: data.level, sha256: data.hashes.sha256 })
          }
        } catch {}
        if (typeof window !== "undefined") {
          sessionStorage.setItem("alss:lastFileScan", JSON.stringify(data))
        }
        router.push("/file-results")
      } catch (err: any) {
        setError(err?.message || "Failed to scan file")
      } finally {
        setSubmitting(false)
      }
    },
    [file, valid, router]
  )

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("glass rounded-xl p-6")}
    >
      <div className="space-y-2">
        <Label htmlFor="scan-file">Upload a file</Label>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            id="scan-file"
            name="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="md:flex-1"
          />
          <Button type="submit" disabled={!valid || submitting} className="md:w-40">
            {submitting ? "Scanning..." : "Scan File"}
          </Button>
        </div>
        {file && (
          <p className="text-xs text-muted-foreground">{file.name} • {prettySize(file.size)}</p>
        )}
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">File Scan Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Filename</div>
                <div className="break-all">{result.filename}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Format</div>
                <div>{result.format}</div>
              </div>
              <div>
                <div className="text-muted-foreground">SHA-256</div>
                <div className="break-all">{result.hashes.sha256}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Size</div>
                <div>{prettySize(result.size)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.form>
  )
}
