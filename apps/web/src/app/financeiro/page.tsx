"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/transaction-form-ui";
import { useAuth } from "@/components/auth-provider";
import {
  createBillingRecord,
  createCommercialRule,
  payBillingRecord,
} from "@/lib/api";
import { formatCompactDate, formatCurrency } from "@/lib/formatters";
import { useFinanceWorkbench } from "@/lib/use-finance-workbench";
import { usePersistedDraft } from "@/lib/use-persisted-draft";

const initialRuleDraft = {
  operatorId: "",
  productCatalogId: "",
  operatorPercentage: "40",
  partnerPercentage: "40",
  platformPercentage: "20",
  notes: "",
};

const initialBillingDraft = {
  saleId: "",
  operatorId: "",
  partnerId: "",
  clientId: "",
  productCatalogId: "",
  commercialRuleId: "",
  description: "",
  grossAmount: "",
  netAmount: "",
  externalReference: "",
  dueDate: "",
};

function toOptionalString(value: string) {
  return value.trim() ? value.trim() : undefined;
}

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
}

function toRequiredNumber(value: string) {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? NaN : numericValue;
}

export default function FinancePage() {
  const { isBooting, session, currentUser } = useAuth();
  const {
    data,
    isLoading,
    error,
    reload,
    visibleModules,
    operatorOptions,
    partnerOptions,
    clientOptions,
    getCatalogOptionsByOperator,
    getCommercialRuleOptions,
    getSaleOptionsForBilling,
    getDefaultsFromSale,
    summarizeBillingRecord,
  } = useFinanceWorkbench(session?.accessToken, currentUser?.role);
  const {
    draft: ruleDraft,
    isReady: isRuleReady,
    setDraftField: setRuleField,
    resetDraft: resetRuleDraft,
  } = usePersistedDraft("financeiro:commercial-rule-form", initialRuleDraft);
  const {
    draft: billingDraft,
    isReady: isBillingReady,
    setDraftField: setBillingField,
    replaceDraft: replaceBillingDraft,
    resetDraft: resetBillingDraft,
  } = usePersistedDraft("financeiro:billing-record-form", initialBillingDraft);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);
  const [isSubmittingBilling, setIsSubmittingBilling] = useState(false);
  const [pendingBillingId, setPendingBillingId] = useState<string | null>(null);

  const canAccess = visibleModules.some((module) => module.key === "finance");
  const saleOptions = useMemo(() => getSaleOptionsForBilling(), [getSaleOptionsForBilling]);
  const ruleFormCatalogOptions = useMemo(
    () => getCatalogOptionsByOperator(ruleDraft.operatorId),
    [getCatalogOptionsByOperator, ruleDraft.operatorId],
  );
  const billingCatalogOptions = useMemo(
    () => getCatalogOptionsByOperator(billingDraft.operatorId),
    [billingDraft.operatorId, getCatalogOptionsByOperator],
  );
  const billingCommercialRuleOptions = useMemo(
    () => getCommercialRuleOptions(billingDraft.operatorId, billingDraft.productCatalogId),
    [billingDraft.operatorId, billingDraft.productCatalogId, getCommercialRuleOptions],
  );

  async function handleCreateCommercialRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken) {
      return;
    }

    const operatorPercentage = toRequiredNumber(ruleDraft.operatorPercentage);
    const partnerPercentage = toRequiredNumber(ruleDraft.partnerPercentage);
    const platformPercentage = toRequiredNumber(ruleDraft.platformPercentage);

    if (!ruleDraft.operatorId || !ruleDraft.productCatalogId) {
      setActionError("Selecione operadora e produto antes de salvar a regra comercial.");
      return;
    }

    if (
      Number.isNaN(operatorPercentage) ||
      Number.isNaN(partnerPercentage) ||
      Number.isNaN(platformPercentage)
    ) {
      setActionError("Informe percentuais numéricos válidos para a regra comercial.");
      return;
    }

    if (operatorPercentage + partnerPercentage + platformPercentage !== 100) {
      setActionError("A soma dos percentuais da regra comercial deve totalizar 100.");
      return;
    }

    setIsSubmittingRule(true);
    setFeedback(null);
    setActionError(null);

    try {
      await createCommercialRule(session.accessToken, {
        operatorId: ruleDraft.operatorId,
        productCatalogId: ruleDraft.productCatalogId,
        operatorPercentage,
        partnerPercentage,
        platformPercentage,
        notes: toOptionalString(ruleDraft.notes),
      });
      setFeedback("Regra comercial registrada com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível registrar a regra comercial.",
      );
    } finally {
      setIsSubmittingRule(false);
    }
  }

  function handleSaleSelection(saleId: string) {
    const defaults = getDefaultsFromSale(saleId);

    if (!defaults) {
      setBillingField("saleId", saleId);
      return;
    }

    replaceBillingDraft({
      ...billingDraft,
      saleId,
      operatorId: defaults.operatorId,
      partnerId: defaults.partnerId,
      clientId: defaults.clientId,
      productCatalogId: defaults.productCatalogId,
      commercialRuleId: defaults.commercialRuleId,
      description: defaults.description,
      grossAmount: defaults.grossAmount,
      netAmount: defaults.netAmount,
      externalReference: defaults.externalReference,
    });
  }

  async function handleCreateBillingRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.accessToken) {
      return;
    }

    if (!billingDraft.operatorId || !billingDraft.description.trim() || !billingDraft.grossAmount.trim()) {
      setActionError(
        "Preencha operadora, descrição e valor bruto antes de registrar o faturamento.",
      );
      return;
    }

    const grossAmount = toRequiredNumber(billingDraft.grossAmount);

    if (Number.isNaN(grossAmount)) {
      setActionError("Informe um valor bruto numérico válido para o billing record.");
      return;
    }

    setIsSubmittingBilling(true);
    setFeedback(null);
    setActionError(null);

    try {
      await createBillingRecord(session.accessToken, {
        operatorId: billingDraft.operatorId,
        partnerId: toOptionalString(billingDraft.partnerId),
        clientId: toOptionalString(billingDraft.clientId),
        productCatalogId: toOptionalString(billingDraft.productCatalogId),
        commercialRuleId: toOptionalString(billingDraft.commercialRuleId),
        description: billingDraft.description.trim(),
        grossAmount,
        netAmount: toOptionalNumber(billingDraft.netAmount),
        externalReference: toOptionalString(billingDraft.externalReference),
        dueDate: billingDraft.dueDate
          ? new Date(billingDraft.dueDate).toISOString()
          : undefined,
      });
      setFeedback("Billing record criado com sucesso.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível registrar o billing record.",
      );
    } finally {
      setIsSubmittingBilling(false);
    }
  }

  async function handlePayBillingRecord(billingRecordId: string) {
    if (!session?.accessToken) {
      return;
    }

    setPendingBillingId(billingRecordId);
    setFeedback(null);
    setActionError(null);

    try {
      await payBillingRecord(session.accessToken, billingRecordId);
      setFeedback("Billing record liquidado com sucesso e split atualizado.");
      await reload();
    } catch (mutationError) {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível liquidar o billing record.",
      );
    } finally {
      setPendingBillingId(null);
    }
  }

  if (isBooting || !isRuleReady || !isBillingReady) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-300">Carregando financeiro...</p>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return <LoginScreen />;
  }

  return (
    <AppShell
      eyebrow="Financeiro e split"
      title="Billing records e regras comerciais"
      description="Esta rota agora vai além da leitura inicial e passa a oferecer registro de regras comerciais, criação assistida de billing records e liquidação operacional autenticada."
    >
      {error ? <InlineMessage tone="error">{error}</InlineMessage> : null}
      {actionError ? <InlineMessage tone="error">{actionError}</InlineMessage> : null}
      {feedback ? <InlineMessage tone="success">{feedback}</InlineMessage> : null}

      {canAccess ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Billing records confirmados"
              value={String(
                data.billingRecords.filter((record) => record.status === "PAYMENT_CONFIRMED").length,
              )}
              description="Quantidade de registros com confirmação de pagamento visíveis ao perfil autenticado."
            />
            <MetricCard
              label="Split liberado"
              value={formatCurrency(
                data.billingRecords.reduce((accumulator, record) => {
                  const releasedAmount = (record.splitAllocations ?? []).reduce((sum, allocation) => {
                    return allocation.status === "RELEASED"
                      ? sum + Number(allocation.amount)
                      : sum;
                  }, 0);

                  return accumulator + releasedAmount;
                }, 0),
              )}
              description="Soma das alocações já liberadas nos billing records retornados pela API."
            />
            <MetricCard
              label="Regras comerciais"
              value={String(data.commercialRules.length)}
              description="Quantidade de regras de split e distribuição disponíveis nesta visão."
            />
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <FormCard
              eyebrow="Regra comercial"
              title="Cadastrar ou atualizar distribuição"
              description="A regra comercial é persistida diretamente na API e usa validação client-side complementar para garantir percentuais coerentes antes do envio."
            >
              <form onSubmit={(event) => void handleCreateCommercialRule(event)}>
                <FormGrid>
                  <SelectField
                    label="Operadora"
                    value={ruleDraft.operatorId}
                    options={operatorOptions}
                    onChange={(value) => {
                      setRuleField("operatorId", value);
                      setRuleField("productCatalogId", "");
                    }}
                  />
                  <SelectField
                    label="Produto de catálogo"
                    value={ruleDraft.productCatalogId}
                    options={ruleFormCatalogOptions}
                    onChange={(value) => setRuleField("productCatalogId", value)}
                  />
                  <TextField
                    label="Percentual operadora"
                    type="number"
                    value={ruleDraft.operatorPercentage}
                    onChange={(value) => setRuleField("operatorPercentage", value)}
                  />
                  <TextField
                    label="Percentual partner"
                    type="number"
                    value={ruleDraft.partnerPercentage}
                    onChange={(value) => setRuleField("partnerPercentage", value)}
                  />
                  <TextField
                    label="Percentual plataforma"
                    type="number"
                    value={ruleDraft.platformPercentage}
                    onChange={(value) => setRuleField("platformPercentage", value)}
                  />
                  <TextAreaField
                    label="Observações"
                    value={ruleDraft.notes}
                    placeholder="Notas adicionais sobre a aplicação da regra comercial."
                    onChange={(value) => setRuleField("notes", value)}
                  />
                </FormGrid>

                <FormActions
                  submitLabel="Salvar regra comercial"
                  resetLabel="Limpar rascunho"
                  isSubmitting={isSubmittingRule}
                  onReset={resetRuleDraft}
                />
              </form>
            </FormCard>

            <FormCard
              eyebrow="Billing record"
              title="Registrar faturamento operacional"
              description="O formulário pode ser iniciado a partir de uma venda existente para reaproveitar vínculos comerciais e reduzir retrabalho operacional."
            >
              <form onSubmit={(event) => void handleCreateBillingRecord(event)}>
                <FormGrid>
                  <SelectField
                    label="Venda de origem"
                    value={billingDraft.saleId}
                    options={saleOptions}
                    onChange={handleSaleSelection}
                  />
                  <SelectField
                    label="Operadora"
                    value={billingDraft.operatorId}
                    options={operatorOptions}
                    onChange={(value) => {
                      setBillingField("operatorId", value);
                      setBillingField("productCatalogId", "");
                      setBillingField("commercialRuleId", "");
                    }}
                  />
                  <SelectField
                    label="Partner"
                    value={billingDraft.partnerId}
                    options={partnerOptions}
                    onChange={(value) => setBillingField("partnerId", value)}
                  />
                  <SelectField
                    label="Cliente"
                    value={billingDraft.clientId}
                    options={clientOptions}
                    onChange={(value) => setBillingField("clientId", value)}
                  />
                  <SelectField
                    label="Produto de catálogo"
                    value={billingDraft.productCatalogId}
                    options={billingCatalogOptions}
                    onChange={(value) => {
                      setBillingField("productCatalogId", value);
                      setBillingField("commercialRuleId", "");
                    }}
                  />
                  <SelectField
                    label="Regra comercial"
                    value={billingDraft.commercialRuleId}
                    options={billingCommercialRuleOptions}
                    onChange={(value) => setBillingField("commercialRuleId", value)}
                  />
                  <TextField
                    label="Descrição"
                    value={billingDraft.description}
                    placeholder="Cobrança mensal da operação comercial"
                    required
                    onChange={(value) => setBillingField("description", value)}
                  />
                  <TextField
                    label="Valor bruto"
                    type="number"
                    value={billingDraft.grossAmount}
                    required
                    onChange={(value) => setBillingField("grossAmount", value)}
                  />
                  <TextField
                    label="Valor líquido"
                    type="number"
                    value={billingDraft.netAmount}
                    onChange={(value) => setBillingField("netAmount", value)}
                  />
                  <TextField
                    label="Referência externa"
                    value={billingDraft.externalReference}
                    placeholder="FAT-EXPAND-0001"
                    onChange={(value) => setBillingField("externalReference", value)}
                  />
                  <TextField
                    label="Vencimento"
                    type="datetime-local"
                    value={billingDraft.dueDate}
                    onChange={(value) => setBillingField("dueDate", value)}
                  />
                </FormGrid>

                <FormActions
                  submitLabel="Criar billing record"
                  resetLabel="Limpar rascunho"
                  isSubmitting={isSubmittingBilling}
                  onReset={resetBillingDraft}
                />
              </form>
            </FormCard>
          </div>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  eyebrow="Regras comerciais"
                  title="Distribuição entre operadora, partner e plataforma"
                  description="A visão abaixo já reflete o resultado do novo fluxo de cadastro assistido, permitindo governança inicial do split comercial."
                />
                <button
                  className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void reload()}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? "Sincronizando financeiro..." : "Sincronizar financeiro"}
                </button>
              </div>

              {data.commercialRules.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {data.commercialRules.map((rule) => (
                    <article
                      key={rule.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <h3 className="text-sm font-semibold text-white">
                        {rule.productCatalog?.name ?? "Regra sem produto associado"}
                      </h3>
                      <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                        <p>Operadora: {rule.operatorPercentage}%</p>
                        <p>Partner: {rule.partnerPercentage}%</p>
                        <p>Plataforma: {rule.platformPercentage}%</p>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        Operadora: {rule.operator?.tradeName ?? "—"}
                      </p>
                      {rule.notes ? (
                        <p className="mt-2 text-xs leading-5 text-slate-500">{rule.notes}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Sem regras comerciais"
                    description="A API não retornou regras comerciais para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <SectionHeader
                eyebrow="Billing records"
                title="Cobranças sincronizadas com a operação"
                description="Os registros abaixo passam a coexistir com criação assistida e liquidação operacional autenticada diretamente no frontend."
              />
              {data.billingRecords.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {data.billingRecords.map((record) => {
                    const summary = summarizeBillingRecord(record);
                    const isPending = pendingBillingId === record.id;

                    return (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {record.description ?? record.externalReference ?? record.id}
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                              Produto: {record.productCatalog?.name ?? "—"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <StatusBadge value={record.status} />
                            <StatusBadge value={record.splitStatus} />
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                          <p>Valor bruto: {formatCurrency(record.grossAmount)}</p>
                          <p>Valor líquido: {formatCurrency(record.netAmount)}</p>
                          <p>Partner: {record.partner?.companyName ?? "—"}</p>
                          <p>Pago em: {formatCompactDate(record.paidAt)}</p>
                          <p>Vencimento: {formatCompactDate(record.dueDate)}</p>
                          <p>Split liberado: {summary.releasedAllocations}/{summary.totalAllocations}</p>
                          <p>Regra comercial: {summary.hasCommercialRule ? "Aplicada" : "Não vinculada"}</p>
                          <p>Referência: {record.externalReference ?? "—"}</p>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            className="inline-flex rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            type="button"
                            onClick={() => void handlePayBillingRecord(record.id)}
                            disabled={isPending || record.status === "PAYMENT_CONFIRMED"}
                          >
                            {isPending ? "Liquidando..." : "Marcar como pago"}
                          </button>
                          <Link
                            href={`/financeiro/${record.id}`}
                            className="inline-flex rounded-2xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-100 transition hover:bg-violet-500/20"
                          >
                            Abrir detalhe
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Sem billing records"
                    description="A API não retornou registros financeiros para o perfil autenticado nesta sessão."
                  />
                </div>
              )}
            </article>
          </section>
        </>
      ) : (
        <EmptyState
          title="Acesso restrito ao financeiro"
          description="O papel autenticado nesta sessão não possui visibilidade para o módulo financeiro."
        />
      )}
    </AppShell>
  );
}
