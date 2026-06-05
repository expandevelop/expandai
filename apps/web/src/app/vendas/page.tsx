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
import { syncSaleBillingStatus, updateSaleStatus } from "@/lib/api";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import { filterSales, saleStatusOptions } from "@/lib/module-filtering";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { useModuleFilters } from "@/lib/use-module-filters";

const initialSalesFilters = {
  search: "",
  status: "",
};

const saleMutationOptions = saleStatusOptions.filter((option) => option.value.length > 0);

export default function SalesPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );
  const { filters, hasActiveFilters, setFilter, resetFilters } = useModuleFilters(
    "vendas",
    initialSalesFilters,
  );
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const filteredSales = useMemo(
    () => filterSales(data.sales, filters),
    [data.sales, filters],
  );

  const billedFilteredSales = useMemo(
    () => filteredSales.filter((sale) => sale.status === "BILLED").length,
    [filteredSales],
  );

  const grossFilteredSalesValue = useMemo(
    () => filteredSales.reduce((accumulator, sale) => accumulator + Number(sale.grossAmount), 0),
    [filteredSales],
  );

  const canAccess = visibleModules.some((module) => module.key === "sales");

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

  if (isBooting) {
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
      description="Esta rota dedicada materializa a leitura das vendas já persistidas, agora com busca textual, refinamento por status e ações autenticadas de sincronização operacional."
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

          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Lista de vendas"
                title="Fechamentos comerciais visíveis ao perfil atual"
                description="A visão abaixo permite busca por título, descrição, operadora, partner, oportunidade, produto ou referência externa, além de mutações autenticadas de status."
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
                        <div className="mt-3 grid gap-3 xl:grid-cols-[220px_1fr]">
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
