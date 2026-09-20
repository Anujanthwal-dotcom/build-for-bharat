"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Sparkles,
  Plus,
  RotateCcw,
  LayoutTemplate,
  Check,
  X,
  Maximize2,
  Trash2,
} from "lucide-react";

import CustomNode from "@/components/flow/custom-node";
import CustomEdge from "@/components/flow/custom-edge";
import { calculateDagreLayout } from "@/lib/layout";
import { CATEGORY_ACCENT_BORDER } from "@/lib/constants";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

interface PresetNode {
  id: string;
  label: string;
  summary: string;
  category: "core" | "execution" | "memory" | "concurrency" | "default";
  tags: string[];
  takeaways: string[];
  x: number;
  y: number;
}

interface PresetData {
  name: string;
  description: string;
  nodes: PresetNode[];
  edges: { id: string; source: string; target: string; label: string }[];
}

const PRESETS: Record<string, PresetData> = {
  system: {
    name: "System Architecture",
    description: "Cloud-native microservices ingress, gateway, broker & database topology.",
    nodes: [
      {
        id: "sys-ingress",
        label: "Client & Edge Ingress",
        summary: "Anycast DNS routing, Cloudflare CDN, global SSL termination & DDoS mitigation.",
        category: "core",
        tags: ["CDN", "WAF", "Anycast"],
        takeaways: [
          "Terminates TLS in sub-50ms at edge points of presence.",
          "Caches static assets and enforces web application firewall rate-limits.",
        ],
        x: 40,
        y: 120,
      },
      {
        id: "sys-gateway",
        label: "API Gateway & Router",
        summary: "Envoy-powered ingress gateway routing traffic to downstream services.",
        category: "execution",
        tags: ["Envoy", "Routing", "JWT"],
        takeaways: [
          "Performs authentication token verification and client rate limiting.",
          "Dynamic service discovery with automated circuit breakers.",
        ],
        x: 360,
        y: 120,
      },
      {
        id: "sys-auth",
        label: "Auth & Session Store",
        summary: "OAuth2 / OIDC token validator backed by low-latency Redis cluster.",
        category: "memory",
        tags: ["OAuth2", "Redis", "JWT"],
        takeaways: [
          "Sub-millisecond token lookup and revocation checks.",
          "Distributes session state across multiple availability zones.",
        ],
        x: 680,
        y: 30,
      },
      {
        id: "sys-broker",
        label: "Event Streaming (Kafka)",
        summary: "Partitioned durable event log enabling async event-driven choreography.",
        category: "concurrency",
        tags: ["Kafka", "PubSub", "Streaming"],
        takeaways: [
          "Guaranteed ordered delivery across multiple partitioned consumer groups.",
          "Decouples write-heavy mutations from slow background processes.",
        ],
        x: 680,
        y: 220,
      },
      {
        id: "sys-db",
        label: "Postgres & pgvector",
        summary: "Primary ACID relational store augmented with HNSW vector indices.",
        category: "memory",
        tags: ["PostgreSQL", "pgvector", "ACID"],
        takeaways: [
          "Strong transactional consistency for accounts and projects.",
          "Cosine similarity vector indexing for semantic similarity lookups.",
        ],
        x: 1000,
        y: 220,
      },
    ],
    edges: [
      { id: "e1", source: "sys-ingress", target: "sys-gateway", label: "HTTPS / HTTP3" },
      { id: "e2", source: "sys-gateway", target: "sys-auth", label: "Verify JWT" },
      { id: "e3", source: "sys-gateway", target: "sys-broker", label: "Async Event" },
      { id: "e4", source: "sys-broker", target: "sys-db", label: "Materialize" },
    ],
  },
  ai: {
    name: "AI Agent Architecture",
    description: "Multi-step reasoning pipeline with dynamic planning and tool sandboxes.",
    nodes: [
      {
        id: "ai-goal",
        label: "User Objective / Intent",
        summary: "Multimodal user instruction transformed into structured goal specifications.",
        category: "core",
        tags: ["Prompt", "Intent", "Constraints"],
        takeaways: [
          "Normalizes ambiguous user input into unambiguous execution goals.",
          "Extracts explicit security parameters and output constraints.",
        ],
        x: 40,
        y: 120,
      },
      {
        id: "ai-planner",
        label: "Dynamic Task Planner",
        summary: "Decomposes complex tasks into an iterative dependency execution DAG.",
        category: "execution",
        tags: ["ReAct", "Chain-of-Thought", "DAG"],
        takeaways: [
          "Builds step-by-step reasoning plan before executing side-effects.",
          "Monitors tool outputs and refines subsequent steps dynamically.",
        ],
        x: 360,
        y: 120,
      },
      {
        id: "ai-memory",
        label: "Semantic Vector Memory",
        summary: "Long-term episodic and factual context retrieval engine.",
        category: "memory",
        tags: ["RAG", "Embeddings", "Context"],
        takeaways: [
          "Retrieves relevant previous knowledge via cosine similarity search.",
          "Maintains short-term conversation trajectory in active context window.",
        ],
        x: 680,
        y: 30,
      },
      {
        id: "ai-tools",
        label: "Tool Execution Sandbox",
        summary: "Isolated execution environment running code, web searches, and file edits.",
        category: "concurrency",
        tags: ["Sandbox", "CLI", "Interpreter"],
        takeaways: [
          "Executes shell commands and Python code in sandboxed security boundaries.",
          "Parses stdout, stderr, and exit codes back to the planner loop.",
        ],
        x: 680,
        y: 220,
      },
      {
        id: "ai-synth",
        label: "Response Synthesizer",
        summary: "Validates all artifacts against user goals and streams formatted output.",
        category: "default",
        tags: ["Markdown", "Format", "Verification"],
        takeaways: [
          "Conducts final safety & accuracy evaluation before delivering output.",
          "Generates clean Markdown, diffs, and interactive artifacts.",
        ],
        x: 1000,
        y: 120,
      },
    ],
    edges: [
      { id: "ea1", source: "ai-goal", target: "ai-planner", label: "Decompose" },
      { id: "ea2", source: "ai-planner", target: "ai-memory", label: "Query Context" },
      { id: "ea3", source: "ai-planner", target: "ai-tools", label: "Run Action" },
      { id: "ea4", source: "ai-tools", target: "ai-planner", label: "Observation" },
      { id: "ea5", source: "ai-planner", target: "ai-synth", label: "Deliver" },
    ],
  },
  nextjs: {
    name: "Next.js 15 Fullstack",
    description: "Modern App Router architecture with Server Components and Streaming.",
    nodes: [
      {
        id: "nx-edge",
        label: "Edge Middleware",
        summary: "Sub-5ms global request interception, session decoding & rewrites.",
        category: "core",
        tags: ["Edge", "Routing", "V8"],
        takeaways: [
          "Runs on lightweight V8 isolate without cold starts.",
          "Validates auth cookies before any server render is triggered.",
        ],
        x: 40,
        y: 120,
      },
      {
        id: "nx-rsc",
        label: "React Server Components",
        summary: "Zero-bundle-size server execution streaming HTML directly to client.",
        category: "execution",
        tags: ["RSC", "Streaming", "Zero-JS"],
        takeaways: [
          "Direct secure access to databases and backend APIs.",
          "Renders instant partial HTML without shipping component JS to browser.",
        ],
        x: 360,
        y: 120,
      },
      {
        id: "nx-client",
        label: "Interactive Client Island",
        summary: "Rich graph canvas and interactive controls hydrated on the client.",
        category: "memory",
        tags: ["React 19", "XYFlow", "State"],
        takeaways: [
          "Hydrates interactive canvas gestures, pan, zoom, and node dragging.",
          "Maintains snappy client-side state transitions.",
        ],
        x: 680,
        y: 30,
      },
      {
        id: "nx-actions",
        label: "Server Actions (RPC)",
        summary: "Type-safe asynchronous server mutations triggered directly from UI.",
        category: "concurrency",
        tags: ["Actions", "Mutations", "POST"],
        takeaways: [
          "Seamless end-to-end TypeScript types from form to server.",
          "Executes background revalidation of relevant cache tags.",
        ],
        x: 680,
        y: 220,
      },
    ],
    edges: [
      { id: "en1", source: "nx-edge", target: "nx-rsc", label: "Pass Request" },
      { id: "en2", source: "nx-rsc", target: "nx-client", label: "Hydrate UI" },
      { id: "en3", source: "nx-client", target: "nx-actions", label: "Mutate State" },
      { id: "en4", source: "nx-actions", target: "nx-rsc", label: "Revalidate" },
    ],
  },
};

