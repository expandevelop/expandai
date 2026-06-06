# Checkpoint 12 — Operadoras e Partners com Onboarding Web Administrativo e Páginas de Detalhe

## Resumo executivo

Neste checkpoint, a ExpandAI levou adiante a evolução dos **módulos mestres** depois da consolidação do catálogo. As rotas de **operadoras** e **partners**, que antes funcionavam apenas como visões de leitura simples, passaram a oferecer uma experiência mais madura, com dois avanços centrais: **onboarding administrativo autenticado** e **páginas de detalhe operacional por entidade**.

A camada web agora consegue consumir o fluxo real já existente no backend para criação de operadoras e partners, respeitando a restrição de perfil administrativo. Ao mesmo tempo, as entidades já existentes ganharam páginas de detalhe capazes de expor contexto cadastral, conta vinculada, histórico de onboarding e, no caso das operadoras, também o portfólio de produtos associados.

## Escopo entregue nesta etapa

| Frente | Entrega concluída |
| --- | --- |
| Tipos compartilhados | Ampliação de contratos para suportar `LinkedUser`, `OnboardingRecord`, detalhe de operadora e detalhe de partner |
| Cliente HTTP | Inclusão de `fetchOperatorById`, `fetchPartnerById`, `createOperatorOnboarding` e `createPartnerOnboarding` |
| Operadoras | Evolução da rota `/operadoras` com formulário de onboarding para admin e navegação para detalhe |
| Detalhe de operadora | Nova rota `/operadoras/[id]` com visão aprofundada da entidade, usuário vinculado, onboardings e catálogos |
| Partners | Evolução da rota `/partners` com formulário de onboarding para admin e navegação para detalhe |
| Detalhe de partner | Nova rota `/partners/[id]` com visão aprofundada da entidade e histórico de onboarding |
| Componentes reutilizáveis | Ajuste do `TextField` para aceitar campos de senha nos formulários administrativos |
| Validação | Build do frontend concluído com sucesso após a etapa |

## Evolução dos contratos do frontend

Para suportar as novas páginas de detalhe e os fluxos administrativos de onboarding, a tipagem compartilhada da camada web foi enriquecida. O frontend passou a representar explicitamente o vínculo com o usuário da plataforma e os registros de onboarding associados às entidades mestres.

| Tipo novo ou ampliado | Finalidade |
| --- | --- |
| `LinkedUser` | Representar a conta autenticável associada à entidade mestre |
| `OnboardingRecord` | Representar o histórico administrativo de onboarding |
| `Operator` | Ampliado com `user`, `productCatalogs`, `onboardings`, `email`, `phone` e `commissionModel` |
| `Partner` | Ampliado com `user`, `onboardings` e `score` |
| `OperatorOnboardingPayload` | Contrato do fluxo administrativo de criação de operadora |
| `PartnerOnboardingPayload` | Contrato do fluxo administrativo de criação de partner |

## Evolução do cliente HTTP compartilhado

O cliente compartilhado da camada web foi atualizado para cobrir o backend real dos módulos mestres, que até então estava acessível apenas por leitura simples nas listagens.

| Operação adicionada | Finalidade |
| --- | --- |
| `fetchOperatorById` | Buscar detalhe individual de operadora |
| `createOperatorOnboarding` | Iniciar o onboarding administrativo real de operadora |
| `fetchPartnerById` | Buscar detalhe individual de partner |
| `createPartnerOnboarding` | Iniciar o onboarding administrativo real de partner |

Essas operações reutilizam a infraestrutura já existente de autenticação, renovação de sessão e retry autenticado, preservando consistência com o restante da aplicação.

## Evolução da rota `/operadoras`

A visão de operadoras foi reescrita para deixar de ser apenas uma tabela estática. A nova versão combina **métricas operacionais**, **listagem contextual** e, quando o perfil autenticado é **Admin**, também um **formulário de onboarding** conectado ao backend real.

Esse formulário inicia o fluxo administrativo já implementado na API, responsável por criar o usuário, a entidade operadora e o registro inicial de onboarding. O rascunho é persistido em `local storage`, mantendo o padrão já adotado nos módulos transacionais anteriores.

| Recurso novo em operadoras | Comportamento |
| --- | --- |
| Onboarding administrativo | Disponível apenas para `ADMIN`, com company name, documento, e-mail, telefone e senha inicial |
| Leitura operacional enriquecida | Cada item agora exibe dados cadastrais e contexto mais útil para acompanhamento |
| Navegação contextual | Cada operadora possui atalho para sua página de detalhe |

## Nova página `/operadoras/[id]`

A página de detalhe da operadora consolida a leitura aprofundada da entidade. Ela expõe dados cadastrais, vínculo com a conta de usuário, histórico de onboardings e o conjunto de catálogos já associados à operadora.

