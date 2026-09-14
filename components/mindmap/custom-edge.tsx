"use client";

import { memo } from "react";
import { EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { CATEGORY_COLORS } from "@/lib/constants";

export const MindMapCustomEdge = memo(function MindMapCustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const gradientId = `edge-grad-${id}`;
  const glowId = `edge-glow-${id}`;
  const color = CATEGORY_COLORS["core"] ?? "#8b5cf6";

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={edgePath}
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 2.2 : 1.4}
        strokeDasharray="6 4"
        filter={`url(#${glowId})`}
        fill="none"
        className="animate-dash-flow"
        style={{ animationDuration: selected ? "0.6s" : "1.4s" }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: labelX, top: labelY }}
          >
            <span
              className="rounded-md border border-white/10 bg-neutral-950/85 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-zinc-400 backdrop-blur-xl"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});