# Checkpoint 06 — Dashboard Web Operacional Conectado à API Real

## Resumo executivo

Neste checkpoint, a ExpandAI avançou da primeira prova de login web para uma **camada de dashboard operacional** efetivamente conectada à **API real já publicada na EC2**. A homepage do frontend deixou de funcionar apenas como uma validação inicial de autenticação e passou a consolidar, em uma única interface, o estado da sessão, a visibilidade por perfil e a leitura dos principais módulos de negócio já expostos pelo backend.

A entrega concentrou-se em três frentes. A primeira foi a **refatoração estrutural** do frontend, com extração de contratos, cliente HTTP, persistência de sessão e componentes reutilizáveis. A segunda foi a **materialização visual dos módulos** de operadoras, partners, catálogo, oportunidades, vendas e financeiro, respeitando o papel do usuário autenticado. A terceira foi a **validação técnica do build**, confirmando que a nova etapa do frontend está consistente para continuidade do desenvolvimento e versionamento.

## Escopo entregue nesta etapa

| Frente | Entrega concluída |
| --- | --- |
| Sessão web | Persistência de autenticação em **local storage**, mantendo coerência com a preferência já adotada no projeto |
| Cliente HTTP | Criação de uma camada compartilhada para login, consulta do usuário autenticado e consumo dos módulos protegidos |
| Tipagem | Centralização dos contratos de sessão, operadoras, partners, catálogo, oportunidades, vendas, regras comerciais e billing records |
| Dashboard | Reescrita da homepage para um painel operacional com métricas, blocos funcionais e leitura dos dados reais da API |
| Navegação por perfil | Exibição condicional dos módulos com base no papel retornado pelo JWT autenticado |
| UI reutilizável | Criação de componentes compartilhados para métricas, cabeçalhos de seção, estados vazios e badges de status |
| Validação | Build do frontend concluído com sucesso após a nova integração |

## Estrutura técnica introduzida

A etapa anterior possuía um componente único concentrando autenticação, estado local e apresentação. Nesta iteração, a estrutura foi reorganizada para permitir expansão sustentável. Foram introduzidos arquivos específicos para **sessão**, **cliente de API**, **formatadores**, **catálogo de módulos**, **tipos compartilhados** e **componentes reutilizáveis de dashboard**.

| Camada | Arquivos principais | Papel na arquitetura |
| --- | --- | --- |
| Sessão | `apps/web/src/lib/session.ts` | Centraliza `API_BASE_URL`, leitura e persistência de sessão no navegador |
| API | `apps/web/src/lib/api.ts` | Encapsula login e requests autenticados aos módulos protegidos |
| Tipos | `apps/web/src/types/expandai.ts` | Define contratos compartilhados entre UI e payloads reais da API |
| Navegação | `apps/web/src/lib/modules.ts` | Mapeia módulos disponíveis e perfis autorizados |
| Apresentação | `apps/web/src/components/dashboard-ui.tsx` | Reúne componentes de apoio visual reutilizáveis |
| Tela principal | `apps/web/src/app/page.tsx` | Consolida o dashboard operacional autenticado |

## Comportamento funcional da nova homepage

A homepage passou a operar como um **painel autenticado**. Quando não existe sessão persistida, a tela apresenta o formulário de login. Após autenticação bem-sucedida, o frontend mantém a sessão no navegador, exibe o usuário autenticado e aciona o carregamento dos módulos visíveis ao perfil retornado pela API.

A interface também passou a oferecer ações explícitas para **recarregar o perfil autenticado**, **sincronizar o dashboard** e, quando o papel é `ADMIN`, **consultar o endpoint administrativo de roles**. Esse desenho acelera a validação manual durante a evolução do produto e diminui o atrito entre backend e frontend durante o handover técnico.

## Módulos web conectados nesta etapa

