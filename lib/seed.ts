import { prisma } from "@/lib/db";
import { MOCK_PROJECTS, getMockGraphForProject } from "@/lib/mock-data";

let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const count = await prisma.project.count();
  if (count > 0) {
    seeded = true;
    return;
  }

  const user = await prisma.user.upsert({
    where: { email: "alex@mindflow.dev" },
    create: {
      id: "mock-user-1",
      name: "Alex Rivera",
      email: "alex@mindflow.dev",
    },
    update: {},
  });

  for (const project of MOCK_PROJECTS) {
    const graph = getMockGraphForProject(project.id);

    await prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        userId: user.id,
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        sources: {
          create: (project.sources ?? []).map((source) => ({
            id: source.id,
            type: source.type,
            content: source.content,
            label: source.label,
          })),
        },
        nodes: {
          create: graph.nodes.map((node) => ({
            nodeId: node.id,
            label: node.label,
            summary: node.summary,
            category: node.category,
          })),
        },
        edges: {
          create: graph.edges.map((edge) => ({
            edgeId: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
          })),
        },
      },
    });
  }

  seeded = true;
}