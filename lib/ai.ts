import { z } from "zod";
import type { GraphData, Source, DepthLevel } from "@/lib/types";
import { getMockGraph } from "@/lib/mock-data";

export const GraphSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      summary: z.string(),
      category: z.enum(["core", "runtime", "concept", "tool", "pattern", "api"]),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      label: z.string().optional(),
    }),
  ),
});

export type ExtractedGraph = z.infer<typeof GraphSchema>;

function buildContextBundle(sources: Source[]): string {
  return sources
    .map((source, index) => {
      const header = `[Source ${index + 1}] Type: ${source.type} | Label: ${source.label}`;
      return `${header}\n${source.content.slice(0, 3000)}\n`;
    })
    .join("\n---\n\n");
}

function buildPrompt(contextBundle: string, depth: DepthLevel): string {
  const depthInstruction =
    depth === "summary"
      ? "Extract only the top 8-10 core concepts. Be concise and high-level."
      : depth === "deep"
        ? "Extract 20-30+ concepts at deep granularity, including sub-topics, edge cases, and implementation details."
        : "Extract 15-20 key concepts at standard depth, including main topics and notable sub-topics.";

  return `You are a technical concept extractor for mind-map generation.

Given the following source material, extract key technical concepts and their relationships as a hierarchical graph.

${depthInstruction}

Return STRICT JSON matching this exact structure — no markdown fences, no commentary, only raw JSON:

{
  "nodes": [
    {
      "id": "<unique-number-as-string>",
      "label": "<short concept name, max 4 words>",
      "summary": "<one sentence explanation, max 80 chars>",
      "category": "<one of: core | runtime | concept | tool | pattern | api>"
    }
  ],
  "edges": [
    {
      "id": "e<source>-<target>",
      "source": "<source node id>",
      "target": "<target node id>",
      "label": "<short verb label, max 3 words>"
    }
  ]
}

Rules:
- Nodes must form a connected DAG (directed acyclic graph)
- Edge source/target must reference valid node IDs
- Categories must be exactly one of: core, runtime, concept, tool, pattern, api
- Every node must have at least one edge connecting it
- Summary must be lowercase-starting

SOURCE MATERIAL:
${contextBundle}`;
}

function detectTopic(sources: Source[]): string {
  const allText = sources.map((s) => s.content).join(" ").toLowerCase();
  if (allText.includes("react") || allText.includes("component") || allText.includes("jsx")) return "React";
  if (allText.includes("node.js") || allText.includes("nodejs") || allText.includes("event loop")) return "Node.js";
  if (allText.includes("docker") || allText.includes("container") || allText.includes("compose")) return "Docker";
  if (allText.includes("graphql") || allText.includes("schema") && allText.includes("resolver")) return "GraphQL";
  return "React";
}

export async function extractMindMap(
  sources: Source[],
  depth: DepthLevel = "standard",
): Promise<GraphData> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const topic = detectTopic(sources);
    return getMockGraph(topic);
  }

  try {
    const { generateObject } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    const openai = createOpenAI({ apiKey });
    const contextBundle = buildContextBundle(sources);
    const prompt = buildPrompt(contextBundle, depth);

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: GraphSchema,
      prompt,
    });

    return result.object;
  } catch (error) {
    console.error("AI extraction failed, falling back to mock:", error);
    const topic = detectTopic(sources);
    return getMockGraph(topic);
  }
}