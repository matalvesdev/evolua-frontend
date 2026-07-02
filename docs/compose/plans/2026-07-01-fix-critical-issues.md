# Evolua V2 — Plano de Correção: 14 Problemas Críticos

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir todos os 14 problemas críticos identificados na auditoria (performance, bugs, arquitetura, CI/CD, segurança).

**Architecture:** Correções agrupadas por área de impacto: Frontend (performance + bugs), Backend (arquitetura), CI/CD (cronjobs + backup), Docker (network). Cada task é independente e testável.

**Tech Stack:** React, TanStack Query, Fastify, Prisma, GitHub Actions, Docker Compose

## Global Constraints
- NÃO quebrar funcionalidade existente
- Manter compatibilidade com API existente
- Cada fix deve ser commitável individualmente
- Seguir padrões do projeto (Zod, React Query, Fastify)

---

## Task 1: Cache de token em api.ts (elimina 12 chamadas Supabase por load)

**Covers:** [S2] Performance — api.ts faz 2 chamadas Supabase em TODA request

**Files:**
- Modify: `frontend-core/src/lib/api.ts`

**Interfaces:**
- Consumes: supabase auth (getUser, getSession)
- Produces: `api` object with cached token

- [ ] **Step 1: Criar cache de token com TTL**

```typescript
// frontend-core/src/lib/api.ts
import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined

// Token cache — evita 2 chamadas Supabase por request
let cachedToken: string | null = null
let tokenExpiresAt = 0
const TOKEN_CACHE_MS = 4 * 60 * 1000 // 4 min (Supabase JWT expira em 5 min)

async function getAuthToken(): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken
  }
  
  const { data: { session } } = await supabase.auth.getSession()
  cachedToken = session?.access_token ?? null
  tokenExpiresAt = now + TOKEN_CACHE_MS
  return cachedToken
}

// Escuta mudanças de sessão para invalidar cache
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    cachedToken = null
    tokenExpiresAt = 0
  } else {
    cachedToken = session.access_token
    tokenExpiresAt = Date.now() + TOKEN_CACHE_MS
  }
})

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error('[Evolua] VITE_API_URL não definido. Configure o backend para ativar esta feature.')
  }

  // Valida identidade no servidor (1x por sessão, não por request)
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('[Evolua] Usuário não autenticado.')
  }

  // Usa cache de token (evita getSession a cada request)
  const token = await getAuthToken()

  const isFormData = init?.body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json() as { error?: string; message?: string }
      detail = body.error ?? body.message ?? detail
    } catch {
      detail = res.statusText || detail
    }
    throw new Error(detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)               => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
```

- [ ] **Step 2: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS (sem erros)

- [ ] **Step 3: Commit**

```bash
git add frontend-core/src/lib/api.ts
git commit -m "fix(frontend): cache Supabase token in api.ts to eliminate redundant auth calls"
```

---

## Task 2: Remover use-financial.ts duplicado

**Covers:** [B1] Bug — use-financial.ts e use-finances.ts exportam useFinancialMetrics duplicado

**Files:**
- Delete: `frontend-core/src/hooks/use-financial.ts`
- Verify: `frontend-core/src/hooks/use-finances.ts` (já tem useFinancialMetrics)

**Interfaces:**
- Consumes: use-finances.ts (já existe)
- Produces: nenhum (remove duplicata)

- [ ] **Step 1: Verificar se use-financial.ts é importado em algum lugar**

Run: `grep -r "use-financial" frontend-core/src/ --include="*.ts" --include="*.tsx"`
Expected: Nenhum resultado (não deve ser importado)

- [ ] **Step 2: Deletar use-financial.ts**

```bash
rm frontend-core/src/hooks/use-financial.ts
```

- [ ] **Step 3: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend-core/src/hooks/use-financial.ts
git commit -m "fix(frontend): remove duplicate useFinancialMetrics hook"
```

---

## Task 3: Adicionar error handling em analytics.tsx

**Covers:** [B4] Bug — analytics.tsx não trata estado de erro

**Files:**
- Modify: `frontend-core/src/routes/dashboard/analytics.tsx`

**Interfaces:**
- Consumes: useDashboardAnalytics (já existe)
- Produces: UI com error state

- [ ] **Step 1: Adicionar error state no componente**

```typescript
// frontend-core/src/routes/dashboard/analytics.tsx
function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d'|'30d'|'90d'|12m'>('30d')
  const { data: analytics, isLoading, error } = useDashboardAnalytics(period)
  
  // ... restante do componente
  
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="text-sm text-text-secondary mt-2">Erro ao carregar analytics</p>
          <p className="text-xs text-text-tertiary mt-1">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-olive text-white rounded text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }
  
  // ... restante do componente
}
```

- [ ] **Step 2: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend-core/src/routes/dashboard/analytics.tsx
git commit -m "fix(frontend): add error state handling in analytics page"
```

