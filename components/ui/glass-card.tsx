import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "outline";
  interactive?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "glass", interactive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/10",
          variant === "glass" && "glass-card",
          variant === "solid" && "bg-neutral-900/80 border-white/10",
          variant === "outline" && "bg-transparent",
          interactive &&
            "glass-hover cursor-pointer hover:border-white/20 hover:-translate-y-0.5 hover:shadow-glass-lg",
          className,
        )}
        {...props}
      />
    );
  },
);
GlassCard.displayName = "GlassCard";