"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Play,
  Film,
  Sparkles,
  Code2,
  Clock,
  Download,
} from "lucide-react";
import type { CreatorScript } from "@/lib/creator-script";

interface ScriptStudioProps {
  script: CreatorScript | null;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export function ScriptStudio({
  script,
  projectName,
  isOpen,
  onClose,
  onSelectNode,
}: ScriptStudioProps) {
  const [copied, setCopied] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState<"cards" | "teleprompter" | "markdown">("cards");

  if (!isOpen) return null;

  const contentToDisplay = script || {
    title: `${projectName} Masterclass`,
    targetAudience: "Developers & Software Engineers",
    durationMinutes: 15,
    hook: `Stop guessing how ${projectName} works under the hood. In this masterclass, we break it down visually.`,
    premise: `Understanding ${projectName} is essential for building scalable, high-performance systems.`,
    sections: [],
    outro: `And that is the complete architectural walkthrough for ${projectName}!`,
    markdown: `# Masterclass Script: ${projectName}\n\nNo script generated yet.`,
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(contentToDisplay.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([contentToDisplay.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-masterclass-script.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#0d0d11] shadow-2xl overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent">
              <Film className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Creator Script & Lecture Studio
                </h2>
                <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted">
                  ~{contentToDisplay.durationMinutes} mins
                </span>
              </div>
              <p className="text-xs font-mono text-muted">
                AI-Generated Technical Narrative for {projectName}
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === "cards"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Scene Cards
            </button>
            <button
              onClick={() => setActiveTab("teleprompter")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === "teleprompter"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Teleprompter
            </button>
            <button
              onClick={() => setActiveTab("markdown")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                activeTab === "markdown"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Markdown
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy Script"}
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
              title="Download Markdown"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "cards" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Hook Banner */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <span className="flex items-center gap-2 font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" /> High-Retention Video Hook (0:00 - 0:15)
                </span>
                <p className="text-sm font-medium text-white italic leading-relaxed">
                  &ldquo;{contentToDisplay.hook}&rdquo;
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted" /> Audience: {contentToDisplay.targetAudience}
                  </span>
                </div>
              </div>

              {/* Premise */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
                <span className="font-mono text-xs font-semibold text-muted uppercase tracking-wider">
                  Educational Core Thesis
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  {contentToDisplay.premise}
                </p>
              </div>

              {/* Scene Breakdown */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                  Scene-by-Scene Teaching Guide ({contentToDisplay.sections.length} Scenes)
                </h3>

                {contentToDisplay.sections.map((section, idx) => (
                  <div
                    key={section.nodeId || idx}
                    className="rounded-xl border border-white/10 bg-[#121216] p-5 space-y-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-mono text-xs text-zinc-300 font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{section.concept}</h4>
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400 uppercase">
                          {section.category}
                        </span>
                      </div>

                      {onSelectNode && (
                        <button
                          onClick={() => {
                            onSelectNode(section.nodeId);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded transition-colors"
                        >
                          <Play className="h-3 w-3" /> Focus Node on Canvas
                        </button>
                      )}
                    </div>

                    <div className="text-xs font-mono text-zinc-300 bg-white/[0.03] p-2.5 rounded-lg border border-white/10 flex items-center gap-2">
                      <Film className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{section.visualAction}</span>
                    </div>

                    {/* Spoken Script */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">
                        🎙️ Spoken Script:
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-black/30 p-3 rounded-lg border border-white/5">
                        {section.talkingPoints}
                      </p>
                    </div>

                    {/* Analogy */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-accent font-semibold uppercase">
                        💡 Student Analogy:
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                        {section.analogy}
                      </p>
                    </div>

                    {/* Code Snippet */}
                    {section.codeSnippet && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase flex items-center gap-1">
                          <Code2 className="h-3 w-3 text-muted" /> Code Example:
                        </span>
                        <pre className="text-[11px] font-mono text-zinc-300 bg-black/60 p-3 rounded-lg border border-white/5 overflow-x-auto">
                          {section.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Outro */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                  🏁 Video Outro & Call to Action
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans italic">
                  &ldquo;{contentToDisplay.outro}&rdquo;
                </p>
              </div>
            </div>
          )}

          {activeTab === "teleprompter" && (
            <div className="max-w-2xl mx-auto py-8 space-y-8 text-center">
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full font-mono text-xs text-zinc-400">
                <span>Speed: {teleprompterSpeed}x</span>
                <button
                  onClick={() => setTeleprompterSpeed((s) => (s === 2 ? 0.5 : s + 0.5))}
                  className="text-accent hover:text-white"
                >
                  Adjust
                </button>
              </div>

              <div className="space-y-6 text-left">
                <div className="text-lg font-bold text-white/90">
                  &ldquo;{contentToDisplay.hook}&rdquo;
                </div>

                {contentToDisplay.sections.map((sec, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="font-mono text-xs text-accent font-bold block">
                      [Scene {i + 1}: {sec.concept}]
                    </span>
                    <p className="text-base text-zinc-100 leading-relaxed font-sans">
                      {sec.talkingPoints}
                    </p>
                    <p className="text-sm text-zinc-300 italic">
                      Analogy: {sec.analogy}
                    </p>
                  </div>
                ))}

                <div className="text-lg font-semibold text-emerald-300">
                  &ldquo;{contentToDisplay.outro}&rdquo;
                </div>
              </div>
            </div>
          )}

          {activeTab === "markdown" && (
            <div className="max-w-4xl mx-auto">
              <pre className="text-xs font-mono text-zinc-300 bg-black/60 p-6 rounded-xl border border-white/10 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {contentToDisplay.markdown}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
