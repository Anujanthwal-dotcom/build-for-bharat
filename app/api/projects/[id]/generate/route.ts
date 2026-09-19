import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/auth';
import { extractMindMap, getDepthNodeLimit, type ExtractedGraph } from '@/lib/ai';
import type { DepthLevel, Source } from '@/lib/types';
import z from 'zod';
import { calculateDagreLayout } from '@/lib/layout';

const RequestSchema = z.object({
  depth: z.enum(["summary", "standard", "deep"]).optional(),
  systemInstructions: z.string().optional(),
});

function buildMockGraph(depth: DepthLevel = "standard"): ExtractedGraph {
  const nodeLimit = getDepthNodeLimit(depth);
  const nodes = [
    { id: "1", label: "Core System", summary: "the main core", category: "core" as const, tags: ["Core"] },
    { id: "2", label: "Memory Component", summary: "handles memory", category: "memory" as const, tags: ["RAM"] },
    { id: "3", label: "Execution Engine", summary: "runs workloads", category: "execution" as const, tags: ["Runtime"] },
    { id: "4", label: "Concurrency Manager", summary: "coordinates parallel work", category: "concurrency" as const, tags: ["Async"] },
  ];
  return {
    title: "Mock Architecture",
    nodes: depth === "summary" ? nodes.slice(0, 2) : nodes.slice(0, Math.min(nodeLimit, nodes.length)),
    edges: [
      { source: "1", target: "2", label: "allocates" },
      { source: "1", target: "3", label: "orchestrates" },
      { source: "3", target: "4", label: "uses" },
    ],
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const parsed = RequestSchema.safeParse(body);
    const depth: DepthLevel = parsed.success && parsed.data.depth ? parsed.data.depth : "standard";
    const systemInstructions: string | undefined =
      parsed.success && parsed.data.systemInstructions ? parsed.data.systemInstructions : undefined;

    // Fetch project and sources, scoped to owner
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: { sources: true },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    let graphData: ExtractedGraph;

    if (!process.env.GOOGLE_API_KEY) {
      console.warn("No GOOGLE_API_KEY found, using fallback data.");
      graphData = buildMockGraph(depth);
    } else {
      graphData = await extractMindMap(
        project.sources.map((s) => ({
          id: s.id,
          type: s.type as Source["type"],
          content: s.content,
          label: s.label,
        })),
        depth,
        systemInstructions,
      );
    }

    // Update project title
    await prisma.project.update({
      where: { id },
      data: { name: graphData.title },
    });

    // Run layout with guaranteed clearance and collision avoidance
    const { nodes: laidOutNodes, edges: validEdges } = calculateDagreLayout(
      graphData.nodes,
      graphData.edges,
      'LR',
    );

    // Prepare nodes with coordinates
    const nodesToSave = laidOutNodes.map((n) => ({
      nodeId: n.id,
      label: n.label,
      summary: n.summary,
      category: n.category,
      tags: n.tags ?? [],
      x: n.x,
      y: n.y,
      projectId: id,
    }));

    const validNodeIdSet = new Set(laidOutNodes.map((n) => n.id));
    const edgesToSave = validEdges
      .filter((e) => validNodeIdSet.has(e.source) && validNodeIdSet.has(e.target))
      .map((e, i) => ({
        edgeId: `e${i}-${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        label: e.label || '',
        projectId: id,
      }));

    // Clear old ones if any
    await prisma.mindNode.deleteMany({ where: { projectId: id } });
    await prisma.mindEdge.deleteMany({ where: { projectId: id } });

    // Save to DB
    if (nodesToSave.length > 0) await prisma.mindNode.createMany({ data: nodesToSave });
    if (edgesToSave.length > 0) await prisma.mindEdge.createMany({ data: edgesToSave });

    return NextResponse.json({ success: true, project: graphData.title });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    console.error("Generation error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}