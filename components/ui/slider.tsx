"use client";

import { forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  labels?: { min?: string; mid?: string; max?: string };
}

export const Slider = forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, labels, ...props }, ref) => {
    return (
      <div className="w-full">
        <SliderPrimitive.Root
          ref={ref}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-600 to-violet-600" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-white/30 bg-white shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500/50 hover:scale-110" />
        </SliderPrimitive.Root>
        {labels && (
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-zinc-500">
            <span>{labels.min}</span>
            {labels.mid && <span>{labels.mid}</span>}
            <span>{labels.max}</span>
          </div>
        )}
      </div>
    );
  },
);
Slider.displayName = "Slider";