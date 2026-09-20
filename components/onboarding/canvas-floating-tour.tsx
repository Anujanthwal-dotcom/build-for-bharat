"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { CurlyArrow } from "./curly-arrow";

interface CanvasTourStep {
  id: number;
  selector: string;
  title: string;
  description: string;
  tip: string;
  mascotMood?: string;
  speech?: string;
  arrowLabel?: string;
  preferredPlacement: "right" | "bottom" | "top" | "left";
}

const CANVAS_TOUR_STEPS: CanvasTourStep[] = [
  {
    id: 1,
    selector: '[data-tour="canvas-header"]',
    title: "Live Canvas & Topic Header",
    description: "Your knowledge extraction has been structured into an interactive mental model. Auto-save synchronizes any edits, position shifts, and edge connections automatically.",
    tip: "View node and source counters, auto-save indicators, and quick project navigation here.",
    mascotMood: "waving",
    speech: "Woohoo! Your visual mindmap is live! Let's take a quick look at your creator tools.",
    arrowLabel: "Topic Header",
    preferredPlacement: "bottom",
  },
  {
    id: 2,
    selector: '[data-tour="canvas-flow"]',
    title: "Interactive Concept Nodes",
    description: "Drag nodes freely, zoom with your mousewheel, or click ANY node to open the live Detail Panel on the right to edit descriptions, tags, and categories.",
    tip: "Click any node on the canvas to inspect its incoming and outgoing relationships.",
    mascotMood: "pointing",
    speech: "Click any node on the canvas to inspect connections and edit concepts in real-time!",
    arrowLabel: "Concept Nodes",
    preferredPlacement: "bottom",
  },
  {
    id: 3,
    selector: '[data-tour="canvas-layout"]',
    title: "Dagre Auto-Layout & Export",
    description: "Clean up messy node positions instantly with hierarchical Dagre layout, and export high-res SVGs, PNGs, or Markdown for your presentations and slides.",
    tip: "Use the Export menu to grab high-resolution diagram assets for your documentation.",
    mascotMood: "celebrating",
    speech: "Keep your diagram looking gorgeous with Auto-Layout, and export crisp SVGs whenever you're ready!",
    arrowLabel: "Auto-Layout & Export",
    preferredPlacement: "bottom",
  },
  {
    id: 4,
    selector: '[data-tour="canvas-sources"]',
    title: "Source Inspector & Outline",
    description: "Toggle the source inspector sidebar to review original documentation sources or click any item in the concept outline to jump right to it.",
    tip: "Press 'S' on your keyboard to toggle the sidebar anytime.",
    mascotMood: "thinking",
    speech: "Browse through original source files or quickly jump between concepts using the outline!",
    arrowLabel: "Sources & Outline",
    preferredPlacement: "bottom",
  },
];

const emptySubscribe = () => () => {};

interface CanvasFloatingTourProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CanvasFloatingTour({ isOpen: controlledIsOpen, onClose: controlledOnClose }: CanvasFloatingTourProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("mindflow_canvas_tour_seen");
    }
    return false;
  });
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isTourActive = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const step = CANVAS_TOUR_STEPS[currentStepIdx] || CANVAS_TOUR_STEPS[0];

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!isTourActive) return;
    const rafId = requestAnimationFrame(() => {
      updateTargetRect();
    });
    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isTourActive, currentStepIdx, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIdx < CANVAS_TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    try {
      localStorage.setItem("mindflow_canvas_tour_seen", "true");
    } catch {}
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setCurrentStepIdx(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!isClient || !isTourActive) return null;

  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Compute positioning
  let cardX = windowWidth / 2 - 190;
  let cardY = windowHeight / 2 - 140;

  if (targetRect) {
    if (step.preferredPlacement === "bottom") {
      cardX = Math.max(20, Math.min(windowWidth - 420, targetRect.left - 20));
      cardY = Math.min(windowHeight - 340, targetRect.bottom + 44);
    } else if (step.preferredPlacement === "top") {
      cardX = Math.max(20, Math.min(windowWidth - 420, targetRect.left - 20));
      cardY = Math.max(20, targetRect.top - 340);
    } else if (step.preferredPlacement === "right") {
      cardX = Math.min(windowWidth - 420, targetRect.right + 44);
      cardY = Math.max(20, Math.min(windowHeight - 340, targetRect.top - 20));
    } else {
      cardX = Math.max(20, targetRect.left - 420);
      cardY = Math.max(20, Math.min(windowHeight - 340, targetRect.top - 20));
    }
  }

  const targetCenterX = targetRect ? targetRect.left + targetRect.width / 2 : windowWidth / 2;
  const targetCenterY = targetRect ? targetRect.top + targetRect.height / 2 : windowHeight / 2;

  // Arrow origin from the card edge nearest to the target
  const arrowStartX = targetCenterX < cardX
    ? cardX
    : targetCenterX > cardX + 380
    ? cardX + 380
    : Math.min(Math.max(cardX + 40, targetCenterX), cardX + 340);

  const arrowStartY = targetCenterY < cardY
    ? cardY
    : targetCenterY > cardY + 220
    ? cardY + 220
    : Math.min(Math.max(cardY + 30, targetCenterY), cardY + 180);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none font-sans overflow-hidden">
      {/* Dimmed backdrop with highlight cutout */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Target Element Outline */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-xl border-2 border-dashed border-[#E2E0D9]/80 shadow-[0_0_20px_rgba(226,224,217,0.2)] animate-pulse transition-all duration-300"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* Curly Connecting Arrow */}
      {targetRect && (
        <CurlyArrow
          start={{ x: arrowStartX, y: arrowStartY }}
          end={{ x: targetCenterX, y: targetCenterY }}
          loop={true}
          label={step.arrowLabel}
        />
      )}

      {/* Instruction Card */}
      <div
        className="absolute pointer-events-auto w-[380px] max-w-[calc(100vw-40px)] transition-all duration-300 ease-out z-10"
        style={{
          transform: `translate3d(${cardX}px, ${cardY}px, 0)`,
        }}
      >
        <div className="relative rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-accent font-mono text-[10px] font-bold border border-white/15">
                {step.id}
              </span>
              <span className="font-mono text-xs text-muted">
                Step {step.id} of {CANVAS_TOUR_STEPS.length}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-muted hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              title="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Card Body */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              {step.title}
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </h3>
            <p className="text-xs leading-relaxed text-muted">
              {step.description}
            </p>

            {/* Pro Tip Pill */}
            <div className="mt-2.5 rounded-lg border border-white/10 bg-white/[0.03] p-2.5 flex items-start gap-2 text-[11px] text-zinc-300">
              <Zap className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
              <span>{step.tip}</span>
            </div>
          </div>

          {/* Card Navigation Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              onClick={handleClose}
              className="text-xs font-mono text-muted hover:text-white transition-colors cursor-pointer"
            >
              Skip
            </button>

            <div className="flex items-center gap-2">
              {currentStepIdx > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" /> Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-black hover:bg-accent/90 shadow-[0_0_15px_rgba(226,224,217,0.25)] transition-all cursor-pointer"
              >
                {currentStepIdx === CANVAS_TOUR_STEPS.length - 1 ? (
                  <>Finish <Check className="h-3.5 w-3.5" /></>
                ) : (
                  <>Next <ArrowRight className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
