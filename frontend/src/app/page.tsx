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
    </div>
  )
}
