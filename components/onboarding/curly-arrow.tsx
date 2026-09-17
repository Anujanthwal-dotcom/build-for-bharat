"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CurlyArrowProps {
  className?: string;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  curvature?: number;
  loop?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  label?: string;
}

/**
 * CurlyArrow: An animated dashed connector featuring playful loops,
 * swirls, and a clean architectural arrow aesthetic matching the monochrome palette.
 */
export function CurlyArrow({
  className,
  start = { x: 50, y: 50 },
  end = { x: 250, y: 150 },
  loop = true,
  strokeColor = "#E2E0D9",
  strokeWidth = 2,
  label,
}: CurlyArrowProps) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);

  // Compute loop control points if loop is requested
  let pathD = "";

  if (loop && distance > 80) {
    // Generate a cute loop-de-loop spiral path
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const loopRadius = Math.min(36, distance * 0.2);

    // Path with a playful upward curl / loop in the middle
    pathD = `
      M ${start.x} ${start.y}
      C ${start.x + dx * 0.25} ${start.y - 30},
        ${midX - loopRadius} ${midY - loopRadius * 1.8},
        ${midX} ${midY - loopRadius}
      S ${midX + loopRadius * 1.4} ${midY + loopRadius},
        ${midX + dx * 0.15} ${midY + dy * 0.1}
      C ${midX + dx * 0.3} ${midY + dy * 0.25},
        ${end.x - dx * 0.15} ${end.y - 20},
        ${end.x} ${end.y}
    `;
  } else {
    // Elegant sweeping quadratic curve
    const cpX = (start.x + end.x) / 2 + (dy > 0 ? -25 : 25);
    const cpY = Math.min(start.y, end.y) - 40;
    pathD = `M ${start.x} ${start.y} Q ${cpX} ${cpY} ${end.x} ${end.y}`;
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-visible z-30", className)}>
      <svg className="w-full h-full overflow-visible" fill="none">
        <defs>
          {/* Clean Custom Arrowhead Marker */}
          <marker
            id="curly-arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M 2 2 L 8 5 L 2 8 L 3.5 5 Z"
              fill={strokeColor}
              stroke={strokeColor}
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Soft subtle glow trace */}
        <path
          d={pathD}
          stroke={strokeColor}
          strokeWidth={strokeWidth + 2}
          strokeDasharray="6 8"
          strokeLinecap="round"
          className="opacity-15 blur-[2px]"
        />

        {/* Core animated dashed curly stroke */}
        <path
          d={pathD}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray="6 6"
          strokeLinecap="round"
          markerEnd="url(#curly-arrowhead)"
          className="tour-curve opacity-90"
        />

        {/* Origin decorative bubble */}
        <circle cx={start.x} cy={start.y} r="3.5" fill={strokeColor} className="animate-pulse" />
        <circle cx={start.x} cy={start.y} r="6.5" stroke={strokeColor} strokeWidth="1" opacity="0.4" />

        {/* End pulse ripple behind the arrow */}
        <circle cx={end.x} cy={end.y} r="5" fill={strokeColor} opacity="0.3" className="animate-ping" />

        {/* Optional handwritten-style Label */}
        {label && (
          <g
            transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2 - 22})`}
            className="select-none"
          >
            <rect
              x="-40"
              y="-11"
              width="80"
              height="22"
              rx="6"
              fill="#121214"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="2"
              fill={strokeColor}
              fontSize="10"
              fontWeight="600"
              fontFamily="monospace"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
