"use client";

import { useState } from "react";
import { ChevronDown, FileText, Link as LinkIcon, ListTree, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Source } from "@/lib/types";

interface OutlineItem {
  id: string;
  label: string;
}

interface SourceInspectorProps {
  sources: Source[];
  outline: OutlineItem[];
  selectedNodeId?: string | null;
  onOutlineSelect?: (nodeId: string) => void;
}

export function SourceInspector({ sources, outline, selectedNodeId, onOutlineSelect }: SourceInspectorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOutline = outline.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex h-full items-center gap-2 border-r border-white/[0.07] bg-[#0d0d11]/90 px-2.5 text-zinc-400 transition-colors hover:text-white"
        title="Expand source inspector"
      >
        <PanelRightOpen className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex h-full w-72 flex-col border-l border-white/[0.07] bg-[#0d0d11]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          <ListTree className="h-3.5 w-3.5" /> Sources
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="relative px-3 py-3">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
        <GlassInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search outline…"
          className="h-8 pl-8 text-[12px]"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <CollapsibleList title="Sources" count={sources.length} defaultOpen>
          <div className="space-y-1.5">
            {sources.map((source) => (
              <div
                key={source.id}
                className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2"
              >
                <div className="flex items-center gap-1.5">
                  {source.type === "link" ? (
                    <LinkIcon className="h-3 w-3 text-cyan-400" />
                  ) : (
                    <FileText className="h-3 w-3 text-violet-400" />
                  )}
                  <span className="truncate font-mono text-[11px] text-zinc-300">
                    {source.label}
                  </span>
                </div>
                <p className="mt-1 line-clamp-3 font-mono text-[10px] leading-relaxed text-zinc-500">
                  {source.content.slice(0, 200)}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleList>

        <CollapsibleList title="Extracted Outline" count={outline.length} defaultOpen>
          <ul className="space-y-1">
            {filteredOutline.map((item, index) => {
              const isSelected = item.id === selectedNodeId;
              return (
                <li
                  key={item.id}
                  onClick={() => onOutlineSelect?.(item.id)}
                  className={`flex items-center gap-2 rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                    isSelected
                      ? "bg-accent/10 text-accent"
                      : "text-zinc-400 hover:bg-white/[0.04]"
                  } ${onOutlineSelect ? "cursor-pointer" : ""}`}
                >
                  <span className="font-mono text-[9px] text-zinc-600">{index + 1}</span>
                  <span className="truncate">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </CollapsibleList>
      </div>
    </div>
  );
}

function CollapsibleList({
  title,
  count,
  children,
  defaultOpen,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="mb-3">
      <CollapsibleTrigger className="flex w-full items-center gap-1.5 rounded-lg px-1 py-2 text-left transition-colors hover:bg-white/[0.04]">
        <ChevronDown className="h-3 w-3 text-zinc-500" />
        <span className="font-mono text-[11px] font-semibold text-zinc-300">{title}</span>
        <Badge tone="zinc" className="ml-auto">
          {count}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}