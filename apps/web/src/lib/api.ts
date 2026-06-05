import { API_BASE_URL } from "@/lib/session";
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

export async function authenticatedRequest<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

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

export function fetchSales(accessToken: string) {
  return authenticatedRequest<Sale[]>("/sales", accessToken);
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
