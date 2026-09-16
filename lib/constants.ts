export const APP_NAME = "MindFlow";
export const APP_TAGLINE = "Turn raw documentation into visual mindmaps.";

export const CATEGORIES = ["core", "memory", "execution", "concurrency", "default"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  core: "bg-accent/20 text-accent border-accent/30",
  memory: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  execution: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  concurrency: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  default: "bg-white/10 text-white/80 border-white/20",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  core: "Core",
  memory: "Memory",
  execution: "Execution",
  concurrency: "Concurrency",
  default: "Default",
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

export const TEMPLATE_CATEGORIES = ["video", "lecture", "document", "meeting", "custom"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  video: "Video",
  lecture: "Lecture / Audio",
  document: "Document",
  meeting: "Meeting",
  custom: "Custom",
};

export const TEMPLATE_BUILDERS = [
  { label: "YouTube Video", depth: "standard" },
  { label: "Short-form Video", depth: "summary" },
  { label: "Long Lecture", depth: "deep" },
  { label: "Podcast / Audio", depth: "standard" },
  { label: "Research Paper", depth: "deep" },
  { label: "Technical Doc", depth: "standard" },
  { label: "Meeting Notes", depth: "summary" },
  { label: "Book / Chapter", depth: "deep" },
] as const;

export interface TemplateDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  category: TemplateCategory;
  systemInstructions: string;
  defaultDepth: "summary" | "standard" | "deep";
  suggestedInput: "url" | "text" | "file" | "any";
  isCustom: boolean;
}

export interface CustomTemplateRecord {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  systemInstructions: string;
  defaultDepth: "summary" | "standard" | "deep";
  suggestedInput: "url" | "text" | "file" | "any";
}

export const BUILTIN_TEMPLATES: TemplateDef[] = [
  {
    id: "youtube-video",
    name: "YouTube Video",
    emoji: "🎬",
    description: "Turn a YouTube video transcript into a structured mindmap of the video's key topics, arguments, and takeaways.",
    tags: ["video", "education", "shorts"],
    category: "video",
    defaultDepth: "standard",
    suggestedInput: "url",
    isCustom: false,
    systemInstructions:
      "This is a YouTube video. Extract the video's core message, key topics in chronological order, main arguments or examples the creator makes, and actionable takeaways. Capture the narrative structure: introduction, major sections, and conclusion. Do not invent timestamps; focus on conceptual structure over chronology.",
  },
  {
    id: "short-form-video",
    name: "Short-form Video",
    emoji: "⚡",
    description: "Distill short videos (Shorts, Reels, TikTok) into a crisp mindmap — just the essential points, no fluff.",
    tags: ["video", "shorts", "quick"],
    category: "video",
    defaultDepth: "summary",
    suggestedInput: "url",
    isCustom: false,
    systemInstructions:
      "This is a short-form video (Shorts/Reels/TikTok). Extract only the 4-8 most essential points. Be extremely concise — short-form content has a single big idea with a few supporting hooks. Avoid redundant detail and sub-topics. Keep summaries to one short phrase each.",
  },
  {
    id: "long-lecture",
    name: "Long Lecture",
    emoji: "🎓",
    description: "Deep-dive a full lecture or course — prerequisites, concepts, sub-topics, examples, and open questions.",
    tags: ["lecture", "education", "course"],
    category: "lecture",
    defaultDepth: "deep",
    suggestedInput: "text",
    isCustom: false,
    systemInstructions:
      "This is a long-form lecture or course content. Extract at maximum depth: topic hierarchy, prerequisites, core concepts, sub-topics, definitions, examples, and any conclusions or open questions. Preserve the pedagogical flow — build nodes from foundational concepts to advanced ones. Include edge labels that reflect relation types like 'builds-on', 'illustrates', or 'contradicts' where clear.",
  },
  {
    id: "podcast-audio",
    name: "Podcast / Audio",
    emoji: "🎙️",
    description: "Structure a podcast or audio transcript — speakers, topics discussed, opinions, and key quotes.",
    tags: ["podcast", "audio", "interview"],
    category: "lecture",
    defaultDepth: "standard",
    suggestedInput: "file",
    isCustom: false,
    systemInstructions:
      "This is a podcast or audio transcript, possibly with multiple speakers. Extract the main discussion threads, distinct topics covered, differing viewpoints, and notable takeaways or quotes. Structure by topic theme rather than speaker turn order. Focus on substance; skip greetings, off-topic banter, and filler.",
  },
  {
    id: "research-paper",
    name: "Research Paper",
    emoji: "📄",
    description: "Extract a paper's problem, methodology, experiments, findings, and limitations into a scientific mindmap.",
    tags: ["research", "paper", "academic"],
    category: "document",
    defaultDepth: "deep",
    suggestedInput: "file",
    isCustom: false,
    systemInstructions:
      "This is an academic paper or research document. Extract deep-granularity detail: the problem statement, proposed method, key components of the approach, experimental setup, datasets, evaluation metrics, results, ablations, limitations, and conclusions. Categories should reflect the scientific structure. Preserve causal and dependency edges between concepts.",
  },
  {
    id: "technical-doc",
    name: "Technical Documentation",
    emoji: "📘",
    description: "Summarize docs, guides, or READMEs — APIs, components, patterns, and dependencies.",
    tags: ["docs", "api", "reference"],
    category: "document",
    defaultDepth: "standard",
    suggestedInput: "url",
    isCustom: false,
    systemInstructions:
      "This is technical documentation or a guide. Extract the architecture, key components, APIs, entity relationships, configuration, and common usage patterns. Nodes should represent concrete components or concepts with 'uses', 'depends-on', and 'implements' edges where clear. Be precise and faithful to the actual documented behavior.",
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    emoji: "📝",
    description: "Turn meeting minutes into an action map — decisions, action items, owners, and deadlines.",
    tags: ["meeting", "notes", "productivity"],
    category: "meeting",
    defaultDepth: "summary",
    suggestedInput: "text",
    isCustom: false,
    systemInstructions:
      "This is a meeting transcript or notes. Extract the decisions made, action items, owners, deadlines, discussion topics, and open questions. Keep it crisp and high-level — focus on outcomes over raw discussion. Use edge labels to show ownership ('assigned-to'), decisions ('decided'), and dependencies ('blocks').",
  },
  {
    id: "book-chapter",
    name: "Book / Chapter",
    emoji: "📚",
    description: "Map a book or chapter — themes, arguments, structure, and key concepts.",
    tags: ["book", "reading", "longform"],
    category: "lecture",
    defaultDepth: "deep",
    suggestedInput: "file",
    isCustom: false,
    systemInstructions:
      "This is a book, chapter, or long-form written content. Extract the overall thesis, chapter or section structure, main arguments, supporting concepts, examples, and conclusions. Preserve logical chains — how each idea builds on previous ones. Deep granularity is expected: include sub-concepts and notable illustrative details.",
  },
];