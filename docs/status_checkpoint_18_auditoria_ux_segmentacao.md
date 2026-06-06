# Checkpoint 18 — Auditoria da experiência atual e direcionamento de evolução

## Visão geral

A camada web atual da **ExpandAI** já entrega cobertura funcional do MVP, mas ainda opera com uma arquitetura de experiência centrada em um **único app shell compartilhado**, com diferenciação apenas por **visibilidade de módulos conforme o papel autenticado**. Esse desenho foi suficiente para estabilizar a camada operacional inicial, porém ainda não atende ao objetivo de apresentar uma experiência madura de usabilidade para testes formais com perfis distintos, especialmente quando se deseja expor **endereços separados**, identidade visual mais refinada, dashboards mais executivos e fluxos com modais modernas.

## Diagnóstico da experiência atual

| Dimensão | Situação atual | Lacuna identificada |
| --- | --- | --- |
| Segmentação por perfil | Um único provider de autenticação e um único shell de navegação para todos os perfis | Ainda não há experiência dedicada para administrativo, partner e cliente |
| Endereçamento | Rotas funcionais por módulo, todas sob a mesma experiência principal | Ainda não existem entradas estruturadas por portal, como áreas distintas por perfil |
| Dashboard | Painel inicial baseado em métricas simples e listas resumidas | Falta camada mais executiva, visual e orientada a decisão |
| Relatórios | KPIs derivados no cliente a partir dos endpoints transacionais | Ainda não existe superfície de relatórios consolidada por persona |
| Modais e interações | Ações complexas ainda usam formulário inline e até `window.prompt` em alguns fluxos | Falta sistema consistente de dialog, confirmação, sheet e ações guiadas |
| Design system | Componentes utilitários básicos para card, input, select e mensagens | Falta linguagem visual mais moderna, hierarquia, densidade controlada e componentes premium |

## Evidências técnicas observadas

A auditoria mostrou que o componente `AuthProvider` centraliza toda a sessão da aplicação e deriva a navegação exclusivamente a partir de `getModulesForRole(currentUser?.role)`. Em termos práticos, isso significa que a aplicação atual **não separa a experiência por portal**, apenas esconde ou mostra módulos conforme o perfil autenticado.

Também foi identificado que a homepage atual funciona como um painel geral com poucas métricas sintéticas, payload da sessão e cartões informativos sobre módulos disponíveis. Esse modelo serve bem como console técnico-operacional, mas ainda está distante de uma superfície pronta para testes de usabilidade orientados a produto.

Nas páginas transacionais, o padrão predominante é de **formulários inline embutidos no corpo da tela**. No módulo de oportunidades, por exemplo, ações como marcar uma oportunidade como perdida ainda utilizam `window.prompt`, o que confirma a ausência de uma camada moderna de modais operacionais. O mesmo padrão estrutural se repete em outras áreas com formulários densos e muita informação distribuída na mesma página.

A base atual de dashboards depende do hook `useExpandaiData`, que carrega coleções operacionais da API e calcula localmente métricas como contagem de operadoras, partners, clientes, oportunidades abertas, vendas faturadas e split liberado. Esse modelo é suficiente para um painel inicial, mas é limitado para o tipo de relatório e experiência analítica que você quer testar antes da homologação.

## Direção arquitetural recomendada para a próxima etapa

| Portal / experiência | Direção recomendada | Endereço sugerido |
| --- | --- | --- |
| Administrativo | Console completo com visão executiva, operação e relatórios amplos | `/admin` |
| Partner | Portal focado em pipeline, vendas, catálogo e carteira atendida | `/partner` |
| Cliente | Portal simplificado, orientado a acompanhamento, histórico e relacionamento | `/cliente` |

A melhor direção para a próxima fase é preservar o monorepo atual e evoluir a aplicação Next.js para uma arquitetura com **portais dedicados por perfil**, compartilhando autenticação, tokens e bibliotecas de API, mas com **shells próprios**, páginas iniciais específicas, navegação contextual e componentes visuais mais sofisticados.

Esse caminho permite atender ao requisito de “endereços diferentes” sem fragmentar prematuramente o projeto em vários repositórios. Em vez disso, a aplicação pode passar a ter áreas claramente segmentadas por URL, identidade visual e fluxo de uso, preservando a eficiência operacional do código já existente.

## Escopo funcional sugerido para a próxima implementação

| Frente | Entrega esperada |
| --- | --- |
| Navegação segmentada | Portais dedicados para administrativo, partner e cliente |
| Modernização visual | Novo layout, melhor hierarquia visual, cards, painéis e experiências mais contemporâneas |
| Sistema de modais | Confirmações, edição rápida, ações destrutivas, detalhes rápidos e formulários contextuais |
| Dashboards | Home executiva por perfil com KPIs, listas acionáveis e leitura gerencial |
| Relatórios | Superfícies resumidas por operação comercial, vendas, financeiro e carteira |
| Usabilidade | Fluxos mais guiados, menos densidade por tela e mais clareza de ação |

## Resultado da auditoria

A conclusão desta auditoria é objetiva: a **ExpandAI já está funcional**, porém ainda precisa de uma **camada de experiência e apresentação de produto** para ficar pronta para testes reais de usabilidade. A base técnica atual é suficiente para essa evolução sem refazer o backend, mas a próxima etapa deve reestruturar o frontend em torno de **portais dedicados**, **design moderno**, **modais consistentes**, **dashboards mais fortes** e **relatórios prontos para navegação**.
