import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
});

async function getOwnedProject(id: string, userId: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    include: { sources: true, nodes: true, edges: true },
  });
}

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getOwnedProject(id, userId);

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
        tags: (node.tags as string[] | null) ?? [],
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

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
  }

  const exists = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({
    id: project.id,
    name: project.name,
    description: project.description,
    updatedAt: project.updatedAt.toISOString(),
  });
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exists = await prisma.project.findFirst({ where: { id, userId }, select: { id: true } });
  if (!exists) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}