"use client";

import Link from "next/link";
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
import {
  FormActions,
  FormCard,
  FormGrid,
  InlineMessage,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/transaction-form-ui";
import { useAuth } from "@/components/auth-provider";
import {
  createOpportunity,
  markOpportunityAsLost,
  markOpportunityAsWon,
  updateOpportunity,
  updateOpportunityStage,
} from "@/lib/api";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import {
  filterOpportunities,
  opportunityStageOptions,
} from "@/lib/module-filtering";
import { useModuleFilters } from "@/lib/use-module-filters";
import { usePersistedDraft } from "@/lib/use-persisted-draft";
import { useTransactionDependencies } from "@/lib/use-transaction-dependencies";
import type { Opportunity, TransactionFormOption } from "@/types/expandai";

const initialOpportunityFilters = {
  search: "",
  stage: "",
};

const initialOpportunityDraft = {
  operatorId: "",
  partnerId: "",
  clientId: "",
  productCatalogId: "",
  title: "",
  description: "",
  source: "",
  estimatedValue: "",
  closeExpectedAt: "",
};

const stageMutationOptions = opportunityStageOptions.filter(
  (option) => option.value.length > 0,
);

const opportunitySourceOptions: TransactionFormOption[] = [
  { value: "OUTBOUND_AI", label: "Outbound AI", hint: "Prospecção ativa automatizada." },
  { value: "PARTNER_NETWORK", label: "Rede de partners", hint: "Origem via ecossistema parceiro." },
  { value: "INBOUND", label: "Inbound", hint: "Entrada orgânica ou campanha receptiva." },
  { value: "INDICACAO", label: "Indicação", hint: "Lead vindo por indicação comercial." },
];

function formatDateTimeLocal(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function mapOpportunityToDraft(opportunity: Opportunity) {
  return {
    operatorId: opportunity.operator?.id ?? "",
    partnerId: opportunity.partner?.id ?? "",
    clientId: opportunity.client?.id ?? "",
    productCatalogId: opportunity.productCatalog?.id ?? "",
    title: opportunity.title,
    description: opportunity.description ?? "",
    source: opportunity.source ?? "",
    estimatedValue: opportunity.estimatedValue ? String(opportunity.estimatedValue) : "",
    closeExpectedAt: formatDateTimeLocal(opportunity.closeExpectedAt),
  };
}

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function toOptionalString(value: string) {
  return value.trim() ? value.trim() : undefined;
}

export default function OpportunitiesPage() {
  const { isBooting, session, currentUser } = useAuth();
  const {
    data,
    isLoading,
    error,
    reload,
    visibleModules,
    operatorOptions,
    partnerOptions,
    clientOptions,
    getCatalogOptions,
  } = useTransactionDependencies(session?.accessToken, currentUser?.role);
  const { filters, hasActiveFilters, setFilter, resetFilters } = useModuleFilters(
    "oportunidades",
    initialOpportunityFilters,
  );
  const { draft, isReady, setDraftField, replaceDraft, resetDraft } = usePersistedDraft(
    "oportunidades:transaction-form",
    initialOpportunityDraft,
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [stageDrafts, setStageDrafts] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const filteredOpportunities = useMemo(
    () => filterOpportunities(data.opportunities, filters),
    [data.opportunities, filters],
  );

  const openFilteredOpportunities = useMemo(
    () => filteredOpportunities.filter((item) => item.stage !== "WON" && item.stage !== "LOST").length,
    [filteredOpportunities],
  );

  const canAccess = visibleModules.some((module) => module.key === "opportunities");
  const productCatalogOptions = useMemo(
    () => getCatalogOptions(draft.operatorId),
    [draft.operatorId, getCatalogOptions],
  );
  const editingOpportunity = useMemo(
    () => data.opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null,
    [data.opportunities, selectedOpportunityId],
  );

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

  function prepareOpportunityForm(opportunity?: Opportunity) {
    setActionError(null);
    setActionFeedback(null);

    if (!opportunity) {
      setSelectedOpportunityId(null);
      resetDraft();
      return;
    }

    setSelectedOpportunityId(opportunity.id);
    replaceDraft(mapOpportunityToDraft(opportunity));
  }

  async function handleSubmitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken) {
      return;
    }

    if (!draft.operatorId || !draft.title.trim()) {
      setActionError("Preencha ao menos operadora e título antes de salvar a oportunidade.");
      return;
    }

    setIsSubmittingForm(true);
    setActionError(null);
    setActionFeedback(null);

    const payload = {
      operatorId: draft.operatorId,
      partnerId: toOptionalString(draft.partnerId),
      clientId: toOptionalString(draft.clientId),
      productCatalogId: toOptionalString(draft.productCatalogId),
      title: draft.title.trim(),
      description: toOptionalString(draft.description),
      source: toOptionalString(draft.source),
      estimatedValue: toOptionalNumber(draft.estimatedValue),
      closeExpectedAt: draft.closeExpectedAt
        ? new Date(draft.closeExpectedAt).toISOString()
        : undefined,
    };

    try {
      if (selectedOpportunityId) {
        await updateOpportunity(session.accessToken, selectedOpportunityId, payload);
        setActionFeedback("Oportunidade atualizada com sucesso.");
      } else {
        await createOpportunity(session.accessToken, payload);
        setActionFeedback("Oportunidade criada com sucesso.");
      }

      await reload();

      if (!selectedOpportunityId) {
        resetDraft();
      }
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível salvar a oportunidade.",
      );
    } finally {
      setIsSubmittingForm(false);
    }
  }

  if (isBooting || !isReady) {
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
      description="Esta rota dedicada consolida a leitura do funil comercial e agora também permite criar e editar oportunidades com rascunho persistido localmente por módulo."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {actionFeedback ? <InlineMessage tone="success">{actionFeedback}</InlineMessage> : null}

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

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-6">
              <FormCard
                eyebrow={selectedOpportunityId ? "Edição transacional" : "Nova oportunidade"}
                title={
                  selectedOpportunityId
                    ? `Editar oportunidade ${editingOpportunity?.title ?? "selecionada"}`
                    : "Cadastrar oportunidade"
                }
                description="O formulário utiliza rascunho persistido em local storage por módulo e respeita os vínculos relacionais já suportados pela API real."
              >
                <form onSubmit={(event) => void handleSubmitForm(event)}>
                  <FormGrid>
                    <SelectField
                      label="Operadora"
                      value={draft.operatorId}
                      options={operatorOptions}
                      onChange={(value) => {
                        setDraftField("operatorId", value);
                        setDraftField("productCatalogId", "");
                      }}
                    />
                    <TextField
                      label="Título"
                      value={draft.title}
                      placeholder="Expansão de seguro empresarial para nova base"
                      required
                      onChange={(value) => setDraftField("title", value)}
                    />
                    <SelectField
                      label="Partner"
                      value={draft.partnerId}
                      options={partnerOptions}
                      onChange={(value) => setDraftField("partnerId", value)}
                    />
                    <SelectField
                      label="Cliente"
                      value={draft.clientId}
                      options={clientOptions}
                      onChange={(value) => setDraftField("clientId", value)}
                    />
                    <SelectField
                      label="Produto de catálogo"
                      value={draft.productCatalogId}
                      options={productCatalogOptions}
                      onChange={(value) => setDraftField("productCatalogId", value)}
                    />
                    <SelectField
                      label="Origem"
                      value={draft.source}
                      options={opportunitySourceOptions}
                      onChange={(value) => setDraftField("source", value)}
                    />
                    <TextField
                      label="Valor estimado"
                      type="number"
                      value={draft.estimatedValue}
                      placeholder="25000"
                      onChange={(value) => setDraftField("estimatedValue", value)}
                    />
                    <TextField
                      label="Fechamento esperado"
                      type="datetime-local"
                      value={draft.closeExpectedAt}
                      onChange={(value) => setDraftField("closeExpectedAt", value)}
                    />
                    <TextAreaField
                      label="Descrição"
                      value={draft.description}
                      placeholder="Contexto comercial, origem do lead e observações relevantes para o pipeline."
                      onChange={(value) => setDraftField("description", value)}
                    />
                  </FormGrid>

                  <FormActions
                    submitLabel={selectedOpportunityId ? "Salvar oportunidade" : "Criar oportunidade"}
                    resetLabel={selectedOpportunityId ? "Sair da edição" : "Limpar rascunho"}
                    isSubmitting={isSubmittingForm}
                    onReset={() => prepareOpportunityForm(undefined)}
                  />
                </form>
              </FormCard>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <SectionHeader
                    eyebrow="Lista de oportunidades"
                    title="Funil comercial visível ao perfil atual"
                    description="A visão abaixo mantém busca textual, refinamento por estágio e mutações autenticadas do pipeline, agora com atalho para carregar registros no formulário."
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
                            <p>Valor estimado: {formatCurrency(opportunity.estimatedValue)}</p>
                            <p>Origem: {opportunity.source ?? "—"}</p>
                            <p>Fechamento esperado: {formatCompactDate(opportunity.closeExpectedAt)}</p>
                            <p>Criada em: {formatCompactDate(opportunity.createdAt)}</p>
                          </div>
                          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Ações operacionais
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <Link
                                href={`/oportunidades/${opportunity.id}`}
                                className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
                              >
                                Abrir detalhe
                              </Link>
                              <button
                                className="inline-flex rounded-2xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-400/20"
                                type="button"
                                onClick={() => prepareOpportunityForm(opportunity)}
                              >
                                Editar no formulário
                              </button>
                            </div>
                            <div className="mt-4 grid gap-3 xl:grid-cols-[220px_1fr]">
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
            </section>

            <FormCard
              eyebrow="Resumo transacional"
              title="Rascunho e coerência relacional"
              description="Os selects são carregados a partir dos módulos reais da API e o catálogo é automaticamente filtrado pela operadora selecionada."
            >
              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  Modo atual: <strong>{selectedOpportunityId ? "Edição" : "Criação"}</strong>
                </p>
                <p>
                  Operadora selecionada: <strong>{operatorOptions.find((item) => item.value === draft.operatorId)?.label ?? "Nenhuma"}</strong>
                </p>
                <p>
                  Catálogos compatíveis: <strong>{productCatalogOptions.length}</strong>
                </p>
                <p>
                  Partner vinculado: <strong>{partnerOptions.find((item) => item.value === draft.partnerId)?.label ?? "Não definido"}</strong>
                </p>
                <p>
                  Cliente vinculado: <strong>{clientOptions.find((item) => item.value === draft.clientId)?.label ?? "Não definido"}</strong>
                </p>
                <p>
                  Rascunho persistido: <strong>ativo no navegador desta sessão</strong>
                </p>
              </div>
            </FormCard>
          </div>
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