Isso transforma o módulo em uma superfície efetivamente operacional: o usuário deixa de ver apenas uma lista e passa a conseguir investigar cada entidade com mais profundidade antes de qualquer ação administrativa futura.

| Bloco do detalhe de operadora | Conteúdo |
| --- | --- |
| Métricas | Status, quantidade de catálogos e número de onboardings |
| Cadastro principal | Documento, e-mail, telefone, datas e modelo de comissão |
| Conta vinculada | Nome, e-mail, role e status do usuário associado |
| Produtos publicados | Lista dos catálogos vinculados à operadora |
| Histórico de onboarding | Estados administrativos registrados no backend |

## Evolução da rota `/partners`

O módulo de partners recebeu a mesma direção arquitetural aplicada a operadoras. A página principal agora reúne **métricas**, **listagem operacional**, **navegação de detalhe** e, para `ADMIN`, um **formulário autenticado de onboarding** ligado ao backend real.

Esse fluxo respeita a modelagem atual da API, onde a criação de partner não acontece por CRUD genérico do módulo, mas sim por um fluxo administrativo específico de onboarding.

| Recurso novo em partners | Comportamento |
| --- | --- |
| Onboarding administrativo | Disponível apenas para `ADMIN`, com empresa, documento, e-mail, contato principal e senha inicial |
| Leitura operacional enriquecida | A listagem passou a exibir documento, score, nível e atalho para detalhe |
| Navegação contextual | Cada partner agora possui rota de detalhe dedicada |

## Nova página `/partners/[id]`

A página de detalhe do partner segue o padrão visual e técnico já consolidado no restante do projeto. Ela concentra as informações cadastrais da entidade, o vínculo com a conta autenticável e o histórico de onboardings associados.

Mesmo sem um CRUD completo no backend do módulo, essa página já amplia bastante a capacidade operacional da camada web ao permitir inspeção contextual e validação administrativa das entidades existentes.

| Bloco do detalhe de partner | Conteúdo |
| --- | --- |
| Métricas | Status, nível e quantidade de onboardings |
| Cadastro principal | Documento, score, nível e datas |
| Conta vinculada | Nome, e-mail, role e status do usuário associado |
| Histórico de onboarding | Estados administrativos registrados para o partner |

## Ajuste em componente reutilizável

Durante a validação do build, foi identificado que o componente compartilhado `TextField` não aceitava o tipo `password`. Como os novos formulários administrativos exigem captura de senha inicial, foi necessário ampliar o contrato do componente para suportar esse tipo de campo.

Esse ajuste tem caráter estrutural, porque viabiliza novos fluxos administrativos futuros sem necessidade de duplicação de inputs específicos para senha.

## Impacto de produto e arquitetura

Este checkpoint é importante porque aproxima a camada web do modelo real de governança do backend. Operadoras e partners não foram tratados como CRUDs artificiais; em vez disso, a interface passou a respeitar o desenho já estabelecido na API, onde a criação dessas entidades acontece por **onboarding administrativo**.

Isso reduz desalinhamento arquitetural entre frontend e backend e prepara o sistema para uma operação mais fiel ao fluxo real de entrada de novos participantes no ecossistema.

Além disso, a introdução de páginas de detalhe nos módulos mestres melhora a observabilidade operacional e cria uma base consistente para futuras evoluções, como edição assistida, gestão de documentos, evolução de status e acompanhamento mais rico do onboarding.

## Situação ao final do checkpoint

| Tema | Situação atual |
| --- | --- |
| Catálogo com CRUD web completo | Implementado |
| Operadoras com onboarding web administrativo | Implementado |
| Operadoras com detalhe operacional | Implementado |
| Partners com onboarding web administrativo | Implementado |
| Partners com detalhe operacional | Implementado |
| Clientes com fluxo dedicado na web | Ainda pendente |
| Edição administrativa de operadoras/partners | Ainda não implementada |
| Publicação da camada web | Ainda pendente |

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Decidir o fechamento do módulo de clientes como visão dedicada ou integrá-lo em uma etapa final de módulos mestres |
| 2 | Retomar o módulo financeiro para edição estruturada e vínculos operacionais mais robustos |
| 3 | Publicar a camada web em ambiente acessível e validar o sistema ponta a ponta |
| 4 | Executar hardening final de sessão, permissões e fluxos integrados |

## Conclusão

A ExpandAI agora possui **operadoras e partners em estágio operacional significativamente mais maduro na camada web**. Os módulos deixaram de ser apenas listagens e passaram a oferecer **onboarding administrativo autenticado**, **detalhe contextual por entidade** e melhor rastreabilidade do vínculo entre conta, entidade de negócio e histórico administrativo. Esse checkpoint fecha mais um bloco importante da jornada até o MVP operacional completo.
