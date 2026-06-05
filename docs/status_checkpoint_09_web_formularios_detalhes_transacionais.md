# Checkpoint 09 — Formulários Transacionais e Páginas de Detalhe na Camada Web

## Resumo executivo

Neste checkpoint, a camada web da ExpandAI evoluiu de uma interface autenticada com filtros e ações pontuais para uma experiência **transacional mais completa** nos módulos comerciais prioritários. A aplicação passou a oferecer **formulários autenticados de criação e edição** para oportunidades e vendas, com **rascunho persistido em local storage por módulo**, carregamento de **dependências relacionais reais** a partir da API e novas **páginas de detalhe operacional** para aprofundamento dos registros.

Essa etapa amplia substancialmente o valor operacional da camada web. Antes, a interface já era capaz de consultar dados, aplicar filtros e disparar algumas mutações rápidas. Agora, ela também suporta a entrada e manutenção estruturada de dados comerciais críticos, preservando aderência ao contrato do backend e respeitando a preferência arquitetural do projeto por persistência local isolada no navegador.

## Escopo entregue nesta etapa

| Frente | Entrega concluída |
| --- | --- |
| Tipos compartilhados | Expansão dos contratos front-end para incluir `Client`, campos adicionais de oportunidade e estruturas auxiliares de formulário |
| Cliente HTTP | Inclusão de leitura individual, criação e edição de oportunidades e vendas, além da carga de clientes |
| Base de dependências | Novo hook para carregar operadores, partners, clientes, catálogos, oportunidades e regras comerciais de forma coordenada |
| Persistência local | Novo hook de rascunho persistido por escopo em local storage, com isolamento por formulário |
| UI de formulários | Componentes reutilizáveis para campos, grids, ações e mensagens de retorno |
| Oportunidades | Formulário completo de criação e edição, com vínculo entre operadora e catálogo e manutenção das ações rápidas de pipeline |
| Vendas | Formulário completo de criação e edição, com coerência entre oportunidade, operadora, produto e regra comercial |
| Detalhes operacionais | Novas rotas dinâmicas `/oportunidades/[id]` e `/vendas/[id]` com leitura aprofundada e ações rápidas |
| Validação | Build do frontend concluído com sucesso, sem erros e sem avisos de hooks ao final da iteração |

## Base compartilhada introduzida para transações

Para sustentar a nova camada transacional, foi consolidada uma infraestrutura front-end comum, de modo que criação, edição e leitura detalhada não dependam de lógica isolada em cada página. O objetivo foi preparar um padrão replicável para os próximos módulos, especialmente financeiro e onboarding avançado.

| Arquivo | Papel na arquitetura |
| --- | --- |
| `apps/web/src/lib/use-persisted-draft.ts` | Persistência de rascunhos em local storage com isolamento por formulário e escopo de módulo |
| `apps/web/src/components/transaction-form-ui.tsx` | Biblioteca compartilhada de campos, grids, ações e mensagens para fluxos transacionais |
| `apps/web/src/lib/use-transaction-dependencies.ts` | Carregamento e derivação de opções relacionais reais para formulários de oportunidades e vendas |
| `apps/web/src/lib/api.ts` | Mutações completas de create/update e leituras individuais de oportunidades e vendas |
| `apps/web/src/lib/use-expandai-data.ts` | Ampliação da carga compartilhada para incluir clientes e regras comerciais necessárias aos formulários |

## Formulário transacional de oportunidades

A rota de oportunidades deixou de ser apenas uma superfície de consulta e progressão de estágio. Ela agora contém um formulário autenticado capaz de **criar** e **editar** oportunidades diretamente contra a API real. O formulário reutiliza os vínculos já disponíveis no backend — como operadora, partner, cliente e produto de catálogo — e mantém um rascunho persistido localmente enquanto o usuário trabalha.

A coerência relacional foi tratada de forma simples, porém efetiva. O catálogo de produtos disponível no formulário é filtrado pela operadora selecionada, reduzindo a chance de combinações inválidas antes mesmo do envio. Ainda assim, o backend permanece como fonte final de validação, preservando consistência da regra de negócio.

| Campo principal | Comportamento implementado |
| --- | --- |
| Operadora | Obrigatória |
| Partner | Opcional |
| Cliente | Opcional |
| Produto | Filtrado pela operadora escolhida |
| Origem | Seleção estruturada de origem comercial |
| Valor estimado | Conversão para número antes do envio |
| Fechamento esperado | Conversão para formato temporal aceito pela API |
| Título e descrição | Persistidos no rascunho local até submissão ou limpeza manual |

## Formulário transacional de vendas

