# Arquitetura do Sistema - Evolua CRM

## Visão Geral da Arquitetura

O Evolua CRM segue uma arquitetura moderna de **aplicação web full-stack** com separação clara entre frontend e backend, utilizando serviços gerenciados da AWS e Supabase para reduzir complexidade operacional.

```
┌─────────────────────────────────────────────────────────────┐
│                        USUÁRIOS                              │
│  (Fonoaudiólogos, Secretárias, Administradores)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS AMPLIFY (CDN + Hosting)                │
│                   Frontend Next.js 16                        │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │  AWS App     │ │   Upstash    │
│   Auth       │ │  Runner      │ │   Redis      │
│   (JWT)      │ │  (NestJS)    │ │  (Rate Limit)│
└──────────────┘ └──────┬───────┘ └──────────────┘
                        │
                        ▼
                ┌──────────────┐
                │  Supabase    │
                │  PostgreSQL  │
                │  (Database)  │
                └──────────────┘
```

## Componentes do Sistema

### 1. Frontend (Next.js + React)
**Tecnologia**: Next.js 16.1.1, React 19.2.3, TypeScript 5.9.3

**Responsabilidades**:
- Renderização de UI e interação com usuário
- Gerenciamento de estado do cliente (React Query)
- Validação de formulários (React Hook Form + Zod)
- Autenticação e autorização (Supabase Auth)
- Comunicação com backend via API REST
- Implementação de CSP e headers de segurança

**Camadas**:
```
src/
├── app/              # Rotas e páginas (App Router)
├── components/       # Componentes React reutilizáveis
├── hooks/            # Custom hooks para lógica de negócio
├── lib/              # Utilitários e integrações
│   ├── api/          # Cliente HTTP e endpoints
│   ├── security/     # CSP, RBAC, sanitização
│   └── supabase/     # Cliente Supabase
└── middleware.ts     # Middleware Next.js (auth, CSP, rate limit)
```

### 2. Backend (NestJS)
**Tecnologia**: NestJS (Node.js + TypeScript)

**Responsabilidades**:
- Lógica de negócio e regras de domínio
- Validação de dados e DTOs
- Autenticação via JWT (Supabase)
- Autorização baseada em roles e clinic_id
- Comunicação com banco de dados
- Processamento de transcrições de áudio
- Geração de relatórios

**Padrão de Arquitetura**: Layered Architecture
```
src/
├── modules/          # Módulos de domínio
│   ├── patients/
│   ├── appointments/
│   ├── reports/
│   ├── finances/
│   └── tasks/
├── common/           # Código compartilhado
│   ├── guards/       # Guards de autenticação/autorização
│   ├── interceptors/ # Interceptors de logging/transformação
│   └── filters/      # Exception filters
└── config/           # Configurações
```

### 3. Banco de Dados (Supabase PostgreSQL)
**Tecnologia**: PostgreSQL 15+ com extensões Supabase

**Responsabilidades**:
- Armazenamento persistente de dados
- Row-Level Security (RLS) para isolamento multi-tenant
- Triggers para auditoria e timestamps
- Índices para otimização de queries
- Backup automático

**Modelo de Dados**: Relacional normalizado com JSONB para flexibilidade

### 4. Autenticação (Supabase Auth)
**Tecnologia**: Supabase Auth (baseado em GoTrue)

**Responsabilidades**:
- Registro e login de usuários
- Geração e validação de JWT
- Refresh de tokens
- Gerenciamento de sessões
- Armazenamento de user_metadata (role, full_name)

### 5. Rate Limiting (Upstash Redis)
**Tecnologia**: Upstash Redis + @upstash/ratelimit

**Responsabilidades**:
- Limitação de requisições em rotas sensíveis
- Proteção contra brute force
- Sliding window algorithm
- Fallback gracioso quando indisponível

### 6. Hosting e Deploy (AWS Amplify)
**Tecnologia**: AWS Amplify

