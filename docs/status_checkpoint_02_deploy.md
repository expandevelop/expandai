# Status do Checkpoint 02 - Deploy Estabilizado

O segundo checkpoint técnico da ExpandAI foi estabilizado com sucesso após o ajuste da estratégia de inicialização do Prisma. Como o PostgreSQL definitivo ainda não foi provisionado, a API passou a operar em **modo sem persistência**, preservando a disponibilidade do backend e permitindo a continuidade do desenvolvimento das próximas sprints.

## Situação atual

| Frente | Status atual |
| --- | --- |
| EC2 | Online e operacional |
| Nginx | Ativo como reverse proxy |
| PM2 | Processo `expandai-api` ativo |
| API pública | Respondendo em `http://34.238.172.151/api/v1` |
| Swagger | Respondendo em `http://34.238.172.151/api/docs` |
| Prisma | Modelagem e client configurados |
| Banco real | Ainda pendente de provisionamento/configuração |

## Ajuste realizado

A tentativa inicial de subir a nova versão falhou por dois motivos: limitação de memória na instância e tentativa de conexão com um `DATABASE_URL` ainda placeholder. Para resolver isso, foi criado swap na EC2 e a inicialização do Prisma foi tornada resiliente, evitando bloquear a subida da API quando o banco real ainda não estiver disponível.

## Validação pública concluída

| Endpoint | Resultado |
| --- | --- |
| `GET /api/v1/operators` | `200 OK` |
| `GET /api/docs` | `200 OK` |

## Leitura executiva

A ExpandAI agora possui um backend público ativo com documentação navegável e domínios centrais expostos, mesmo antes da conexão com o PostgreSQL definitivo. Isso permite seguir imediatamente para a próxima evolução: contratos de escrita dos domínios, autenticação persistente e modelagem mais profunda de catálogo, financeiro e CRM.
