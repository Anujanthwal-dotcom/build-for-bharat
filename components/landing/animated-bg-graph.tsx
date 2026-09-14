"use client";

import { useMemo } from "react";
import { ReactFlow, ReactFlowProvider, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { MindMapCustomNode } from "@/components/mindmap/custom-node";
import { MindMapCustomEdge } from "@/components/mindmap/custom-edge";
import { calculateDagreLayout } from "@/lib/layout";
import { MOCK_GRAPH_REACT } from "@/lib/mock-data";

const nodeTypes = { mindflow: MindMapCustomNode };
const edgeTypes = { mindflow: MindMapCustomEdge };

function AnimatedGraphInner() {
  const { nodes, edges } = useMemo(() => {
    const { nodes: laidOut, edges } = calculateDagreLayout(
      MOCK_GRAPH_REACT.nodes,
      MOCK_GRAPH_REACT.edges,
      "TB",
    );
    return {
      nodes: laidOut.map((node): Node => ({
        id: node.id,
        type: "mindflow",
        position: { x: node.x, y: node.y },
        data: { label: node.label, summary: "", category: node.category },
      })),
      edges: edges.map((edge): Edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "mindflow",
      })),
    };
  }, []);

  if (!nodes.length) return null;

  return (
    <div className="h-full w-full opacity-[0.22]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, minZoom: 0.5 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1}
        defaultEdgeOptions={{ type: "mindflow" }}
      />
    </div>
  );
}

export function AnimatedBackgroundGraph() {
  return (
    <ReactFlowProvider>
      <AnimatedGraphInner />
    </ReactFlowProvider>
  );
}