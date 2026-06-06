# Checkpoint 14 — Publicação da camada web em ambiente persistente

## Visão geral

A camada web da **ExpandAI** foi publicada com sucesso em um ambiente persistente dedicado, permitindo acesso contínuo ao frontend operacional já integrado ao backend autenticado. A publicação foi realizada em um **cloud computer** com serviço `systemd`, mantendo o aplicativo Next.js ativo mesmo após reinicializações do host.

Neste checkpoint, o objetivo principal foi sair do estágio de execução apenas local e disponibilizar a aplicação em um endereço acessível externamente, preservando a integração com a API pública já existente em `http://34.238.172.151/api/v1`.

## Entrega concluída

| Item | Resultado |
| --- | --- |
| Ambiente persistente | Cloud computer configurado para hospedar o frontend |
| Runtime | Node.js 20.20.2 e pnpm 10.34.1 instalados no host |
| Build do frontend | `pnpm build` executado com sucesso no ambiente remoto |
| Serviço persistente | `expandai-web.service` criado e habilitado via `systemd` |
| Porta pública | `3000/tcp` liberada no `ufw` |
| URL de acesso | `http://34.73.25.196:3000` |
| Validação externa | `HTTP/1.1 200 OK` confirmado a partir do sandbox principal |

## Configuração operacional aplicada

O frontend foi publicado a partir do diretório `/home/ubuntu/expandai/apps/web`, com inicialização em modo de produção e bind em `0.0.0.0:3000`. A variável `NEXT_PUBLIC_EXPANDAI_API_URL` foi mantida apontando para a API pública já publicada, preservando a continuidade dos fluxos operacionais autenticados implementados nos checkpoints anteriores.

A operação persistente passou a ser mantida pelo serviço `systemd` abaixo:

> **Serviço:** `expandai-web.service`  
> **Porta:** `3000`  
> **Runtime:** `next start --hostname 0.0.0.0 --port 3000`

## Validação executada

A publicação foi validada em três níveis complementares. Primeiro, o build de produção do Next.js foi concluído no host remoto com geração das rotas estáticas e dinâmicas previstas. Depois, o serviço persistente foi iniciado e confirmado como **active (running)** via `systemctl`. Por fim, foi executado um teste HTTP externo a partir do sandbox principal, retornando **200 OK**, confirmando que o frontend ficou acessível pela rede pública.

## Pendências após este checkpoint

| Frente | Próximo foco |
| --- | --- |
| Validação integrada | Exercitar a aplicação publicada com login real, navegação entre módulos e verificações de permissão |
| Hardening | Revisar mensagens de erro, comportamento de refresh, estados vazios e resiliência da sessão |
| Fechamento do MVP | Consolidar documentação final, checklist operacional e handover técnico |

## Resultado do checkpoint

Com este checkpoint, a **ExpandAI** passa a contar não apenas com backend publicado, mas também com **frontend web publicado de forma persistente e acessível externamente**, o que habilita a próxima fase de validação integrada do MVP em ambiente real.
