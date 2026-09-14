"use client";

import { Search, Plus, FileText, Link as LinkIcon, File, BrainCircuit } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import DumpWindowModal from '@/components/dump-window';
import Link from 'next/link';

interface DashboardClientProps {
  projects: {
    id: string;
    name: string;
    nodesCount: number;
    sourcesCount: number;
    lastEdited: string;
  }[];
}

export default function DashboardClient({ projects }: DashboardClientProps) {
  const openDumpWindow = useUIStore((state) => state.openDumpWindow);

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0 bg-white/[0.01]">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
          />
        </div>
        
        <button 
          onClick={openDumpWindow}
          className="flex items-center gap-2 bg-accent text-black font-medium px-4 py-1.5 rounded-md hover:bg-accent/90 transition-colors text-sm shadow-[0_0_15px_rgba(226,224,217,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 dot-grid">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div>
            <h2 className="text-xl font-semibold text-white/90 tracking-tight mb-6">Recent Masterclasses</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              {/* Empty State / Add New Card */}
              <button 
                onClick={openDumpWindow}
                className="group border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-muted group-hover:text-white" />
                </div>
                <span className="text-sm font-medium text-muted group-hover:text-white">Start New Extraction</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <DumpWindowModal />
    </>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/project/${project.id}`} className="block group">
      <div className="glass rounded-lg p-5 flex flex-col h-full hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-start mb-4">
          <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-accent/30 transition-colors">
            <BrainCircuit className="w-4 h-4 text-accent/80" />
          </div>
          <span className="text-xs font-mono text-muted">{project.lastEdited}</span>
        </div>
        
        <h3 className="text-base font-medium text-white/90 mb-1 group-hover:text-accent transition-colors truncate">
          {project.name}
        </h3>
        
        <div className="mt-auto pt-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded text-[10px] font-mono text-muted border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            {project.nodesCount} nodes
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
            <FileText className="w-3 h-3" />
            {project.sourcesCount} sources
          </div>
        </div>
      </div>
    </Link>
  );
}
