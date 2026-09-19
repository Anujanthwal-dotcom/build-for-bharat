import { z } from "zod";
import { ChatGoogle } from "@langchain/google";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview",
];

export async function extractMindMap(
  sources: Source[],
  depth: DepthLevel = "standard",
  systemInstructions?: string,
): Promise<ExtractedGraph> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is missing. Cannot generate mind map.");
  }

  const templateSection = systemInstructions
    ? `\nContent-type instructions (from the selected template — follow these closely):\n${systemInstructions}`
    : "";

  const depthInstruction = getDepthInstruction(depth);
  const contextBundle = buildContextBundle(sources);

  // Helper to run extraction with structured output
  const runStructuredFallback = async (modelName: string): Promise<ExtractedGraph> => {
    const fallbackModel = new ChatGoogle({
      model: modelName,
      temperature: 0,
      apiKey,
      maxRetries: 1,
    });

    const structuredModel = fallbackModel.withStructuredOutput(GraphSchema);

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
${templateSection}`,
      ],
      ["human", "{contextBundle}"],
    ]);

    const chain = prompt.pipe(structuredModel);
    return (await chain.invoke({
      depthInstruction,
      templateSection,
      contextBundle,
    })) as ExtractedGraph;
  };

  // Attempt 1: Extraction with Google Search Grounding enabled
  for (const modelName of GEMINI_MODELS) {
    try {
      const baseModel = new ChatGoogle({
        model: modelName,
        temperature: 0.1,
        apiKey,
        maxRetries: 1,
      });
      const searchModel = baseModel.bindTools([{ googleSearch: {} }]);

      const systemPrompt = `You are an elite technical architect and concept extractor for mind-map generation.
Given the provided source material, extract key technical concepts and their architectural relationships as a connected directed acyclic graph (DAG).
Use Google Search grounding to retrieve accurate technical details, verify modern best practices, and discover vital connecting components and relationships.

Depth instruction: ${depthInstruction}

Rules:
- Produce a title that summarizes the whole body of context.
- Nodes must form a connected DAG (directed acyclic graph)
- Edge source/target must reference valid node IDs
- Categories must be exactly one of: ${CATEGORIES.join(", ")}
- Every node must have at least one edge connecting it
- Summary must be lowercase-starting
- Limit the number of nodes per the depth instruction.
${templateSection}

Format your output strictly as a JSON object matching this schema (with no extra commentary, enclosed in \`\`\`json ... \`\`\`):
{
  "title": "A concise title for this mindmap project",
  "nodes": [
    {
      "id": "1",
      "label": "Concept Name",
      "summary": "lowercase-starting summary of the concept and its architectural role",
      "category": "core",
      "tags": ["tag1", "tag2"]
    }
  ],
  "edges": [
    {
      "source": "1",
      "target": "2",
      "label": "relationship label"
    }
  ]
}`;

      const userPrompt =
        contextBundle && contextBundle.trim()
          ? `Source material to analyze and map:\n${contextBundle}`
          : "Please research and build an architectural mind map on the project topic.";

      const response = await searchModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userPrompt),
      ]);

      const textContent =
        typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, textContent];
      const cleanJson = (jsonMatch[1] || textContent).trim();
      const parsedData = JSON.parse(cleanJson);

      return GraphSchema.parse(parsedData) as ExtractedGraph;
    } catch (searchError) {
      console.warn(
        `Search grounded extraction with ${modelName} failed, trying fallback:`,
        searchError instanceof Error ? searchError.message : searchError,
      );
      try {
        return await runStructuredFallback(modelName);
      } catch (structuredErr) {
        console.warn(`Structured fallback with ${modelName} also failed, trying next model:`, structuredErr);
      }
    }
  }

  throw new Error("Mind map generation failed across all available Gemini models.");
}

export interface GroundedSource {
  title: string;
  url: string;
}

export interface GroundedDeepDiveResult {
  explanation: string;
  analogy: string;
  gotcha: string;
  codeSnippet: string;
  sources: GroundedSource[];
  searchQueries?: string[];
  isGrounded: boolean;
  isAIGenerated?: boolean;
  statusNotice?: string;
}

