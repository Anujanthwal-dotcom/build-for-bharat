import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("h-px w-full bg-white/[0.08]", className)} {...props} />;
  },
);
Separator.displayName = "Separator";