import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: Context) {
  try {
    const { id } = await context.params;

    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: { sources: true, nodes: true, edges: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create duplicate with a new id
    const duplicate = await prisma.project.create({
      data: {
        name: `${project.name} (Copy)`,
        description: project.description,
        userId,
        sources: {
          create: project.sources.map((s) => ({
            type: s.type,
            content: s.content,
            label: s.label,
          })),
        },
      },
      include: { sources: true },
    });

    // Map old nodeId→new clone for edge target validity
    const nodeIdMap = new Map<string, string>();

    if (project.nodes.length > 0) {
      await prisma.mindNode.createMany({
        data: project.nodes.map((n) => {
          const newNodeId = `${n.nodeId}-${crypto.randomUUID().slice(0, 8)}`;
          nodeIdMap.set(n.nodeId, newNodeId);
          return {
            nodeId: newNodeId,
            label: n.label,
            summary: n.summary,
            category: n.category,
            tags: n.tags ?? [],
            x: n.x ?? 0,
            y: n.y ?? 0,
            projectId: duplicate.id,
          };
        }),
      });
    }

    if (project.edges.length > 0) {
      await prisma.mindEdge.createMany({
        data: project.edges.map((e) => ({
          edgeId: `${e.edgeId}-${crypto.randomUUID().slice(0, 8)}`,
          source: nodeIdMap.get(e.source) ?? e.source,
          target: nodeIdMap.get(e.target) ?? e.target,
          label: e.label ?? "",
          projectId: duplicate.id,
        })),
      });
    }

    return NextResponse.json({ success: true, projectId: duplicate.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Duplicate failed";
    console.error("Duplicate error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}