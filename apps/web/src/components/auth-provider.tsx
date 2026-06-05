"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, fetchRoles, login } from "@/lib/api";
import {
  persistSession,
  readSessionFromStorage,
  SESSION_UPDATED_EVENT,
} from "@/lib/session";
import { getModulesForRole } from "@/lib/modules";
import type { AuthSession, AuthUser } from "@/types/expandai";

type AuthContextValue = {
  isBooting: boolean;
  isSubmitting: boolean;
  isRefreshingProfile: boolean;
  session: AuthSession | null;
  currentUser: AuthUser | null;
  visibleModules: ReturnType<typeof getModulesForRole>;
  feedback: string | null;
  error: string | null;
  rolesPayload: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  loadAdminRoles: () => Promise<void>;
  clearMessages: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [rolesPayload, setRolesPayload] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);

  useEffect(() => {
    const storedSession = readSessionFromStorage();
    setSession(storedSession);
    setCurrentUser(storedSession?.user ?? null);
    setIsBooting(false);

    function handleSessionUpdated(event: Event) {
      const customEvent = event as CustomEvent<AuthSession | null>;
      setSession(customEvent.detail ?? null);
      setCurrentUser(customEvent.detail?.user ?? null);
    }

    window.addEventListener(SESSION_UPDATED_EVENT, handleSessionUpdated as EventListener);

    return () => {
      window.removeEventListener(
        SESSION_UPDATED_EVENT,
        handleSessionUpdated as EventListener,
      );
    };
  }, []);

  const visibleModules = useMemo(
    () => getModulesForRole(currentUser?.role),
    [currentUser?.role],
  );

  const clearMessages = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsSubmitting(true);
    setRolesPayload(null);
    setFeedback(null);
    setError(null);

    try {
      const authenticatedSession = await login(email, password);
      persistSession(authenticatedSession);
      setSession(authenticatedSession);
      setCurrentUser(authenticatedSession.user);
      setFeedback("Sessão autenticada com sucesso na API real da ExpandAI.");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível autenticar-se na plataforma.",
      );
      throw loginError;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(() => {
    persistSession(null);
    setSession(null);
    setCurrentUser(null);
    setRolesPayload(null);
    setFeedback("Sessão local removida com sucesso.");
    setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    setIsRefreshingProfile(true);
    setFeedback(null);
    setError(null);

    try {
      const user = await fetchCurrentUser(session.accessToken);
      const nextSession = {
        ...session,
        user,
      };
      persistSession(nextSession);
      setSession(nextSession);
      setCurrentUser(user);
      setFeedback("Perfil autenticado recarregado a partir do endpoint /users/me.");
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Falha ao atualizar o perfil autenticado.",
      );
      throw profileError;
    } finally {
      setIsRefreshingProfile(false);
    }
  }, [session]);

  const loadAdminRoles = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    setFeedback(null);
    setError(null);

    try {
      const payload = await fetchRoles(session.accessToken);
      setRolesPayload(JSON.stringify(payload, null, 2));
      setFeedback("Payload administrativo de roles carregado com sucesso.");
    } catch (rolesError) {
      setRolesPayload(null);
      setError(
        rolesError instanceof Error
          ? rolesError.message
          : "Falha ao consultar a lista administrativa de perfis.",
      );
      throw rolesError;
    }
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isBooting,
      isSubmitting,
      isRefreshingProfile,
      session,
      currentUser,
      visibleModules,
      feedback,
      error,
      rolesPayload,
      signIn,
      signOut,
      refreshProfile,
      loadAdminRoles,
      clearMessages,
    }),
    [
      clearMessages,
      currentUser,
      error,
      feedback,
      isBooting,
      isRefreshingProfile,
      isSubmitting,
      loadAdminRoles,
      refreshProfile,
      rolesPayload,
      session,
      signIn,
      signOut,
      visibleModules,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider.");
  }

  return context;
}
