import type { GraphData } from "@/lib/types";

export function exportToMarkdown(graph: GraphData): string {
  const lines: string[] = [];
  const visited = new Set<string>();
  const childMap = new Map<string, string[]>();

  for (const edge of graph.edges) {
    if (!childMap.has(edge.source)) childMap.set(edge.source, []);
    childMap.get(edge.source)!.push(edge.target);
  }

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  const targetIds = new Set(graph.edges.map((e) => e.target));
  const roots = graph.nodes.filter((node) => !targetIds.has(node.id));
  if (!roots.length && graph.nodes.length) roots.push(graph.nodes[0]);

  function renderMarkdown(nodeId: string, depth: number): void {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodeMap.get(nodeId);
    if (!node) return;
    const indent = "  ".repeat(depth);
    lines.push(`${indent}- **${node.label}**: ${node.summary}`);
    const children = childMap.get(nodeId) ?? [];
    for (const childId of children) {
      renderMarkdown(childId, depth + 1);
    }
  }

  lines.push("# Mind Map\n");
  for (const root of roots) {
    renderMarkdown(root.id, 0);
  }
  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      lines.push(`- **${node.label}**: ${node.summary}`);
    }
  }
  return lines.join("\n");
}

export function exportToSvgString(graph: GraphData): string {
  const width = 900;
  const height = Math.max(500, graph.nodes.length * 60 + 100);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#09090b">`;
  svg += `<style>text{font-family:system-ui,sans-serif;font-size:12px;fill:#fafafa}</style>`;

  const nodesWithPos = graph.nodes.map((node, index) => ({
    ...node,
    x: (index % 4) * 220 + 80,
    y: Math.floor(index / 4) * 100 + 60,
  }));
  const posMap = new Map(nodesWithPos.map((node) => [node.id, node]));

  for (const edge of graph.edges) {
    const source = posMap.get(edge.source);
    const target = posMap.get(edge.target);
    if (!source || !target) continue;
    svg += `<line x1="${source.x + 80}" y1="${source.y + 20}" x2="${target.x + 80}" y2="${target.y + 20}" stroke="#6d28d9" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="6 4" />`;
    if (edge.label) {
      const mx = (source.x + target.x) / 2 + 80;
      const my = (source.y + target.y) / 2 + 20;
      svg += `<text x="${mx}" y="${my - 4}" text-anchor="middle" fill="#a1a1aa" font-size="9">${edge.label}</text>`;
    }
  }

  for (const node of nodesWithPos) {
    svg += `<rect x="${node.x}" y="${node.y}" width="160" height="40" rx="10" fill="#18181c" stroke="#ffffff" stroke-opacity="0.1" />`;
    svg += `<text x="${node.x + 8}" y="${node.y + 16}" font-weight="bold" font-size="11">${node.label}</text>`;
    svg += `<text x="${node.x + 8}" y="${node.y + 30}" fill="#a1a1aa" font-size="9">${node.summary.slice(0, 40)}…</text>`;
  }

  svg += "</svg>";
  return svg;
}