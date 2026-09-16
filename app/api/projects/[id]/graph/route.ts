import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

const NodeSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  summary: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params;

    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exists = await prisma.project.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = GraphSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid graph payload" }, { status: 400 });
    }

    const { nodes, edges } = parsed.data;

    // Delete then recreate — matches the pattern used by generate
    await prisma.mindNode.deleteMany({ where: { projectId: id } });
    await prisma.mindEdge.deleteMany({ where: { projectId: id } });

    if (nodes.length > 0) {
      await prisma.mindNode.createMany({
        data: nodes.map((n) => ({
          nodeId: n.id,
          label: n.label ?? "",
          summary: n.summary ?? "",
          category: n.category ?? "default",
          tags: n.tags ?? [],
          x: n.x ?? 0,
          y: n.y ?? 0,
          projectId: id,
        })),
      });
    }

    if (edges.length > 0) {
      await prisma.mindEdge.createMany({
        data: edges.map((e) => ({
          edgeId: e.id,
          source: e.source,
          target: e.target,
          label: e.label ?? "",
          projectId: id,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save graph";
    console.error("Graph save error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}