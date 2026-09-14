"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ClipboardType,
  FileCog,
  Layers,
  Loader2,
  Map as MapIcon,
  Play,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassTextarea } from "@/components/ui/glass-input";
import { ONBOARDING_EXAMPLE_TEXT, MOCK_GRAPHS } from "@/lib/mock-data";
import { MiniMapPreview } from "@/components/mindmap/minimap-preview";
import { useAuth } from "@/components/auth/auth-provider";
import { CATEGORY_COLORS } from "@/lib/constants";

const TOUR_KEY = "mindflow_tour_completed";

const TOUR_STEPS = ["Welcome", "The Dump", "Generation", "Preview", "Finish"];

const SYNTHESIS_MESSAGES = [
  "Chunking raw documentation…",
  "Extracting key concepts…",
  "Mapping relationships…",
  "Clustering nodes by category…",
  "Building visual hierarchy…",
];

export function TourOverlay() {
  const router = useRouter();
  const { status } = useAuth();
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(() => {
    try {
      return status === "authenticated" && localStorage.getItem(TOUR_KEY) !== "true";
    } catch {
      return false;
    }
  });
  const [text, setText] = useState("");
  const [synthesis, setSynthesis] = useState(0);
  const [synthesizing, setSynthesizing] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const finishTour = () => {
    try {
      localStorage.setItem(TOUR_KEY, "true");
    } catch {}
    setShow(false);
    router.push("/dashboard");
  };

  const skipTour = () => {
    setSkipped(true);
    try {
      localStorage.setItem(TOUR_KEY, "true");
    } catch {}
    router.push("/dashboard");
  };

  const loadExample = () => setText(ONBOARDING_EXAMPLE_TEXT);

  const startGeneration = () => {
    setSynthesizing(true);
    setSynthesis(0);
    const interval = setInterval(() => {
      setSynthesis((current) => {
        if (current >= SYNTHESIS_MESSAGES.length - 1) {
          clearInterval(interval);
          setSynthesizing(false);
          setStep(3);
          return current;
        }
        return current + 1;
      });
    }, 700);
  };

  if (!show || skipped) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="glass-card relative w-full max-w-lg animate-fade-in-up rounded-2xl p-6 shadow-glass-lg">
        <button
          onClick={skipTour}
          className="absolute right-4 top-4 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          {TOUR_STEPS.map((label, index) => (
            <div key={label} className="flex flex-1 flex-col gap-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index <= step ? "bg-gradient-to-r from-blue-600 to-violet-600" : "bg-white/10",
                )}
              />
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-wider",
                  index === step ? "text-zinc-300" : "text-zinc-600",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 min-h-[300px]">
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <DumpStep
              text={text}
              onChange={setText}
              onLoadExample={loadExample}
              canContinue={text.trim().length > 20}
            />
          )}
          {step === 2 && (
            <GenerationStep
              synthesizing={synthesizing}
              synthesis={synthesis}
              onGenerate={startGeneration}
            />
          )}
          {step === 3 && <PreviewStep />}
          {step === 4 && <FinishStep />}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => (step === 0 ? skipTour() : setStep((value) => value - 1))}
          >
            {step === 0 ? "Skip" : "Back"}
          </GlassButton>

          {step === 1 && (
            <GlassButton
              size="md"
              variant="primary"
              disabled={text.trim().length <= 20}
              onClick={() => setStep(2)}
            >
              Generate <ArrowRight className="h-3.5 w-3.5" />
            </GlassButton>
          )}

          {step === 0 && (
            <GlassButton size="md" variant="primary" onClick={() => setStep(1)}>
              Start Tour <ArrowRight className="h-3.5 w-3.5" />
            </GlassButton>
          )}

          {step === 4 && (
            <GlassButton size="md" variant="primary" onClick={finishTour}>
              Finish & Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/60 to-cyan-500/60 shadow-glow">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-xl font-bold text-white">Welcome to MindFlow</h2>
      <p className="max-w-sm font-mono text-[13px] leading-relaxed text-zinc-400">
        Turn raw documentation into visual masterclasses. Drop in notes, links, or
        PDFs — MindFlow extracts the concepts and lays them out as an interactive
        hierarchy you can explore, rearrange, and export.
      </p>
      <div className="glass-card mt-2 w-full max-w-xs rounded-xl p-3">
        <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
          <span className="text-violet-400">Text/Links/PDFs</span> →{" "}
          <span className="text-cyan-400">Concept Extraction</span> →{" "}
          <span className="text-blue-400">Visualized Graph</span>
        </p>
      </div>
    </div>
  );
}

