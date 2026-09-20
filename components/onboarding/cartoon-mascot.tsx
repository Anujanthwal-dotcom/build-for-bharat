"use client";

import React from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type MascotMood = "waving" | "pointing" | "thinking" | "celebrating" | "idle";
export type TourPlacement = "left" | "right" | "top" | "bottom";

interface CartoonMascotProps {
  mood?: MascotMood;
  placement?: TourPlacement;
  speechText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * CartoonMascot: "Echo", the cute cartoon dolphin guide for MindFlow.
 * Styled after the classic playful cartoon dolphin vector icon with clean outlines,
 * white underbelly, expressive anime eyes, and context-aware gestures that adapt
 * to tour positions and user actions.
 */
export function CartoonMascot({
  mood = "waving",
  placement = "right",
  speechText,
  className,
  size = "md",
}: CartoonMascotProps) {
  const sizeMap = {
    sm: "w-32 h-32",
    md: "w-40 h-40",
    lg: "w-52 h-52",
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Speech Bubble */}
      {speechText && (
        <div className="relative mb-2 max-w-[280px] animate-fade-in-up">
          <div className="relative rounded-2xl border border-white/10 bg-[#121214] px-3.5 py-2 text-xs font-medium text-zinc-100 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-sky-400">
              <Sparkles className="h-3 w-3 text-sky-400" />
              <span>Echo • Dolphin Guide</span>
            </div>
            <p className="mt-1 leading-relaxed text-zinc-300 text-[11px]">{speechText}</p>
          </div>
          {/* Speech Bubble Triangle Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[#121214]" />
        </div>
      )}

      {/* Mascot Body & Ambient Halo */}
      <div className={cn("relative flex items-center justify-center animate-mascot-bob", sizeMap[size])}>
        {/* Soft Ambient Halo behind Echo */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none",
            mood === "celebrating" && "bg-sky-400/25 scale-125",
            mood === "thinking" && "bg-indigo-400/20 scale-115",
            mood === "pointing" && "bg-cyan-400/20 scale-120",
            (mood === "waving" || mood === "idle") && "bg-blue-500/15 scale-110",
          )}
        />

        {/* SVG Cartoon Dolphin Artwork */}
        <svg
          viewBox="0 0 160 165"
          className="relative z-10 w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. FLOATING MOOD ACCESSORIES */}
          
          {/* A. Waving: Floating Heart Speech Bubble (Exact reference match!) */}
          {mood === "waving" && (
            <g className="animate-bounce origin-[126px_24px]">
              <circle cx="126" cy="24" r="11.5" fill="#ffffff" stroke="#172554" strokeWidth="2.2" />
              <path d="M 118 31 L 120 36 L 125 33" fill="#ffffff" stroke="#172554" strokeWidth="2.2" strokeLinejoin="round" />
              {/* Heart inside */}
              <path
                d="M 126 28 C 126 28, 122 25, 122 22.5 C 122 20.5, 123.5 19, 125.5 19 C 126.5 19, 127.5 19.8, 128 20.5 C 128.5 19.8, 129.5 19, 130.5 19 C 132.5 19, 134 20.5, 134 22.5 C 134 25, 130 28, 126 28 Z"
                fill="#f43f5e"
              />
            </g>
          )}

          {/* B. Thinking: Floating Thought Bubble with Glowing Idea Star */}
          {mood === "thinking" && (
            <g>
              <circle cx="118" cy="42" r="3" fill="#ffffff" stroke="#172554" strokeWidth="1.8" />
              <circle cx="124" cy="33" r="4.5" fill="#ffffff" stroke="#172554" strokeWidth="2" />
              <g className="animate-bounce origin-[132px_18px]">
                <circle cx="132" cy="18" r="11" fill="#18181b" stroke="#38bdf8" strokeWidth="2" />
                <polygon
                  points="132,10 134,14 139,16 135,19 136,24 132,21 128,24 129,19 125,16 130,14"
                  fill="#fbbf24"
                />
                <circle cx="132" cy="17" r="3" fill="#ffffff" />
              </g>
            </g>
          )}

          {/* C. Celebrating: Celebratory Stars, Confetti & Water Splashes */}
          {mood === "celebrating" && (
            <g>
              <polygon
                points="128,14 130,19 135,20 131,23 132,28 128,25 124,28 125,23 121,20 126,19"
                fill="#fbbf24"
                className="animate-pulse"
              />
              <polygon
                points="36,24 38,28 42,29 39,32 40,36 36,34 32,36 33,32 30,29 34,28"
                fill="#fbbf24"
              />
              <circle cx="48" cy="18" r="2.5" fill="#f43f5e" />
              <circle cx="116" cy="16" r="2.2" fill="#34d399" />
              <circle cx="138" cy="38" r="2.5" fill="#38bdf8" />
            </g>
          )}

          {/* D. Idle: Soft floating water bubbles */}
          {mood === "idle" && (
            <g className="animate-pulse">
              <circle cx="120" cy="40" r="2" fill="#bae6fd" opacity="0.6" />
              <circle cx="126" cy="30" r="3" fill="#bae6fd" opacity="0.5" />
            </g>
          )}

          {/* 2. DORSAL FIN & TAIL FLUKES (Behind main body) */}
          <g id="dolphin-fins-back">
            {/* Dorsal Fin (Upper left back) */}
            <path
              d="M 50 48 C 42 36, 28 36, 22 44 C 20 48, 26 54, 40 64"
              fill="#50a2f5"
              stroke="#172554"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Tail Flukes (Caudal Fin) */}
            <g
              className={cn(
                mood === "celebrating" && "animate-bot-celebrate origin-[83px_132px]",
              )}
            >
              {/* Left fluke lobe */}
              <path
                d="M 83 132 C 78 126, 68 128, 64 136 C 60 144, 68 152, 78 144 C 81 141, 83 136, 83 132 Z"
                fill="#50a2f5"
                stroke="#172554"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
              {/* Right fluke lobe */}
              <path
                d="M 83 132 C 86 124, 98 122, 104 128 C 108 134, 102 144, 92 142 C 87 140, 84 136, 83 132 Z"
                fill="#50a2f5"
                stroke="#172554"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
            </g>

            {/* Left Pectoral Flipper (Far side) */}
            {mood === "celebrating" ? (
              // Left flipper raised high in celebratory triumph!
              <g className="animate-bot-celebrate origin-[50px_60px]">
                <path
                  d="M 52 64 C 44 52, 34 38, 26 32 C 22 29, 20 34, 24 40 C 32 52, 44 64, 50 68 Z"
                  fill="#50a2f5"
                  stroke="#172554"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              // Natural swimming position on left flank
              <path
                d="M 42 74 C 34 74, 24 80, 22 88 C 20 92, 26 94, 36 92 C 46 90, 50 84, 52 78 Z"
                fill="#50a2f5"
                stroke="#172554"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />
            )}
          </g>

          {/* 3. MAIN DOLPHIN BODY & WHITE UNDERBELLY */}
          <g id="dolphin-body">
            {/* Main Blue Leaping Arch Silhouette */}
            <path
              d="M 52 38 C 66 24, 92 24, 104 36 C 112 43, 118 47, 120 52 C 122 56, 118 59, 110 61 C 102 62, 97 66, 94 72 C 88 92, 80 114, 83 134 C 74 122, 62 100, 54 78 C 48 62, 46 48, 52 38 Z"
              fill="#50a2f5"
              stroke="#172554"
              strokeWidth="2.8"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Forehead Soft Highlight Sheen */}
            <path
              d="M 64 34 C 74 29, 86 29, 94 33"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Crisp White Underbelly Patch (Exact match to reference image!) */}
            <path
              d="M 98 62 C 88 64, 76 72, 62 82 C 68 100, 75 118, 83 134 C 80 114, 86 94, 92 76 C 94 71, 98 66, 98 62 Z"
              fill="#ffffff"
              stroke="#172554"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />

            {/* Beak & Mouth */}
            <g>
              {/* Upper beak outline contour */}
              <path
                d="M 104 36 C 112 43, 118 47, 120 52 C 122 56, 118 59, 110 61"
                stroke="#172554"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Mouth open wedge / grin */}
              {mood === "celebrating" ? (
                // Wide open ecstatic grin
                <>
                  <path
                    d="M 98 56 C 96 56, 95 60, 96 63 C 98 70, 108 74, 114 70 C 116 68, 116 63, 111 60 Z"
                    fill="#172554"
                    stroke="#172554"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path d="M 102 66 C 106 63, 110 64, 112 68 C 109 71, 105 70, 102 66 Z" fill="#f43f5e" />
                </>
              ) : mood === "thinking" ? (
                // Pondering gentle smile
                <path
                  d="M 98 59 Q 104 62 108 58"
                  stroke="#172554"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              ) : (
                // Classic happy wedge smile from reference image
                <>
                  <path
                    d="M 101 56 C 98 56, 96 58, 97 61 C 98 65, 104 70, 110 68 C 112 67, 114 64, 111 61 C 107 58, 103 56, 101 56 Z"
                    fill="#172554"
                    stroke="#172554"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 102 65 C 105 63, 108 63, 109 66 C 107 68, 104 68, 102 65 Z"
                    fill="#f87171"
                  />
                </>
              )}
            </g>
          </g>

          {/* 4. EXPRESSIVE EYES */}
          <g id="dolphin-eyes">
            {mood === "celebrating" ? (
              // Joyful crescent squint eyes (^ ^)
              <>
                <path
                  d="M 74 44 Q 78 37 83 43"
                  stroke="#172554"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 93 47 Q 99 38 104 46"
                  stroke="#172554"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : mood === "thinking" ? (
              // Inquisitive upward gaze towards thought bubble
              <>
                <ellipse cx="78" cy="42" rx="3.5" ry="5.5" transform="rotate(-15 78 42)" fill="#172554" />
                <circle cx="79" cy="39" r="1.6" fill="#ffffff" />

                <ellipse cx="98" cy="45" rx="4.5" ry="7" transform="rotate(10 98 45)" fill="#172554" />
                <circle cx="99" cy="41" r="2.2" fill="#ffffff" />
                {/* Raised curious brow */}
                <path d="M 93 34 Q 99 28 106 33" stroke="#172554" strokeWidth="2.4" strokeLinecap="round" />
              </>
            ) : mood === "pointing" ? (
              // Focused gaze directed towards target
              <>
                <ellipse cx="78" cy="42" rx="3.5" ry="5.5" transform="rotate(-15 78 42)" fill="#172554" />
                <circle
                  cx={placement === "bottom" ? "79" : "80"}
                  cy={placement === "bottom" ? "42" : "41"}
                  r="1.6"
                  fill="#ffffff"
                />

                <ellipse cx="98" cy="45" rx="4.5" ry="7" transform="rotate(10 98 45)" fill="#172554" />
                <circle
                  cx={placement === "bottom" ? "99" : "101"}
                  cy={placement === "bottom" ? "46" : "43.5"}
                  r="2.2"
                  fill="#ffffff"
                />
                <path d="M 94 36 Q 100 32 105 35" stroke="#172554" strokeWidth="2.2" strokeLinecap="round" />
              </>
            ) : (
              // Classic wide sparkling anime eyes with blinking animation
              <g className="animate-bot-blink origin-[88px_44px]">
                {/* Left eye (secondary on forehead) */}
                <ellipse cx="78" cy="42" rx="3.5" ry="5.5" transform="rotate(-15 78 42)" fill="#172554" />
                <circle cx="79" cy="40.5" r="1.6" fill="#ffffff" />

                {/* Right eye (main eye) */}
                <ellipse cx="98" cy="45" rx="4.5" ry="7" transform="rotate(10 98 45)" fill="#172554" />
                <circle cx="99.5" cy="43" r="2.2" fill="#ffffff" />
                <circle cx="96.5" cy="47" r="1.1" fill="#ffffff" />

                {/* Brow crease */}
                <path d="M 94 36 Q 99 33 104 36" stroke="#172554" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* 5. FRONT PECTORAL FLIPPER (GESTURES ACCORDING TO TOUR POSITION & MOOD) */}
          <g id="dolphin-flipper-front">
            {/* A. Waving Pose: Raised high and waving (Exact reference match!) */}
            {mood === "waving" && (
              <g className="animate-bot-wave origin-[90px_76px]">
                <path
                  d="M 88 74 C 94 72, 110 64, 120 54 C 124 50, 129 55, 126 61 C 118 72, 102 82, 88 82 Z"
                  fill="#50a2f5"
                  stroke="#172554"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M 98 72 C 108 65, 116 58, 120 56"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.6"
                />
              </g>
            )}

            {/* B. Pointing Pose: Directed according to tour position */}
            {mood === "pointing" && (
              <>
                {placement === "bottom" ? (
                  // Pointing DOWN towards tour card/button below
                  <g className="animate-bot-point-down origin-[88px_74px]">
                    <path
                      d="M 88 74 C 94 76, 106 90, 112 108 C 114 113, 108 116, 104 112 C 98 102, 92 88, 86 80 Z"
                      fill="#50a2f5"
                      stroke="#172554"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    {/* Energy ripple at tip */}
                    <circle cx="112" cy="116" r="3.5" fill="#38bdf8" className="animate-ping" />
                    <circle cx="112" cy="116" r="2" fill="#ffffff" />
                    {/* Downward direction chevron */}
                    <path
                      d="M 108 120 L 112 124 L 116 120"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : placement === "top" ? (
                  // Pointing UP towards element above
                  <g className="animate-bot-point origin-[88px_74px]">
                    <path
                      d="M 88 74 C 94 68, 108 50, 116 36 C 120 31, 124 35, 121 41 C 113 54, 100 70, 88 78 Z"
                      fill="#50a2f5"
                      stroke="#172554"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="118" cy="34" r="3.5" fill="#38bdf8" className="animate-ping" />
                    <circle cx="118" cy="34" r="2" fill="#ffffff" />
                    <path
                      d="M 114 30 L 118 26 L 122 30"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : placement === "left" ? (
                  // Pointing LEFT across towards element
                  <g className="animate-bot-point origin-[88px_74px]">
                    <path
                      d="M 88 74 C 76 74, 58 76, 42 78 C 36 79, 36 73, 42 71 C 56 67, 74 69, 86 72 Z"
                      fill="#50a2f5"
                      stroke="#172554"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="38" cy="74" r="3.5" fill="#38bdf8" className="animate-ping" />
                    <circle cx="38" cy="74" r="2" fill="#ffffff" />
                  </g>
                ) : (
                  // Pointing RIGHT towards tour card/button to the right
                  <g className="animate-bot-point origin-[88px_74px]">
                    <path
                      d="M 88 74 C 98 72, 120 70, 136 68 C 142 67, 143 73, 137 76 C 122 81, 104 83, 88 80 Z"
                      fill="#50a2f5"
                      stroke="#172554"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="144" cy="71" r="3.5" fill="#38bdf8" className="animate-ping" />
                    <circle cx="144" cy="71" r="2" fill="#ffffff" />
                    <path
                      d="M 148 67 L 152 71 L 148 75"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
              </>
            )}

            {/* C. Thinking Pose: Flipper touching under chin/beak */}
            {mood === "thinking" && (
              <g>
                <path
                  d="M 88 76 C 90 68, 96 60, 104 58 C 108 57, 110 63, 104 66 C 98 70, 94 76, 88 80 Z"
                  fill="#50a2f5"
                  stroke="#172554"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
                <ellipse cx="103" cy="61" rx="2.5" ry="3" fill="#ffffff" opacity="0.6" />
              </g>
            )}

            {/* D. Celebrating Pose: Right flipper raised high in victory! */}
            {mood === "celebrating" && (
              <g className="animate-bot-celebrate origin-[90px_74px]">
                <path
                  d="M 88 72 C 96 58, 110 42, 118 36 C 122 33, 126 38, 122 44 C 114 56, 100 70, 90 78 Z"
                  fill="#50a2f5"
                  stroke="#172554"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* E. Idle Pose: Relaxed swimming rest along flank */}
            {mood === "idle" && (
              <g>
                <path
                  d="M 88 74 C 92 76, 104 82, 108 90 C 110 94, 105 97, 100 95 C 92 90, 86 82, 86 78 Z"
                  fill="#50a2f5"
                  stroke="#172554"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        </svg>

        {/* Floating Status Badges */}
        {mood === "celebrating" && (
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black shadow-[0_0_12px_rgba(226,224,217,0.4)] animate-bounce">
            <Star className="h-3.5 w-3.5 fill-black" />
          </div>
        )}
        {mood === "thinking" && (
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-black shadow-[0_0_12px_rgba(226,224,217,0.4)] animate-spin">
            <Sparkles className="h-3.5 w-3.5 fill-black" />
          </div>
        )}
      </div>
    </div>
  );
}
