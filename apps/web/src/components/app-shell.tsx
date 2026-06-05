"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { API_BASE_URL } from "@/lib/session";
import { useAuth } from "@/components/auth-provider";

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const {
    currentUser,
    visibleModules,
    isRefreshingProfile,
    feedback,
    error,
    rolesPayload,
    refreshProfile,
    signOut,
    loadAdminRoles,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/20">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                ExpandAI Platform
              </span>
              <div>
                <h1 className="text-xl font-semibold text-white">App Shell Operacional</h1>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Navegação autenticada sobre os módulos reais já publicados na API da ExpandAI.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessão atual</p>
              <p className="mt-3 text-sm font-semibold text-white">{currentUser?.name}</p>
              <p className="mt-1 text-xs text-slate-400">{currentUser?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                  {currentUser?.role ?? "Sem perfil"}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
                  {currentUser?.ecosystemProfile ?? "perfil não definido"}
                </span>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/"
                className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                  pathname === "/"
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                Visão geral
              </Link>
              {visibleModules.map((module) => (
                <Link
                  key={module.key}
                  href={module.href}
                  className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                    pathname === module.href
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <div className="font-medium">{module.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{module.endpoint}</div>
                </Link>
              ))}
            </nav>

            <div className="space-y-2">
              <button
                className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void refreshProfile()}
                disabled={isRefreshingProfile}
                type="button"
              >
                {isRefreshingProfile ? "Atualizando perfil..." : "Recarregar perfil"}
              </button>
              {currentUser?.role === "ADMIN" ? (
                <button
                  className="w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
                  onClick={() => void loadAdminRoles()}
                  type="button"
                >
                  Consultar roles administrativas
                </button>
              ) : null}
              <button
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-rose-400/40 hover:text-rose-100"
                onClick={signOut}
                type="button"
              >
                Encerrar sessão local
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400">
              <p className="uppercase tracking-[0.18em] text-slate-500">API base</p>
              <p className="mt-2 break-all text-cyan-100">{API_BASE_URL}</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{description}</p>
          </header>

          {feedback ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {feedback}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {rolesPayload ? (
            <pre className="overflow-x-auto rounded-2xl border border-amber-400/20 bg-slate-950 p-4 text-xs leading-6 text-amber-100">
              {rolesPayload}
            </pre>
          ) : null}

          <section>{children}</section>
        </div>
      </div>
    </div>
  );
}
