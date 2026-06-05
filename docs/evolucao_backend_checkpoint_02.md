# Evolução do Backend - Checkpoint 02

A segunda evolução da base técnica da ExpandAI consolidou a transição do backend de um esqueleto inicial para uma fundação mais próxima de uma arquitetura sustentável de produção. O foco desta etapa foi preparar a camada persistente, estabilizar contratos tipados e abrir os domínios centrais do ecossistema.

## O que foi incorporado neste ciclo

| Frente | Evolução implementada | Resultado prático |
| --- | --- | --- |
| Configuração | `ConfigModule` global | Preparação para variáveis de ambiente e ambientes distintos |
| Persistência | Prisma introduzido com schema PostgreSQL | Base pronta para conexão posterior com banco persistente |
| Documentação de API | Swagger habilitado em `/api/docs` | Contratos podem ser inspecionados de forma navegável |
| Domínios centrais | `operators`, `partners` e `clients` gerados | Estrutura do ecossistema aberta no backend |
| Contratos tipados | DTOs de autenticação e onboarding | Requisições passam a seguir estrutura validada |
| Qualidade | Build e testes validados | Evolução controlada sem regressão imediata |

## Modelagem inicial definida

A modelagem Prisma foi criada para refletir os atores e estados essenciais da plataforma neste estágio. Os modelos centrais definidos foram `User`, `Operator`, `Partner`, `Client`, `Onboarding` e `ProductCatalog`. Além disso, foram estabelecidos enums para papéis de usuário, status operacionais e estados do fluxo de onboarding.

Essa decisão permite que a ExpandAI continue evoluindo em cima de um núcleo consistente, sem acoplamento prematuro às integrações externas que ainda serão incorporadas nas próximas sprints.

## Módulos e contratos já disponíveis

| Tipo | Rotas já disponíveis |
| --- | --- |
| Auth | `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout` |
| Users | `/api/v1/users/me`, `/api/v1/users/roles` |
| Onboarding | `/api/v1/onboarding/operators`, `/api/v1/onboarding/partners` |
| Operators | `/api/v1/operators`, `/api/v1/operators/:id` |
| Partners | `/api/v1/partners`, `/api/v1/partners/:id` |
| Clients | `/api/v1/clients`, `/api/v1/clients/:id` |
| Swagger | `/api/docs` |

## Leitura arquitetural

Neste ponto, a ExpandAI já possui quatro pilares importantes ao mesmo tempo: uma API executável, uma camada de documentação navegável, uma modelagem inicial de persistência e a estrutura funcional dos domínios nucleares do ecossistema. Isso reduz o risco de retrabalho porque o avanço das próximas etapas poderá acontecer sobre contratos explícitos, com menor dependência de interpretação verbal.

## Próximo salto técnico recomendado

| Ordem | Próximo movimento |
| --- | --- |
| 1 | Evoluir autenticação mockada para autenticação persistente com usuário e senha |
| 2 | Conectar Prisma a um PostgreSQL real assim que o RDS estiver disponível |
| 3 | Criar DTOs e regras de escrita para operadores, partners e clientes |
| 4 | Introduzir catálogo de produtos, regras de comissão e relacionamentos comerciais |
| 5 | Iniciar o módulo financeiro e de split com base nessa modelagem |

Este documento representa o segundo checkpoint técnico do backend da ExpandAI.
