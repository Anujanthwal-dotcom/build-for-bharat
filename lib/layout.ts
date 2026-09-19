import dagre from "@dagrejs/dagre";
import type { MindMapEdge, MindMapNode, LayoutDirection } from "@/lib/types";

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 220;
export const HORIZONTAL_SPACING = 140; // horizontal separation between ranks in LR mode
export const VERTICAL_SPACING = 75;    // vertical separation between nodes in LR mode
export const MIN_CLEARANCE_X = 40;     // protective halo clearance X
export const MIN_CLEARANCE_Y = 40;     // protective halo clearance Y

export type LayeredNode<T = MindMapNode> = T & {
  x: number;
  y: number;
};

export interface CollisionNode {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/**
 * Resolves any overlapping nodes by enforcing a clearance margin around each node
 * so that no node can invade another node's space.
 */
export function resolveCollisions<T extends CollisionNode>(
  nodes: T[],
  options?: {
    width?: number;
    height?: number;
    gapX?: number;
    gapY?: number;
    maxIterations?: number;
  },
): T[] {
  if (nodes.length <= 1) return nodes;

  const width = options?.width ?? NODE_WIDTH;
  const height = options?.height ?? NODE_HEIGHT;
  const gapX = options?.gapX ?? MIN_CLEARANCE_X;
  const gapY = options?.gapY ?? MIN_CLEARANCE_Y;
  const maxIterations = options?.maxIterations ?? 40;

  // Clone to avoid mutating inputs
  const resolved = nodes.map((n) => ({ ...n }));

  for (let iter = 0; iter < maxIterations; iter++) {
    let hadCollision = false;

    for (let i = 0; i < resolved.length; i++) {
      for (let j = i + 1; j < resolved.length; j++) {
        const a = resolved[i];
        const b = resolved[j];

        const aWidth = a.width ?? width;
        const aHeight = a.height ?? height;
        const bWidth = b.width ?? width;
        const bHeight = b.height ?? height;

        const currentMinDistX = (aWidth + bWidth) / 2 + gapX;
        const currentMinDistY = (aHeight + bHeight) / 2 + gapY;

        const dx = (b.x + bWidth / 2) - (a.x + aWidth / 2);
        const dy = (b.y + bHeight / 2) - (a.y + aHeight / 2);

        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        const overlapX = currentMinDistX - absDx;
        const overlapY = currentMinDistY - absDy;

        if (overlapX > 0 && overlapY > 0) {
          hadCollision = true;

          // Push along the axis of least intrusion, prioritizing vertical separation for columns
          if (overlapY <= overlapX || absDx < currentMinDistX * 0.45) {
            const shiftY = overlapY / 2;
            const signY = dy >= 0 ? 1 : -1;
            a.y -= shiftY * signY;
            b.y += shiftY * signY;
          } else {
            const shiftX = overlapX / 2;
            const signX = dx >= 0 ? 1 : -1;
            a.x -= shiftX * signX;
            b.x += shiftX * signX;
          }
        }
      }
    }

    if (!hadCollision) break;
  }

  return resolved;
}

/**
 * Runs the dagre hierarchical layout algorithm over the given graph,
 * followed by a collision resolution pass, ensuring balanced and collision-free spacing.
 */
export function calculateDagreLayout<
  N extends { id: string; x?: number; y?: number },
  E extends { source: string; target: string; label?: string }
>(
  nodes: N[],
  edges: E[],
  direction: LayoutDirection = "LR",
): { nodes: (N & { x: number; y: number })[]; edges: E[] } {
  if (!nodes.length) return { nodes: [], edges };

  const isHorizontal = direction === "LR";
  const nodesep = isHorizontal ? VERTICAL_SPACING : 80;
  const ranksep = isHorizontal ? HORIZONTAL_SPACING : 90;

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    align: "UL",
    nodesep,
    ranksep,
    marginx: 50,
    marginy: 50,
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

  const positioned = nodes.map((node) => {
    const { x, y } = g.node(node.id) ?? { x: 0, y: 0 };
    return {
      ...node,
      x: Math.round(x - NODE_WIDTH / 2),
      y: Math.round(y - NODE_HEIGHT / 2),
    };
  });

  // Apply collision resolution pass to guarantee minimum clearance
  const separated = resolveCollisions(positioned, {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    gapX: MIN_CLEARANCE_X,
    gapY: MIN_CLEARANCE_Y,
  });

  return { nodes: separated, edges };
}

/**
 * Finds the root node (node with no incoming edges + most outgoing edges).
 */
export function findRootNode<
  N extends { id: string },
  E extends { source: string; target: string }
>(nodes: N[], edges: E[]): N | null {
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