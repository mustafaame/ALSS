"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  label?: string
}

export function ExportPdfButton({ className, label = "Export PDF" }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("no-print", className)}
      onClick={() => {
        try {
          window.print()
        } catch {}
      }}
    >
      {label}
    </Button>
  )
}
