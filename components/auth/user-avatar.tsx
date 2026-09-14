"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

export function UserAvatar({ className }: { className?: string }) {
  const { mockUser } = useAuth();

  const name = mockUser?.name ?? "Guest";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (mockUser?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mockUser.image}
        alt={name}
        className={cn("h-8 w-8 rounded-full border border-white/10 object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        "bg-gradient-to-br from-violet-600/60 to-cyan-500/60 text-[11px] font-semibold text-white",
        "border border-white/10",
        className,
      )}
    >
      {initials}
    </div>
  );
}