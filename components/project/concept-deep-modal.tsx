"use client";

import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Code2,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Plus,
  Globe,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { CATEGORY_ACCENT_BORDER, CATEGORY_LABELS, type Category } from "@/lib/constants";
import type { GroundedDeepDiveResult, GroundedSource } from "@/lib/ai";

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
  projectTitle?: string;
}

export function ConceptDeepModal({
  isOpen,
  onClose,
  node,
  onAddSubConcept,
  projectTitle,
}: ConceptDeepModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "code" | "sources">("overview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<GroundedDeepDiveResult | null>(null);
  const [cache, setCache] = useState<Record<string, GroundedDeepDiveResult>>({});

  const fetchDeepDive = useCallback(
    async (targetNode: NonNullable<ConceptDeepModalProps["node"]>, forceRefresh = false) => {
      if (!forceRefresh && cache[targetNode.id]) {
        setDeepDiveData(cache[targetNode.id]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/nodes/deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: targetNode.label,
            summary: targetNode.summary,
            category: targetNode.category,
            tags: targetNode.tags,
            projectTitle,
          }),
        });

        const json = await res.json();
        if (json.success && json.data) {
          setDeepDiveData(json.data);
          setCache((prev) => ({ ...prev, [targetNode.id]: json.data }));
        } else {
          setError(json.error || "Failed to retrieve deep dive analysis.");
        }
      } catch (err) {
        console.error("Failed to fetch grounded deep dive:", err);
        setError("Network error while communicating with AI service.");
      } finally {
        setIsLoading(false);
      }
    },
    [cache, projectTitle],
  );

  useEffect(() => {
    let ignore = false;
    if (isOpen && node) {
      const timer = setTimeout(() => {
        if (!ignore) {
          if (cache[node.id]) {
            setDeepDiveData(cache[node.id]);
          } else {
            setDeepDiveData(null);
          }
          setError(null);
          fetchDeepDive(node);
        }
      }, 0);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        if (!ignore) {
          setActiveTab("overview");
          setError(null);
        }
      }, 0);
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    }
  }, [isOpen, node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!node) return null;

  const accentColor =
    CATEGORY_ACCENT_BORDER[node.category as Category] ?? CATEGORY_ACCENT_BORDER.default;

  // Fallback heuristic values if AI data is not yet loaded
  const labelLower = node.label.toLowerCase();
  let defaultCode = `// ${node.label} Core Implementation\nexport function execute${node.label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  // 1. Initialize architectural context\n  const context = { timestamp: Date.now(), concept: "${node.label}" };\n  \n  // 2. Execute primary logic\n  console.log("Executing ${node.label} pipeline...", context);\n  return { success: true, processedAt: new Date().toISOString() };\n}`;
  let defaultGotcha = `Watch out: Developers often confuse ${node.label} with surrounding pipeline stages. Ensure proper error boundary handling.`;
  let defaultAnalogy = `Think of ${node.label} like an automated safety valve in a high-pressure hydraulic system — it regulates flow and prevents system halts.`;

  if (labelLower.includes("loop") || labelLower.includes("event") || labelLower.includes("async")) {
    defaultCode = `// Tracing Event Loop execution order\nconsole.log("1. Synchronous script start");\n\nsetTimeout(() => {\n  console.log("4. Macrotask executed (timer callback)");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("3. Microtask executed (Promise resolution)");\n});\n\nconsole.log("2. Synchronous script end");\n// Console: 1 -> 2 -> 3 -> 4`;
    defaultGotcha = "Microtasks drain continuously before the browser will paint or pick the next macrotask! Recursive microtasks starve UI rendering.";
    defaultAnalogy = "An airport runway where emergency flights (microtasks) take off before regularly scheduled flights (macrotasks).";
  } else if (labelLower.includes("stack") || labelLower.includes("call")) {
    defaultCode = `// Call stack trace observation\nfunction first() {\n  second();\n}\nfunction second() {\n  console.trace("Call Stack Snapshot");\n}\nfirst();`;
    defaultGotcha = "Deep recursion without tail-call optimization exhausts stack frames, throwing 'Maximum call stack size exceeded'.";
    defaultAnalogy = "A spring-loaded cafeteria tray dispenser — LIFO (Last In, First Out).";
  } else if (labelLower.includes("heap") || labelLower.includes("memory")) {
    defaultCode = `// Heap allocation and retention\nclass ResourceRegistry {\n  private entries = new Map();\n  register(id: string, payload: Uint8Array) {\n    this.entries.set(id, payload); // Retained in heap\n  }\n}`;
    defaultGotcha = "Unreleased event listeners and detached DOM nodes in closures block garbage collection.";
    defaultAnalogy = "A spacious open warehouse with addressable storage bays for dynamic variables.";
  }

  const activeCodeSnippet = deepDiveData?.codeSnippet || defaultCode;
  const activeGotcha = deepDiveData?.gotcha || defaultGotcha;
  const activeAnalogy = deepDiveData?.analogy || defaultAnalogy;
  const activeExplanation = deepDiveData?.explanation || node.summary;
  const sources: GroundedSource[] = deepDiveData?.sources || [];
  const searchQueries = deepDiveData?.searchQueries || [];
  const isGrounded = Boolean(deepDiveData?.isGrounded);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
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
                className="h-9 w-9 rounded-lg flex items-center justify-center border shrink-0"
                style={{
                  backgroundColor: `${accentColor}15`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Dialog.Title className="text-base font-bold text-white/95 tracking-tight">
                    {node.label}
                  </Dialog.Title>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted">
                    {CATEGORY_LABELS[node.category as Category] ?? node.category}
                  </span>
                  {isGrounded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <Sparkles className="w-2.5 h-2.5" />
                      Google Search Grounded
                    </span>
                  ) : deepDiveData?.isAIGenerated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      <Sparkles className="w-2.5 h-2.5" />
                      Gemini AI Generated
                    </span>
                  ) : null}
                </div>
                <p className="text-xs font-mono text-muted">
                  Deep Dive Architectural Breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDeepDive(node, true)}
                disabled={isLoading}
                title="Re-run research with Gemini"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-accent" : ""}`} />
                <span className="hidden sm:inline">Research</span>
              </button>

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
              onClick={() => setActiveTab("sources")}
              className={`pb-3 pt-3 text-xs font-medium font-mono transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "sources"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web Sources & Docs</span>
              {sources.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent border border-accent/30 font-mono">
                  {sources.length}
                </span>
              )}
            </button>
          </div>

          {/* Loading Indicator Banner */}
          {isLoading && (
            <div className="px-6 py-2.5 bg-accent/5 border-b border-accent/20 flex items-center gap-2.5 text-xs text-accent font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Querying Google Search & Gemini for real-world documentation & code...</span>
            </div>
          )}

          {/* Error Notice Banner */}
          {error && !isLoading && (
            <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300 font-mono">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{error} (showing offline fallback)</span>
              </div>
              <button
                onClick={() => fetchDeepDive(node, true)}
                className="underline hover:text-white cursor-pointer ml-2"
              >
                Retry
              </button>
            </div>
          )}

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                      Core Summary
                    </h4>
                    {isGrounded && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Live Researched
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">
                    {activeExplanation || "No summary specified for this concept."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent font-semibold">
                      <Lightbulb className="w-4 h-4" /> Intuitive Analogy
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {activeAnalogy}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                      <AlertTriangle className="w-4 h-4" /> Gotcha / Critical Pitfall
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      {activeGotcha}
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
                  {activeCodeSnippet}
                </pre>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="space-y-4">
                {searchQueries.length > 0 && (
                  <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                      Google Search Queries Executed
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {searchQueries.map((q, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300"
                        >
                          &ldquo;{q}&rdquo;
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold block">
                    Verified Documentation & Grounded References
                  </span>

                  {sources.length === 0 ? (
                    <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] text-center space-y-2">
                      <Globe className="w-8 h-8 text-muted mx-auto opacity-50" />
                      <p className="text-xs font-mono text-muted">
                        No external search citations retrieved yet.
                      </p>
                      <button
                        onClick={() => fetchDeepDive(node, true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                        <span>Search Web for Documentation</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {sources.map((src, i) => {
                        const domain = getDomainFromUrl(src.url);
                        return (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent/40 transition-all flex items-start justify-between gap-3 text-left"
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted group-hover:text-accent group-hover:border-accent/30 transition-colors">
                                  {domain}
                                </span>
                              </div>
                              <h5 className="text-xs font-medium text-white/90 group-hover:text-white truncate">
                                {src.title || src.url}
                              </h5>
                              <p className="text-[11px] font-mono text-muted truncate">
                                {src.url}
                              </p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-muted group-hover:text-accent shrink-0 mt-1 transition-colors" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
