"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, Blocks, BookOpen, Settings, Bot } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: FolderGit2, exact: true, tourId: "nav-projects" },
  { href: "/dashboard/templates", label: "Templates", icon: Blocks, exact: false, tourId: "nav-templates" },
  { href: "/dashboard/docs", label: "Documentation", icon: BookOpen, exact: false, tourId: "nav-docs" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false, tourId: "nav-settings" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const startFloatingTour = useUIStore((state) => state.startFloatingTour);

  return (
    <nav data-tour="sidebar-nav" className="p-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            data-tour={item.tourId}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-[background-color,color] outline-none focus:outline-none focus-visible:outline-none ${
              active
                ? "bg-white/10 text-white font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5"
                : "text-muted hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-accent" : ""}`} />
            {item.label}
          </Link>
        );
      })}

      {/* Guided Tour Summon Button */}
      <div data-tour="sidebar-tour" className="pt-3 mt-3 border-t border-white/5">
        <button
          onClick={() => startFloatingTour()}
          className="w-full text-left rounded-lg border border-white/10 bg-white/[0.02] p-2.5 transition-all hover:border-white/20 hover:bg-white/[0.05] group cursor-pointer"
          title="Start interactive guided tour with Leo"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/5 text-accent border border-white/10 group-hover:scale-105 transition-transform">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white/90 flex items-center gap-1.5">
                Guided Tour
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent/80 animate-ping" />
              </div>
              <div className="text-[10px] text-muted font-mono">Explore with Leo</div>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
}
