"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Menu, X, History, Settings, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ALSSLogo } from "@/components/brand/logo"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="custom-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="ALSS Home">
          <ALSSLogo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/#scan" className="text-sm text-foreground/80 hover:text-foreground">
            Scan
          </Link>
          <Link href="/learn" className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1">
            <Book className="h-4 w-4" /> Learn
          </Link>
          <Link href="/history" className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1">
            <History className="h-4 w-4" /> History
          </Link>
          <Link href="/settings" className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <Link href="/docs" className="text-sm text-foreground/80 hover:text-foreground flex items-center gap-1">
            <Book className="h-4 w-4" /> Docs
          </Link>
          <Button size="sm" className="ml-2" asChild>
            <Link href="/#scan">Get Started</Link>
          </Button>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="absolute right-0 top-0 h-full w-80 border-l border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ALSSLogo variant="icon" size={18} />
                <span className="font-semibold">ALSS</span>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <Link href="/#scan" onClick={() => setOpen(false)} className="text-foreground/90">
                Scan
              </Link>
              <Link href="/learn" onClick={() => setOpen(false)} className="text-foreground/90">
                Learn
              </Link>
              <Link href="/history" onClick={() => setOpen(false)} className="text-foreground/90">
                History
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="text-foreground/90">
                Settings
              </Link>
              <Link href="/docs" onClick={() => setOpen(false)} className="text-foreground/90">
                Docs
              </Link>
              <Button className="mt-2" asChild>
                <Link href="/#scan" onClick={() => setOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
