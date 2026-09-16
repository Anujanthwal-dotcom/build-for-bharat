"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className}
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4 text-muted hover:text-white transition-colors" />
    </button>
  );
}