import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import dagre from '@dagrejs/dagre';

const GraphSchema = z.object({
  title: z.string().describe("A concise title for this masterclass project based on the context."),
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    summary: z.string(),
    category: z.enum(["core", "memory", "execution", "concurrency", "default"]),
    tags: z.array(z.string()).optional()
  })),
  edges: z.array(z.object({
    source: z.string(),
    target: z.string(),
    label: z.string().optional()
  }))
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Fetch project and sources
    const project = await prisma.project.findUnique({
      where: { id },
      include: { sources: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Combine source content
    const combinedContent = project.sources.map(s => `[SOURCE: ${s.label}]\n${s.content}`).join('\n\n');

    let graphData;

    if (!process.env.OPENAI_API_KEY) {
      // Fallback for hackathon without API key
      console.warn("No OPENAI_API_KEY found, using fallback data.");
      graphData = {
        title: "Mock Architecture",
        nodes: [
          { id: "1", label: "Core System", summary: "The main core", category: "core", tags: ["Core"] },
          { id: "2", label: "Memory Component", summary: "Handles memory", category: "memory", tags: ["RAM"] },
        ],
        edges: [
          { source: "1", target: "2", label: "allocates" }
        ]
      };
    } else {
      // Prompt LLM
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: GraphSchema,
        prompt: `You are an expert technical architect. Extract a highly structured mind map from the following raw documentation. Identify key concepts as nodes and their relationships as edges. Be concise. Limit to max 15 nodes for clarity.\n\nContent:\n${combinedContent.substring(0, 30000)}`
      });
      graphData = result.object;
    }

    // Update project title
    await prisma.project.update({
      where: { id },
      data: { name: graphData.title }
    });

    // Run Dagre for layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', align: 'UL', ranksep: 100, nodesep: 50 });
    g.setDefaultEdgeLabel(() => ({}));

    graphData.nodes.forEach((node: any) => {
      // Approximate node dimensions
      g.setNode(node.id, { width: 250, height: 120 });
    });

    graphData.edges.forEach((edge: any) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // Prepare nodes with coordinates
    const nodesToSave = graphData.nodes.map((n: any) => {
      const layoutNode = g.node(n.id);
      return {
        nodeId: n.id,
        label: n.label,
        summary: n.summary,
        category: n.category,
        x: layoutNode.x - 125, // center offset
        y: layoutNode.y - 60,
        projectId: id,
      };
    });

    const edgesToSave = graphData.edges.map((e: any, i: number) => ({
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
    await prisma.mindNode.createMany({ data: nodesToSave });
    await prisma.mindEdge.createMany({ data: edgesToSave });

    return NextResponse.json({ success: true, project: graphData.title });

  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
