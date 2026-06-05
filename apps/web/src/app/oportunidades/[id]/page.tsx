"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  FilterSelect,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import { InlineMessage } from "@/components/transaction-form-ui";
import { useAuth } from "@/components/auth-provider";
import {
  fetchOpportunityById,
  markOpportunityAsLost,
  markOpportunityAsWon,
  updateOpportunityStage,
} from "@/lib/api";
import { formatCompactDate, formatCurrency } from "@/lib/formatters";
import { opportunityStageOptions } from "@/lib/module-filtering";
import { useTransactionDependencies } from "@/lib/use-transaction-dependencies";
import type { Opportunity } from "@/types/expandai";

const stageMutationOptions = opportunityStageOptions.filter(
  (option) => option.value.length > 0,
);

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useTransactionDependencies(session?.accessToken, currentUser?.role);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stageDraft, setStageDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const canAccess = visibleModules.some((module) => module.key === "opportunities");
  const opportunityId = typeof params?.id === "string" ? params.id : "";

  const loadOpportunity = useCallback(async () => {
    if (!session?.accessToken || !opportunityId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchOpportunityById(session.accessToken, opportunityId);
      setOpportunity(payload);
      setStageDraft(payload.stage);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os detalhes da oportunidade.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId, session?.accessToken]);

  useEffect(() => {
    void loadOpportunity();
  }, [loadOpportunity]);

  async function handleStageUpdate() {
    if (!session?.accessToken || !opportunity) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedOpportunity = await updateOpportunityStage(session.accessToken, opportunity.id, {
        stage: stageDraft,
      });
      setOpportunity(updatedOpportunity);
      setFeedback("Estágio atualizado com sucesso.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível atualizar o estágio da oportunidade.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleMarkAsWon() {
    if (!session?.accessToken || !opportunity) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedOpportunity = await markOpportunityAsWon(session.accessToken, opportunity.id);
      setOpportunity(updatedOpportunity);
      setStageDraft(updatedOpportunity.stage);
      setFeedback("Oportunidade marcada como ganha com sucesso.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível marcar a oportunidade como ganha.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleMarkAsLost() {
    if (!session?.accessToken || !opportunity) {
      return;
    }

    const reason = window.prompt(
      "Informe opcionalmente o motivo da perda desta oportunidade:",
      "Cliente optou por priorizar outro ciclo comercial.",
    );

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedOpportunity = await markOpportunityAsLost(
        session.accessToken,
        opportunity.id,
        reason ?? undefined,
      );
      setOpportunity(updatedOpportunity);
      setStageDraft(updatedOpportunity.stage);
      setFeedback("Oportunidade marcada como perdida com sucesso.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível marcar a oportunidade como perdida.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const metrics = useMemo(
    () => ({
      statusAtual: opportunity?.stage ?? "—",
      valorEstimado: formatCurrency(opportunity?.estimatedValue),
      fechamento: formatCompactDate(opportunity?.closeExpectedAt),
    }),
    [opportunity],
  );

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando oportunidade...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe operacional"
      title="Oportunidade comercial"
      description="Esta página aprofunda a leitura do registro e concentra ações de progressão operacional do pipeline."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito a oportunidades"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe operacional deste módulo."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/oportunidades"
              className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
              Voltar para oportunidades
            </Link>
            <button
              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadOpportunity()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
          {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

          {opportunity ? (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status atual"
                  value={metrics.statusAtual}
                  description="Reflete o estágio operacional mais recente persistido no backend."
                />
                <MetricCard
                  label="Valor estimado"
                  value={metrics.valorEstimado}
                  description="Potencial comercial atualmente associado ao registro."
                />
                <MetricCard
                  label="Fechamento esperado"
                  value={metrics.fechamento}
                  description="Data alvo informada para evolução do pipeline."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Resumo do registro"
                      title={opportunity.title}
                      description={opportunity.description ?? "Sem descrição complementar cadastrada para esta oportunidade."}
                    />
                    <StatusBadge value={opportunity.stage} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                    <p>Operadora: {opportunity.operator?.tradeName ?? "—"}</p>
                    <p>Partner: {opportunity.partner?.companyName ?? "—"}</p>
                    <p>Cliente: {opportunity.client?.companyName ?? opportunity.client?.tradeName ?? "—"}</p>
                    <p>Produto: {opportunity.productCatalog?.name ?? "—"}</p>
                    <p>Origem: {opportunity.source ?? "—"}</p>
                    <p>Criada em: {formatCompactDate(opportunity.createdAt)}</p>
                    <p>Atualizada em: {formatCompactDate(opportunity.updatedAt)}</p>
                    <p>Fechamento esperado: {formatCompactDate(opportunity.closeExpectedAt)}</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <SectionHeader
                    eyebrow="Ações rápidas"
                    title="Progressão do pipeline"
                    description="Use esta área para evoluir o estágio ou encerrar a oportunidade diretamente a partir da visão detalhada."
                  />

                  <div className="mt-6 space-y-4">
                    <FilterSelect
                      label="Novo estágio"
                      value={stageDraft}
                      options={stageMutationOptions}
                      onChange={setStageDraft}
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleStageUpdate()}
                        disabled={isMutating || stageDraft === opportunity.stage}
                      >
                        {isMutating ? "Aplicando..." : "Aplicar estágio"}
                      </button>
                      <button
                        className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleMarkAsWon()}
                        disabled={isMutating || opportunity.stage === "WON"}
                      >
                        Marcar como ganha
                      </button>
                      <button
                        className="inline-flex rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleMarkAsLost()}
                        disabled={isMutating || opportunity.stage === "LOST"}
                      >
                        Marcar como perdida
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Oportunidade não carregada"
                description="Não foi possível localizar o registro solicitado ou a sessão atual não tem acesso a ele."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
