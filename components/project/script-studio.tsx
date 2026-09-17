"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Film,
  Sparkles,
  Code2,
  Clock,
  Download,
  Volume2,
  VolumeX,
  Type,
  Video,
  Layers,
} from "lucide-react";
import {
  generateSemanticCreatorScript,
  type CreatorScript,
  type ScriptLanguage,
  type ScriptTone,
} from "@/lib/creator-script";
import type { Node, Edge } from "@xyflow/react";

interface ScriptStudioProps {
  script: CreatorScript | null;
  projectName: string;
  nodes?: Node[];
  edges?: Edge[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export function ScriptStudio({
  script,
  projectName,
  nodes = [],
  edges = [],
  isOpen,
  onClose,
  onSelectNode,
}: ScriptStudioProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<ScriptLanguage>("english");
  const [selectedTone, setSelectedTone] = useState<ScriptTone>("creator");
  const [copied, setCopied] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(1);
  const [teleprompterFontSize, setTeleprompterFontSize] = useState<"sm" | "md" | "lg">("md");
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<"cards" | "teleprompter" | "markdown">("cards");

  const teleprompterRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Stop speech synthesis on modal close or tab change
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsAutoScrolling(false);
    }
  }, [isOpen, stopSpeech]);

  // Extract nodes and edges
  const extractedNodes = useMemo(
    () =>
      nodes.map((n) => {
        const d = n.data as Record<string, unknown>;
        return {
          id: n.id,
          label: (d.label as string) ?? n.id,
          summary: (d.summary as string) ?? "",
          category: (d.category as string) ?? "core",
          tags: (d.tags as string[]) ?? [],
        };
      }),
    [nodes],
  );

  const extractedEdges = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: ((e.data as Record<string, unknown> | undefined)?.label as string) ?? "",
      })),
    [edges],
  );

  // Dynamic script generation based on chosen Language & Tone
  const activeScript = useMemo(() => {
    if (extractedNodes.length > 0) {
      return generateSemanticCreatorScript(projectName, extractedNodes, extractedEdges, {
        language: selectedLanguage,
        tone: selectedTone,
      });
    }
    return (
      script ||
      generateSemanticCreatorScript(projectName, [], [], {
        language: selectedLanguage,
        tone: selectedTone,
      })
    );
  }, [projectName, extractedNodes, extractedEdges, selectedLanguage, selectedTone, script]);

  // Teleprompter Auto-scroll
  useEffect(() => {
    if (!isAutoScrolling || activeTab !== "teleprompter") {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
      return;
    }

    const scrollContainer = teleprompterRef.current;
    if (!scrollContainer) return;

    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      const pixelsPerSecond = 32 * teleprompterSpeed;
      scrollContainer.scrollTop += pixelsPerSecond * delta;

      if (
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 20
      ) {
        setIsAutoScrolling(false);
        return;
      }

      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isAutoScrolling, activeTab, teleprompterSpeed]);

  // Read Aloud (Text-to-Speech)
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();

    const spokenText = `${activeScript.hook}. ${activeScript.premise}. ` +
      activeScript.sections
        .map(
          (s, i) =>
            `Scene ${i + 1}: ${s.concept}. ${s.talkingPoints}. Analogy: ${s.analogy}.`,
        )
        .join(" ") +
      ` ${activeScript.outro}`;

    const cleanText = spokenText.replace(/\[pause\]/gi, " ... ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = selectedTone === "tactical" ? 1.15 : 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (selectedLanguage === "hindi") {
      const hiVoice = voices.find((v) => v.lang.startsWith("hi"));
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = "hi-IN";
    } else if (selectedLanguage === "hinglish") {
      const inVoice =
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.startsWith("hi"));
      if (inVoice) utterance.voice = inVoice;
      utterance.lang = "en-IN";
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = "en-US";
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(activeScript.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySceneCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSceneIndex(index);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([activeScript.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-${selectedLanguage}-${selectedTone}-script.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in font-sans">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-white/10 bg-[#0d0d11] shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between border-b border-white/10 px-6 py-3.5 bg-white/[0.02] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent">
              <Film className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Creator Script & Lecture Studio
                </h2>
                <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted">
                  ~{activeScript.durationMinutes} mins
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted">
                Humanised Narrative for {projectName}
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === "cards"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Scene Cards
            </button>
            <button
              onClick={() => setActiveTab("teleprompter")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === "teleprompter"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Teleprompter
            </button>
            <button
              onClick={() => setActiveTab("markdown")}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === "markdown"
                  ? "bg-accent text-black font-medium shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              Markdown
            </button>
          </div>

          {/* Actions: Listen Aloud, Copy, Export, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                isSpeaking
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                  : "bg-white/5 text-muted hover:text-white border-white/10"
              }`}
              title={isSpeaking ? "Pause Audio Speech" : "Listen to Script (Read Aloud)"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" /> Stop Audio
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-accent" /> Listen Aloud
                </>
              )}
            </button>

            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 rounded text-muted hover:text-white transition-colors cursor-pointer"
              title="Copy Markdown to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>

            <button
              onClick={downloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 rounded text-muted hover:text-white transition-colors cursor-pointer"
              title="Download Markdown file"
            >
              <Download className="h-3 w-3" /> Export
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-muted hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Secondary Bar: Language & Tone Selection */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              Language:
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-white/5 border border-white/10">
              <button
                onClick={() => setSelectedLanguage("english")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedLanguage === "english"
                    ? "bg-accent text-black font-medium"
                    : "text-muted hover:text-white"
                }`}
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => setSelectedLanguage("hinglish")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedLanguage === "hinglish"
                    ? "bg-accent text-black font-medium"
                    : "text-muted hover:text-white"
                }`}
              >
                🇮🇳 Hinglish
              </button>
              <button
                onClick={() => setSelectedLanguage("hindi")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedLanguage === "hindi"
                    ? "bg-accent text-black font-medium"
                    : "text-muted hover:text-white"
                }`}
              >
                🕉️ हिंदी (Hindi)
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              Style & Tone:
            </span>
            <div className="inline-flex rounded-lg p-0.5 bg-white/5 border border-white/10">
              <button
                onClick={() => setSelectedTone("creator")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedTone === "creator"
                    ? "bg-white/20 text-white font-medium"
                    : "text-muted hover:text-white"
                }`}
                title="Conversational, high-retention, YouTube creator style"
              >
                🎙️ YouTuber
              </button>
              <button
                onClick={() => setSelectedTone("architect")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedTone === "architect"
                    ? "bg-white/20 text-white font-medium"
                    : "text-muted hover:text-white"
                }`}
                title="Technical deep-dive, trade-offs, architecture masterclass"
              >
                👨‍🏫 Architect
              </button>
              <button
                onClick={() => setSelectedTone("tactical")}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  selectedTone === "tactical"
                    ? "bg-white/20 text-white font-medium"
                    : "text-muted hover:text-white"
                }`}
                title="Crisp, rapid-fire, code-first breakdown"
              >
                ⚡ Tactical
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {activeTab === "cards" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Hook Banner */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5" /> High-Retention Opening Hook (0:00 - 0:15)
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    Style: {selectedTone.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-white italic leading-relaxed">
                  &ldquo;{activeScript.hook}&rdquo;
                </p>
                <div className="flex items-center gap-4 text-[11px] font-mono text-muted pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted" /> Target Audience: {activeScript.targetAudience}
                  </span>
                </div>
              </div>

              {/* Premise */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                <span className="font-mono text-xs font-semibold text-muted uppercase tracking-wider">
                  Educational Core Premise
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  {activeScript.premise}
                </p>
              </div>

              {/* Scene Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" /> Scene Breakdown ({activeScript.sections.length} Concepts)
                  </h3>
                  <span className="text-[11px] font-mono text-muted">
                    Language: {selectedLanguage.toUpperCase()}
                  </span>
                </div>

                {activeScript.sections.map((section, idx) => (
                  <div
                    key={section.nodeId || idx}
                    className="rounded-xl border border-white/10 bg-[#121216] p-5 space-y-4 hover:border-white/20 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-mono text-xs text-zinc-300 font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{section.concept}</h4>
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400 uppercase">
                          {section.category}
                        </span>
                        <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted">
                          {section.timecode}
                        </span>
                      </div>

                      {onSelectNode && (
                        <button
                          onClick={() => {
                            onSelectNode(section.nodeId);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 text-xs font-mono text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          <Play className="h-3 w-3 text-accent" /> Focus on Canvas
                        </button>
                      )}
                    </div>

                    {/* Visual Camera / Director Note */}
                    <div className="text-xs font-mono text-zinc-300 bg-white/[0.03] p-2.5 rounded-lg border border-white/10 flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{section.visualAction}</span>
                    </div>

                    {/* Spoken Delivery Script */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase flex items-center gap-1.5">
                        🎙️ Spoken Script Delivery:
                      </span>
                      <p className="text-xs text-zinc-200 leading-relaxed font-sans bg-black/30 p-3.5 rounded-lg border border-white/5">
                        {section.talkingPoints}
                      </p>
                    </div>

                    {/* Student Analogy */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-accent font-semibold uppercase">
                        💡 Student Analogy:
                      </span>
                      <p className="text-xs text-zinc-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-lg border border-white/10">
                        {section.analogy}
                      </p>
                    </div>

                    {/* Technical Code Snippet */}
                    {section.codeSnippet && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase flex items-center gap-1">
                            <Code2 className="h-3 w-3 text-muted" /> Code Implementation:
                          </span>
                          <button
                            onClick={() => copySceneCode(section.codeSnippet!, idx)}
                            className="flex items-center gap-1 text-[10px] font-mono text-muted hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            {copiedSceneIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono text-zinc-300 bg-black/60 p-3 rounded-lg border border-white/5 overflow-x-auto">
                          {section.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* Gotcha & Audience Prompt */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {section.gotcha && (
                        <div className="text-[11px] text-amber-200 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
                          <span className="font-semibold block mb-0.5">⚠️ Pitfall to highlight:</span>
                          {section.gotcha}
                        </div>
                      )}
                      {section.audiencePrompt && (
                        <div className="text-[11px] text-zinc-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/10 leading-relaxed">
                          <span className="font-semibold block mb-0.5 text-accent">💬 Question for Viewers:</span>
                          {section.audiencePrompt}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Outro */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
                <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
                  🏁 Video Outro & Call to Action
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans italic">
                  &ldquo;{activeScript.outro}&rdquo;
                </p>
              </div>
            </div>
          )}

          {activeTab === "teleprompter" && (
            <div className="max-w-3xl mx-auto py-4 space-y-6">
              {/* Teleprompter Floating Control Strip */}
              <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#121216]/95 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                      isAutoScrolling
                        ? "bg-amber-500 text-black font-semibold"
                        : "bg-accent text-black hover:bg-accent/90"
                    }`}
                  >
                    {isAutoScrolling ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause Scroll
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Start Auto-Scroll
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0;
                    }}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                    title="Reset to top"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-muted">
                  <div className="flex items-center gap-1.5">
                    <span>Speed:</span>
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setTeleprompterSpeed(s)}
                        className={`px-1.5 py-0.5 rounded text-[11px] cursor-pointer ${
                          teleprompterSpeed === s
                            ? "bg-white/20 text-white font-bold"
                            : "text-muted hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 border-l border-white/10 pl-3">
                    <Type className="w-3 h-3 text-muted" />
                    {(["sm", "md", "lg"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setTeleprompterFontSize(size)}
                        className={`px-1.5 py-0.5 rounded text-[11px] uppercase cursor-pointer ${
                          teleprompterFontSize === size
                            ? "bg-white/20 text-white font-bold"
                            : "text-muted hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teleprompter Scrolling Body */}
              <div
                ref={teleprompterRef}
                className={`max-h-[60vh] overflow-y-auto space-y-8 text-left p-6 rounded-2xl bg-black/40 border border-white/5 leading-relaxed font-sans scrollbar-thin ${
                  teleprompterFontSize === "sm"
                    ? "text-sm"
                    : teleprompterFontSize === "lg"
                    ? "text-xl font-medium"
                    : "text-base"
                }`}
              >
                {/* Hook */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-wider block">
                    [0:00 - 0:15 Opening Hook]
                  </span>
                  <p className="text-white/95 font-semibold italic">
                    &ldquo;{activeScript.hook}&rdquo;
                  </p>
                </div>

                {/* Premise */}
                <div className="text-muted text-sm italic">
                  {activeScript.premise}
                </div>

                {/* Scenes */}
                {activeScript.sections.map((sec, i) => (
                  <div key={i} className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-accent font-bold">
                        Scene {i + 1}: {sec.concept} ({sec.timecode})
                      </span>
                      <span className="text-[10px] font-mono text-muted uppercase">
                        {sec.visualAction}
                      </span>
                    </div>

                    <p className="text-zinc-100 leading-relaxed font-sans">
                      {sec.talkingPoints}
                    </p>

                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                      <span className="font-bold text-accent block mb-0.5">Analogy:</span>
                      {sec.analogy}
                    </div>

                    {sec.codeSnippet && (
                      <pre className="text-[11px] font-mono text-zinc-300 bg-black/60 p-3 rounded border border-white/5">
                        {sec.codeSnippet}
                      </pre>
                    )}
                  </div>
                ))}

                {/* Outro */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-wider block">
                    [Final 30s Outro]
                  </span>
                  <p className="text-white/95 font-semibold italic">
                    &ldquo;{activeScript.outro}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "markdown" && (
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted">
                  Full Markdown Script Representation ({selectedLanguage.toUpperCase()})
                </span>
                <button
                  onClick={copyMarkdown}
                  className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Markdown
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed scrollbar-thin max-h-[65vh]">
                {activeScript.markdown}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
