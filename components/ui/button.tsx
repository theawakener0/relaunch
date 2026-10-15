import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Legacy .btn: 52px touch target, 18px radius, bold clamp-sized label, red fill
// with a brighter hover and a lighter "ghost" secondary for Log out.
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2.5 border-0 bg-primary px-4 py-3.5 min-h-[52px] font-bold text-primary-foreground rounded-[18px] whitespace-nowrap cursor-pointer select-none disabled:opacity-65 disabled:cursor-wait",
  {
    variants: {
      variant: {
        default: "hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground border border-secondary-border hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        // Exactly one font-size class per size variant: tailwind-merge can't
        // tell the custom `text-btn` token clashes with `text-lg`.
        default: "text-btn",
        arrow: "px-[22px] text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
