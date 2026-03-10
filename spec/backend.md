# Especificação Backend - Evolua CRM

## Visão Geral

O backend do Evolua CRM é construído sobre o **Supabase**, uma plataforma Backend-as-a-Service (BaaS) que fornece PostgreSQL gerenciado, autenticação, storage, APIs REST automáticas e Edge Functions serverless. A arquitetura segue princípios de segurança first com Row Level Security (RLS), separação de responsabilidades e escalabilidade horizontal.

## Arquitetura Backend

### Camadas da Aplicação

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE API LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgREST (Auto-generated REST API)                │   │
│  │  - CRUD operations                                   │   │
│  │  - Query filtering                                   │   │
│  │  - Pagination                                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Edge Functions (Deno Runtime)                       │   │
│  │  - Custom business logic                             │   │
│  │  - AI integrations                                   │   │
│  │  - External API calls                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE (RLS Enabled)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tables & Relations                                  │   │
│  │  - users, patients, appointments                     │   │
│  │  - reports, transactions, tasks                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS)                            │   │
│  │  - User-based access control                         │   │
│  │  - Automatic data filtering                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Modelo de Domínio

### Entidades Principais



#### 1. Users (Usuários/Terapeutas)
- ID único (UUID)
- Email, nome completo, role
- Avatar, telefone, especialidade
- CRP (registro profissional)
- Timestamps de criação e atualização

#### 2. Patients (Pacientes)
- ID único (UUID)
- Referência ao terapeuta responsável
- Dados pessoais (nome, email, telefone, CPF)
- Data de nascimento
- Endereço (JSONB)
- Histórico médico (JSONB)
- Status (active, inactive, archived)

#### 3. Appointments (Agendamentos)
- ID único (UUID)
- Referências a terapeuta e paciente
- Data/hora agendada
- Duração em minutos
- Status (scheduled, completed, cancelled, no_show)
- Tipo (consultation, evaluation, follow_up)
- Notas e data de conclusão

#### 4. Reports (Relatórios)
- ID único (UUID)
- Referências a terapeuta, paciente e consulta
- Tipo (evolution, evaluation, discharge)
- Título e conteúdo (JSONB)
- Status (draft, published, archived)
- Data de publicação

#### 5. Transactions (Transações Financeiras)
- ID único (UUID)
- Referências a terapeuta, paciente e consulta
- Tipo (income, expense)
- Categoria, valor, data
- Status (pending, paid, cancelled)
- Método de pagamento e descrição

#### 6. Tasks (Tarefas)
- ID único (UUID)
- Referências a terapeuta e paciente
- Título, descrição, data de vencimento
- Prioridade (low, medium, high)
- Status (pending, completed, cancelled)

#### 7. Notifications (Notificações)
- ID único (UUID)
- Referência ao usuário
- Tipo, título, mensagem
- Dados adicionais (JSONB)
- Status de leitura

## Row Level Security (RLS)

### Princípios de Segurança

Todas as tabelas implementam RLS para garantir que:
- Terapeutas só acessam seus próprios dados
- Pacientes não têm acesso direto ao banco
- Dados são filtrados automaticamente por usuário
- Políticas são aplicadas em todas as operações (SELECT, INSERT, UPDATE, DELETE)

### Exemplo de Política RLS

```sql
-- Terapeutas só podem ver seus próprios pacientes
CREATE POLICY "Therapists can view their own patients"
ON patients FOR SELECT
USING (auth.uid() = therapist_id);
```

## Database Functions e Triggers

### 1. Atualizar Updated_At Automaticamente

Trigger que atualiza o campo `updated_at` sempre que um registro é modificado.

### 2. Criar Relatório Automático ao Finalizar Consulta

Quando uma consulta é marcada como "completed", um relatório de evolução é criado automaticamente em status "draft".

### 3. Criar Notificação para Consulta Próxima

Sistema de notificações automáticas para lembretes de consultas.

## Edge Functions (Serverless)

### Funções Implementadas

#### 1. Generate Report
- Transcreve áudio de consulta
- Gera relatório usando IA (OpenAI)
- Salva no banco de dados

#### 2. Send WhatsApp
- Busca dados do paciente
- Envia mensagem via WhatsApp API
- Suporta templates personalizados

#### 3. Calculate Finances
- Calcula métricas financeiras por período
- Total de receitas e despesas
- Lucro líquido e média por consulta

#### 4. Process Audio
- Processa arquivo de áudio
- Transcreve usando serviço de IA
- Armazena transcrição

#### 5. AI Suggestions
- Analisa agenda e dados de pacientes
- Gera sugestões inteligentes
- Lembretes e ações recomendadas

## Validação de Dados

### Schemas Zod

Validação compartilhada entre frontend e backend usando Zod:
- Validação de tipos
- Mensagens de erro customizadas
- Transformações de dados
- Validação assíncrona quando necessário

### Exemplo de Schema

```typescript
const patientSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
  birth_date: z.date().max(new Date()),
});
```

## Tratamento de Erros

### Códigos de Erro Padronizados

- VALIDATION_ERROR - Erro de validação
- AUTHENTICATION_ERROR - Erro de autenticação
- AUTHORIZATION_ERROR - Sem permissão
- NOT_FOUND - Recurso não encontrado
- CONFLICT - Conflito de dados
- INTERNAL_ERROR - Erro interno

### Formato de Resposta de Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [...]
  }
}
```

## Padrões de API

### REST Conventions

- GET - Buscar recursos
- POST - Criar recursos
- PATCH - Atualizar parcialmente
- PUT - Substituir completamente
- DELETE - Deletar recursos

### Response Format

Respostas padronizadas com data e meta informações.

## Boas Práticas

### 1. Sempre usar RLS
- Nunca desabilitar RLS em produção
- Testar políticas com diferentes usuários
- Usar service role key apenas em Edge Functions

### 2. Validar Inputs
- Validar no frontend E backend
- Usar Zod para schemas compartilhados
- Sanitizar dados antes de salvar

### 3. Logging
- Logar erros com contexto
- Não logar dados sensíveis
- Usar structured logging (JSON)

### 4. Performance
- Criar índices em colunas frequentemente consultadas
- Usar paginação em listas grandes
- Implementar cache quando apropriado

### 5. Segurança
- Nunca expor service role key no frontend
- Usar HTTPS sempre
- Implementar rate limiting
- Validar tokens JWT

## Próximos Passos

### Melhorias Planejadas

1. GraphQL API - Alternativa ao REST
2. Webhooks - Notificações de eventos
3. Batch Operations - Operações em lote
4. Audit Logs - Rastreamento de mudanças
5. Data Export - Exportação de dados (LGPD)
6. Advanced Search - Busca full-text
7. Caching Layer - Redis para cache
8. Queue System - Processamento assíncrono
