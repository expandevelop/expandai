"use client";

import { useCallback, useEffect, useState } from "react";
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
import { fetchPartnerById } from "@/lib/api";
import { formatCompactDate } from "@/lib/formatters";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type { Partner } from "@/types/expandai";

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const { isBooting, session, currentUser } = useAuth();
  const { visibleModules } = useExpandaiData(session?.accessToken, currentUser?.role);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "partners");
  const partnerId = typeof params?.id === "string" ? params.id : "";

  const loadPartner = useCallback(async () => {
    if (!session?.accessToken || !partnerId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await fetchPartnerById(session.accessToken, partnerId);
      setPartner(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o detalhe do partner.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, session?.accessToken]);

  useEffect(() => {
    void loadPartner();
  }, [loadPartner]);

  if (isBooting) {
    return (
      <main className="min-h-screen bg-[#0D1E2D] text-[#CDD6DC]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-[#8A9AA6]">Carregando partner...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Detalhe de partner"
      title="Visão aprofundada da entidade comercial"
      description="Esta página reúne dados cadastrais, conta vinculada e histórico de onboarding do partner dentro do ecossistema ExpandAI."
    >
      {!canAccess ? (
        <EmptyState
          title="Acesso restrito a partners"
          description="O papel autenticado nesta sessão não possui visibilidade para o detalhe do módulo de partners."
        />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/partners"
              className="inline-flex rounded-2xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20"
            >
              Voltar para partners
            </Link>
            <button
              className="inline-flex rounded-2xl border border-[#FF842A]/30 bg-[#FF842A]/10 px-4 py-3 text-sm font-medium text-[#FF842A] transition hover:bg-[#FF842A]/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => void loadPartner()}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando detalhe..." : "Atualizar detalhe"}
            </button>
          </div>

          {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}

          {partner ? (
            <>
              <section className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Status do partner"
                  value={partner.status}
                  description="Estado operacional atual da entidade no backend."
                />
                <MetricCard
                  label="Nível"
                  value={partner.partnerLevel ?? "—"}
                  description="Posicionamento comercial atual do parceiro."
                />
                <MetricCard
                  label="Onboardings"
                  value={String(partner.onboardings?.length ?? 0)}
                  description="Registros históricos de onboarding vinculados ao partner."
                />
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionHeader
                      eyebrow="Cadastro principal"
                      title={partner.companyName}
                      description="Base cadastral e comercial do parceiro no ecossistema ExpandAI."
                    />
                    <StatusBadge value={partner.status} />
                  </div>

                  <div className="mt-6 grid gap-4 text-sm text-[#8A9AA6] md:grid-cols-2">
                    <p>Documento: {partner.document ?? "—"}</p>
                    <p>Nível: {partner.partnerLevel ?? "—"}</p>
                    <p>Score: {partner.score ?? "—"}</p>
                    <p>Criado em: {formatCompactDate(partner.createdAt)}</p>
                    <p>Atualizado em: {formatCompactDate(partner.updatedAt)}</p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-white/8 bg-[#07131F]/60 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8A9AA6]">
                      Conta vinculada
                    </h3>
                    <div className="mt-4 grid gap-3 text-sm text-[#8A9AA6] md:grid-cols-2">
                      <p>Usuário: {partner.user?.name ?? "—"}</p>
                      <p>E-mail: {partner.user?.email ?? "—"}</p>
                      <p>Perfil: {partner.user?.role ?? "—"}</p>
                      <p>Status: {partner.user?.status ?? "—"}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/8 bg-[#162A3D]/70 p-6">
                  <SectionHeader
                    eyebrow="Histórico de onboarding"
                    title="Registros operacionais"
                    description="Últimos estados do fluxo administrativo desta entidade dentro do ecossistema."
                  />
                  <div className="mt-4 space-y-3">
                    {partner.onboardings?.length ? (
                      partner.onboardings.map((onboarding) => (
                        <div
                          key={onboarding.id}
                          className="rounded-2xl border border-white/8 bg-[#07131F]/60 p-4 text-sm text-[#8A9AA6]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-medium text-white">{onboarding.actorType}</p>
                            <StatusBadge value={onboarding.status} />
                          </div>
                          <p className="mt-2">Criado em: {formatCompactDate(onboarding.createdAt)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#8A9AA6]">Nenhum onboarding vinculado foi encontrado.</p>
                    )}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="Partner não carregado"
                description="Não foi possível localizar a entidade solicitada ou a sessão atual não possui acesso a esse registro."
              />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
