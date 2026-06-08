"use client";

import Link from "next/link";
import { LoginScreen } from "@/components/login-screen";
import { useAuth } from "@/components/auth-provider";
import { getDefaultPortalForRole, orderedPortals } from "@/lib/portal-config";
import { ExpandAiLogo, MeshBackground } from "@/components/ui/brand";
import { UserMenuStandalone } from "@/components/ui/user-menu";

export default function Home() {
  const { isBooting, session, currentUser } = useAuth();

  if (isBooting) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0D1E2D] text-[#CDD6DC]">
        <MeshBackground />
        <p className="relative z-10 text-sm text-[#8A9AA6]">
          Carregando a experiência ExpandAI...
        </p>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  const defaultPortal = getDefaultPortalForRole(currentUser.role);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D1E2D] text-[#CDD6DC] antialiased">
      <MeshBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#162A3D]/30 px-4 py-3 backdrop-blur-md">
            <ExpandAiLogo className="text-3xl" />
          </div>
          <UserMenuStandalone
            name={currentUser.name}
            email={currentUser.email}
            role={currentUser.role}
          />
        </div>

        {/* Hero */}
        <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-8 backdrop-blur-xl lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FF842A]">
            Bem-vindo de volta
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            Olá, {currentUser.name.split(" ")[0]}. Sua operação começa aqui.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#8A9AA6]">
            Cada público tem um portal dedicado, com leitura objetiva e navegação
            previsível. Acesse seu portal principal ou os relatórios do seu perfil.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={defaultPortal.route}
              className="inline-flex rounded-xl bg-[#FF842A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF842A]/30 transition hover:bg-[#E06D1B]"
            >
              Abrir {defaultPortal.title}
            </Link>
            <Link
              href={defaultPortal.reportsRoute}
              className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-5 py-3 text-sm font-semibold text-[#CDD6DC] transition hover:border-white/20 hover:text-white"
            >
              Ver relatórios do meu perfil
            </Link>
          </div>
        </section>

        {/* Portais */}
        <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {orderedPortals.map((portal) => (
            <article
              key={portal.key}
              className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6 backdrop-blur-xl transition duration-300 hover:border-white/15"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF842A]/12 text-sm font-semibold tracking-[0.12em] text-[#FF842A] ring-1 ring-[#FF842A]/20">
                {portal.icon}
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">
                {portal.badge}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                {portal.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#8A9AA6]">
                {portal.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href={portal.route}
                  className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-2.5 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href={portal.reportsRoute}
                  className="inline-flex rounded-xl border border-[#FF842A]/25 bg-[#FF842A]/10 px-4 py-2.5 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20"
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
