"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { GlassButton } from "@/components/ui/glass-button";

export function GuestButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleGuestSignIn = async () => {
    setLoading(true);
    try {
      await signIn("guest", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Guest sign in error:", err);
      setLoading(false);
    }
  };

  return (
    <GlassButton
      size="lg"
      variant="secondary"
      onClick={handleGuestSignIn}
      disabled={loading}
      className={`border-accent/40 bg-accent/15 hover:bg-accent/25 text-white hover:text-white transition-all shadow-[0_0_20px_rgba(45,212,191,0.15)] ${className || ""}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
      ) : (
        <Sparkles className="h-4 w-4 text-accent" />
      )}
      <span>Explore as Guest (Instant Demo)</span>
    </GlassButton>
  );
}

