"use client";

import { useState, useCallback } from 'react';
import { Search, Plus, BrainCircuit, MoreHorizontal, Pencil, Copy, Trash2, Check, X } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import DumpWindowModal from '@/components/dump-window';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  nodesCount: number;
  sourcesCount: number;
  lastEdited: string;
}

interface DashboardClientProps {
  projects: Project[];
}

export default function DashboardClient({ projects }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const openDumpWindow = useUIStore((state) => state.openDumpWindow);

  const filtered = projects.filter(
    (p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between flex-shrink-0 bg-white/[0.01]">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <h2 className="text-xl font-semibold text-white/90 tracking-tight mb-6">Recent Mindmaps</h2>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}

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
            ) : projects.length > 0 ? (
              <p className="text-sm text-muted py-8 text-center">No projects match your search.</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <BrainCircuit className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
                <p className="text-sm text-muted text-center max-w-sm mb-6">
                  You haven&apos;t created any mindmaps yet. Start a new extraction to turn your raw documentation into visual mind maps.
                </p>
                <button
                  onClick={openDumpWindow}
                  className="flex items-center gap-2 bg-accent text-black font-medium px-5 py-2.5 rounded-md hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(226,224,217,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  Start New Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DumpWindowModal />
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [isBusy, setIsBusy] = useState(false);

  const handleRename = useCallback(async () => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === project.name) {
      setIsRenaming(false);
      setEditedName(project.name);
      return;
    }
    setIsBusy(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      setIsRenaming(false);
      router.refresh();
    } finally {
      setIsBusy(false);
    }
  }, [editedName, project.id, project.name, router]);

  const handleDuplicate = useCallback(async () => {
    setIsBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.projectId) {
        router.push(`/project/${data.projectId}`);
      } else {
        router.refresh();
      }
    } finally {
      setIsBusy(false);
      setMenuOpen(false);
    }
  }, [project.id, router]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setIsBusy(true);
    try {
      await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsBusy(false);
      setMenuOpen(false);
    }
  }, [project.id, project.name, router]);

  return (
    <div className="relative group">
      <Link href={`/project/${project.id}`} className="block">
        <div className="glass rounded-lg p-5 flex flex-col h-full hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-accent/30 transition-colors">
              <BrainCircuit className="w-4 h-4 text-accent/80" />
            </div>
            <span className="text-xs font-mono text-muted">{project.lastEdited}</span>
          </div>

          {isRenaming ? (
            <div className="flex items-center gap-1 mb-1">
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") { setIsRenaming(false); setEditedName(project.name); } }}
                autoFocus
                className="flex-1 bg-black/40 border border-accent/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
                disabled={isBusy}
              />
              <button onClick={handleRename} className="p-0.5 text-emerald-400 hover:text-emerald-300" disabled={isBusy}><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => { setIsRenaming(false); setEditedName(project.name); }} className="p-0.5 text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <h3 className="text-base font-medium text-white/90 mb-1 group-hover:text-accent transition-colors truncate">
              {project.name}
            </h3>
          )}

          <div className="mt-auto pt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded text-[10px] font-mono text-muted border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              {project.nodesCount} nodes
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
              <span>{project.sourcesCount} sources</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Kebab menu */}
      <div className="absolute top-3 right-3">
        <button
          onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen); }}
          className="p-1 rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 mt-1 w-36 bg-[#141418] border border-white/10 rounded-lg shadow-xl z-50 py-1 animate-fade-in"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              onClick={(e) => { e.preventDefault(); setIsRenaming(true); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors"
              disabled={isBusy}
            >
              <Pencil className="w-3.5 h-3.5" /> Rename
            </button>
            <button
              onClick={(e) => { e.preventDefault(); handleDuplicate(); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/[0.06] transition-colors"
              disabled={isBusy}
            >
              <Copy className="w-3.5 h-3.5" /> Duplicate
            </button>
            <div className="h-px bg-white/5 mx-2 my-1" />
            <button
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-white/[0.06] transition-colors"
              disabled={isBusy}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}