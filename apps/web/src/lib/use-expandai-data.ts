"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchBillingRecords,
  fetchClients,
  fetchCommercialRules,
  fetchOpportunities,
  fetchOperators,
  fetchPartners,
  fetchProductCatalogs,
  fetchSales,
} from "@/lib/api";
import { getModulesForRole } from "@/lib/modules";
import type {
  BillingRecord,
  Client,
  CommercialRule,
  Operator,
  Opportunity,
  Partner,
  ProductCatalog,
  Sale,
} from "@/types/expandai";

export type DashboardData = {
  operators: Operator[];
  partners: Partner[];
  clients: Client[];
  productCatalogs: ProductCatalog[];
  opportunities: Opportunity[];
  sales: Sale[];
  commercialRules: CommercialRule[];
  billingRecords: BillingRecord[];
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  operators: [],
  partners: [],
  clients: [],
  productCatalogs: [],
  opportunities: [],
  sales: [],
  commercialRules: [],
  billingRecords: [],
};

export function sumCurrencyStrings(values: Array<string | null | undefined>) {
  return values.reduce((accumulator, currentValue) => {
    const numericValue = Number(currentValue ?? 0);
    return accumulator + (Number.isNaN(numericValue) ? 0 : numericValue);
  }, 0);
}

export function useExpandaiData(accessToken?: string | null, role?: string | null) {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleModules = useMemo(() => getModulesForRole(role), [role]);

  const reload = useCallback(async () => {
    if (!accessToken) {
      setData(EMPTY_DASHBOARD_DATA);
      return;
    }

    const visibleKeys = new Set(visibleModules.map((module) => module.key));
    const needsCommercialContext =
      visibleKeys.has("opportunities") ||
      visibleKeys.has("sales") ||
      visibleKeys.has("finance") ||
      visibleKeys.has("catalog") ||
      visibleKeys.has("clients");

    setIsLoading(true);
    setError(null);

    try {
      const [operators, partners, clients, productCatalogs, opportunities, sales, financePayload] =
        await Promise.all([
          needsCommercialContext || visibleKeys.has("operators")
            ? fetchOperators(accessToken)
            : Promise.resolve([]),
          needsCommercialContext || visibleKeys.has("partners")
            ? fetchPartners(accessToken)
            : Promise.resolve([]),
          needsCommercialContext || visibleKeys.has("clients")
            ? fetchClients(accessToken)
            : Promise.resolve([]),
          needsCommercialContext || visibleKeys.has("catalog")
            ? fetchProductCatalogs(accessToken)
            : Promise.resolve([]),
          visibleKeys.has("opportunities")
            ? fetchOpportunities(accessToken)
            : Promise.resolve([]),
          visibleKeys.has("sales") ? fetchSales(accessToken) : Promise.resolve([]),
          needsCommercialContext
            ? Promise.all([
                fetchCommercialRules(accessToken),
                visibleKeys.has("finance")
                  ? fetchBillingRecords(accessToken)
                  : Promise.resolve([] as BillingRecord[]),
              ])
            : Promise.resolve([[], []] as [CommercialRule[], BillingRecord[]]),
        ]);

      setData({
        operators,
        partners,
        clients,
        productCatalogs,
        opportunities,
        sales,
        commercialRules: financePayload[0],
        billingRecords: financePayload[1],
      });
    } catch (loadError) {
      setData(EMPTY_DASHBOARD_DATA);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Falha ao carregar os módulos operacionais da plataforma.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, visibleModules]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const metrics = useMemo(() => {
    const openOpportunities = data.opportunities.filter(
      (opportunity) => opportunity.stage !== "WON" && opportunity.stage !== "LOST",
    ).length;

    const billedSales = data.sales.filter((sale) => sale.status === "BILLED").length;
    const grossSalesValue = sumCurrencyStrings(data.sales.map((sale) => sale.grossAmount));
    const releasedSplitValue = sumCurrencyStrings(
      data.billingRecords
        .filter((record) => record.splitStatus === "RELEASED")
        .flatMap(
          (record) => record.splitAllocations?.map((allocation) => allocation.amount) ?? [],
        ),
    );

    return {
      operators: data.operators.length,
      partners: data.partners.length,
      clients: data.clients.length,
      openOpportunities,
      billedSales,
      grossSalesValue,
      releasedSplitValue,
      activeCatalogs: data.productCatalogs.filter(
        (catalog) => catalog.status === "ACTIVE" || catalog.status === "PENDING",
      ).length,
      confirmedBillings: data.billingRecords.filter(
        (record) => record.status === "PAYMENT_CONFIRMED",
      ).length,
    };
  }, [data]);

  return {
    data,
    metrics,
    isLoading,
    error,
    reload,
    visibleModules,
  };
}
