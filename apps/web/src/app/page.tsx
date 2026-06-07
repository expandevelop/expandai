"use client";

import Link from "next/link";
import { LoginScreen } from "@/components/login-screen";
import { useAuth } from "@/components/auth-provider";
import { getDefaultPortalForRole, orderedPortals } from "@/lib/portal-config";

export default function Home() {
  const { isBooting, session, currentUser } = useAuth();

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-500">Carregando a experiência ExpandAI...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  const defaultPortal = getDefaultPortalForRole(currentUser.role);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,29,47,0.06)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a]" />
          <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#16a34a]">Expand AI</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 lg:text-5xl">
                Uma entrada mais limpa para cada público da plataforma
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                A experiência foi reorganizada para separar claramente os acessos de Expand, Operadora, Partner e Cliente Final, com menos ruído visual, mais hierarquia e navegação mais previsível.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={defaultPortal.route}
                  className="inline-flex rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/10 px-5 py-3 text-sm font-semibold text-[#0f5132] transition hover:bg-[#16a34a]/15"
                >
                  Abrir meu portal principal
                </Link>
                <Link
                  href={defaultPortal.reportsRoute}
                  className="inline-flex rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  Ver relatórios do meu perfil
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Sessão autenticada</p>
              <p className="mt-4 text-xl font-semibold text-slate-950">{currentUser.name}</p>
              <p className="mt-2 text-sm text-slate-600">{currentUser.email}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#16a34a]/20 bg-[#16a34a]/10 px-3 py-1 text-xs font-medium text-[#0f5132]">
                  {currentUser.role}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {currentUser.ecosystemProfile ?? "perfil não definido"}
                </span>
              </div>
              <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Acesso recomendado</p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">{defaultPortal.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{defaultPortal.description}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {orderedPortals.map((portal) => (
            <article
              key={portal.key}
              className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,29,47,0.05)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a] text-sm font-semibold tracking-[0.16em] text-white">
                {portal.icon}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#16a34a]">{portal.badge}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{portal.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{portal.description}</p>
              <div className="mt-6 space-y-3">
                {portal.legacyModules.slice(0, 2).map((module) => (
                  <div key={module.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">{module.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={portal.route}
                  className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                >
                  Dashboard
                </Link>
                <Link
                  href={portal.reportsRoute}
                  className="inline-flex rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/10 px-4 py-3 text-sm font-semibold text-[#0f5132] transition hover:bg-[#16a34a]/15"
                >
                  Relatórios
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
