"use client";

import { useReactFlow, useStore } from "@xyflow/react";
import { Plus, Minus, Maximize2, Lock, Unlock } from "lucide-react";
import { useCallback, useState } from "react";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const zoom = useStore((s) => Math.round(s.transform[2] * 100));
  const [locked, setLocked] = useState(false);

  const handleZoomIn = useCallback(() => zoomIn({ duration: 200 }), [zoomIn]);
  const handleZoomOut = useCallback(() => zoomOut({ duration: 200 }), [zoomOut]);
  const handleFitView = useCallback(() => fitView({ padding: 0.2, duration: 400 }), [fitView]);

  return (
    <div className="absolute bottom-5 left-5 z-30 flex items-center gap-1 rounded-xl bg-[#141418]/90 backdrop-blur-xl border border-white/[0.08] p-1 shadow-lg shadow-black/40">
      <button
        onClick={handleZoomOut}
        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Zoom out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="min-w-[42px] text-center text-[11px] font-mono text-white/35 select-none">
        {zoom}%
      </span>

      <button
        onClick={handleZoomIn}
        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Zoom in"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-white/[0.08] mx-0.5" />

      <button
        onClick={handleFitView}
        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Fit to view"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => setLocked((l) => !l)}
        className={`p-2 rounded-lg transition-colors ${
          locked ? "text-accent bg-accent/10" : "text-white/40 hover:text-white hover:bg-white/[0.08]"
        }`}
        title={locked ? "Unlock canvas" : "Lock canvas"}
      >
        {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
