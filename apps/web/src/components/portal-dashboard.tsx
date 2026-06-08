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

function buildPreviewMessage(portalBadge: string, sessionRole?: string, experienceRole?: string) {
  if (!sessionRole || !experienceRole || sessionRole === experienceRole) {
    return null;
  }

  return `Prévia de usabilidade em modo ${portalBadge}. A sessão atual está autenticada como ${sessionRole}, mas a experiência visual foi desenhada para ${experienceRole}.`;
}

export function PortalDashboard({ portalKey }: PortalDashboardProps) {
  const portal = portalConfigs[portalKey];
  const { isBooting, session, currentUser } = useAuth();
  const [activeModal, setActiveModal] = useState<"prioridades" | "apps" | null>(null);
  const { data, isLoading, error } = useExpandaiData(session?.accessToken, portal.experienceRole);

  const snapshot = useMemo(() => buildPortalSnapshot(portalKey, data), [data, portalKey]);
  const previewMessage = buildPreviewMessage(portal.badge, currentUser?.role, portal.experienceRole);

  if (isBooting) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#0D1E2D] text-[#CDD6DC]">
        <p className="text-sm text-[#8A9AA6]">
          Carregando portal {portal.badge.toLowerCase()}...
        </p>
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
        description="Esta superfície foi redesenhada para testes de usabilidade, com linguagem mais limpa, navegação contextual e acesso claro aos aplicativos operacionais já existentes da ExpandAI."
        previewMessage={previewMessage}
        actionSlot={[
          <button
            key="prioridades"
            className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white"
            onClick={() => setActiveModal("prioridades")}
            type="button"
          >
            Ver prioridades
          </button>,
          <button
            key="apps"
            className="inline-flex rounded-xl border border-white/10 bg-[#07131F]/60 px-4 py-3 text-sm font-medium text-[#CDD6DC] transition hover:border-white/20 hover:text-white"
            onClick={() => setActiveModal("apps")}
            type="button"
          >
            Abrir aplicativos
          </button>,
          <Link
            key="relatorios"
            href={portal.reportsRoute}
            className="inline-flex rounded-xl bg-[#FF842A] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#FF842A]/30 transition hover:bg-[#E06D1B]"
          >
            Ver relatórios
          </Link>,
        ]}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
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
            description="A leitura foi reorganizada para privilegiar foco, entendimento rápido do contexto e ação imediata sem excesso de blocos concorrentes na tela."
          >
            <SpotlightList items={snapshot.spotlights} />
          </SectionCard>

          <SectionCard
            eyebrow="Resumo executivo"
            title="Indicadores rápidos do portal"
            description="Esses cartões funcionam como leitura curta para que cada perfil entenda imediatamente o estado da sua operação e do relacionamento com a plataforma."
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
        description="Esta modal resume aquilo que o usuário deve perceber primeiro ao testar a usabilidade desta experiência."
        onClose={() => setActiveModal(null)}
        portalLabel={portal.title}
      >
        <div className="space-y-4">
          {snapshot.reportRows.map((row) => (
            <div key={row.label} className="rounded-2xl border border-white/8 bg-[#07131F]/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A9AA6]">{row.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{row.primary}</p>
              <p className="mt-2 text-sm leading-6 text-[#8A9AA6]">{row.secondary}</p>
            </div>
          ))}
        </div>
      </PortalModal>

      <PortalModal
        open={activeModal === "apps"}
        title={`Aplicativos do ${portal.title}`}
        description="Os aplicativos operacionais já existentes foram reorganizados como extensões naturais do portal para navegação funcional e testes de fluxo."
        onClose={() => setActiveModal(null)}
        portalLabel={portal.title}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {portal.legacyModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-2xl border border-white/8 bg-[#07131F]/50 p-5 transition hover:border-white/20"
            >
              <p className="text-lg font-semibold text-white">{module.label}</p>
              <p className="mt-3 text-sm leading-6 text-[#8A9AA6]">{module.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF842A]">Abrir módulo</p>
            </Link>
          ))}
        </div>
      </PortalModal>
    </>
  );
}
