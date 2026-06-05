# Status da Infraestrutura EC2 - ExpandAI

A instância EC2 informada pelo usuário foi validada com sucesso por SSH utilizando a chave `expand-keys.pem`.

## Estado atual confirmado

| Item | Status | Observação |
| --- | --- | --- |
| Acesso SSH | Confirmado | Login realizado com usuário `ubuntu` |
| Endereço público | Ativo | `34.238.172.151` |
| DNS público | Ativo | `ec2-34-238-172-151.compute-1.amazonaws.com` |
| HTTP | Ativo | `nginx` respondendo com `200 OK` |
| Node.js | Instalado | `v22.22.3` |
| npm | Instalado | `10.9.8` |
| pnpm | Instalado | `10.11.1` |
| PM2 | Instalado | `7.0.1` |
| Nginx | Instalado e habilitado | Preparado para reverse proxy |
| Diretórios base | Criados | `/var/www/expandai/backend`, `/var/www/expandai/deploy`, `/var/log/expandai` |

## Diagnóstico da máquina

| Recurso | Valor observado |
| --- | --- |
| Sistema operacional | Ubuntu 26.04 LTS |
| Memória RAM | ~908 MB |
| Disco disponível | ~4.6 GB livres na raiz |
|

## Leitura técnica inicial

A máquina é suficiente para iniciar o **backend NestJS** e um processo de proxy reverso com Nginx, especialmente se o frontend permanecer desacoplado em serviço específico de hospedagem e o banco ficar fora da instância. Contudo, trata-se de um ambiente enxuto, o que reforça a recomendação de manter a arquitetura com **backend na EC2**, **banco gerenciado separado** e **frontend hospedado separadamente**.

## Próximos passos recomendados

| Prioridade | Ação |
| --- | --- |
| Alta | Receber acesso ao repositório GitHub ou criá-lo para iniciar versionamento e deploy contínuo |
| Alta | Definir se o banco será criado em RDS agora ou se iniciaremos com ambiente temporário/local |
| Alta | Subir a base do projeto backend nesta instância e configurar o primeiro deploy |
| Média | Configurar domínio, HTTPS e reverse proxy definitivo |
| Média | Provisionar ambiente de homologação e pipeline CI/CD |

Este documento serve como marco de início da fase prática de infraestrutura da ExpandAI.
