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
import { useUIStore } from "@/lib/store/ui-store";

interface TourStep {
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

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    selector: '[data-tour="nav-projects"]',
    title: "1. Projects Workspace",
    description: "Your home base for all visual knowledge maps. Browse your active mind maps, see extracted node counts, and launch interactive canvases.",
    tip: "Click any card in the grid to jump directly into its visual mental model.",
    mascotMood: "waving",
    speech: "Hey! Let's explore your sidebar. First up: the Projects tab where all your visual mental models live!",
    arrowLabel: "Projects Tab",
    preferredPlacement: "right",
  },
  {
    id: 2,
    selector: '[data-tour="nav-templates"]',
    title: "2. Prompt & Architecture Templates",
    description: "Pre-configured extraction recipes for Video Scripting, Lecture Masterclasses, API Docs, and Codebase Reviews. You can also create custom templates.",
    tip: "Templates configure system instructions and extraction depth automatically.",
    mascotMood: "pointing",
    speech: "Check out Templates! They automatically tailor extraction depth and prompt recipes for any tech topic.",
    arrowLabel: "Templates Tab",
    preferredPlacement: "right",
  },
  {
    id: 3,
    selector: '[data-tour="nav-docs"]',
    title: "3. Documentation & System Guides",
    description: "Learn how the semantic extraction pipeline, Dagre layout engine, and multi-source parser work under the hood.",
    tip: "Includes keyboard shortcuts like (L) for layout and (F) for fit-view.",
    mascotMood: "thinking",
    speech: "Curious how our semantic DAG layout works? Documentation has all the technical details!",
    arrowLabel: "Docs Tab",
    preferredPlacement: "right",
  },
  {
    id: 4,
    selector: '[data-tour="nav-settings"]',
    title: "4. Account & Extraction Settings",
    description: "Configure your default extraction depth (Summary, Standard, or Deep Dive), canvas theme preferences, and manage your account.",
    tip: "Preferences configured here automatically pre-fill your 'New Project' modal.",
    mascotMood: "pointing",
    speech: "Here in Settings, customize your default extraction depth and app preferences.",
    arrowLabel: "Settings Tab",
    preferredPlacement: "right",
  },
  {
    id: 5,
    selector: '[data-tour="new-project-btn"]',
    title: "5. New Knowledge Extraction",
    description: "Click here to open 'The Dump'. Paste raw markdown notes, drop technical PDFs, or paste documentation links for automated extraction.",
    tip: "Our pipeline parses content via Cheerio & PDF-parse, building structured knowledge bundles.",
    mascotMood: "pointing",
    speech: "This is where the magic happens! Click here to dump your raw notes, links, or PDFs.",
    arrowLabel: "New Project",
    preferredPlacement: "bottom",
  },
  {
    id: 6,
    selector: '[data-tour="search-bar"]',
    title: "6. Instant Topic Search",
    description: "Type any topic name or concept (like React, Docker, V8) to filter through previous mind maps in real-time.",
    tip: "Filter by topic, node count, or category directly.",
    mascotMood: "pointing",
    speech: "Looking for a specific mind map? Type right here to filter instantly!",
    arrowLabel: "Quick Search",
    preferredPlacement: "bottom",
  },
  {
    id: 7,
    selector: '[data-tour="projects-grid"]',
    title: "7. Interactive Mind Maps Grid",
    description: "Each session card displays thumbnail previews, node count, source badges, and last edited time. Click any card to enter the full canvas.",
    tip: "Inside the canvas you get Dagre auto-layout, mini-map, and multi-format exports.",
    mascotMood: "thinking",
    speech: "This is your mind maps workspace! All your visual knowledge cards appear right here.",
    arrowLabel: "Mind Maps",
    preferredPlacement: "bottom",
  },
  {
    id: 8,
    selector: '[data-tour="sidebar-tour"]',
    title: "8. Summon Echo Anytime",
    description: "Need a refresher or want to run the guided tour again? Click this button anytime to summon me back.",
    tip: "Each screen (Dashboard, Canvas, Dump Window) has its own contextual tour.",
    mascotMood: "celebrating",
    speech: "You're all set to build amazing visual masterclasses! I'm always here if you need help.",
    arrowLabel: "Summon Echo",
    preferredPlacement: "right",
  },
];

const emptySubscribe = () => () => {};

