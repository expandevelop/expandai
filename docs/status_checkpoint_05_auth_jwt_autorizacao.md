# Checkpoint 05 — Autenticação JWT, Autorização por Perfil e Publicação em EC2

## Resumo executivo

Neste checkpoint, a ExpandAI saiu de uma autenticação puramente **mockada** para uma camada real de **autenticação baseada em JWT**, com verificação de credenciais no banco, proteção global de rotas, controle de acesso por perfil e publicação validada no ambiente produtivo atual da **EC2**. A alteração fecha uma lacuna estrutural importante do backend e cria a base necessária para a próxima etapa de integração da camada **web** com sessões reais, navegação por perfil e consumo autenticado da API.

A entrega foi concluída em duas frentes complementares. Na primeira, o backend local recebeu a reestruturação de autenticação, autorização e adequação do fluxo de provisionamento de usuários. Na segunda, o checkpoint foi publicado na instância **EC2** já utilizada pela plataforma, com reinstalação de dependências, rebuild, reinício controlado do processo no **PM2** e validação funcional sobre a API exposta em `http://34.238.172.151/api/v1`.

## Escopo funcional entregue

| Frente | Entrega concluída |
| --- | --- |
| Autenticação | Substituição do `AuthService` mockado por login real com busca no banco e emissão de **access token** e **refresh token** |
| Segurança de credenciais | Verificação de senha com **bcrypt** e persistência de `passwordHash` para novos usuários provisionados pelo onboarding |
| Sessão | Implementação de renovação de sessão via endpoint `POST /api/v1/auth/refresh` |
| Autorização | Introdução de proteção global com `JwtAuthGuard` e `RolesGuard` |
| Decorators | Criação de `@Public()`, `@Roles()` e `@CurrentUser()` para tornar a camada de segurança reutilizável |
| Usuário autenticado | Adequação do `UsersService.findMe()` para operar com o usuário real da sessão JWT |
| Onboarding | Inclusão de senha nos DTOs de onboarding e hash persistido no momento da criação de usuários |
| Publicação | Deploy do checkpoint na **EC2**, rebuild do backend e reinício do processo `expandai-api` |
| Validação | Testes reais de login, refresh, acesso autenticado e bloqueio por perfil realizados na API publicada |

## Principais mudanças técnicas aplicadas

A camada de autenticação agora consulta o modelo **User** no PostgreSQL e valida a credencial por meio de `bcrypt.compare`. Quando a autenticação é bem-sucedida, a API emite um **JWT de acesso** contendo `sub`, `email`, `role` e `ecosystemProfile`, além de um **refresh token** separado para renovação de sessão. A lógica considera os segredos já existentes no ambiente (`JWT_SECRET` e `JWT_REFRESH_SECRET`) e mantém compatibilidade com chaves nomeadas especificamente para access e refresh token, caso o ambiente evolua posteriormente.

A autorização deixou de ser apenas documental no Swagger e passou a ser executada em runtime. O `JwtAuthGuard` foi registrado globalmente e passou a exigir autenticação em toda a API, exceto nos endpoints explicitamente marcados como públicos. Em seguida, o `RolesGuard` passou a validar o papel do usuário autenticado sempre que um controller ou rota define regras de acesso por meio do decorator `@Roles()`.

## Módulos e arquivos impactados