A rota de vendas passou a suportar um fluxo mais sofisticado do que o de oportunidades, porque a própria regra do backend é mais densa. O formulário de venda agora permite **criar** e **editar** registros levando em conta oportunidade de origem, operadora, partner, cliente, produto e regra comercial. Além disso, a seleção de oportunidade pode pré-preencher parte do contexto relacional do formulário, acelerando a operação e reduzindo risco de inconsistência.

Outro ponto importante é o vínculo entre produto e regra comercial. A lista de regras disponíveis é refinada com base na operadora e no produto selecionados, refletindo o comportamento esperado do backend e preparando a experiência para o ciclo completo de venda, faturamento e split.

| Campo principal | Comportamento implementado |
| --- | --- |
| Oportunidade | Opcional, com pré-preenchimento de contexto relacional |
| Operadora | Obrigatória |
| Produto | Filtrado pela operadora |
| Regra comercial | Filtrada por operadora e produto |
| Valor bruto | Obrigatório e validado como número |
| Valor líquido | Opcional |
| Referência externa | Opcional, para rastreabilidade operacional |
| Título e descrição | Editáveis e persistidos localmente enquanto o rascunho existir |

## Páginas de detalhe operacional

Além dos formulários, este checkpoint introduziu as primeiras páginas de detalhe operacional dedicadas. As rotas `/oportunidades/[id]` e `/vendas/[id]` aprofundam a leitura de cada registro e reúnem, em um único lugar, contexto relacional, métricas principais e ações rápidas coerentes com o módulo.

No caso das oportunidades, a página de detalhe concentra o resumo do registro e a progressão do pipeline por estágio, incluindo marcação como ganha ou perdida. No caso das vendas, a página de detalhe organiza a leitura do fechamento, do billing record e do split status, além de permitir atualização de status e sincronização com faturamento.

| Rota | Função operacional |
| --- | --- |
| `/oportunidades/[id]` | Leitura aprofundada do pipeline e ações rápidas de progressão |
| `/vendas/[id]` | Leitura aprofundada do fechamento e reconciliação com faturamento |

## Impacto de produto e engenharia

Do ponto de vista de produto, a camada web passa a se aproximar do comportamento esperado de um sistema operacional comercial de uso diário. O usuário agora não apenas observa e refina dados, mas também consegue **cadastrar**, **editar** e **aprofundar** registros relevantes diretamente pela interface.

Do ponto de vista de engenharia, o checkpoint é importante porque consolida três pilares reutilizáveis para o restante do projeto. O primeiro é a base de formulários com persistência local isolada. O segundo é a infraestrutura de dependências relacionais, que já sabe preparar opções coerentes com o contexto do backend. O terceiro é o padrão de páginas de detalhe operacional, que pode ser replicado para financeiro, catálogo e demais entidades do ecossistema.

## Limitações conhecidas ao final do checkpoint

Apesar do avanço, a camada web ainda não cobre todos os fluxos de backoffice do projeto. Os formulários atuais atacam os módulos mais maduros do backend, mas ainda não contemplam, por exemplo, criação completa de regras comerciais, billing records ou rotinas de onboarding administrativo dentro da nova experiência modular.

| Tema | Situação atual |
| --- | --- |
| Criação e edição de oportunidades | Implementadas |
| Criação e edição de vendas | Implementadas |
| Páginas de detalhe de oportunidades e vendas | Implementadas |
| Formulários do módulo financeiro | Ainda não implementados |
| Páginas de detalhe de operadoras, partners e catálogo | Ainda não implementadas |
| Publicação da camada web em ambiente acessível | Ainda pendente |

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Estender a mesma infraestrutura para o módulo financeiro, começando por billing records e regras comerciais |
| 2 | Adicionar páginas de detalhe e edição para operadoras, partners e catálogo |
| 3 | Incluir navegação contextual entre detalhe, edição e histórico por entidade |
| 4 | Publicar a camada web em ambiente acessível para validação integrada com a API já publicada |
| 5 | Introduzir feedbacks mais ricos de validação de campo e mensagens de erro traduzidas por cenário de negócio |

## Conclusão

A ExpandAI agora possui uma camada web significativamente mais madura. O frontend já oferece **formulários transacionais reais** para oportunidades e vendas, **rascunho persistido em local storage**, **dependências relacionais carregadas da API**, **rotas de detalhe operacional** e continuidade entre leitura, edição e ação. Esse checkpoint fecha uma etapa importante da evolução do produto: a aplicação web deixa de ser apenas uma casca operacional e se torna, de fato, um ponto inicial viável para operação comercial assistida pela interface.
