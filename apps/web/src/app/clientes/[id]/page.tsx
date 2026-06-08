"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import { InlineMessage } from "@/components/transaction-form-ui";
import { useAuth } from "@/components/auth-provider";
import { fetchClientById } from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type { Client } from "@/types/expandai";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useExpandaiData(session?.accessToken, currentUser?.role);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "clients");
  const clientId = typeof params?.id === "string" ? params.id : "";

  const loadClient = useCallback(async () => {
    if (!session?.accessToken || !clientId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchClientById(session.accessToken, clientId);
      setClient(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o detalhe do cliente.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [clientId, session?.accessToken]);

  useEffect(() => {
    void loadClient();
  }, [loadClient]);

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando cliente...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe de cliente"
      title="Visão aprofundada da entidade"
      description="Esta página reúne dados cadastrais, conta vinculada e histórico administrativo disponível para o cliente dentro do ecossistema ExpandAI."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito a clientes"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe do módulo de clientes."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/clientes"
              className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
            >
              Voltar para clientes
            </Link>
            <button
              className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadClient()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}

          {client ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status do cliente"
                  value={client.status}
                  description="Estado operacional atual da entidade no backend autenticado."
                />
                <MetricCard
                  label="Onboardings"
                  value={String(client.onboardings?.length ?? 0)}
                  description="Registros administrativos já vinculados ao cliente no ecossistema."
                />
                <MetricCard
                  label="Conta vinculada"
                  value={client.user ? "Disponível" : "Não vinculada"}
                  description="Indica se existe usuário associado ao cliente para operação autenticada."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Cadastro principal"
                      title={client.companyName}
                      description="Visão consolidada dos dados mestres retornados pela API real para este cliente."
                    />
                    <StatusBadge value={client.status} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-[#8A9AA6] md:grid-cols-2">
                    <p>Documento: {client.document ?? "—"}</p>
                    <p>E-mail: {client.email ?? client.user?.email ?? "—"}</p>
                    <p>Telefone: {client.phone ?? "—"}</p>
                    <p>Criado em: {formatCompactDate(client.createdAt)}</p>
                    <p>Atualizado em: {formatCompactDate(client.updatedAt)}</p>
                    <p>ID da entidade: {client.id}</p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/8 bg-[#07131F]/60 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A9AA6]">
                      Conta vinculada
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm text-[#8A9AA6] md:grid-cols-2">
                      <p>Usuário: {client.user?.name ?? "—"}</p>
                      <p>E-mail: {client.user?.email ?? "—"}</p>
                      <p>Perfil: {client.user?.role ?? "—"}</p>
                      <p>Status: {client.user?.status ?? "—"}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <SectionHeader
                    eyebrow="Histórico administrativo"
                    title="Registros de onboarding"
                    description="Últimos estados administrativos vinculados ao cliente dentro da plataforma."
                  />
                  <div className="mt-4 space-y-3">
                    {client.onboardings?.length ? (
                      client.onboardings.map((onboarding) => (
                        <div
                          key={onboarding.id}
                          className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-4 text-sm text-[#8A9AA6]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-white">{onboarding.actorType}</p>
                            <StatusBadge value={onboarding.status} />
                          </div>
                          <p className="mt-2">Criado em: {formatCompactDate(onboarding.createdAt)}</p>
                          <p className="mt-1">Atualizado em: {formatCompactDate(onboarding.updatedAt)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#8A9AA6]">
                        Nenhum onboarding vinculado foi encontrado para este cliente.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Cliente não carregado"
                description="Não foi possível localizar a entidade solicitada ou a sessão atual não possui acesso a esse registro."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
