# Checkpoint 07 — App Shell Web Modular com Rotas Dedicadas e Renovação de Sessão

## Resumo executivo

Neste checkpoint, a camada web da ExpandAI deixou de operar como uma **única homepage expandida** e passou a assumir a forma de um **app shell autenticado**, com navegação lateral, rotas dedicadas por módulo e base reutilizável para a continuidade dos fluxos transacionais. O frontend agora possui uma estrutura mais próxima de aplicação operacional real, desacoplando autenticação, layout, sessão, carregamento de dados e apresentação das áreas de negócio.

A evolução foi construída em três frentes complementares. A primeira foi a introdução de um **provider central de autenticação**, responsável por unificar leitura de sessão, login, logout, recarga de perfil e sincronização do estado autenticado. A segunda foi a criação de um **shell de aplicação compartilhado**, que organiza a navegação por perfil e sustenta as telas dedicadas de operadoras, partners, catálogo, oportunidades, vendas e financeiro. A terceira foi o endurecimento da sessão web, com **refresh token automático e retry autenticado**, reduzindo o atrito operacional em cenários de expiração do access token.

## Escopo entregue nesta etapa

| Frente | Entrega concluída |
| --- | --- |
| Estrutura do app | Criação de um **app shell autenticado** com navegação lateral e cabeçalho operacional compartilhado |
| Sessão | Centralização do ciclo de autenticação em um provider reutilizável para toda a aplicação |
| Rotas | Abertura de páginas dedicadas para **operadoras**, **partners**, **catálogo**, **oportunidades**, **vendas** e **financeiro** |
| Dados | Criação de um hook compartilhado para carga consolidada dos módulos expostos pela API real |
| Refresh token | Implementação de renovação automática de sessão diante de `401`, com nova tentativa autenticada |
| Sincronização local | Persistência e atualização da sessão no **local storage**, com sincronização por evento interno |
| Validação | Build do frontend concluído com sucesso após a modularização e o endurecimento da sessão |

## Arquitetura introduzida no frontend

A etapa anterior já havia introduzido utilitários compartilhados, mas a navegação ainda estava concentrada em uma única página. Nesta iteração, a arquitetura avançou para um modelo com separação explícita entre **autenticação**, **shell de aplicação**, **rotas funcionais** e **carga reutilizável de dados**.

| Camada | Arquivos principais | Papel na arquitetura |
| --- | --- | --- |
| Provider de autenticação | `apps/web/src/components/auth-provider.tsx` | Centraliza sessão, usuário atual, módulos visíveis e ações de autenticação |
| Shell de aplicação | `apps/web/src/components/app-shell.tsx` | Fornece navegação lateral, cabeçalho, ações globais e contexto visual compartilhado |
| Tela de login | `apps/web/src/components/login-screen.tsx` | Separa o fluxo de autenticação da experiência autenticada do app |
| Carga de dados | `apps/web/src/lib/use-expandai-data.ts` | Reaproveita a coleta dos módulos da API entre as diferentes rotas |
| Configuração de módulos | `apps/web/src/lib/modules.ts` | Passa a mapear não apenas endpoints, mas também as **rotas web** da aplicação |
| Sessão local | `apps/web/src/lib/session.ts` | Mantém persistência em local storage e agora emite eventos internos de atualização |
| Cliente HTTP | `apps/web/src/lib/api.ts` | Passa a suportar **refresh token automático** e retry após expiração de sessão |

## Rotas dedicadas abertas nesta etapa

A aplicação agora possui páginas próprias para cada um dos módulos prioritários já conectados à API real. Isso transforma a navegação da camada web em uma base sustentável para crescimento incremental, reduzindo a complexidade da homepage e preparando o sistema para filtros, formulários e operações autenticadas futuras.

| Rota web | Módulo | Fonte principal de dados |
| --- | --- | --- |
| `/` | Visão geral | Consolidação das principais métricas e visibilidade por perfil |
| `/operadoras` | Operadoras | `/operators` |
| `/partners` | Partners | `/partners` |
| `/catalogo` | Catálogo | `/product-catalogs` |
| `/oportunidades` | Oportunidades | `/opportunities` |
| `/vendas` | Vendas | `/sales` |
| `/financeiro` | Financeiro | `/finance/commercial-rules` e `/finance/billing-records` |

