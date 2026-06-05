"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  fetchBillingRecords,
  fetchCommercialRules,
  fetchCurrentUser,
  fetchOpportunities,
  fetchOperators,
  fetchPartners,
  fetchProductCatalogs,
  fetchRoles,
  fetchSales,
  login,
} from "@/lib/api";
import { formatCompactDate, formatCurrency, truncateText } from "@/lib/formatters";
import { dashboardModules, getModulesForRole } from "@/lib/modules";
import { API_BASE_URL, persistSession, readSessionFromStorage } from "@/lib/session";
import {
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusBadge,
} from "@/components/dashboard-ui";
import type {
  AuthSession,
  AuthUser,
  BillingRecord,
  CommercialRule,
  Operator,
  Opportunity,
  Partner,
  ProductCatalog,
  Sale,
} from "@/types/expandai";

type DashboardData = {
  operators: Operator[];
  partners: Partner[];
  productCatalogs: ProductCatalog[];
  opportunities: Opportunity[];
  sales: Sale[];
  commercialRules: CommercialRule[];
  billingRecords: BillingRecord[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  operators: [],
  partners: [],
  productCatalogs: [],
  opportunities: [],
  sales: [],
  commercialRules: [],
  billingRecords: [],
};

function sumCurrencyStrings(values: Array<string | null | undefined>) {
  return values.reduce((accumulator, currentValue) => {
    const numericValue = Number(currentValue ?? 0);
    return accumulator + (Number.isNaN(numericValue) ? 0 : numericValue);
  }, 0);
}

export default function Home() {
  const [email, setEmail] = useState("admin@expandai.com");
  const [password, setPassword] = useState("Expand@123");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);
  const [rolesPayload, setRolesPayload] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = readSessionFromStorage();
    setSession(storedSession);
    setCurrentUser(storedSession?.user ?? null);
    setIsBooting(false);
  }, []);

  const visibleModules = useMemo(
    () => getModulesForRole(currentUser?.role),
    [currentUser?.role],
  );

  const allowedModuleKeys = useMemo(
    () => new Set(visibleModules.map((module) => module.key)),
    [visibleModules],
  );

  const metrics = useMemo(() => {
    const openOpportunities = dashboardData.opportunities.filter(
      (opportunity) => opportunity.stage !== "WON" && opportunity.stage !== "LOST",
    ).length;

    const billedSales = dashboardData.sales.filter(
      (sale) => sale.status === "BILLED",
    ).length;

    const grossSalesValue = sumCurrencyStrings(
      dashboardData.sales.map((sale) => sale.grossAmount),
    );

    const releasedSplitValue = sumCurrencyStrings(
      dashboardData.billingRecords
        .filter((record) => record.splitStatus === "RELEASED")
        .flatMap((record) => record.splitAllocations?.map((allocation) => allocation.amount) ?? []),
    );

    return {
      operators: dashboardData.operators.length,
      partners: dashboardData.partners.length,
      openOpportunities,
      billedSales,
      grossSalesValue,
      releasedSplitValue,
      activeCatalogs: dashboardData.productCatalogs.filter(
        (catalog) => catalog.status === "ACTIVE" || catalog.status === "PENDING",
      ).length,
      confirmedBillings: dashboardData.billingRecords.filter(
        (record) => record.status === "PAYMENT_CONFIRMED",
      ).length,
    };
  }, [dashboardData]);

  async function loadDashboardData(accessToken: string, role?: string | null) {
    const visibleKeys = new Set(getModulesForRole(role).map((module) => module.key));

    setIsLoadingDashboard(true);
    setError(null);

    try {
      const [operators, partners, productCatalogs, opportunities, sales, financePayload] =
        await Promise.all([
          visibleKeys.has("operators") ? fetchOperators(accessToken) : Promise.resolve([]),
          visibleKeys.has("partners") ? fetchPartners(accessToken) : Promise.resolve([]),
          visibleKeys.has("catalog") ? fetchProductCatalogs(accessToken) : Promise.resolve([]),
          visibleKeys.has("opportunities")
            ? fetchOpportunities(accessToken)
            : Promise.resolve([]),
          visibleKeys.has("sales") ? fetchSales(accessToken) : Promise.resolve([]),
          visibleKeys.has("finance")
            ? Promise.all([
                fetchCommercialRules(accessToken),
                fetchBillingRecords(accessToken),
              ])
            : Promise.resolve([[], []] as [CommercialRule[], BillingRecord[]]),
        ]);

      setDashboardData({
        operators,
        partners,
        productCatalogs,
        opportunities,
        sales,
        commercialRules: financePayload[0],
        billingRecords: financePayload[1],
      });
      setFeedback("Dashboard sincronizado com sucesso a partir da API publicada.");
    } catch (dashboardError) {
      setDashboardData(EMPTY_DASHBOARD_DATA);
      setError(
        dashboardError instanceof Error
          ? dashboardError.message
          : "Falha ao carregar os módulos operacionais da plataforma.",
      );
    } finally {
      setIsLoadingDashboard(false);
    }
  }

  useEffect(() => {
    if (!session?.accessToken || !currentUser?.role) {
      setDashboardData(EMPTY_DASHBOARD_DATA);
      return;
    }

    void loadDashboardData(session.accessToken, currentUser.role);
  }, [session?.accessToken, currentUser?.role]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);
    setRolesPayload(null);

    try {
      const authenticatedSession = await login(email, password);
      persistSession(authenticatedSession);
      setSession(authenticatedSession);
      setCurrentUser(authenticatedSession.user);
      setFeedback("Sessão autenticada com sucesso na API real da ExpandAI.");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Não foi possível autenticar-se na plataforma.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshProfile() {
    if (!session?.accessToken) {
      return;
    }

    setIsRefreshingProfile(true);
    setError(null);
    setFeedback(null);

    try {
      const user = await fetchCurrentUser(session.accessToken);
      const nextSession = {
        ...session,
        user,
      };
      persistSession(nextSession);
      setSession(nextSession);
      setCurrentUser(user);
      setFeedback("Perfil autenticado recarregado a partir do endpoint /users/me.");
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Falha ao atualizar o perfil autenticado.",
      );
    } finally {
      setIsRefreshingProfile(false);
    }
  }

  async function loadAdminRoles() {
    if (!session?.accessToken) {
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      const payload = await fetchRoles(session.accessToken);
      setRolesPayload(JSON.stringify(payload, null, 2));
      setFeedback("Payload administrativo de roles carregado com sucesso.");
    } catch (rolesError) {
      setRolesPayload(null);
      setError(
        rolesError instanceof Error
          ? rolesError.message
          : "Falha ao consultar a lista administrativa de perfis.",
      );
    }
  }

  function handleLogout() {
    persistSession(null);
    setSession(null);
    setCurrentUser(null);
    setDashboardData(EMPTY_DASHBOARD_DATA);
    setRolesPayload(null);
    setFeedback("Sessão local removida com sucesso.");
    setError(null);
  }

  if (isBooting) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando a camada web da ExpandAI...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              ExpandAI Platform
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                Dashboard web conectado à API real, com sessão persistida e visão operacional.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                Esta etapa transforma o shell inicial em um <strong>painel operacional</strong>
                que consulta os módulos reais de <strong>operadoras</strong>, <strong>partners</strong>,
                <strong> catálogo</strong>, <strong>oportunidades</strong>, <strong>vendas</strong> e
                <strong> financeiro</strong>, respeitando o perfil autenticado na sessão.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">API base</p>
                <p className="mt-2 break-all text-sm font-medium text-cyan-100">{API_BASE_URL}</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Módulos visíveis</p>
                <p className="mt-2 text-sm font-medium text-white">{visibleModules.length || 0}</p>
              </article>
              <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sessão web</p>
                <p className="mt-2 text-sm font-medium text-white">Local storage + Bearer Token</p>
              </article>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
            {!session ? (
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">Login de operação</h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Entre com uma credencial válida para carregar os módulos publicados da ExpandAI.
                  </p>
                </div>
                <div className="space-y-4">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-200">E-mail</span>
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@expandai.com"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-200">Senha</span>
                    <input
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite a senha de acesso"
                    />
                  </label>
                </div>
                <button
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Autenticando..." : "Entrar na plataforma"}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Sessão ativa</p>
                  <h2 className="text-xl font-semibold text-white">{currentUser?.name}</h2>
                  <p className="text-sm leading-6 text-slate-400">
                    Perfil autenticado: <strong>{currentUser?.role}</strong> · e-mail{" "}
                    <strong>{currentUser?.email}</strong>
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={refreshProfile}
                    disabled={isRefreshingProfile}
                    type="button"
                  >
                    {isRefreshingProfile ? "Atualizando perfil..." : "Recarregar /users/me"}
                  </button>
                  <button
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() =>
                      session?.accessToken && currentUser?.role
                        ? loadDashboardData(session.accessToken, currentUser.role)
                        : undefined
                    }
                    disabled={isLoadingDashboard}
                    type="button"
                  >
                    {isLoadingDashboard ? "Sincronizando dados..." : "Sincronizar dashboard"}
                  </button>
                  {currentUser?.role === "ADMIN" ? (
                    <button
                      className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
                      onClick={loadAdminRoles}
                      type="button"
                    >
                      Consultar /users/roles
                    </button>
                  ) : null}
                  <button
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-rose-400/40 hover:text-rose-100"
                    onClick={handleLogout}
                    type="button"
                  >
                    Encerrar sessão local
                  </button>
                </div>
              </div>
            )}

            {feedback ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {feedback}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 overflow-x-auto rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                <pre className="whitespace-pre-wrap break-words">{error}</pre>
              </div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Operadoras e partners"
            value={`${metrics.operators} / ${metrics.partners}`}
            description="Quantidade de entidades comerciais disponíveis ao perfil atual."
          />
          <MetricCard
            label="Pipeline comercial"
            value={`${metrics.openOpportunities} oportunidades abertas`}
            description="Oportunidades em andamento, excluindo etapas finais de ganho e perda."
          />
          <MetricCard
            label="Vendas faturadas"
            value={`${metrics.billedSales} vendas`}
            description={`Volume bruto consolidado: ${formatCurrency(metrics.grossSalesValue)}.`}
          />
          <MetricCard
            label="Split liberado"
            value={formatCurrency(metrics.releasedSplitValue)}
            description={`Billing records confirmados: ${metrics.confirmedBillings}.`}
          />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeader
            eyebrow="Descoberta por perfil"
            title="Módulos disponibilizados ao usuário autenticado"
            description="A navegação abaixo espelha a política atual de autorização do backend e indica quais áreas já podem ser consumidas pela camada web nesta etapa."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleModules.length > 0 ? (
              visibleModules.map((module) => (
                <article
                  key={module.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {module.description}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-cyan-100">
                      Endpoint preparado: {module.endpoint}
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Perfis habilitados: {module.profiles.join(" · ")}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nenhum módulo visível"
                description="Autentique-se com um perfil habilitado para carregar a navegação operacional da plataforma."
              />
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <SectionHeader
              eyebrow="Contexto autenticado"
              title="Sessão e payload administrativo"
              description="Este bloco ajuda na validação técnica da sessão persistida localmente e do contrato retornado pelos endpoints transversais de autenticação e autorização."
            />
            <pre className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(
                {
                  apiBaseUrl: API_BASE_URL,
                  currentUser,
                  visibleModules: visibleModules.map((module) => module.key),
                },
                null,
                2,
              )}
            </pre>
            {rolesPayload ? (
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-amber-400/20 bg-slate-950 p-4 text-xs leading-6 text-amber-100">
                {rolesPayload}
              </pre>
            ) : null}
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <SectionHeader
              eyebrow="Módulo comercial"
              title="Pipeline de oportunidades e vendas"
              description="A web agora já materializa o encadeamento entre oportunidade, venda e faturamento, consumindo diretamente os dados persistidos no backend publicado."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Oportunidades</h3>
                  <StatusBadge value={String(dashboardData.opportunities.length)} />
                </div>
                {allowedModuleKeys.has("opportunities") ? (
                  dashboardData.opportunities.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.opportunities.slice(0, 4).map((opportunity) => (
                        <article
                          key={opportunity.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                {opportunity.title}
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {truncateText(opportunity.description, 110)}
                              </p>
                            </div>
                            <StatusBadge value={opportunity.stage} />
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                            <p>Operadora: {opportunity.operator?.tradeName ?? "—"}</p>
                            <p>Partner: {opportunity.partner?.companyName ?? "—"}</p>
                            <p>Produto: {opportunity.productCatalog?.name ?? "—"}</p>
                            <p>Criada em: {formatCompactDate(opportunity.createdAt)}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Sem oportunidades carregadas"
                      description="Ainda não há oportunidades retornadas pela API para o perfil atual."
                    />
                  )
                ) : (
                  <EmptyState
                    title="Módulo indisponível para o perfil"
                    description="O backend não expõe o pipeline de oportunidades ao papel autenticado nesta sessão."
                  />
                )}
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Vendas</h3>
                  <StatusBadge value={String(dashboardData.sales.length)} />
                </div>
                {allowedModuleKeys.has("sales") ? (
                  dashboardData.sales.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.sales.slice(0, 4).map((sale) => (
                        <article
                          key={sale.id}
                          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{sale.title}</h4>
                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {truncateText(sale.description, 110)}
                              </p>
                            </div>
                            <StatusBadge value={sale.status} />
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                            <p>Valor bruto: {formatCurrency(sale.grossAmount)}</p>
                            <p>Venda líquida: {formatCurrency(sale.netAmount)}</p>
                            <p>Oportunidade: {sale.opportunity?.title ?? "—"}</p>
                            <p>Billing: {sale.billingRecord?.status ?? "—"}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="Sem vendas carregadas"
                      description="Ainda não há vendas retornadas pela API para o perfil atual."
                    />
                  )
                ) : (
                  <EmptyState
                    title="Módulo indisponível para o perfil"
                    description="O backend não expõe a área de vendas ao papel autenticado nesta sessão."
                  />
                )}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <SectionHeader
              eyebrow="Cadastros mestres"
              title="Operadoras, partners e produtos publicados"
              description="A camada web passa a materializar a base cadastral já persistida, oferecendo leitura rápida do ecossistema comercial ativo."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-lg font-semibold text-white">Operadoras</h3>
                <div className="mt-4 space-y-3">
                  {allowedModuleKeys.has("operators") ? (
                    dashboardData.operators.length > 0 ? (
                      dashboardData.operators.slice(0, 5).map((operator) => (
                        <article key={operator.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white">{operator.tradeName}</p>
                            <StatusBadge value={operator.status} />
                          </div>
                          <p className="mt-2 text-xs text-slate-400">{operator.legalName}</p>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="Sem operadoras"
                        description="Nenhum registro retornado pela API para o perfil atual."
                      />
                    )
                  ) : (
                    <EmptyState
                      title="Acesso restrito"
                      description="Este módulo não está habilitado ao papel autenticado."
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-lg font-semibold text-white">Partners</h3>
                <div className="mt-4 space-y-3">
                  {allowedModuleKeys.has("partners") ? (
                    dashboardData.partners.length > 0 ? (
                      dashboardData.partners.slice(0, 5).map((partner) => (
                        <article key={partner.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white">{partner.companyName}</p>
                            <StatusBadge value={partner.status} />
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            Nível: {partner.partnerLevel ?? "—"}
                          </p>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="Sem partners"
                        description="Nenhum parceiro foi retornado ao perfil autenticado."
                      />
                    )
                  ) : (
                    <EmptyState
                      title="Acesso restrito"
                      description="Este módulo não está habilitado ao papel autenticado."
                    />
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-lg font-semibold text-white">Catálogo</h3>
                <div className="mt-4 space-y-3">
                  {allowedModuleKeys.has("catalog") ? (
                    dashboardData.productCatalogs.length > 0 ? (
                      dashboardData.productCatalogs.slice(0, 5).map((catalog) => (
                        <article key={catalog.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-white">{catalog.name}</p>
                            <StatusBadge value={catalog.status} />
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            Categoria: {catalog.category} · Operadora: {catalog.operator?.tradeName ?? "—"}
                          </p>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="Sem produtos"
                        description="Nenhum produto foi retornado pela API para este perfil."
                      />
                    )
                  ) : (
                    <EmptyState
                      title="Acesso restrito"
                      description="Este módulo não está habilitado ao papel autenticado."
                    />
                  )}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <SectionHeader
              eyebrow="Financeiro"
              title="Billing records, split e regras comerciais"
              description="O dashboard passa a refletir a conexão já existente entre a camada comercial e o módulo financeiro persistido no backend."
            />
            {allowedModuleKeys.has("finance") ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <MetricCard
                    label="Regras comerciais"
                    value={String(dashboardData.commercialRules.length)}
                    description="Configurações de percentuais entre operadora, partner e plataforma."
                  />
                  <MetricCard
                    label="Billing records"
                    value={String(dashboardData.billingRecords.length)}
                    description="Registros financeiros já emitidos e sincronizados com o ciclo comercial."
                  />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <h3 className="text-lg font-semibold text-white">Últimos registros financeiros</h3>
                  <div className="mt-4 space-y-3">
                    {dashboardData.billingRecords.length > 0 ? (
                      dashboardData.billingRecords.slice(0, 4).map((record) => (
                        <article key={record.id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                {record.description ?? record.externalReference ?? record.id}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">
                                Produto: {record.productCatalog?.name ?? "—"}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <StatusBadge value={record.status} />
                              <StatusBadge value={record.splitStatus} />
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                            <p>Valor bruto: {formatCurrency(record.grossAmount)}</p>
                            <p>Valor líquido: {formatCurrency(record.netAmount)}</p>
                            <p>Partner: {record.partner?.companyName ?? "—"}</p>
                            <p>Pago em: {formatCompactDate(record.paidAt)}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="Sem billing records"
                        description="Ainda não há registros financeiros retornados ao perfil autenticado."
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Financeiro indisponível para o perfil"
                  description="A API protege o módulo financeiro e o acesso não está habilitado ao papel autenticado nesta sessão."
                />
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <SectionHeader
            eyebrow="Mapa de entrega"
            title="Módulos previstos para as próximas iterações"
            description="Esta tabela separa o que já está operacional na web desta etapa e o que ainda deve evoluir para telas completas de CRUD, filtros avançados e fluxos transacionais."
          />
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Módulo</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Status web nesta etapa</th>
                  <th className="px-4 py-3">Próxima evolução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dashboardModules.map((module) => (
                  <tr key={module.key} className="align-top">
                    <td className="px-4 py-4 font-medium text-white">{module.title}</td>
                    <td className="px-4 py-4 text-cyan-100">{module.endpoint}</td>
                    <td className="px-4 py-4 text-slate-300">
                      {visibleModules.some((visibleModule) => visibleModule.key === module.key)
                        ? "Leitura inicial conectada à API real"
                        : "Protegido por perfil ou fora do escopo do usuário atual"}
                    </td>
                    <td className="px-4 py-4 text-slate-400">
                      Evoluir para rotas dedicadas, filtros, ações transacionais e formulários autenticados.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
