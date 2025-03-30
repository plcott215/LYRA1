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
            {/* Dark inner circle to create black center */}
            <circle cx="50" cy="50" r="45" fill="black" />
            
            {/* Main eclipse ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="currentColor" 
              className="text-primary" 
              strokeWidth="6"
              strokeDasharray="251"
              strokeDashoffset="30"
              transform="rotate(130, 50, 50)"
            />
            
            {/* Subtle glow for depth */}
            <circle 
              cx="50" 
              cy="50" 
              r="42" 
              stroke="currentColor" 
              className="text-primary opacity-20" 
              strokeWidth="1"
              strokeDasharray="255"
              strokeDashoffset="25"
              transform="rotate(130, 50, 50)"
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