## Comportamento funcional do novo app shell

O app shell introduz uma estrutura estável para toda a camada autenticada. Quando não existe sessão persistida, a aplicação apresenta a tela de login desacoplada. Quando a sessão está presente, o provider calcula os módulos visíveis conforme o papel autenticado, alimenta a navegação lateral e disponibiliza ações globais como recarregar perfil, consultar roles administrativas e encerrar a sessão local.

Esse modelo elimina a dependência de um único componente monolítico e permite que cada área da aplicação evolua de forma independente, mantendo uma base comum de autenticação, layout e sincronização operacional.

## Refresh token e endurecimento da sessão

O frontend passou a renovar a sessão automaticamente quando uma chamada autenticada recebe resposta `401`. Nessa condição, o cliente HTTP consulta a sessão persistida localmente, utiliza o `refreshToken` já armazenado, solicita um novo par de tokens ao endpoint de refresh e repete a chamada original com o novo `accessToken`.

Essa renovação também passou a atualizar o estado global da aplicação por meio de um **evento interno de sessão**, garantindo que o provider reaja ao novo token persistido no navegador. Na prática, isso reduz o risco de inconsistência entre o estado visual do app shell e a sessão efetivamente armazenada localmente.

| Situação | Comportamento implementado |
| --- | --- |
| Sessão válida | A requisição autenticada segue normalmente |
| Access token expirado | O cliente tenta renovar a sessão com `refreshToken` |
| Refresh bem-sucedido | A sessão é persistida novamente e a requisição original é repetida |
| Refresh indisponível | A chamada falha com mensagem indicando impossibilidade de renovação |

## Ganhos de produto e engenharia

O principal ganho desta etapa foi a transição da camada web de um **dashboard concentrado** para uma **aplicação navegável por módulos**, já alinhada à estrutura do backend e pronta para evoluções de maior densidade funcional. A navegação agora conversa melhor com o modelo de autorização do servidor, a leitura dos módulos está organizada em rotas específicas e a sessão se tornou mais resiliente à expiração natural do JWT.

Além disso, a nova arquitetura reduz esforço futuro. As próximas entregas não precisarão mais rediscutir autenticação, layout ou sincronização básica de sessão, podendo concentrar energia nas telas transacionais, nos filtros e nas ações autenticadas de negócio.

## Limitações conhecidas ao final do checkpoint

Embora a estrutura modular esteja pronta, as rotas ainda operam principalmente em modo de **leitura operacional**. Os formulários autenticados, os fluxos completos de CRUD e os filtros avançados ainda não foram implementados. Também não foi introduzido, nesta etapa, um mecanismo de proteção em nível de rota no servidor do frontend, já que a segurança principal continua sendo garantida pela API protegida por JWT e roles.

| Tema | Situação atual |
| --- | --- |
| CRUD completo por módulo | Ainda não implementado |
| Filtros avançados | Ainda não implementados |
| Detalhe por entidade | Ainda não implementado |
| Ações transacionais | Ainda não implementadas |
| Guarda de rota no frontend | Ainda não implementada como camada adicional |

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Implementar filtros e busca por módulo nas rotas já abertas |
| 2 | Criar formulários autenticados para onboarding, oportunidades e vendas |
| 3 | Introduzir páginas de detalhe por entidade com navegação contextual |
| 4 | Publicar o frontend consumindo a API JWT em ambiente acessível |
| 5 | Evoluir o shell para suportar ações operacionais e alertas de negócio em tempo real |

## Conclusão

A ExpandAI agora possui uma **camada web modular autenticada**, com navegação estruturada, páginas dedicadas para os principais módulos e renovação automática de sessão. Esse checkpoint consolida a base técnica necessária para a transição da leitura operacional para a próxima fase do produto: **interação transacional real sobre os fluxos comerciais e financeiros já publicados no backend**.