export function getFallbackDeepDive(
  label: string,
  summary?: string,
  _category?: string,
): GroundedDeepDiveResult {
  void _category;
  const labelLower = label.toLowerCase();
  let codeSnippet = `// ${label} Core Implementation\nexport function execute${label.replace(/[^a-zA-Z0-9]/g, "")}() {\n  // 1. Initialize architectural context\n  const context = { timestamp: Date.now(), concept: "${label}" };\n  \n  // 2. Execute primary logic\n  console.log("Executing ${label} pipeline...", context);\n  return { success: true, processedAt: new Date().toISOString() };\n}`;
  let gotcha = `Watch out: Developers often confuse ${label} with surrounding pipeline stages. Ensure proper error boundary handling.`;
  let analogy = `Think of ${label} like an automated safety valve in a high-pressure hydraulic system — it regulates flow and prevents system halts.`;

  if (labelLower.includes("loop") || labelLower.includes("event") || labelLower.includes("async")) {
    codeSnippet = `// Tracing Event Loop execution order\nconsole.log("1. Synchronous script start");\n\nsetTimeout(() => {\n  console.log("4. Macrotask executed (timer callback)");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("3. Microtask executed (Promise resolution)");\n});\n\nconsole.log("2. Synchronous script end");\n// Console: 1 -> 2 -> 3 -> 4`;
    gotcha = "Microtasks drain continuously before the browser will paint or pick the next macrotask! Recursive microtasks starve UI rendering.";
    analogy = "An airport runway where emergency flights (microtasks) take off before regularly scheduled flights (macrotasks).";
  } else if (labelLower.includes("stack") || labelLower.includes("call")) {
    codeSnippet = `// Call stack trace observation\nfunction first() {\n  second();\n}\nfunction second() {\n  console.trace("Call Stack Snapshot");\n}\nfirst();`;
    gotcha = "Deep recursion without tail-call optimization exhausts stack frames, throwing 'Maximum call stack size exceeded'.";
    analogy = "A spring-loaded cafeteria tray dispenser — LIFO (Last In, First Out).";
  } else if (labelLower.includes("heap") || labelLower.includes("memory")) {
    codeSnippet = `// Heap allocation and retention\nclass ResourceRegistry {\n  private entries = new Map();\n  register(id: string, payload: Uint8Array) {\n    this.entries.set(id, payload); // Retained in heap\n  }\n}`;
    gotcha = "Unreleased event listeners and detached DOM nodes in closures block garbage collection.";
    analogy = "A spacious open warehouse with addressable storage bays for dynamic variables.";
  }

  return {
    explanation: summary || `Comprehensive architectural overview and execution semantics of ${label}.`,
    analogy,
    gotcha,
    codeSnippet,
    sources: [],
    searchQueries: [],
    isGrounded: false,
    isAIGenerated: false,
    statusNotice: "Offline heuristic fallback",
  };
}

