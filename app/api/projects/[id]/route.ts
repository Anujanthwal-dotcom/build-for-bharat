import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/lib/seed";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  await ensureSeeded();
  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      sources: true,
      nodes: true,
      edges: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    sources: project.sources.map((source) => ({
      id: source.id,
      type: source.type,
      content: source.content,
      label: source.label,
    })),
    graph: {
      nodes: project.nodes.map((node) => ({
        id: node.nodeId,
        label: node.label,
        summary: node.summary,
        category: node.category,
        x: node.x ?? undefined,
        y: node.y ?? undefined,
      })),
      edges: project.edges.map((edge) => ({
        id: edge.edgeId,
        source: edge.source,
        target: edge.target,
        label: edge.label ?? undefined,
      })),
    },
  });
}