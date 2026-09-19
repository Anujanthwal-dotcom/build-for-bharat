"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Sparkles,
  Zap,
} from "lucide-react";
import { CartoonMascot, MascotMood } from "./cartoon-mascot";
import { CurlyArrow } from "./curly-arrow";

interface DumpTourStep {
  id: number;
  tab: "text" | "links" | "files";
  selector: string;
  title: string;
  description?: string;
  tip?: string;
  mascotMood: MascotMood;
  speech: string;
  arrowLabel?: string;
  preferredPlacement: "left" | "right" | "top" | "bottom";
}

const DUMP_TOUR_STEPS: DumpTourStep[] = [
  {
    id: 1,
    tab: "text",
    selector: '[data-tour="dump-text-input"]',
    title: "1. Paste Raw Text & Notes",
    description: "Paste unorganized documentation, architecture notes, code snippets, or meeting transcripts here. Our engine extracts structured concept nodes automatically.",
    tip: "You don't need clean formatting — paste raw brain dumps or markdown notes.",
    mascotMood: "waving",
    speech: "Hey! Let's turn your raw technical notes into an awesome mindmap. Start by pasting text here!",
    arrowLabel: "Raw Notes",
    preferredPlacement: "right",
  },
  {
    id: 2,
    tab: "links",
    selector: '[data-tour="dump-links-input"]',
    title: "2. Add Documentation URLs",
    description: "Have API documentation, GitHub repos, or technical blog posts? Add URLs here. The parser scrapes public web content and bundles it into the knowledge model.",
    tip: "Click '+ Add another URL' to bundle multiple web documentation sources together.",
    mascotMood: "pointing",
    speech: "Follow the arrow! Paste web links to pull live documentation into your mental model.",
    arrowLabel: "Web URLs",
    preferredPlacement: "right",
  },
  {
    id: 3,
    tab: "files",
    selector: '[data-tour="dump-files-input"]',
    title: "3. Upload PDF & Markdown Files",
    description: "Drag and drop PDF whitepapers, technical book excerpts, or Markdown files. Our PDF parser extracts text layers and structures them into entities.",
    tip: "Supports .pdf, .txt, and .md files.",
    mascotMood: "pointing",
    speech: "Drop PDFs or Markdown documents directly here for automated semantic parsing!",
    arrowLabel: "PDF & Files",
    preferredPlacement: "right",
  },
  {
    id: 4,
    tab: "files",
    selector: '[data-tour="dump-depth-slider"]',
    title: "4. Select Extraction Depth",
    description: "Slide to configure the granularity: 'Summary' produces a high-level overview, while 'Deep Dive' creates comprehensive sub-concept networks.",
    tip: "Standard or Deep Dive works best for comprehensive knowledge extraction and detailed concept breakdowns.",
    mascotMood: "thinking",
    speech: "Tune the slider: choose between a high-level summary or an exhaustive deep dive!",
    arrowLabel: "Depth Slider",
    preferredPlacement: "top",
  },
  {
    id: 5,
    tab: "files",
    selector: '[data-tour="dump-build-btn"]',
    title: "5. Build Your Visual Mind Map",
    description: "Click 'Build Mind Map' to launch extraction. In seconds, you will be redirected to the interactive canvas with auto-layout and deep-dive exploration!",
    tip: "After building, you can drag nodes, inspect connections, and export high-res SVGs.",
    mascotMood: "celebrating",
    speech: "You're all set! Hit 'Build Mind Map' and watch your mental model come alive!",
    arrowLabel: "Build Mind Map",
    preferredPlacement: "top",
  },
];

const emptySubscribe = () => () => {};

interface DumpTourProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: "text" | "links" | "files") => void;
}

