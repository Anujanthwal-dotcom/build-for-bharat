import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "violet" | "cyan" | "blue" | "amber" | "pink" | "green" | "zinc";
}

const tones: Record<string, string> = {
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  pink: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  zinc: "bg-white/10 text-zinc-300 border-white/15",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone = "zinc", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
          tones[tone],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";