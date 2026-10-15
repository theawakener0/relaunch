"use client"

import * as React from "react"
import { cn } from "cn"

// Legacy .field label: block, clamp-sized, 10px below / 8px inset.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "block select-none text-label leading-normal text-label-foreground mb-2.5 ml-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