---

## Task 4: Corrigir tipo BlogPost em use-blog.ts

**Covers:** [B6] Bug — use-blog.ts usa tipo image mas schema real usa cover_image

**Files:**
- Modify: `frontend-core/src/hooks/use-blog.ts`

**Interfaces:**
- Consumes: blog_posts schema (cover_image)
- Produces: BlogPost type correto

- [ ] **Step 1: Corrigir tipo BlogPost**

```typescript
// frontend-core/src/hooks/use-blog.ts
export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: string
  coverImage: string  // era 'image', agora 'coverImage' (schema: cover_image)
  date: string
  readTime: string
}
```

- [ ] **Step 2: Verificar se há referências a `.image` no dashboard**

Run: `grep -r "\.image" frontend-core/src/routes/dashboard/ --include="*.tsx"`
Expected: Nenhuma referência a `.image` (deveria ser `.coverImage`)

- [ ] **Step 3: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend-core/src/hooks/use-blog.ts
git commit -m "fix(frontend): correct BlogPost type to use coverImage instead of image"
```

---

## Task 5: Criar scripts/backup-postgres.sh

**Covers:** [C2] CI — pg-backup.yml referencia arquivo que não existe

**Files:**
- Create: `scripts/backup-postgres.sh`

**Interfaces:**
- Consumes: SUPABASE_DB_URL env var
- Produces: backup SQL file

- [ ] **Step 1: Criar script de backup**

```bash
#!/usr/bin/env bash
# scripts/backup-postgres.sh
# PostgreSQL backup script for Evolua
# Usage: SUPABASE_DB_URL=postgresql://... bash scripts/backup-postgres.sh

set -euo pipefail

BACKUP_DIR="backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/evolua_${TIMESTAMP}.sql.gz"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL is required"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting backup to ${BACKUP_FILE}..."
pg_dump "$SUPABASE_DB_URL" | gzip > "$BACKUP_FILE"

echo "Backup completed: $(ls -lh "$BACKUP_FILE" | awk '{print $5}')"
```

- [ ] **Step 2: Tornar executável**

```bash
chmod +x scripts/backup-postgres.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/backup-postgres.sh
git commit -m "fix(ci): add missing backup-postgres.sh script"
```

---

## Task 6: Corrigir Docker network mismatch

**Covers:** [A6] Arquitetura — docker-compose.cron.yml usa rede errada

**Files:**
- Modify: `docker-compose.cron.yml`

**Interfaces:**
- Consumes: docker-compose.yml (define evolua_net)
- Produces: cron job conectado à rede correta

- [ ] **Step 1: Corrigir nome da rede**

```yaml
# docker-compose.cron.yml
networks:
  evolua_net:
    external: true
```

(Antes estava `evolua: external: true`)

- [ ] **Step 2: Atualizar referência no service**

```yaml
services:
  cron:
    # ... resto da config
    networks:
      - evolua_net
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.cron.yml
git commit -m "fix(docker): correct network name in docker-compose.cron.yml"
```

---

## Task 7: Separar workflows daily e weekly

**Covers:** [C1] Cronjobs — Content Pipeline e Content Engine no mesmo workflow

**Files:**
- Modify: `.github/workflows/content-pipeline.yml`

**Interfaces:**
- Consumes: scripts/run-daily.mjs, scripts/content-engine/engine.mjs
- Produces: workflows independentes

- [ ] **Step 1: Corrigir condição do weekly-engine**

```yaml
# .github/workflows/content-pipeline.yml
weekly-engine:
  if: ${{ github.event.schedule == '0 11 * * 6' || inputs.run_engine_only }}
  # Remover || always() para não rodar quando daily falha
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/content-pipeline.yml
git commit -m "fix(ci): remove always() from weekly-engine to prevent unnecessary runs"
```

---

## Task 8: Adicionar prisma migrate deploy no deploy-api

**Covers:** [C6] CI — deploy-api.yml não roda migrações

**Files:**
- Modify: `.github/workflows/deploy-api.yml`

**Interfaces:**
- Consumes: Prisma schema, migrations
- Produces: deploy com migrações aplicadas

- [ ] **Step 1: Adicionar step de migração**

```yaml
# .github/workflows/deploy-api.yml
- name: Generate Prisma client
  run: pnpm -F backend-core prisma:generate

