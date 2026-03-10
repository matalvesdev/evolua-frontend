# Especificação de APIs - Evolua CRM

## Visão Geral

O Evolua CRM expõe suas funcionalidades através de APIs RESTful construídas sobre o Supabase, que fornece APIs automáticas baseadas em PostgreSQL, além de Edge Functions customizadas para lógica de negócio complexa. Todas as APIs seguem padrões REST, utilizam autenticação JWT e implementam Row Level Security (RLS) para controle de acesso granular.

## Arquitetura de APIs

### Camadas de API

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE API GATEWAY                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Rate Limiting (Upstash Redis)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│  PostgREST API   │          │   Edge Functions     │
│  (Auto-gerado)   │          │   (Custom Logic)     │
└────────┬─────────┘          └──────────┬───────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (RLS Enabled)               │
└─────────────────────────────────────────────────────────────┘
```

## Base URL

### Ambientes

| Ambiente | Base URL |
|----------|----------|
| Development | `http://localhost:54321` |
| Staging | `https://staging-api.evolua.app` |
| Production | `https://api.evolua.com.br` |

### Endpoints Base

```
REST API:     {BASE_URL}/rest/v1
Auth API:     {BASE_URL}/auth/v1
Storage API:  {BASE_URL}/storage/v1
Functions:    {BASE_URL}/functions/v1
Realtime:     wss://{BASE_URL}/realtime/v1
```

## Autenticação

### Fluxo de Autenticação

```
┌─────────┐                                    ┌──────────┐
│ Cliente │                                    │ Supabase │
└────┬────┘                                    └────┬─────┘
     │                                              │
     │  POST /auth/v1/signup                        │
     │  { email, password }                         │
     ├─────────────────────────────────────────────>│
     │                                              │
     │  { access_token, refresh_token, user }       │
     │<─────────────────────────────────────────────┤
     │                                              │
     │  GET /rest/v1/patients                       │
     │  Authorization: Bearer {access_token}        │
     ├─────────────────────────────────────────────>│
     │                                              │
     │  { data: [...] }                             │
     │<─────────────────────────────────────────────┤
     │                                              │
```

### Endpoints de Autenticação

#### 1. Cadastro de Usuário

```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "terapeuta@example.com",
  "password": "SenhaSegura123!",
  "data": {
    "full_name": "Maria Silva",
    "role": "therapist"
  }
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MRjVsuLiYKFbsbC...",
  "user": {
    "id": "uuid",
    "email": "terapeuta@example.com",
    "user_metadata": {
      "full_name": "Maria Silva",
      "role": "therapist"
    },
    "created_at": "2024-03-09T10:00:00Z"
  }
}
```

#### 2. Login

```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "terapeuta@example.com",
  "password": "SenhaSegura123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "v1.MRjVsuLiYKFbsbC...",
  "user": { /* ... */ }
}
```

#### 3. Refresh Token

```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "v1.MRjVsuLiYKFbsbC..."
}
```

#### 4. Logout

```http
POST /auth/v1/logout
Authorization: Bearer {access_token}
```

#### 5. Recuperação de Senha

```http
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "terapeuta@example.com"
}
```

### Headers de Autenticação

Todas as requisições autenticadas devem incluir:

```http
Authorization: Bearer {access_token}
apikey: {supabase_anon_key}
```

## APIs REST (PostgREST)

### Convenções Gerais

#### Métodos HTTP

| Método | Ação | Exemplo |
|--------|------|---------|
| GET | Listar/Buscar | `GET /patients` |
| POST | Criar | `POST /patients` |
| PATCH | Atualizar parcial | `PATCH /patients?id=eq.123` |
| PUT | Substituir completo | `PUT /patients?id=eq.123` |
| DELETE | Deletar | `DELETE /patients?id=eq.123` |

#### Query Parameters

**Filtros:**
```http
GET /patients?status=eq.active
GET /patients?age=gte.18
GET /patients?name=ilike.*silva*
```

**Operadores:**
- `eq` - Igual
- `neq` - Diferente
- `gt` - Maior que
- `gte` - Maior ou igual
- `lt` - Menor que
- `lte` - Menor ou igual
- `like` - LIKE (case-sensitive)
- `ilike` - ILIKE (case-insensitive)
- `in` - IN (lista)
- `is` - IS (null/not null)

**Ordenação:**
```http
GET /patients?order=created_at.desc
GET /patients?order=name.asc,created_at.desc
```

**Paginação:**
```http
GET /patients?limit=10&offset=0
```

**Seleção de Campos:**
```http
GET /patients?select=id,name,email
GET /patients?select=*,appointments(*)
```

