export type PortalKey = "expand" | "operadora" | "partner" | "cliente";

export type PortalRole = "ADMIN" | "OPERATOR" | "PARTNER" | "CLIENT";

export type PortalNavigationItem = {
  label: string;
  href: string;
  description: string;
};

export type PortalConfig = {
  key: PortalKey;
  title: string;
  subtitle: string;
  description: string;
  route: string;
  reportsRoute: string;
  experienceRole: PortalRole;
  badge: string;
  navigationLabel: string;
  accent: string;
  accentSoft: string;
  icon: string;
  legacyModules: PortalNavigationItem[];
};

export const portalConfigs: Record<PortalKey, PortalConfig> = {
  expand: {
    key: "expand",
    title: "Portal Expand",
    subtitle: "Controle executivo da expansão comercial",
    description:
      "Visão central da plataforma para governança, inteligência comercial, operação global, parceiros, operadoras e clientes do ecossistema.",
    route: "/expand",
    reportsRoute: "/expand/relatorios",
    experienceRole: "ADMIN",
    badge: "Expand",
    navigationLabel: "Expand",
    accent: "from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a]",
    accentSoft: "border-[#16a34a]/20 bg-[#16a34a]/10 text-[#dcfce7]",
    icon: "EA",
    legacyModules: [
      {
        label: "Operadoras",
        href: "/operadoras",
        description: "Base institucional e onboarding das operadoras conectadas.",
      },
      {
        label: "Partners",
        href: "/partners",
        description: "Rede comercial parceira e performance do ecossistema.",
      },
      {
        label: "Clientes",
        href: "/clientes",
        description: "Carteira consolidada, relacionamento e ativação comercial.",
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        description: "Billing, repasses, conciliação e visão de monetização.",
      },
    ],
  },
  operadora: {
    key: "operadora",
    title: "Portal Operadora",
    subtitle: "Operação institucional e crescimento por operadora",
    description:
      "Experiência dedicada à operadora, com leitura clara do catálogo, carteira, pipeline, ativações e relacionamento comercial na plataforma.",
    route: "/operadora",
    reportsRoute: "/operadora/relatorios",
    experienceRole: "OPERATOR",
    badge: "Operadora",
    navigationLabel: "Operadora",
    accent: "from-[#0f1d2f] via-[#1e3a5f] to-[#22c55e]",
    accentSoft: "border-[#22c55e]/20 bg-[#22c55e]/10 text-[#dcfce7]",
    icon: "OP",
    legacyModules: [
      {
        label: "Cadastro institucional",
        href: "/operadoras",
        description: "Dados principais, status e onboarding da operadora.",
      },
      {
        label: "Catálogo",
        href: "/catalogo",
        description: "Produtos, categorias e regras comerciais vinculadas.",
      },
      {
        label: "Oportunidades",
        href: "/oportunidades",
        description: "Fluxo comercial associado à operadora e seus produtos.",
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        description: "Faturamento e repasses relacionados à operação.",
      },
    ],
  },
  partner: {
    key: "partner",
    title: "Portal Partner",
    subtitle: "Jornada comercial da rede parceira",
    description:
      "Experiência voltada à produtividade comercial do parceiro, com foco em pipeline, catálogo disponível, carteira e resultados.",
    route: "/partner",
    reportsRoute: "/partner/relatorios",
    experienceRole: "PARTNER",
    badge: "Partner",
    navigationLabel: "Partner",
    accent: "from-[#0f1d2f] via-[#1e3a5f] to-[#16a34a]",
    accentSoft: "border-[#16a34a]/20 bg-[#16a34a]/10 text-[#dcfce7]",
    icon: "PT",
    legacyModules: [
      {
        label: "Catálogo",
        href: "/catalogo",
        description: "Portfólio comercial disponível para oferta ao mercado.",
      },
      {
        label: "Oportunidades",
        href: "/oportunidades",
        description: "Pipeline comercial e avanço das negociações.",
      },
      {
        label: "Vendas",
        href: "/vendas",
        description: "Fechamentos, conversão e histórico de receita gerada.",
      },
      {
        label: "Clientes",
        href: "/clientes",
        description: "Carteira vinculada ao parceiro e próximos movimentos.",
      },
    ],
  },
  cliente: {
    key: "cliente",
    title: "Portal Cliente Final",
    subtitle: "Acompanhamento simples da jornada com a Expand",
    description:
      "Experiência mais enxuta, orientada à clareza de status, propostas, contratações, relacionamento e próximos passos do cliente final.",
    route: "/cliente",
    reportsRoute: "/cliente/relatorios",
    experienceRole: "CLIENT",
    badge: "Cliente Final",
    navigationLabel: "Cliente",
    accent: "from-[#0f1d2f] via-[#1e3a5f] to-[#22c55e]",
    accentSoft: "border-[#22c55e]/20 bg-[#22c55e]/10 text-[#dcfce7]",
    icon: "CF",
    legacyModules: [
      {
        label: "Minha conta",
        href: "/clientes",
        description: "Dados da conta, relacionamento e status operacional.",
      },
      {
        label: "Oportunidades",
        href: "/oportunidades",
        description: "Propostas em andamento e próximos movimentos comerciais.",
      },
      {
        label: "Vendas",
        href: "/vendas",
        description: "Contratações concluídas e histórico recente.",
      },
      {
        label: "Catálogo",
        href: "/catalogo",
        description: "Soluções e categorias relevantes ao relacionamento atual.",
      },
    ],
  },
};

export function getDefaultPortalForRole(role?: string | null): PortalConfig {
  if (role === "OPERATOR") {
    return portalConfigs.operadora;
  }

  if (role === "PARTNER") {
    return portalConfigs.partner;
  }

  if (role === "CLIENT") {
    return portalConfigs.cliente;
  }

  return portalConfigs.expand;
}

export const orderedPortals: PortalConfig[] = [
  portalConfigs.expand,
  portalConfigs.operadora,
  portalConfigs.partner,
  portalConfigs.cliente,
];