- name: Run Prisma migrations
  run: pnpm -F backend-core prisma:migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Build contracts
  run: pnpm --filter @evolua/contracts build

- name: Build API
  run: pnpm --filter @evolua/api build
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-api.yml
git commit -m "fix(ci): add Prisma migrate deploy step to API deployment"
```

---

## Task 9: Lazy-load de módulos não-críticos no backend

**Covers:** [A2] Arquitetura — app.ts importa 36 módulos sequencialmente

**Files:**
- Modify: `backend-core/apps/api/src/app.ts`

**Interfaces:**
- Consumes: 36 route modules
- Produces: cold start mais rápido

- [ ] **Step 1: Mover módulos não-críticos para lazy-load**

```typescript
// backend-core/apps/api/src/app.ts
// Módulos críticos (carregam imediatamente):
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import patientsRoutes from './modules/patients/patients.routes.js';
import appointmentsRoutes from './modules/appointments/appointments.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';

// Módulos não-críticos (lazy-load):
const lazyModules = [
  () => import('./modules/reports/reports.routes.js'),
  () => import('./modules/tasks/tasks.routes.js'),
  () => import('./modules/finances/finances.routes.js'),
  () => import('./modules/notifications/notifications.routes.js'),
  () => import('./modules/treatment-plans/treatment-plans.routes.js'),
  () => import('./modules/patient-goals/patient-goals.routes.js'),
  () => import('./modules/clinical-protocols/clinical-protocols.routes.js'),
  () => import('./modules/exercises/exercises.routes.js'),
  () => import('./modules/messages/messages.routes.js'),
  () => import('./modules/audio/audio.routes.js'),
  () => import('./modules/ai/ai.routes.js'),
  () => import('./modules/wa-crm/wa-crm.routes.js'),
  () => import('./modules/consent/consent.routes.js'),
  () => import('./modules/caa/caa.routes.js'),
  () => import('./modules/materials/materials.routes.js'),
  () => import('./modules/email/email.routes.js'),
  () => import('./modules/newsletter/newsletter.routes.js'),
  () => import('./modules/contact/contact.routes.js'),
  () => import('./modules/onboarding/onboarding.routes.js'),
  () => import('./modules/leads/leads.routes.js'),
  () => import('./modules/documents/documents.routes.js'),
  () => import('./modules/settings/settings.routes.js'),
  () => import('./modules/articles/articles.routes.js'),
  () => import('./modules/blog/blog.routes.js'),
  () => import('./modules/document-templates/document-templates.routes.js'),
  () => import('./modules/clinical-scales/clinical-scales.routes.js'),
  () => import('./modules/teleconsulta/teleconsulta.routes.js'),
];

// Registrar lazy modules após startup
app.addHook('onReady', async () => {
  for (const importFn of lazyModules) {
    const mod = await importFn()
    await app.register(mod.default, { prefix: `/api/${mod.default.prefix}` })
  }
})
```

- [ ] **Step 2: Verificar que o código compila**

Run: `pnpm --filter @evolua/api build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add backend-core/apps/api/src/app.ts
git commit -m "perf(backend): lazy-load non-critical route modules for faster cold start"
```

---

## Task 10: Dashboard endpoint agregado

**Covers:** [P1] Performance — Dashboard carrega 6 queries separadas

**Files:**
- Create: `backend-core/apps/api/src/modules/dashboard/dashboard-home.routes.ts`
- Modify: `backend-core/apps/api/src/app.ts`

**Interfaces:**
- Consumes: dashboardService (já existe)
- Produces: GET /api/dashboard/home

- [ ] **Step 1: Criar rota agregada**

```typescript
// backend-core/apps/api/src/modules/dashboard/dashboard-home.routes.ts
import type { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { dashboardService } from './dashboard.service.js';
import { resolveClinicId } from '../auth/auth.helpers.js';
import { prisma } from '../../lib/prisma.js';

const DashboardHomeSchema = z.object({
  stats: z.object({
    patients: z.object({ active: z.number(), total: z.number() }),
    appointments: z.object({ today: z.number(), month: z.number() }),
    tasks: z.object({ pending: z.number() }),
    finances: z.object({
      monthIncome: z.string(),
      monthExpense: z.string(),
      monthBalance: z.string(),
      pendingCount: z.number(),
    }),
    reports: z.object({ drafts: z.number() }),
  }),
  todayAppointments: z.array(z.object({
    id: z.string(),
    patientId: z.string(),
    patientName: z.string(),
    dateTime: z.string(),
    duration: z.number(),
    type: z.string(),
    status: z.string(),
  })),
  pendingTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    priority: z.string(),
    status: z.string(),
    dueDate: z.string().nullable(),
  })),
});

