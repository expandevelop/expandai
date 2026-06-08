"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";

export default function ClientsPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );

  const canAccess = visibleModules.some((module) => module.key === "clients");

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando clientes...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Cadastro mestre"
      title="Clientes do ecossistema ExpandAI"
      description="Esta rota consolida a base de clientes visível ao perfil autenticado, com contexto operacional para navegação, relacionamento comercial e acompanhamento cadastral por entidade."
    >
      {canAccess ? (
        <>
          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Clientes disponíveis"
              value={String(metrics.clients)}
              description="Quantidade total retornada pela API real para o perfil autenticado nesta sessão."
            />
            <MetricCard
              label="Oportunidades abertas"
              value={String(metrics.openOpportunities)}
              description="Volume atual do pipeline que pode se relacionar aos clientes já cadastrados."
            />
            <MetricCard
              label="Sincronização"
              value={isLoading ? "Em andamento" : "Atualizada"}
              description="Estado do último carregamento desta visão operacional dedicada."
            />
          </section>

          <section className="mt-6 rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Base operacional"
                title="Clientes visíveis ao perfil autenticado"
                description="Cada registro já possui atalho para leitura aprofundada da entidade, incluindo conta vinculada e histórico administrativo disponível no backend."
              />
              <button
                className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void reload()}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Sincronizando clientes..." : "Sincronizar clientes"}
              </button>
            </div>

            {data.clients.length > 0 ? (
              <div className="mt-6 space-y-4">
                {data.clients.map((client) => (
                  <article
                    key={client.id}
                    className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{client.companyName}</h3>
                        <p className="mt-2 text-sm text-[#8A9AA6]">
                          Documento principal: {client.document ?? "—"}
                        </p>
                      </div>
                      <StatusBadge value={client.status} />
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-[#8A9AA6] md:grid-cols-2 xl:grid-cols-4">
                      <p>E-mail: {client.email ?? "—"}</p>
                      <p>Telefone: {client.phone ?? "—"}</p>
                      <p>Criado em: {formatCompactDate(client.createdAt)}</p>
                      <p>Atualizado em: {formatCompactDate(client.updatedAt)}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/clientes/${client.id}`}
                        className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
                      >
                        Abrir detalhe
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhum cliente encontrado"
                  description="A API não retornou clientes para o perfil autenticado nesta sessão."
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito a clientes"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de clientes."
        />
      )}
    </AppShell>
  );
}
