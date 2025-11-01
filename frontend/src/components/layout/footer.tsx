import Link from "next/link"
import { Shield, Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="custom-container flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-primary" />
          <span>ALSS © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground">Docs</Link>
          <a href="#" className="hover:text-foreground flex items-center gap-1"><Github className="h-4 w-4" /> GitHub</a>
          <span className="text-xs">Dark-mode only</span>
        </div>
      </div>
    </footer>
  )
}