**Contagem:**
```http
GET /patients?select=count
HEAD /patients
```

### Recursos (Endpoints)

#### 1. Pacientes (Patients)

##### Listar Pacientes

```http
GET /rest/v1/patients?select=*&order=created_at.desc
Authorization: Bearer {token}
apikey: {anon_key}
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "therapist_id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "11999999999",
    "birth_date": "1990-05-15",
    "status": "active",
    "created_at": "2024-03-01T10:00:00Z",
    "updated_at": "2024-03-09T10:00:00Z"
  }
]
```

##### Buscar Paciente por ID

```http
GET /rest/v1/patients?id=eq.{patient_id}&select=*
Authorization: Bearer {token}
```

##### Criar Paciente

```http
POST /rest/v1/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11999999999",
  "birth_date": "1990-05-15",
  "cpf": "12345678900",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567"
  },
  "medical_history": {
    "allergies": ["Penicilina"],
    "medications": ["Fluoxetina 20mg"],
    "conditions": ["Ansiedade"]
  }
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "therapist_id": "uuid",
  "name": "João Silva",
  "email": "joao@example.com",
  "status": "active",
  "created_at": "2024-03-09T10:00:00Z"
}
```

##### Atualizar Paciente

```http
PATCH /rest/v1/patients?id=eq.{patient_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "11988888888",
  "status": "inactive"
}
```

##### Deletar Paciente (Soft Delete)

```http
PATCH /rest/v1/patients?id=eq.{patient_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "archived",
  "archived_at": "2024-03-09T10:00:00Z"
}
```

#### 2. Agendamentos (Appointments)

##### Listar Agendamentos

```http
GET /rest/v1/appointments?select=*,patient:patients(id,name)&order=scheduled_at.asc
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "therapist_id": "uuid",
    "patient_id": "uuid",
    "scheduled_at": "2024-03-10T14:00:00Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "type": "consultation",
    "notes": "Primeira consulta",
    "patient": {
      "id": "uuid",
      "name": "João Silva"
    },
    "created_at": "2024-03-09T10:00:00Z"
  }
]
```

##### Criar Agendamento

```http
POST /rest/v1/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "scheduled_at": "2024-03-10T14:00:00Z",
  "duration_minutes": 60,
  "type": "consultation",
  "notes": "Primeira consulta"
}
```

##### Atualizar Status do Agendamento

```http
PATCH /rest/v1/appointments?id=eq.{appointment_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-03-10T15:00:00Z"
}
```

#### 3. Relatórios (Reports)

##### Listar Relatórios

```http
GET /rest/v1/reports?select=*,patient:patients(id,name)&order=created_at.desc
Authorization: Bearer {token}
```

##### Criar Relatório

```http
POST /rest/v1/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "type": "evolution",
  "title": "Sessão João Silva - 10/03/2024",
  "content": {
    "observations": "Paciente apresentou melhora...",
    "interventions": ["Técnica de respiração"],
    "next_steps": ["Continuar exercícios"]
  },
  "status": "draft"
}
```

##### Atualizar Relatório

```http
PATCH /rest/v1/reports?id=eq.{report_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": { /* ... */ },
  "status": "published"
}
```

#### 4. Transações Financeiras (Transactions)

##### Listar Transações

```http
GET /rest/v1/transactions?select=*&order=date.desc
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "therapist_id": "uuid",
    "patient_id": "uuid",
    "appointment_id": "uuid",
    "type": "income",
    "category": "consultation",
    "amount": 150.00,
    "date": "2024-03-10",
    "status": "paid",
    "payment_method": "pix",
    "description": "Consulta - João Silva",
    "created_at": "2024-03-10T15:00:00Z"
  }
]
```

##### Criar Transação

```http
POST /rest/v1/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "type": "income",
  "category": "consultation",
  "amount": 150.00,
  "date": "2024-03-10",
  "status": "pending",
  "payment_method": "pix"
}
```

#### 5. Tarefas (Tasks)

##### Listar Tarefas

```http
GET /rest/v1/tasks?select=*&status=eq.pending&order=due_date.asc
Authorization: Bearer {token}
```

##### Criar Tarefa

```http
POST /rest/v1/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Revisar relatório de João",
  "description": "Finalizar relatório da sessão",
  "due_date": "2024-03-11",
  "priority": "high",
  "status": "pending"
}
```

##### Marcar Tarefa como Concluída

```http
PATCH /rest/v1/tasks?id=eq.{task_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "completed_at": "2024-03-09T10:00:00Z"
}
```

#### 6. Notificações (Notifications)

