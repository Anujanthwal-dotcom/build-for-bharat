"use client";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Sparkles } from "lucide-react";

export function HeroCard() {
  return (
    <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-6 p-8 sm:p-12">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/60 to-cyan-500/60 shadow-glow">
          <Sparkles className="h-5.5 w-5.5 text-white" />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">{APP_NAME}</span>
      </div>

      <div className="glass-card relative w-full rounded-2xl px-8 py-10 text-center shadow-glass">
        <h1 className="font-mono text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
          {APP_TAGLINE}
        </h1>
        <p className="mt-3 font-mono text-sm leading-relaxed text-zinc-400">
          Paste documentation links, drop a PDF, or paste your raw notes — watch a
          rich, interactive mind map unfold in seconds.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3">
          <SignInButton className="w-full sm:w-auto" />
          <p className="font-mono text-[11px] text-zinc-500">
            Free for hackathon projects · No signup friction
          </p>
        </div>
      </div>

      <div className="flex gap-2 text-[11px] font-medium text-zinc-500">
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">React Flow</span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">V8</span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">Docker</span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">GraphQL</span>
        <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1">Node.js</span>
      </div>
    </div>
  );
}