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
  Film,
  Bot,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import CustomNode from '@/components/flow/custom-node';
import CustomEdge from '@/components/flow/custom-edge';
import { NodeDetailPanel } from '@/components/flow/node-detail-panel';
import { CanvasControls } from '@/components/flow/canvas-controls';
import { ExportMenu } from '@/components/project/export-menu';
import { SourceInspector } from '@/components/project/source-inspector';
import { ScriptStudio } from '@/components/project/script-studio';
import { CanvasFloatingTour } from '@/components/onboarding/canvas-floating-tour';
import { AddConceptModal } from '@/components/project/add-concept-modal';
import { ConceptDeepModal } from '@/components/project/concept-deep-modal';
import { calculateDagreLayout } from '@/lib/layout';
import { generateSemanticCreatorScript, type CreatorScript } from '@/lib/creator-script';
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
  const [nodes, setNodes, onNodesChange] = useNodesState(_initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(_initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isScriptStudioOpen, setIsScriptStudioOpen] = useState(false);
  const [isCanvasTourOpen, setIsCanvasTourOpen] = useState(false);
  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [addConceptParentId, setAddConceptParentId] = useState<string | null>(null);
  const [isDeepModalOpen, setIsDeepModalOpen] = useState(false);
  const [deepModalNodeId, setDeepModalNodeId] = useState<string | null>(null);
  const [creatorScript, setCreatorScript] = useState<CreatorScript | null>(null);

  const { setCenter, fitView } = useReactFlow();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);

  const handleOpenScriptStudio = useCallback(() => {
    const extractedNodes = nodes.map((n) => {
      const d = n.data as Record<string, unknown>;
      return {
        id: n.id,
        label: (d.label as string) ?? n.id,
        summary: (d.summary as string) ?? "",
        category: (d.category as string) ?? "core",
        tags: (d.tags as string[]) ?? [],
      };
    });
    const extractedEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
    }));
    const generated = generateSemanticCreatorScript(project.name, extractedNodes, extractedEdges);
    setCreatorScript(generated);
    setIsScriptStudioOpen(true);
  }, [nodes, edges, project.name]);

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
      const id = `e-${params.source}->${params.target}-${Date.now()}`;
      setEdges((eds) => addEdge({ ...params, id, type: 'custom', sourceHandle, targetHandle }, eds));
    },
    [edges, setEdges],
  );

  const handleConnectNodes = useCallback(
    (sourceId: string, targetId: string, label?: string) => {
      const exists = edges.some((e) => e.source === sourceId && e.target === targetId);
      if (exists) return;
      const outIndex = Math.min(edges.filter((e) => e.source === sourceId).length, 9);
      const inIndex = Math.min(edges.filter((e) => e.target === targetId).length, 9);
      const newEdge: Edge = {
        id: `e-${sourceId}->${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        sourceHandle: `s-${outIndex}`,
        targetHandle: `t-${inIndex}`,
        type: 'custom',
        data: { label: label || "" },
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [edges, setEdges],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges],
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
          posX = parent.position.x + 320;
          posY = parent.position.y + (childIndex * 150);
        }
      } else if (nodes.length > 0) {
        const last = nodes[nodes.length - 1];
        posX = last.position.x;
        posY = last.position.y + 150;
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

  // Edit node content from the detail panel
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

  // Build deep modal data
  const deepModalNode = useMemo(() => {
    if (!deepModalNodeId) return null;
    const n = nodes.find((nd) => nd.id === deepModalNodeId);
    if (!n) return null;
    const d = n.data as Record<string, unknown>;
    return {
      id: n.id,
      label: (d.label as string) ?? "",
      summary: (d.summary as string) ?? "",
      category: (d.category as string) ?? "default",
      tags: (d.tags as string[]) ?? [],
    };
  }, [deepModalNodeId, nodes]);

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

  // Nodes with interactive callbacks attached to data for direct canvas actions
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...(n.data as Record<string, unknown>),
        onAddSubcard: (nodeId: string) => {
          setAddConceptParentId(nodeId);
          setIsAddConceptOpen(true);
        },
        onInspect: (nodeId: string) => {
          setSelectedNodeId(nodeId);
          setDetailNodeId(nodeId);
        },
      },
    }));
  }, [nodes]);

  // Illuminated path styling when a node is selected
  const displayedEdges = useMemo(() => {
    if (!selectedNodeId) return edges;
    return edges.map((e) => {
      const isConnected = e.source === selectedNodeId || e.target === selectedNodeId;
      return isConnected
        ? {
            ...e,
            animated: true,
            style: { stroke: "#E2E0D9", strokeWidth: 2.5, opacity: 1 },
          }
        : {
            ...e,
            style: { opacity: 0.25 },
          };
    });
  }, [edges, selectedNodeId]);

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
      }
    },
    [fitView, handleAutoLayout, nodes, edges, saveGraph],
  );

  const existingNodesList = useMemo(
    () => nodes.map((n) => ({ id: n.id, label: ((n.data as Record<string, unknown>).label as string) ?? n.id })),
    [nodes],
  );

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans select-none" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Collapsible Left Sidebar */}
      <div className={`transition-all duration-300 border-r border-white/10 bg-[#0d0d11] flex flex-col z-20 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted">
            {nodes.length} Nodes
          </span>
        </div>
        
        <SourceInspector
          sources={sources}
          outline={outline}
          onOutlineSelect={handleOutlineSelect}
          selectedNodeId={selectedNodeId}
        />
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        {/* Canvas Header Toolbar */}
        <div className="h-14 border-b border-white/10 bg-[#0d0d11]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm text-white/90 truncate max-w-sm">{project.name}</h1>
            <span className="text-xs text-muted font-mono">•</span>
            <span className="text-xs text-muted font-mono flex items-center gap-1.5">
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

            {/* Script Studio button */}
            <button
              data-tour="canvas-script"
              onClick={handleOpenScriptStudio}
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md transition-colors text-muted hover:text-white flex items-center gap-1.5 text-xs font-medium px-2.5 cursor-pointer"
              title="Open Creator Script & Lecture Studio"
            >
              <Film className="w-3.5 h-3.5 text-accent" />
              <span>Script Studio</span>
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
              title="Toggle sources"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div data-tour="canvas-flow" className="flex-1 relative">
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

          {/* Script Studio Modal */}
          <ScriptStudio
            script={creatorScript}
            projectName={project.name}
            nodes={nodes}
            edges={edges}
            isOpen={isScriptStudioOpen}
            onClose={() => setIsScriptStudioOpen(false)}
            onSelectNode={handleOutlineSelect}
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