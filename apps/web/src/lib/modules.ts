export type DashboardModuleKey =
  | "operators"
  | "partners"
  | "catalog"
  | "opportunities"
  | "sales"
  | "finance";

export type DashboardModule = {
  key: DashboardModuleKey;
  title: string;
  description: string;
  endpoint: string;
  href: string;
  profiles: string[];
};

export const dashboardModules: DashboardModule[] = [
  {
    key: "operators",
    title: "Operadoras",
    description:
      "Consulta do cadastro mestre das operadoras conectadas ao ecossistema ExpandAI.",
    endpoint: "/operators",
    href: "/operadoras",
    profiles: ["ADMIN", "OPERATOR"],
  },
  {
    key: "partners",
    title: "Partners",
    description:
      "Acompanhamento do ecossistema comercial de parceiros e sua atuação na plataforma.",
    endpoint: "/partners",
    href: "/partners",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    key: "catalog",
    title: "Catálogo de produtos",
    description:
      "Base comercial dos produtos publicados pelas operadoras com regras associadas.",
    endpoint: "/product-catalogs",
    href: "/catalogo",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    key: "opportunities",
    title: "Oportunidades",
    description:
      "Pipeline comercial com visibilidade inicial das oportunidades já persistidas.",
    endpoint: "/opportunities",
    href: "/oportunidades",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    key: "sales",
    title: "Vendas",
    description:
      "Fechamentos comerciais integrados ao faturamento e ao sincronismo de status.",
    endpoint: "/sales",
    href: "/vendas",
    profiles: ["ADMIN", "OPERATOR", "PARTNER"],
  },
  {
    key: "finance",
    title: "Financeiro",
    description:
      "Visão consolidada de regras comerciais, billing records e split operacional.",
    endpoint: "/finance/billing-records",
    href: "/financeiro",
    profiles: ["ADMIN", "OPERATOR"],
  },
];

export function getModulesForRole(role?: string | null) {
  if (!role) {
    return [];
  }

  return dashboardModules.filter((module) => module.profiles.includes(role));
}
