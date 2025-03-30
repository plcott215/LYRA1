import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 relative",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 after:absolute after:inset-0 after:rounded-md after:border-2 after:border-primary/0 after:transition-all hover:after:border-primary/30 hover:after:scale-105 after:opacity-0 hover:after:opacity-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/95 hover:shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5 after:absolute after:inset-0 after:rounded-md after:border-2 after:border-destructive/0 after:transition-all hover:after:border-destructive/30 hover:after:scale-105 after:opacity-0 hover:after:opacity-100",
        outline:
          "border border-input bg-background hover:bg-accent/5 hover:text-accent-foreground hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-sm hover:shadow-primary/5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary decoration-primary/30 hover:decoration-primary/70 decoration-[1px] hover:decoration-[1.5px]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
