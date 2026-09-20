"use client";

import Link from "next/link";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { GuestButton } from "@/components/auth/guest-button";
import { SignInButton } from "@/components/auth/sign-in-button";

export function LandingHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-accent/60 group-hover:bg-accent/20">
            <BrainCircuit className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              MindFlow
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/10 text-accent/90 border border-accent/20">
                v1.0
              </span>
            </span>
            <span className="text-[10px] font-mono text-white/40 -mt-0.5">
              Knowledge Graph Synthesizer
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-white/60">
          <a
            href="#playground"
            className="hover:text-white transition-colors py-1 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Playground
          </a>
          <a href="#interactive-models" className="hover:text-white transition-colors py-1">
            Miniature Models
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors py-1">
            How It Works
          </a>
          <a href="#templates" className="hover:text-white transition-colors py-1">
            Templates
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-accent text-black hover:bg-accent/90 px-4 py-2 rounded-md font-medium text-xs transition-all shadow-[0_0_15px_rgba(226,224,217,0.25)] hover:shadow-[0_0_20px_rgba(226,224,217,0.4)]"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <div className="hidden sm:block">
                <GuestButton className="!py-1.5 !px-3.5 !text-xs !rounded-md" />
              </div>
              <SignInButton className="!py-1.5 !px-3.5 !text-xs !rounded-md" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
