"use client";

import { createContext, useEffect, useContext, useState, useCallback } from "react";
import { getMockUser, type MockUser } from "@/lib/mock-auth";

interface AuthState {
  mockUser: MockUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => void;
}

const AuthContext = createContext<AuthState>({
  mockUser: null,
  status: "loading",
  refresh: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mockUser, setMockUser] = useState<MockUser | null>(() =>
    typeof window !== "undefined" ? getMockUser() : null,
  );
  const [status, setStatus] = useState<AuthState["status"]>(() =>
    typeof window !== "undefined" && getMockUser() ? "authenticated" : "unauthenticated",
  );

  const refresh = useCallback(() => {
    const user = getMockUser();
    setMockUser(user);
    setStatus(user ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ mockUser, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}