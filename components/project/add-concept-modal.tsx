"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Sparkles, Network } from "lucide-react";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";

interface AddConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (concept: {
    label: string;
    summary: string;
    category: string;
    parentId?: string;
    edgeLabel?: string;
    tags: string[];
    autoLayout: boolean;
  }) => void;
  existingNodes: Array<{ id: string; label: string }>;
  initialParentId?: string | null;
}

export function AddConceptModal({
  isOpen,
  onClose,
  onAdd,
  existingNodes,
  initialParentId,
}: AddConceptModalProps) {
  const [label, setLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<Category>("core");
  const [parentId, setParentId] = useState<string>("");
  const [edgeLabel, setEdgeLabel] = useState<string>("");
  const [tagsInput, setTagsInput] = useState("");
  const [autoLayout, setAutoLayout] = useState(true);

  // Sync initialParentId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialParentId) {
        setParentId(initialParentId);
        setEdgeLabel("sub-concept of");
      } else {
        setParentId("");
        setEdgeLabel("");
      }
    } else {
      setLabel("");
      setSummary("");
      setTagsInput("");
    }
  }, [isOpen, initialParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAdd({
      label: label.trim(),
      summary: summary.trim(),
      category,
      parentId: parentId || undefined,
      edgeLabel: edgeLabel.trim() || undefined,
      tags,
      autoLayout,
    });

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-[#121214] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.8)] rounded-xl z-50 overflow-hidden flex flex-col data-[state=open]:animate-fade-in-up font-sans">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-accent border border-white/10">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-white/90">
                  {initialParentId ? "Add Sub-Concept" : "Add New Concept"}
                </Dialog.Title>
                <p className="text-[11px] font-mono text-muted">
                  Expand your visual mental model
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="text-muted hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Concept Title */}
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">
                Concept Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                autoFocus
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Web Workers, Raft Consensus, Cache Invalidation..."
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all font-mono"
              />
            </div>

            {/* Category and Connection Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-accent/60 transition-all font-mono cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#18181b] text-white">
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted mb-1.5 flex items-center gap-1">
                  <Network className="w-3 h-3 text-muted" /> Connect From
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-accent/60 transition-all font-mono cursor-pointer"
                >
                  <option value="" className="bg-[#18181b] text-white/50">
                    None (Standalone / Root)
                  </option>
                  {existingNodes.map((n) => (
                    <option key={n.id} value={n.id} className="bg-[#18181b] text-white">
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Relationship Label if connected */}
            {parentId && (
              <div>
                <label className="block text-xs font-mono text-muted mb-1.5">
                  Connection Label <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={edgeLabel}
                  onChange={(e) => setEdgeLabel(e.target.value)}
                  placeholder="e.g. spawns, depends on, delegates to, optimizes..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all font-mono"
                />
              </div>
            )}

            {/* Concept Summary */}
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">
                Summary & Architectural Role
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Explain what this concept does, why it exists, and how it interacts with other parts of the system..."
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-muted/40 focus:outline-none focus:border-accent/60 resize-none transition-all font-mono leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-mono text-muted mb-1.5">
                Tags <span className="text-zinc-500 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. async, performance, memory"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted/40 focus:outline-none focus:border-accent/60 transition-all font-mono"
              />
            </div>

            {/* Auto-layout Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="auto-layout-toggle"
                checked={autoLayout}
                onChange={(e) => setAutoLayout(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-accent focus:ring-accent/40 cursor-pointer"
              />
              <label
                htmlFor="auto-layout-toggle"
                className="text-xs font-mono text-muted select-none cursor-pointer"
              >
                Auto-rearrange canvas layout after adding
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-mono text-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!label.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-accent text-black hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all cursor-pointer font-sans"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Add Concept</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