export function DumpTour({ isOpen, onClose, onTabChange }: DumpTourProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const step = DUMP_TOUR_STEPS[currentStepIdx] || DUMP_TOUR_STEPS[0];

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  // When step changes, switch the tab in the modal so the target element is visible
  useEffect(() => {
    if (!isOpen) return;
    if (onTabChange && step.tab) {
      onTabChange(step.tab);
    }
    const timer = setTimeout(() => {
      updateTargetRect();
    }, 120);
    return () => clearTimeout(timer);
  }, [isOpen, currentStepIdx, step.tab, onTabChange, updateTargetRect]);

  useEffect(() => {
    if (!isOpen) return;
    const rafId = requestAnimationFrame(() => {
      updateTargetRect();
    });
    const handleResize = () => updateTargetRect();

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, currentStepIdx, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIdx < DUMP_TOUR_STEPS.length - 1) {
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
      localStorage.setItem("mindflow_dump_tour_seen", "true");
    } catch {}
    onClose();
    setCurrentStepIdx(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!isClient || !isOpen || typeof document === "undefined") return null;

  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const isMobile = windowWidth < 768;

  const cardWidth = Math.min(340, windowWidth - 32);
  const cardHeight = 150;

  let cardX = 20;
  let cardY = 120;

  if (isMobile) {
    // Dock cleanly at bottom on small screens
    cardX = (windowWidth - cardWidth) / 2;
    cardY = Math.max(105, windowHeight - cardHeight - 20);
  } else if (targetRect) {
    // On desktop, find best placement relative to targetRect
    const spaceRight = windowWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    if (spaceRight >= cardWidth + 24) {
      // Place to the right of the target modal
      cardX = targetRect.right + 20;
      cardY = Math.max(105, Math.min(windowHeight - cardHeight - 20, targetRect.top));
    } else if (spaceLeft >= cardWidth + 24) {
      // Place to the left of the target modal
      cardX = targetRect.left - cardWidth - 20;
      cardY = Math.max(105, Math.min(windowHeight - cardHeight - 20, targetRect.top));
    } else {
      // Place below target or at bottom
      cardX = Math.max(20, Math.min(windowWidth - cardWidth - 20, targetRect.left));
      if (targetRect.bottom + cardHeight + 20 <= windowHeight) {
        cardY = targetRect.bottom + 16;
      } else {
        cardY = Math.max(105, targetRect.top - cardHeight - 16);
      }
    }
  }

  // Clamping within viewport
  cardX = Math.max(16, Math.min(windowWidth - cardWidth - 16, cardX));
  cardY = Math.max(105, Math.min(windowHeight - cardHeight - 16, cardY));

  const targetCenterX = targetRect ? targetRect.left + targetRect.width / 2 : windowWidth / 2;
  const targetCenterY = targetRect ? targetRect.top + targetRect.height / 2 : windowHeight / 2;

  // Mascot positioned atop the card
  const mascotX = Math.min(windowWidth - 130, Math.max(16, cardX + cardWidth - 120));
  const mascotY = Math.max(10, cardY - 95);
  const mascotCenterX = mascotX + 45;
  const mascotCenterY = mascotY + 45;

  const content = (
    <div className="fixed inset-0 z-[100] pointer-events-none font-sans select-none">
      {/* Semi-transparent backdrop with subtle blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto"
        onClick={handleClose}
      />

      {/* Target Element Outline (Warm accent border, non-AI) */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-xl border-2 border-dashed border-[#E2E0D9]/80 shadow-[0_0_20px_rgba(226,224,217,0.2)] animate-pulse transition-all duration-300"
          style={{
            top: `${Math.max(0, targetRect.top - 4)}px`,
            left: `${Math.max(0, targetRect.left - 4)}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
          }}
        />
      )}

      {/* Curly Arrow pointing from Echo to target */}
      {targetRect && (
        <CurlyArrow
          start={{ x: mascotCenterX, y: mascotCenterY }}
          end={{ x: targetCenterX, y: targetCenterY }}
          loop={true}
          label={step.arrowLabel}
        />
      )}

      {/* Floating Echo Mascot */}
      <div
        className="absolute pointer-events-auto transition-all duration-300 ease-out z-20"
        style={{
          transform: `translate3d(${mascotX}px, ${mascotY}px, 0)`,
        }}
      >
        <CartoonMascot
          mood={step.mascotMood}
          placement={step.preferredPlacement}
          size="sm"
          speechText={step.speech}
        />
      </div>

      {/* Floating Instruction Card */}
      <div
        className="absolute pointer-events-auto transition-all duration-300 ease-out z-10"
        style={{
          width: `${cardWidth}px`,
          transform: `translate3d(${cardX}px, ${cardY}px, 0)`,
        }}
      >
        <div className="rounded-xl border border-white/10 bg-[#121214] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-fade-in-up max-h-[80vh] overflow-y-auto">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-accent font-mono text-[10px] font-bold border border-white/15">
                {step.id}
              </span>
              <span className="font-mono text-xs text-muted">
                Step {step.id} of {DUMP_TOUR_STEPS.length}
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

          {/* Card Body (Clean & Compact without overflowing detailed description) */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              {step.title}
              <Sparkles className="h-3.5 w-3.5 text-accent" />
            </h3>

            {/* Pro Tip Pill */}
            {step.tip && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 flex items-start gap-2 text-[11px] text-zinc-300">
                <Zap className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                <span className="leading-snug">{step.tip}</span>
              </div>
            )}
          </div>

          {/* Card Navigation Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
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
                {currentStepIdx === DUMP_TOUR_STEPS.length - 1 ? (
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

  return createPortal(content, document.body);
}
