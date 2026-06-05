# API Inicial - ExpandAI

Este documento registra a primeira camada funcional implementada no backend da ExpandAI. O objetivo é manter a documentação viva sincronizada com a evolução real do código desde o início do projeto.

## Base da API

| Item | Valor |
| --- | --- |
| Prefixo global | `/api` |
| Versionamento | `v1` via URI |
| CORS | Habilitado |
| Porta padrão | `3000` |

## Endpoints iniciais de autenticação

| Método | Rota | Finalidade | Status atual |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Simular login inicial do usuário | Mock implementado |
| `POST` | `/api/v1/auth/refresh` | Simular renovação do token | Mock implementado |
| `POST` | `/api/v1/auth/logout` | Simular encerramento de sessão | Mock implementado |

### Contrato atual de login

**Request body**

```json
{
  "email": "admin@expandai.com"
}
```

**Response body**

```json
{
  "accessToken": "mock-access-token",
  "refreshToken": "mock-refresh-token",
  "user": {
    "id": "usr_mock_001",
    "name": "Usuário ExpandAI",
    "email": "admin@expandai.com",
    "role": "admin"
  }
}
```

## Endpoints iniciais de onboarding

| Método | Rota | Finalidade | Status atual |
| --- | --- | --- | --- |
| `POST` | `/api/v1/onboarding/operators` | Iniciar onboarding de operadora | Mock implementado |
| `POST` | `/api/v1/onboarding/partners` | Iniciar onboarding de partner | Mock implementado |

### Contrato atual de onboarding de operadora

**Request body**

```json
{
  "companyName": "Empresa Exemplo",
  "document": "00.000.000/0001-00",
  "email": "contato@empresa.com"
}
```

**Response body**

```json
{
  "onboardingId": "onb_operator_001",
  "actorType": "operator",
  "status": "pending_kyc",
  "payload": {
    "companyName": "Empresa Exemplo",
    "document": "00.000.000/0001-00",
    "email": "contato@empresa.com"
  }
}
```

## Leitura arquitetural

A implementação atual ainda é intencionalmente mockada, pois o objetivo desta etapa é estabelecer o contrato da API, a estrutura dos módulos e a fundação do fluxo principal antes de conectar banco, autenticação definitiva, KYC externo e serviços financeiros.

Esse modelo reduz retrabalho e permite que web, mobile e documentação avancem em paralelo com base em contratos estáveis.
