# Checkpoint 21 — Auditoria do redesign dos portais ExpandAI

## Objetivo desta etapa

Esta etapa consolidou a auditoria do front-end atual da **ExpandAI** para orientar uma reconstrução mais limpa, acessível e coerente com a identidade visual da **EXPAND**, agora usando como referência o site correto `https://aiexpand.com.br/`.

## Referência de marca confirmada

A inspeção técnica do site público da marca mostrou uma linguagem visual simples, tecnológica e pouco poluída, baseada principalmente em **azul escuro profundo** e **verde vivo**, apoiados por neutros claros. Os principais códigos observados no HTML foram os seguintes.

| Papel visual | Cor observada |
| --- | --- |
| Azul base profundo | `#0f1d2f` |
| Azul secundário | `#1e3a5f` |
| Verde principal | `#16a34a` |
| Verde de destaque | `#22c55e` |
| Branco | `#ffffff` |
| Cinza claro | `#f3f4f6` |
| Cinza médio | `#9ca3af` |
| Cinza textual | `#4b5563` |

O conteúdo público atual da marca é minimalista e reforça a ideia de uma experiência com **mensagem central clara, alto contraste e baixa densidade visual**. Essa direção conflita com o front atual da plataforma, que ainda concentra muitos elementos em superfícies muito carregadas.

## Diagnóstico do front-end atual

A estrutura atual do `apps/web` já usa **Next.js App Router**, **TypeScript** e **Tailwind CSS**, o que é compatível com a direção desejada. No entanto, a implementação visual ainda segue uma lógica de cards escuros, muitas bordas, muitos blocos competindo entre si e excesso de elementos simultâneos em tela.

A auditoria das rotas mostrou que a aplicação hoje mistura duas camadas visuais diferentes. Existe uma camada mais antiga, baseada em `AppShell`, usada por módulos como `operadoras`, e outra mais nova, baseada em `PortalShell`, `PortalDashboard` e `PortalReports`, usada para os portais recentes. Isso gera inconsistência visual, cognitiva e operacional.

| Área auditada | Situação encontrada | Impacto na experiência |
| --- | --- | --- |
| Hub principal (`/`) | Exibe vários blocos e cards ao mesmo tempo, com destaque semelhante entre áreas diferentes | Sensação de excesso de informação e pouca hierarquia |
| Portais atuais | Existem apenas **3 portais** (`admin`, `partner`, `cliente`) | Falta o portal dedicado de **Operadora**, pedido explicitamente pelo usuário |
| Shell dos portais | Sidebar extensa, vários cards laterais, cabeçalho forte e múltiplas ações simultâneas | Densidade elevada e pouca respiração visual |
| Módulo legado `AppShell` | Menu lateral e ações administrativas ainda muito utilitárias e densas | UX mais próxima de painel técnico do que de experiência comercial moderna |
| Operadoras | Continua como módulo legado separado, não como portal de primeira classe | Não atende à meta de links dedicados por audiência |
| Modais | Existe apenas uma modal genérica reutilizada | Não representa adequadamente os quatro contextos distintos desejados |

## Problemas de UX e acessibilidade identificados

O problema central do front atual não é falta de funcionalidade, mas sim **falta de hierarquia, segmentação e clareza de navegação**. A experiência atual exige que o usuário entenda muitas caixas, muitas chamadas visuais e muitos caminhos logo no primeiro contato.

Os principais pontos críticos identificados foram os seguintes.

| Problema | Evidência observada | Consequência |
| --- | --- | --- |
| Excesso de superfícies com o mesmo peso visual | Muitos cards com bordas, fundos escuros e destaque semelhante | O olhar do usuário não sabe onde começar |
| Navegação pouco segmentada | O hub mostra vários portais e módulos ao mesmo tempo | A sensação é de “tudo junto” |
| Falta de portal de Operadora | A operadora existe apenas como módulo legado | O modelo de quatro audiências ainda não está refletido na arquitetura |
| Ações demais no topo das telas | Botões, links e modais aparecem simultaneamente | O fluxo não comunica prioridade de uso |
| Densidade excessiva nas listas operacionais | Telas como `operadoras` ainda se comportam como CRUD técnico | Baixa percepção de modernidade e pouca elegância visual |
| Padrão visual inconsistente | Convivem `AppShell` e `PortalShell` com linguagens diferentes | A experiência parece parcialmente montada |
| Acessibilidade ainda básica | Há componentes funcionais, mas a estrutura ainda não foi organizada por foco, ordem de leitura e navegação reduzida | Risco de baixa legibilidade e esforço extra na navegação |

## Conclusão arquitetural da auditoria

A auditoria confirma que a próxima reconstrução não deve ser apenas uma troca cosmética. O front precisa ser reorganizado em **quatro portais de primeira classe**, cada um com URL própria, navegação própria e densidade adequada ao seu público:

| Portal desejado | Papel |
| --- | --- |
| **Expand** | visão administrativa e estratégica da plataforma |
| **Operadora** | visão institucional e operacional das operadoras |
| **Partner** | visão comercial do ecossistema de parceiros |
| **Cliente Final** | visão simples, clara e orientada à jornada do cliente |

Além disso, o projeto deverá migrar para um sistema visual mais sólido, com:

| Direção | Implicação prática |
| --- | --- |
| Cabeçalho fixo + menu lateral colapsável | Navegação mais estável e previsível |
| Mais espaçamento e menos blocos concorrentes | Menor sensação de poluição |
| Componentes reutilizáveis consistentes | Button, Input, Modal, Table, Tabs, Card, Badge e Skeleton com linguagem única |
| Portais separados por link | Menor ambiguidade entre públicos |
| Modais específicas por contexto | Expand, Operadora, Partner e Cliente Final com identidade e propósito próprios |
| Base cromática da EXPAND | Azul profundo + verde moderno como assinatura dominante |

## Decisão de continuidade

Com a auditoria concluída, a próxima etapa deve consolidar a **arquitetura de navegação e experiência** dos quatro portais, incluindo:

1. definição das URLs e da taxonomia final dos portais;
2. desenho do shell-base responsivo;
3. definição da biblioteca de componentes reutilizáveis;
4. separação entre experiências executivas, operacionais, comerciais e de cliente final;
5. substituição gradual da camada legado `AppShell` por uma nova estrutura única.
