"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import { Layout } from "lucide-react";
import "@xyflow/react/dist/style.css";
import { MindMapCustomNode } from "@/components/mindmap/custom-node";
import { MindMapCustomEdge } from "@/components/mindmap/custom-edge";
import { calculateDagreLayout } from "@/lib/layout";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { GraphData, LayoutDirection } from "@/lib/types";
import { cn } from "@/lib/utils";

const nodeTypes: NodeTypes = { mindflow: MindMapCustomNode };
const edgeTypes: EdgeTypes = { mindflow: MindMapCustomEdge };

export interface FlowNode extends Node {
  type: "mindflow";
  data: {
    label: string;
    summary: string;
    category: string;
  };
}

export interface FlowEdge extends Edge {
  type: "mindflow";
  label?: string;
}

function toFlowNodes(graph: GraphData): FlowNode[] {
  return graph.nodes.map((node) => ({
    id: node.id,
    type: "mindflow",
    position: { x: node.x ?? 0, y: node.y ?? 0 },
    data: {
      label: node.label,
      summary: node.summary,
      category: node.category,
    },
  }));
}

function toFlowEdges(graph: GraphData): FlowEdge[] {
  return graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "mindflow",
    label: edge.label,
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(139,92,246,0.7)", width: 16, height: 16 },
  }));
}

interface MindMapCanvasProps {
  graph: GraphData;
  className?: string;
  title?: string;
  interactive?: boolean;
}

function MindMapCanvasInner({ graph, className, interactive = true }: MindMapCanvasProps) {
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("TB");

  const { nodes, edges } = useMemo(() => {
    if (!graph.nodes.length) return { nodes: [], edges: [] };
    const { nodes: laidOut, edges } = calculateDagreLayout(graph.nodes, graph.edges, layoutDirection);
    return {
      nodes: toFlowNodes({ nodes: laidOut, edges }),
      edges: toFlowEdges({ nodes: laidOut, edges }),
    };
  }, [graph, layoutDirection]);

  const toggleLayout = useCallback(() => {
    setLayoutDirection((direction) => (direction === "TB" ? "LR" : "TB"));
  }, []);

  const miniMapNodeColor = useCallback((node: Node) => {
    const category = (node as FlowNode).data?.category;
    return CATEGORY_COLORS[category] ?? "#8b5cf6";
  }, []);

  return (
    <div className={cn("relative h-full w-full", className)}>
      {nodes.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="glass-card rounded-xl px-6 py-4 text-sm text-zinc-400">
            No nodes to render yet — generate a mind map to get started.
          </div>
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.25, maxZoom: 1.2, minZoom: 0.2 }}
          nodesDraggable={interactive}
          nodesConnectable={interactive}
          elementsSelectable={interactive}
          panOnDrag={interactive}
          zoomOnScroll={interactive}
          zoomOnPinch={interactive}
          zoomOnDoubleClick={interactive}
          deleteKeyCode={interactive ? ["Backspace", "Delete"] : null}
          defaultEdgeOptions={{ type: "mindflow" }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.15}
          maxZoom={2.5}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#1c1c26" />
          <Controls showInteractive={false} position="bottom-left" />
          {interactive && (
            <MiniMap
              pannable
              zoomable
              nodeColor={miniMapNodeColor}
              maskColor="rgba(9,9,11,0.72)"
              bgColor="#0d0d11"
              nodeStrokeWidth={0}
              position="bottom-right"
              className="hidden sm:block"
            />
          )}
          <div className="absolute left-4 top-4 z-10">
            <button
              onClick={toggleLayout}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-white/10",
                "bg-neutral-900/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300",
                "backdrop-blur-xl shadow-glass transition-colors hover:border-white/25 hover:text-white",
              )}
              title="Toggle layout direction"
            >
              <Layout className="h-3 w-3" />
              {layoutDirection === "TB" ? "Top → Bottom" : "Left → Right"}
            </button>
          </div>
        </ReactFlow>
      )}
    </div>
  );
}

export function MindMapCanvas(props: MindMapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}