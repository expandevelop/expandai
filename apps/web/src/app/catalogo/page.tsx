"use client";

import { useMemo } from "react";
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
import { formatCompactDate } from "@/lib/formatters";
import {
  catalogStatusOptions,
  filterProductCatalogs,
} from "@/lib/module-filtering";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { useModuleFilters } from "@/lib/use-module-filters";

const initialCatalogFilters = {
  search: "",
  status: "",
};

export default function CatalogPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );
  const { filters, hasActiveFilters, setFilter, resetFilters } = useModuleFilters(
    "catalogo",
    initialCatalogFilters,
  );

  const filteredCatalogs = useMemo(
    () => filterProductCatalogs(data.productCatalogs, filters),
    [data.productCatalogs, filters],
  );

  const canAccess = visibleModules.some((module) => module.key === "catalog");

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando catálogo...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Portfólio comercial"
      title="Catálogo de produtos publicado"
      description="Esta rota dedicada organiza a leitura inicial dos produtos já persistidos no backend, agora com busca textual e refinamento de status persistidos localmente por módulo."
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
              label="Produtos disponíveis"
              value={String(filteredCatalogs.length)}
              description="Quantidade de itens retornados após a aplicação dos filtros atuais."
            />
            <MetricCard
              label="Catálogos ativos"
              value={String(metrics.activeCatalogs)}
              description="Produtos com status operacional utilizável nesta etapa."
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
                eyebrow="Lista de produtos"
                title="Base comercial visível ao perfil atual"
                description="A tabela abaixo agora permite busca por nome, categoria ou operadora, além do refinamento por status do catálogo."
              />
              <button
                className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => void reload()}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? "Sincronizando catálogo..." : "Sincronizar catálogo"}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <FilterShell>
                <FilterInput
                  label="Busca textual"
                  value={filters.search}
                  placeholder="Produto, categoria ou operadora"
                  onChange={(value) => setFilter("search", value)}
                />
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  options={catalogStatusOptions}
                  onChange={(value) => setFilter("status", value)}
                />
              </FilterShell>

              <FilterSummary
                count={filteredCatalogs.length}
                entityLabel="produtos"
                hasActiveFilters={hasActiveFilters}
                onReset={resetFilters}
              />
            </div>

            {filteredCatalogs.length > 0 ? (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Operadora</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Criado em</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredCatalogs.map((catalog) => (
                      <tr key={catalog.id} className="align-top">
                        <td className="px-4 py-4 font-medium text-white">{catalog.name}</td>
                        <td className="px-4 py-4 text-slate-300">{catalog.category}</td>
                        <td className="px-4 py-4 text-slate-300">
                          {catalog.operator?.tradeName ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge value={catalog.status} />
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {formatCompactDate(catalog.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Nenhum produto corresponde aos filtros"
                  description="Ajuste os filtros ativos ou sincronize novamente a visão para carregar novos dados do catálogo."
                />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito ao catálogo"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de catálogo de produtos."
        />
      )}
    </AppShell>
  );
}