function PlaygroundContent() {
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>("system");
  const [inspectNodeId, setInspectNodeId] = useState<string | null>("sys-gateway");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const reactFlowInstance = useReactFlow();

  // Create initial nodes
  const buildInitialNodes = useCallback((presetKey: string): Node[] => {
    const preset = PRESETS[presetKey];
    return preset.nodes.map((n) => ({
      id: n.id,
      type: "custom",
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        summary: n.summary,
        category: n.category,
        tags: n.tags,
        takeaways: n.takeaways,
      },
    }));
  }, []);

  const buildInitialEdges = useCallback((presetKey: string): Edge[] => {
    const preset = PRESETS[presetKey];
    return preset.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: "custom",
      sourceHandle: "s-0",
      targetHandle: "t-0",
      data: { label: e.label },
    }));
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(buildInitialNodes("system"));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(buildInitialEdges("system"));

  // Switch preset
  const handleSelectPreset = (key: string) => {
    setSelectedPresetKey(key);
    const newNodes = buildInitialNodes(key);
    const newEdges = buildInitialEdges(key);
    setNodes(newNodes);
    setEdges(newEdges);
    setInspectNodeId(newNodes[0]?.id || null);
    setStatusMessage(`Loaded "${PRESETS[key].name}" preset`);
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.25, duration: 400 });
    }, 50);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Node connection
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            sourceHandle: "s-0",
            targetHandle: "t-0",
            data: { label: "Linked" },
          },
          eds,
        ),
      );
      setStatusMessage("Nodes connected!");
      setTimeout(() => setStatusMessage(null), 2000);
    },
    [setEdges],
  );

  // Add a subcard to a specific node
  const handleAddSubcardDirect = useCallback(
    (parentId: string) => {
      setNodes((currentNodes) => {
        const parent = currentNodes.find((n) => n.id === parentId);
        if (!parent) return currentNodes;

        const parentData = parent.data as Record<string, unknown>;
        const childCount = edges.filter((e) => e.source === parentId).length;
        const newId = `sub_${Date.now().toString().slice(-4)}`;

        const category = (parentData.category as "core" | "execution" | "memory" | "concurrency" | "default") || "default";

        const newNode: Node = {
          id: newId,
          type: "custom",
          position: {
            x: parent.position.x + 320,
            y: parent.position.y + childCount * 140 - 30,
          },
          data: {
            label: `Subcard: ${parentData.label}`,
            summary: `Automated concept breakdown linked to ${parentData.label}.`,
            category,
            tags: ["Detail", "Subtopic"],
            takeaways: [
              `Direct dependency of ${parentData.label}.`,
              "Explore fine-grained operational metrics and nuances.",
            ],
          },
        };

        const newEdge: Edge = {
          id: `e-${parentId}->${newId}`,
          source: parentId,
          target: newId,
          type: "custom",
          sourceHandle: "s-0",
          targetHandle: "t-0",
          data: { label: "Sub-branch" },
        };

        setEdges((eds) => [...eds, newEdge]);
        setInspectNodeId(newId);
        setStatusMessage(`Added subcard to "${parentData.label}"`);
        setTimeout(() => setStatusMessage(null), 2500);

        return [...currentNodes, newNode];
      });
    },
    [edges, setEdges, setNodes],
  );

  // Add standalone new node
  const handleAddNewNode = () => {
    const newId = `node_${Date.now().toString().slice(-4)}`;
    const categories = ["core", "execution", "memory", "concurrency"] as const;
    const cat = categories[Math.floor(Math.random() * categories.length)];

    const lastNode = nodes[nodes.length - 1];
    const posX = lastNode ? lastNode.position.x + 100 : 200;
    const posY = lastNode ? (lastNode.position.y + 120) % 400 : 200;

    const newNode: Node = {
      id: newId,
      type: "custom",
      position: { x: posX, y: posY },
      data: {
        label: `Custom Concept ${nodes.length + 1}`,
        summary: "A user-defined concept node created inside the interactive playground.",
        category: cat,
        tags: ["Custom", "Interactive"],
        takeaways: [
          "Interactive nodes can be linked to any other concept.",
          "Inspect, drag, or re-layout at will.",
        ],
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setInspectNodeId(newId);
    setStatusMessage("Created new concept node!");
    setTimeout(() => setStatusMessage(null), 2000);
  };

  // Inject callbacks into nodes for the viewport
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === inspectNodeId,
      data: {
        ...node.data,
        onInspect: (id: string) => setInspectNodeId(id),
        onAddSubcard: (id: string) => handleAddSubcardDirect(id),
      },
    }));
  }, [nodes, inspectNodeId, handleAddSubcardDirect]);

  // Run Dagre auto layout
  const handleAutoLayout = useCallback(() => {
    const mindmapNodes = nodes.map((n) => ({
      id: n.id,
      label: ((n.data as Record<string, unknown>).label as string) ?? "",
      summary: ((n.data as Record<string, unknown>).summary as string) ?? "",
      category: ((n.data as Record<string, unknown>).category as string) ?? "",
      x: n.position.x,
      y: n.position.y,
    }));

    const mindmapEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
    }));

    const { nodes: laidOut } = calculateDagreLayout(mindmapNodes, mindmapEdges, "LR");

    setNodes(
      nodes.map((n) => {
        const laid = laidOut.find((l) => l.id === n.id);
        return laid ? { ...n, position: { x: laid.x, y: laid.y } } : n;
      }),
    );

    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
    }, 50);

    setStatusMessage("Graph re-arranged with Dagre layout!");
    setTimeout(() => setStatusMessage(null), 2000);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  // Reset current preset
  const handleReset = () => {
    handleSelectPreset(selectedPresetKey);
  };

  // Inspect node object
  const inspectedNode = useMemo(() => {
    return nodes.find((n) => n.id === inspectNodeId);
  }, [nodes, inspectNodeId]);

  const inspectedData = (inspectedNode?.data ?? {}) as Record<string, unknown>;
  const inspectedCategory = (inspectedData.category as string) ?? "default";
  const accentColor =
    CATEGORY_ACCENT_BORDER[inspectedCategory as keyof typeof CATEGORY_ACCENT_BORDER] ??
    CATEGORY_ACCENT_BORDER.default;

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0d0d12]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b border-white/[0.08] px-4 py-3 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Presets Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider hidden sm:inline">
            Domain:
          </span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/[0.06]">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                  selectedPresetKey === key
                    ? "bg-accent text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Action: Add Concept */}
          <button
            onClick={handleAddNewNode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-all"
            title="Add a new node to canvas"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Add Node</span>
          </button>

          {/* Action: Auto Layout */}
          <button
            onClick={handleAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-all"
            title="Cleanly arrange nodes horizontally"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Auto-Layout</span>
          </button>

          {/* Action: Fit View */}
          <button
            onClick={() => reactFlowInstance.fitView({ padding: 0.25, duration: 400 })}
            className="p-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
            title="Fit to view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Action: Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all"
            title="Reset to original preset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[600px] w-full bg-[#08080b] overflow-hidden">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={(_, node) => setInspectNodeId(node.id)}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="touch-none"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color="rgba(255, 255, 255, 0.08)"
          />
        </ReactFlow>

        {/* Live Notification Bubble */}
        {statusMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-accent/90 text-black text-xs font-mono font-medium shadow-xl shadow-accent/20 flex items-center gap-1.5 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Interactive Helper Banner */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-white/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Playground: drag nodes, connect handles, or click to inspect.</span>
        </div>

        {/* Stats Pill */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-white/60">
          <span className="text-accent font-semibold">{nodes.length}</span> nodes ·{" "}
          <span className="text-white/80">{edges.length}</span> edges
        </div>

        {/* Inline Slide-out Miniature Inspector Panel */}
        {inspectedNode && (
          <div className="absolute top-4 right-4 bottom-4 w-72 sm:w-80 z-30 bg-[#111116]/95 border border-white/15 rounded-xl backdrop-blur-2xl p-4 flex flex-col shadow-2xl animate-fade-in overflow-hidden">
            {/* Inspector Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                  {inspectedCategory} Concept
                </span>
              </div>
              <button
                onClick={() => setInspectNodeId(null)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                title="Close inspector"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-left">
              <div>
                <h4 className="text-sm font-semibold text-white leading-snug">
                  {(inspectedData.label as string) ?? "Concept"}
                </h4>
                <p className="text-xs text-white/60 font-mono mt-1.5 leading-relaxed">
                  {(inspectedData.summary as string) ?? "No summary provided."}
                </p>
              </div>

              {/* Tags */}
              {Array.isArray(inspectedData.tags) && inspectedData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inspectedData.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-white/50 border border-white/[0.06]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Extracted Takeaways preview */}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <span className="text-[10px] font-mono uppercase text-accent/80 tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  Key Takeaways
                </span>
                <ul className="space-y-1.5">
                  {((inspectedData.takeaways as string[]) || [
                    "Synthesized from source documentation.",
                    "Linked to downstream architectural nodes.",
                  ]).map((pt, i) => (
                    <li
                      key={i}
                      className="text-[11px] text-white/70 font-mono flex items-start gap-1.5 leading-relaxed"
                    >
                      <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Inspector Footer Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => handleAddSubcardDirect(inspectedNode.id)}
                className="flex-1 py-1.5 px-2.5 rounded-md bg-accent text-black font-mono text-xs font-medium hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Subcard</span>
              </button>
              <button
                onClick={() => {
                  setNodes((nds) => nds.filter((n) => n.id !== inspectedNode.id));
                  setEdges((eds) =>
                    eds.filter(
                      (e) => e.source !== inspectedNode.id && e.target !== inspectedNode.id,
                    ),
                  );
                  setInspectNodeId(null);
                  setStatusMessage("Node deleted");
                  setTimeout(() => setStatusMessage(null), 2000);
                }}
                className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                title="Delete this node"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset summary banner at bottom */}
      <div className="border-t border-white/[0.08] px-4 py-2.5 bg-black/40 flex items-center justify-between text-xs text-white/50 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-white/80 font-medium">
            {PRESETS[selectedPresetKey].name}:
          </span>
          <span className="hidden md:inline text-white/40">
            {PRESETS[selectedPresetKey].description}
          </span>
        </div>
        <span className="text-[10px] text-white/40">
          Powered by XYFlow & Dagre
        </span>
      </div>
    </div>
  );
}

export function MiniPlayground() {
  return (
    <ReactFlowProvider>
      <PlaygroundContent />
    </ReactFlowProvider>
  );
}
