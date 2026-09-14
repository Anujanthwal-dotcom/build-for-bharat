export const APP_NAME = "MindFlow";
export const APP_TAGLINE = "Turn raw documentation into visual masterclasses.";

export const CATEGORY_COLORS: Record<string, string> = {
  core: "#8b5cf6",
  runtime: "#22d3ee",
  concept: "#3b82f6",
  tool: "#f59e0b",
  pattern: "#ec4899",
  api: "#34d399",
};

export const CATEGORY_LABELS: Record<string, string> = {
  core: "Core",
  runtime: "Runtime",
  concept: "Concept",
  tool: "Tool",
  pattern: "Pattern",
  api: "API",
};

export const DEPTH_LEVELS = [
  { value: "summary", label: "Summary", points: 8 },
  { value: "standard", label: "Standard", points: 16 },
  { value: "deep", label: "Deep Dive", points: 28 },
] as const;

export const PROJECT_GRADIENTS = [
  "from-violet-600/40 to-fuchsia-600/20",
  "from-cyan-500/40 to-blue-600/20",
  "from-emerald-500/40 to-teal-600/20",
  "from-amber-500/40 to-orange-600/20",
  "from-rose-500/40 to-pink-600/20",
  "from-indigo-500/40 to-purple-600/20",
] as const;