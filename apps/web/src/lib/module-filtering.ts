import type { Opportunity, ProductCatalog, Sale } from "@/types/expandai";

function normalize(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesSearch(haystack: Array<string | null | undefined>, term: string) {
  const normalizedTerm = normalize(term);

  if (!normalizedTerm) {
    return true;
  }

  return haystack.some((value) => normalize(value).includes(normalizedTerm));
}

export const opportunityStageOptions = [
  { label: "Todos os estágios", value: "" },
  { label: "NEW", value: "NEW" },
  { label: "QUALIFIED", value: "QUALIFIED" },
  { label: "PROPOSAL", value: "PROPOSAL" },
  { label: "WON", value: "WON" },
  { label: "LOST", value: "LOST" },
];

export const saleStatusOptions = [
  { label: "Todos os status", value: "" },
  { label: "PENDING_BILLING", value: "PENDING_BILLING" },
  { label: "BILLED", value: "BILLED" },
  { label: "PAYMENT_CONFIRMED", value: "PAYMENT_CONFIRMED" },
  { label: "CANCELED", value: "CANCELED" },
];

export const catalogStatusOptions = [
  { label: "Todos os status", value: "" },
  { label: "PENDING", value: "PENDING" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

export function filterOpportunities(
  opportunities: Opportunity[],
  filters: { search: string; stage: string },
) {
  return opportunities.filter((opportunity) => {
    const matchesStage = !filters.stage || opportunity.stage === filters.stage;
    const matchesTerm = matchesSearch(
      [
        opportunity.title,
        opportunity.description,
        opportunity.operator?.tradeName,
        opportunity.partner?.companyName,
        opportunity.productCatalog?.name,
      ],
      filters.search,
    );

    return matchesStage && matchesTerm;
  });
}

export function filterSales(
  sales: Sale[],
  filters: { search: string; status: string },
) {
  return sales.filter((sale) => {
    const matchesStatus = !filters.status || sale.status === filters.status;
    const matchesTerm = matchesSearch(
      [
        sale.title,
        sale.description,
        sale.operator?.tradeName,
        sale.partner?.companyName,
        sale.productCatalog?.name,
        sale.opportunity?.title,
        sale.externalReference,
      ],
      filters.search,
    );

    return matchesStatus && matchesTerm;
  });
}

export function filterProductCatalogs(
  catalogs: ProductCatalog[],
  filters: { search: string; status: string },
) {
  return catalogs.filter((catalog) => {
    const matchesStatus = !filters.status || catalog.status === filters.status;
    const matchesTerm = matchesSearch(
      [catalog.name, catalog.category, catalog.operator?.tradeName],
      filters.search,
    );

    return matchesStatus && matchesTerm;
  });
}