##### Listar Notificações

```http
GET /rest/v1/notifications?select=*&read=eq.false&order=created_at.desc
Authorization: Bearer {token}
```

##### Marcar como Lida

```http
PATCH /rest/v1/notifications?id=eq.{notification_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "read": true,
  "read_at": "2024-03-09T10:00:00Z"
}
```

## Edge Functions (Lógica Customizada)

### Estrutura de Edge Function

```typescript
// supabase/functions/function-name/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Validar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Processar requisição
    const body = await req.json();
    
    // Lógica de negócio
    const result = await processBusinessLogic(body);
    
    // Retornar resposta
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### Edge Functions Disponíveis

#### 1. Gerar Relatório com IA

```http
POST /functions/v1/generate-report
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "audio_url": "https://storage.supabase.co/...",
  "template": "evolution"
}
```

**Response (200 OK):**
```json
{
  "report_id": "uuid",
  "content": {
    "observations": "...",
    "interventions": ["..."],
    "next_steps": ["..."]
  },
  "confidence_score": 0.95
}
```

#### 2. Enviar Mensagem WhatsApp

```http
POST /functions/v1/send-whatsapp
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": "uuid",
  "message": "Olá! Lembrete da sua consulta amanhã às 14h.",
  "template": "appointment_reminder"
}
```

**Response (200 OK):**
```json
{
  "message_id": "wamid.xxx",
  "status": "sent",
  "sent_at": "2024-03-09T10:00:00Z"
}
```

#### 3. Processar Áudio e Transcrever

```http
POST /functions/v1/process-audio
Authorization: Bearer {token}
Content-Type: application/json

{
  "audio_url": "https://storage.supabase.co/...",
  "patient_id": "uuid",
  "appointment_id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "transcription_id": "uuid",
  "text": "Transcrição completa do áudio...",
  "duration_seconds": 3600,
  "confidence": 0.92,
  "processed_at": "2024-03-09T10:00:00Z"
}
```

#### 4. Calcular Métricas Financeiras

```http
POST /functions/v1/calculate-finances
Authorization: Bearer {token}
Content-Type: application/json

{
  "start_date": "2024-03-01",
  "end_date": "2024-03-31"
}
```

**Response (200 OK):**
```json
{
  "period": {
    "start": "2024-03-01",
    "end": "2024-03-31"
  },
  "metrics": {
    "total_income": 4500.00,
    "total_expenses": 1200.00,
    "net_profit": 3300.00,
    "appointments_count": 30,
    "average_per_appointment": 150.00
  },
  "by_category": {
    "consultation": 4500.00,
    "office_rent": -800.00,
    "supplies": -400.00
  }
}
```

#### 5. Sugestões de IA (Lembretes)

```http
POST /functions/v1/ai-suggestions
Authorization: Bearer {token}
Content-Type: application/json

{
  "context": "reminders",
  "days_ahead": 7
}
```

**Response (200 OK):**
```json
{
  "suggestions": [
    {
      "type": "reschedule",
      "priority": "high",
      "message": "Paciente João Silva não tem consulta agendada há 3 semanas",
      "action": {
        "type": "schedule_appointment",
        "patient_id": "uuid",
        "suggested_date": "2024-03-15T14:00:00Z"
      }
    },
    {
      "type": "reminder",
      "priority": "medium",
      "message": "Relatório pendente da consulta de Maria Santos",
      "action": {
        "type": "create_report",
        "appointment_id": "uuid"
      }
    }
  ]
}
```

## Storage API

### Upload de Arquivo

```http
POST /storage/v1/object/{bucket_name}/{file_path}
Authorization: Bearer {token}
Content-Type: multipart/form-data

{file_data}
```

**Response (200 OK):**
```json
{
  "Key": "patient-documents/uuid/document.pdf",
  "Id": "uuid"
}
```

### Download de Arquivo

```http
GET /storage/v1/object/{bucket_name}/{file_path}
Authorization: Bearer {token}
```

### Listar Arquivos

```http
POST /storage/v1/object/list/{bucket_name}
Authorization: Bearer {token}
Content-Type: application/json

{
  "prefix": "patient-documents/uuid/",
  "limit": 100,
  "offset": 0
}
```

### Deletar Arquivo

```http
DELETE /storage/v1/object/{bucket_name}/{file_path}
Authorization: Bearer {token}
```

## Realtime API (WebSockets)

### Conexão

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Subscrever a mudanças em tempo real
const channel = supabase
  .channel('appointments-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'appointments',
      filter: `therapist_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### Eventos Disponíveis

