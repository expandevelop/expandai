"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import { EmptyState, MetricCard, SectionHeader, StatusBadge } from "@/components/dashboard-ui";
import { useAuth } from "@/components/auth-provider";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";

export default function PartnersPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );

  const canAccess = visibleModules.some((module) => module.key === "partners");

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando partners...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Ecossistema comercial"
      title="Partners conectados à operação"
      description="Esta rota dedicada organiza a leitura dos parceiros já persistidos no backend, evidenciando nível de atuação, status e presença comercial dentro da plataforma."
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
              label="Partners disponíveis"
              value={String(metrics.partners)}
              description="Quantidade total retornada ao perfil autenticado pela API real."
            />
            <MetricCard
              label="Oportunidades abertas"
              value={String(metrics.openOpportunities)}
              description="Volume atual do pipeline comercial visível ao mesmo perfil."
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
                eyebrow="Lista comercial"
                title="Base de partners publicados"
                description="A tabela abaixo prepara o frontend para evoluir futuramente em direção a filtros, detalhes por entidade e ações autenticadas de relacionamento comercial."
              />
              <button
                className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void reload()}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Sincronizando partners..." : "Sincronizar partners"}
              </button>
            </div>

            {data.partners.length > 0 ? (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Empresa</th>
                      <th className="px-4 py-3">Nível</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criada em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.partners.map((partner) => (
                      <tr key={partner.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-white">{partner.companyName}</td>
                        <td className="px-4 py-4 text-slate-300">{partner.partnerLevel ?? "—"}</td>
                        <td className="px-4 py-4">
                          <StatusBadge value={partner.status} />
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {formatCompactDate(partner.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhum partner encontrado"
                  description="A API não retornou parceiros para o perfil autenticado nesta sessão."
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito a partners"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de partners."
        />
      )}
    </AppShell>
  );
}