**Responsabilidades**:
- Build e deploy automático do frontend
- CDN global para assets estáticos
- SSL/TLS automático
- Ambientes por branch (dev/prod)
- Injeção de variáveis de ambiente

### 7. Backend Hosting (AWS App Runner)
**Tecnologia**: AWS App Runner

**Responsabilidades**:
- Deploy automático do backend
- Auto-scaling baseado em carga
- Load balancing
- Health checks
- Logs centralizados

## Comunicação Entre Serviços

### Frontend ↔ Backend
**Protocolo**: HTTPS REST API
**Formato**: JSON
**Autenticação**: Bearer Token (JWT)

**Fluxo**:
1. Frontend obtém JWT do Supabase Auth
2. Frontend inclui JWT no header `Authorization: Bearer <token>`
3. Backend valida JWT com chave pública do Supabase
4. Backend extrai `user_id` e `clinic_id` do JWT
5. Backend aplica RLS queries automaticamente
6. Backend retorna dados filtrados por clinic_id

### Frontend ↔ Supabase Auth
**Protocolo**: HTTPS REST API
**SDK**: @supabase/supabase-js

**Fluxo**:
1. Usuário faz login com email/senha
2. Supabase Auth valida credenciais
3. Supabase retorna JWT + refresh token
4. Frontend armazena tokens em cookies seguros
5. Frontend usa JWT para chamadas ao backend
6. Refresh automático quando JWT expira

### Backend ↔ Supabase Database
**Protocolo**: PostgreSQL wire protocol
**SDK**: @supabase/supabase-js (server-side)

**Fluxo**:
1. Backend usa service_role key para acesso total
2. Backend aplica filtros de clinic_id manualmente
3. Queries otimizadas com índices
4. Transações para operações complexas

## Fluxo de Dados

### Fluxo de Autenticação
```
1. Usuário → Frontend: Submete email/senha
2. Frontend → Supabase Auth: POST /auth/v1/token
3. Supabase Auth → Frontend: JWT + refresh_token
4. Frontend → Cookie: Armazena tokens (httpOnly, secure)
5. Frontend → Backend: GET /auth/profile (Authorization: Bearer JWT)
6. Backend → Supabase: Valida JWT
7. Backend → Database: SELECT * FROM users WHERE id = jwt.sub
8. Database → Backend: Dados do usuário
9. Backend → Frontend: Perfil do usuário
```

### Fluxo de Criação de Paciente
```
1. Usuário → Frontend: Preenche formulário de paciente
2. Frontend: Valida com Zod schema
3. Frontend → Backend: POST /patients (Authorization: Bearer JWT)
4. Backend: Valida JWT e extrai clinic_id
5. Backend: Valida DTO com class-validator
6. Backend → Database: INSERT INTO patients (clinic_id, ...)
7. Database → Backend: Paciente criado
8. Backend → Frontend: Paciente com ID
9. Frontend: Invalida cache do React Query
10. Frontend: Atualiza lista de pacientes
```

### Fluxo de Listagem de Pacientes
```
1. Usuário → Frontend: Acessa página de pacientes
2. Frontend: React Query verifica cache
3. Frontend → Backend: GET /patients?status=active&limit=20
4. Backend: Valida JWT e extrai clinic_id
5. Backend → Database: SELECT * FROM patients WHERE clinic_id = ? AND status = ?
6. Database → Backend: Lista de pacientes
7. Backend → Frontend: { data: [...], total: 50, page: 1 }
8. Frontend: Armazena em cache do React Query
9. Frontend: Renderiza lista
```

## Estratégia de Escalabilidade

### Escalabilidade Horizontal

**Frontend (AWS Amplify)**:
- CDN global distribui carga automaticamente
- Edge locations reduzem latência
- Cache agressivo de assets estáticos
- Sem limite de usuários simultâneos

**Backend (AWS App Runner)**:
- Auto-scaling baseado em CPU/memória
- Mínimo: 1 instância
- Máximo: 10 instâncias (configurável)
- Scale-up em ~30 segundos

