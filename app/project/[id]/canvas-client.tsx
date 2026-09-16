"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ReactFlow, Background, MiniMap, useReactFlow, ReactFlowProvider, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Node, type Edge, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ArrowLeft, Share, Check, LayoutTemplate, Layers } from 'lucide-react';
import Link from 'next/link';

import CustomNode from '@/components/flow/custom-node';
import CustomEdge from '@/components/flow/custom-edge';
import { NodeDetailPanel } from '@/components/flow/node-detail-panel';
import { CanvasControls } from '@/components/flow/canvas-controls';
import { ExportMenu } from '@/components/project/export-menu';
import { SourceInspector } from '@/components/project/source-inspector';
import { calculateDagreLayout } from '@/lib/layout';
import type { Source } from '@/lib/types';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

interface CanvasClientProps {
  projectId: string;
  project: { name: string; sourcesCount: number };
  sources: Source[];
  initialNodes: Node[];
  initialEdges: Edge[];
}

function CanvasContent({ projectId, project, sources, initialNodes: _initialNodes, initialEdges: _initialEdges }: CanvasClientProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(_initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(_initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const { setCenter, fitView } = useReactFlow();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);

  const saveGraph = useCallback(async (nodesToSave: Node[], edgesToSave: Edge[]) => {
    setSaveStatus("saving");
    try {
      const payload = {
        nodes: nodesToSave.map((n) => ({
          id: n.id,
          label: (n.data as Record<string, unknown>).label ?? "",
          summary: (n.data as Record<string, unknown>).summary ?? "",
          category: (n.data as Record<string, unknown>).category ?? "default",
          tags: (n.data as Record<string, unknown>).tags ?? [],
          x: n.position.x,
          y: n.position.y,
        })),
        edges: edgesToSave.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: (e.data as Record<string, unknown> | undefined)?.label ?? "",
        })),
      };
      await fetch(`/api/projects/${projectId}/graph`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("unsaved");
    }
  }, [projectId]);

  // Debounced auto-save on any node/edge change (skip first render)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveGraph(nodes, edges), 1200);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [nodes, edges, saveGraph]);

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceHandle = params.sourceHandle ?? `s-${Math.min(edges.filter((e) => e.source === params.source).length, 9)}`;
      const targetHandle = params.targetHandle ?? `t-${Math.min(edges.filter((e) => e.target === params.target).length, 9)}`;
      const id = `e-${params.source}->${params.target}`;
      setEdges((eds) => addEdge({ ...params, id, type: 'custom', sourceHandle, targetHandle }, eds));
    },
    [edges, setEdges],
  );

  const onNodesDelete = useCallback(() => { setSaveStatus("unsaved"); }, []);
  const onEdgesDelete = useCallback(() => { setSaveStatus("unsaved"); }, []);

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
  }, [nodes, edges, setNodes]);

  const handleOutlineSelect = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setCenter(node.position.x + 120, node.position.y + 50, { zoom: 1.2, duration: 400 });
    },
    [nodes, setCenter],
  );

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, []);

  const outline = useMemo(() => nodes.map((n) => ({ id: n.id, label: ((n.data as Record<string, unknown>).label as string) ?? "" })), [nodes]);

  // Node click → open detail panel
  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNodeId(node.id);
    setDetailNodeId(node.id);
  }, []);

  // Pane click → close detail panel
  const onPaneClick = useCallback(() => {
    setDetailNodeId(null);
    setSelectedNodeId(null);
  }, []);

  // Navigate to a connected node from the detail panel
  const handleDetailNavigate = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setDetailNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setCenter(node.position.x + 120, node.position.y + 50, { zoom: 1.2, duration: 400 });
    },
    [nodes, setCenter],
  );

  // Build detail panel data
  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    const n = nodes.find((nd) => nd.id === detailNodeId);
    if (!n) return null;
    const d = n.data as Record<string, unknown>;
    return {
      id: n.id,
      label: (d.label as string) ?? "",
      summary: (d.summary as string) ?? "",
      category: (d.category as string) ?? "default",
      tags: (d.tags as string[]) ?? [],
    };
  }, [detailNodeId, nodes]);

  const connectedNodes = useMemo(() => {
    if (!detailNodeId) return [];
    return edges
      .filter((e) => e.source === detailNodeId || e.target === detailNodeId)
      .map((e) => {
        const isOutgoing = e.source === detailNodeId;
        const otherId = isOutgoing ? e.target : e.source;
        const otherNode = nodes.find((n) => n.id === otherId);
        const otherData = otherNode?.data as Record<string, unknown> | undefined;
        return {
          id: otherId,
          label: (otherData?.label as string) ?? "",
          edgeLabel: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
          direction: (isOutgoing ? "outgoing" : "incoming") as "incoming" | "outgoing",
        };
      });
  }, [detailNodeId, edges, nodes]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (mod && (event.key === "s" || event.key === "S")) {
        event.preventDefault();
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveGraph(nodes, edges);
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;

      switch (event.key.toLowerCase()) {
        case "l":
          event.preventDefault();
          handleAutoLayout();
          break;
        case "0":
        case "f":
          event.preventDefault();
          fitView({ padding: 0.2, duration: 400 });
          break;
        case "s":
          event.preventDefault();
          setIsSidebarOpen((open) => !open);
          break;
      }
    },
    [nodes, edges, saveGraph, handleAutoLayout, fitView],
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Source Inspector sidebar (left) */}
      {isSidebarOpen && (
        <SourceInspector
          sources={sources}
          outline={outline}
          selectedNodeId={selectedNodeId}
          onOutlineSelect={handleOutlineSelect}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navigation Overlay */}
        <div className="h-14 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div>
              <h1 className="text-sm font-medium text-white/90">{project.name}</h1>
              <p className="text-[10px] text-muted font-mono">Generated from {project.sourcesCount} sources · {nodes.length} Nodes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${saveStatus === "saved" ? "text-zinc-500" : saveStatus === "saving" ? "text-amber-400/80" : "text-zinc-400"}`}>
              {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved changes"}
            </span>

            <button onClick={handleAutoLayout} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-2 text-xs font-medium px-3">
              <LayoutTemplate className="w-3.5 h-3.5" />
              Auto-Layout
            </button>
            <div className="h-4 w-px bg-white/10" />
            <ExportMenu projectId={projectId} />
            <button onClick={handleShare} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white" title="Copy link">
              {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 rounded-md transition-colors ${isSidebarOpen ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-muted hover:text-white'}`}
              title="Toggle sources"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
            className="bg-[#09090b]"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.04)" />
            <MiniMap
              nodeColor="rgba(226,224,217,0.4)"
              maskColor="rgba(0,0,0,0.6)"
              className="!bg-[#0d0d11] !border-white/10 !rounded-lg"
            />
          </ReactFlow>

          {/* Custom zoom controls */}
          <CanvasControls />

          {/* Node Detail Panel (overlays canvas from the right) */}
          <NodeDetailPanel
            node={detailNode}
            connectedNodes={connectedNodes}
            onClose={() => { setDetailNodeId(null); setSelectedNodeId(null); }}
            onNavigate={handleDetailNavigate}
          />
        </div>
      </div>
    </div>
  );
}

export default function CanvasClient(props: CanvasClientProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}