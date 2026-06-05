"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  ecosystemProfile?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type ModuleCard = {
  title: string;
  description: string;
  endpoint: string;
  profiles: string[];
};

const SESSION_STORAGE_KEY = "expandai:web:session";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_EXPANDAI_API_URL ?? "http://34.238.172.151/api/v1";

const moduleCards: ModuleCard[] = [
  {
    title: "Operadoras",
    description:
      "Consulta do cadastro mestre das operadoras conectadas ao ecossistema ExpandAI.",
    endpoint: "/operators",
    profiles: ["ADMIN", "OPERATOR"],
  },
  {
    title: "Partners",
    description:
      "Acompanhamento do ecossistema comercial de parceiros e sua atuação na plataforma.",
    endpoint: "/partners",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    title: "Catálogo de produtos",
    description:
      "Base comercial dos produtos publicados pelas operadoras com regras associadas.",
    endpoint: "/product-catalogs",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    title: "Oportunidades",
    description:
      "Pipeline comercial com filtros por operadora, partner, cliente, produto e estágio.",
    endpoint: "/opportunities",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    title: "Vendas",
    description:
      "Fechamentos comerciais integrados ao faturamento e ao sincronismo de status.",
    endpoint: "/sales",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    title: "Financeiro",
    description:
      "Regras comerciais, faturamento e split operacional publicados na API real.",
    endpoint: "/finance/billing-records",
    profiles: ["ADMIN", "OPERATOR"],
  },
];

function readSessionFromStorage(): AuthSession | null {
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

function persistSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

async function requestApi<T>(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Não foi possível concluir a operação solicitada.");
  }

  return (await response.json()) as T;
}

export default function Home() {
  const [email, setEmail] = useState("admin@expandai.com");
  const [password, setPassword] = useState("Expand@123");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [adminRolesPayload, setAdminRolesPayload] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = readSessionFromStorage();
    setSession(storedSession);
    setCurrentUser(storedSession?.user ?? null);
    setIsLoading(false);
  }, []);

  const visibleModules = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return moduleCards.filter((module) => module.profiles.includes(currentUser.role));
  }, [currentUser]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);
    setAdminRolesPayload(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Falha ao autenticar-se na plataforma.");
      }

      const authenticatedSession = (await response.json()) as AuthSession;
      setSession(authenticatedSession);
      setCurrentUser(authenticatedSession.user);
      persistSession(authenticatedSession);
      setFeedback("Sessão autenticada com sucesso na API real da ExpandAI.");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível autenticar-se na plataforma.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshProfile() {
    if (!session?.accessToken) {
      return;
    }

    setIsRefreshingProfile(true);
    setError(null);
    setFeedback(null);

    try {
      const user = await requestApi<AuthUser>("/users/me", session.accessToken);
      const nextSession = {
        ...session,
        user,
      };
      setCurrentUser(user);
      setSession(nextSession);
      persistSession(nextSession);
      setFeedback("Perfil autenticado recarregado a partir da API publicada.");
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Falha ao atualizar o perfil autenticado.",
      );
    } finally {
      setIsRefreshingProfile(false);
    }
  }

  async function loadAdminRoles() {
    if (!session?.accessToken) {
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      const payload = await requestApi<{ roles: string[] }>(
        "/users/roles",
        session.accessToken,
      );
      setAdminRolesPayload(JSON.stringify(payload, null, 2));
      setFeedback("Payload administrativo de roles carregado com sucesso.");
    } catch (rolesError) {
      setAdminRolesPayload(null);
      setError(
        rolesError instanceof Error
          ? rolesError.message
          : "Falha ao consultar a lista administrativa de perfis.",
      );
    }
  }

  function handleLogout() {
    setSession(null);
    setCurrentUser(null);
    setAdminRolesPayload(null);
    persistSession(null);
    setFeedback("Sessão local removida com sucesso.");
    setError(null);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando a camada web da ExpandAI...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              ExpandAI Platform
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Operação B2B conectada por autenticação real, perfis e fluxos publicados.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                Esta primeira entrega da camada web já consome a API real publicada na EC2,
                autentica por JWT, persiste a sessão em <strong>local storage</strong> e exibe
                um shell operacional alinhado aos módulos estratégicos da ExpandAI.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">API base</p>
                <p className="mt-2 text-sm font-medium text-cyan-100">{API_BASE_URL}</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Autenticação</p>
                <p className="mt-2 text-sm font-medium text-white">JWT + Refresh Token</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sessão web</p>
                <p className="mt-2 text-sm font-medium text-white">Persistida localmente</p>
              </article>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            {!session ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">Login inicial</h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Use a credencial publicada no checkpoint de autenticação para validar o
                    frontend contra a API real da ExpandAI.
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-200">E-mail</span>
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@expandai.com"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-200">Senha</span>
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite a senha de acesso"
                    />
                  </label>
                </div>
                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Autenticando..." : "Entrar na plataforma"}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    Sessão ativa
                  </p>
                  <h2 className="text-xl font-semibold text-white">{currentUser?.name}</h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Perfil autenticado: <strong>{currentUser?.role}</strong> · e-mail{" "}
                    <strong>{currentUser?.email}</strong>
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={refreshProfile}
                    disabled={isRefreshingProfile}
                    type="button"
                  >
                    {isRefreshingProfile ? "Atualizando perfil..." : "Recarregar /users/me"}
                  </button>
                  <button
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
                    onClick={handleLogout}
                    type="button"
                  >
                    Encerrar sessão local
                  </button>
                </div>
                {currentUser?.role === "ADMIN" ? (
                  <button
                    className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
                    onClick={loadAdminRoles}
                    type="button"
                  >
                    Validar endpoint administrativo /users/roles
                  </button>
                ) : null}
              </div>
            )}

            {feedback ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {feedback}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <pre className="whitespace-pre-wrap break-words">{error}</pre>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Contexto da sessão</h2>
              <p className="text-sm leading-6 text-slate-400">
                O payload abaixo representa o estado autenticado persistido localmente e a base
                que será reaproveitada na próxima etapa para app shell, guards de rota e consumo
                dos módulos operacionais.
              </p>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(
                {
                  apiBaseUrl: API_BASE_URL,
                  session,
                  currentUser,
                },
                null,
                2,
              )}
            </pre>
            {adminRolesPayload ? (
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-amber-400/20 bg-slate-950 p-4 text-xs leading-6 text-amber-100">
                {adminRolesPayload}
              </pre>
            ) : null}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Módulos visíveis por perfil</h2>
              <p className="text-sm leading-6 text-slate-400">
                A interface já apresenta um shell inicial orientado a perfil. Nesta fase, o foco
                está em login, estado autenticado e descoberta de módulos; a próxima etapa deve
                transformar estes cartões em rotas e telas de operação completas.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleModules.length > 0 ? (
                visibleModules.map((module) => (
                  <article
                    key={module.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {module.description}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-cyan-100">
                        Endpoint preparado: {module.endpoint}
                      </div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Perfis habilitados: {module.profiles.join(" · ")}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-sm leading-6 text-slate-400">
                  Autentique-se para visualizar os módulos disponibilizados ao perfil da sessão.
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
