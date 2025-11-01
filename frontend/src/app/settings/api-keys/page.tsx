"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ApiKeysPage() {
  const [alssKey, setAlssKey] = useState("")
  const [geminiStatus, setGeminiStatus] = useState<"unknown" | "configured" | "missing">("unknown")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("alss:api:key")
      if (saved) setAlssKey(saved)
    } catch {}
  }, [])

  function save() {
    try {
      localStorage.setItem("alss:api:key", alssKey.trim())
    } catch {}
  }

  useEffect(() => {
    // Client cannot read backend env; we expose a simple hint based on health or fallback usage.
    // Here we just read a marker if chat returned fallback recently.
    try {
      const last = localStorage.getItem("alss:chat:lastModel")
      if (last === "fallback") setGeminiStatus("missing")
      else if (last) setGeminiStatus("configured")
      else setGeminiStatus("unknown")
    } catch { setGeminiStatus("unknown") }
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>
        <p className="text-muted-foreground">Manage your ALSS API key (prototype) and check Gemini status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ALSS API Key (Prototype)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Generated locally for demo purposes. Backend issuance not yet wired.</p>
          <div className="flex gap-2">
            <Input value={alssKey} onChange={(e) => setAlssKey(e.target.value)} placeholder="Enter or generate a key" />
            <Button onClick={save}>Save</Button>
          </div>
          <div className="text-xs text-muted-foreground">Stored in your browser only.</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gemini API Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            Status: {geminiStatus === "configured" ? <span className="text-emerald-400">Configured</span> : geminiStatus === "missing" ? <span className="text-red-400">Missing</span> : <span className="text-muted-foreground">Unknown</span>}
          </div>
          <p className="text-muted-foreground">Configure the key server-side in <code>backend/.env</code> as <code>GEMINI_API_KEY</code>.</p>
          <Button asChild variant="outline"><Link href="/learn">How to use</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
