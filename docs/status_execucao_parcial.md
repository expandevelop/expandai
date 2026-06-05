# Status de Execução Parcial - ExpandAI

A ExpandAI já saiu da fase exclusivamente conceitual e entrou em execução técnica real, com uma primeira base funcional operando em infraestrutura ativa.

## Situação atual do projeto

| Frente | Status | Observação |
| --- | --- | --- |
| Infraestrutura EC2 | Ativa | Instância acessível por SSH e preparada para backend |
| Nginx | Configurado | Atuando como reverse proxy na porta 80 |
| Runtime Node.js | Ativo | Node.js, pnpm e PM2 instalados na instância |
| Backend NestJS | Publicado | Primeira versão funcional em execução |
| Frontend Next.js | Scaffold criado | Preparado para evolução local e futura publicação |
| Mobile Flutter | Estrutura inicial criada | Arquitetura contract-first preparada |
| Amplify | Adiado | Publicação web será feita em etapa posterior |

## Endpoints já operacionais em ambiente ativo

| Método | Endpoint público | Finalidade |
| --- | --- | --- |
| `GET` | `http://34.238.172.151/api/v1/users/me` | Validar perfil inicial de usuário |
| `POST` | `http://34.238.172.151/api/v1/auth/login` | Validar contrato inicial de autenticação |
| `POST` | `http://34.238.172.151/api/v1/auth/refresh` | Renovação mockada de sessão |
| `POST` | `http://34.238.172.151/api/v1/auth/logout` | Encerramento mockado de sessão |
| `POST` | `http://34.238.172.151/api/v1/onboarding/operators` | Início mockado do onboarding de operadora |
| `POST` | `http://34.238.172.151/api/v1/onboarding/partners` | Início mockado do onboarding de partner |

## Estrutura técnica já estabelecida

A solução foi organizada em monorepo, com separação entre `apps/api`, `apps/web`, `apps/mobile`, pacotes compartilhados e documentação técnica. No backend, já existe bootstrap com CORS, prefixo global `/api`, versionamento por URI e validação global. A execução no servidor está sob gerenciamento do PM2, o que permite controle operacional e reinicialização do processo da API.

## Decisões técnicas assumidas nesta etapa

| Decisão | Motivo |
| --- | --- |
| Adiar Amplify | Evitar travar o avanço da solução por dependência de publicação web |
| Iniciar backend com mocks | Estabilizar contratos da API antes das integrações externas reais |
| Publicar API cedo na EC2 | Validar infraestrutura real desde o início |
| Separar mobile em contract-first | Permitir avanço arquitetural sem bloquear pelo SDK neste instante |

## Próximos passos imediatos

| Ordem | Próximo passo |
| --- | --- |
| 1 | Estruturar testes automatizados mínimos da API |
| 2 | Formalizar documentação dos contratos de módulos já publicados |
| 3 | Preparar base de pipeline para build e deploy rastreável |
| 4 | Evoluir autenticação mockada para autenticação persistente com banco |
| 5 | Iniciar modelagem dos domínios de operadora, partner e cliente |

Este documento representa o primeiro pacote de handover parcial da execução da ExpandAI.
