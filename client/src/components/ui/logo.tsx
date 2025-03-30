import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  withText?: boolean;
}

export function Logo({ size = "md", withText = true, className }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn(sizeClasses[size])}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            {/* Complete circle with no gap */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="currentColor" 
              className="text-primary" 
              strokeWidth="6"
            />
          </g>
        </svg>
      </div>
      
      {withText && (
        <span className={cn("font-bold tracking-tight ml-2", textSizeClasses[size])}>
          <span className="text-primary">Lyra</span>
        </span>
      )}
    </div>
  );
}

export default Logo;