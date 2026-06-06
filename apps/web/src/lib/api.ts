import {
  API_BASE_URL,
  persistSession,
  readSessionFromStorage,
} from "@/lib/session";
import type {
  AuthSession,
  AuthUser,
  BillingRecord,
  Client,
  CommercialRule,
  Operator,
  Opportunity,
  OperatorOnboardingPayload,
  Partner,
  PartnerOnboardingPayload,
  ProductCatalog,
  ProductCatalogMutationPayload,
  Sale,
} from "@/types/expandai";

export type OpportunityMutationPayload = {
  operatorId: string;
  partnerId?: string;
  clientId?: string;
  productCatalogId?: string;
  title: string;
  description?: string;
  source?: string;
  estimatedValue?: number;
  closeExpectedAt?: string;
};

export type SaleMutationPayload = {
  opportunityId?: string;
  operatorId: string;
  partnerId?: string;
  clientId?: string;
  productCatalogId?: string;
  commercialRuleId?: string;
  title: string;
  description?: string;
  grossAmount: number;
  netAmount?: number;
  externalReference?: string;
};

export type CommercialRuleMutationPayload = {
  productCatalogId: string;
  operatorId: string;
  operatorPercentage: number;
  partnerPercentage: number;
  platformPercentage: number;
  notes?: string;
};

export type BillingRecordMutationPayload = {
  operatorId: string;
  partnerId?: string;
  clientId?: string;
  productCatalogId?: string;
  commercialRuleId?: string;
  description: string;
  grossAmount: number;
  netAmount?: number;
  externalReference?: string;
  dueDate?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Não foi possível concluir a operação solicitada.");
  }

  return (await response.json()) as T;
}

async function buildAuthenticatedResponse(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<AuthSession>(response);
}

export async function refreshSession(refreshToken: string) {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  return parseResponse<AuthSession>(response);
}

export async function authenticatedRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  let response = await buildAuthenticatedResponse(path, accessToken, init);

  if (response.status === 401 && typeof window !== "undefined") {
    const storedSession = readSessionFromStorage();

    if (!storedSession?.refreshToken) {
      throw new Error("A sessão expirou e não foi possível renovar o token de acesso.");
    }

    const refreshedSession = await refreshSession(storedSession.refreshToken);
    persistSession(refreshedSession);
    response = await buildAuthenticatedResponse(
      path,
      refreshedSession.accessToken,
      init,
    );
  }

  return parseResponse<T>(response);
}

export function fetchCurrentUser(accessToken: string) {
  return authenticatedRequest<AuthUser>("/users/me", accessToken);
}

export function fetchRoles(accessToken: string) {
  return authenticatedRequest<{ roles: string[] }>("/users/roles", accessToken);
}

export function fetchOperators(accessToken: string) {
  return authenticatedRequest<Operator[]>("/operators", accessToken);
}

export function fetchOperatorById(accessToken: string, operatorId: string) {
  return authenticatedRequest<Operator>(`/operators/${operatorId}`, accessToken);
}

