import { prisma } from '@/lib/prisma';
import DashboardClient from './dashboard-client';
import { formatDistanceToNow } from 'date-fns';

export default async function DashboardPage() {
  const dbProjects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { nodes: true, sources: true }
      }
    }
  });

  const projects = dbProjects.map(p => ({
    id: p.id,
    name: p.name,
    nodesCount: p._count.nodes,
    sourcesCount: p._count.sources,
    lastEdited: formatDistanceToNow(new Date(p.updatedAt), { addSuffix: true })
  }));

  return <DashboardClient projects={projects} />;
}
