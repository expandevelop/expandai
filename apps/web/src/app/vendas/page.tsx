"use client";

import Link from "next/link";
import type { FormEvent } from "react";
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
  createSale,
  syncSaleBillingStatus,
  updateSale,
  updateSaleStatus,
} from "@/lib/api";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import { filterSales, saleStatusOptions } from "@/lib/module-filtering";
import { useModuleFilters } from "@/lib/use-module-filters";
import { usePersistedDraft } from "@/lib/use-persisted-draft";
import { useTransactionDependencies } from "@/lib/use-transaction-dependencies";
import type { Sale } from "@/types/expandai";

const initialSalesFilters = {
  search: "",
  status: "",
};

const initialSaleDraft = {
  opportunityId: "",
  operatorId: "",
  partnerId: "",
  clientId: "",
  productCatalogId: "",
  commercialRuleId: "",
  title: "",
  description: "",
  grossAmount: "",
  netAmount: "",
  externalReference: "",
};

const saleMutationOptions = saleStatusOptions.filter((option) => option.value.length > 0);

function mapSaleToDraft(sale: Sale) {
  return {
    opportunityId: sale.opportunity?.id ?? "",
    operatorId: sale.operator?.id ?? "",
    partnerId: sale.partner?.id ?? "",
    clientId: sale.client?.id ?? "",
    productCatalogId: sale.productCatalog?.id ?? "",
    commercialRuleId: sale.commercialRule?.id ?? "",
    title: sale.title,
    description: sale.description ?? "",
    grossAmount: sale.grossAmount ? String(sale.grossAmount) : "",
    netAmount: sale.netAmount ? String(sale.netAmount) : "",
    externalReference: sale.externalReference ?? "",
  };
}

function toOptionalString(value: string) {
  return value.trim() ? value.trim() : undefined;
}

function toRequiredNumber(value: string) {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? NaN : numericValue;
}

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

