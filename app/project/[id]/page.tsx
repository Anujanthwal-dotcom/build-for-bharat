import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CanvasClient from './canvas-client';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const dbProject = await prisma.project.findFirst({
    where: { id, userId: session.user.id },
    include: {
      _count: { select: { sources: true } },
      sources: true,
      nodes: true,
      edges: true,
    }
  });

  if (!dbProject) return notFound();
  
  const nodes = dbProject.nodes.map(n => ({
    id: n.nodeId,
    type: 'custom',
    position: { x: n.x || 0, y: n.y || 0 },
    data: {
      label: n.label,
      summary: n.summary,
      category: n.category,
      tags: (n.tags as string[] | null) ?? [],
    }
  }));

  const edges = dbProject.edges.map(e => ({
    id: e.edgeId,
    source: e.source,
    target: e.target,
    type: 'custom',
    sourceHandle: 's-0',
    targetHandle: 't-0',
    data: { label: e.label }
  }));

  const sources = dbProject.sources.map(s => ({
    id: s.id,
    type: s.type as "text" | "link" | "file",
    content: s.content,
    label: s.label,
  }));

  return (
    <CanvasClient
      projectId={dbProject.id}
      project={{ name: dbProject.name, sourcesCount: dbProject._count.sources }}
      sources={sources}
      initialNodes={nodes}
      initialEdges={edges}
    />
  );
}