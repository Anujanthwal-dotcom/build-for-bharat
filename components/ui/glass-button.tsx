import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:brightness-110",
  secondary:
    "bg-white/[0.06] text-zinc-100 border border-white/10 hover:bg-white/[0.12] backdrop-blur-xl",
  ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]",
  outline:
    "bg-transparent border border-white/15 text-zinc-200 hover:bg-white/[0.06] hover:border-white/25",
  danger: "bg-red-600/20 text-red-300 border border-red-600/30 hover:bg-red-600/30",
};

const sizes: Record<string, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
          "disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
GlassButton.displayName = "GlassButton";