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
  fetchSaleById,
  syncSaleBillingStatus,
  updateSaleStatus,
} from "@/lib/api";
import { formatCompactDate, formatCurrency } from "@/lib/formatters";
import { saleStatusOptions } from "@/lib/module-filtering";
import { useTransactionDependencies } from "@/lib/use-transaction-dependencies";
import type { Sale } from "@/types/expandai";

const saleMutationOptions = saleStatusOptions.filter((option) => option.value.length > 0);

export default function SaleDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useTransactionDependencies(session?.accessToken, currentUser?.role);
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const canAccess = visibleModules.some((module) => module.key === "sales");
  const saleId = typeof params?.id === "string" ? params.id : "";

  const loadSale = useCallback(async () => {
    if (!session?.accessToken || !saleId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchSaleById(session.accessToken, saleId);
      setSale(payload);
      setStatusDraft(payload.status);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os detalhes da venda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [saleId, session?.accessToken]);

  useEffect(() => {
    void loadSale();
  }, [loadSale]);

  async function handleStatusUpdate() {
    if (!session?.accessToken || !sale) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedSale = await updateSaleStatus(session.accessToken, sale.id, {
        status: statusDraft,
      });
      setSale(updatedSale);
      setFeedback("Status da venda atualizado com sucesso.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível atualizar o status da venda.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleSyncBillingStatus() {
    if (!session?.accessToken || !sale) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedSale = await syncSaleBillingStatus(session.accessToken, sale.id);
      setSale(updatedSale);
      setStatusDraft(updatedSale.status);
      setFeedback("Status sincronizado com o faturamento com sucesso.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível sincronizar a venda com o faturamento.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const metrics = useMemo(
    () => ({
      statusAtual: sale?.status ?? "—",
      valorBruto: formatCurrency(sale?.grossAmount),
      valorLiquido: formatCurrency(sale?.netAmount),
    }),
    [sale],
  );

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando venda...</p>
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
      title="Venda comercial"
      description="Esta página concentra a leitura aprofundada do fechamento e as ações rápidas de sincronização operacional do ciclo de faturamento."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito a vendas"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe operacional deste módulo."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/vendas"
              className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
              Voltar para vendas
            </Link>
            <button
              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadSale()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
          {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

          {sale ? (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status atual"
                  value={metrics.statusAtual}
                  description="Reflete o estado operacional mais recente persistido no backend."
                />
                <MetricCard
                  label="Valor bruto"
                  value={metrics.valorBruto}
                  description="Montante bruto registrado para este fechamento."
                />
                <MetricCard
                  label="Valor líquido"
                  value={metrics.valorLiquido}
                  description="Resultado líquido atualmente vinculado ao registro."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Resumo do registro"
                      title={sale.title}
                      description={sale.description ?? "Sem descrição complementar cadastrada para esta venda."}
                    />
                    <StatusBadge value={sale.status} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                    <p>Operadora: {sale.operator?.tradeName ?? "—"}</p>
                    <p>Partner: {sale.partner?.companyName ?? "—"}</p>
                    <p>Cliente: {sale.client?.companyName ?? sale.client?.tradeName ?? "—"}</p>
                    <p>Produto: {sale.productCatalog?.name ?? "—"}</p>
                    <p>Oportunidade: {sale.opportunity?.title ?? "—"}</p>
                    <p>Regra comercial: {sale.commercialRule?.id ?? "—"}</p>
                    <p>Billing record: {sale.billingRecord?.id ?? "—"}</p>
                    <p>Status de billing: {sale.billingRecord?.status ?? "—"}</p>
                    <p>Status de split: {sale.billingRecord?.splitStatus ?? "—"}</p>
                    <p>Referência externa: {sale.externalReference ?? "—"}</p>
                    <p>Fechada em: {formatCompactDate(sale.closedAt)}</p>
                    <p>Criada em: {formatCompactDate(sale.createdAt)}</p>
                    <p>Atualizada em: {formatCompactDate(sale.updatedAt)}</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <SectionHeader
                    eyebrow="Ações rápidas"
                    title="Status e faturamento"
                    description="Use esta área para atualizar o estado da venda ou reconciliá-lo com o billing record já vinculado."
                  />

                  <div className="mt-6 space-y-4">
                    <FilterSelect
                      label="Novo status"
                      value={statusDraft}
                      options={saleMutationOptions}
                      onChange={setStatusDraft}
                    />
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleStatusUpdate()}
                        disabled={isMutating || statusDraft === sale.status}
                      >
                        {isMutating ? "Aplicando..." : "Atualizar status"}
                      </button>
                      <button
                        className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={() => void handleSyncBillingStatus()}
                        disabled={isMutating || !sale.billingRecordId}
                      >
                        Sincronizar com faturamento
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Venda não carregada"
                description="Não foi possível localizar o registro solicitado ou a sessão atual não tem acesso a ele."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
