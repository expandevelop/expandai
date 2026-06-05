"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchBillingRecords,
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

    setIsLoading(true);
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

      setData({
        operators,
        partners,
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
        .flatMap((record) => record.splitAllocations?.map((allocation) => allocation.amount) ?? []),
    );

    return {
      operators: data.operators.length,
      partners: data.partners.length,
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
