// Compute a robust API base for local dev: normalize localhost -> 127.0.0.1 to avoid IPv6 (::1) resolution issues on Windows.
export const API_BASE = (() => {
  const configured = process.env.NEXT_PUBLIC_ALSS_API_URL ?? "http://127.0.0.1:8789"
  try {
    // Replace plain 'localhost' with 127.0.0.1
    return configured.replace("localhost", "127.0.0.1")
  } catch {
    return configured
  }
})()

// Optional Node (Express) mock backend base URL
export const NODE_API_BASE: string | null = (() => {
  const configured = process.env.NEXT_PUBLIC_ALSS_NODE_API_URL
  if (!configured) return null
  try { return configured.replace("localhost", "127.0.0.1") } catch { return configured }
})()

const DEFAULT_TIMEOUT = 12000

async function fetchJSON<T = any>(url: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...(init || {}), signal: ctrl.signal })
    let data: any = null
    try { data = await res.json() } catch {}
    if (!res.ok) {
      const msg = (data && (data.detail || data.message || data.error)) || `Request failed (${res.status})`
      throw new Error(msg)
    }
    return data as T
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw e
  } finally {
    clearTimeout(id)
  }
}

export type URLScanRequest = { url: string }

// ---- History API ----
export type UrlHistoryItem = {
  id: number
  created_at: string
  input_url: string
  normalized_url: string
  final_url?: string | null
  http_status?: number | null
  score: number
  level: "low" | "medium" | "high"
}

export type FileHistoryItem = {
  id: number
  created_at: string
  filename: string
  size: number
  format: string
  score: number
  level: "low" | "medium" | "high"
}

export async function getUrlHistory(limit = 20): Promise<UrlHistoryItem[]> {
  try { return await fetchJSON(`${API_BASE}/api/v1/history/url?limit=${limit}`) } catch { return [] }
}

export async function getFileHistory(limit = 20): Promise<FileHistoryItem[]> {
  try { return await fetchJSON(`${API_BASE}/api/v1/history/file?limit=${limit}`) } catch { return [] }
}

export async function getUrlHistoryItem(id: number): Promise<URLScanResult | null> {
  try { return await fetchJSON(`${API_BASE}/api/v1/history/url/${id}`) } catch { return null }
}

export async function getFileHistoryItem(id: number): Promise<FileScanResult | null> {
  try { return await fetchJSON(`${API_BASE}/api/v1/history/file/${id}`) } catch { return null }
}

export type RedirectHop = {
  url: string
  status?: number | null
}

export type HTTPInfo = {
  status?: number | null
  reason?: string | null
  content_type?: string | null
  server?: string | null
  final_url?: string | null
  redirects: string[]
  elapsed_ms?: number | null
  redirect_hops: RedirectHop[]
}

export type DNSInfo = {
  ips: string[]
}

export type SSLInfo = {
  subject?: string | null
  issuer?: string | null
  not_before?: string | null
  not_after?: string | null
  days_remaining?: number | null
}

export type WHOISInfo = {
  domain_name?: string | null
  registrar?: string | null
  creation_date?: string | null
  expiration_date?: string | null
  updated_date?: string | null
  country?: string | null
}

export type URLScanResult = {
  input_url: string
  normalized_url: string
  http: HTTPInfo
  dns: DNSInfo
  ok: boolean
  error?: string | null
  score: number
  level: "low" | "medium" | "high"
  factors: string[]
  whois: WHOISInfo
  ssl: SSLInfo
}

export async function scanUrl(url: string): Promise<URLScanResult> {
  return await fetchJSON(`${API_BASE}/api/v1/scan/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url } satisfies URLScanRequest),
  })
}

// Simple scan for Node mock backend
export type SimpleScanResponse = { status: string; details: string }
export async function scanUrlSimple(url: string): Promise<SimpleScanResponse> {
  if (!NODE_API_BASE) throw new Error('Node API base not configured')
  return await fetchJSON(`${NODE_API_BASE}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}

export type FileHashes = {
  md5: string
  sha1: string
  sha256: string
}

export type ZipInfo = {
  entries?: string[] | null
  has_vba?: boolean | null
  double_ext_entries?: string[] | null
}

export type FileScanResult = {
  filename: string
  size: number
  content_type?: string | null
  format: string
  hashes: FileHashes
  zip: ZipInfo
  score: number
  level: "low" | "medium" | "high"
  factors: string[]
  ok: boolean
  error?: string | null
}

export async function scanFile(file: File): Promise<FileScanResult> {
  const form = new FormData()
  form.set("file", file, file.name)
  return await fetchJSON(`${API_BASE}/api/v1/scan/file`, { method: 'POST', body: form })
}

export type ExplainRequest = {
  kind: "url" | "file"
  data: URLScanResult | FileScanResult
}

export type ExplainResponse = {
  ok: boolean
  summary: string
  guidance: string
  model?: string | null
  error?: string | null
}

export async function getAiInsights(req: ExplainRequest): Promise<ExplainResponse> {
  return await fetchJSON(`${API_BASE}/api/v1/ai/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}

// ---- Chat API ----
export type ChatMessage = {
  role: "user" | "assistant"
  text: string
}

export type ChatRequest = {
  message: string
  mode?: "general" | "security_faq" | "analyze_url"
  url?: string | null
  history?: ChatMessage[]
  persona?: "guide" | "analyst" | "mentor"
}

export type ChatResponse = {
  ok: boolean
  reply: string
  model?: string | null
  error?: string | null
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  return await fetchJSON(`${API_BASE}/api/v1/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
}
