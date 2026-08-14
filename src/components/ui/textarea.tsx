import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-lg border border-ink-border bg-ink px-3 py-2 text-sm text-bone placeholder:text-silver/70 outline-none transition-colors focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
