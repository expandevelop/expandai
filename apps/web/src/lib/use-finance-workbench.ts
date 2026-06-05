"use client";

import { useMemo } from "react";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type {
  BillingRecord,
  CommercialRule,
  Sale,
  TransactionFormOption,
} from "@/types/expandai";

function buildHint(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
}

export function useFinanceWorkbench(accessToken?: string | null, role?: string | null) {
  const { data, isLoading, error, reload, visibleModules } = useExpandaiData(accessToken, role);

  const operatorOptions = useMemo<TransactionFormOption[]>(
    () =>
      data.operators.map((operator) => ({
        value: operator.id,
        label: operator.tradeName,
        hint: operator.legalName,
      })),
    [data.operators],
  );

  const partnerOptions = useMemo<TransactionFormOption[]>(
    () =>
      data.partners.map((partner) => ({
        value: partner.id,
        label: partner.companyName,
        hint: buildHint([partner.partnerLevel, partner.status]),
      })),
    [data.partners],
  );

  const clientOptions = useMemo<TransactionFormOption[]>(
    () =>
      data.clients.map((client) => ({
        value: client.id,
        label: client.companyName,
        hint: buildHint([client.document ?? undefined, client.status]),
      })),
    [data.clients],
  );

  function getCatalogOptionsByOperator(operatorId?: string) {
    return data.productCatalogs
      .filter((catalog) => !operatorId || catalog.operatorId === operatorId)
      .map<TransactionFormOption>((catalog) => ({
        value: catalog.id,
        label: catalog.name,
        hint: buildHint([catalog.category, catalog.status]),
      }));
  }

  function getCommercialRuleOptions(operatorId?: string, productCatalogId?: string) {
    return data.commercialRules
      .filter((rule) => {
        if (operatorId && rule.operatorId !== operatorId) {
          return false;
        }

        if (productCatalogId && rule.productCatalogId !== productCatalogId) {
          return false;
        }

        return true;
      })
      .map<TransactionFormOption>((rule) => ({
        value: rule.id,
        label: rule.productCatalog?.name ?? "Regra comercial",
        hint: buildHint([
          `${rule.operatorPercentage}/${rule.partnerPercentage}/${rule.platformPercentage}`,
          rule.notes ?? undefined,
        ]),
      }));
  }

  function getSaleOptionsForBilling() {
    return data.sales.map<TransactionFormOption>((sale) => ({
      value: sale.id,
      label: sale.title,
      hint: buildHint([
        sale.externalReference ?? undefined,
        sale.billingRecord?.status ?? undefined,
      ]),
    }));
  }

  function getDefaultsFromSale(saleId?: string) {
    const sale = data.sales.find((item) => item.id === saleId);

    if (!sale) {
      return null;
    }

    return {
      sale,
      operatorId: sale.operator?.id ?? "",
      partnerId: sale.partner?.id ?? "",
      clientId: sale.client?.id ?? "",
      productCatalogId: sale.productCatalog?.id ?? "",
      commercialRuleId: sale.commercialRule?.id ?? "",
      description: sale.description ?? sale.title,
      grossAmount: sale.grossAmount ? String(sale.grossAmount) : "",
      netAmount: sale.netAmount ? String(sale.netAmount) : "",
      externalReference: sale.externalReference ?? "",
    };
  }

  function summarizeBillingRecord(record: BillingRecord) {
    const releasedAllocations = (record.splitAllocations ?? []).filter(
      (allocation) => allocation.status === "RELEASED",
    ).length;

    return {
      releasedAllocations,
      totalAllocations: record.splitAllocations?.length ?? 0,
      hasCommercialRule: Boolean(record.commercialRuleId),
    };
  }

  return {
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
  };
}

export type FinanceWorkbenchHook = ReturnType<typeof useFinanceWorkbench>;
export type FinanceWorkbenchSale = Sale;
export type FinanceWorkbenchBillingRecord = BillingRecord;
export type FinanceWorkbenchCommercialRule = CommercialRule;
