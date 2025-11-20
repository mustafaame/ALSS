import Link from "next/link"
import { Shield, Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="custom-container flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>ALSS © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="#premium" className="text-foreground/80 hover:text-foreground">Ultra Premium Services</Link>
          <Link href="#privacy" className="text-foreground/80 hover:text-foreground">Privacy Policy</Link>
          <Link href="#tos" className="text-foreground/80 hover:text-foreground">Terms of Service</Link>
          <div className="ml-2 flex items-center gap-3">
            <a aria-label="Twitter" href="#" className="text-[#00C2FF] hover:drop-shadow-[0_0_10px_rgba(0,194,255,0.6)]"><Twitter className="h-4 w-4" /></a>
            <a aria-label="LinkedIn" href="#" className="text-[#00C2FF] hover:drop-shadow-[0_0_10px_rgba(0,194,255,0.6)]"><Linkedin className="h-4 w-4" /></a>
            <a aria-label="GitHub" href="#" className="text-[#00C2FF] hover:drop-shadow-[0_0_10px_rgba(0,194,255,0.6)]"><Github className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  )
}
