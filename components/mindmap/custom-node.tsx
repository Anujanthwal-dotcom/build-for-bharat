"use client";

import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";

export interface MindMapNodeData {
  label: string;
  summary: string;
  category: string;
  sourceCount?: number;
}

export const MindMapCustomNode = memo(function MindMapCustomNode({
  data,
  selected,
}: {
  data: MindMapNodeData;
  selected?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const accent = CATEGORY_COLORS[data.category] ?? "#8b5cf6";
  const categoryLabel = CATEGORY_LABELS[data.category] ?? data.category;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded((value) => !value);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "glass-card w-[220px] rounded-xl px-3 py-2.5",
        "transition-all duration-200",
        selected
          ? "border-white/25 shadow-glow"
          : "border-white/10 hover:border-white/20",
      )}
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        <span className="min-w-0 select-none truncate font-mono text-[11px] font-medium tracking-tight text-zinc-400">
          {categoryLabel.toUpperCase()}
        </span>
        <span className="ml-auto flex items-center gap-1 text-zinc-500">
          <Sparkles className="h-3 w-3 opacity-60" />
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")}
          />
        </span>
      </div>

      <div className="mt-1.5 select-none text-[13px] font-semibold leading-snug text-zinc-100">
        {data.label}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="mt-1.5 select-none pb-0.5 text-[11px] leading-relaxed text-zinc-400">
            {data.summary}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
});