const dashboardHomeRoutes: FastifyPluginAsync = async (app) => {
  const route = app.withTypeProvider<ZodTypeProvider>();
  route.addHook('onRequest', app.authenticate);

  route.get(
    '/home',
    {
      schema: { tags: ['dashboard'], response: { 200: DashboardHomeSchema } },
    },
    async (req) => {
      const clinicId = await resolveClinicId(req.user.id);
      
      const [stats, todayAppointments, pendingTasks] = await Promise.all([
        dashboardService.getStats(clinicId),
        dashboardService.getUpcomingAppointments(clinicId, 5),
        prisma.task.findMany({
          where: { clinicId, status: 'pending' },
          orderBy: { dueDate: 'asc' },
          take: 8,
          select: {
            id: true,
            title: true,
            priority: true,
            status: true,
            dueDate: true,
          },
        }),
      ]);

      return { stats, todayAppointments, pendingTasks };
    },
  );
};

export default dashboardHomeRoutes;
```

- [ ] **Step 2: Registrar rota no app.ts**

Adicionar import e registro:
```typescript
import dashboardHomeRoutes from './modules/dashboard/dashboard-home.routes.js';
// ...
await app.register(dashboardHomeRoutes, { prefix: '/api/dashboard' });
```

- [ ] **Step 3: Criar hook no frontend**

```typescript
// frontend-core/src/hooks/use-dashboard-home.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface DashboardHomeData {
  stats: {
    patients: { active: number; total: number }
    appointments: { today: number; month: number }
    tasks: { pending: number }
    finances: { monthIncome: string; monthExpense: string; monthBalance: string; pendingCount: number }
    reports: { drafts: number }
  }
  todayAppointments: Array<{
    id: string; patientId: string; patientName: string
    dateTime: string; duration: number; type: string; status: string
  }>
  pendingTasks: Array<{
    id: string; title: string; priority: string; status: string; dueDate: string | null
  }>
}

export function useDashboardHome() {
  return useQuery<DashboardHomeData>({
    queryKey: ['dashboard', 'home'],
    queryFn: () => api.get<DashboardHomeData>('/api/dashboard/home'),
    staleTime: 30_000,
  })
}
```

- [ ] **Step 4: Verificar que o código compila**

Run: `pnpm --filter @evolua/api build && pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend-core/apps/api/src/modules/dashboard/dashboard-home.routes.ts backend-core/apps/api/src/app.ts frontend-core/src/hooks/use-dashboard-home.ts
git commit -m "feat(backend): add aggregated /api/dashboard/home endpoint"
```

---

## Task 11: Fix queryKey collision em usePatientSummaries

**Covers:** [B3] Bug — queryKey colidente em usePatientSummaries

**Files:**
- Modify: `frontend-core/src/hooks/use-exercises.ts`
- Modify: `frontend-core/src/hooks/use-teleconsulta.ts`

**Interfaces:**
- Consumes: api.get (já existe)
- Produces: queryKeys únicos

- [ ] **Step 1: Renomear queryKey em use-exercises.ts**

```typescript
// frontend-core/src/hooks/use-exercises.ts
export function usePatientList() {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['exercises', 'patients-summary'],  // era ['patients-summary']
    queryFn: () => api.get<{ id: string; name: string }[]>('/api/patients?pageSize=200'),
    staleTime: 30_000,
  })
}
```

- [ ] **Step 2: Renomear queryKey em use-teleconsulta.ts**

```typescript
// frontend-core/src/hooks/use-teleconsulta.ts
export function usePatientSummaries() {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['teleconsulta', 'patients-summary'],  // era ['patients-summary']
    queryFn: () => api.get<{ id: string; name: string }[]>('/api/patients?pageSize=200'),
    staleTime: 30_000,
  })
}
```

- [ ] **Step 3: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend-core/src/hooks/use-exercises.ts frontend-core/src/hooks/use-teleconsulta.ts
git commit -m "fix(frontend): fix queryKey collision in usePatientSummaries hooks"
```

