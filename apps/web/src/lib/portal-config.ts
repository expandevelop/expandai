export type PortalKey = "admin" | "partner" | "cliente";

export type PortalRole = "ADMIN" | "PARTNER" | "CLIENT";

export type PortalConfig = {
  key: PortalKey;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  reportsRoute: string;
  experienceRole: PortalRole;
  accent: string;
  accentSoft: string;
  glow: string;
  badge: string;
  legacyModules: Array<{ label: string; href: string; description: string }>;
};

export const portalConfigs: Record<PortalKey, PortalConfig> = {
  admin: {
    key: "admin",
    title: "Portal Administrativo",
    subtitle: "Gestão executiva da operação ExpandAI",
    description:
      "Visão ampla do ecossistema, incluindo operação comercial, financeiro, governança e leitura consolidada do desempenho da plataforma.",
    route: "/admin",
    reportsRoute: "/admin/relatorios",
    experienceRole: "ADMIN",
    accent: "from-cyan-400 via-sky-400 to-indigo-500",
    accentSoft: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
    glow: "shadow-cyan-500/20",
    badge: "Administrativo",
    legacyModules: [
      {
        label: "Operadoras",
        href: "/operadoras",
        description: "Cadastro mestre e onboarding operacional.",
      },
      {
        label: "Partners",
        href: "/partners",
        description: "Rede comercial e performance dos parceiros.",
      },
      {
        label: "Clientes",
        href: "/clientes",
        description: "Carteira e vínculos com a operação comercial.",
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        description: "Billing records, split e reconciliação.",
      },
    ],
  },
  partner: {
    key: "partner",
    title: "Portal Partner",
    subtitle: "Gestão comercial para parceiros de expansão",
    description:
      "Experiência voltada ao acompanhamento de pipeline, vendas, catálogo e carteira atendida, com linguagem visual mais comercial e orientada a produtividade.",
    route: "/partner",
    reportsRoute: "/partner/relatorios",
    experienceRole: "PARTNER",
    accent: "from-violet-400 via-fuchsia-400 to-pink-500",
    accentSoft: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100",
    glow: "shadow-fuchsia-500/20",
    badge: "Partner",
    legacyModules: [
      {
        label: "Catálogo",
        href: "/catalogo",
        description: "Portfólio comercial disponível para oferta.",
      },
      {
        label: "Oportunidades",
        href: "/oportunidades",
        description: "Pipeline e etapas do processo comercial.",
      },
      {
        label: "Vendas",
        href: "/vendas",
        description: "Fechamentos, histórico e evolução do faturamento.",
      },
      {
        label: "Clientes",
        href: "/clientes",
        description: "Leitura da carteira vinculada ao parceiro.",
      },
    ],
  },
  cliente: {
    key: "cliente",
    title: "Portal Cliente",
    subtitle: "Acompanhamento simples da jornada comercial",
    description:
      "Experiência focada em clareza, acompanhamento, histórico e acesso rápido a informações relevantes da conta e do relacionamento com a ExpandAI.",
    route: "/cliente",
    reportsRoute: "/cliente/relatorios",
    experienceRole: "CLIENT",
    accent: "from-emerald-400 via-teal-400 to-cyan-500",
    accentSoft: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
    glow: "shadow-emerald-500/20",
    badge: "Cliente",
    legacyModules: [
      {
        label: "Minha conta",
        href: "/clientes",
        description: "Cadastro, status e visão operacional da conta.",
      },
      {
        label: "Oportunidades",
        href: "/oportunidades",
        description: "Jornada comercial e próximos passos.",
      },
      {
        label: "Vendas",
        href: "/vendas",
        description: "Contratações concluídas e histórico recente.",
      },
      {
        label: "Catálogo",
        href: "/catalogo",
        description: "Produtos e categorias já disponíveis ao relacionamento.",
      },
    ],
  },
};

export function getDefaultPortalForRole(role?: string | null): PortalConfig {
  if (role === "PARTNER") {
    return portalConfigs.partner;
  }

  if (role === "CLIENT") {
    return portalConfigs.cliente;
  }

  return portalConfigs.admin;
}

export const orderedPortals: PortalConfig[] = [
  portalConfigs.admin,
  portalConfigs.partner,
  portalConfigs.cliente,
];
