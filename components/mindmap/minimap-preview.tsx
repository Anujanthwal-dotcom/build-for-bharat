"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MindMapCustomNode } from "@/components/mindmap/custom-node";
import { MindMapCustomEdge } from "@/components/mindmap/custom-edge";
import { calculateDagreLayout } from "@/lib/layout";
import type { GraphData } from "@/lib/types";
import { cn } from "@/lib/utils";

const nodeTypes = { mindflow: MindMapCustomNode };
const edgeTypes = { mindflow: MindMapCustomEdge };

interface MiniMapPreviewProps {
  graph: GraphData;
  className?: string;
}

function MiniViewInner({ graph, className }: MiniMapPreviewProps) {
  const { nodes, edges } = useMemo(() => {
    if (!graph.nodes.length) return { nodes: [], edges: [] };
    const { nodes: laidOut, edges } = calculateDagreLayout(graph.nodes, graph.edges, "LR");
    return {
      nodes: laidOut.map((n): Node => ({
        id: n.id,
        type: "mindflow",
        position: { x: n.x, y: n.y },
        data: { label: n.label, summary: n.summary, category: n.category },
      })),
      edges: edges.map((e): Edge => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "mindflow",
      })),
    };
  }, [graph]);

  return (
    <div className={cn("h-full w-full", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.1, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.1}
        maxZoom={1}
        defaultEdgeOptions={{ type: "mindflow" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={0.8} color="#1c1c26" />
      </ReactFlow>
    </div>
  );
}

export function MiniMapPreview(props: MiniMapPreviewProps) {
  return (
    <ReactFlowProvider>
      <MiniViewInner {...props} />
    </ReactFlowProvider>
  );
}