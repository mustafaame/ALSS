"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UrlForm from "@/components/scan/url-form"
import FileForm from "@/components/scan/file-form"
import { Shield, FileText, Sparkles, CheckCircle2 } from "lucide-react"
import ALSSCore from "@/components/visuals/alss-core"

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-border p-0 min-h-[82vh] md:min-h-[92vh] flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          {/* Organic living canvas */}
          <ALSSCore className="absolute inset-0 opacity-[0.9] pointer-events-none [mix-blend-screen]" />
          {/* Deep vignette + subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,224,184,0.05),transparent_60%),radial-gradient(ellipse_at_center,rgba(0,0,0,0.5),transparent_70%)]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
          {/* shimmer */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 md:h-64 bg-[linear-gradient(110deg,transparent,rgba(34,197,94,0.10),transparent)] bg-[length:200%_100%] animate-shimmer" aria-hidden />
        </div>
        {/* Bottom glass control bar (hero overlay) */}
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 w-[min(94%,760px)] rounded-xl border border-accent/30 bg-background/70 backdrop-blur-md shadow-[0_0_40px_rgba(25,245,159,0.12)]">
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">ALSS: Advanced Link Security Scanner</div>
              <div className="text-xs text-muted-foreground">The Eye of the Digital Storm. Uncover the Unseen.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="shadow-brand hover:shadow-brand/70">
                <Link href="#scan">Scan Now</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/learn">Learn</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="#file-scan">Scan File</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Central interaction locus */}
        <div className="relative z-10 text-center px-6">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="text-4xl md:text-5xl font-bold tracking-tight">
            ALSS: Advanced Link Security Scanner
          </motion.h1>
          <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-foreground/90">
            The Eye of the Digital Storm. Uncover the Unseen.
          </p>
          <div className="mt-10">
            <button
              aria-label="Activate scan"
              onClick={() => { try { (window as any).ALSSCore?.absorb?.() } catch {}; const t=document.getElementById('scan'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className="group relative h-36 w-36 md:h-44 md:w-44 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md shadow-[0_0_40px_rgba(0,224,184,0.15)] hover:shadow-[0_0_60px_rgba(0,224,184,0.25)] transition-shadow"
            >
              <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.75),transparent_60%)] opacity-80 mix-blend-screen" />
              <span className="relative z-10 text-xs tracking-wider text-muted-foreground group-hover:text-foreground">Click or Scroll to Scan</span>
            </button>
          </div>
        </div>
        {/* Edge hints */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">Scan File</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">AI Insights</div>
        </div>
      </section>

      <section id="scan" className="scroll-mt-24">
        <UrlForm />
      </section>

      <section id="file-scan" className="scroll-mt-24">
        <FileForm />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <Card className="glass hover:shadow-brand/30 transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle>Real-time URL Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              SSL, WHOIS, redirects, and DNS in one fast scan with clear outcomes.
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="glass hover:shadow-brand/30 transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <CardTitle>AI Threat Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Gemini-powered explanations with actionable guidance and awareness tips.
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card className="glass hover:shadow-brand/30 transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>Beautiful Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Export polished PDFs and share findings confidently with your team.
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="rounded-xl border border-border glass p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-muted-foreground/80">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider">Trusted by security-conscious teams</span>
          </div>
          <div className="grid w-full grid-cols-2 place-items-center gap-4 text-muted-foreground/70 md:w-auto md:grid-cols-4">
            <span className="text-sm">AcmeSec</span>
            <span className="text-sm">NovaShield</span>
            <span className="text-sm">Aegis Labs</span>
            <span className="text-sm">CobaltX</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="glass">
          <CardContent className="p-6 text-sm">
            <p className="italic">“ALSS became our quickest way to triage suspicious links with clarity.”</p>
            <div className="mt-3 text-xs text-muted-foreground">— Security Analyst</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6 text-sm">
            <p className="italic">“The AI insights are concise and practical. It saves our team hours weekly.”</p>
            <div className="mt-3 text-xs text-muted-foreground">— IT Lead</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6 text-sm">
            <p className="italic">“Exported reports look great in executive briefings.”</p>
            <div className="mt-3 text-xs text-muted-foreground">— CTO</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <details className="rounded-lg border border-border p-4 glass">
          <summary className="cursor-pointer font-medium">How accurate is the threat score?</summary>
          <p className="mt-2 text-sm text-muted-foreground">It combines HTTP, DNS, SSL and heuristics. Use it as guidance alongside your internal controls.</p>
        </details>
        <details className="rounded-lg border border-border p-4 glass">
          <summary className="cursor-pointer font-medium">Can I scan files securely?</summary>
          <p className="mt-2 text-sm text-muted-foreground">Yes. We analyze hashes and structure locally on the backend without sharing to third parties.</p>
        </details>
        <details className="rounded-lg border border-border p-4 glass">
          <summary className="cursor-pointer font-medium">Does ALSS support teams?</summary>
          <p className="mt-2 text-sm text-muted-foreground">Team features are planned (RBAC, audit logs, API keys). Contact us for early access.</p>
        </details>
        <details className="rounded-lg border border-border p-4 glass">
          <summary className="cursor-pointer font-medium">Is there an API?</summary>
          <p className="mt-2 text-sm text-muted-foreground">Yes. The backend exposes endpoints for URL and file scans; more endpoints are being added.</p>
        </details>
      </section>

      <section className="text-center rounded-xl border border-border p-10 glass">
        <h2 className="text-2xl font-semibold">Ready to scan smarter?</h2>
        <p className="mt-2 text-muted-foreground">Run your first analysis now and get AI guidance instantly.</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button asChild className="shadow-brand hover:shadow-brand/70">
            <Link href="#scan">Start Free Scan</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/learn">Explore Learn</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