- `INSERT` - Novo registro criado
- `UPDATE` - Registro atualizado
- `DELETE` - Registro deletado
- `*` - Todos os eventos

## Rate Limiting

### Limites por Endpoint

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Auth (login/signup) | 5 req | 15 min |
| REST API (leitura) | 100 req | 1 min |
| REST API (escrita) | 50 req | 1 min |
| Edge Functions | 10 req | 10 seg |
| Storage (upload) | 20 req | 1 min |

### Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678363200
```

### Response de Rate Limit Excedido

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 60 seconds.",
  "retry_after": 60
}
```

## Códigos de Status HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Requisição bem-sucedida sem conteúdo |
| 400 | Bad Request | Dados inválidos |
| 401 | Unauthorized | Não autenticado |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity | Validação falhou |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Erro no servidor |
| 503 | Service Unavailable | Serviço indisponível |

## Tratamento de Erros

### Formato de Erro Padrão

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email inválido"
      },
      {
        "field": "phone",
        "message": "Telefone deve ter 10 ou 11 dígitos"
      }
    ]
  }
}
```

### Códigos de Erro Customizados

| Código | Descrição |
|--------|-----------|
| `VALIDATION_ERROR` | Erro de validação de dados |
| `AUTHENTICATION_ERROR` | Erro de autenticação |
| `AUTHORIZATION_ERROR` | Erro de autorização |
| `NOT_FOUND` | Recurso não encontrado |
| `CONFLICT` | Conflito de dados |
| `RATE_LIMIT_EXCEEDED` | Rate limit excedido |
| `INTERNAL_ERROR` | Erro interno do servidor |

## Versionamento de API

### Estratégia

- **Versão atual:** v1
- **Versionamento:** URL-based (`/rest/v1/`, `/functions/v1/`)
- **Deprecação:** 6 meses de aviso antes de remover versão antiga
- **Breaking changes:** Apenas em novas versões

### Changelog

Mantido em `CHANGELOG.md` com formato:

```markdown
## [v1.1.0] - 2024-03-09

### Added
- Endpoint de sugestões de IA
- Filtro por data em transações

### Changed
- Formato de resposta de relatórios (campo `content` agora é objeto)

### Deprecated
- Campo `notes` em appointments (usar `description`)

### Removed
- Endpoint legado `/patients/search` (usar query params)

### Fixed
- Bug em paginação de pacientes
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS habilitadas:

```sql
-- Exemplo: Pacientes só podem ser acessados pelo terapeuta responsável
CREATE POLICY "Therapists can view their own patients"
ON patients FOR SELECT
USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert their own patients"
ON patients FOR INSERT
WITH CHECK (auth.uid() = therapist_id);
```

### Validação de Entrada

- Todos os inputs são validados com Zod schemas
- SQL injection prevention (prepared statements)
- XSS prevention (sanitização de HTML)
- CSRF protection (tokens)

### CORS

```typescript
// Configuração CORS
{
  origin: ['https://app.evolua.com.br', 'https://staging.evolua.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'apikey'],
  credentials: true
}
```

## Documentação Interativa

### Swagger/OpenAPI

Disponível em: `https://api.evolua.com.br/docs`

Gerado automaticamente a partir do schema do banco de dados.

### Postman Collection

Collection disponível em: `docs/postman/evolua-crm.json`

Inclui:
- Todos os endpoints
- Exemplos de requisições
- Variáveis de ambiente
- Testes automatizados

## Webhooks

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
| `patient.created` | Novo paciente criado |
| `appointment.scheduled` | Consulta agendada |
| `appointment.completed` | Consulta finalizada |
| `report.published` | Relatório publicado |
| `transaction.paid` | Transação paga |

### Formato de Webhook

```http
POST {webhook_url}
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "appointment.completed",
  "timestamp": "2024-03-09T10:00:00Z",
  "data": {
    "id": "uuid",
    "patient_id": "uuid",
    "therapist_id": "uuid",
    "completed_at": "2024-03-09T10:00:00Z"
  }
}
```

## Próximos Passos

### Melhorias Planejadas

1. **GraphQL API** - Alternativa ao REST para queries complexas
2. **Batch Operations** - Operações em lote para melhor performance
3. **API Gateway** - Kong ou AWS API Gateway para gerenciamento centralizado
4. **OpenAPI 3.0** - Documentação completa e geração de SDKs
5. **SDK JavaScript/TypeScript** - Cliente oficial para facilitar integração
6. **Webhooks Management** - Interface para gerenciar webhooks
7. **API Analytics** - Métricas de uso de APIs
8. **Versão v2** - Melhorias baseadas em feedback
