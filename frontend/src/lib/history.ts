import { type URLScanResult, type FileScanResult } from "@/lib/api"

export type HistoryKind = "url" | "file"

export type HistoryEntry = {
  id: string
  kind: HistoryKind
  timestamp: number
  score: number
  level: "low" | "medium" | "high"
  target: string
  extra?: Record<string, any>
  data: URLScanResult | FileScanResult
}

const KEY = "alss:history:v1"
const MAX_ENTRIES = 50

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

function save(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES))) } catch {}
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(KEY)
  const arr = safeParse<HistoryEntry[]>(raw) || []
  // Sort newest first
  return arr.sort((a, b) => b.timestamp - a.timestamp)
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function addUrlHistory(result: URLScanResult) {
  if (typeof window === "undefined") return
  const entries = getHistory()
  const entry: HistoryEntry = {
    id: newId(),
    kind: "url",
    timestamp: Date.now(),
    score: result.score,
    level: result.level,
    target: result.normalized_url || result.input_url,
    extra: { final_url: result.http.final_url, status: result.http.status },
    data: result,
  }
  // de-dup by same target within last 5 items
  const filtered = entries.filter((e, i) => !(i < 5 && e.kind === "url" && e.target === entry.target))
  save([entry, ...filtered])
}

export function addFileHistory(result: FileScanResult) {
  if (typeof window === "undefined") return
  const entries = getHistory()
  const entry: HistoryEntry = {
    id: newId(),
    kind: "file",
    timestamp: Date.now(),
    score: result.score,
    level: result.level,
    target: result.filename,
    extra: { sha256: result.hashes.sha256, format: result.format },
    data: result,
  }
  save([entry, ...entries])
}

export function removeHistory(id: string) {
  if (typeof window === "undefined") return
  const entries = getHistory().filter((e) => e.id !== id)
  save(entries)
}

export function clearHistory() {
  if (typeof window === "undefined") return
  try { localStorage.removeItem(KEY) } catch {}
}
