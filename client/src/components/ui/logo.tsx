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
            {/* Glowing effect in the background */}
            <circle cx="50" cy="50" r="45" fill="currentColor" className="text-primary opacity-20" />
            
            {/* Main circular background */}
            <circle cx="50" cy="50" r="40" fill="currentColor" className="text-primary" />
            
            {/* 'L' letter */}
            <path 
              d="M34 30V70H66" 
              stroke="var(--background)" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Sound wave lines */}
            <path 
              d="M55 45C60 45 65 45 70 45" 
              stroke="var(--background)" 
              strokeWidth="4" 
              strokeLinecap="round" 
            />
            <path 
              d="M55 55C63 55 71 55 77 55" 
              stroke="var(--background)" 
              strokeWidth="4" 
              strokeLinecap="round" 
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