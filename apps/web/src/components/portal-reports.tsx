"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import { PortalModal, PortalShell, ReportTable, SectionCard, TrendBars } from "@/components/portal-ui";
import { useAuth } from "@/components/auth-provider";
import { buildPortalSnapshot } from "@/lib/portal-analytics";
import { portalConfigs, type PortalKey } from "@/lib/portal-config";
import { useExpandaiData } from "@/lib/use-expandai-data";

type PortalReportsProps = {
  portalKey: PortalKey;
};

function buildPreviewMessage(portalBadge: string, sessionRole?: string, experienceRole?: string) {
  if (!sessionRole || !experienceRole || sessionRole === experienceRole) {
    return null;
  }

  return `Prévia de usabilidade em modo ${portalBadge}. A sessão atual está autenticada como ${sessionRole}, mas a experiência visual foi desenhada para ${experienceRole}.`;
}

export function PortalReports({ portalKey }: PortalReportsProps) {
  const portal = portalConfigs[portalKey];
  const { isBooting, session, currentUser } = useAuth();
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const { data, isLoading, error } = useExpandaiData(session?.accessToken, portal.experienceRole);
  const snapshot = useMemo(() => buildPortalSnapshot(portalKey, data), [data, portalKey]);
  const previewMessage = buildPreviewMessage(portal.badge, currentUser?.role, portal.experienceRole);

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-500">Carregando relatórios do portal...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <>
      <PortalShell
        portal={portal}
        currentUser={currentUser}
        title={`Relatórios do ${portal.title}`}
        description="A camada analítica foi redesenhada para privilegiar clareza, leitura executiva e comparação rápida, reduzindo ruído visual e mantendo o contexto do portal atual."
        previewMessage={previewMessage}
        actionSlot={[
          <button
            key="metodologia"
            type="button"
            className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            onClick={() => setIsMethodologyOpen(true)}
          >
            Ver metodologia
          </button>,
          <Link
            key="dashboard"
            href={portal.route}
            className="inline-flex rounded-2xl border border-[#16a34a]/20 bg-[#16a34a]/10 px-4 py-3 text-sm font-medium text-[#0f5132] transition hover:bg-[#16a34a]/15"
          >
            Voltar ao dashboard
          </Link>,
        ]}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Leitura principal"
            title="Indicadores centrais desta visão"
            description="A tabela abaixo resume os principais indicadores prontos para exploração dentro do contexto autenticado atual."
          >
            <ReportTable rows={snapshot.reportRows} />
          </SectionCard>

          <SectionCard
            eyebrow="Situação do pipeline"
            title="Distribuição das oportunidades"
            description="Esta leitura resume o volume de oportunidades por estágio na visão atual, preservando entendimento rápido do funil."
          >
            <TrendBars
              title={isLoading ? "Atualizando leitura analítica..." : "Oportunidades por estágio"}
              description="A distribuição considera apenas os registros visíveis ao contexto atual."
              items={snapshot.stageDistribution}
            />
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Conversão"
            title="Status das vendas"
            description="Comparativo compacto dos estados comerciais mais frequentes nesta visão analítica."
          >
            <TrendBars
              title={isLoading ? "Atualizando leitura comercial..." : "Vendas por status"}
              description="Leitura resumida dos estados de fechamento comercial disponíveis na base atual."
              items={snapshot.salesDistribution}
            />
          </SectionCard>

          <SectionCard
            eyebrow="Leituras rápidas"
            title="Aspectos de atenção para o portal"
            description="Os destaques abaixo funcionam como uma síntese objetiva dos temas que mais importam para a tomada de decisão neste perfil."
          >
            <div className="space-y-4">
              {snapshot.quickFacts.map((fact) => (
                <article key={fact.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{fact.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{fact.value}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </section>
      </PortalShell>

      <PortalModal
        open={isMethodologyOpen}
        title={`Metodologia dos relatórios do ${portal.title}`}
        description="Os relatórios refletem os mesmos dados carregados na experiência do portal, reorganizados em leituras executivas, distribuições e indicadores rápidos para facilitar testes de compreensão e navegação."
        onClose={() => setIsMethodologyOpen(false)}
        portalLabel={portal.title}
      >
        <div className="space-y-4 text-sm leading-7 text-slate-600">
          <p>
            As métricas resumem apenas os registros carregados pela sessão autenticada e pelo escopo visível ao perfil atual.
          </p>
          <p>
            As distribuições utilizam agrupamentos simples por estágio e status, priorizando leitura rápida e comparação imediata.
          </p>
          <p>
            Os destaques e fatos rápidos foram organizados para reduzir ruído visual e facilitar a validação de usabilidade antes da rodada formal de homologação.
          </p>
        </div>
      </PortalModal>
    </>
  );
}