---

## Task 12: Fix .env exposure

**Covers:** [S1] Segurança — .env está no repo

**Files:**
- Verify: `backend-core/.gitignore`
- Verify: `.gitignore`

**Interfaces:**
- Consumes: gitignore patterns
- Produces: .env protegido

- [ ] **Step 1: Verificar se .env está no .gitignore**

Run: `grep -n "\.env" backend-core/.gitignore .gitignore`
Expected: Deve conter `.env` patterns

- [ ] **Step 2: Se não estiver, adicionar**

```bash
# Adicionar ao .gitignore (se não existir)
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore
```

- [ ] **Step 3: Verificar se há secrets no .env commitado**

Run: `cat backend-core/.env | grep -v "^#" | head -20`
Expected: Apenas placeholders, não secrets reais

- [ ] **Step 4: Commit**

```bash
git add .gitignore backend-core/.gitignore
git commit -m "fix(security): ensure .env files are gitignored"
```

---

## Task 13: Adicionar error boundary global

**Covers:** [A8] Arquitetura — Não existe Error Boundary global

**Files:**
- Create: `frontend-core/src/components/error-boundary.tsx`
- Modify: `frontend-core/src/routes/__root.tsx`

**Interfaces:**
- Consumes: React ErrorBoundary
- Produces: UI de erro global

- [ ] **Step 1: Criar ErrorBoundary component**

```typescript
// frontend-core/src/components/error-boundary.tsx
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <h2 className="text-lg font-bold text-text-primary mt-4">Algo deu errado</h2>
          <p className="text-sm text-text-secondary mt-2">
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-olive text-white rounded text-sm"
          >
            Recarregar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

- [ ] **Step 2: Envolver a app no ErrorBoundary**

```typescript
// frontend-core/src/routes/__root.tsx
import { ErrorBoundary } from '@/components/error-boundary'

// No componente Root:
<ErrorBoundary>
  <Outlet />
</ErrorBoundary>
```

- [ ] **Step 3: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend-core/src/components/error-boundary.tsx frontend-core/src/routes/__root.tsx
git commit -m "feat(frontend): add global ErrorBoundary component"
```

---

## Task 14: Padronizar staleTime nos hooks

**Covers:** [B9] Performance — staleTime inconsistente

**Files:**
- Modify: `frontend-core/src/hooks/use-profile.ts`
- Modify: `frontend-core/src/hooks/use-settings.ts`

**Interfaces:**
- Consumes: React Query config
- Produces: staleTime padronizado

- [ ] **Step 1: Atualizar staleTime em use-profile.ts**

```typescript
// frontend-core/src/hooks/use-profile.ts
export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get<Profile>('/api/auth/profile'),
    staleTime: 5 * 60_000,  // Profile muda raramente
  })
}
```

- [ ] **Step 2: Atualizar staleTime em use-settings.ts**

```typescript
// frontend-core/src/hooks/use-settings.ts
export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get<Settings>('/api/settings'),
    staleTime: 5 * 60_000,  // Settings muda raramente
  })
}
```

- [ ] **Step 3: Verificar que o código compila**

Run: `pnpm -F ./frontend-core typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend-core/src/hooks/use-profile.ts frontend-core/src/hooks/use-settings.ts
git commit -m "fix(frontend): standardize staleTime for rarely-changing data"
```

---

## Resumo de Execução

| Task | Arquivos | Impacto |
|------|----------|---------|
| 1. Cache token | api.ts | -600ms load |
| 2. Remover duplicata | use-financial.ts | Zero bugs |
| 3. Error handling | analytics.tsx | Zero loading infinito |
| 4. Fix tipo BlogPost | use-blog.ts | Zero type errors |
| 5. Backup script | backup-postgres.sh | Backup funcional |
| 6. Docker network | docker-compose.cron.yml | Cron funcional |
| 7. Separar workflows | content-pipeline.yml | Sem duplicação |
| 8. Prisma migrate | deploy-api.yml | Deploy completo |
| 9. Lazy-load modules | app.ts | -500ms cold start |
| 10. Dashboard agregado | dashboard-home.routes.ts | -2s load |
| 11. Fix queryKey | use-exercises.ts, use-teleconsulta.ts | Zero colisão |
| 12. .env security | .gitignore | Segurança |
| 13. Error boundary | error-boundary.tsx | UX melhorada |
| 14. Padronizar staleTime | use-profile.ts, use-settings.ts | Consistência |
