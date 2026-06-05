# Status Inicial de Execução - ExpandAI

O desenvolvimento foi iniciado localmente com a criação da estrutura base do projeto em `/home/ubuntu/expandai`, organizada nas pastas `backend`, `web`, `mobile`, `infra` e `docs`.

Durante a validação do arquivo de acesso da AWS, foi identificado que o CSV enviado contém apenas credenciais de **login no console** (`usuário`, `senha` e `URL do console`). Esse formato é suficiente para acesso manual ao painel da AWS, mas **não é suficiente para provisionamento automatizado** por linha de comando ou scripts de infraestrutura como código.

Além disso, a tentativa de abrir a URL do console AWS a partir do ambiente de navegação disponível foi bloqueada por política da plataforma atual. Por esse motivo, a execução imediata do provisionamento de EC2, RDS e Amplify a partir daqui depende de uma das seguintes alternativas:

| Alternativa | O que viabiliza | Dependência |
| --- | --- | --- |
| Envio de `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` de um usuário IAM com permissões adequadas | Provisionamento automatizado por scripts | Credenciais programáticas |
| Provisionamento manual por você no console, com base nos scripts que eu gerar | Execução sem acesso programático direto | Acesso ao painel AWS |
| Continuação do desenvolvimento local com mocks e IaC preparado para aplicação posterior | Avanço imediato do projeto sem travar as sprints iniciais | Nenhuma credencial adicional imediata |

O próximo passo recomendado é seguir com a estrutura técnica local e, paralelamente, definir qual das alternativas será usada para a infraestrutura real da AWS.
