import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

// Legacy .field input: 20px radius (26px on desktop, 16px under 380px), 16/19px
// text, red invalid state via aria-invalid. Every colour is a token so the
// field flips with the theme; the dark values are the original hexes.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 box-border bg-field/70 backdrop-blur-xl saturate-150 border border-input/70 text-foreground rounded-[20px] px-[18px] py-4 text-base leading-[1.4] transition-[border-color,box-shadow] duration-150 shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] placeholder:text-muted-foreground focus:border-ring focus:shadow-[0_0_0_3px_var(--focus-halo)] aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_var(--danger-halo)] sm:rounded-[26px] sm:px-6 sm:py-[22px] sm:text-[19px] max-xs:rounded-[16px] max-xs:px-4 max-xs:py-[14px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
