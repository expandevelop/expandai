# Checkpoint 17 — Fechamento operacional final do deploy do MVP

## Visão geral

Este checkpoint conclui a última pendência operacional aberta do **MVP da ExpandAI**. O frontend publicado em `http://34.73.25.196:3000` estava fora de operação e respondia externamente com **Empty reply from server**, apesar de a build remota já conter a rota `/clientes` em seu manifesto interno. A investigação final confirmou que o problema não estava no código da aplicação, mas na **build efetivamente consumida pelo processo de produção**.

Ao acessar diretamente o host publicado, foi possível verificar que o serviço `expandai-web.service` existia e estava configurado corretamente para subir o Next.js em produção. Entretanto, o processo entrava em ciclo de falha automática porque o diretório `.next` não possuía o arquivo `BUILD_ID`, condição que impedia o `next start` de localizar uma build de produção válida.

## Diagnóstico consolidado

| Item | Evidência observada | Conclusão |
| --- | --- | --- |
| Serviço `expandai-web` | Unidade `systemd` existente, habilitada e em `auto-restart` | O mecanismo de publicação persistente estava configurado |
| Runtime do serviço | `pnpm start --hostname 0.0.0.0 --port 3000` | A inicialização da camada web seguia o padrão esperado |
| Logs do serviço | erro indicando ausência de build de produção em `.next` | A falha estava na build consumida pelo processo |
| Estrutura `.next` | manifesto e artefatos presentes, porém sem `BUILD_ID` | A build estava inconsistente/incompleta para execução em produção |
| Código publicado | rota `/clientes` existente na build recompilada | O módulo de clientes já estava corretamente entregue no código |

## Correção aplicada

A recuperação operacional foi executada diretamente no host persistente com uma sequência controlada: parada do serviço `expandai-web`, remoção da build inconsistente, nova execução de `pnpm build` no diretório `/home/ubuntu/expandai/apps/web`, confirmação do arquivo `.next/BUILD_ID` e reinicialização do serviço `systemd`.

Após a reconstrução, o Next.js gerou novamente a malha completa de rotas do aplicativo, incluindo `/clientes` e `/clientes/[id]`. Em seguida, o serviço `expandai-web` voltou ao estado **active (running)**, com bind em `0.0.0.0:3000`, restaurando o frontend persistente do MVP.

## Validação final executada

A validação final foi feita em duas camadas complementares: verificação HTTP pública do frontend publicado e smoke test autenticado do MVP contra a API pública.

| Verificação | Resultado |
| --- | --- |
| `GET http://34.73.25.196:3000/` | `200 OK` |
| `GET http://34.73.25.196:3000/clientes` | `200 OK` |
| `GET /catalogo` no frontend publicado | `200` |
| `GET /oportunidades` no frontend publicado | `200` |
| `GET /vendas` no frontend publicado | `200` |
| `GET /financeiro` no frontend publicado | `200` |
| Login administrativo na API pública | Sucesso |
| `GET /users/me` com token válido | Sucesso |
| `POST /auth/refresh` | Sucesso |
| Rotas de negócio centrais da API com token válido | `200` em todos os módulos exercitados |

## Estado final do MVP

Com este checkpoint, o **MVP da ExpandAI** passa a estar plenamente alinhado entre **código**, **build remota**, **serviço persistente** e **acesso público**. A pendência residual do deploy foi eliminada, e o módulo de clientes agora está disponível também na URL pública de produção, não apenas nas validações locais anteriores.

Isso encerra o ciclo técnico do MVP com backend autenticado, frontend modular publicado de forma persistente, smoke test funcional e cobertura operacional dos módulos centrais do ecossistema: dashboard, operadoras, partners, catálogo, oportunidades, vendas, financeiro e clientes.

## Resultado do checkpoint

| Frente | Situação final |
| --- | --- |
| Código do MVP | Concluído |
| Build remota do frontend | Reconstruída com sucesso |
| Serviço `expandai-web` | Ativo em produção |
| Rota pública `/clientes` | Disponível com `200 OK` |
| Fechamento operacional do MVP | Concluído |
