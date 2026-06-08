"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchBillingRecordById, payBillingRecord } from "@/lib/api";
import { formatCompactDate, formatCurrency } from "@/lib/formatters";
import { useFinanceWorkbench } from "@/lib/use-finance-workbench";
import type { BillingRecord } from "@/types/expandai";

export default function BillingRecordDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useFinanceWorkbench(session?.accessToken, currentUser?.role);
  const [billingRecord, setBillingRecord] = useState<BillingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "finance");
  const billingRecordId = typeof params?.id === "string" ? params.id : "";

  const loadBillingRecord = useCallback(async () => {
    if (!session?.accessToken || !billingRecordId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchBillingRecordById(session.accessToken, billingRecordId);
      setBillingRecord(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os detalhes do billing record.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [billingRecordId, session?.accessToken]);

  useEffect(() => {
    void loadBillingRecord();
  }, [loadBillingRecord]);

  async function handleMarkAsPaid() {
    if (!session?.accessToken || !billingRecord) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedRecord = await payBillingRecord(session.accessToken, billingRecord.id);
      setBillingRecord(updatedRecord);
      setFeedback("Billing record liquidado com sucesso e split atualizado.");
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível liquidar o billing record.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const releasedAmount = useMemo(() => {
    return (billingRecord?.splitAllocations ?? []).reduce((sum, allocation) => {
      return allocation.status === "RELEASED" ? sum + Number(allocation.amount) : sum;
    }, 0);
  }, [billingRecord]);

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando billing record...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe financeiro"
      title="Billing record operacional"
      description="Esta página consolida o detalhe do faturamento, o estado do split e a reconciliação operacional do registro financeiro selecionado."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito ao financeiro"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe financeiro solicitado."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/financeiro"
              className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
            >
              Voltar para financeiro
            </Link>
            <button
              className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadBillingRecord()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
          {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

          {billingRecord ? (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Valor bruto"
                  value={formatCurrency(billingRecord.grossAmount)}
                  description="Montante bruto atualmente registrado no faturamento."
                />
                <MetricCard
                  label="Valor líquido"
                  value={formatCurrency(billingRecord.netAmount)}
                  description="Montante líquido atualmente informado para este billing record."
                />
                <MetricCard
                  label="Split liberado"
                  value={formatCurrency(releasedAmount)}
                  description="Soma das alocações já liberadas dentro do split deste faturamento."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Resumo do registro"
                      title={billingRecord.description ?? billingRecord.externalReference ?? billingRecord.id}
                      description="Este detalhe reúne o contexto comercial e financeiro usado na reconciliação operacional do faturamento."
                    />
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge value={billingRecord.status} />
                      <StatusBadge value={billingRecord.splitStatus} />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-[#8A9AA6] md:grid-cols-2">
                    <p>Operadora: {billingRecord.operator?.tradeName ?? "—"}</p>
                    <p>Partner: {billingRecord.partner?.companyName ?? "—"}</p>
                    <p>Cliente: {billingRecord.client?.companyName ?? billingRecord.client?.tradeName ?? "—"}</p>
                    <p>Produto: {billingRecord.productCatalog?.name ?? "—"}</p>
                    <p>Regra comercial: {billingRecord.commercialRule?.id ?? "—"}</p>
                    <p>Referência externa: {billingRecord.externalReference ?? "—"}</p>
                    <p>Vencimento: {formatCompactDate(billingRecord.dueDate)}</p>
                    <p>Pagamento: {formatCompactDate(billingRecord.paidAt)}</p>
                    <p>Criado em: {formatCompactDate(billingRecord.createdAt)}</p>
                    <p>Atualizado em: {formatCompactDate(billingRecord.updatedAt)}</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <SectionHeader
                    eyebrow="Reconciliação"
                    title="Liquidação e leitura de split"
                    description="Use esta área para concluir a liquidação do faturamento e revisar a composição atual das alocações vinculadas."
                  />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="inline-flex rounded-2xl border border-[#0E9A4F]/30 bg-[#0E9A4F]/10 px-4 py-3 text-sm font-medium text-[#13B860] transition hover:bg-[#13B860]/20 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={() => void handleMarkAsPaid()}
                      disabled={isMutating || billingRecord.status === "PAYMENT_CONFIRMED"}
                    >
                      {isMutating ? "Liquidando..." : "Marcar como pago"}
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    {(billingRecord.splitAllocations ?? []).length > 0 ? (
                      billingRecord.splitAllocations?.map((allocation) => (
                        <article
                          key={allocation.id}
                          className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-white">
                                Destinatário {allocation.recipientType}
                              </h3>
                              <p className="mt-2 text-xs text-[#8A9AA6]">
                                Recipient ID: {allocation.recipientId ?? "Plataforma"}
                              </p>
                            </div>
                            <StatusBadge value={allocation.status} />
                          </div>
                          <div className="mt-3 grid gap-2 text-sm text-[#8A9AA6] sm:grid-cols-2">
                            <p>Percentual: {allocation.percentage}%</p>
                            <p>Valor: {formatCurrency(allocation.amount)}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="Sem alocações calculadas"
                        description="Este billing record ainda não possui split calculado ou liberado no backend."
                      />
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Billing record não carregado"
                description="Não foi possível localizar o registro solicitado ou a sessão atual não tem acesso a ele."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
