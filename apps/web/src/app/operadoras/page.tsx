"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import {
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import {
  FormActions,
  FormCard,
  FormGrid,
  InlineMessage,
  TextField,
} from "@/components/transaction-form-ui";
import { useAuth } from "@/components/auth-provider";
import { createOperatorOnboarding } from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { usePersistedDraft } from "@/lib/use-persisted-draft";

const initialOperatorDraft = {
  companyName: "",
  document: "",
  email: "",
  phone: "",
  password: "",
};

export default function OperatorsPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );
  const { draft, isReady, setDraftField, resetDraft } = usePersistedDraft(
    "operadoras:onboarding",
    initialOperatorDraft,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAccess = visibleModules.some((module) => module.key === "operators");
  const isAdmin = currentUser?.role === "ADMIN";

  async function handleCreateOperator(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken || !isAdmin) {
      return;
    }

    if (!draft.companyName.trim() || !draft.document.trim() || !draft.email.trim() || !draft.password.trim()) {
      setActionError("Preencha empresa, documento, e-mail e senha para iniciar o onboarding da operadora.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setActionError(null);

    try {
      const result = await createOperatorOnboarding(session.accessToken, {
        companyName: draft.companyName.trim(),
        document: draft.document.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || undefined,
        password: draft.password,
      });

      setFeedback(
        `Onboarding da operadora iniciado com sucesso. ID da operadora: ${result.operatorId}.`,
      );
      resetDraft();
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível iniciar o onboarding da operadora.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isBooting || !isReady) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando operadoras...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Cadastro mestre"
      title="Operadoras conectadas ao ecossistema"
      description="Esta rota agora combina leitura operacional, navegação para detalhe da entidade e, para perfis administrativos, onboarding autenticado de novas operadoras diretamente na camada web."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Operadoras disponíveis"
              value={String(metrics.operators)}
              description="Quantidade total retornada ao perfil autenticado pela API real."
            />
            <MetricCard
              label="Catálogos vinculados"
              value={String(metrics.activeCatalogs)}
              description="Produtos já visíveis e associados às operadoras carregadas."
            />
            <MetricCard
              label="Sincronização"
              value={isLoading ? "Em andamento" : "Atualizada"}
              description="Reflete o estado atual do carregamento desta visão dedicada."
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            {isAdmin ? (
              <FormCard
                eyebrow="Onboarding administrativo"
                title="Cadastrar nova operadora"
                description="Este formulário inicia o fluxo real de onboarding do backend, provisionando usuário, entidade operadora e registro de onboarding com status pendente."
              >
                <form onSubmit={(event) => void handleCreateOperator(event)}>
                  <FormGrid>
                    <TextField
                      label="Razão social"
                      value={draft.companyName}
                      placeholder="Operadora Exemplo S.A."
                      required
                      onChange={(value) => setDraftField("companyName", value)}
                    />
                    <TextField
                      label="Documento"
                      value={draft.document}
                      placeholder="00.000.000/0001-00"
                      required
                      onChange={(value) => setDraftField("document", value)}
                    />
                    <TextField
                      label="E-mail"
                      value={draft.email}
                      placeholder="contato@operadora.com"
                      required
                      onChange={(value) => setDraftField("email", value)}
                    />
                    <TextField
                      label="Telefone"
                      value={draft.phone}
                      placeholder="+55 11 99999-9999"
                      onChange={(value) => setDraftField("phone", value)}
                    />
                    <TextField
                      label="Senha inicial"
                      value={draft.password}
                      placeholder="Expand@123"
                      required
                      type="password"
                      onChange={(value) => setDraftField("password", value)}
                    />
                  </FormGrid>

                  <FormActions
                    submitLabel="Iniciar onboarding"
                    resetLabel="Limpar rascunho"
                    isSubmitting={isSubmitting}
                    onReset={resetDraft}
                  />
                </form>
              </FormCard>
            ) : (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <SectionHeader
                  eyebrow="Leitura operacional"
                  title="Onboarding administrativo restrito"
                  description="Perfis não administrativos conseguem consultar a base de operadoras e seus detalhes, mas a criação de novas entidades permanece restrita ao papel Admin."
                />
              </section>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  eyebrow="Lista operacional"
                  title="Base de operadoras publicadas"
                  description="Cada registro agora já possui atalho para leitura aprofundada da entidade, incluindo usuário vinculado, onboardings e produtos associados."
                />
                <button
                  className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void reload()}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? "Sincronizando operadoras..." : "Sincronizar operadoras"}
                </button>
              </div>

              {data.operators.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {data.operators.map((operator) => (
                    <article
                      key={operator.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{operator.tradeName}</h3>
                          <p className="mt-2 text-sm text-slate-400">{operator.legalName}</p>
                        </div>
                        <StatusBadge value={operator.status} />
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                        <p>Documento: {operator.document ?? "—"}</p>
                        <p>E-mail: {operator.email ?? "—"}</p>
                        <p>Telefone: {operator.phone ?? "—"}</p>
                        <p>Criada em: {formatCompactDate(operator.createdAt)}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/operadoras/${operator.id}`}
                          className="inline-flex rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
                        >
                          Abrir detalhe
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Nenhuma operadora encontrada"
                    description="A API não retornou operadoras para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito a operadoras"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo de operadoras."
        />
      )}
    </AppShell>
  );
}
