
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("manga-font manga-text-gradient font-bold", sizeClasses[size])}>
        Panel Pal
      </span>
    </div>
  );
}
