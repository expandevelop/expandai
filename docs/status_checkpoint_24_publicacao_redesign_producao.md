# Checkpoint 24 — Publicação do redesign em produção da ExpandAI

## Objetivo

Concluir a publicação em produção do redesign do frontend da **ExpandAI** após a validação local dos quatro portais separados, estabilizando o host persistente e confirmando o acesso público ao novo hub e às rotas dedicadas de **Expand**, **Operadora**, **Partner** e **Cliente Final**.

## Contexto operacional

A build local do redesign já havia sido validada anteriormente no sandbox, com as novas rotas separadas e o novo sistema visual acessível. Durante a tentativa inicial de publicação, o host persistente entrou em estado instável, com perda do artefato de produção do Next.js no diretório `.next`, ausência do arquivo `BUILD_ID` e falhas recorrentes do serviço `expandai-web` ao iniciar.

Após reinício do host, foi confirmado que a unidade `expandai-web.service` voltava a subir, porém sem uma build válida de produção, o que mantinha o frontend indisponível. O problema passou a ser, portanto, de **restauração confiável da build validada**, e não de código-fonte do redesign.

## Diagnóstico consolidado

| Item | Evidência | Conclusão |
| --- | --- | --- |
| Serviço web | `expandai-web.service` reiniciava em loop | O serviço dependia de uma build válida ausente em `.next` |
| Diretório `.next` remoto | Ausência de `BUILD_ID` | A build de produção remota estava inconsistente |
| Build remota no host | Travava em tentativas repetidas durante `next build` | O host estava frágil para reconstruir do zero naquele estado |
| Memória do host | Menos de 1 GB de RAM e sem swap | Ambiente apertado para build e restauração estável |
| Validação local anterior | Rotas do redesign funcionando no sandbox | O artefato local era confiável para restauração |

## Correções aplicadas

### 1. Estabilização mínima do host

Foi interrompido o loop do serviço `expandai-web` para liberar recursos do host persistente e permitir uma recuperação controlada.

### 2. Ativação de swap persistente

Foi criada uma área de **swap persistente de 2 GB** em `/swapfile`, com registro em `AGENTS.md`, para reduzir a fragilidade operacional do host durante operações de build e restauração do frontend.

### 3. Estratégia final de restauração

Como as tentativas de reconstrução integral no host e de download direto do pacote completo se mostraram instáveis, a publicação foi concluída com uma abordagem mais robusta:

1. empacotamento local da pasta `.next` já validada;
2. divisão do artefato em partes menores;
3. transferência segmentada para o host persistente;
4. recomposição do pacote no host;
5. substituição integral da pasta `.next` remota;
6. restart do serviço `expandai-web`.

Essa abordagem restaurou com sucesso uma build válida de produção no caminho esperado do frontend publicado.

## Estado final do serviço

Após a restauração do artefato validado e o restart do serviço, o frontend voltou a operar corretamente em produção com uma build válida, identificada por:

> `BUILD_ID: tzge3-CfRHNSHhWskLXgf`

A unidade `expandai-web.service` voltou ao estado **active (running)** no host persistente.

## Validação pública final

O endpoint funcional validado nesta etapa permaneceu:

> `http://34.73.25.196:3000`

As rotas abaixo responderam com **HTTP 200** após a restauração final:

| Rota | Resultado |
| --- | --- |
| `/` | 200 |
| `/expand` | 200 |
| `/expand/relatorios` | 200 |
| `/operadora` | 200 |
| `/operadora/relatorios` | 200 |
| `/partner` | 200 |
| `/partner/relatorios` | 200 |
| `/cliente` | 200 |
| `/cliente/relatorios` | 200 |
| `/clientes` | 200 |
| `/admin` | 200 |
| `/admin/relatorios` | 200 |

## Impacto no produto

Com esta publicação, o redesign solicitado pelo usuário passou a estar operacional também em produção, preservando a separação por links e a nova organização visual planejada para testes de usabilidade.

A camada web publicada agora oferece:

| Entrega | Estado |
| --- | --- |
| Hub principal redesenhado | Publicado |
| Portal Expand | Publicado |
| Portal Operadora | Publicado |
| Portal Partner | Publicado |
| Portal Cliente Final | Publicado |
| Relatórios por portal | Publicados |
| Compatibilidade com rotas legadas de admin | Mantida |
| Base visual com identidade inspirada na EXPAND | Publicada |

## Artefatos de apoio

| Artefato | Caminho |
| --- | --- |
| Resumo da validação pública do redesign | `tmp_redesign_public_validation/summary.txt` |
| Execução do redesign local | `docs/status_checkpoint_23_redesign_expand_portais_execucao.md` |
| Handover final consolidado | `docs/final_handover_mvp_expandai.md` |

## Conclusão

O checkpoint 24 conclui a **publicação efetiva do redesign em produção**. O frontend redesenhado da ExpandAI deixou de estar apenas validado localmente e passou a estar **restaurado, operacional e publicamente acessível** no host persistente, com os quatro portais separados, relatórios dedicados e endpoint funcional novamente estável para sequência dos testes de usabilidade.
