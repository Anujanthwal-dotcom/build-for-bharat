import { z } from "zod";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Source, DepthLevel } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";

export const GraphSchema = z.object({
  title: z.string().describe("A concise title for this mindmap project based on the context."),
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      summary: z.string(),
      category: z.enum(CATEGORIES),
      tags: z.array(z.string()).optional(),
    }),
  ),
  edges: z.array(
    z.object({
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

export function getDepthInstruction(depth: DepthLevel): string {
  switch (depth) {
    case "summary":
      return "Extract only the top 8-10 core concepts. Be concise and high-level.";
    case "deep":
      return "Extract 20-30+ concepts at deep granularity, including sub-topics, edge cases, and implementation details.";
    default:
      return "Extract 15-20 key concepts at standard depth, including main topics and notable sub-topics.";
  }
}

export function getDepthNodeLimit(depth: DepthLevel): number {
  switch (depth) {
    case "summary":
      return 10;
    case "deep":
      return 30;
    default:
      return 20;
  }
}

export async function extractMindMap(
  sources: Source[],
  depth: DepthLevel = "standard",
  systemInstructions?: string,
): Promise<ExtractedGraph> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing. Cannot generate mind map.");
  }

  try {
    const model = new ChatGoogle({
      model: "gemini-3.8-flash",
      temperature: 0,
      apiKey,
    });

    const structuredModel = model.withStructuredOutput(GraphSchema);

    const templateSection = systemInstructions
      ? `\nContent-type instructions (from the selected template — follow these closely):\n${systemInstructions}`
      : "";

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a technical concept extractor for mind-map generation.
Given source material, extract key technical concepts and their relationships as a hierarchical graph.
{depthInstruction}
Rules:
- Produce a title that summarizes the whole body of context.
- Nodes must form a connected DAG (directed acyclic graph)
- Edge source/target must reference valid node IDs
- Categories must be exactly one of: ${CATEGORIES.join(", ")}
- Every node must have at least one edge connecting it
- Summary must be lowercase-starting
- Limit the number of nodes per the depth instruction.
{templateSection}`,
      ],
      ["human", "{contextBundle}"],
    ]);

    const chain = prompt.pipe(structuredModel);

    const result = await chain.invoke({
      depthInstruction: getDepthInstruction(depth),
      templateSection,
      contextBundle: buildContextBundle(sources),
    });

    return result as ExtractedGraph;
  } catch (error) {
    console.error("AI extraction failed:", error);
    throw error;
  }
}