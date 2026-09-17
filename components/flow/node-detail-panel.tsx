"use client";

import {
  useEffect,
  useCallback,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ChangeEvent as ReactChangeEvent,
  type FocusEvent as ReactFocusEvent,
} from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Pencil,
  Plus,
  Maximize2,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Link2,
  Unlink,
} from "lucide-react";
import { CATEGORIES, CATEGORY_ACCENT_BORDER, CATEGORY_LABELS, type Category } from "@/lib/constants";

export interface ConnectedNode {
  edgeId: string;
  id: string;
  label: string;
  edgeLabel: string;
  direction: "incoming" | "outgoing";
}

type NodePatch = Partial<{ label: string; summary: string; category: string; tags: string[] }>;

export interface NodeDetailPanelProps {
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
  onAddSubConcept?: (parentId: string) => void;
  onOpenDeepModal?: (nodeId: string) => void;
  onConnectNodes?: (sourceId: string, targetId: string, label?: string) => void;
  onDeleteEdge?: (edgeId: string) => void;
  allNodes?: Array<{ id: string; label: string }>;
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
      className={`group/ed w-full text-left focus:outline-none cursor-pointer ${displayClassName}`}
    >
      <span>{value || <span className="italic text-white/25">{placeholder ?? "Click to edit"}</span>}</span>
      <Pencil className="ml-1.5 inline-block h-3 w-3 -mt-px text-white/20 opacity-0 transition-opacity group-hover/ed:opacity-100" />
    </button>
  );
}

export function NodeDetailPanel({
  node,
  connectedNodes,
  onClose,
  onNavigate,
  onUpdateNode,
  onAddSubConcept,
  onOpenDeepModal,
  onConnectNodes,
  onDeleteEdge,
  allNodes,
}: NodeDetailPanelProps) {
  const [tagInput, setTagInput] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [targetNodeToConnect, setTargetNodeToConnect] = useState("");
  const [connectLabel, setConnectLabel] = useState("");

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

  const availableTargets = (allNodes ?? []).filter(
    (n) => n.id !== node.id && !connectedNodes.some((cn) => cn.id === n.id)
  );

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

  // Contextual code snippet & explanation
  const labelLower = node.label.toLowerCase();
  let codeSnippet = `// ${node.label} execution sample\nfunction execute${node.label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  console.log("Executing ${node.label}...");\n  return { concept: "${node.label}", active: true };\n}`;
  let analogy = `Think of ${node.label} like an automated safety valve in a high-pressure hydraulic system.`;
  let gotcha = `Watch out: Developers often confuse ${node.label} with surrounding pipeline stages.`;

  if (labelLower.includes("loop") || labelLower.includes("event") || labelLower.includes("async")) {
    codeSnippet = `console.log("1");\nsetTimeout(() => console.log("2 (Macro)"), 0);\nPromise.resolve().then(() => console.log("3 (Micro)"));\nconsole.log("4");\n// 1 -> 4 -> 3 -> 2`;
    analogy = "Airport runway where priority medical flights (microtasks) take off before scheduled flights (macrotasks).";
    gotcha = "Promises drain completely before the browser repaints or schedules timers!";
  } else if (labelLower.includes("stack") || labelLower.includes("call")) {
    codeSnippet = `function baz() { console.trace(); }\nfunction bar() { baz(); }\nfunction foo() { bar(); }\nfoo();`;
    analogy = "A spring-loaded cafeteria tray dispenser — LIFO (Last In, First Out).";
    gotcha = "Un-terminated recursion causes 'Maximum call stack size exceeded'.";
  } else if (labelLower.includes("heap") || labelLower.includes("memory")) {
    codeSnippet = `const cache = new Map();\nfunction keepAlive(k, v) {\n  cache.set(k, v); // Retained in heap memory\n}`;
    analogy = "An open warehouse with numbered storage shelves for large dynamic objects.";
    gotcha = "Detached DOM trees and uncleared intervals leak heap memory.";
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="absolute right-0 top-0 h-full z-50 flex animate-slide-in-right font-sans">
      {/* Panel */}
      <div className="w-[380px] max-w-[95vw] h-full bg-[#0d0d11]/95 backdrop-blur-xl border-l border-white/[0.08] flex flex-col overflow-hidden shadow-2xl">
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
                    className="bg-transparent text-[10px] font-mono uppercase tracking-wider text-muted outline-none cursor-pointer hover:text-white/80 focus:text-white transition-colors"
                    title="Category"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#141418] text-white/90">
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

              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                {onOpenDeepModal && (
                  <button
                    onClick={() => onOpenDeepModal(node.id)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                    title="Expand into full study window"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                  title="Close panel (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            {onAddSubConcept && (
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => onAddSubConcept(node.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer w-full justify-center"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" />
                  <span>+ Add Sub-Concept</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
          {/* Summary / Architectural Role */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
              Architectural Summary
            </h3>
            <InlineEditor
              value={node.summary}
              onCommit={(next) => onUpdateNode(node.id, { summary: next })}
              placeholder="Add a detailed summary of how this concept works…"
              multiline
              displayClassName="text-xs leading-relaxed text-zinc-300"
              editClassName="w-full resize-none bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white leading-relaxed outline-none placeholder:text-white/25 focus:border-accent/40 focus:bg-white/[0.05] transition-colors"
            />
          </div>

          {/* Intuitive Analogy Box */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
              <Lightbulb className="w-3.5 h-3.5" /> Conceptual Analogy
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              {analogy}
            </p>
          </div>

          {/* Common Pitfall & Gotcha Box */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> Common Pitfall / Gotcha
            </div>
            <p className="text-xs leading-relaxed text-zinc-300">
              {gotcha}
            </p>
          </div>

          {/* Interactive Code Example */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1">
                <Code2 className="w-3 h-3" /> Technical Code Pattern
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-black/50 border border-white/5 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed scrollbar-thin">
              {codeSnippet}
            </pre>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5 items-center">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono text-white/70 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.08] flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-muted hover:text-white transition-colors cursor-pointer"
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
                placeholder={node.tags.length === 0 ? "Add tag (press Enter)..." : "+ tag"}
                spellCheck={false}
                className="w-24 bg-transparent text-[11px] font-mono text-white/60 outline-none placeholder:text-muted/40"
              />
            </div>
          </div>

          {/* Connections (Incoming / Outgoing & Linker) */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted">
                Graph Connections ({connectedNodes.length})
              </h3>
            </div>

            {connectedNodes.length === 0 && (
              <p className="text-xs text-white/40 italic mb-3 font-mono">
                No active connections. Link this concept below:
              </p>
            )}

            {/* Outgoing */}
            {outgoing.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-mono text-muted mb-1.5 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-accent" /> Outgoing Dependencies
                </p>
                <div className="space-y-1.5">
                  {outgoing.map((conn) => (
                    <div
                      key={conn.edgeId}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate(conn.id)}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <span className="text-xs text-white/80 group-hover:text-white transition-colors truncate block">
                          {conn.label}
                        </span>
                        {conn.edgeLabel && (
                          <span className="text-[10px] font-mono text-muted">
                            {conn.edgeLabel}
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {onDeleteEdge && (
                          <button
                            type="button"
                            onClick={() => onDeleteEdge(conn.edgeId)}
                            className="p-1 rounded hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors cursor-pointer"
                            title="Disconnect connection"
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate(conn.id)}
                          className="p-1 text-muted group-hover:text-white transition-colors cursor-pointer"
                          title="View node"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incoming */}
            {incoming.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-mono text-muted mb-1.5 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 text-white/60" /> Incoming Prerequisites
                </p>
                <div className="space-y-1.5">
                  {incoming.map((conn) => (
                    <div
                      key={conn.edgeId}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate(conn.id)}
                        className="flex-1 min-w-0 text-left cursor-pointer flex items-center gap-2"
                      >
                        <ArrowLeft className="w-3 h-3 text-muted group-hover:text-white transition-colors shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs text-white/80 group-hover:text-white transition-colors truncate block">
                            {conn.label}
                          </span>
                          {conn.edgeLabel && (
                            <span className="text-[10px] font-mono text-muted">
                              {conn.edgeLabel}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {onDeleteEdge && (
                          <button
                            type="button"
                            onClick={() => onDeleteEdge(conn.edgeId)}
                            className="p-1 rounded hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors cursor-pointer"
                            title="Disconnect connection"
                          >
                            <Unlink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Link to Concept Form */}
            {onConnectNodes && availableTargets.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-accent" /> Link with another concept
                </p>
                <div className="space-y-2">
                  <select
                    value={targetNodeToConnect}
                    onChange={(e) => setTargetNodeToConnect(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-accent/60 cursor-pointer"
                  >
                    <option value="" className="bg-[#18181b] text-white/50">
                      Select concept to link...
                    </option>
                    {availableTargets.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#18181b] text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={connectLabel}
                      onChange={(e) => setConnectLabel(e.target.value)}
                      placeholder="Relationship (e.g. depends on)"
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 font-mono outline-none focus:border-accent/60"
                    />
                    <button
                      type="button"
                      disabled={!targetNodeToConnect}
                      onClick={() => {
                        if (!targetNodeToConnect) return;
                        onConnectNodes(node.id, targetNodeToConnect, connectLabel.trim());
                        setTargetNodeToConnect("");
                        setConnectLabel("");
                      }}
                      className="px-3 py-1.5 bg-accent/20 hover:bg-accent text-accent hover:text-black border border-accent/40 rounded-lg text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Link</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-[10px] font-mono text-muted">
            Press Esc to close
          </p>
          <span className="text-[10px] font-mono text-emerald-400/80">
            Edits auto-save
          </span>
        </div>
      </div>
    </div>
  );
}