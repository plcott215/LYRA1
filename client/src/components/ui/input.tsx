import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  enhancedFocus?: boolean;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enhancedFocus = false, icon, wrapperClassName, ...props }, ref) => {
    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          enhancedFocus && "focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(252,238,9,0.1)]",
          icon && "pl-10",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (icon) {
      return (
        <div className={cn("relative", wrapperClassName)}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
            {icon}
          </div>
          {inputElement}
        </div>
      );
    }

    return inputElement;
  }
)
Input.displayName = "Input"

export { Input }
