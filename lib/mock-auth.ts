"use client";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

const MOCK_USER_KEY = "mindflow_mock_user";

export const MOCK_USER: MockUser = {
  id: "mock-user-1",
  name: "Alex Rivera",
  email: "alex@mindflow.dev",
  image: null,
};

export function getMockUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(MOCK_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export function setMockUser(user: MockUser = MOCK_USER): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
}

export function clearMockUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOCK_USER_KEY);
}