| Módulo | Endpoint consumido | Tratamento na interface |
| --- | --- | --- |
| Usuário autenticado | `/users/me` | Recarrega o contexto da sessão e atualiza o usuário persistido localmente |
| Roles administrativas | `/users/roles` | Disponível apenas para `ADMIN`, como validação adicional da política de autorização |
| Operadoras | `/operators` | Listagem resumida do cadastro mestre operacional |
| Partners | `/partners` | Listagem resumida do ecossistema comercial parceiro |
| Catálogo | `/product-catalogs` | Visão inicial dos produtos e seu status operacional |
| Oportunidades | `/opportunities` | Pipeline resumido com estágio, ator comercial e produto vinculado |
| Vendas | `/sales` | Painel resumido das vendas já fechadas, com valor e sincronismo com billing |
| Financeiro | `/finance/commercial-rules` e `/finance/billing-records` | Consolidação de regras comerciais, billing records e status de split |

## Métricas e sínteses já exibidas no dashboard

A camada web passou a expor indicadores sintéticos suficientes para leitura executiva inicial do sistema. Entre eles, estão o número de operadoras e partners acessíveis ao perfil, o total de oportunidades abertas, a quantidade de vendas faturadas, o volume bruto consolidado das vendas e o valor agregado de split já liberado nos billing records retornados pela API.

| Indicador | Fonte de dados |
| --- | --- |
| Operadoras / partners | Payloads de `/operators` e `/partners` |
| Oportunidades abertas | Payload de `/opportunities`, excluindo `WON` e `LOST` |
| Vendas faturadas | Payload de `/sales`, filtrando `status = BILLED` |
| Volume bruto consolidado | Soma de `grossAmount` das vendas carregadas |
| Split liberado | Soma das alocações dos billing records com `splitStatus = RELEASED` |
| Billing records confirmados | Payload de `/finance/billing-records`, filtrando `status = PAYMENT_CONFIRMED` |

## Ganhos arquiteturais desta etapa

O principal ganho desta entrega foi a transição do frontend de um estado de **demonstração de autenticação** para um estado de **leitura operacional conectada**. Isso significa que a camada web agora já valida, em uma interface única, três pilares fundamentais do sistema: a sessão autenticada, a política de visibilidade por perfil e a materialização dos dados reais do ecossistema comercial-financeiro.

Esse avanço reduz o risco das próximas etapas, porque a evolução futura não precisará mais partir de um scaffold genérico. A base agora já contém contratos tipados, utilitários de sessão, cliente de API e uma superfície visual coerente para receber rotas dedicadas, filtros, formulários autenticados e ações transacionais.

## Limitações conhecidas ao final do checkpoint

A interface ainda está concentrada em uma **única página operacional**, sem rotas dedicadas para cada módulo. O frontend também ainda não implementa criação, edição e exclusão de entidades, limitando-se à leitura e à validação do estado autenticado. Além disso, a renovação de sessão via refresh token ainda não foi incorporada ao cliente HTTP da camada web, embora o backend já suporte esse fluxo.

| Tema | Situação atual |
| --- | --- |
| Rotas dedicadas | Ainda não implementadas |
| CRUD autenticado | Ainda não implementado |
| Filtros avançados | Ainda não implementados na camada web |
| Refresh automático | Ainda não integrado ao cliente do frontend |
| Tratamento global de erros | Ainda local ao componente principal |

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Introduzir rotas dedicadas para cada módulo operacional, transformando o dashboard em app shell completo |
| 2 | Implementar refresh token no cliente web e política de renovação de sessão |
| 3 | Evoluir a camada comercial com filtros, busca e ações de detalhe por entidade |
| 4 | Criar formulários autenticados para onboarding, oportunidades e vendas |
| 5 | Preparar deploy do frontend publicado consumindo a API já protegida por JWT |

## Conclusão

A ExpandAI agora possui uma **base web operacional real**, conectada ao backend autenticado já publicado. O frontend passou a refletir, com dados persistidos, a estrutura comercial e financeira do ecossistema, ao mesmo tempo em que consolidou os fundamentos necessários para a próxima fase: transformar o painel atual em uma aplicação web modular, autenticada e transacional.
