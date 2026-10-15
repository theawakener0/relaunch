"use client"

import * as React from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Icon-free toasts in the legacy look: 12px radius (the per-toast
// .toast-ok/.toast-bad classes in globals.css add the legacy padding, width,
// shadow and green/red borders).
//
// The three surface colours are passed as `var()` references in the inline
// style, not as literals. Sonner resolves them on the toaster element, so they
// re-evaluate whenever next-themes swaps the class on <html> — the toaster is
// theme-aware with no theme read of its own and therefore no hydration risk.
// They also win over sonner's own [data-sonner-theme] defaults because an
// inline declaration beats a stylesheet rule.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--toast)",
          "--normal-text": "var(--toast-foreground)",
          "--normal-border": "var(--toast-border)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }