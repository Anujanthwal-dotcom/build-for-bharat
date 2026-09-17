"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Code2, BookOpen, Film, AlertTriangle, Lightbulb, Copy, Check, Sparkles, Plus } from "lucide-react";
import { CATEGORY_ACCENT_BORDER, CATEGORY_LABELS, type Category } from "@/lib/constants";
import type { ScriptLanguage } from "@/lib/creator-script";

interface ConceptDeepModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: {
    id: string;
    label: string;
    summary: string;
    category: string;
    tags: string[];
  } | null;
  onAddSubConcept?: (parentId: string) => void;
  language?: ScriptLanguage;
}

export function ConceptDeepModal({
  isOpen,
  onClose,
  node,
  onAddSubConcept,
  language = "english",
}: ConceptDeepModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "script">("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  if (!node) return null;

  const accentColor =
    CATEGORY_ACCENT_BORDER[node.category as Category] ?? CATEGORY_ACCENT_BORDER.default;

  // Contextual code snippet and deep notes
  const labelLower = node.label.toLowerCase();
  let codeSnippet = `// ${node.label} Core Implementation\nexport function execute${node.label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  // 1. Initialize architectural context\n  const context = { timestamp: Date.now(), concept: "${node.label}" };\n  \n  // 2. Execute primary logic\n  console.log("Executing ${node.label} pipeline...", context);\n  return { success: true, processedAt: new Date().toISOString() };\n}`;
  let gotcha = `Watch out: Developers often confuse ${node.label} with surrounding pipeline stages. Ensure proper error boundary handling.`;
  let analogy = `Think of ${node.label} like an automated safety valve in a high-pressure hydraulic system — it regulates flow and prevents system halts.`;

  if (labelLower.includes("loop") || labelLower.includes("event") || labelLower.includes("async")) {
    codeSnippet = `// Tracing Event Loop execution order\nconsole.log("1. Synchronous script start");\n\nsetTimeout(() => {\n  console.log("4. Macrotask executed (timer callback)");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("3. Microtask executed (Promise resolution)");\n});\n\nconsole.log("2. Synchronous script end");\n// Console: 1 -> 2 -> 3 -> 4`;
    gotcha = "Microtasks drain continuously before the browser will paint or pick the next macrotask! Recursive microtasks starve UI rendering.";
    analogy = "An airport runway where emergency flights (microtasks) take off before regularly scheduled flights (macrotasks).";
  } else if (labelLower.includes("stack") || labelLower.includes("call")) {
    codeSnippet = `// Call stack trace observation\nfunction first() {\n  second();\n}\nfunction second() {\n  console.trace("Call Stack Snapshot");\n}\nfirst();`;
    gotcha = "Deep recursion without tail-call optimization exhausts stack frames, throwing 'Maximum call stack size exceeded'.";
    analogy = "A spring-loaded cafeteria tray dispenser — LIFO (Last In, First Out).";
  } else if (labelLower.includes("heap") || labelLower.includes("memory")) {
    codeSnippet = `// Heap allocation and retention\nclass ResourceRegistry {\n  private entries = new Map();\n  register(id: string, payload: Uint8Array) {\n    this.entries.set(id, payload); // Retained in heap\n  }\n}`;
    gotcha = "Unreleased event listeners and detached DOM nodes in closures block garbage collection.";
    analogy = "A spacious open warehouse with addressable storage bays for dynamic variables.";
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl max-h-[85vh] bg-[#121214] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] rounded-2xl z-50 overflow-hidden flex flex-col data-[state=open]:animate-fade-in-up font-sans">
          {/* Accent line */}
          <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Dialog.Title className="text-base font-bold text-white/95 tracking-tight">
                    {node.label}
                  </Dialog.Title>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted">
                    {CATEGORY_LABELS[node.category as Category] ?? node.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-muted">
                  Deep Dive Architectural Breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onAddSubConcept && (
                <button
                  onClick={() => {
                    onClose();
                    onAddSubConcept(node.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" />
                  <span>+ Sub-Concept</span>
                </button>
              )}
              <Dialog.Close asChild>
                <button className="text-muted hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/5 px-6 gap-6 bg-white/[0.01]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 pt-3 text-xs font-medium font-mono transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "overview"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" /> Architectural Overview
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`pb-3 pt-3 text-xs font-medium font-mono transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "code"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Code & Execution
            </button>
            <button
              onClick={() => setActiveTab("script")}
              className={`pb-3 pt-3 text-xs font-medium font-mono transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "script"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" /> Creator Script Delivery
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-1.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                    Core Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-white/90">
                    {node.summary || "No summary specified for this concept."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                      <Lightbulb className="w-4 h-4" /> Intuitive Analogy
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {analogy}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                      <AlertTriangle className="w-4 h-4" /> Gotcha / Critical Pitfall
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {gotcha}
                    </p>
                  </div>
                </div>

                {node.tags && node.tags.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-2">
                      Associated Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {node.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-white/80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted">
                    Technical Implementation Example
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-muted" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed scrollbar-thin">
                  {codeSnippet}
                </pre>
              </div>
            )}

            {activeTab === "script" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-accent font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Spoken Presentation Delivery
                    </span>
                    <span className="text-[11px] font-mono text-muted uppercase">
                      Language: {language}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-200 italic font-sans bg-black/30 p-3.5 rounded-lg border border-white/5">
                    &ldquo;In this segment, let&apos;s look closely at {node.label}. Under the hood, {node.summary}. Notice how this connects directly with the surrounding nodes on our canvas!&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

