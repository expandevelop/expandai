"use client";

import { useMemo } from "react";
import { useExpandaiData } from "@/lib/use-expandai-data";
import type {
  Client,
  CommercialRule,
  Opportunity,
  ProductCatalog,
  TransactionFormOption,
} from "@/types/expandai";

function buildLabel(primary?: string | null, secondary?: string | null) {
  const base = primary ?? "—";
  return secondary ? `${base} · ${secondary}` : base;
}

export function useTransactionDependencies(accessToken?: string | null, role?: string | null) {
  const { data, isLoading, error, reload, visibleModules } = useExpandaiData(
    accessToken,
    role,
  );

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
        hint: partner.partnerLevel ?? partner.status,
      })),
    [data.partners],
  );

  const clientOptions = useMemo<TransactionFormOption[]>(
    () =>
      data.clients.map((client) => ({
        value: client.id,
        label: client.companyName,
        hint: client.document ?? client.status,
      })),
    [data.clients],
  );

  function getCatalogsByOperator(operatorId?: string) {
    return data.productCatalogs.filter(
      (catalog) => !operatorId || catalog.operatorId === operatorId,
    );
  }

  function getCatalogOptions(operatorId?: string) {
    return getCatalogsByOperator(operatorId).map<TransactionFormOption>((catalog) => ({
      value: catalog.id,
      label: catalog.name,
      hint: buildLabel(catalog.category, catalog.status),
    }));
  }

  function getCommercialRulesByOperatorAndCatalog(
    operatorId?: string,
    productCatalogId?: string,
  ) {
    return data.commercialRules.filter((rule) => {
      if (operatorId && rule.operatorId !== operatorId) {
        return false;
      }

      if (productCatalogId && rule.productCatalogId !== productCatalogId) {
        return false;
      }

      return true;
    });
  }

  function getCommercialRuleOptions(operatorId?: string, productCatalogId?: string) {
    return getCommercialRulesByOperatorAndCatalog(operatorId, productCatalogId).map<
      TransactionFormOption
    >((rule) => ({
      value: rule.id,
      label: buildLabel(
        rule.productCatalog?.name ?? "Regra comercial",
        `${rule.operatorPercentage}/${rule.partnerPercentage}/${rule.platformPercentage}`,
      ),
      hint: rule.notes ?? rule.operator?.tradeName,
    }));
  }

  function getOpenOpportunityOptions(operatorId?: string) {
    return data.opportunities
      .filter((opportunity) => {
        if (operatorId && opportunity.operator?.id !== operatorId) {
          return false;
        }

        return opportunity.stage !== "LOST";
      })
      .map<TransactionFormOption>((opportunity) => ({
        value: opportunity.id,
        label: opportunity.title,
        hint: buildLabel(opportunity.stage, opportunity.partner?.companyName),
      }));
  }

  function getDefaultsFromOpportunity(opportunityId?: string) {
    const opportunity = data.opportunities.find((item) => item.id === opportunityId);

    if (!opportunity) {
      return null;
    }

    return {
      opportunity,
      operatorId: opportunity.operator?.id ?? "",
      partnerId: opportunity.partner?.id ?? "",
      clientId: opportunity.client?.id ?? "",
      productCatalogId: opportunity.productCatalog?.id ?? "",
      title: opportunity.title,
      description: opportunity.description ?? "",
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
    getCatalogsByOperator,
    getCatalogOptions,
    getCommercialRulesByOperatorAndCatalog,
    getCommercialRuleOptions,
    getOpenOpportunityOptions,
    getDefaultsFromOpportunity,
  };
}

export type TransactionDependenciesHook = ReturnType<typeof useTransactionDependencies>;
export type TransactionCatalog = ProductCatalog;
export type TransactionRule = CommercialRule;
export type TransactionClient = Client;
export type TransactionOpportunity = Opportunity;
