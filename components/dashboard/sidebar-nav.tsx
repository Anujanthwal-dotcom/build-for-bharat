"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderGit2, Blocks, BookOpen, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: FolderGit2, exact: true },
  { href: "/dashboard/templates", label: "Templates", icon: Blocks, exact: false },
  { href: "/dashboard/docs", label: "Documentation", icon: BookOpen, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, exact: false },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
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
    </nav>
  );
}