export function createOperatorOnboarding(
  accessToken: string,
  payload: OperatorOnboardingPayload,
) {
  return authenticatedRequest<{
    onboardingId: string;
    actorType: string;
    status: string;
    userId: string;
    operatorId: string;
  }>("/onboarding/operators", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchPartners(accessToken: string) {
  return authenticatedRequest<Partner[]>("/partners", accessToken);
}

export function fetchPartnerById(accessToken: string, partnerId: string) {
  return authenticatedRequest<Partner>(`/partners/${partnerId}`, accessToken);
}

export function createPartnerOnboarding(
  accessToken: string,
  payload: PartnerOnboardingPayload,
) {
  return authenticatedRequest<{
    onboardingId: string;
    actorType: string;
    status: string;
    userId: string;
    partnerId: string;
  }>("/onboarding/partners", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchClients(accessToken: string) {
  return authenticatedRequest<Client[]>("/clients", accessToken);
}

export function fetchProductCatalogs(accessToken: string) {
  return authenticatedRequest<ProductCatalog[]>("/product-catalogs", accessToken);
}

export function fetchProductCatalogById(accessToken: string, productCatalogId: string) {
  return authenticatedRequest<ProductCatalog>(`/product-catalogs/${productCatalogId}`, accessToken);
}

export function createProductCatalog(
  accessToken: string,
  payload: ProductCatalogMutationPayload,
) {
  return authenticatedRequest<ProductCatalog>("/product-catalogs", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProductCatalog(
  accessToken: string,
  productCatalogId: string,
  payload: Partial<ProductCatalogMutationPayload>,
) {
  return authenticatedRequest<ProductCatalog>(`/product-catalogs/${productCatalogId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function activateProductCatalog(accessToken: string, productCatalogId: string) {
  return authenticatedRequest<ProductCatalog>(
    `/product-catalogs/${productCatalogId}/activate`,
    accessToken,
    {
      method: "PATCH",
    },
  );
}

export function deactivateProductCatalog(accessToken: string, productCatalogId: string) {
  return authenticatedRequest<ProductCatalog>(
    `/product-catalogs/${productCatalogId}/deactivate`,
    accessToken,
    {
      method: "PATCH",
    },
  );
}

export function deleteProductCatalog(accessToken: string, productCatalogId: string) {
  return authenticatedRequest<{ message: string; id: string }>(
    `/product-catalogs/${productCatalogId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}

export function fetchOpportunities(accessToken: string) {
  return authenticatedRequest<Opportunity[]>("/opportunities", accessToken);
}

export function fetchOpportunityById(accessToken: string, opportunityId: string) {
  return authenticatedRequest<Opportunity>(`/opportunities/${opportunityId}`, accessToken);
}

export function createOpportunity(
  accessToken: string,
  payload: OpportunityMutationPayload,
) {
  return authenticatedRequest<Opportunity>("/opportunities", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOpportunity(
  accessToken: string,
  opportunityId: string,
  payload: Partial<OpportunityMutationPayload> & { stage?: string; lostReason?: string },
) {
  return authenticatedRequest<Opportunity>(`/opportunities/${opportunityId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateOpportunityStage(
  accessToken: string,
  opportunityId: string,
  payload: { stage: string; reason?: string },
) {
  return authenticatedRequest<Opportunity>(
    `/opportunities/${opportunityId}/stage`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function markOpportunityAsWon(accessToken: string, opportunityId: string) {
  return authenticatedRequest<Opportunity>(
    `/opportunities/${opportunityId}/won`,
    accessToken,
    {
      method: "PATCH",
    },
  );
}

export function markOpportunityAsLost(
  accessToken: string,
  opportunityId: string,
  reason?: string,
) {
  return authenticatedRequest<Opportunity>(
    `/opportunities/${opportunityId}/lost`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(reason ? { reason } : {}),
    },
  );
}

export function fetchSales(accessToken: string) {
  return authenticatedRequest<Sale[]>("/sales", accessToken);
}

export function fetchSaleById(accessToken: string, saleId: string) {
  return authenticatedRequest<Sale>(`/sales/${saleId}`, accessToken);
}

export function createSale(accessToken: string, payload: SaleMutationPayload) {
  return authenticatedRequest<Sale>("/sales", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSale(
  accessToken: string,
  saleId: string,
  payload: Partial<SaleMutationPayload>,
) {
  return authenticatedRequest<Sale>(`/sales/${saleId}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateSaleStatus(
  accessToken: string,
  saleId: string,
  payload: { status: string },
) {
  return authenticatedRequest<Sale>(`/sales/${saleId}/status`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function syncSaleBillingStatus(accessToken: string, saleId: string) {
  return authenticatedRequest<Sale>(`/sales/${saleId}/sync-billing-status`, accessToken, {
    method: "PATCH",
  });
}

export function fetchCommercialRules(accessToken: string) {
  return authenticatedRequest<CommercialRule[]>(
    "/finance/commercial-rules",
    accessToken,
  );
}

export function createCommercialRule(
  accessToken: string,
  payload: CommercialRuleMutationPayload,
) {
  return authenticatedRequest<CommercialRule>("/finance/commercial-rules", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchBillingRecords(accessToken: string) {
  return authenticatedRequest<BillingRecord[]>(
    "/finance/billing-records",
    accessToken,
  );
}

export function fetchBillingRecordById(accessToken: string, billingRecordId: string) {
  return authenticatedRequest<BillingRecord>(
    `/finance/billing-records/${billingRecordId}`,
    accessToken,
  );
}

export function createBillingRecord(
  accessToken: string,
  payload: BillingRecordMutationPayload,
) {
  return authenticatedRequest<BillingRecord>("/finance/billing-records", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function payBillingRecord(accessToken: string, billingRecordId: string) {
  return authenticatedRequest<BillingRecord>(
    `/finance/billing-records/${billingRecordId}/pay`,
    accessToken,
    {
      method: "PATCH",
    },
  );
}
