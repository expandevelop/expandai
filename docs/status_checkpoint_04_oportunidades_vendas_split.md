# Checkpoint 04 — Oportunidades, Vendas e Split Automático

## Resumo executivo

Neste checkpoint, a ExpandAI evoluiu da base de catálogo e financeiro para um **ciclo operacional mais completo**, conectando **oportunidades**, **vendas**, **faturamento** e **split automático** sobre a infraestrutura já persistente em **EC2 + RDS PostgreSQL**.

A publicação foi concluída com sucesso na instância EC2 ativa, com aplicação do schema atualizado no banco de dados real e reinício controlado do processo no PM2.

## Entregas concluídas

| Frente | Entrega |
| --- | --- |
| Domínio comercial | Estruturação dos módulos de **opportunities** e **sales** |
| Persistência | Modelagem Prisma expandida para suportar pipeline comercial e fechamento de venda |
| API | Endpoints públicos de `opportunities` e `sales` publicados e respondendo |
| Integração financeira | Fluxo de venda conectado à criação de faturamento e cálculo automático de split |
| Infraestrutura | Novo deploy realizado com sucesso na EC2, com `prisma db push` executado no ambiente que alcança o RDS |
| Documentação | Swagger segue ativo e refletindo os contratos do backend |

## Estado atual da publicação

| Recurso | URL | Status |
| --- | --- | --- |
| API base | `http://34.238.172.151/api/v1` | Ativa |
| Swagger | `http://34.238.172.151/api/docs` | Ativo |
| Oportunidades | `http://34.238.172.151/api/v1/opportunities` | `200 OK` |
| Vendas | `http://34.238.172.151/api/v1/sales` | `200 OK` |

## Comportamento técnico entregue

A camada de **vendas** passou a operar como elo entre o pipeline comercial e o módulo financeiro. Quando uma venda é criada, o backend agora está preparado para:

1. validar o vínculo entre **operadora**, **partner**, **cliente**, **produto** e **oportunidade**;
2. identificar a **regra comercial** aplicável;
3. criar o **registro de faturamento** correspondente;
4. gerar automaticamente as **alocações de split** para operadora, partner e plataforma;
5. atualizar o status da oportunidade para **ganha**, quando aplicável.

Esse desenho reduz retrabalho operacional e cria a base para evolução futura de conciliação, repasse e fechamento financeiro.

## Observações operacionais

| Tema | Observação |
| --- | --- |
| Aplicação de schema | A sincronização do schema Prisma foi executada na EC2, pois o sandbox principal não alcança o RDS diretamente |
| Deploy | O deploy foi realizado por pacote enxuto, com reinstalação filtrada do backend no servidor |
| Processo | O backend foi reiniciado com sucesso no PM2 após o build |
| Banco de dados | O PostgreSQL do cluster `expand-db` permaneceu como fonte persistente oficial |

## Próximos passos recomendados

| Ordem | Próxima evolução |
| --- | --- |
| 1 | Validar ponta a ponta a criação de oportunidade e sua conversão em venda com geração automática de faturamento |
| 2 | Completar o CRUD operacional de oportunidades e vendas com filtros por status, estágio e atores |
| 3 | Evoluir o financeiro para conciliação, repasse e histórico de liquidação |
| 4 | Introduzir autenticação mais forte e regras de autorização por perfil nos novos módulos |
| 5 | Iniciar consumo real desses fluxos pela camada web e, depois, pelos aplicativos mobile |

## Conclusão

A ExpandAI agora possui uma fundação operacional mais madura, com a **trilha comercial-financeira principal conectada**. O sistema saiu de uma base puramente estrutural para uma arquitetura que já suporta o início do fluxo real entre **oferta, oportunidade, venda, faturamento e split**.

## Validação ponta a ponta executada

Após a publicação, foi executado um fluxo real pela **API pública** com os registros persistidos já existentes no ambiente:

| Etapa | Resultado |
| --- | --- |
| Criação de oportunidade | Concluída |
| Conversão da oportunidade em venda | Concluída |
| Geração automática de registro de faturamento | Concluída |
| Cálculo automático do split | Concluída |
| Liquidação do faturamento (`mark as paid`) | Concluída |
| Liberação dos repasses (`split released`) | Concluída |

### Evidências principais da validação

| Item validado | Evidência observada |
| --- | --- |
| Oportunidade criada | `cmq19dzmj0001qjxvai2fcb8q` |
| Venda criada | vinculada à oportunidade criada e retornada com status `BILLED` |
| Billing record gerado automaticamente | `cmq19edur0005qjxvjqq838ga` |
| Status do faturamento após liquidação | `PAYMENT_CONFIRMED` |
| Status do split após liquidação | `RELEASED` |
| Alocação para operadora | `40%` = `7200` |
| Alocação para partner | `40%` = `7200` |
| Alocação para plataforma | `20%` = `3600` |

### Conclusão da validação funcional

O backend passou a sustentar, em ambiente real, um fluxo operacional coerente entre **pipeline comercial** e **camada financeira**, com geração automática do faturamento e das alocações de repasse a partir da regra comercial do produto. Isso confirma que a base atual da ExpandAI já suporta a primeira trilha persistente de negócio fim a fim.
