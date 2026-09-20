"use client";

import { useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { GlassButton } from "@/components/ui/glass-button";

export function SignInButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <GlassButton
      size="lg"
      variant="primary"
      onClick={handleSignIn}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      Sign in with Google
    </GlassButton>
  );
}