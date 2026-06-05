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
import {
  activateProductCatalog,
  deactivateProductCatalog,
  fetchProductCatalogById,
} from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type { ProductCatalog } from "@/types/expandai";

export default function ProductCatalogDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useExpandaiData(session?.accessToken, currentUser?.role);
  const [catalog, setCatalog] = useState<ProductCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "catalog");
  const catalogId = typeof params?.id === "string" ? params.id : "";

  const loadCatalog = useCallback(async () => {
    if (!session?.accessToken || !catalogId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchProductCatalogById(session.accessToken, catalogId);
      setCatalog(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os detalhes do produto de catálogo.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [catalogId, session?.accessToken]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function handleStatusToggle() {
    if (!session?.accessToken || !catalog) {
      return;
    }

    setIsMutating(true);
    setError(null);
    setFeedback(null);

    try {
      const updatedCatalog =
        catalog.status === "ACTIVE"
          ? await deactivateProductCatalog(session.accessToken, catalog.id)
          : await activateProductCatalog(session.accessToken, catalog.id);
      setCatalog(updatedCatalog);
      setFeedback(
        catalog.status === "ACTIVE"
          ? "Produto de catálogo inativado com sucesso."
          : "Produto de catálogo ativado com sucesso.",
      );
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível alterar o status do produto de catálogo.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  const metrics = useMemo(
    () => ({
      statusAtual: catalog?.status ?? "—",
      categoria: catalog?.category ?? "Não informada",
      operadora: catalog?.operator?.tradeName ?? "—",
    }),
    [catalog],
  );

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando produto de catálogo...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe do catálogo"
      title="Produto e contexto comercial"
      description="Esta página concentra a leitura aprofundada do item de catálogo, incluindo metadados comerciais, dados da operadora e ação rápida de ativação operacional."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito ao catálogo"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe do módulo de catálogo."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
              Voltar para catálogo
            </Link>
            <button
              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadCatalog()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
          {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

          {catalog ? (
            <>
              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status atual"
                  value={metrics.statusAtual}
                  description="Reflete o estado operacional mais recente persistido no backend."
                />
                <MetricCard
                  label="Categoria"
                  value={metrics.categoria}
                  description="Classificação comercial atualmente informada para o produto."
                />
                <MetricCard
                  label="Operadora"
                  value={metrics.operadora}
                  description="Entidade responsável pela publicação deste item no ecossistema."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Resumo do produto"
                      title={catalog.name}
                      description={catalog.description ?? "Sem descrição complementar cadastrada para este produto de catálogo."}
                    />
                    <StatusBadge value={catalog.status} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                    <p>Categoria: {catalog.category ?? "—"}</p>
                    <p>Regra de comissão: {catalog.commissionRule ?? "—"}</p>
                    <p>Operadora: {catalog.operator?.tradeName ?? "—"}</p>
                    <p>Razão social: {catalog.operator?.legalName ?? "—"}</p>
                    <p>Documento da operadora: {catalog.operator?.document ?? "—"}</p>
                    <p>Modelo de comissão: {catalog.operator?.commissionModel ?? "—"}</p>
                    <p>Status da operadora: {catalog.operator?.status ?? "—"}</p>
                    <p>Criado em: {formatCompactDate(catalog.createdAt)}</p>
                    <p>Atualizado em: {formatCompactDate(catalog.updatedAt)}</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                  <SectionHeader
                    eyebrow="Ações rápidas"
                    title="Estado operacional do catálogo"
                    description="Use esta área para promover ou recolher o produto do portfólio operacional sem sair da leitura detalhada."
                  />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={() => void handleStatusToggle()}
                      disabled={isMutating}
                    >
                      {isMutating
                        ? "Aplicando..."
                        : catalog.status === "ACTIVE"
                          ? "Inativar produto"
                          : "Ativar produto"}
                    </button>
                    <Link
                      href="/catalogo"
                      className="inline-flex rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
                    >
                      Voltar para manutenção
                    </Link>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Produto de catálogo não carregado"
                description="Não foi possível localizar o registro solicitado ou a sessão atual não tem acesso a ele."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
