import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm",
          "text-zinc-100 placeholder:text-zinc-500 backdrop-blur-xl",
          "transition-colors focus:border-violet-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-violet-500/40",
          className,
        )}
        {...props}
      />
    );
  },
);
GlassInput.displayName = "GlassInput";

export const GlassTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm",
          "text-zinc-100 placeholder:text-zinc-500 backdrop-blur-xl",
          "transition-colors focus:border-violet-500/50 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-violet-500/40",
          "font-mono leading-relaxed",
          className,
        )}
        {...props}
      />
    );
  },
);
GlassTextarea.displayName = "GlassTextarea";