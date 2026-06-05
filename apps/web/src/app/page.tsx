"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import { dashboardModules } from "@/lib/modules";
import { API_BASE_URL } from "@/lib/session";
import { useExpandaiData } from "@/lib/use-expandai-data";

export default function Home() {
  const { isBooting, session, currentUser, visibleModules } = useAuth();
  const { data, metrics, isLoading, error, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );

  const allowedModuleKeys = new Set(visibleModules.map((module) => module.key));

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando a camada web da ExpandAI...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Visão geral"
      title="Painel executivo da operação ExpandAI"
      description="Esta visão inicial consolida sessão, métricas e leitura resumida dos módulos já conectados à API real, servindo como porta de entrada do novo app shell autenticado."
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Operadoras e partners"
          value={`${metrics.operators} / ${metrics.partners}`}
          description="Quantidade de entidades comerciais disponíveis ao perfil atual."
        />
        <MetricCard
          label="Pipeline comercial"
          value={`${metrics.openOpportunities} oportunidades abertas`}
          description="Oportunidades em andamento, excluindo etapas finais de ganho e perda."
        />
        <MetricCard
          label="Vendas faturadas"
          value={`${metrics.billedSales} vendas`}
          description={`Volume bruto consolidado: ${formatCurrency(metrics.grossSalesValue)}.`}
        />
        <MetricCard
          label="Split liberado"
          value={formatCurrency(metrics.releasedSplitValue)}
          description={`Billing records confirmados: ${metrics.confirmedBillings}.`}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Contexto operacional"
            title="Sessão ativa e navegação autorizada"
            description="O app shell passa a refletir a política atual de autorização do backend e organiza a evolução do frontend por áreas funcionais dedicadas."
          />
          <button
            className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void reload()}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "Sincronizando dados..." : "Sincronizar visão geral"}
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">Payload da sessão</h3>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(
                {
                  apiBaseUrl: API_BASE_URL,
                  user: currentUser,
                  visibleModules: visibleModules.map((module) => ({
                    key: module.key,
                    href: module.href,
                    endpoint: module.endpoint,
                  })),
                },
                null,
                2,
              )}
            </pre>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">Módulos disponíveis nesta etapa</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {visibleModules.map((module) => (
                <article
                  key={module.key}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                >
                  <h4 className="text-sm font-semibold text-white">{module.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
                  <p className="mt-3 text-xs text-cyan-100">Rota: {module.href}</p>
                  <p className="mt-1 text-xs text-slate-500">API: {module.endpoint}</p>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeader
            eyebrow="Módulo comercial"
            title="Oportunidades e vendas recentes"
            description="A camada web mantém leitura resumida do encadeamento comercial enquanto as rotas dedicadas são abertas na próxima fase da implementação."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Oportunidades</h3>
                <StatusBadge value={String(data.opportunities.length)} />
              </div>
              {allowedModuleKeys.has("opportunities") ? (
                data.opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {data.opportunities.slice(0, 4).map((opportunity) => (
                      <article
                        key={opportunity.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{opportunity.title}</h4>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {truncateText(opportunity.description, 100)}
                            </p>
                          </div>
                          <StatusBadge value={opportunity.stage} />
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                          <p>Operadora: {opportunity.operator?.tradeName ?? "—"}</p>
                          <p>Partner: {opportunity.partner?.companyName ?? "—"}</p>
                          <p>Produto: {opportunity.productCatalog?.name ?? "—"}</p>
                          <p>Criada em: {formatCompactDate(opportunity.createdAt)}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Sem oportunidades carregadas"
                    description="Ainda não há oportunidades retornadas pela API para o perfil atual."
                  />
                )
              ) : (
                <EmptyState
                  title="Módulo indisponível para o perfil"
                  description="O backend não expõe o pipeline de oportunidades ao papel autenticado nesta sessão."
                />
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Vendas</h3>
                <StatusBadge value={String(data.sales.length)} />
              </div>
              {allowedModuleKeys.has("sales") ? (
                data.sales.length > 0 ? (
                  <div className="space-y-3">
                    {data.sales.slice(0, 4).map((sale) => (
                      <article
                        key={sale.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{sale.title}</h4>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {truncateText(sale.description, 100)}
                            </p>
                          </div>
                          <StatusBadge value={sale.status} />
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                          <p>Valor bruto: {formatCurrency(sale.grossAmount)}</p>
                          <p>Valor líquido: {formatCurrency(sale.netAmount)}</p>
                          <p>Oportunidade: {sale.opportunity?.title ?? "—"}</p>
                          <p>Billing: {sale.billingRecord?.status ?? "—"}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Sem vendas carregadas"
                    description="Ainda não há vendas retornadas pela API para o perfil atual."
                  />
                )
              ) : (
                <EmptyState
                  title="Módulo indisponível para o perfil"
                  description="O backend não expõe a área de vendas ao papel autenticado nesta sessão."
                />
              )}
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeader
            eyebrow="Mapa de evolução"
            title="Rotas previstas para a aplicação modular"
            description="A etapa seguinte abre páginas dedicadas por módulo, mantendo o app shell como elemento compartilhado de navegação e contexto."
          />
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Módulo</th>
                  <th className="px-4 py-3">Rota web</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Status atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dashboardModules.map((module) => (
                  <tr key={module.key} className="align-top">
                    <td className="px-4 py-4 font-medium text-white">{module.title}</td>
                    <td className="px-4 py-4 text-cyan-100">{module.href}</td>
                    <td className="px-4 py-4 text-slate-300">{module.endpoint}</td>
                    <td className="px-4 py-4 text-slate-400">
                      {allowedModuleKeys.has(module.key)
                        ? "Pronto para receber tela dedicada"
                        : "Restringido pelo perfil autenticado"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
