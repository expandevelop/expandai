# Checkpoint 22 — Arquitetura do redesign dos portais ExpandAI

## Premissa de arquitetura

A partir da auditoria anterior, a direção do redesign deixa de tratar a plataforma como um conjunto de módulos soltos e passa a tratá-la como um **ecossistema de quatro experiências principais**, cada uma com entrada própria, navegação própria e contexto visual controlado.

A decisão arquitetural é transformar o front em uma estrutura mais previsível, menos densa e mais orientada a audiência, mantendo **Next.js App Router**, **TypeScript** e **Tailwind CSS** como base da implementação.

## Estrutura de portais proposta

A nova arquitetura terá um **hub leve de entrada** e quatro portais principais, todos acessíveis por links independentes.

| Camada | URL proposta | Público | Papel principal |
| --- | --- | --- | --- |
| Hub institucional de acesso | `/` | todos os perfis | escolher ou redirecionar para o portal correto |
| Portal Expand | `/expand` | administração central | visão executiva, operação global, governança e inteligência comercial |
| Portal Operadora | `/operadora` | operadoras | onboarding, catálogo, carteira, visão operacional e performance própria |
| Portal Partner | `/partner` | parceiros | pipeline, oportunidades, vendas, carteira e comissionamento |
| Portal Cliente Final | `/cliente` | clientes finais | acompanhamento da jornada, propostas, compras, histórico e comunicação |

Além da rota principal de cada portal, cada experiência deverá ter ao menos uma área de relatórios dedicada.

| Portal | Rota principal | Rota analítica |
| --- | --- | --- |
| Expand | `/expand` | `/expand/relatorios` |
| Operadora | `/operadora` | `/operadora/relatorios` |
| Partner | `/partner` | `/partner/relatorios` |
| Cliente Final | `/cliente` | `/cliente/relatorios` |

## Navegação e layout-base

O layout-base deixará de privilegiar grandes blocos empilhados e passará a usar uma estrutura consistente composta por **cabeçalho fixo**, **menu lateral colapsável no desktop** e **menu hambúrguer no mobile**, exatamente na direção solicitada pelo usuário.

A navegação proposta fica organizada da seguinte forma.

| Elemento | Comportamento |
| --- | --- |
| Cabeçalho fixo | logo da EXPAND, nome do portal, busca futura, ações rápidas e menu do usuário |
| Sidebar desktop | colapsável, com ícones + labels, priorizando poucas entradas por vez |
| Menu mobile | drawer lateral controlado por botão hambúrguer |
| Área principal | conteúdo em largura controlada, com respiro vertical e blocos hierarquizados |
| Tabs internas | navegação client-side entre subvisões, sem recarregar a página inteira |

A estrutura deve reduzir radicalmente a sensação de “tudo ao mesmo tempo”. Em vez de vários cartões competindo entre si, cada tela passará a ter:

1. um **bloco de contexto**;
2. uma **linha curta de KPIs prioritários**;
3. uma **área principal de trabalho**;
4. uma **área analítica complementar**, quando fizer sentido.

## Sistema visual unificado

A identidade visual da aplicação passará a seguir uma assinatura inspirada no site correto da marca **aiexpand.com.br**, com o azul profundo como base dominante e verde moderno como cor de ação, reforço e sucesso.

| Token visual | Proposta inicial |
| --- | --- |
| `brand.navy.900` | `#0f1d2f` |
| `brand.navy.800` | `#1e3a5f` |
| `brand.green.600` | `#16a34a` |
| `brand.green.500` | `#22c55e` |
| `neutral.0` | `#ffffff` |
| `neutral.50` | `#f3f4f6` |
| `neutral.400` | `#9ca3af` |
| `neutral.600` | `#4b5563` |

O princípio visual será **menos brilho, menos ruído, mais contraste útil e mais espaçamento**. O uso de gradientes continuará permitido, mas apenas como reforço sutil de marca, não como pano de fundo dominante em todas as superfícies.

## Biblioteca de componentes proposta

O redesign deve consolidar uma biblioteca reutilizável que sirva a todos os portais. O objetivo é evitar repetição de estilos e inconsistência entre camadas antigas e novas.

| Componente | Papel no sistema |
| --- | --- |
| `AppHeader` | cabeçalho fixo comum |
| `SidebarNav` | navegação lateral colapsável |
| `PortalHero` | bloco introdutório de contexto por portal |
| `KpiCard` | indicadores resumidos com menor ruído visual |
| `SurfaceCard` | card-base com variações leves |
| `DataTable` | tabela com paginação e evolução futura para virtualização |
| `TabsBar` | abas responsivas e acessíveis |
| `Modal` | base acessível com foco controlado e `aria-*` |
| `Button`, `Input`, `Select`, `Badge`, `Skeleton` | primitives reutilizáveis |

## Estratégia das modais por contexto

Embora o pedido do usuário mencione “3 modais” e em seguida liste quatro contextos, a interpretação arquitetural correta é criar **quatro variantes de modal**, uma para cada portal principal, preservando um comportamento técnico único com identidade contextual diferente.

| Modal contextual | Uso |
| --- | --- |
| Modal Expand | prioridades executivas, governança, visão consolidada |
| Modal Operadora | onboarding, catálogo, performance e operações da operadora |
| Modal Partner | oportunidades, carteira, comissionamento e ação comercial |
| Modal Cliente Final | status da jornada, contratação, suporte e próximos passos |

A decisão é manter um **núcleo técnico único de modal acessível** e aplicar variações de conteúdo, hierarquia e cor por portal, em vez de replicar componentes independentes sem consistência.

## Compatibilização com a estrutura existente

A arquitetura nova não descartará imediatamente os módulos legados. Em vez disso, eles serão reposicionados como **aplicativos internos** dentro dos novos portais, até que sejam completamente absorvidos pela nova experiência.

| Estrutura atual | Destino na nova arquitetura |
| --- | --- |
| `admin` | será substituído por `expand` |
| `operadoras` | base funcional para o novo portal `operadora` |
| `partner` | será mantido, mas redesenhado |
| `cliente` | será mantido, mas redesenhado como cliente final |
| módulos legados (`/catalogo`, `/oportunidades`, `/vendas`, `/financeiro`, `/clientes`, `/partners`) | passarão a ser acessados como apps internos ou migrados gradualmente para telas próprias por portal |

## Critérios de UX e acessibilidade

A nova arquitetura seguirá uma linha mínima de acessibilidade e responsividade desde a base.

| Critério | Diretriz |
| --- | --- |
| Contraste | seguir combinação de azul profundo com texto claro e verde de ação sem perda de legibilidade |
| Navegação por teclado | foco visível em links, botões, tabs e modais |
| Formulários | labels explícitas, ajuda contextual e mensagens de erro próximas ao campo |
| Modais | `aria-label`, foco inicial controlado, fechamento por teclado e overlay consistente |
| Responsividade | mobile-first com adaptação progressiva para tablet e desktop |
| Hierarquia tipográfica | headline, subhead e body claramente separados, base de 16px |

## Decisão de continuidade

Com esta arquitetura definida, a próxima etapa deverá implementar o **novo sistema visual base**, começando por:

1. substituição dos estilos globais por tokens coerentes com a marca;
2. criação do shell-base compartilhado;
3. criação da nova biblioteca de componentes reutilizáveis;
4. introdução das rotas `expand` e `operadora` como experiências de primeira classe;
5. refatoração progressiva de `partner` e `cliente` para o novo padrão.
