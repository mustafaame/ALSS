"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Menu, X, History, Settings, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ALSSLogo } from "@/components/brand/logo"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"
  return (
    <header className={isHome ? "absolute top-0 z-50 w-full border-b border-transparent bg-transparent" : "sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur"}>
      <div className="custom-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="ALSS Home">
          <ALSSLogo className="scale-[1.08] md:scale-110" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-foreground/80 hover:text-foreground">Home</Link>
          <Link href="/#features" className="text-sm text-foreground/80 hover:text-foreground">Features</Link>
          <Link href="/#pricing" className="text-sm text-foreground/80 hover:text-foreground">Pricing</Link>
          <Link href="/#support" className="text-sm text-foreground/80 hover:text-foreground">Support</Link>
          <Link href="/settings" className="text-sm text-foreground/80 hover:text-foreground">Login</Link>
          <Button size="sm" className="ml-2" asChild>
            <Link href="/learn">Learn</Link>
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
              <Link href="/" onClick={() => setOpen(false)} className="text-foreground/90">Home</Link>
              <Link href="/#features" onClick={() => setOpen(false)} className="text-foreground/90">Features</Link>
              <Link href="/#pricing" onClick={() => setOpen(false)} className="text-foreground/90">Pricing</Link>
              <Link href="/#support" onClick={() => setOpen(false)} className="text-foreground/90">Support</Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="text-foreground/90">Login</Link>
              <Button className="mt-2" asChild>
                <Link href="/learn" onClick={() => setOpen(false)}>Learn</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
