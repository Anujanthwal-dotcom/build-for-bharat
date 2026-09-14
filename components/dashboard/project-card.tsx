"use client";

import Link from "next/link";
import { FileText, Link as LinkIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { MiniMapPreview } from "@/components/mindmap/minimap-preview";
import { formatRelativeTime } from "@/lib/utils";
import { getMockGraphForProject } from "@/lib/mock-data";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const graph = getMockGraphForProject(project.id);

  return (
    <Link href={`/project/${project.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-xl">
      <GlassCard interactive className="group relative h-full overflow-hidden p-0">
        <div className={`h-40 bg-gradient-to-br ${project.gradient ?? "from-violet-600/40 to-cyan-500/20"}`}>
          <div className="dot-grid absolute inset-0 opacity-30" />
          <div className="relative z-10 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <MiniMapPreview graph={graph} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <h3 className="font-mono text-[13px] font-bold text-zinc-100">{project.name}</h3>
          {project.description && (
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="violet">{project.nodeCount} nodes</Badge>
            {project.sources?.map((source) => (
              <Badge key={source.id} tone={source.type === "url" ? "cyan" : source.type === "pdf" ? "amber" : "zinc"}>
                {source.type === "url" ? (
                  <LinkIcon className="h-2.5 w-2.5" />
                ) : (
                  <FileText className="h-2.5 w-2.5" />
                )}
                {source.label}
              </Badge>
            ))}

            <span className="ml-auto font-mono text-[10px] text-zinc-600">
              {formatRelativeTime(project.updatedAt)}
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}