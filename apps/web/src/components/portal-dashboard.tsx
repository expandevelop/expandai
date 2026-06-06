"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import {
  PortalMetricCard,
  PortalModal,
  PortalShell,
  QuickFactGrid,
  ReportTable,
  SectionCard,
  SpotlightList,
  TrendBars,
} from "@/components/portal-ui";
import { useAuth } from "@/components/auth-provider";
import { buildPortalSnapshot } from "@/lib/portal-analytics";
import { portalConfigs, type PortalKey } from "@/lib/portal-config";
import { useExpandaiData } from "@/lib/use-expandai-data";

type PortalDashboardProps = {
  portalKey: PortalKey;
};

export function PortalDashboard({ portalKey }: PortalDashboardProps) {
  const portal = portalConfigs[portalKey];
  const { isBooting, session, currentUser } = useAuth();
  const [activeModal, setActiveModal] = useState<"prioridades" | "apps" | null>(null);
  const { data, isLoading, error } = useExpandaiData(session?.accessToken, portal.experienceRole);

  const snapshot = useMemo(() => buildPortalSnapshot(portalKey, data), [data, portalKey]);
  const previewMessage =
    currentUser && currentUser.role !== portal.experienceRole
      ? `Prévia de usabilidade em modo ${portal.badge}. A sessão atual está autenticada como ${currentUser.role}, mas a experiência visual foi montada para ${portal.experienceRole}.`
      : null;

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando portal {portal.badge.toLowerCase()}...</p>
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
        title={portal.subtitle}
        description="Esta nova superfície foi desenhada para testes de usabilidade, com linguagem mais moderna, navegação contextual, painéis executivos e atalhos para os aplicativos operacionais já existentes da ExpandAI."
        previewMessage={previewMessage}
        actionSlot={
          <>
            <button
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              onClick={() => setActiveModal("prioridades")}
              type="button"
            >
              Ver prioridades
            </button>
            <button
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              onClick={() => setActiveModal("apps")}
              type="button"
            >
              Abrir aplicativos
            </button>
            <Link
              href={portal.reportsRoute}
              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Ver relatórios
            </Link>
          </>
        }
      >
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {snapshot.metrics.map((metric) => (
            <PortalMetricCard
              key={metric.label}
              label={metric.label}
              value={isLoading ? "Atualizando..." : metric.value}
              description={metric.description}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            eyebrow="Destaques operacionais"
            title="Itens prioritários para acompanhamento"
            description="A interface prioriza leitura rápida, densidade controlada e ações contextualizadas para facilitar testes de usabilidade antes da homologação formal."
          >
            <SpotlightList items={snapshot.spotlights} />
          </SectionCard>

          <SectionCard
            eyebrow="Resumo executivo"
            title="Indicadores rápidos do portal"
            description="Esses cartões funcionam como leitura curta para o usuário entender imediatamente o estado da sua operação e do relacionamento com a plataforma."
          >
            <QuickFactGrid items={snapshot.quickFacts} />
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Distribuição do funil"
            title="Etapas mais presentes na jornada comercial"
            description="Leitura visual simplificada das etapas carregadas nesta experiência, adequada para testes iniciais de navegação e entendimento do estado comercial."
          >
            <TrendBars
              title="Oportunidades por estágio"
              description="Quanto maior a barra, maior a recorrência do estágio dentro da visão atual."
              items={snapshot.stageDistribution}
            />
          </SectionCard>

          <SectionCard
            eyebrow="Conversão comercial"
            title="Status das vendas na visão do portal"
            description="Leitura resumida dos principais status de venda para apoiar decisões rápidas e percepção de progresso operacional."
          >
            <TrendBars
              title="Vendas por status"
              description="Comparativo compacto dos estados comerciais mais frequentes nesta visão."
              items={snapshot.salesDistribution}
            />
          </SectionCard>
        </section>

        <SectionCard
          eyebrow="Relatórios resumidos"
          title="Leituras prontas para exploração"
          description="Além do dashboard, cada portal conta com uma superfície de relatórios dedicada. A tabela abaixo antecipa os indicadores que serão explorados com mais profundidade na área analítica."
        >
          <ReportTable rows={snapshot.reportRows} />
        </SectionCard>
      </PortalShell>

      <PortalModal
        open={activeModal === "prioridades"}
        title={`Prioridades do ${portal.title}`}
        description="Esta modal resume o que o usuário deve enxergar primeiro ao testar a usabilidade desta experiência."
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          {snapshot.reportRows.map((row) => (
            <div key={row.label} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{row.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{row.primary}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{row.secondary}</p>
            </div>
          ))}
        </div>
      </PortalModal>

      <PortalModal
        open={activeModal === "apps"}
        title={`Aplicativos do ${portal.title}`}
        description="Os aplicativos operacionais já existentes foram preservados e organizados como extensões naturais do portal para navegação funcional e testes de fluxo."
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {portal.legacyModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 transition hover:border-white/20 hover:bg-white/[0.04]"
            >
              <p className="text-lg font-semibold text-white">{module.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{module.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200">Abrir módulo</p>
            </Link>
          ))}
        </div>
      </PortalModal>
    </>
  );
}
