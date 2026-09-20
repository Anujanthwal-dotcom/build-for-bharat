import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#070709] py-12 text-muted text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent/15 border border-accent/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-accent" />
          </div>
          <span className="text-white font-semibold tracking-tight text-sm">MindFlow</span>
          <span className="text-white/40 text-[11px]">
            — Turn raw documentation into visual mindmaps.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-6 text-white/60">
          <a href="#playground" className="hover:text-white transition-colors">
            Playground
          </a>
          <a href="#interactive-models" className="hover:text-white transition-colors">
            Models
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#templates" className="hover:text-white transition-colors">
            Templates
          </a>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Tech Badges */}
        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <span>Built with Next.js & XYFlow</span>
          <span>•</span>
          <span>© {new Date().getFullYear()} MindFlow</span>
        </div>
      </div>
    </footer>
  );
}