export default function SalesPage() {
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
    getCommercialRuleOptions,
    getOpenOpportunityOptions,
    getDefaultsFromOpportunity,
  } = useTransactionDependencies(session?.accessToken, currentUser?.role);
  const { filters, hasActiveFilters, setFilter, resetFilters } = useModuleFilters(
    "vendas",
    initialSalesFilters,
  );
  const { draft, isReady, setDraftField, replaceDraft, resetDraft } = usePersistedDraft(
    "vendas:transaction-form",
    initialSaleDraft,
  );
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const filteredSales = useMemo(() => filterSales(data.sales, filters), [data.sales, filters]);

  const billedFilteredSales = useMemo(
    () => filteredSales.filter((sale) => sale.status === "BILLED").length,
    [filteredSales],
  );

  const grossFilteredSalesValue = useMemo(
    () => filteredSales.reduce((accumulator, sale) => accumulator + Number(sale.grossAmount), 0),
    [filteredSales],
  );

  const canAccess = visibleModules.some((module) => module.key === "sales");
  const productCatalogOptions = useMemo(
    () => getCatalogOptions(draft.operatorId),
    [draft.operatorId, getCatalogOptions],
  );
  const commercialRuleOptions = useMemo(
    () => getCommercialRuleOptions(draft.operatorId, draft.productCatalogId),
    [draft.operatorId, draft.productCatalogId, getCommercialRuleOptions],
  );
  const opportunityOptions = useMemo(
    () => getOpenOpportunityOptions(draft.operatorId),
    [draft.operatorId, getOpenOpportunityOptions],
  );
  const editingSale = useMemo(
    () => data.sales.find((sale) => sale.id === selectedSaleId) ?? null,
    [data.sales, selectedSaleId],
  );

  async function handleStatusUpdate(saleId: string) {
    if (!session?.accessToken) {
      return;
    }

    const nextStatus = statusDrafts[saleId];

    if (!nextStatus) {
      setActionError("Selecione um status antes de aplicar a mutação operacional.");
      return;
    }

    setPendingActionId(saleId);
    setActionFeedback(null);
    setActionError(null);

    try {
      await updateSaleStatus(session.accessToken, saleId, {
        status: nextStatus,
      });
      setActionFeedback("Status da venda atualizado com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível atualizar o status da venda.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleSyncBillingStatus(saleId: string) {
    if (!session?.accessToken) {
      return;
    }

    setPendingActionId(saleId);
    setActionFeedback(null);
    setActionError(null);

    try {
      await syncSaleBillingStatus(session.accessToken, saleId);
      setActionFeedback("Status da venda sincronizado com o faturamento com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível sincronizar o status da venda com o faturamento.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  function prepareSaleForm(sale?: Sale) {
    setActionError(null);
    setActionFeedback(null);

    if (!sale) {
      setSelectedSaleId(null);
      resetDraft();
      return;
    }

    setSelectedSaleId(sale.id);
    replaceDraft(mapSaleToDraft(sale));
  }

  function handleOpportunitySelection(opportunityId: string) {
    const defaults = getDefaultsFromOpportunity(opportunityId);

    if (!defaults) {
      setDraftField("opportunityId", opportunityId);
      return;
    }

    replaceDraft({
      ...draft,
      opportunityId,
      operatorId: defaults.operatorId,
      partnerId: defaults.partnerId,
      clientId: defaults.clientId,
      productCatalogId: defaults.productCatalogId,
      commercialRuleId: "",
      title: draft.title || defaults.title,
      description: draft.description || defaults.description,
    });
  }

  async function handleSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken) {
      return;
    }

    if (!draft.operatorId || !draft.title.trim() || !draft.grossAmount.trim()) {
      setActionError("Preencha operadora, título e valor bruto antes de salvar a venda.");
      return;
    }

    const grossAmount = toRequiredNumber(draft.grossAmount);

    if (Number.isNaN(grossAmount)) {
      setActionError("Informe um valor bruto numérico válido para a venda.");
      return;
    }

    setIsSubmittingForm(true);
    setActionError(null);
    setActionFeedback(null);

    const payload = {
      opportunityId: toOptionalString(draft.opportunityId),
      operatorId: draft.operatorId,
      partnerId: toOptionalString(draft.partnerId),
      clientId: toOptionalString(draft.clientId),
      productCatalogId: toOptionalString(draft.productCatalogId),
      commercialRuleId: toOptionalString(draft.commercialRuleId),
      title: draft.title.trim(),
      description: toOptionalString(draft.description),
      grossAmount,
      netAmount: toOptionalNumber(draft.netAmount),
      externalReference: toOptionalString(draft.externalReference),
    };

    try {
      if (selectedSaleId) {
        await updateSale(session.accessToken, selectedSaleId, payload);
        setActionFeedback("Venda atualizada com sucesso.");
      } else {
        await createSale(session.accessToken, payload);
        setActionFeedback("Venda criada com sucesso.");
      }

      await reload();

      if (!selectedSaleId) {
        resetDraft();
      }
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível salvar a venda.",
      );
    } finally {
      setIsSubmittingForm(false);
    }
  }

  if (isBooting || !isReady) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando vendas...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Conversão comercial"
      title="Vendas fechadas e sincronizadas"
      description="Esta rota dedicada materializa a leitura das vendas e agora também permite criar e editar registros com consistência relacional sobre a API real."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {actionFeedback ? <InlineMessage tone="success">{actionFeedback}</InlineMessage> : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Vendas faturadas"
              value={String(billedFilteredSales)}
              description="Quantidade de registros filtrados com faturamento já vinculado no backend."
            />
            <MetricCard
              label="Volume bruto"
              value={formatCurrency(grossFilteredSalesValue)}
              description="Soma do valor bruto das vendas visíveis após a aplicação dos filtros atuais."
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
                eyebrow={selectedSaleId ? "Edição transacional" : "Nova venda"}
                title={selectedSaleId ? `Editar venda ${editingSale?.title ?? "selecionada"}` : "Registrar venda"}
                description="O formulário reaproveita os vínculos já existentes entre oportunidade, operadora, produto e regra comercial, mantendo rascunho persistido por módulo."
              >
                <form onSubmit={(event) => void handleSubmitForm(event)}>
                  <FormGrid>
                    <SelectField
                      label="Oportunidade"
                      value={draft.opportunityId}
                      options={opportunityOptions}
                      onChange={handleOpportunitySelection}
                    />
                    <SelectField
                      label="Operadora"
                      value={draft.operatorId}
                      options={operatorOptions}
                      onChange={(value) => {
                        setDraftField("operatorId", value);
                        setDraftField("productCatalogId", "");
                        setDraftField("commercialRuleId", "");
                      }}
                    />
                    <TextField
                      label="Título"
                      value={draft.title}
                      placeholder="Venda confirmada - Seguro Empresarial"
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
                      onChange={(value) => {
                        setDraftField("productCatalogId", value);
                        setDraftField("commercialRuleId", "");
                      }}
                    />
                    <SelectField
                      label="Regra comercial"
                      value={draft.commercialRuleId}
                      options={commercialRuleOptions}
                      onChange={(value) => setDraftField("commercialRuleId", value)}
                    />
                    <TextField
                      label="Referência externa"
                      value={draft.externalReference}
                      placeholder="VENDA-EXPAND-0001"
                      onChange={(value) => setDraftField("externalReference", value)}
                    />
                    <TextField
                      label="Valor bruto"
                      type="number"
                      value={draft.grossAmount}
                      placeholder="15000"
                      required
                      onChange={(value) => setDraftField("grossAmount", value)}
                    />
                    <TextField
                      label="Valor líquido"
                      type="number"
                      value={draft.netAmount}
                      placeholder="12000"
                      onChange={(value) => setDraftField("netAmount", value)}
                    />
                    <TextAreaField
                      label="Descrição"
                      value={draft.description}
                      placeholder="Contexto do fechamento, observações de faturamento e detalhes do aceite comercial."
                      onChange={(value) => setDraftField("description", value)}
                    />
                  </FormGrid>

                  <FormActions
                    submitLabel={selectedSaleId ? "Salvar venda" : "Criar venda"}
                    resetLabel={selectedSaleId ? "Sair da edição" : "Limpar rascunho"}
                    isSubmitting={isSubmittingForm}
                    onReset={() => prepareSaleForm(undefined)}
                  />
                </form>
              </FormCard>

              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <SectionHeader
                    eyebrow="Lista de vendas"
                    title="Fechamentos comerciais visíveis ao perfil atual"
                    description="A visão abaixo mantém busca textual, refinamento por status e ações operacionais, agora com atalho para edição transacional no formulário."
                  />
                  <button
                    className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => void reload()}
                    disabled={isLoading}
                    type="button"
                  >
                    {isLoading ? "Sincronizando vendas..." : "Sincronizar vendas"}
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <FilterShell>
                    <FilterInput
                      label="Busca textual"
                      value={filters.search}
                      placeholder="Título, partner, produto, oportunidade ou referência"
                      onChange={(value) => setFilter("search", value)}
                    />
                    <FilterSelect
                      label="Status"
                      value={filters.status}
                      options={saleStatusOptions}
                      onChange={(value) => setFilter("status", value)}
                    />
                  </FilterShell>

                  <FilterSummary
                    count={filteredSales.length}
                    entityLabel="vendas"
                    hasActiveFilters={hasActiveFilters}
                    onReset={resetFilters}
                  />
                </div>

                {filteredSales.length > 0 ? (
                  <div className="mt-6 space-y-4">
                    {filteredSales.map((sale) => {
                      const draftStatus = statusDrafts[sale.id] ?? sale.status;
                      const isPending = pendingActionId === sale.id;

                      return (
                        <article
                          key={sale.id}
                          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{sale.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {truncateText(sale.description, 180)}
                              </p>
                            </div>
                            <StatusBadge value={sale.status} />
                          </div>
                          <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                            <p>Valor bruto: {formatCurrency(sale.grossAmount)}</p>
                            <p>Valor líquido: {formatCurrency(sale.netAmount)}</p>
                            <p>Billing: {sale.billingRecord?.status ?? "—"}</p>
                            <p>Fechada em: {formatCompactDate(sale.closedAt)}</p>
                            <p>Operadora: {sale.operator?.tradeName ?? "—"}</p>
                            <p>Partner: {sale.partner?.companyName ?? "—"}</p>
                            <p>Oportunidade: {sale.opportunity?.title ?? "—"}</p>
                            <p>Produto: {sale.productCatalog?.name ?? "—"}</p>
                          </div>
                          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Ações operacionais
                            </p>
                            <div className="mt-3 flex flex-wrap gap-3">
                              <Link
                                href={`/vendas/${sale.id}`}
                                className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
                              >
                                Abrir detalhe
                              </Link>
                              <button
                                className="inline-flex rounded-2xl border border-violet-400/30 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-400/20"
                                type="button"
                                onClick={() => prepareSaleForm(sale)}
                              >
                                Editar no formulário
                              </button>
                            </div>
                            <div className="mt-4 grid gap-3 xl:grid-cols-[220px_1fr]">
                              <FilterSelect
                                label="Novo status"
                                value={draftStatus}
                                options={saleMutationOptions}
                                onChange={(value) =>
                                  setStatusDrafts((currentDrafts) => ({
                                    ...currentDrafts,
                                    [sale.id]: value,
                                  }))
                                }
                              />
                              <div className="flex flex-wrap items-end gap-3">
                                <button
                                  className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                                  type="button"
                                  onClick={() => void handleStatusUpdate(sale.id)}
                                  disabled={isPending || draftStatus === sale.status}
                                >
                                  {isPending ? "Aplicando..." : "Atualizar status"}
                                </button>
                                <button
                                  className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                  type="button"
                                  onClick={() => void handleSyncBillingStatus(sale.id)}
                                  disabled={isPending || !sale.billingRecordId}
                                >
                                  Sincronizar com faturamento
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
                      title="Nenhuma venda corresponde aos filtros"
                      description="Ajuste os filtros ativos ou sincronize novamente a visão para carregar novos registros de venda."
                    />
                  </div>
                )}
              </section>
            </section>

            <FormCard
              eyebrow="Resumo transacional"
              title="Coerência entre oportunidade, produto e split"
              description="A seleção de oportunidade pode pré-preencher vínculos relacionais e a regra comercial é filtrada por operadora e produto."
            >
              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  Modo atual: <strong>{selectedSaleId ? "Edição" : "Criação"}</strong>
                </p>
                <p>
                  Oportunidades disponíveis: <strong>{opportunityOptions.length}</strong>
                </p>
                <p>
                  Catálogos compatíveis: <strong>{productCatalogOptions.length}</strong>
                </p>
                <p>
                  Regras comerciais compatíveis: <strong>{commercialRuleOptions.length}</strong>
                </p>
                <p>
                  Operadora selecionada: <strong>{operatorOptions.find((item) => item.value === draft.operatorId)?.label ?? "Nenhuma"}</strong>
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
          title="Acesso restrito a vendas"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de vendas."
        />
      )}
    </AppShell>
  );
}
