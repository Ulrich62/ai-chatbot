"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BetaIndicatorProps {
  className?: string;
  variant?: "badge" | "text" | "floating";
}

export function BetaIndicator({
  className,
  variant = "badge",
}: BetaIndicatorProps) {
  const isMobile = useIsMobile();

  if (variant === "text") {
    return (
      <span className={cn("text-xs text-muted-foreground/60", className)}>
        BETA
      </span>
    );
  }

  if (variant === "floating") {
    // En mobile, on n'affiche pas le badge flottant car il sera dans la sidebar
    if (isMobile) {
      return null;
    }

    return (
      <div
        className={cn(
          "fixed top-4 right-4 z-50 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30 shadow-lg backdrop-blur-sm hover:scale-105 transition-transform duration-200",
          className,
        )}
      >
        <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
        BETA
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30",
        className,
      )}
    >
      BETA
    </span>
  );
}
