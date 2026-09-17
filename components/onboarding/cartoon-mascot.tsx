"use client";

import React from "react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type MascotMood = "waving" | "pointing" | "thinking" | "celebrating" | "idle";

interface CartoonMascotProps {
  mood?: MascotMood;
  speechText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * CartoonMascot: "Leo", the cute cartoon boy guide for MindFlow.
 * Features fluffy hair, expressive anime eyes, blush cheeks,
 * multiple smiles and distinct bodily positions.
 */
export function CartoonMascot({
  mood = "waving",
  speechText,
  className,
  size = "md",
}: CartoonMascotProps) {
  const sizeMap = {
    sm: "w-28 h-32",
    md: "w-36 h-40",
    lg: "w-48 h-52",
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Speech Bubble */}
      {speechText && (
        <div className="relative mb-2 max-w-[280px] animate-fade-in-up">
          <div className="relative rounded-2xl border border-white/10 bg-[#121214] px-3.5 py-2 text-xs font-medium text-zinc-100 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>Leo • Creator Guide</span>
            </div>
            <p className="mt-1 leading-relaxed text-zinc-300 text-[11px]">{speechText}</p>
          </div>
          {/* Speech Bubble Triangle Arrow */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[#121214]" />
        </div>
      )}

      {/* Mascot Body & Ambient Glow */}
      <div className={cn("relative flex items-center justify-center animate-mascot-bob", sizeMap[size])}>
        {/* Soft Ambient Halo behind the boy */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl transition-all duration-700 opacity-40",
            mood === "celebrating" && "bg-white/[0.08] scale-125",
            mood === "thinking" && "bg-white/[0.06] scale-110",
            mood === "pointing" && "bg-white/[0.06] scale-115",
            (mood === "waving" || mood === "idle") && "bg-white/[0.05]",
          )}
        />

        {/* The SVG Cartoon Boy Artwork */}
        <svg
          viewBox="0 0 160 180"
          className="relative z-10 w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Floating Sparkles for Celebrating Mode */}
          {mood === "celebrating" && (
            <g className="animate-pulse">
              <polygon points="25,20 28,26 34,28 28,30 25,36 22,30 16,28 22,26" fill="#fbbf24" />
              <polygon points="135,25 138,30 143,32 138,34 135,39 132,34 127,32 132,30" fill="#38bdf8" />
              <circle cx="28" cy="48" r="2.5" fill="#f43f5e" />
              <circle cx="132" cy="55" r="2.5" fill="#34d399" />
            </g>
          )}

          {/* Thinking lightbulb/idea spark */}
          {mood === "thinking" && (
            <g className="animate-bounce origin-[125px_30px]">
              <circle cx="125" cy="30" r="9" fill="#fef08a" opacity="0.9" />
              <polygon points="125,23 127,28 132,30 127,32 125,37 123,32 118,30 123,28" fill="#f59e0b" />
            </g>
          )}

          {/* 1. Body & Clothes (Hoodie) */}
          <g id="body-and-clothes">
            {/* Torso Hoodie */}
            <path
              d="M48 116 C 44 122, 42 145, 42 165 C 42 168, 118 168, 118 165 C 118 145, 116 122, 112 116 Z"
              fill="url(#hoodie-grad)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
            />

            {/* Hoodie Pocket Kangaroo Pouch */}
            <path
              d="M58 142 C 58 138, 102 138, 102 142 L 96 160 C 96 162, 64 162, 64 160 Z"
              fill="#18181b"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1.2"
            />

            {/* Hoodie Strings with Accent Beads */}
            <line x1="72" y1="118" x2="70" y2="134" stroke="#E2E0D9" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="70" cy="134" r="2" fill="#E2E0D9" />
            <line x1="88" y1="118" x2="90" y2="134" stroke="#E2E0D9" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="90" cy="134" r="2" fill="#E2E0D9" />

            {/* Tech Logo / Badge on chest */}
            <circle cx="80" cy="128" r="6" fill="#18181b" stroke="#E2E0D9" strokeWidth="1" />
            <path d="M78 126 L 82 128 L 78 130" stroke="#E2E0D9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hoodie Collar / Neckline */}
            <path
              d="M62 112 C 70 122, 90 122, 98 112 C 92 118, 68 118, 62 112 Z"
              fill="#27272a"
            />
          </g>

          {/* 2. Arms & Hands with distinct positions based on mood */}
          <g id="arms-and-hands">
            {/* A. Waving Pose */}
            {mood === "waving" && (
              <>
                {/* Left arm resting naturally */}
                <path
                  d="M45 118 C 36 128, 34 145, 42 152 C 45 150, 48 142, 49 135 Z"
                  fill="url(#arm-grad)"
                />
                <circle cx="43" cy="154" r="6" fill="#fed7aa" />

                {/* Right arm waving in the air */}
                <g className="animate-bot-wave origin-[114px_120px]">
                  <path
                    d="M112 118 C 124 110, 136 88, 134 76 C 130 74, 122 84, 114 102 Z"
                    fill="url(#arm-grad)"
                  />
                  {/* Waving Hand with cute cartoon fingers */}
                  <circle cx="134" cy="72" r="8" fill="#fed7aa" />
                  <ellipse cx="136" cy="65" rx="2.5" ry="4" fill="#fed7aa" />
                  <ellipse cx="139" cy="67" rx="2.5" ry="4" fill="#fed7aa" />
                  <ellipse cx="142" cy="72" rx="2.5" ry="3.5" fill="#fed7aa" />
                </g>
              </>
            )}

            {/* B. Pointing Pose */}
            {mood === "pointing" && (
              <>
                {/* Left hand tucked in hoodie pocket */}
                <path
                  d="M46 118 C 38 126, 42 144, 58 145 Z"
                  fill="url(#arm-grad)"
                />
                <circle cx="58" cy="144" r="5" fill="#fed7aa" />

                {/* Right arm dynamically pointing towards target/card */}
                <g className="animate-bot-point origin-[112px_120px]">
                  <path
                    d="M112 118 C 125 116, 142 112, 150 110 C 148 105, 138 108, 115 110 Z"
                    fill="url(#arm-grad)"
                  />
                  {/* Pointing hand with extended index finger */}
                  <circle cx="150" cy="110" r="6" fill="#fed7aa" />
                  <line x1="150" y1="110" x2="162" y2="108" stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" />
                  {/* Energy spark at fingertip */}
                  <circle cx="163" cy="108" r="3" fill="#38bdf8" className="animate-ping" />
                </g>
              </>
            )}

            {/* C. Thinking Pose */}
            {mood === "thinking" && (
              <>
                {/* Right hand on hip */}
                <path
                  d="M112 118 C 122 126, 120 142, 106 146 Z"
                  fill="url(#arm-grad)"
                />
                <circle cx="106" cy="146" r="6" fill="#fed7aa" />

                {/* Left arm bent upwards touching chin */}
                <g>
                  <path
                    d="M48 118 C 36 122, 38 105, 56 96 C 58 102, 54 114, 52 118 Z"
                    fill="url(#arm-grad)"
                  />
                  {/* Hand on cheek/chin */}
                  <circle cx="58" cy="95" r="7" fill="#fed7aa" />
                  <ellipse cx="62" cy="92" rx="2.5" ry="3.5" fill="#fed7aa" />
                </g>
              </>
            )}

            {/* D. Celebrating Pose (Both arms raised high in victory) */}
            {mood === "celebrating" && (
              <>
                {/* Left arm raised */}
                <g className="animate-bot-celebrate origin-[48px_120px]">
                  <path
                    d="M48 118 C 36 108, 26 84, 28 72 C 34 72, 40 86, 50 106 Z"
                    fill="url(#arm-grad)"
                  />
                  <circle cx="27" cy="69" r="8" fill="#fed7aa" />
                  <ellipse cx="25" cy="63" rx="2.5" ry="4" fill="#fed7aa" />
                </g>

                {/* Right arm raised */}
                <g className="animate-bot-celebrate origin-[112px_120px]">
                  <path
                    d="M112 118 C 124 108, 134 84, 132 72 C 126 72, 120 86, 110 106 Z"
                    fill="url(#arm-grad)"
                  />
                  <circle cx="133" cy="69" r="8" fill="#fed7aa" />
                  <ellipse cx="135" cy="63" rx="2.5" ry="4" fill="#fed7aa" />
                </g>
              </>
            )}

            {/* E. Idle Pose */}
            {mood === "idle" && (
              <>
                <path d="M46 118 C 36 126, 36 146, 44 152 Z" fill="url(#arm-grad)" />
                <circle cx="44" cy="154" r="6" fill="#fed7aa" />
                <path d="M114 118 C 124 126, 124 146, 116 152 Z" fill="url(#arm-grad)" />
                <circle cx="116" cy="154" r="6" fill="#fed7aa" />
              </>
            )}
          </g>

          {/* 3. Head & Cute Cartoon Face */}
          <g id="head-and-face">
            {/* Neck */}
            <rect x="73" y="104" width="14" height="12" rx="4" fill="#fed7aa" />

            {/* Ears */}
            <ellipse cx="48" cy="80" rx="6" ry="8" fill="#fed7aa" />
            <ellipse cx="48" cy="80" rx="3.5" ry="5" fill="#fbcfe8" opacity="0.6" />
            <ellipse cx="112" cy="80" rx="6" ry="8" fill="#fed7aa" />
            <ellipse cx="112" cy="80" rx="3.5" ry="5" fill="#fbcfe8" opacity="0.6" />

            {/* Main Face Contour */}
            <rect
              x="50"
              y="48"
              width="60"
              height="62"
              rx="24"
              fill="url(#skin-grad)"
            />

            {/* Soft Rosy Blushing Cheeks */}
            <ellipse cx="58" cy="84" rx="6" ry="3.5" fill="#f43f5e" opacity="0.35" />
            <ellipse cx="102" cy="84" rx="6" ry="3.5" fill="#f43f5e" opacity="0.35" />

            {/* Small Cute Nose */}
            <path
              d="M79 81 C 80 83, 82 83, 83 81"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Eyebrows based on mood */}
            {mood === "thinking" ? (
              <>
                <path d="M58 64 Q 65 60 72 63" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                {/* One eyebrow raised higher! */}
                <path d="M88 60 Q 95 56 102 62" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </>
            ) : mood === "pointing" ? (
              <>
                {/* Determined, confident curved brows */}
                <path d="M58 65 Q 66 61 73 65" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M87 64 Q 94 60 102 64" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <path d="M58 64 Q 65 61 72 64" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path d="M88 64 Q 95 61 102 64" stroke="#451a03" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Dynamic Eyes */}
            {mood === "celebrating" ? (
              // Happy squinting / curved crescent eyes ( ^ _ ^ )
              <g>
                <path d="M58 74 Q 66 66 74 74" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M86 74 Q 94 66 102 74" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            ) : mood === "thinking" ? (
              // Curious eyes looking up and to the right
              <g>
                <circle cx="66" cy="72" r="7.5" fill="#1c1917" />
                <ellipse cx="68" cy="70" rx="4" ry="4.5" fill="#38bdf8" />
                <circle cx="69" cy="69" r="2" fill="#ffffff" />
                <circle cx="66" cy="74" r="1.2" fill="#ffffff" />

                <circle cx="94" cy="72" r="7.5" fill="#1c1917" />
                <ellipse cx="96" cy="70" rx="4" ry="4.5" fill="#38bdf8" />
                <circle cx="97" cy="69" r="2" fill="#ffffff" />
                <circle cx="94" cy="74" r="1.2" fill="#ffffff" />
              </g>
            ) : mood === "pointing" ? (
              // Focused gaze looking eagerly right towards the arrow
              <g>
                <circle cx="67" cy="73" r="7.5" fill="#1c1917" />
                <ellipse cx="69" cy="73" rx="4.5" ry="5" fill="#0284c7" />
                <circle cx="70" cy="71" r="2.2" fill="#ffffff" />
                <circle cx="67" cy="75" r="1.2" fill="#ffffff" />

                <circle cx="95" cy="73" r="7.5" fill="#1c1917" />
                <ellipse cx="97" cy="73" rx="4.5" ry="5" fill="#0284c7" />
                <circle cx="98" cy="71" r="2.2" fill="#ffffff" />
                <circle cx="95" cy="75" r="1.2" fill="#ffffff" />
              </g>
            ) : (
              // Default sparkling anime eyes with blinking animation
              <g className="animate-bot-blink">
                <circle cx="66" cy="73" r="7.5" fill="#1c1917" />
                <ellipse cx="66" cy="73" rx="4.5" ry="5" fill="#2563eb" />
                <circle cx="68" cy="71" r="2.2" fill="#ffffff" />
                <circle cx="64" cy="75" r="1.2" fill="#ffffff" />

                <circle cx="94" cy="73" r="7.5" fill="#1c1917" />
                <ellipse cx="94" cy="73" rx="4.5" ry="5" fill="#2563eb" />
                <circle cx="96" cy="71" r="2.2" fill="#ffffff" />
                <circle cx="92" cy="75" r="1.2" fill="#ffffff" />
              </g>
            )}

            {/* Dynamic Mouth / Smile */}
            {mood === "celebrating" ? (
              // Big joyful open grin with teeth and pink tongue
              <g>
                <path
                  d="M72 88 Q 80 102 88 88 Z"
                  fill="#991b1b"
                  stroke="#7f1d1d"
                  strokeWidth="1.2"
                />
                {/* Upper teeth white strip */}
                <path d="M74 88 Q 80 91 86 88" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Pink tongue */}
                <path d="M75 96 Q 80 94 85 96" fill="#f43f5e" />
              </g>
            ) : mood === "thinking" ? (
              // Curious tilted smirk
              <path
                d="M75 90 Q 82 92 86 88"
                stroke="#1c1917"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : mood === "pointing" ? (
              // Enthusiastic confident smile
              <path
                d="M72 88 Q 80 97 88 88"
                stroke="#1c1917"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Warm friendly curved smile
              <path
                d="M73 88 Q 80 95 87 88"
                stroke="#1c1917"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* 4. Fluffy Modern Cartoon Hair */}
          <g id="fluffy-hair">
            {/* Hair Base Layer Behind/Above */}
            <path
              d="M44 56 C 42 32, 60 22, 80 22 C 100 22, 118 32, 116 56 C 122 52, 124 64, 118 72 C 114 62, 114 50, 108 44 C 98 34, 62 34, 52 44 C 46 50, 46 62, 42 72 C 36 64, 38 52, 44 56 Z"
              fill="url(#hair-dark)"
            />

            {/* Fluffy Hair Front Bangs & Tufts */}
            <path
              d="M46 52 C 54 36, 72 32, 84 34 C 96 32, 112 36, 114 52 C 110 52, 106 48, 98 46 C 92 56, 84 58, 80 50 C 76 58, 68 56, 62 46 C 56 48, 50 52, 46 52 Z"
              fill="url(#hair-light)"
            />

            {/* Playful Cowlick / Hair Tuft on Top */}
            <path
              d="M78 24 C 80 14, 88 12, 92 16 C 88 18, 86 22, 82 24 Z"
              fill="#78350f"
            />
            <path
              d="M74 24 C 72 16, 66 14, 62 18 C 66 20, 68 22, 72 24 Z"
              fill="#92400e"
            />

            {/* Golden/Warm Highlights */}
            <path
              d="M58 38 Q 68 34 76 38"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M86 38 Q 94 34 102 38"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
            />
          </g>

          {/* Gradients */}
          <defs>
            <linearGradient id="skin-grad" x1="50" y1="48" x2="110" y2="110" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffedd5" />
              <stop offset="1" stopColor="#fed7aa" />
            </linearGradient>

            <linearGradient id="hoodie-grad" x1="42" y1="116" x2="118" y2="168" gradientUnits="userSpaceOnUse">
              <stop stopColor="#27272a" />
              <stop offset="0.5" stopColor="#1c1917" />
              <stop offset="1" stopColor="#18181b" />
            </linearGradient>

            <linearGradient id="arm-grad" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#27272a" />
              <stop offset="1" stopColor="#18181b" />
            </linearGradient>

            <linearGradient id="hair-dark" x1="40" y1="20" x2="120" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#78350f" />
              <stop offset="1" stopColor="#451a03" />
            </linearGradient>

            <linearGradient id="hair-light" x1="46" y1="32" x2="114" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#b45309" />
              <stop offset="0.5" stopColor="#92400e" />
              <stop offset="1" stopColor="#78350f" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating status badge */}
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
