# Checkpoint 19 — Arquitetura dos portais por perfil e da nova experiência de usabilidade

## Objetivo arquitetural

A próxima evolução da **ExpandAI** será construída sobre o frontend já publicado, mas com uma nova organização de experiência orientada por portal. Em vez de depender apenas de um único painel compartilhado com módulos liberados por papel, a aplicação passará a expor **endereços dedicados por perfil**, cada um com identidade visual, navegação contextual, dashboard inicial e área de relatórios próprios.

## Estrutura de endereços proposta

| Experiência | Endereço principal | Finalidade |
| --- | --- | --- |
| Portal administrativo | `/admin` | Visão executiva e operacional completa da plataforma |
| Portal partner | `/partner` | Gestão comercial, carteira, catálogo e performance do parceiro |
| Portal cliente | `/cliente` | Acompanhamento simplificado da jornada, histórico e indicadores do cliente |
| Relatórios administrativos | `/admin/relatorios` | Consolidação executiva e operacional ampla |
| Relatórios partner | `/partner/relatorios` | Performance comercial e funil do parceiro |
| Relatórios cliente | `/cliente/relatorios` | Acompanhamento resumido e leitura de relacionamento |

## Diretrizes da implementação

| Frente | Decisão arquitetural |
| --- | --- |
| Monorepo | Manter o mesmo projeto Next.js existente |
| Autenticação | Reaproveitar o `AuthProvider` atual e a sessão JWT já estabilizada |
| Segmentação | Criar portais dedicados por URL, sem quebrar o backend atual |
| Navegação | Introduzir shell visual novo por portal, com sidebar, topo e ações rápidas |
| Dashboards | Criar páginas iniciais específicas por perfil com KPIs, listas e atalhos |
| Relatórios | Criar páginas dedicadas com leitura analítica baseada nos dados já disponíveis |
| Modais | Introduzir componente próprio de dialog para ações rápidas, contexto e prévias |
| Compatibilidade | Preservar as rotas operacionais atuais por módulo durante a transição |

## Estratégia de dados

A base inicial dos novos dashboards e relatórios continuará se apoiando na API já publicada e nos hooks do frontend existente. No entanto, em vez de derivar toda a experiência somente do papel autenticado, os novos portais poderão usar um **papel-alvo de experiência** para montar visões administrativas, de partner e de cliente, inclusive em contexto de prévia de usabilidade.

Isso é importante porque permite validar a nova interface mesmo antes de existir uma massa completa de usuários finais para todos os papéis. Assim, a camada de UX pode ser preparada e testada sem bloquear a evolução pela disponibilidade imediata de credenciais dedicadas para cada perfil.

## Resultado esperado desta arquitetura

Com essa estrutura, a ExpandAI deixará de ser percebida como um único painel técnico com menus condicionais e passará a se comportar como um conjunto de **portais especializados**, com aparência mais madura, navegação mais clara e superfícies adequadas para testes de usabilidade antes da homologação operacional.
