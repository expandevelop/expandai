"use client";

import Link from "next/link";
import { LoginScreen } from "@/components/login-screen";
import { useAuth } from "@/components/auth-provider";
import { getDefaultPortalForRole, orderedPortals } from "@/lib/portal-config";

export default function Home() {
  const { isBooting, session, currentUser } = useAuth();

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando a experiência ExpandAI...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  const defaultPortal = getDefaultPortalForRole(currentUser.role);

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))]" />
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-300">ExpandAI Platform</p>
              <h1 className="mt-4 text-4xl font-semibold text-white lg:text-5xl">
                Portais prontos para teste de usabilidade
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                A camada web agora passa a organizar a experiência em portais dedicados por perfil, com entrada moderna, navegação mais clara e superfícies próprias para dashboard e relatórios.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Sessão autenticada</p>
              <p className="mt-3 text-lg font-semibold text-white">{currentUser.name}</p>
              <p className="mt-1 text-sm text-slate-400">{currentUser.email}</p>
              <p className="mt-4 text-sm text-slate-300">
                Perfil atual: <span className="font-semibold text-white">{currentUser.role}</span>
              </p>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Acesso recomendado</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Seu portal principal</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Com base no papel autenticado, este é o melhor ponto de entrada para começar a testar a usabilidade da experiência segmentada.
            </p>
            <div className="mt-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200">{defaultPortal.badge}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{defaultPortal.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-200">{defaultPortal.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={defaultPortal.route}
                  className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Abrir dashboard
                </Link>
                <Link
                  href={defaultPortal.reportsRoute}
                  className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Abrir relatórios
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Objetivo desta etapa</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Experiência mais madura antes da homologação</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Este hub marca a transição do MVP funcional para uma experiência pronta para testes de navegação, percepção visual, leitura de dashboards e exploração dos relatórios por perfil.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          {orderedPortals.map((portal) => (
            <article
              key={portal.key}
              className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl"
            >
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${portal.accent}`} />
              <p className="mt-5 text-xs uppercase tracking-[0.24em] text-slate-500">{portal.badge}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{portal.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{portal.description}</p>
              <div className="mt-6 space-y-3">
                {portal.legacyModules.map((module) => (
                  <div key={module.href} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-sm font-medium text-white">{module.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={portal.route}
                  className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <Link
                  href={portal.reportsRoute}
                  className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
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
