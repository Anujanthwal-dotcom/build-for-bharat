"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton({ className, isGuest }: { className?: string; isGuest?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        await fetch("/api/auth/guest-cleanup", { method: "POST" });
      }
    } catch (err) {
      console.error("Cleanup error before sign out:", err);
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className={className}
      aria-label={isGuest ? "Exit Guest Mode" : "Sign out"}
      title={isGuest ? "Exit Guest Mode (purges temporary data)" : "Sign out"}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-muted animate-spin" />
      ) : (
        <LogOut className="w-4 h-4 text-muted hover:text-white transition-colors" />
      )}
    </button>
  );
}