| Área | Arquivos principais impactados | Objetivo da alteração |
| --- | --- | --- |
| Núcleo da segurança | `apps/api/src/modules/auth/auth.service.ts`, `auth.controller.ts`, `auth.module.ts` | Reescrever autenticação, refresh e wiring do JWT |
| Estratégia e guards | `apps/api/src/modules/auth/strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`, `guards/roles.guard.ts` | Validar tokens e aplicar proteção global |
| Decorators | `apps/api/src/modules/auth/decorators/public.decorator.ts`, `roles.decorator.ts`, `current-user.decorator.ts` | Simplificar uso de autenticação e autorização nos controllers |
| Usuários | `apps/api/src/modules/users/users.controller.ts`, `users.service.ts` | Passar a operar com o usuário da sessão e restringir endpoint administrativo |
| Onboarding | `apps/api/src/modules/onboarding/dto/create-operator-onboarding.dto.ts`, `create-partner-onboarding.dto.ts`, `onboarding.service.ts`, `onboarding.controller.ts` | Garantir que novos usuários nasçam com senha hasheada e acesso compatível |
| Domínios protegidos | Controllers de `finance`, `opportunities`, `sales`, `product-catalogs`, `operators`, `partners`, `clients` | Aplicar restrições por perfil nos módulos operacionais |
| Suporte operacional | `apps/api/scripts/bootstrap-auth-users.js`, `apps/api/scripts/audit-auth-users.js` | Auditar usuários e bootstrapar credenciais em ambiente com banco acessível |
| Dependências | `apps/api/package.json`, `pnpm-lock.yaml` | Adicionar `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` e tipagens auxiliares |

## Matriz de autorização aplicada nesta etapa

A política desta entrega é **coarse-grained**, isto é, feita no nível de controller e de rotas estratégicas, sem ainda introduzir filtros finos por ownership de registro. O objetivo imediato foi bloquear acesso entre perfis e preparar a base para evoluções posteriores de escopo por entidade.

| Módulo / rota | Perfis autorizados |
| --- | --- |
| `POST /api/v1/auth/login` | Público |
| `POST /api/v1/auth/refresh` | Público |
| `POST /api/v1/auth/logout` | Usuário autenticado |
| `GET /api/v1/users/me` | `ADMIN`, `OPERATOR`, `PARTNER`, `CLIENT` |
| `GET /api/v1/users/roles` | `ADMIN` |
| `POST /api/v1/onboarding/*` | `ADMIN` |
| `GET /api/v1/operators/*` | `ADMIN`, `OPERATOR` |
| `GET /api/v1/partners/*` | `ADMIN`, `OPERATOR`, `PARTNER` |
| `GET /api/v1/clients/*` | `ADMIN`, `OPERATOR`, `PARTNER`, `CLIENT` |
| `GET/POST/PATCH/DELETE /api/v1/product-catalogs/*` | `ADMIN`, `OPERATOR`, `PARTNER` |
| `GET/POST/PATCH /api/v1/finance/*` | `ADMIN`, `OPERATOR` |
| `GET/POST/PATCH/DELETE /api/v1/opportunities/*` | `ADMIN`, `OPERATOR`, `PARTNER` |
| `GET/POST/PATCH/DELETE /api/v1/sales/*` | `ADMIN`, `OPERATOR`, `PARTNER` |

## Adequação do onboarding ao novo modelo de autenticação

Antes deste checkpoint, os usuários criados pelos fluxos de onboarding eram persistidos sem `passwordHash`, o que impedia o uso da autenticação real assim que o mock fosse removido. Esse desalinhamento foi corrigido por meio da inclusão de `password` nos DTOs de onboarding de operadora e partner, seguida do hash com `bcrypt` no momento da criação do usuário. Com isso, **novos cadastros** passam a nascer aptos para login.

Como já existiam registros anteriores no banco sem senha persistida, foi necessário realizar uma etapa controlada de **bootstrap operacional** na EC2, onde há conectividade com o **RDS**. Essa etapa criou um usuário administrativo inicial e preencheu `passwordHash` para usuários legados que ainda não possuíam credencial.

## Publicação executada na EC2

A publicação do checkpoint foi realizada diretamente na instância **EC2** que já hospeda o backend da ExpandAI. O processo incluiu backup rápido do diretório anterior, transferência de um pacote enxuto do monorepo, reinstalação de dependências com `pnpm`, recompilação da API e reinício do processo `expandai-api` via **PM2**.

| Item operacional | Resultado |
| --- | --- |
| Host ativo | `34.238.172.151` |
| Caminho da aplicação | `/var/www/expandai/apps/api` |
| Processo PM2 | `expandai-api` reiniciado com sucesso |
| Rebuild remoto | Concluído com `pnpm build` |
| API pública | Mantida em `http://34.238.172.151/api/v1` |
| Swagger | Mantido em `http://34.238.172.151/api/docs` |

