"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getHistory, removeHistory, clearHistory, type HistoryEntry } from "@/lib/history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getFileHistory, getUrlHistory, getFileHistoryItem, getUrlHistoryItem, type FileHistoryItem, type UrlHistoryItem } from "@/lib/api"

function fmt(ts: number): string {
  try { return new Date(ts).toLocaleString() } catch { return "" }
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [serverUrl, setServerUrl] = useState<UrlHistoryItem[]>([])
  const [serverFile, setServerFile] = useState<FileHistoryItem[]>([])
  const router = useRouter()

  useEffect(() => {
    setItems(getHistory())
  }, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [u, f] = await Promise.all([getUrlHistory(20), getFileHistory(20)])
        if (!mounted) return
        setServerUrl(u)
        setServerFile(f)
      } catch {
        // ignore, backend may be down
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  function openItem(it: HistoryEntry) {
    if (typeof window === "undefined") return
    if (it.kind === "url") {
      sessionStorage.setItem("alss:lastScan", JSON.stringify(it.data))
      router.push("/results")
    } else {
      sessionStorage.setItem("alss:lastFileScan", JSON.stringify(it.data))
      router.push("/file-results")
    }
  }

  async function openServerUrl(id: number) {
    const data = await getUrlHistoryItem(id)
    if (data) {
      sessionStorage.setItem("alss:lastScan", JSON.stringify(data))
      router.push("/results")
    }
  }

  async function openServerFile(id: number) {
    const data = await getFileHistoryItem(id)
    if (data) {
      sessionStorage.setItem("alss:lastFileScan", JSON.stringify(data))
      router.push("/file-results")
    }
  }

  function remove(id: string) {
    removeHistory(id)
    setItems(getHistory())
  }

  function clearAll() {
    clearHistory()
    setItems([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">History</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/">New Scan</Link></Button>
          <Button variant="destructive" onClick={clearAll}>Clear All</Button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-muted-foreground">No history yet. Run a scan to see it here.</p>
      )}

      <div className="grid gap-4">
        {items.map((it) => {
          const levelColor = it.level === "high" ? "text-red-400" : it.level === "medium" ? "text-amber-400" : "text-emerald-400"
          const badgeVariant: "default" | "secondary" | "outline" = it.kind === "url" ? "secondary" : "default"
          return (
            <Card key={it.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant={badgeVariant}>{it.kind}</Badge>
                  <span className="font-normal text-muted-foreground">{fmt(it.timestamp)}</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`text-lg font-bold ${levelColor}`}>{it.score}</div>
                  <Button size="sm" variant="outline" onClick={() => openItem(it)}>Open</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(it.id)}>Delete</Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="break-all">{it.target}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(serverUrl.length > 0 || serverFile.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Server History</h2>
          <div className="grid gap-4">
            {serverUrl.map((r) => (
              <Card key={`u-${r.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">url</Badge>
                    <span className="font-normal text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${r.level === 'high' ? 'text-red-400' : r.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.score}</div>
                    <Button size="sm" variant="outline" onClick={() => openServerUrl(r.id)}>Open</Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="break-all">{r.final_url ?? r.normalized_url ?? r.input_url}</div>
                </CardContent>
              </Card>
            ))}

            {serverFile.map((r) => (
              <Card key={`f-${r.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge>file</Badge>
                    <span className="font-normal text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${r.level === 'high' ? 'text-red-400' : r.level === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.score}</div>
                    <Button size="sm" variant="outline" onClick={() => openServerFile(r.id)}>Open</Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="break-all">{r.filename}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
