"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"
  const linkCls = (active: boolean) =>
    active
      ? "relative text-sm text-[#00C2FF] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-[#00C2FF] after:shadow-[0_0_12px_2px_rgba(0,194,255,0.6)]"
      : "relative text-sm text-foreground/80 hover:text-foreground after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-[#00C2FF] hover:after:w-full after:transition-all after:duration-300"
  return (
    <header className="fixed top-0 z-50 w-full border-b border-transparent bg-transparent">
      <div className="custom-container grid h-16 grid-cols-3 items-center">
        {/* Left: small neon shield icon */}
        <Link href="/" className="flex items-center gap-2" aria-label="ALSS Home">
          <Shield className="h-5 w-5 text-[#00C2FF] drop-shadow-[0_0_10px_rgba(0,194,255,0.7)]" />
          <span className="sr-only">ALSS</span>
        </Link>

        {/* Center: menu */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          <Link href="/" className={linkCls(isHome)}>Home</Link>
          <Link href="/learn" className={linkCls(pathname === "/learn")}>Learn</Link>
          <Link href="/docs" className={linkCls(pathname === "/docs")}>Docs</Link>
          <Link href="/contact" className={linkCls(pathname === "/contact")}>Contact</Link>
        </nav>

        {/* Right: mobile menu button */}
        <div className="ml-auto flex items-center justify-end md:hidden">
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur">
          <div className="absolute right-0 top-0 h-full w-80 border-l border-border bg-background p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#00C2FF]"><Shield className="h-4 w-4" /><span className="font-semibold">ALSS</span></div>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <Link href="/" onClick={() => setOpen(false)} className={isHome ? "text-[#00C2FF]" : "text-foreground/90"}>Home</Link>
              <Link href="/learn" onClick={() => setOpen(false)} className={pathname === "/learn" ? "text-[#00C2FF]" : "text-foreground/90"}>Learn</Link>
              <Link href="/docs" onClick={() => setOpen(false)} className={pathname === "/docs" ? "text-[#00C2FF]" : "text-foreground/90"}>Docs</Link>
              <Link href="/contact" onClick={() => setOpen(false)} className={pathname === "/contact" ? "text-[#00C2FF]" : "text-foreground/90"}>Contact</Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  )
}
