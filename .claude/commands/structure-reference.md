# 🗂️ Estrutura de Arquivos & Referência Rápida

## Frontend Structure

```
frontend-evolua/
├── src/
│   ├── app/                          # Rotas Next.js 16 (App Router)
│   │   ├── (auth)/                   # Grupo de rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (app)/                    # Grupo de rotas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx          # Lista
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx      # Detalhe
│   │   │   │   │   └── edit/
│   │   │   ├── appointments/
│   │   │   └── reports/
│   │   ├── middleware.ts             # Auth, CSP, rate limit
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── patients/                 # Feature-specific components
│   │   │   ├── patient-card.tsx
│   │   │   ├── patient-form.tsx
│   │   │   ├── patients-list.tsx
│   │   │   └── patient-details.tsx
│   │   ├── appointments/
│   │   ├── reports/
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   └── shared/                   # Componentes reutilizáveis
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── empty-state.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-patients.ts
│   │   ├── use-appointments.ts
│   │   ├── use-patient-form.ts
│   │   └── use-auth.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # HTTP client base
│   │   │   ├── helpers.ts            # Helpers de API
│   │   │   └── endpoints/
│   │   │       ├── patients.ts
│   │   │       ├── appointments.ts
│   │   │       └── reports.ts
│   │   ├── security/
│   │   │   ├── sanitize.ts           # HTML/Input sanitization
│   │   │   ├── rbac.ts               # Role-based access control
│   │   │   └── csrf.ts               # CSRF protection
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase browser client
│   │   │   └── service-role.ts       # Service role (server-only)
│   │   ├── types/
│   │   │   ├── patient.ts
│   │   │   ├── appointment.ts
│   │   │   ├── user.ts
│   │   │   └── common.ts
│   │   ├── schemas/
│   │   │   ├── patient.schema.ts     # Zod schemas
│   │   │   ├── appointment.schema.ts
│   │   │   └── auth.schema.ts
│   │   ├── utils/
│   │   │   ├── format.ts             # Formatação (data, moeda, etc)
│   │   │   ├── helpers.ts            # Helpers gerais
│   │   │   ├── cn.ts                 # classNames utility
│   │   │   └── date.ts               # Date utilities
│   │   └── constants.ts              # Constantes da app
│   │
│   ├── types/
│   │   └── index.ts                  # Tipos globais re-exportados
│   │
│   ├── services/                     # Lógica de negócio
│   │   ├── patient.service.ts
│   │   ├── appointment.service.ts
│   │   └── auth.service.ts
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── __tests__/                        # Testes
│   ├── patients/
│   ├── appointments/
│   └── utils/
│
└── public/                           # Arquivos estáticos
    ├── images/
    ├── icons/
    └── manifest.json
```

## Backend Structure

```
backend-evolua/backend-evolua/
├── src/
│   ├── app.module.ts                 # Root module
│   ├── main.ts                       # Entry point
│   │
│   ├── auth/                         # Auth module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   │       └── jwt.guard.ts
│   │
│   ├── patients/                     # Patients module
│   │   ├── patients.module.ts
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   ├── dto/
│   │   │   ├── create-patient.dto.ts
│   │   │   └── update-patient.dto.ts
│   │   └── entities/
│   │       └── patient.entity.ts
│   │
│   ├── appointments/
│   ├── reports/
│   ├── finances/
│   ├── messages/
│   ├── notifications/
│   ├── tasks/
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   ├── middleware/
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── supabase/
│       ├── supabase.module.ts
│       └── supabase.service.ts
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/
│       └── [timestamp]_init/
│           └── migration.sql
│
└── test/                             # Testes E2E
    └── app.e2e-spec.ts
```

---

## Referência Rápida - Onde Procurar

| Necessidade | Arquivo |
|---|---|
| Criar novo componente | `frontend-evolua/src/components/[feature]/` |
| Criar hook customizado | `frontend-evolua/src/hooks/use-[feature].ts` |
| Criar página | `frontend-evolua/src/app/(app)/[route]/page.tsx` |
| Chamar API | `frontend-evolua/src/lib/api/endpoints/[resource].ts` |
| Validar form | `frontend-evolua/src/lib/schemas/[resource].schema.ts` |
| Tipo de dados | `frontend-evolua/src/lib/types/[resource].ts` |
| Middleware | `frontend-evolua/src/middleware.ts` |
| Segurança | `frontend-evolua/src/lib/security/` |
| Criar endpoint NestJS | `backend-evolua/backend-evolua/src/[module]/` |
| DTO validação | `backend-evolua/backend-evolua/src/[module]/dto/` |
| Serviço de negócio | `backend-evolua/backend-evolua/src/[module]/[module].service.ts` |
| Schema database | `backend-evolua/backend-evolua/prisma/schema.prisma` |

---

## Enum de Status Comuns

### Pacientes
```typescript
type PatientStatus = 'active' | 'inactive' | 'discharged' | 'archived'
```

### Agendamentos
```typescript
type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
```

### Relatórios
```typescript
type ReportStatus = 'draft' | 'reviewed' | 'approved' | 'archived'
```

### Finanças
```typescript
type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
```

---

## Design System Colors

```typescript
// Primary (Roxo)
#8A05BE - Primary
#6B037F - Dark
#A726D3 - Light

// Neutrals
#FFFFFF - White
#F5F5F5 - Light Gray
#E0E0E0 - Gray
#757575 - Dark Gray
#212121 - Almost Black

// Status
#4CAF50 - Success Green
#FF9800 - Warning Orange
#F44336 - Error Red
#2196F3 - Info Blue
```

---

## Configuração de Ambientes

### Development
```
URL Frontend: http://localhost:3000
URL Backend: http://localhost:3333
Database: Supabase (dev)
```

### Staging
```
URL Frontend: develop.d13ha6b4opi2ib.amplifyapp.com
URL Backend: App Runner (staging)
Database: Supabase (staging)
```

### Production
```
URL Frontend: main.d13ha6b4opi2ib.amplifyapp.com
URL Backend: App Runner (prod)
Database: Supabase (prod)
```

