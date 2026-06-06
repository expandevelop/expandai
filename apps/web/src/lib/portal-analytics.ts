import type { BillingRecord, Client, CommercialRule, Opportunity, ProductCatalog, Sale } from "@/types/expandai";
import type { DashboardData } from "@/lib/use-expandai-data";
import type { PortalKey } from "@/lib/portal-config";
import { formatCurrency } from "@/lib/formatters";

type Metric = {
  label: string;
  value: string;
  description: string;
};

type BarDatum = {
  label: string;
  value: number;
  formattedValue: string;
};

type SpotlightItem = {
  title: string;
  eyebrow: string;
  description: string;
  status: string;
};

type ReportRow = {
  label: string;
  primary: string;
  secondary: string;
};

export type PortalSnapshot = {
  metrics: Metric[];
  spotlights: SpotlightItem[];
  stageDistribution: BarDatum[];
  salesDistribution: BarDatum[];
  reportRows: ReportRow[];
  quickFacts: Array<{ label: string; value: string }>;
};

function groupCounts(values: string[]) {
  return values.reduce<Record<string, number>>((accumulator, currentValue) => {
    const key = currentValue || "N/A";
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function toBarData(grouped: Record<string, number>) {
  return Object.entries(grouped)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, value]) => ({
      label,
      value,
      formattedValue: String(value),
    }));
}

function toCurrency(value: number) {
  return formatCurrency(value.toFixed(2));
}

function sumNumeric(values: Array<string | null | undefined>) {
  return values.reduce((accumulator, currentValue) => {
    const numericValue = Number(currentValue ?? 0);
    return accumulator + (Number.isNaN(numericValue) ? 0 : numericValue);
  }, 0);
}

function buildOpportunitySpotlights(opportunities: Opportunity[]): SpotlightItem[] {
  return opportunities.slice(0, 4).map((opportunity) => ({
    title: opportunity.title,
    eyebrow: opportunity.partner?.companyName ?? opportunity.client?.companyName ?? "Pipeline ativo",
    description:
      opportunity.description?.slice(0, 120) ?? "Oportunidade em acompanhamento comercial na ExpandAI.",
    status: opportunity.stage,
  }));
}

function buildSaleSpotlights(sales: Sale[]): SpotlightItem[] {
  return sales.slice(0, 4).map((sale) => ({
    title: sale.title,
    eyebrow: sale.client?.companyName ?? sale.partner?.companyName ?? "Venda em evolução",
    description: `Valor bruto ${formatCurrency(sale.grossAmount)} e status ${sale.status}.`,
    status: sale.status,
  }));
}

function buildClientSpotlights(clients: Client[]): SpotlightItem[] {
  return clients.slice(0, 4).map((client) => ({
    title: client.companyName,
    eyebrow: client.email ?? "Relacionamento ativo",
    description: `Status ${client.status} e contato ${client.phone ?? "não informado"}.`,
    status: client.status,
  }));
}

function buildCatalogSpotlights(catalogs: ProductCatalog[]): SpotlightItem[] {
  return catalogs.slice(0, 4).map((catalog) => ({
    title: catalog.name,
    eyebrow: catalog.operator?.tradeName ?? "Catálogo ExpandAI",
    description: catalog.description?.slice(0, 120) ?? "Produto disponível para evolução comercial.",
    status: catalog.status,
  }));
}

function buildFinanceSpotlights(records: BillingRecord[], rules: CommercialRule[]): SpotlightItem[] {
  if (records.length > 0) {
    return records.slice(0, 4).map((record) => ({
      title: record.description ?? `Billing ${record.id.slice(0, 8)}`,
      eyebrow: record.client?.companyName ?? record.partner?.companyName ?? "Financeiro",
      description: `Bruto ${formatCurrency(record.grossAmount)} · split ${record.splitStatus}.`,
      status: record.status,
    }));
  }

  return rules.slice(0, 4).map((rule) => ({
    title: rule.productCatalog?.name ?? `Regra ${rule.id.slice(0, 8)}`,
    eyebrow: rule.operator?.tradeName ?? "Regra comercial",
    description: `Operadora ${rule.operatorPercentage}% · partner ${rule.partnerPercentage}% · plataforma ${rule.platformPercentage}%.`,
    status: "RULE",
  }));
}

