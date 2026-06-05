"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import { EmptyState, MetricCard, SectionHeader, StatusBadge } from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";

export default function SalesPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );

  const canAccess = visibleModules.some((module) => module.key === "sales");

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
      description="Esta rota dedicada materializa a leitura das vendas já persistidas, relacionando fechamento comercial, billing records e valores consolidados pela operação."
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
              label="Vendas faturadas"
              value={String(metrics.billedSales)}
              description="Quantidade de registros com faturamento já concluído no backend."
            />
            <MetricCard
              label="Volume bruto"
              value={formatCurrency(metrics.grossSalesValue)}
              description="Soma do valor bruto das vendas visíveis ao perfil autenticado."
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
                description="A tabela abaixo prepara o frontend para evoluir futuramente em direção a filtros por status, detalhe por venda e ações autenticadas de fechamento operacional."
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

            {data.sales.length > 0 ? (
              <div className="mt-6 space-y-4">
                {data.sales.map((sale) => (
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
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhuma venda encontrada"
                  description="A API não retornou vendas para o perfil autenticado nesta sessão."
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
