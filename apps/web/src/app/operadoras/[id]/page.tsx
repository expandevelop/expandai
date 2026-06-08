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
import { fetchOperatorById } from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type { Operator } from "@/types/expandai";

export default function OperatorDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useExpandaiData(session?.accessToken, currentUser?.role);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "operators");
  const operatorId = typeof params?.id === "string" ? params.id : "";

  const loadOperator = useCallback(async () => {
    if (!session?.accessToken || !operatorId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchOperatorById(session.accessToken, operatorId);
      setOperator(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o detalhe da operadora.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [operatorId, session?.accessToken]);

  useEffect(() => {
    void loadOperator();
  }, [loadOperator]);

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando operadora...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe de operadora"
      title="Visão aprofundada da entidade"
      description="Esta página reúne dados cadastrais, conta vinculada, histórico de onboarding e produtos publicados pela operadora no ecossistema da ExpandAI."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito a operadoras"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe do módulo de operadoras."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/operadoras"
              className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
            >
              Voltar para operadoras
            </Link>
            <button
              className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadOperator()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}

          {operator ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status da operadora"
                  value={operator.status}
                  description="Estado operacional atual da entidade no backend."
                />
                <MetricCard
                  label="Produtos vinculados"
                  value={String(operator.productCatalogs?.length ?? 0)}
                  description="Itens de catálogo já associados a esta operadora."
                />
                <MetricCard
                  label="Onboardings"
                  value={String(operator.onboardings?.length ?? 0)}
                  description="Registros históricos de onboarding vinculados à entidade."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Cadastro principal"
                      title={operator.tradeName}
                      description={operator.legalName}
                    />
                    <StatusBadge value={operator.status} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-[#8A9AA6] md:grid-cols-2">
                    <p>Documento: {operator.document ?? "—"}</p>
                    <p>E-mail: {operator.email ?? operator.user?.email ?? "—"}</p>
                    <p>Telefone: {operator.phone ?? "—"}</p>
                    <p>Criada em: {formatCompactDate(operator.createdAt)}</p>
                    <p>Atualizada em: {formatCompactDate(operator.updatedAt)}</p>
                    <p>Modelo de comissão: {operator.commissionModel ?? "—"}</p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/8 bg-[#07131F]/60 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A9AA6]">
                      Conta vinculada
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm text-[#8A9AA6] md:grid-cols-2">
                      <p>Usuário: {operator.user?.name ?? "—"}</p>
                      <p>E-mail: {operator.user?.email ?? "—"}</p>
                      <p>Perfil: {operator.user?.role ?? "—"}</p>
                      <p>Status: {operator.user?.status ?? "—"}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                    <SectionHeader
                      eyebrow="Produtos publicados"
                      title="Portfólio vinculado"
                      description="Catálogos já associados a esta operadora, conforme dados reais do backend."
                    />
                    <div className="mt-4 space-y-3">
                      {operator.productCatalogs?.length ? (
                        operator.productCatalogs.map((catalog) => (
                          <div
                            key={catalog.id}
                            className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-4 text-sm text-[#8A9AA6]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium text-white">{catalog.name}</p>
                              <StatusBadge value={catalog.status} />
                            </div>
                            <p className="mt-2">Categoria: {catalog.category ?? "—"}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#8A9AA6]">Nenhum catálogo vinculado até o momento.</p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                    <SectionHeader
                      eyebrow="Histórico de onboarding"
                      title="Registros operacionais"
                      description="Últimos estados do fluxo administrativo desta entidade dentro do ecossistema."
                    />
                    <div className="mt-4 space-y-3">
                      {operator.onboardings?.length ? (
                        operator.onboardings.map((onboarding) => (
                          <div
                            key={onboarding.id}
                            className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-4 text-sm text-[#8A9AA6]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="font-medium text-white">{onboarding.actorType}</p>
                              <StatusBadge value={onboarding.status} />
                            </div>
                            <p className="mt-2">Criado em: {formatCompactDate(onboarding.createdAt)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[#8A9AA6]">Nenhum onboarding vinculado foi encontrado.</p>
                      )}
                    </div>
                  </section>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Operadora não carregada"
                description="Não foi possível localizar a entidade solicitada ou a sessão atual não possui acesso a esse registro."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
