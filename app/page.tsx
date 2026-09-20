import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/auth/sign-in-button";
import { GuestButton } from "@/components/auth/guest-button";
import { LandingHeader } from "@/components/landing/landing-header";
import { MiniPlayground } from "@/components/landing/mini-playground";
import { InteractiveFeatureModels } from "@/components/landing/interactive-feature-models";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-background dot-grid mesh-bg scroll-smooth text-foreground">
      {/* Sticky Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Ambient Graph Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex justify-center items-center overflow-hidden">
          <div className="w-[850px] h-[650px] border border-white/5 rounded-full absolute animate-[spin_50s_linear_infinite]" />
          <div className="w-[650px] h-[450px] border border-white/10 rounded-full absolute animate-[spin_35s_linear_infinite_reverse]" />
          <div className="w-20 h-20 bg-accent/5 border border-white/15 rounded-xl absolute top-1/4 left-1/5 backdrop-blur-md animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="w-28 h-16 bg-blue-500/5 border border-blue-500/20 rounded-xl absolute bottom-1/4 right-1/5 backdrop-blur-md animate-[pulse_5s_ease-in-out_infinite_1s]" />
        </div>

        {/* Hero Content */}
        <div className="z-10 flex flex-col items-center space-y-6 max-w-4xl mx-auto animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass rounded-full text-xs font-mono text-white/80 border border-white/10 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Next-Gen Visual Knowledge Architecture</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white leading-[1.15]">
            Turn raw documentation into <br />
            <span className="text-accent font-mono">visual mindmaps.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Instantly ingest whitepapers, GitHub repos, API documentation, and notes into strictly structured, aesthetic mental models. Built for engineers, researchers, and technical creators.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-black font-medium px-8 py-3.5 rounded-lg transition-all shadow-[0_0_25px_rgba(226,224,217,0.3)] hover:shadow-[0_0_35px_rgba(226,224,217,0.45)] text-sm"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <GuestButton className="w-full sm:w-auto !py-3.5 !px-6 !text-sm !rounded-lg" />
                <SignInButton className="w-full sm:w-auto !py-3.5 !px-6 !text-sm !rounded-lg" />
              </>
            )}
          </div>

          {/* Value props subtext */}
          <p className="text-white/40 text-xs font-mono">
            {session?.user
              ? "Welcome back — your synced graphs are ready in the dashboard."
              : "Zero friction • Guest mode creates an instant session with no login required."}
          </p>

          {/* Highlight badges strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-left">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-accent shrink-0" />
              <div className="text-xs font-mono">
                <p className="text-white font-medium">Sub-5s Extraction</p>
                <p className="text-white/40 text-[10px]">Parallel LLM Parsing</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs font-mono">
                <p className="text-white font-medium">Dagre Auto-Layout</p>
                <p className="text-white/40 text-[10px]">Zero Collision Mesh</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-xs font-mono">
                <p className="text-white font-medium">Multimodal Sources</p>
                <p className="text-white/40 text-[10px]">PDFs, URLs & Notes</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
              <Download className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="text-xs font-mono">
                <p className="text-white font-medium">Zero Lock-In</p>
                <p className="text-white/40 text-[10px]">JSON, Markdown & PNG</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Miniature Playground Section */}
      <section id="playground" className="scroll-mt-20 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Miniature Mindmap Editor</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Experience the Canvas <span className="text-accent font-mono">Live</span>
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Test drive our real graph engine below. Drag concepts, click to inspect deep technical breakdowns, spawn connected subcards, link handles, or trigger Dagre auto-layout.
          </p>
        </div>

        {/* The Live Interactive Canvas Component */}
        <MiniPlayground />
      </section>

      {/* Interactive Feature Models Section */}
      <InteractiveFeatureModels />

      {/* 3-Step Workflow Section */}
      <section id="how-it-works" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-white/70">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
            <span>The 3-Step Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            From Chaotic Text to <span className="text-accent font-mono">Crystal Clarity</span>
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            MindFlow replaces hours of manual diagramming with an intelligent, multi-stage graph extraction pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d12]/80 backdrop-blur-md p-6 space-y-4 hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-semibold text-white">Dump & Ingest Sources</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-mono">
              Paste URLs to API documentation, upload multi-page research PDFs, or dump unformatted raw notes into the project ingestion window.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d12]/80 backdrop-blur-md p-6 space-y-4 hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-semibold text-white">Synthesize Graph Entities</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-mono">
              Our extraction agent parses hierarchical dependencies, categorizes concepts by domain layer, and computes Dagre collision-free layout coordinates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-white/10 bg-[#0d0d12]/80 backdrop-blur-md p-6 space-y-4 hover:border-white/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-semibold text-white">Explore, Expand & Export</h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-mono">
              Navigate the interactive viewport, click any node to inspect synthesized code and takeaways, spawn child subcards, and export to Markdown or PNG.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-2xl p-8 sm:p-12 text-center space-y-6 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-xs font-mono text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready in Seconds</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white max-w-xl mx-auto leading-tight">
            Start transforming your documentation today.
          </h2>

          <p className="text-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Jump in right now with instant Guest Mode or sign in with Google to sync and save your mindmaps across devices.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-black font-medium px-8 py-3.5 rounded-lg transition-all shadow-[0_0_20px_rgba(226,224,217,0.3)] text-sm"
              >
                <span>Open Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <GuestButton className="w-full sm:w-auto !py-3.5 !px-6 !text-sm !rounded-lg" />
                <SignInButton className="w-full sm:w-auto !py-3.5 !px-6 !text-sm !rounded-lg" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}