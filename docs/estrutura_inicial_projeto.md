# Estrutura Inicial do Projeto - ExpandAI

A fase inicial de estruturação técnica da ExpandAI já foi iniciada com uma organização de projeto voltada para escalabilidade, manutenção e handover futuro para um time tradicional de engenharia.

## Organização adotada

| Camada | Diretório | Tecnologia-base | Objetivo |
| --- | --- | --- | --- |
| Backend | `apps/api` | NestJS | Centralizar regras de negócio, autenticação, integrações e APIs |
| Frontend Web | `apps/web` | Next.js | Entregar a plataforma web para operação administrativa e uso dos perfis do ecossistema |
| Mobile | `apps/mobile` | Flutter (estrutura inicial) | Preparar o app dos perfis móveis com arquitetura modular |
| Pacotes compartilhados | `packages/*` | TypeScript | Reunir tipos, padrões de lint e configurações reutilizáveis |
| Infraestrutura | `infra` | IaC/Deploy | Concentrar scripts, provisionamento e configuração operacional |
| Documentação | `docs` | Markdown | Manter documentação viva, rastreável e versionada |

## Princípios já aplicados

A estrutura foi iniciada em formato de **monorepo**, o que permite centralizar padrões, compartilhamento de contratos entre frontend e backend, versionamento unificado e pipelines de qualidade mais previsíveis. Essa decisão reduz dispersão técnica e facilita a evolução coordenada entre API, web e mobile.

No backend, o esqueleto NestJS já foi criado para servir como base da API principal da plataforma. No frontend, o projeto Next.js já foi gerado para receber os módulos da operação web. No mobile, a estrutura foi iniciada em modo **contract-first**, preservando a arquitetura de funcionalidades e navegação antes da instalação completa do SDK e da implementação visual detalhada.

## Próximo passo técnico

O próximo movimento é organizar o backend por domínios de negócio, iniciando pela fundação dos módulos centrais da Sprint 1 e Sprint 2, especialmente autenticação, usuários, onboarding e governança estrutural da plataforma.

## Resultado prático desta etapa

| Entrega | Status |
| --- | --- |
| Base da EC2 preparada para deploy | Concluído |
| Monorepo inicial criado | Concluído |
| Scaffold NestJS criado | Concluído |
| Scaffold Next.js criado | Concluído |
| Estrutura inicial mobile preparada | Concluído |
| Documentação técnica viva iniciada | Concluído |

Este documento marca a transição efetiva entre a fase de planejamento e a fase de construção técnica da ExpandAI.
