import {
  API_BASE_URL,
  persistSession,
  readSessionFromStorage,
} from "@/lib/session";
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

export function fetchPartners(accessToken: string) {
  return authenticatedRequest<Partner[]>("/partners", accessToken);
}

export function fetchProductCatalogs(accessToken: string) {
  return authenticatedRequest<ProductCatalog[]>("/product-catalogs", accessToken);
}

export function fetchOpportunities(accessToken: string) {
  return authenticatedRequest<Opportunity[]>("/opportunities", accessToken);
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

export function fetchBillingRecords(accessToken: string) {
  return authenticatedRequest<BillingRecord[]>(
    "/finance/billing-records",
    accessToken,
  );
}
