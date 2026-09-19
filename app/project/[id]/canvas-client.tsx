"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  ArrowLeft,
  Share,
  Check,
  LayoutTemplate,
  Layers,
  Bot,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Link from 'next/link';

import CustomNode from '@/components/flow/custom-node';
import CustomEdge from '@/components/flow/custom-edge';
import { NodeDetailPanel } from '@/components/flow/node-detail-panel';
import { CanvasControls } from '@/components/flow/canvas-controls';
import { ExportMenu } from '@/components/project/export-menu';
import { SourceInspector } from '@/components/project/source-inspector';
import { CanvasFloatingTour } from '@/components/onboarding/canvas-floating-tour';
import { AddConceptModal } from '@/components/project/add-concept-modal';
import { ConceptDeepModal } from '@/components/project/concept-deep-modal';
import { calculateDagreLayout, resolveCollisions } from '@/lib/layout';
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

function CanvasContent({
  projectId,
  project,
  sources,
  initialNodes: _initialNodes,
  initialEdges: _initialEdges,
}: CanvasClientProps) {
  const initialProcessedNodes = useMemo(() => {
    if (!_initialNodes || _initialNodes.length === 0) return _initialNodes;

    const allZero =
      _initialNodes.length > 1 &&
      _initialNodes.every((n) => n.position.x === 0 && n.position.y === 0);

    if (allZero) {
      const mindmapNodes = _initialNodes.map((n) => ({
        id: n.id,
        label: ((n.data as Record<string, unknown>).label as string) ?? "",
        summary: ((n.data as Record<string, unknown>).summary as string) ?? "",
        category: ((n.data as Record<string, unknown>).category as string) ?? "",
        x: n.position.x,
        y: n.position.y,
      }));
      const mindmapEdges = _initialEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
      }));
      const { nodes: laidOut } = calculateDagreLayout(mindmapNodes, mindmapEdges, "LR");
      return _initialNodes.map((n) => {
        const laid = laidOut.find((l) => l.id === n.id);
        return laid ? { ...n, position: { x: laid.x, y: laid.y } } : n;
      });
    }

    // Protect against any overlapping nodes from legacy runs
    const collisionCoords = _initialNodes.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
    }));
    const separated = resolveCollisions(collisionCoords);
    return _initialNodes.map((n) => {
      const sep = separated.find((s) => s.id === n.id);
      return sep ? { ...n, position: { x: sep.x, y: sep.y } } : n;
    });
  }, [_initialNodes, _initialEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialProcessedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(_initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isCanvasTourOpen, setIsCanvasTourOpen] = useState(false);
  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [addConceptParentId, setAddConceptParentId] = useState<string | null>(null);
  const [isDeepModalOpen, setIsDeepModalOpen] = useState(false);
  const [deepModalNodeId, setDeepModalNodeId] = useState<string | null>(null);

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
    } catch {
      setSaveStatus("unsaved");
    }
  }, [projectId]);

  // Debounced auto-save on nodes/edges changes (skips initial mount)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveGraph(nodes, edges);
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [nodes, edges, saveGraph]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "custom" }, eds));
    },
    [setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id));
      setEdges((eds) => eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)));
      if (selectedNodeId && deletedIds.has(selectedNodeId)) {
        setSelectedNodeId(null);
        setDetailNodeId(null);
      }
    },
    [setEdges, selectedNodeId],
  );

  const onEdgesDelete = useCallback((_: Edge[]) => {}, []);

  const handleUpdateNode = useCallback(
    (nodeId: string, patch: Partial<{ label: string; summary: string; category: string; tags: string[] }>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...(n.data as Record<string, unknown>), ...patch } }
            : n,
        ),
      );
    },
    [setNodes],
  );

  const handleConnectNodes = useCallback(
    (sourceId: string, targetId: string) => {
      const exists = edges.some((e) => e.source === sourceId && e.target === targetId);
      if (!exists) {
        const sourceEdges = edges.filter((e) => e.source === sourceId);
        const targetEdges = edges.filter((e) => e.target === targetId);
        const newEdge: Edge = {
          id: `e-${sourceId}->${targetId}-${Date.now()}`,
          source: sourceId,
          target: targetId,
          sourceHandle: `s-${Math.min(sourceEdges.length, 9)}`,
          targetHandle: `t-${Math.min(targetEdges.length, 9)}`,
          type: "custom",
          data: { label: "" },
        };
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [edges, setEdges],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges],
  );

  // Auto-layout nodes using unified Dagre hierarchical algorithm
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

  // Handle adding a new concept node
  const handleAddConcept = useCallback(
    (concept: {
      label: string;
      summary: string;
      category: string;
      parentId?: string;
      edgeLabel?: string;
      tags: string[];
      autoLayout: boolean;
    }) => {
      const newId = `node_${Date.now()}`;
      let posX = 120;
      let posY = 120;

      if (concept.parentId) {
        const parent = nodes.find((n) => n.id === concept.parentId);
        if (parent) {
          const siblingEdges = edges.filter((e) => e.source === concept.parentId);
          const childIndex = siblingEdges.length;
          // Non-overlapping offset: position to the right and staggered vertically for each child
          posX = parent.position.x + 360;
          posY = parent.position.y + (childIndex * 260);
        }
      } else if (nodes.length > 0) {
        const last = nodes[nodes.length - 1];
        posX = last.position.x;
        posY = last.position.y + 260;
      }

      const newNode: Node = {
        id: newId,
        type: "custom",
        position: { x: posX, y: posY },
        data: {
          label: concept.label,
          summary: concept.summary,
          category: concept.category,
          tags: concept.tags,
        },
      };

      let newEdges = edges;
      if (concept.parentId) {
        const outIndex = Math.min(edges.filter((e) => e.source === concept.parentId).length, 9);
        const inIndex = 0;
        const newEdge: Edge = {
          id: `e-${concept.parentId}->${newId}-${Date.now()}`,
          source: concept.parentId,
          target: newId,
          sourceHandle: `s-${outIndex}`,
          targetHandle: `t-${inIndex}`,
          type: "custom",
          data: { label: concept.edgeLabel || "" },
        };
        newEdges = [...edges, newEdge];
      }

      const updatedNodes = [...nodes, newNode];
      setNodes(updatedNodes);
      setEdges(newEdges);

      setSelectedNodeId(newId);
      setDetailNodeId(newId);
      setCenter(posX + 120, posY + 50, { zoom: 1.1, duration: 400 });

      if (concept.autoLayout) {
        setTimeout(() => {
          handleAutoLayout();
        }, 60);
      }
    },
    [nodes, edges, setNodes, setEdges, setCenter, handleAutoLayout],
  );

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

  const outline = useMemo(
    () => nodes.map((n) => ({ id: n.id, label: ((n.data as Record<string, unknown>).label as string) ?? "" })),
    [nodes],
  );

  // Node click -> open detail panel & highlight
  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNodeId(node.id);
    setDetailNodeId(node.id);
  }, []);

  // Pane click -> close detail panel
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setDetailNodeId(null);
  }, []);

  // Detail panel navigation (click connected node pill)
  const handleDetailNavigate = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setDetailNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setCenter(node.position.x + 120, node.position.y + 50, { zoom: 1.2, duration: 400 });
    },
    [nodes, setCenter],
  );

  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    const node = nodes.find((n) => n.id === detailNodeId);
    if (!node) return null;
    const d = node.data as Record<string, unknown>;
    return {
      id: node.id,
      label: (d.label as string) ?? node.id,
      summary: (d.summary as string) ?? "",
      category: (d.category as string) ?? "core",
      tags: (d.tags as string[]) ?? [],
    };
  }, [nodes, detailNodeId]);

  const deepModalNode = useMemo(() => {
    if (!deepModalNodeId) return null;
    const node = nodes.find((n) => n.id === deepModalNodeId);
    if (!node) return null;
    const d = node.data as Record<string, unknown>;
    return {
      id: node.id,
      label: (d.label as string) ?? node.id,
      summary: (d.summary as string) ?? "",
      category: (d.category as string) ?? "core",
      tags: (d.tags as string[]) ?? [],
    };
  }, [nodes, deepModalNodeId]);

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
          edgeId: e.id,
          id: otherId,
          label: (otherData?.label as string) ?? otherId,
          edgeLabel: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
          direction: (isOutgoing ? "outgoing" : "incoming") as "incoming" | "outgoing",
        };
      });
  }, [detailNodeId, edges, nodes]);

  // Inject callbacks into nodes so card buttons work
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: {
        ...node.data,
        onAddSubcard: (parentId: string) => {
          setAddConceptParentId(parentId);
          setIsAddConceptOpen(true);
        },
        onInspect: (nodeId: string) => {
          setDeepModalNodeId(nodeId);
          setIsDeepModalOpen(true);
        },
      },
    }));
  }, [nodes, selectedNodeId]);

  // Highlight edges connected to selected node
  const displayedEdges = useMemo(() => {
    if (!selectedNodeId) return edges;
    return edges.map((e) => {
      const isConnected = e.source === selectedNodeId || e.target === selectedNodeId;
      return {
        ...e,
        animated: isConnected,
        style: isConnected
          ? { stroke: "#E2E0D9", strokeWidth: 2 }
          : { stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 },
      };
    });
  }, [edges, selectedNodeId]);

  // Global keyboard shortcuts
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
        case "s":
          event.preventDefault();
          setIsSidebarOpen((prev) => !prev);
          break;
        case "l":
          event.preventDefault();
          handleAutoLayout();
          break;
        case "0":
        case "f":
          event.preventDefault();
          fitView({ padding: 0.2, duration: 400 });
          break;
      }
    },
    [fitView, handleAutoLayout, nodes, edges, saveGraph],
  );

  const existingNodesList = useMemo(
    () => nodes.map((n) => ({ id: n.id, label: ((n.data as Record<string, unknown>).label as string) ?? n.id })),
    [nodes],
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans select-none" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Full-width Top Bar */}
      <div data-tour="canvas-header" className="h-14 border-b border-white/10 bg-[#0d0d11]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors cursor-pointer py-1.5 px-2 -ml-2 rounded-md hover:bg-white/5"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-white/10" />

          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-1.5 text-xs cursor-pointer"
              title="Expand sources sidebar (S)"
            >
              <PanelLeftOpen className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline text-xs font-medium">Sources</span>
            </button>
          )}

          <h1 className="text-sm font-semibold tracking-tight text-white/90">
            {project.name}
          </h1>

          <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === "saved"
                ? "bg-emerald-400"
                : saveStatus === "saving"
                ? "bg-amber-400 animate-ping"
                : "bg-zinc-500"
            }`} />
            {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Concept button */}
          <button
            onClick={() => {
              setAddConceptParentId(null);
              setIsAddConceptOpen(true);
            }}
            className="p-1.5 bg-accent text-black hover:bg-accent/90 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium px-3 shadow-sm cursor-pointer"
            title="Add a new concept node to the mind map"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Concept</span>
          </button>

          {/* Guided Tour button */}
          <button
            onClick={() => setIsCanvasTourOpen(true)}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-1.5 text-xs font-medium px-2.5 cursor-pointer"
            title="Launch Guided Canvas Tour"
          >
            <Bot className="w-3.5 h-3.5 text-accent" />
            <span>Tour</span>
          </button>

          <button
            data-tour="canvas-layout"
            onClick={handleAutoLayout}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-2 text-xs font-medium px-3 cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            Auto-Layout
          </button>

          <div className="h-4 w-px bg-white/10" />

          <ExportMenu projectId={projectId} />

          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-muted hover:text-white cursor-pointer"
            title="Copy link"
          >
            {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share className="w-4 h-4" />}
          </button>

          <button
            data-tour="canvas-sources"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${isSidebarOpen ? 'bg-accent/20 text-accent' : 'hover:bg-white/10 text-muted hover:text-white'}`}
            title={isSidebarOpen ? "Collapse sidebar (S)" : "Expand sidebar (S)"}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Sidebar + Canvas */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Collapsible Left Sidebar (Sources Inspector Only) */}
        <div className={`transition-all duration-300 bg-[#0d0d11] flex flex-col z-20 ${isSidebarOpen ? 'w-80 border-r border-white/10' : 'w-0 border-r-0 overflow-hidden'}`}>
          <div className="w-80 h-full flex flex-col shrink-0">
            <SourceInspector
              sources={sources}
              outline={outline}
              onOutlineSelect={handleOutlineSelect}
              selectedNodeId={selectedNodeId}
              onClose={() => setIsSidebarOpen(false)}
              nodesCount={nodes.length}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div data-tour="canvas-flow" className="flex-1 relative h-full">
          <ReactFlow
            nodes={nodesWithCallbacks}
            edges={displayedEdges}
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
            onUpdateNode={handleUpdateNode}
            onConnectNodes={handleConnectNodes}
            onDeleteEdge={handleDeleteEdge}
            allNodes={existingNodesList}
            onAddSubConcept={(parentId) => {
              setAddConceptParentId(parentId);
              setIsAddConceptOpen(true);
            }}
            onOpenDeepModal={(nodeId) => {
              setDeepModalNodeId(nodeId);
              setIsDeepModalOpen(true);
            }}
          />

          {/* Add Concept Modal */}
          <AddConceptModal
            isOpen={isAddConceptOpen}
            onClose={() => {
              setIsAddConceptOpen(false);
              setAddConceptParentId(null);
            }}
            onAdd={handleAddConcept}
            existingNodes={existingNodesList}
            initialParentId={addConceptParentId}
          />

          {/* Fullscreen Concept Deep-Dive Modal */}
          <ConceptDeepModal
            isOpen={isDeepModalOpen}
            onClose={() => {
              setIsDeepModalOpen(false);
              setDeepModalNodeId(null);
            }}
            node={deepModalNode}
            onAddSubConcept={(parentId) => {
              setAddConceptParentId(parentId);
              setIsAddConceptOpen(true);
            }}
          />

          {/* Canvas Floating Guided Tour */}
          <CanvasFloatingTour
            isOpen={isCanvasTourOpen}
            onClose={() => setIsCanvasTourOpen(false)}
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