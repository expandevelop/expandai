"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  FilterInput,
  FilterSelect,
  FilterShell,
  FilterSummary,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import {
  markOpportunityAsLost,
  markOpportunityAsWon,
  updateOpportunityStage,
} from "@/lib/api";
import { formatCompactDate, truncateText } from "@/lib/formatters";
import {
  filterOpportunities,
  opportunityStageOptions,
} from "@/lib/module-filtering";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { useModuleFilters } from "@/lib/use-module-filters";

const initialOpportunityFilters = {
  search: "",
  stage: "",
};

const stageMutationOptions = opportunityStageOptions.filter(
  (option) => option.value.length > 0,
);

export default function OpportunitiesPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );
  const { filters, hasActiveFilters, setFilter, resetFilters } = useModuleFilters(
    "oportunidades",
    initialOpportunityFilters,
  );
  const [stageDrafts, setStageDrafts] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const filteredOpportunities = useMemo(
    () => filterOpportunities(data.opportunities, filters),
    [data.opportunities, filters],
  );

  const openFilteredOpportunities = useMemo(
    () => filteredOpportunities.filter((item) => item.stage !== "WON" && item.stage !== "LOST").length,
    [filteredOpportunities],
  );

  const canAccess = visibleModules.some((module) => module.key === "opportunities");

  async function handleStageUpdate(opportunityId: string) {
    if (!session?.accessToken) {
      return;
    }

    const nextStage = stageDrafts[opportunityId];

    if (!nextStage) {
      setActionError("Selecione um estágio antes de aplicar a mutação operacional.");
      return;
    }

    setPendingActionId(opportunityId);
    setActionFeedback(null);
    setActionError(null);

    try {
      await updateOpportunityStage(session.accessToken, opportunityId, {
        stage: nextStage,
      });
      setActionFeedback("Estágio da oportunidade atualizado com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível atualizar o estágio da oportunidade.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleMarkAsWon(opportunityId: string) {
    if (!session?.accessToken) {
      return;
    }

    setPendingActionId(opportunityId);
    setActionFeedback(null);
    setActionError(null);

    try {
      await markOpportunityAsWon(session.accessToken, opportunityId);
      setActionFeedback("Oportunidade marcada como ganha com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível marcar a oportunidade como ganha.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleMarkAsLost(opportunityId: string) {
    if (!session?.accessToken) {
      return;
    }

    const reason = window.prompt(
      "Informe opcionalmente o motivo da perda desta oportunidade:",
      "Cliente optou por adiar a contratação.",
    );

    setPendingActionId(opportunityId);
    setActionFeedback(null);
    setActionError(null);

    try {
      await markOpportunityAsLost(session.accessToken, opportunityId, reason ?? undefined);
      setActionFeedback("Oportunidade marcada como perdida com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível marcar a oportunidade como perdida.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando oportunidades...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Pipeline comercial"
      title="Oportunidades em andamento"
      description="Esta rota dedicada consolida a leitura do funil comercial já persistido, agora com busca textual, refinamento por estágio e ações operacionais autenticadas de progressão do pipeline."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {actionError}
        </div>
      ) : null}

      {actionFeedback ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {actionFeedback}
        </div>
      ) : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Oportunidades abertas"
              value={String(openFilteredOpportunities)}
              description="Total de registros filtrados que ainda não atingiram estados finais de ganho ou perda."
            />
            <MetricCard
              label="Oportunidades totais"
              value={String(filteredOpportunities.length)}
              description="Volume visível após a aplicação dos filtros atuais."
            />
            <MetricCard
              label="Sincronização"
              value={isLoading ? "Em andamento" : "Atualizada"}
              description="Reflete o estado atual do carregamento desta visão dedicada."
            />
          </section>

          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Lista de oportunidades"
                title="Funil comercial visível ao perfil atual"
                description="A visão abaixo permite busca por título, descrição, operadora, partner ou produto, além de mutações autenticadas de estágio sobre o pipeline comercial."
              />
              <button
                className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void reload()}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Sincronizando oportunidades..." : "Sincronizar oportunidades"}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <FilterShell>
                <FilterInput
                  label="Busca textual"
                  value={filters.search}
                  placeholder="Título, descrição, operadora, partner ou produto"
                  onChange={(value) => setFilter("search", value)}
                />
                <FilterSelect
                  label="Estágio"
                  value={filters.stage}
                  options={opportunityStageOptions}
                  onChange={(value) => setFilter("stage", value)}
                />
              </FilterShell>

              <FilterSummary
                count={filteredOpportunities.length}
                entityLabel="oportunidades"
                hasActiveFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            </div>

            {filteredOpportunities.length > 0 ? (
              <div className="mt-6 space-y-4">
                {filteredOpportunities.map((opportunity) => {
                  const draftStage = stageDrafts[opportunity.id] ?? opportunity.stage;
                  const isPending = pendingActionId === opportunity.id;

                  return (
                    <article
                      key={opportunity.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{opportunity.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {truncateText(opportunity.description, 180)}
                          </p>
                        </div>
                        <StatusBadge value={opportunity.stage} />
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                        <p>Operadora: {opportunity.operator?.tradeName ?? "—"}</p>
                        <p>Partner: {opportunity.partner?.companyName ?? "—"}</p>
                        <p>Produto: {opportunity.productCatalog?.name ?? "—"}</p>
                        <p>Criada em: {formatCompactDate(opportunity.createdAt)}</p>
                      </div>
                      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          Ações operacionais
                        </p>
                        <div className="mt-3 grid gap-3 xl:grid-cols-[220px_1fr]">
                          <FilterSelect
                            label="Novo estágio"
                            value={draftStage}
                            options={stageMutationOptions}
                            onChange={(value) =>
                              setStageDrafts((currentDrafts) => ({
                                ...currentDrafts,
                                [opportunity.id]: value,
                              }))
                            }
                          />
                          <div className="flex flex-wrap items-end gap-3">
                            <button
                              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              onClick={() => void handleStageUpdate(opportunity.id)}
                              disabled={isPending || draftStage === opportunity.stage}
                            >
                              {isPending ? "Aplicando..." : "Aplicar estágio"}
                            </button>
                            <button
                              className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              onClick={() => void handleMarkAsWon(opportunity.id)}
                              disabled={isPending || opportunity.stage === "WON"}
                            >
                              Marcar como ganha
                            </button>
                            <button
                              className="inline-flex rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                              type="button"
                              onClick={() => void handleMarkAsLost(opportunity.id)}
                              disabled={isPending || opportunity.stage === "LOST"}
                            >
                              Marcar como perdida
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhuma oportunidade corresponde aos filtros"
                  description="Ajuste os filtros ativos ou sincronize novamente o pipeline para carregar novos registros."
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito a oportunidades"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de oportunidades."
        />
      )}
    </AppShell>
  );
}
