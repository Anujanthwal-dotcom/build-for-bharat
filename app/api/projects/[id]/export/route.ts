import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { exportToMarkdown, exportToSvgString } from "@/lib/export";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const format = request.nextUrl.searchParams.get("format") ?? "markdown";

  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await prisma.project.findFirst({
    where: { id, userId },
    include: { nodes: true, edges: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const graph = {
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
  };

  const filename = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (format === "svg") {
    const svg = exportToSvgString(graph);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${filename || "mindmap"}.svg"`,
      },
    });
  }

  const markdown = exportToMarkdown(graph);
  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename || "mindmap"}.md"`,
    },
  });
}