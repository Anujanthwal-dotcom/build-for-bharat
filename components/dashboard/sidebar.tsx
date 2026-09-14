"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FolderKanban,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { clearMockUser } from "@/lib/mock-auth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/templates", label: "Templates", icon: BookOpen },
  { href: "/dashboard/docs", label: "Documentation", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mockUser, refresh } = useAuth();

  const signOut = async () => {
    clearMockUser();
    refresh();
    try {
      await (await import("next-auth/react")).signOut({ redirect: false });
    } catch {}
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/[0.07] bg-neutral-950/80 backdrop-blur-xl transition-all duration-200",
        collapsed ? "w-14" : "w-52",
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="glass-card relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/50 to-cyan-500/40">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-mono text-sm font-bold tracking-tight text-white">{APP_NAME}</span>
        )}
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <TooltipProvider key={item.href} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.07] p-3">
        <div className="mb-2 flex items-center gap-2.5">
          <UserAvatar />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-medium text-zinc-200">
                {mockUser?.name ?? "Guest"}
              </p>
              <p className="truncate font-mono text-[10px] text-zinc-500">
                {mockUser?.email ?? "not signed in"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}