export function buildPortalSnapshot(portalKey: PortalKey, data: DashboardData): PortalSnapshot {
  const grossSales = sumNumeric(data.sales.map((sale) => sale.grossAmount));
  const releasedSplit = sumNumeric(
    data.billingRecords
      .filter((record) => record.splitStatus === "RELEASED")
      .flatMap((record) => record.splitAllocations?.map((allocation) => allocation.amount) ?? []),
  );
  const openOpportunities = data.opportunities.filter(
    (opportunity) => opportunity.stage !== "WON" && opportunity.stage !== "LOST",
  );
  const activeCatalogs = data.productCatalogs.filter(
    (catalog) => catalog.status === "ACTIVE" || catalog.status === "PENDING",
  );
  const confirmedBillings = data.billingRecords.filter(
    (record) => record.status === "PAYMENT_CONFIRMED",
  );
  const stageDistribution = toBarData(groupCounts(data.opportunities.map((item) => item.stage)));
  const salesDistribution = toBarData(groupCounts(data.sales.map((item) => item.status)));

  if (portalKey === "partner") {
    return {
      metrics: [
        {
          label: "Pipeline ativo",
          value: String(openOpportunities.length),
          description: "Oportunidades ainda em negociação na visão do portal partner.",
        },
        {
          label: "Vendas acompanhadas",
          value: String(data.sales.length),
          description: "Fechamentos comerciais retornados pela camada autenticada.",
        },
        {
          label: "Receita potencial",
          value: toCurrency(grossSales),
          description: "Volume bruto consolidado das vendas disponíveis nesta visão.",
        },
        {
          label: "Carteira ativa",
          value: String(data.clients.length),
          description: "Clientes acessíveis ao contexto comercial do partner.",
        },
      ],
      spotlights:
        buildOpportunitySpotlights(openOpportunities).length > 0
          ? buildOpportunitySpotlights(openOpportunities)
          : buildSaleSpotlights(data.sales),
      stageDistribution,
      salesDistribution,
      reportRows: [
        {
          label: "Conversões em venda",
          primary: String(data.sales.length),
          secondary: `${data.opportunities.length} oportunidades monitoradas`,
        },
        {
          label: "Catálogo disponível",
          primary: String(activeCatalogs.length),
          secondary: `${data.productCatalogs.length} itens de portfólio carregados`,
        },
        {
          label: "Receita bruta consolidada",
          primary: toCurrency(grossSales),
          secondary: `${data.sales.filter((sale) => sale.status === "BILLED").length} vendas faturadas`,
        },
      ],
      quickFacts: [
        { label: "Partners conectados", value: String(data.partners.length) },
        { label: "Clientes com status ativo", value: String(data.clients.filter((item) => item.status === "ACTIVE").length) },
        { label: "Oportunidades ganhas", value: String(data.opportunities.filter((item) => item.stage === "WON").length) },
      ],
    };
  }

  if (portalKey === "cliente") {
    return {
      metrics: [
        {
          label: "Minha jornada",
          value: String(openOpportunities.length),
          description: "Oportunidades abertas ou em negociação vinculadas ao relacionamento atual.",
        },
        {
          label: "Contratações",
          value: String(data.sales.length),
          description: "Vendas registradas e disponibilizadas para acompanhamento.",
        },
        {
          label: "Catálogo relacionado",
          value: String(activeCatalogs.length),
          description: "Produtos ativos ou pendentes já disponíveis para consulta.",
        },
        {
          label: "Atendimentos financeiros",
          value: String(data.billingRecords.length),
          description: "Eventos financeiros carregados para a visão do cliente.",
        },
      ],
      spotlights:
        buildClientSpotlights(data.clients).length > 0
          ? buildClientSpotlights(data.clients)
          : buildOpportunitySpotlights(openOpportunities),
      stageDistribution,
      salesDistribution,
      reportRows: [
        {
          label: "Próximos passos comerciais",
          primary: String(openOpportunities.length),
          secondary: `${data.opportunities.filter((item) => item.stage === "QUALIFIED").length} oportunidades qualificadas`,
        },
        {
          label: "Contratações faturadas",
          primary: String(data.sales.filter((sale) => sale.status === "BILLED").length),
          secondary: `${data.sales.length} registros comerciais visíveis`,
        },
        {
          label: "Movimento financeiro",
          primary: toCurrency(sumNumeric(data.billingRecords.map((record) => record.grossAmount))),
          secondary: `${confirmedBillings.length} billing records com pagamento confirmado`,
        },
      ],
      quickFacts: [
        { label: "Clientes carregados", value: String(data.clients.length) },
        { label: "Vendas concluídas", value: String(data.sales.filter((item) => item.status === "BILLED").length) },
        { label: "Catálogos ativos", value: String(activeCatalogs.length) },
      ],
    };
  }

  return {
    metrics: [
      {
        label: "Ecossistema ativo",
        value: `${data.operators.length} / ${data.partners.length}`,
        description: "Operadoras e partners visíveis na camada administrativa.",
      },
      {
        label: "Clientes monitorados",
        value: String(data.clients.length),
        description: "Base de relacionamento disponível para gestão administrativa.",
      },
      {
        label: "Receita bruta",
        value: toCurrency(grossSales),
        description: "Volume bruto agregado da operação comercial carregada.",
      },
      {
        label: "Split liberado",
        value: toCurrency(releasedSplit),
        description: `${confirmedBillings.length} billing records com pagamento confirmado.`,
      },
    ],
    spotlights:
      buildFinanceSpotlights(data.billingRecords, data.commercialRules).length > 0
        ? buildFinanceSpotlights(data.billingRecords, data.commercialRules)
        : buildCatalogSpotlights(data.productCatalogs),
    stageDistribution,
    salesDistribution,
    reportRows: [
      {
        label: "Pipeline aberto",
        primary: String(openOpportunities.length),
        secondary: `${data.opportunities.length} oportunidades carregadas`,
      },
      {
        label: "Vendas faturadas",
        primary: String(data.sales.filter((sale) => sale.status === "BILLED").length),
        secondary: `${data.sales.length} vendas monitoradas`,
      },
      {
        label: "Regras comerciais",
        primary: String(data.commercialRules.length),
        secondary: `${activeCatalogs.length} catálogos ativos ou pendentes`,
      },
    ],
    quickFacts: [
      { label: "Operadoras", value: String(data.operators.length) },
      { label: "Partners", value: String(data.partners.length) },
      { label: "Clientes", value: String(data.clients.length) },
      { label: "Billing records", value: String(data.billingRecords.length) },
    ],
  };
}
