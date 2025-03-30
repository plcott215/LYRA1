import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HoverAnimationProps {
  children: ReactNode;
  className?: string;
  type?: "scale" | "shine" | "lift" | "glow" | "underline" | "border";
  duration?: "fast" | "normal" | "slow";
}

/**
 * A component that adds hover animations to its children
 */
export function HoverAnimation({
  children,
  className,
  type = "scale",
  duration = "normal",
}: HoverAnimationProps) {
  const durationClasses = {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
  };

  const animationClasses = {
    scale: "hover:scale-105 active:scale-95",
    shine: "overflow-hidden relative before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:before:translate-x-full before:transition-transform before:duration-500",
    lift: "hover:-translate-y-1 active:translate-y-0.5",
    glow: "hover:shadow-[0_0_15px_rgba(252,238,9,0.5)]",
    underline: "relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:bottom-0 after:left-0 hover:after:w-full after:transition-all",
    border: "hover:border-primary transition-colors",
  };

  return (
    <div
      className={cn(
        "transition-all",
        durationClasses[duration],
        animationClasses[type],
        className
      )}
    >
      {children}
    </div>
  );
}