import dagre from "@dagrejs/dagre";
import type { MindMapEdge, MindMapNode, LayoutDirection } from "@/lib/types";

const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 48;

export interface LayeredNode extends MindMapNode {
  x: number;
  y: number;
}

/**
 * Runs the dagre hierarchical layout algorithm over the given graph and
 * returns nodes with computed x/y positions.
 */
export function calculateDagreLayout(
  nodes: MindMapNode[],
  edges: MindMapEdge[],
  direction: LayoutDirection = "TB",
): { nodes: LayeredNode[]; edges: MindMapEdge[] } {
  if (!nodes.length) return { nodes: [], edges };

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: HORIZONTAL_SPACING,
    ranksep: VERTICAL_SPACING,
    marginx: 60,
    marginy: 60,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  const positioned: LayeredNode[] = nodes.map((node) => {
    const { x, y } = g.node(node.id) ?? { x: 0, y: 0 };
    return {
      ...node,
      x: x - NODE_WIDTH / 2,
      y: y - NODE_HEIGHT / 2,
    };
  });

  return { nodes: positioned, edges };
}

/**
 * Finds the root node (node with no incoming edges + most outgoing edges).
 */
export function findRootNode(nodes: MindMapNode[], edges: MindMapEdge[]): MindMapNode | null {
  if (!nodes.length) return null;
  const targetIds = new Set(edges.map((edge) => edge.target));
  const roots = nodes.filter((node) => !targetIds.has(node.id));
  if (roots.length) {
    return roots.reduce((best, node) => {
      const degree = edges.filter((edge) => edge.source === node.id).length;
      const bestDegree = edges.filter((edge) => edge.source === best.id).length;
      return degree > bestDegree ? node : best;
    });
  }
  const allOutDegree = nodes.map((node) => ({
    node,
    degree: edges.filter((edge) => edge.source === node.id).length,
  }));
  allOutDegree.sort((a, b) => b.degree - a.degree);
  return allOutDegree[0]?.node ?? nodes[0];
}