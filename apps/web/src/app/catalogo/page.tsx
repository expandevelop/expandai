"use client";

import Link from "next/link";
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
  activateProductCatalog,
  createProductCatalog,
  deactivateProductCatalog,
  deleteProductCatalog,
  updateProductCatalog,
} from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { catalogStatusOptions, filterProductCatalogs } from "@/lib/module-filtering";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { useModuleFilters } from "@/lib/use-module-filters";
import { usePersistedDraft } from "@/lib/use-persisted-draft";
import type { ProductCatalog } from "@/types/expandai";

const initialCatalogFilters = {
  search: "",
  status: "",
};

const initialCatalogDraft = {
  operatorId: "",
  name: "",
  description: "",
  category: "",
  commissionRule: "",
};

function mapCatalogToDraft(catalog: ProductCatalog) {
  return {
    operatorId: catalog.operatorId ?? catalog.operator?.id ?? "",
    name: catalog.name ?? "",
    description: catalog.description ?? "",
    category: catalog.category ?? "",
    commissionRule: catalog.commissionRule ?? "",
  };
}

function toOptionalString(value: string) {
  return value.trim() ? value.trim() : undefined;
}

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
  const {
    draft,
    isReady,
    setDraftField,
    replaceDraft,
    resetDraft,
  } = usePersistedDraft("catalogo:form", initialCatalogDraft);
  const [editingCatalogId, setEditingCatalogId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const filteredCatalogs = useMemo(
    () => filterProductCatalogs(data.productCatalogs, filters),
    [data.productCatalogs, filters],
  );
  const operatorOptions = useMemo(
    () =>
      data.operators.map((operator) => ({
        value: operator.id,
        label: operator.tradeName,
        hint: operator.legalName,
      })),
    [data.operators],
  );

  const canAccess = visibleModules.some((module) => module.key === "catalog");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken) {
      return;
    }

    if (!draft.operatorId || !draft.name.trim()) {
      setActionError("Selecione uma operadora e informe o nome do produto antes de salvar.");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setFeedback(null);

    try {
      if (editingCatalogId) {
        await updateProductCatalog(session.accessToken, editingCatalogId, {
          operatorId: draft.operatorId,
          name: draft.name.trim(),
          description: toOptionalString(draft.description),
          category: toOptionalString(draft.category),
          commissionRule: toOptionalString(draft.commissionRule),
        });
        setFeedback("Produto de catálogo atualizado com sucesso.");
      } else {
        await createProductCatalog(session.accessToken, {
          operatorId: draft.operatorId,
          name: draft.name.trim(),
          description: toOptionalString(draft.description),
          category: toOptionalString(draft.category),
          commissionRule: toOptionalString(draft.commissionRule),
        });
        setFeedback("Produto de catálogo criado com sucesso.");
      }

      setEditingCatalogId(null);
      resetDraft();
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível salvar o produto de catálogo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(catalog: ProductCatalog) {
    setEditingCatalogId(catalog.id);
    setFeedback(null);
    setActionError(null);
    replaceDraft(mapCatalogToDraft(catalog));
  }

  function handleCancelEdit() {
    setEditingCatalogId(null);
    setFeedback(null);
    setActionError(null);
    resetDraft();
  }

  async function handleStatusToggle(catalog: ProductCatalog) {
    if (!session?.accessToken) {
      return;
    }

    setPendingActionId(catalog.id);
    setActionError(null);
    setFeedback(null);

    try {
      if (catalog.status === "ACTIVE") {
        await deactivateProductCatalog(session.accessToken, catalog.id);
        setFeedback("Produto de catálogo inativado com sucesso.");
      } else {
        await activateProductCatalog(session.accessToken, catalog.id);
        setFeedback("Produto de catálogo ativado com sucesso.");
      }

      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível alterar o status do produto de catálogo.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleDelete(catalogId: string) {
    if (!session?.accessToken) {
      return;
    }

    setPendingActionId(catalogId);
    setActionError(null);
    setFeedback(null);

    try {
      await deleteProductCatalog(session.accessToken, catalogId);
      if (editingCatalogId === catalogId) {
        handleCancelEdit();
      }
      setFeedback("Produto de catálogo removido com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível remover o produto de catálogo.",
      );
    } finally {
      setPendingActionId(null);
    }
  }

  if (isBooting || !isReady) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando catálogo...</p>
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
      description="Esta rota agora evolui para um fluxo transacional completo, com criação, edição, mudança de status e navegação contextual para o detalhe operacional de cada item do catálogo."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Produtos filtrados"
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

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <FormCard
              eyebrow="Formulário autenticado"
              title={editingCatalogId ? "Editar produto de catálogo" : "Cadastrar produto de catálogo"}
              description="A criação nasce em status pendente no backend e a mesma superfície também pode ser usada para manutenção comercial do item já existente."
            >
              <form onSubmit={(event) => void handleSubmit(event)}>
                <FormGrid>
                  <SelectField
                    label="Operadora"
                    value={draft.operatorId}
                    options={operatorOptions}
                    onChange={(value) => setDraftField("operatorId", value)}
                  />
                  <TextField
                    label="Nome do produto"
                    value={draft.name}
                    placeholder="Internet Empresarial Pro"
                    required
                    onChange={(value) => setDraftField("name", value)}
                  />
                  <TextField
                    label="Categoria"
                    value={draft.category}
                    placeholder="B2B, Mobile, Cloud..."
                    onChange={(value) => setDraftField("category", value)}
                  />
                  <TextField
                    label="Regra de comissão"
                    value={draft.commissionRule}
                    placeholder="20% no primeiro ciclo"
                    onChange={(value) => setDraftField("commissionRule", value)}
                  />
                  <TextAreaField
                    label="Descrição"
                    value={draft.description}
                    placeholder="Detalhes comerciais, diferenciais e condições de operação."
                    onChange={(value) => setDraftField("description", value)}
                  />
                </FormGrid>

                <FormActions
                  submitLabel={editingCatalogId ? "Salvar alterações" : "Criar produto"}
                  resetLabel={editingCatalogId ? "Cancelar edição" : "Limpar rascunho"}
                  isSubmitting={isSubmitting}
                  onReset={editingCatalogId ? handleCancelEdit : resetDraft}
                />
              </form>
            </FormCard>

            <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  eyebrow="Lista de produtos"
                  title="Base comercial visível ao perfil atual"
                  description="A visão abaixo agora combina filtros persistidos, edição rápida, transições de status e acesso ao detalhe completo do item."
                />
                <button
                  className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="mt-6 space-y-4">
                  {filteredCatalogs.map((catalog) => {
                    const isPendingAction = pendingActionId === catalog.id;
                    const isEditing = editingCatalogId === catalog.id;

                    return (
                      <article
                        key={catalog.id}
                        className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{catalog.name}</h3>
                            <p className="mt-2 text-sm text-[#8A9AA6]">
                              Operadora: {catalog.operator?.tradeName ?? "—"}
                            </p>
                          </div>
                          <StatusBadge value={catalog.status} />
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-[#8A9AA6] md:grid-cols-2 xl:grid-cols-4">
                          <p>Categoria: {catalog.category ?? "—"}</p>
                          <p>Comissão: {catalog.commissionRule ?? "—"}</p>
                          <p>Criado em: {formatCompactDate(catalog.createdAt)}</p>
                          <p>Atualizado em: {formatCompactDate(catalog.updatedAt)}</p>
                        </div>

                        {catalog.description ? (
                          <p className="mt-4 text-sm leading-6 text-[#8A9AA6]">{catalog.description}</p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20"
                            type="button"
                            onClick={() => handleEdit(catalog)}
                          >
                            {isEditing ? "Em edição" : "Editar"}
                          </button>
                          <button
                            className="inline-flex rounded-2xl border border-[#0E9A4F]/30 bg-[#0E9A4F]/10 px-4 py-3 text-sm font-medium text-[#13B860] transition hover:bg-[#13B860]/20 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => void handleStatusToggle(catalog)}
                            disabled={isPendingAction}
                          >
                            {isPendingAction
                              ? "Aplicando..."
                              : catalog.status === "ACTIVE"
                                ? "Inativar"
                                : "Ativar"}
                          </button>
                          <Link
                            href={`/catalogo/${catalog.id}`}
                            className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
                          >
                            Abrir detalhe
                          </Link>
                          <button
                            className="inline-flex rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => void handleDelete(catalog.id)}
                            disabled={isPendingAction}
                          >
                            Excluir
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Nenhum produto corresponde aos filtros"
                    description="Ajuste os filtros ativos ou crie um novo item para expandir o catálogo comercial da operação."
                  />
                </div>
              )}
            </section>
          </div>
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
