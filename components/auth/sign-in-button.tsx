"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { GlassButton } from "@/components/ui/glass-button";
import { GOOGLE_OATH_CONFIGURED } from "@/lib/auth";
import { MOCK_USER, setMockUser } from "@/lib/mock-auth";
import { useAuth } from "@/components/auth/auth-provider";

export function SignInButton({ className }: { className?: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    if (GOOGLE_OATH_CONFIGURED) {
      await signIn("google", { callbackUrl: "/dashboard" });
    } else {
      setMockUser(MOCK_USER);
      refresh();
      router.push("/dashboard");
    }
  };

  return (
    <GlassButton
      size="lg"
      variant={GOOGLE_OATH_CONFIGURED ? "primary" : "secondary"}
      onClick={handleSignIn}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      {GOOGLE_OATH_CONFIGURED ? "Sign in with Google" : "Start Building — No Signup"}
    </GlassButton>
  );
}