export function FloatingCharacterTour() {
  const { isFloatingTourOpen, completeFloatingTour } = useUIStore();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const step = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];

  const updateTargetRect = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "nearest" });
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!isFloatingTourOpen) return;
    const t0 = setTimeout(updateTargetRect, 0);
    const t1 = setTimeout(updateTargetRect, 60);
    const t2 = setTimeout(updateTargetRect, 180);

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isFloatingTourOpen, currentStepIdx, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
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
      localStorage.setItem("mindflow_dashboard_tour_seen", "true");
      localStorage.setItem("mindflow_tour_completed", "true");
    } catch {}
    completeFloatingTour();
    setCurrentStepIdx(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isFloatingTourOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!isClient || !isFloatingTourOpen) return null;

  // Window viewport calculations
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  // Compute floating character & card position based on target rect
  let cardX = windowWidth / 2 - 190;
  let cardY = windowHeight / 2 - 160;

  if (targetRect) {
    if (step.preferredPlacement === "right") {
      if (targetRect.right + 420 <= windowWidth - 20) {
        cardX = targetRect.right + 24;
      } else if (targetRect.left >= 420) {
        cardX = targetRect.left - 410;
      } else {
        cardX = Math.max(20, windowWidth - 410);
      }
      cardY = Math.max(20, Math.min(windowHeight - 400, targetRect.top - 20));
    } else if (step.preferredPlacement === "bottom") {
      cardX = Math.max(20, Math.min(windowWidth - 410, targetRect.left + (targetRect.width - 390) / 2));
      if (targetRect.bottom + 380 <= windowHeight - 20) {
        cardY = targetRect.bottom + 24;
      } else if (targetRect.top - 380 >= 20) {
        cardY = targetRect.top - 380;
      } else {
        cardY = Math.max(20, windowHeight - 400);
      }
    } else if (step.preferredPlacement === "top") {
      cardX = Math.max(20, Math.min(windowWidth - 410, targetRect.left + (targetRect.width - 390) / 2));
      if (targetRect.top - 380 >= 20) {
        cardY = targetRect.top - 380;
      } else if (targetRect.bottom + 380 <= windowHeight - 20) {
        cardY = targetRect.bottom + 24;
      } else {
        cardY = 20;
      }
    } else if (step.preferredPlacement === "left") {
      if (targetRect.left - 420 >= 20) {
        cardX = targetRect.left - 410;
      } else {
        cardX = Math.min(windowWidth - 410, targetRect.right + 24);
      }
      cardY = Math.max(20, Math.min(windowHeight - 400, targetRect.top - 20));
    }
  }

  // Calculate actual directional relationship so Echo's flipper points directly at targetRect
  const actualPlacement = targetRect
    ? cardY + 280 < targetRect.top
      ? ("bottom" as const)
      : cardY > targetRect.bottom - 40
      ? ("top" as const)
      : cardX > targetRect.right
      ? ("left" as const)
      : ("right" as const)
    : step.preferredPlacement;

  // Calculate target center for the animated curly arrow
  const targetCenterX = targetRect ? targetRect.left + targetRect.width / 2 : windowWidth / 2;
  const targetCenterY = targetRect ? targetRect.top + targetRect.height / 2 : windowHeight / 2;

  // Character hand coordinate estimate
  const mascotCenterX = cardX + 75;
  const mascotCenterY = cardY + 75;
  // Arrow origin from the card edge nearest to the target
  const arrowStartX = targetCenterX < cardX
    ? cardX
    : targetCenterX > cardX + 390
    ? cardX + 390
    : Math.min(Math.max(cardX + 40, targetCenterX), cardX + 350);

  const arrowStartY = targetCenterY < cardY
    ? cardY
    : targetCenterY > cardY + 220
    ? cardY + 220
    : Math.min(Math.max(cardY + 30, targetCenterY), cardY + 180);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* SVG Spotlight Cutout Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={Math.max(0, targetRect.left - 8)}
                y={Math.max(0, targetRect.top - 8)}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Dark overlay with mask cutout */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.72)"
          mask="url(#tour-spotlight-mask)"
          className="pointer-events-auto backdrop-blur-[2px]"
          onClick={handleNext}
        />

        {/* Pulsing focus outline around target element */}
        {targetRect && (
          <rect
            x={Math.max(0, targetRect.left - 8)}
            y={Math.max(0, targetRect.top - 8)}
            width={targetRect.width + 16}
            height={targetRect.height + 16}
            rx="14"
            fill="none"
            stroke="rgba(226, 224, 217, 0.85)"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="tour-curve"
          />
        )}
      </svg>

      {/* Playful Curly Arrow connecting Card to the spotlighted element */}
      {targetRect && (
        <CurlyArrow
          start={{ x: arrowStartX, y: arrowStartY }}
          end={{ x: targetCenterX, y: targetCenterY }}
          loop={true}
          label={step.arrowLabel}
        />
      )}

      {/* Floating Instruction Card Container */}
      <div
        style={{
          transform: `translate3d(${cardX}px, ${cardY}px, 0)`,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute top-0 left-0 z-50 flex flex-col items-start gap-2.5 pointer-events-auto max-w-[390px]"
      >
        {/* Floating Instruction Card */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-fade-in-up">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-accent font-mono text-[10px] font-bold border border-white/15">
                {step.id}
              </span>
              <span className="font-mono text-xs text-muted">
                Step {step.id} of {TOUR_STEPS.length}
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
                {currentStepIdx === TOUR_STEPS.length - 1 ? (
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
