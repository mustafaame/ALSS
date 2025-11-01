"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { chat, type ChatRequest, type ChatMessage } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { X, MessageSquare, Send } from "lucide-react"
import { ensureAnonAuth, logChatMessage, firebaseEnabled } from "@/lib/firebase"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ChatRequest["mode"]>("general")
  const [persona, setPersona] = useState<ChatRequest["persona"]>("guide")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [items, setItems] = useState<{ role: "user" | "bot"; text: string }[]>([])
  const [streaming, setStreaming] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [items, open])

  useEffect(() => {
    try {
      const seen = localStorage.getItem("alss:chat:welcomed")
      let sid = localStorage.getItem("alss:chat:session")
      if (!sid) {
        sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
        localStorage.setItem("alss:chat:session", sid)
      }
      setSessionId(sid)
      if (firebaseEnabled) ensureAnonAuth()
      if (!seen) {
        setOpen(true)
        setItems((p) => (p.length ? p : [...p, { role: "bot", text: "Welcome to ALSS. Ask about URL scanning, file analysis, or security tips. Choose a persona for style, and try Analyze URL mode." }]))
        try { if (firebaseEnabled) logChatMessage(sid!, { role: "assistant", text: "Welcome to ALSS...", mode, persona }) } catch {}
        localStorage.setItem("alss:chat:welcomed", "1")
      }
    } catch {}
  }, [])

  // Respect prefers-reduced-motion
  useEffect(() => {
    try {
      const m = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
      const update = () => setReduceMotion(!!m?.matches)
      update()
      m?.addEventListener?.('change', update)
      return () => m?.removeEventListener?.('change', update)
    } catch {}
  }, [])

  // Load saved session
  useEffect(() => {
    try {
      const raw = localStorage.getItem("alss:chat:history")
      const pr = localStorage.getItem("alss:chat:persona") as ChatRequest["persona"] | null
      if (raw) {
        const parsed = JSON.parse(raw) as { role: "user" | "bot"; text: string }[]
        if (Array.isArray(parsed)) setItems(parsed.slice(-50))
      }
      if (pr === "guide" || pr === "analyst" || pr === "mentor") setPersona(pr)
    } catch {}
  }, [])

  // Persist session
  useEffect(() => {
    try {
      localStorage.setItem("alss:chat:history", JSON.stringify(items.slice(-50)))
    } catch {}
  }, [items])

  useEffect(() => {
    try {
      localStorage.setItem("alss:chat:persona", persona || "guide")
    } catch {}
  }, [persona])

  const quick = useMemo(() => [
    { t: "What is phishing?", m: "security_faq" as const },
    { t: "Analyze this URL", m: "analyze_url" as const },
    { t: "How to stay safe online?", m: "general" as const },
  ], [])

  async function typeOut(text: string) {
    setStreaming(true)
    // Append an empty bot message first
    setItems((p) => [...p, { role: "bot", text: "" }])
    const delay = 12 // ms per char
    for (let i = 1; i <= text.length; i++) {
      await new Promise((r) => setTimeout(r, delay))
      const slice = text.slice(0, i)
      setItems((p) => {
        const copy = p.slice()
        // replace last message's text
        const idx = copy.length - 1
        if (idx >= 0 && copy[idx].role === "bot") copy[idx] = { role: "bot", text: slice }
        return copy
      })
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    }
    try { if (firebaseEnabled) logChatMessage(sessionId, { role: "assistant", text, mode, persona }) } catch {}
    setStreaming(false)
  }

  async function onSend() {
    const msg = message.trim()
    if (!msg || sending || streaming) return
    setItems((p) => [...p, { role: "user", text: msg }])
    try { if (firebaseEnabled) logChatMessage(sessionId, { role: "user", text: msg, mode, persona }) } catch {}
    setMessage("")
    setSending(true)
    try {
      // Map history to backend format (user/assistant) and cap recent 12 turns
      const history: ChatMessage[] = items
        .map((it): ChatMessage => ({ role: it.role === "bot" ? "assistant" : "user", text: it.text }))
        .slice(-12)
      const req: ChatRequest = { message: msg, mode, history, persona }
      const res = await chat(req)
      try { localStorage.setItem("alss:chat:lastModel", (res.model || "") as string) } catch {}
      if (reduceMotion) {
        setItems((p) => [...p, { role: "bot", text: res.reply || "" }])
        try { if (firebaseEnabled) logChatMessage(sessionId, { role: "assistant", text: res.reply || "", mode, persona, model: res.model }) } catch {}
      } else {
        await typeOut(res.reply || "")
      }
    } catch (e: any) {
      setItems((p) => [...p, { role: "bot", text: e?.message || "Failed to get reply" }])
      try { if (firebaseEnabled) logChatMessage(sessionId, { role: "assistant", text: e?.message || "Failed to get reply", mode, persona }) } catch {}
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <Button size="lg" onClick={() => setOpen(true)} className="rounded-full shadow-lg">
            <MessageSquare className="h-5 w-5 mr-2" /> Chat
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[90vw] rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="font-semibold">Assistant</div>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex gap-2">
              <Button size="sm" variant={mode === "general" ? "default" : "outline"} onClick={() => setMode("general")}>General</Button>
              <Button size="sm" variant={mode === "security_faq" ? "default" : "outline"} onClick={() => setMode("security_faq")}>Security</Button>
              <Button size="sm" variant={mode === "analyze_url" ? "default" : "outline"} onClick={() => setMode("analyze_url")}>Analyze URL</Button>
            </div>
            <div className="flex gap-1 text-xs text-muted-foreground">
              <span className="hidden md:inline">Persona:</span>
              <Button size="sm" variant={persona === "guide" ? "secondary" : "ghost"} onClick={() => setPersona("guide")}>Guide</Button>
              <Button size="sm" variant={persona === "analyst" ? "secondary" : "ghost"} onClick={() => setPersona("analyst")}>Analyst</Button>
              <Button size="sm" variant={persona === "mentor" ? "secondary" : "ghost"} onClick={() => setPersona("mentor")}>Mentor</Button>
            </div>
          </div>

          <div ref={listRef} role="log" aria-live="polite" aria-relevant="additions" className="mx-3 mb-3 h-[300px] overflow-auto rounded-md border border-border p-3 text-sm space-y-2 bg-card">
            {items.length === 0 && (
              <div className="text-muted-foreground">Ask about security, or choose Analyze URL and paste a link.</div>
            )}
            {items.map((it, i) => (
              <div key={i} className={it.role === "user" ? "text-foreground" : "text-foreground/90"}>
                <div className="font-medium text-xs mb-1">{it.role === "user" ? "You" : "Assistant"}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{it.text}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={mode === "analyze_url" ? "Paste a URL or ask about it" : "Type a message"}
              aria-label={mode === "analyze_url" ? "Paste a URL or ask about it" : "Type a message"}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => { if (e.key === "Enter") onSend() }}
            />
            <Button onClick={onSend} disabled={sending || streaming || !message.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 px-3 pb-3">
            {quick.map((q, i) => (
              <Button key={i} variant="secondary" size="sm" onClick={() => { setMode(q.m); setMessage(q.t) }}>{q.t}</Button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
