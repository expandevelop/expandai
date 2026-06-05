import type { AuthSession } from "@/types/expandai";

export const SESSION_STORAGE_KEY = "expandai:web:session";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_EXPANDAI_API_URL ?? "http://34.238.172.151/api/v1";

export function readSessionFromStorage(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}
