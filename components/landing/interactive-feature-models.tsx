"use client";

import { useState } from "react";
import {
  FileText,
  Globe,
  FileCode,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Code2,
  BookOpen,
  Terminal,
  Zap,
} from "lucide-react";

export function InteractiveFeatureModels() {
  // Model 1 State: Ingestion simulator
  const [activeSourceTab, setActiveSourceTab] = useState<"pdf" | "web" | "notes">("pdf");
  const [isExtracting, setIsExtracting] = useState(false);

  // Model 2 State: Deep Node Explorer
  const [activeDetailTab, setActiveDetailTab] = useState<"breakdown" | "code" | "tradeoffs">("breakdown");

  // Model 3 State: Template Preview
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  const handleSimulateExtract = (tab: "pdf" | "web" | "notes") => {
    setActiveSourceTab(tab);
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
    }, 450);
  };

  const sourcesData = {
    pdf: {
      name: "Raft_Consensus_Specification.pdf",
      size: "2.4 MB • 18 Pages",
      type: "Academic Whitepaper",
      entities: 14,
      edges: 19,
      tags: ["Distributed Systems", "Leader Election", "Log Replication"],
      previewSnippet:
        "Raft is a consensus algorithm designed as an alternative to Paxos. It is meant to be more understandable than Paxos by means of separation of logic...",
    },
    web: {
      name: "https://docs.anthropic.com/claude/api",
      size: "Live Web Crawler • 4 Sub-paths",
      type: "API Documentation",
      entities: 22,
      edges: 31,
      tags: ["REST", "Streaming", "Tool Calling", "Token Limits"],
      previewSnippet:
        "The Messages API accepts a list of input messages and returns a model-generated message. Supports streaming responses and dynamic client tool use...",
    },
    notes: {
      name: "Distributed_Caching_Strategies.md",
      size: "Markdown Notes • 380 Lines",
      type: "Raw Engineering Notes",
      entities: 11,
      edges: 15,
      tags: ["Cache Aside", "Write Through", "Eviction Policies"],
      previewSnippet:
        "Cache invalidation tradeoffs: Redis vs local in-memory LRU. Need to handle thundering herd and cache stampede with distributed mutexes...",
    },
  };

  const templates = [
    {
      title: "System Architecture",
      badge: "Engineering",
      icon: Cpu,
      description: "Extracts microservices, ingress gateways, event streams, and datastores into an architectural topology.",
      depth: "Deep Dive (28 Nodes)",
      categories: ["Ingress", "Services", "Datastores", "Security"],
    },
    {
      title: "Academic Paper Breakdown",
      badge: "Research",
      icon: BookOpen,
      description: "Deconstructs problem statements, theoretical foundations, novel benchmarks, and stated limitations.",
      depth: "Standard (16 Nodes)",
      categories: ["Hypothesis", "Methodology", "Results", "Critique"],
    },
    {
      title: "Codebase & API Topology",
      badge: "Developer",
      icon: Terminal,
      description: "Maps route handlers, database models, middleware chains, and third-party webhooks.",
      depth: "Standard (18 Nodes)",
      categories: ["Controllers", "Models", "Integrations", "Middleware"],
    },
  ];

  return (
    <section id="interactive-models" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white/70">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>Interactive Feature Models</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Under the Hood of <span className="text-accent font-mono">MindFlow</span>
        </h2>
        <p className="text-muted text-sm sm:text-base leading-relaxed">
          Experience the three core engines that turn chaotic documents into strictly structured, aesthetic mental models.
        </p>
      </div>

      {/* Grid of Interactive Models */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MODEL 1: Multimodal Ingestion Simulator */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e13]/90 backdrop-blur-xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Multimodal Ingestion Engine</h3>
                  <p className="text-xs font-mono text-muted">Raw Source → Entity Extraction</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Interactive Model 1
              </span>
            </div>

            {/* Source Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => handleSimulateExtract("pdf")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeSourceTab === "pdf"
                    ? "bg-white/15 text-white font-medium shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>PDF Spec</span>
              </button>
              <button
                onClick={() => handleSimulateExtract("web")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeSourceTab === "web"
                    ? "bg-white/15 text-white font-medium shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web URL</span>
              </button>
              <button
                onClick={() => handleSimulateExtract("notes")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeSourceTab === "notes"
                    ? "bg-white/15 text-white font-medium shadow-sm border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Markdown</span>
              </button>
            </div>

            {/* Source Preview Box */}
            <div className="p-3.5 rounded-lg bg-black/50 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-medium truncate max-w-[220px]">
                  {sourcesData[activeSourceTab].name}
                </span>
                <span className="text-muted text-[10px]">
                  {sourcesData[activeSourceTab].size}
                </span>
              </div>
              <p className="text-[11px] text-white/50 font-mono line-clamp-2 leading-relaxed italic">
                &ldquo;{sourcesData[activeSourceTab].previewSnippet}&rdquo;
              </p>
            </div>

            {/* Simulated Extraction Results */}
            <div className={`transition-all duration-300 ${isExtracting ? "opacity-30 blur-xs" : "opacity-100"}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted uppercase">Extracted Nodes</span>
                  <p className="text-lg font-mono font-semibold text-accent">
                    {sourcesData[activeSourceTab].entities}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted uppercase">Discovered Edges</span>
                  <p className="text-lg font-mono font-semibold text-emerald-400">
                    {sourcesData[activeSourceTab].edges}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted uppercase">Schema Type</span>
                  <p className="text-xs font-mono font-medium text-white truncate mt-1">
                    {sourcesData[activeSourceTab].type}
                  </p>
                </div>
              </div>

              {/* Tags generated */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sourcesData[activeSourceTab].tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent/90 border border-accent/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Automated entity disambiguation
            </span>
            <span className="text-accent cursor-pointer hover:underline" onClick={() => handleSimulateExtract(activeSourceTab)}>
              Re-scan source →
            </span>
          </div>
        </div>

        {/* MODEL 2: Deep Node Inspector & AI Exploder */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e13]/90 backdrop-blur-xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Deep Concept Breakdown</h3>
                  <p className="text-xs font-mono text-muted">Granular Node Inspection & Code Synthesis</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Interactive Model 2
              </span>
            </div>

            {/* Mock Node Header Card */}
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <div>
                  <h4 className="text-xs font-semibold text-white font-mono">Consensus State Machine</h4>
                  <p className="text-[10px] text-muted font-mono">Category: Concurrency · Depth Level 2</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Active Inspect
              </span>
            </div>

            {/* Inspector Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => setActiveDetailTab("breakdown")}
                className={`py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeDetailTab === "breakdown"
                    ? "bg-white/15 text-white font-medium border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Breakdown
              </button>
              <button
                onClick={() => setActiveDetailTab("code")}
                className={`py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeDetailTab === "code"
                    ? "bg-white/15 text-white font-medium border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Code / Schema
              </button>
              <button
                onClick={() => setActiveDetailTab("tradeoffs")}
                className={`py-1.5 px-2 rounded-md text-xs font-mono transition-all ${
                  activeDetailTab === "tradeoffs"
                    ? "bg-white/15 text-white font-medium border border-white/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Tradeoffs
              </button>
            </div>

            {/* Detail Tab Content */}
            <div className="min-h-[140px] p-3.5 rounded-lg bg-black/60 border border-white/[0.06] text-xs font-mono">
              {activeDetailTab === "breakdown" && (
                <div className="space-y-2 text-white/80 leading-relaxed">
                  <p className="text-white/90">
                    The deterministic state machine applies log entries in sequential order once quorum agreement is reached.
                  </p>
                  <ul className="space-y-1 text-[11px] text-muted">
                    <li>• Commit index strictly increases monotonically.</li>
                    <li>• Rollbacks are mathematically impossible post majority ack.</li>
                    <li>• Snapshots compacted via fuzzy copy on background thread.</li>
                  </ul>
                </div>
              )}

              {activeDetailTab === "code" && (
                <pre className="text-[11px] text-emerald-400 overflow-x-auto leading-relaxed font-mono">
{`interface StateMachine<TState, TCommand> {
  apply(command: TCommand, index: number): TState;
  createSnapshot(): Uint8Array;
  restoreSnapshot(snapshot: Uint8Array): void;
}`}
                </pre>
              )}

              {activeDetailTab === "tradeoffs" && (
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex items-start gap-1.5 text-amber-300/90">
                    <span className="font-bold">Latency:</span>
                    <span>Requires 1.5 round trips for commit confirmation under normal network conditions.</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-emerald-300/90">
                    <span className="font-bold">Safety:</span>
                    <span>Zero split-brain probability given 2f + 1 node quorum threshold.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Real-time deep concept expansion
            </span>
            <span className="text-accent">Click tabs to preview →</span>
          </div>
        </div>
      </div>

      {/* MODEL 3: Interactive Extraction Templates */}
      <div id="templates" className="rounded-2xl border border-white/10 bg-[#0e0e13]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono mb-2">
              Interactive Model 3
            </div>
            <h3 className="text-xl font-semibold text-white">Pre-Configured Synthesis Templates</h3>
            <p className="text-xs sm:text-sm font-mono text-muted mt-1">
              Select an extraction schema to configure how MindFlow structures your visual graphs.
            </p>
          </div>
        </div>

        {/* Template Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isSelected = selectedTemplate === idx;
            return (
              <div
                key={tpl.title}
                onClick={() => setSelectedTemplate(idx)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-white/[0.08] border-accent/50 shadow-lg shadow-accent/10"
                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-white/20"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-accent text-black" : "bg-white/10 text-white"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-white/60 border border-white/10">
                      {tpl.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{tpl.title}</h4>
                  <p className="text-xs text-white/60 leading-relaxed">{tpl.description}</p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-muted">Target Depth:</span>
                    <span className="text-accent font-medium">{tpl.depth}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tpl.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.05]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
