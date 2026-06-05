"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import { EmptyState, MetricCard, SectionHeader, StatusBadge } from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import { formatCompactDate, formatCurrency } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";

export default function FinancePage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );

  const canAccess = visibleModules.some((module) => module.key === "finance");

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando financeiro...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Financeiro e split"
      title="Billing records e regras comerciais"
      description="Esta rota dedicada consolida a leitura inicial do módulo financeiro, relacionando regras comerciais, registros de cobrança e estado de split operacional."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Billing records confirmados"
              value={String(metrics.confirmedBillings)}
              description="Quantidade de registros com confirmação de pagamento visíveis ao perfil autenticado."
            />
            <MetricCard
              label="Split liberado"
              value={formatCurrency(metrics.releasedSplitValue)}
              description="Soma das alocações já liberadas nos billing records retornados pela API."
            />
            <MetricCard
              label="Regras comerciais"
              value={String(data.commercialRules.length)}
              description="Quantidade de regras de split e distribuição disponíveis nesta visão."
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  eyebrow="Regras comerciais"
                  title="Distribuição entre operadora, partner e plataforma"
                  description="Esta tabela prepara o frontend para evoluir futuramente em direção a manutenção de regras, filtros por produto e governança detalhada do split."
                />
                <button
                  className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void reload()}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? "Sincronizando financeiro..." : "Sincronizar financeiro"}
                </button>
              </div>

              {data.commercialRules.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {data.commercialRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <h3 className="text-sm font-semibold text-white">
                        {rule.productCatalog?.name ?? "Regra sem produto associado"}
                      </h3>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                        <p>Operadora: {rule.operatorPercentage}%</p>
                        <p>Partner: {rule.partnerPercentage}%</p>
                        <p>Plataforma: {rule.platformPercentage}%</p>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Operadora: {rule.operator?.tradeName ?? "—"}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Sem regras comerciais"
                    description="A API não retornou regras comerciais para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <SectionHeader
                eyebrow="Billing records"
                title="Cobranças sincronizadas com a operação"
                description="Os registros abaixo materializam o acoplamento atual entre venda, faturamento e processamento de split no backend publicado."
              />
              {data.billingRecords.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {data.billingRecords.map((record) => (
                    <article
                      key={record.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {record.description ?? record.externalReference ?? record.id}
                          </h3>
                          <p className="mt-2 text-sm text-slate-400">
                            Produto: {record.productCatalog?.name ?? "—"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={record.status} />
                          <StatusBadge value={record.splitStatus} />
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                        <p>Valor bruto: {formatCurrency(record.grossAmount)}</p>
                        <p>Valor líquido: {formatCurrency(record.netAmount)}</p>
                        <p>Partner: {record.partner?.companyName ?? "—"}</p>
                        <p>Pago em: {formatCompactDate(record.paidAt)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Sem billing records"
                    description="A API não retornou registros financeiros para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </article>
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito ao financeiro"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo financeiro."
        />
      )}
    </AppShell>
  );
}