## Bootstrap de credenciais realizado

Foi criada uma rotina de bootstrap para destravar a validação do checkpoint em um ambiente que já possuía usuários legados sem senha. Essa ação teve caráter estritamente operacional para permitir testes reais da nova camada de segurança e deverá ser substituída, em etapa posterior, por uma política formal de ativação de conta, redefinição de senha ou convite transacional.

| Elemento | Resultado observado |
| --- | --- |
| Admin inicial criado | `admin@expandai.com` |
| Perfil do admin | `ADMIN` com `ecosystemProfile = admin` |
| Usuários legados com hash preenchido | 2 registros |
| Senha temporária aplicada | `Expand@123` |
| Ação recomendada | Rotacionar a senha temporária e substituir o bootstrap por fluxo formal de credenciais |

## Validação funcional executada na API publicada

A validação do checkpoint foi realizada contra a **API pública** já servida pela EC2, usando o banco real alcançado pelo host de produção. O sandbox principal não alcança o **RDS** diretamente, razão pela qual a auditoria de usuários e o bootstrap de credenciais foram executados na própria EC2.

| Cenário validado | Resultado |
| --- | --- |
| Login com admin bootstrapado | Concluído |
| Emissão de `accessToken` | Concluída |
| Emissão de `refreshToken` | Concluída |
| `GET /api/v1/users/me` com Bearer Token | `200 OK` |
| `POST /api/v1/auth/refresh` com refresh token válido | Concluído |
| Acesso de `OPERATOR` ao endpoint administrativo `GET /api/v1/users/roles` | `403 Forbidden` |

### Evidências principais observadas

| Evidência | Valor observado |
| --- | --- |
| Usuário administrativo criado | `admin@expandai.com` |
| Identificador do admin | `cmq1a8d6g0000qjol68ux8tt4` |
| Usuário autenticado retornado por `/users/me` | `Administrador ExpandAI` |
| Perfis legados ajustados com senha temporária | `operadora.persistente@expandai.com`, `partner.persistente@expandai.com` |
| Endpoint administrativo bloqueado para operador | `403 Forbidden` |

## Limitações conhecidas após este checkpoint

A autorização implementada nesta etapa ainda não é **row-level**. Em outras palavras, o papel do usuário já define se ele pode ou não entrar em determinado módulo, porém a API ainda não restringe automaticamente o acesso apenas aos registros pertencentes à sua própria operadora, partner ou carteira de clientes. Esse refinamento deverá ser feito na próxima evolução de segurança, principalmente para `OPERATOR`, `PARTNER` e `CLIENT`.

Também permanece como pendência a formalização de um fluxo sustentável de ciclo de vida de credenciais. O bootstrap operacional resolve o problema imediato de validação e continuidade do projeto, mas o desenho definitivo ainda deve contemplar políticas como criação de senha inicial, convite, reset de senha, rotação e eventual expiração de credenciais temporárias.

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Introduzir escopo por entidade no backend, restringindo `OPERATOR`, `PARTNER` e `CLIENT` aos seus próprios registros |
| 2 | Criar fluxo formal de ativação e redefinição de senha, substituindo o bootstrap temporário |
| 3 | Propagar o Bearer Token para a camada **Next.js**, com tela de login, sessão persistida e navegação por perfil |
| 4 | Aplicar anotações de segurança e exemplos autenticados também no Swagger para acelerar handover e QA |
| 5 | Versionar e publicar este checkpoint no GitHub com a documentação viva junto ao código |

## Conclusão

A ExpandAI agora possui uma **camada real de autenticação e autorização** em seu backend principal. A plataforma deixou de depender de respostas simuladas e passou a operar com **usuários persistidos**, **senhas hasheadas**, **tokens JWT válidos**, **renovação de sessão** e **restrição de acesso por perfil**. Com isso, o projeto atinge um novo nível de prontidão para a integração da camada web, para fluxos de QA mais realistas e para o handover progressivo a uma equipe de desenvolvimento tradicional.
