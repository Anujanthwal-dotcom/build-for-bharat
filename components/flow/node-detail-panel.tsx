"use client";

import { useEffect, useCallback } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { CATEGORY_ACCENT_BORDER, CATEGORY_LABELS, type Category } from "@/lib/constants";

interface ConnectedNode {
  id: string;
  label: string;
  edgeLabel: string;
  direction: "incoming" | "outgoing";
}

interface NodeDetailPanelProps {
  node: {
    id: string;
    label: string;
    summary: string;
    category: string;
    tags: string[];
  } | null;
  connectedNodes: ConnectedNode[];
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
}

export function NodeDetailPanel({ node, connectedNodes, onClose, onNavigate }: NodeDetailPanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!node) return null;

  const accentColor =
    CATEGORY_ACCENT_BORDER[node.category as Category] ?? CATEGORY_ACCENT_BORDER.default;
  const categoryLabel =
    CATEGORY_LABELS[node.category as Category] ?? node.category ?? "Default";

  const incoming = connectedNodes.filter((n) => n.direction === "incoming");
  const outgoing = connectedNodes.filter((n) => n.direction === "outgoing");

  return (
    <div className="absolute right-0 top-0 h-full z-50 flex animate-slide-in-right">
      {/* Panel */}
      <div className="w-[340px] h-full bg-[#0d0d11]/95 backdrop-blur-xl border-l border-white/[0.07] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-white/[0.06]">
          {/* Accent bar */}
          <div className="h-[3px]" style={{ backgroundColor: accentColor }} />

          <div className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    {categoryLabel}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white/90 leading-snug">
                  {node.label}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Summary */}
          {node.summary && (
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-2">
                Summary
              </h3>
              <p className="text-[13px] text-white/60 leading-relaxed">
                {node.summary}
              </p>
            </div>
          )}

          {/* Tags */}
          {node.tags.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {node.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono text-white/50 bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Connections */}
          {connectedNodes.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-3">
                Connections
              </h3>

              {/* Outgoing */}
              {outgoing.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-mono text-white/25 mb-1.5 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Outgoing
                  </p>
                  <div className="space-y-1">
                    {outgoing.map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => onNavigate(conn.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] text-white/70 group-hover:text-white/90 transition-colors truncate block">
                            {conn.label}
                          </span>
                          {conn.edgeLabel && (
                            <span className="text-[10px] font-mono text-white/30">
                              {conn.edgeLabel}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Incoming */}
              {incoming.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-white/25 mb-1.5 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Incoming
                  </p>
                  <div className="space-y-1">
                    {incoming.map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => onNavigate(conn.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
                      >
                        <ArrowLeft className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] text-white/70 group-hover:text-white/90 transition-colors truncate block">
                            {conn.label}
                          </span>
                          {conn.edgeLabel && (
                            <span className="text-[10px] font-mono text-white/30">
                              {conn.edgeLabel}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-white/[0.06]">
          <p className="text-[10px] font-mono text-white/20 text-center">
            Press Esc to close · Click a connection to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