function DumpStep({
  text,
  onChange,
  onLoadExample,
  canContinue,
}: {
  text: string;
  onChange: (value: string) => void;
  onLoadExample: () => void;
  canContinue: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardType className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Dump your raw material</h3>
        </div>
        <GlassButton variant="outline" size="sm" onClick={onLoadExample}>
          Load Example Snippet
        </GlassButton>
      </div>
      <GlassTextarea
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder={"# V8 Engine Internals\n\nV8 compiles JavaScript to machine code via Ignition and TurboFan...\n- Call stack: LIFO of execution frames\n- Memory heap: objects and GC"}
        rows={12}
        className="flex-1 text-[12px]"
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-500">{text.length} characters</span>
        {!canContinue && text.length > 0 && (
          <span className="font-mono text-[11px] text-amber-400">Add a bit more content…</span>
        )}
      </div>
    </div>
  );
}

function GenerationStep({
  synthesizing,
  synthesis,
  onGenerate,
}: {
  synthesizing: boolean;
  synthesis: number;
  onGenerate: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      {!synthesizing ? (
        <>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
            <Wand2 className="h-7 w-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Ready to synthesize</h3>
          <p className="max-w-xs font-mono text-[13px] leading-relaxed text-zinc-400">
            MindFlow will chunk your text, extract key concepts, and structure them
            into a navigable mind map.
          </p>
          <GlassButton size="lg" variant="primary" onClick={onGenerate}>
            <Play className="h-4 w-4" /> Generate Mind Map
          </GlassButton>
        </>
      ) : (
        <>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 shadow-glow">
            <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 animate-pulse-glow text-cyan-400" />
            <span className="font-mono text-sm text-zinc-300">
              {SYNTHESIS_MESSAGES[Math.min(synthesis, SYNTHESIS_MESSAGES.length - 1)]}
            </span>
          </div>
          <div className="w-56 space-y-2">
            {SYNTHESIS_MESSAGES.map((message, index) => (
              <div
                key={message}
                className="h-1.5 overflow-hidden rounded-full bg-white/5"
              >
                {index === synthesis && (
                  <div
                    className="h-full animate-shimmer rounded-full bg-gradient-to-r from-blue-600 to-violet-500"
                    style={{ backgroundSize: "200% 100%" }}
                  />
                )}
                {index < synthesis && (
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PreviewStep() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2">
        <MapIcon className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">Your mind map is ready</h3>
      </div>
      <div className="dot-grid relative h-[260px] overflow-hidden rounded-xl border border-white/10 bg-neutral-950/60">
        <div className="ambient-glow" />
        <MiniMapPreview graph={MOCK_GRAPHS["React"]} className="relative z-10" />
      </div>
      <p className="font-mono text-[12px] leading-relaxed text-zinc-500">
        Categories are color coded — <span className="text-violet-400">core</span>,{" "}
        <span className="text-cyan-400">runtime</span>,{" "}
        <span className="text-blue-400">concept</span>,{" "}
        <span className="text-amber-400">tool</span> — with glowing Bézier edges
        mapping dependencies between topics.
      </p>
    </div>
  );
}

function FinishStep() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/50 to-teal-600/40 shadow-glow">
        <FileCog className="h-7 w-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white">You&apos;re all set</h3>
      <p className="max-w-sm font-mono text-[13px] leading-relaxed text-zinc-400">
        Explore the dashboard, open a previous mind map, or dump a new topic to
        generate your first visual masterclass.
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        {Object.keys(CATEGORY_COLORS).map((category) => (
          <span
            key={category}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-zinc-400"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            />
            {category}
          </span>
        ))}
      </div>
    </div>
  );
}