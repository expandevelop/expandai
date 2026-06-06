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
import { createPartnerOnboarding } from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import { usePersistedDraft } from "@/lib/use-persisted-draft";

const initialPartnerDraft = {
  companyName: "",
  document: "",
  email: "",
  contactName: "",
  password: "",
};

export default function PartnersPage() {
  const { isBooting, session, currentUser } = useAuth();
  const { data, metrics, isLoading, error, visibleModules, reload } = useExpandaiData(
    session?.accessToken,
    currentUser?.role,
  );
  const { draft, isReady, setDraftField, resetDraft } = usePersistedDraft(
    "partners:onboarding",
    initialPartnerDraft,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAccess = visibleModules.some((module) => module.key === "partners");
  const isAdmin = currentUser?.role === "ADMIN";

  async function handleCreatePartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken || !isAdmin) {
      return;
    }

    if (!draft.companyName.trim() || !draft.document.trim() || !draft.email.trim() || !draft.password.trim()) {
      setActionError("Preencha empresa, documento, e-mail e senha para iniciar o onboarding do partner.");
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setActionError(null);

    try {
      const result = await createPartnerOnboarding(session.accessToken, {
        companyName: draft.companyName.trim(),
        document: draft.document.trim(),
        email: draft.email.trim(),
        contactName: draft.contactName.trim() || undefined,
        password: draft.password,
      });

      setFeedback(`Onboarding do partner iniciado com sucesso. ID do partner: ${result.partnerId}.`);
      resetDraft();
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível iniciar o onboarding do partner.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isBooting || !isReady) {
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
      description="Esta rota agora combina leitura operacional, navegação de detalhe e onboarding administrativo autenticado para inclusão de novos partners no ecossistema ExpandAI."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

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

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            {isAdmin ? (
              <FormCard
                eyebrow="Onboarding administrativo"
                title="Cadastrar novo partner"
                description="Este formulário inicia o fluxo real de onboarding do backend, provisionando usuário, entidade partner e registro de onboarding com status pendente."
              >
                <form onSubmit={(event) => void handleCreatePartner(event)}>
                  <FormGrid>
                    <TextField
                      label="Empresa"
                      value={draft.companyName}
                      placeholder="Partner Exemplo Ltda."
                      required
                      onChange={(value) => setDraftField("companyName", value)}
                    />
                    <TextField
                      label="Documento"
                      value={draft.document}
                      placeholder="11.111.111/0001-11"
                      required
                      onChange={(value) => setDraftField("document", value)}
                    />
                    <TextField
                      label="E-mail"
                      value={draft.email}
                      placeholder="parceiro@expandai.com"
                      required
                      onChange={(value) => setDraftField("email", value)}
                    />
                    <TextField
                      label="Contato principal"
                      value={draft.contactName}
                      placeholder="João Partner"
                      onChange={(value) => setDraftField("contactName", value)}
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
                  description="Perfis não administrativos conseguem consultar a base de partners e seus detalhes, mas a criação de novas entidades permanece restrita ao papel Admin."
                />
              </section>
            )}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  eyebrow="Lista comercial"
                  title="Base de partners publicados"
                  description="Cada registro agora já possui atalho para leitura aprofundada da entidade, incluindo conta vinculada e histórico de onboarding."
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
                <div className="mt-6 space-y-4">
                  {data.partners.map((partner) => (
                    <article
                      key={partner.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{partner.companyName}</h3>
                          <p className="mt-2 text-sm text-slate-400">
                            Nível: {partner.partnerLevel ?? "—"}
                          </p>
                        </div>
                        <StatusBadge value={partner.status} />
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                        <p>Documento: {partner.document ?? "—"}</p>
                        <p>Score: {partner.score ?? "—"}</p>
                        <p>Nível: {partner.partnerLevel ?? "—"}</p>
                        <p>Criado em: {formatCompactDate(partner.createdAt)}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                          href={`/partners/${partner.id}`}
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
                    title="Nenhum partner encontrado"
                    description="A API não retornou parceiros para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </section>
          </div>
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
