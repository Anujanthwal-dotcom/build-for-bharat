import { BookOpen, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white/90 tracking-tight">Documentation</h1>
            <p className="text-sm text-muted">Learn how to get the most out of MindFlow</p>
          </div>
        </div>

        <div className="space-y-4">
          {DOCS_SECTIONS.map((section) => (
            <details key={section.title} className="glass rounded-lg group" open={section.defaultOpen}>
              <summary className="flex items-center justify-between px-6 py-4 text-lg font-semibold text-white/90 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.emoji}</span>
                  {section.title}
                </div>
                <span className="text-muted flex-shrink-0 group-open:rotate-180 transition-transform duration-200">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </summary>
              <div className="px-6 pb-5 border-t border-white/5">
                <div className="prose prose-invert prose-base max-w-none mt-4 text-muted">
                  {section.items.map((item, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <h4 className="text-lg font-semibold text-white/80 mb-1">{item.title}</h4>
                      <p className="text-base text-muted leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="glass p-6 rounded-lg text-center space-y-3">
          <p className="text-sm text-muted">Need more help?</p>
          <Link
            href="https://github.com"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const DOCS_SECTIONS = [
  {
    title: "Getting Started",
    emoji: "🚀",
    defaultOpen: true,
    items: [
      {
        title: "Creating your first mindmap",
        content: "Click \"+ New Project\" on the dashboard to open the extraction window. Paste text, add URLs, or upload PDF/Markdown files. Choose a depth level, then click \"Build Mind Map\" to extract a knowledge graph. Alternatively, start from a content-type template in the Templates tab to get specialized extraction tailored to your source material.",
      },
      {
        title: "Source types",
        content: "MindFlow supports three source types: raw text and notes, URLs (web pages are automatically scraped and cleaned), and file uploads (PDF and Markdown). You can mix multiple sources in a single extraction.",
      },
      {
        title: "Depth levels",
        content: "Summary (8–10 nodes) gives a high-level topic map. Standard (15–20 nodes) balances breadth and detail. Deep Dive (20–30+ nodes) extracts sub-topics, edge cases, and implementation details. You can change the default in Settings, and each template pre-sets a recommended depth you can still override.",
      },
    ],
  },
  {
    title: "Working with Mindmaps",
    emoji: "🧠",
    defaultOpen: false,
    items: [
      {
        title: "Navigation",
        content: "Pan by dragging the canvas background. Zoom with scroll wheel or pinch gesture. Click any node to highlight it and see its summary. Click an outline entry in the right sidebar to jump to that node.",
      },
      {
        title: "Editing",
        content: "Drag nodes to reposition them. Edits are auto-saved after you stop moving nodes. A status indicator in the top bar shows Saved / Saving / Unsaved.",
      },
      {
        title: "Exporting",
        content: "Click the export menu (top bar) to download your mindmap as SVG, PNG, or Markdown. SVG preserves vector quality for presentations.",
      },
      {
        title: "Node categories",
        content: "Nodes are color-coded by category: Core (cream/accent) for central concepts, Memory (blue) for data and storage, Execution (emerald) for operations and processes, Concurrency (purple) for parallel/async work, and Default (gray) for uncategorized nodes.",
      },
      {
        title: "Regenerating",
        content: "If you want a different extraction, click \"Re-generate\" in the source inspector sidebar. This will re-extract the knowledge graph from your original sources.",
      },
    ],
  },
  {
    title: "Keyboard Shortcuts",
    emoji: "⌨️",
    defaultOpen: false,
    items: [
      {
        title: "Canvas navigation",
        content: "Ctrl/Cmd + S — Force save. L — Auto-layout (Dagre). F or 0 — Fit view to canvas. S — Toggle source inspector sidebar.",
      },
      {
        title: "Node editing",
        content: "Delete or Backspace — Remove selected node or edge.",
      },
      {
        title: "General",
        content: "Escape — Close modals and menus. Drag canvas background to pan. Scroll to zoom.",
      },
    ],
  },
  {
    title: "Settings",
    emoji: "⚙️",
    defaultOpen: false,
    items: [
      {
        title: "Default depth",
        content: "Set your preferred extraction depth (Summary, Standard, or Deep) in Settings → General. This becomes the default for new extractions. Templates pre-set a depth that matches their content type (e.g. Short-form Video defaults to Summary, Long Lecture to Deep Dive), but you can still override the slider when generating.",
      },
      {
        title: "Account",
        content: "MindFlow uses NextAuth (Google or email sign-in). Your account and all projects are scoped to your user. Use Settings → Danger Zone to permanently delete your account and all data.",
      },
    ],
  },
  {
    title: "Templates",
    emoji: "📦",
    defaultOpen: false,
    items: [
      {
        title: "Content-type templates",
        content: "Templates map to content types rather than topics. Built-in options include YouTube Video, Short-form Video, Long Lecture, Podcast / Audio, Research Paper, Technical Documentation, Meeting Notes, and Book / Chapter. Each carries specialized AI instructions that shape how the mindmap is extracted from your source material.",
      },
      {
        title: "How they work",
        content: "Click \"Use Template\" on any card to open the extraction window pre-configured for that content type. Add your own content — paste a transcript, drop in a URL, or upload files — then click \"Build Mind Map\". The model receives the template's specialized extraction instructions alongside your sources.",
      },
      {
        title: "Depth follows content length",
        content: "Long-form templates (Long Lecture, Research Paper, Book / Chapter) default to Deep Dive for rich, granular mindmaps. Short-form templates (Short-form Video, Meeting Notes) default to Summary for crisp, high-level maps. The depth slider is pre-set to the template's recommendation but remains adjustable per run.",
      },
      {
        title: "Custom templates",
        content: "Click \"Create Template\" to save your own reusable extraction recipes. Give it a name, description, tags, a default input mode and depth, and write the AI instructions that should be appended to the base extraction prompt for that content type. Custom templates are stored in your account and appear above the built-ins.",
      },
      {
        title: "Managing templates",
        content: "Hover a custom template card to reveal its delete button. Removing a custom template only deletes the template itself — any mindmaps already generated from it remain untouched.",
      },
    ],
  },
];