**Database (Supabase)**:
- Connection pooling (PgBouncer)
- Read replicas para queries pesadas
- Índices otimizados para queries frequentes
- Particionamento por clinic_id (futuro)

### Escalabilidade Vertical

**Database**:
- Upgrade de plano Supabase (mais CPU/RAM)
- Otimização de queries com EXPLAIN ANALYZE
- Materialização de views para agregações

**Backend**:
- Aumento de CPU/RAM por instância
- Otimização de código (N+1 queries, caching)

### Estratégias de Cache

**Frontend**:
- React Query cache (5 minutos padrão)
- Service Worker para offline (futuro)
- LocalStorage para preferências

**Backend**:
- Redis cache para queries frequentes (futuro)
- In-memory cache para configurações
- CDN cache para assets

### Limites Atuais

**Supabase Free Tier**:
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/mês
- 50.000 MAU (Monthly Active Users)

**AWS App Runner**:
- 25 GB/mês de build time (free tier)
- 100 GB/mês de bandwidth (free tier)

**Upstash Redis**:
- 10.000 comandos/dia (free tier)
- 256 MB storage

### Plano de Escala

**Fase 1: 0-100 clínicas** (Atual)
- Supabase Free Tier
- AWS Free Tier
- Upstash Free Tier
- Custo: ~$0/mês

**Fase 2: 100-500 clínicas**
- Supabase Pro ($25/mês)
- AWS App Runner ($10-50/mês)
- Upstash Pro ($10/mês)
- Custo: ~$50-100/mês

**Fase 3: 500-2000 clínicas**
- Supabase Team ($599/mês)
- AWS App Runner ($100-300/mês)
- Upstash Pro ($50/mês)
- Read replicas ($200/mês)
- Custo: ~$1000/mês

**Fase 4: 2000+ clínicas**
- Supabase Enterprise (custom)
- AWS ECS/EKS (custom)
- ElastiCache Redis (custom)
- Sharding por região
- Custo: $5000+/mês

## Segurança e Compliance

### Segurança em Camadas

**Camada 1: Network**
- HTTPS obrigatório (HSTS)
- CSP headers
- CORS configurado
- Rate limiting

**Camada 2: Autenticação**
- JWT com expiração curta (1h)
- Refresh tokens com rotação
- Logout em todos os dispositivos
- Session timeout (30 min inatividade)

**Camada 3: Autorização**
- RBAC (admin, therapist, secretary, patient)
- RLS no banco de dados
- Validação de clinic_id em todas as queries
- Guards no backend

**Camada 4: Dados**
- Sanitização de inputs
- Validação com Zod/class-validator
- Prepared statements (SQL injection protection)
- Criptografia em repouso (Supabase)
- Criptografia em trânsito (TLS 1.3)

### Compliance LGPD

**Direitos do Titular**:
- Acesso aos dados (GET /auth/profile)
- Correção de dados (PATCH /auth/profile)
- Exclusão de dados (DELETE /auth/account)
- Portabilidade (export JSON)

**Medidas Técnicas**:
- Logs de auditoria (futuro)
- Anonimização de dados deletados
- Backup com retenção de 30 dias
- Política de privacidade clara

## Monitoramento e Observabilidade

### Logs
- **Frontend**: Sentry para erros de JavaScript
- **Backend**: CloudWatch Logs (AWS App Runner)
- **Database**: Supabase Dashboard

### Métricas
- **Frontend**: Lighthouse CI, Web Vitals
- **Backend**: CloudWatch Metrics (CPU, memória, latência)
- **Database**: Supabase Dashboard (queries lentas, conexões)

### Alertas
- Erro 5xx > 1% das requisições
- Latência p95 > 2 segundos
- CPU > 80% por 5 minutos
- Disco > 90%

### Tracing (Futuro)
- OpenTelemetry para distributed tracing
- Correlação de requests entre frontend/backend/database
