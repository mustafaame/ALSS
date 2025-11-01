"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UrlForm from "@/components/scan/url-form"
import FileForm from "@/components/scan/file-form"
import { Shield, FileText, Sparkles, CheckCircle2 } from "lucide-react"
import NeonParticles from "@/components/visuals/neon-particles"
import ShieldCanvas from "@/components/ShieldCanvas"
import ScanForm from "@/components/ScanForm"

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-none border-none p-0 min-h-screen flex items-center justify-center bg-hero-gradient">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-noise opacity-[0.35]" aria-hidden />
          <div className="absolute inset-0 [background:radial-gradient(circle_at_center,rgba(0,194,255,0.12),transparent_55%)]" aria-hidden />
          <div className="absolute inset-0 [background:linear-gradient(120deg,rgba(0,194,255,0.12)_0%,transparent_40%,rgba(255,0,255,0.12)_70%,transparent_100%)] [background-size:200%_200%] animate-beam" aria-hidden />
          <NeonParticles count={60} />
        </div>
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-6 py-16 text-center">
          <ShieldCanvas className="w-full" />
          <motion.h1 initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="mt-8 font-poppins text-4xl md:text-5xl font-bold text-[#E2E8F0] text-glow-cyan">
            Advanced Link Security Scanner
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="mt-3 max-w-2xl text-base md:text-lg text-glow-blue text-[#c7d2fe]">
            AI‑Powered Threat Detection
          </motion.p>
          <div className="mt-6 w-full max-w-xl">
            <ScanForm />
          </div>
        </div>
      </section>

      {/* Additional sections removed to honor reset hero spec */}

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
