import { prisma } from '@/lib/prisma';
import CanvasClient from './canvas-client';
import { notFound } from 'next/navigation';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let project;
  let nodes = [];
  let edges = [];

  if (id === 'mock-123') {
    project = { name: 'V8 Engine Internals', _count: { sources: 3 } };
    nodes = [
      { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'V8 Engine', summary: 'Google\'s open source high-performance JavaScript engine.', category: 'core', tags: ['C++', 'Runtime'] } },
      { id: '2', type: 'custom', position: { x: 100, y: 200 }, data: { label: 'Memory Heap', summary: 'Where memory allocation happens.', category: 'memory', tags: ['Allocation'] } },
    ];
    edges = [
      { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true, data: { label: 'contains' } },
    ];
  } else {
    const dbProject = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { sources: true } },
        nodes: true,
        edges: true,
      }
    });

    if (!dbProject) return notFound();
    
    project = dbProject;
    
    nodes = dbProject.nodes.map(n => ({
      id: n.nodeId,
      type: 'custom',
      position: { x: n.x || 0, y: n.y || 0 },
      data: {
        label: n.label,
        summary: n.summary,
        category: n.category,
      }
    }));

    edges = dbProject.edges.map(e => ({
      id: e.edgeId,
      source: e.source,
      target: e.target,
      type: 'custom',
      animated: true,
      data: { label: e.label }
    }));
  }

  return (
    <CanvasClient 
      project={{ name: project.name, sourcesCount: project._count.sources }}
      initialNodes={nodes}
      initialEdges={edges}
    />
  );
}
