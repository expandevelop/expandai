"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LoginScreen } from "@/components/login-screen";
import {
  PortalModal,
  PortalShell,
  QuickFactGrid,
  ReportTable,
  SectionCard,
  TrendBars,
} from "@/components/portal-ui";
import { useAuth } from "@/components/auth-provider";
import { buildPortalSnapshot } from "@/lib/portal-analytics";
import { portalConfigs, type PortalKey } from "@/lib/portal-config";
import { useExpandaiData } from "@/lib/use-expandai-data";

type PortalReportsProps = {
  portalKey: PortalKey;
};

export function PortalReports({ portalKey }: PortalReportsProps) {
  const portal = portalConfigs[portalKey];
  const { isBooting, session, currentUser } = useAuth();
  const { data, isLoading, error } = useExpandaiData(session?.accessToken, portal.experienceRole);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const snapshot = useMemo(() => buildPortalSnapshot(portalKey, data), [data, portalKey]);
  const previewMessage =
    currentUser && currentUser.role !== portal.experienceRole
      ? `Relatório em modo prévia para ${portal.experienceRole}. A sessão atual está autenticada como ${currentUser.role}.`
      : null;

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando relatórios do portal...</p>
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
        description="Esta área organiza leituras analíticas curtas, comparativos e resumos operacionais para que a experiência já esteja pronta para testes de usabilidade e percepção de valor antes da homologação final."
        previewMessage={previewMessage}
        actionSlot={
          <>
            <button
              className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              onClick={() => setIsMethodologyOpen(true)}
              type="button"
            >
              Como ler este relatório
            </button>
            <Link
              href={portal.route}
              className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Voltar ao dashboard
            </Link>
          </>
        }
      >
        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            eyebrow="Resumo consolidado"
            title="Indicadores centrais do portal"
            description="A tabela abaixo prioriza a leitura objetiva dos números mais importantes para o perfil, reduzindo atrito cognitivo durante testes iniciais de entendimento e valor percebido."
          >
            <ReportTable rows={snapshot.reportRows} />
          </SectionCard>

          <SectionCard
            eyebrow="Painel resumido"
            title="Facts rápidos para apoio de decisão"
            description="Esta faixa resume indicadores auxiliares que ajudam a ancorar a leitura analítica sem exigir navegação profunda em múltiplas páginas."
          >
            <QuickFactGrid items={snapshot.quickFacts} />
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            eyebrow="Funil e jornada"
            title="Distribuição das oportunidades"
            description="Leitura compacta das etapas mais recorrentes do funil disponível ao portal."
          >
            <TrendBars
              title={isLoading ? "Atualizando distribuição..." : "Oportunidades por estágio"}
              description="A comparação visual facilita perceber concentração de etapas e necessidade de ação comercial."
              items={snapshot.stageDistribution}
            />
          </SectionCard>

          <SectionCard
            eyebrow="Faturamento e conversão"
            title="Distribuição dos status de venda"
            description="Leitura sintética do comportamento dos registros comerciais retornados pela API para este portal."
          >
            <TrendBars
              title={isLoading ? "Atualizando vendas..." : "Vendas por status"}
              description="A distribuição serve como base para relatórios operacionais e validação de usabilidade da leitura analítica."
              items={snapshot.salesDistribution}
            />
          </SectionCard>
        </section>
      </PortalShell>

      <PortalModal
        open={isMethodologyOpen}
        title="Como interpretar esta área de relatórios"
        description="Os relatórios desta etapa foram desenhados para oferecer leitura executiva curta, boa hierarquia visual e navegação simples, usando os dados reais já disponíveis na ExpandAI."
        onClose={() => setIsMethodologyOpen(false)}
      >
        <div className="space-y-4 text-sm leading-7 text-slate-300">
          <p>
            A primeira faixa organiza indicadores principais para leitura imediata. Em seguida, a tela apresenta fatos rápidos e distribuições visuais que ajudam a identificar concentração de estados, volume operacional e possíveis gargalos.
          </p>
          <p>
            Essa estrutura foi pensada para testes de usabilidade: primeiro entendimento rápido, depois aprofundamento progressivo, sem exigir que o usuário percorra muitos módulos antes de perceber valor.
          </p>
        </div>
      </PortalModal>
    </>
  );
}