export async function fetchGroundedNodeDeepDive(params: {
  label: string;
  summary?: string;
  category?: string;
  tags?: string[];
  projectTitle?: string;
}): Promise<GroundedDeepDiveResult> {
  const { label, summary, category, tags, projectTitle } = params;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return getFallbackDeepDive(label, summary, category);
  }

  const contextDesc = [
    projectTitle ? `Project context: "${projectTitle}"` : "",
    category ? `Architectural category: "${category}"` : "",
    summary ? `Concept summary: "${summary}"` : "",
    tags && tags.length ? `Related tags: ${tags.join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const promptText = `You are an elite software architect and technical educator.
Analyze the following concept deeply:
Concept: "${label}"
${contextDesc}

Provide authoritative architectural explanation, modern production code, critical gotchas, and official documentation reference links.
Format your final response strictly as a JSON object (inside a json markdown code block \`\`\`json ... \`\`\`):
{
  "explanation": "Clear, deep architectural breakdown of how this concept works in modern systems (2-3 sentences).",
  "analogy": "A brilliant, intuitive, real-world physical or everyday analogy that makes this instantly understandable.",
  "gotcha": "The most critical production pitfall, gotcha, or edge case developers must guard against when using this.",
  "codeSnippet": "Production-ready, clean, modern code snippet (in TypeScript/JavaScript, Rust, Go, or Python as appropriate) demonstrating this concept in action with explanatory comments.",
  "referenceLinks": [
    { "title": "Official Documentation or Guide Title", "url": "https://..." }
  ]
}`;

  // Helper to parse JSON from AI response
  const parseAIContent = (
    content: string | unknown,
  ): Partial<GroundedDeepDiveResult & { referenceLinks?: GroundedSource[] }> => {
    const textContent = typeof content === "string" ? content : JSON.stringify(content);
    try {
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, textContent];
      const cleanJson = (jsonMatch[1] || textContent).trim();
      return JSON.parse(cleanJson);
    } catch {
      return {};
    }
  };

  // Phase 1: Try with Google Search Grounding enabled
  for (const modelName of GEMINI_MODELS) {
    try {
      const baseModel = new ChatGoogle({
        model: modelName,
        temperature: 0.2,
        apiKey,
        maxRetries: 1,
      });
      const bound = baseModel.bindTools([{ googleSearch: {} }]);
      const res = await bound.invoke([new HumanMessage(promptText)]);

      const responseMetadata = res.response_metadata as Record<string, unknown> | undefined;
      const groundingMetadata = responseMetadata?.groundingMetadata as {
        webSearchQueries?: string[];
        groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
      } | undefined;

      const searchQueries: string[] = groundingMetadata?.webSearchQueries || [];
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      const sources: GroundedSource[] = [];
      const seenUrls = new Set<string>();

      for (const chunk of groundingChunks) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title || uri;
        if (uri && !seenUrls.has(uri)) {
          seenUrls.add(uri);
          sources.push({ title: title || uri, url: uri });
        }
      }

      const parsed = parseAIContent(res.content);
      if (parsed.referenceLinks) {
        for (const ref of parsed.referenceLinks) {
          if (ref.url && !seenUrls.has(ref.url)) {
            seenUrls.add(ref.url);
            sources.push(ref);
          }
        }
      }

      const fallback = getFallbackDeepDive(label, summary, category);
      return {
        explanation: parsed.explanation || summary || fallback.explanation,
        analogy: parsed.analogy || fallback.analogy,
        gotcha: parsed.gotcha || fallback.gotcha,
        codeSnippet: parsed.codeSnippet || fallback.codeSnippet,
        sources,
        searchQueries,
        isGrounded: sources.length > 0 || searchQueries.length > 0,
        isAIGenerated: true,
        statusNotice: sources.length > 0 ? "Grounded with Google Search" : "Generated by Gemini",
      };
    } catch (searchErr) {
      console.warn(`Search grounding with ${modelName} unavailable, falling back to direct AI generation:`, searchErr instanceof Error ? searchErr.message : searchErr);
      break; // Proceed to Phase 2
    }
  }

  // Phase 2: Direct Gemini generation without search tools (bypasses free tier search quota restriction)
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = new ChatGoogle({
        model: modelName,
        temperature: 0.2,
        apiKey,
        maxRetries: 1,
      });

      const res = await model.invoke([new HumanMessage(promptText)]);
      const parsed = parseAIContent(res.content);
      const sources: GroundedSource[] = parsed.referenceLinks || [];
      const fallback = getFallbackDeepDive(label, summary, category);

      return {
        explanation: parsed.explanation || summary || fallback.explanation,
        analogy: parsed.analogy || fallback.analogy,
        gotcha: parsed.gotcha || fallback.gotcha,
        codeSnippet: parsed.codeSnippet || fallback.codeSnippet,
        sources,
        searchQueries: [],
        isGrounded: false,
        isAIGenerated: true,
        statusNotice: "Generated by Gemini AI",
      };
    } catch (aiErr) {
      console.warn(`Direct AI generation with ${modelName} failed:`, aiErr instanceof Error ? aiErr.message : aiErr);
    }
  }

  // Phase 3: Final fallback to heuristic
  return getFallbackDeepDive(label, summary, category);
}