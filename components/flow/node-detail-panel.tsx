"use client";

import {
  useEffect,
  useCallback,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ChangeEvent as ReactChangeEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";
import { X, ArrowRight, ArrowLeft, Pencil } from "lucide-react";
import { CATEGORIES, CATEGORY_ACCENT_BORDER, CATEGORY_LABELS, type Category } from "@/lib/constants";

interface ConnectedNode {
  id: string;
  label: string;
  edgeLabel: string;
  direction: "incoming" | "outgoing";
}

type NodePatch = Partial<{ label: string; summary: string; category: string; tags: string[] }>;

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
  onUpdateNode: (nodeId: string, patch: NodePatch) => void;
}

interface InlineEditorProps {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  displayClassName?: string;
  editClassName?: string;
}

function InlineEditor({
  value,
  onCommit,
  placeholder,
  multiline = false,
  displayClassName = "",
  editClassName = "",
}: InlineEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  const finish = () => {
    if (draft !== value) onCommit(draft);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    } else if (!multiline && e.key === "Enter") {
      e.preventDefault();
      finish();
    }
  };

  const handleChange = (e: ReactChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft(e.target.value);

  if (editing) {
    const common = {
      value: draft,
      onChange: handleChange,
      onBlur: finish,
      onKeyDown: handleKeyDown,
      onFocus: (e: ReactFocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.select(),
      spellCheck: false,
      placeholder,
      className: editClassName,
    };
    return multiline ? (
      <textarea rows={4} autoFocus {...common} />
    ) : (
      <input autoFocus {...common} />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title="Click to edit"
      className={`group/ed w-full text-left focus:outline-none ${displayClassName}`}
    >
      <span>{value || <span className="italic text-white/25">{placeholder ?? "Click to edit"}</span>}</span>
      <Pencil className="ml-1.5 inline-block h-3 w-3 -mt-px text-white/20 opacity-0 transition-opacity group-hover/ed:opacity-100" />
    </button>
  );
}

export function NodeDetailPanel({ node, connectedNodes, onClose, onNavigate, onUpdateNode }: NodeDetailPanelProps) {
  const [tagInput, setTagInput] = useState("");

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
  const selectCategory = CATEGORIES.includes(node.category as Category)
    ? (node.category as Category)
    : "default";

  const incoming = connectedNodes.filter((n) => n.direction === "incoming");
  const outgoing = connectedNodes.filter((n) => n.direction === "outgoing");

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (!node.tags.includes(tag)) onUpdateNode(node.id, { tags: [...node.tags, tag] });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onUpdateNode(node.id, { tags: node.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && tagInput === "" && node.tags.length > 0) {
      removeTag(node.tags[node.tags.length - 1]);
    }
  };

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
                  <select
                    value={selectCategory}
                    onChange={(e) => onUpdateNode(node.id, { category: e.target.value })}
                    className="bg-transparent text-[10px] font-mono uppercase tracking-wider text-white/40 outline-none cursor-pointer hover:text-white/60 focus:text-white/70 transition-colors"
                    title="Category"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#141418] text-white/80">
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <InlineEditor
                  value={node.label}
                  onCommit={(next) => onUpdateNode(node.id, { label: next })}
                  placeholder="Untitled"
                  displayClassName="text-base font-semibold leading-snug text-white/90"
                  editClassName="w-full bg-transparent text-base font-semibold leading-snug text-white/90 outline-none border-b border-white/20 placeholder:text-white/25"
                />
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
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-2">
              Summary
            </h3>
            <InlineEditor
              value={node.summary}
              onCommit={(next) => onUpdateNode(node.id, { summary: next })}
              placeholder="Add a summary…"
              multiline
              displayClassName="text-[13px] leading-relaxed text-white/60"
              editClassName="w-full resize-none bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white/70 leading-relaxed outline-none placeholder:text-white/25 focus:border-white/[0.14] focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 items-center">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono text-white/50 bg-white/[0.05] px-2 py-1 rounded-md border border-white/[0.08] flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-white/25 hover:text-white/80 transition-colors"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={node.tags.length === 0 ? "Add a tag…" : ""}
                spellCheck={false}
                className="w-24 bg-transparent text-[11px] font-mono text-white/60 outline-none placeholder:text-white/25"
              />
            </div>
          </div>

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
            Press Esc to close · Edits auto-save
          </p>
        </div>
      </div>
    </div>
  );
}