import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const variants: Record<string, string> = {
  primary:
    "bg-accent text-black font-medium hover:bg-accent/90 shadow-[0_0_15px_rgba(226,224,217,0.2)] transition-all",
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
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