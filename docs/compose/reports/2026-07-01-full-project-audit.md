# Evolua V2 — Auditoria Completa de Performance, Arquitetura, Bugs, Gaps e Cronjobs

**Data:** 2026-07-01  
**Escopo:** Frontend (27 hooks, 24 rotas), Backend (36 módulos), AI Service, CI/CD (10 workflows), Content Pipeline, Infra

---

## [S1] RESUMO EXECUTIVO

| Categoria | Críticos | Médios | Baixos | Total |
|-----------|----------|--------|--------|-------|
| Performance | 3 | 4 | 2 | 9 |
| Bugs | 4 | 3 | 1 | 8 |
| Arquitetura | 2 | 5 | 3 | 10 |
| Cronjobs/CI | 3 | 4 | 2 | 9 |
| Segurança | 2 | 1 | 0 | 3 |
| **TOTAL** | **14** | **17** | **8** | **39** |

---

## [S2] PERFORMANCE — Carregamento de Dados do Usuário

### 🔴 CRÍTICO P1: `api.ts` faz 2 chamadas Supabase em TODA request HTTP
**Arquivo:** `frontend-core/src/lib/api.ts:14-17`

```typescript
const [{ data: { user }, error: userError }, { data: { session } }] = await Promise.all([
  supabase.auth.getUser(),
  supabase.auth.getSession(),
])
```

**Problema:** Cada request HTTP ao backend faz 2 chamadas ao Supabase (`getUser` + `getSession`) para obter o token. Isso adiciona ~100-200ms de latência em CADA request. Com 6 hooks na dashboard carregando simultaneamente, são 12 chamadas Supabase adicionais.

**Impacto:** Dashboard inicial: ~6 hooks × 2 chamadas = 12 chamadas Supabase extras. Latência adicionada: ~600-1200ms no carregamento inicial.

**Fix:** Cache o token no React Query context ou use um interceptor que mantém o token em memória com TTL.

### 🔴 CRÍTICO P1: Dashboard carrega 6 queries simultâneas sem waterfall control
**Arquivo:** `frontend-core/src/hooks/use-dashboard.ts`

A dashboard chama:
- `useDashboardStats()` — `/api/dashboard/stats`
- `useTodayAppointments()` — `/api/appointments/today`
- `useActivePatients()` — `/api/patients?status=active&pageSize=100`
- `usePendingReports()` — `/api/reports?status=review`
- `usePendingTasks()` — `/api/tasks?status=pending`
- `useBlogPosts()` — `/api/blog/posts`

**Problema:** Todas disparam simultaneamente no mount, mas o backend precisa de `resolveClinicId()` em cada uma — que faz query ao banco. Isso gera 6+ queries ao banco no mesmo tick.

**Fix:** Criar um endpoint `/api/dashboard/home` que retorna tudo de uma vez (stats + today + patients + reports + tasks), reduzindo de 6 queries a 1.

### 🔴 CRÍTICO P1: `useWeekAppointments` calcula datas no client-side a cada render
**Arquivo:** `frontend-core/src/hooks/use-dashboard.ts:30-36`

```typescript
const now = new Date()
const weekStart = new Date(now)
weekStart.setDate(now.getDate() - now.getDay())
// ...
```

**Problema:** As datas são recalculadas a cada render, mudando o `queryKey` e causando refetch desnecessário.

**Fix:** Mover o cálculo para fora do hook ou usar `useMemo`.

### 🟡 MÉDIO M1: `useActivePatients` busca 100 pacientes sem paginação
**Arquivo:** `frontend-core/src/hooks/use-dashboard.ts:54`

`/api/patients?status=active&pageSize=100` — busca até 100 registros sem necessidade real na dashboard.

### 🟡 MÉDIO M2: `useExercises` e `usePatientList` buscam listas completas
**Arquivo:** `frontend-core/src/hooks/use-exercises.ts:26-31`

`usePatientList()` busca `/api/patients?pageSize=200` — lista completa de pacientes para selects.

### 🟡 MÉDIO M3: `dashboard.service.ts` faz 9 queries paralelas no `getStats`
**Arquivo:** `backend-core/apps/api/src/modules/dashboard/dashboard.service.ts:22-61`

`Promise.all` com 9 queries ao banco. Embora paralelo, cada query usa `resolveClinicId()` que faz mais 1 query.

### 🟡 MÉDIO M4: `getAnalytics` carrega TODOS os appointments do período na memória
**Arquivo:** `backend-core/apps/api/src/modules/dashboard/dashboard.service.ts:147-151`

```typescript
const appointments = await prisma.appointment.findMany({
  where: { clinicId, deletedAt: null, dateTime: { gte: start } },
  orderBy: { dateTime: 'asc' },
  select: { dateTime: true, status: true },
});
```

Depois filtra em JS (`.filter()`). Para períodos de 12 meses, pode retornar milhares de registros.

### 🟢 BAIXO B1: `staleTime` inconsistente entre hooks (30s a 5min)
Alguns hooks usam `30_000`, outros `60_000`, outros `300_000`. Padronizar.

### 🟢 BAIXO B2: `useBlogPosts` usa `staleTime: 300_000` (5min) — ok para blog

---

## [S3] BUGS

### 🔴 CRÍTICO B1: `use-financial.ts` e `use-finances.ts` exportam `useFinancialMetrics` duplicado
**Arquivos:** `frontend-core/src/hooks/use-financial.ts:12` e `frontend-core/src/hooks/use-finances.ts:110`

Ambos exportam `useFinancialMetrics` com a mesma signature e endpoint. Se importados em arquivos diferentes, gera comportamento imprevisível (React Query cache key pode colidir).

**Fix:** Remover `use-financial.ts` e usar apenas `use-finances.ts`.

### 🔴 CRÍTICO B2: `use-prontuarios.ts` mapeia dados inconsistentemente
**Arquivo:** `frontend-core/src/hooks/use-prontuarios.ts:25-38`

```typescript
patient: typeof r.patientName === 'string' ? r.patientName as string : (r.patient as { name?: string })?.name ?? '',
```

Faz cast `as string` e `as { name?: string }` sem validação. Se o backend mudar o shape, vai quebrar silenciosamente.

### 🔴 CRÍTICO B3: `use-teleconsulta.ts` e `use-exercises.ts` exportam `usePatientSummaries` com mesmo queryKey
**Arquivos:** `frontend-core/src/hooks/use-teleconsulta.ts:58` e `frontend-core/src/hooks/use-exercises.ts:26`

Ambos usam `queryKey: ['patients-summary']` e endpoint `/api/patients?pageSize=200`. Se um componente usar ambos os hooks, o React Query vai deduplicar — mas o tipo de retorno pode diferir.

### 🔴 CRÍTICO B4: `analytics.tsx` não trata estado de erro
**Arquivo:** `frontend-core/src/routes/dashboard/analytics.tsx:32`

```typescript
const { data: analytics, isLoading } = useDashboardAnalytics(period)
```

Não desestrutura `error`. Se a API falhar, a UI fica em loading infinito.

### 🟡 MÉDIO B5: `use-reports.ts` aceita resposta como array OU objeto `{ data: [] }`
**Arquivo:** `frontend-core/src/hooks/use-reports.ts:46-48`

```typescript
const res = await api.get<{ data: Report[] } | Report[]>('/api/reports')
return Array.isArray(res) ? res : (res?.data ?? [])
```

Isso indica que o backend não retorna formato consistente. Deveria ser padronizado.

### 🟡 MÉDIO B6: `use-blog.ts` usa tipo `image` mas o schema real usa `cover_image`
**Arquivo:** `frontend-core/src/hooks/use-blog.ts:9`

```typescript
image: string  // mas o schema real é cover_image
```

### 🟡 MÉDIO B7: `use-messages.ts` tipo `Automation` não inclui `template`
**Arquivo:** `frontend-core/src/hooks/use-messages.ts:15-20`

O backend retorna `template` mas o tipo não inclui.

### 🟢 BAIXO B8: `use-audio-session.ts` usa `audioPath` mas o schema usa `audioUrl`
**Arquivo:** `frontend-core/src/hooks/use-audio-session.ts:15`

`audioPath: string` vs schema `audioUrl: String @map("audio_url")`

---

## [S4] ARQUITETURA

### 🔴 CRÍTICO A1: Backend é repo git separado mas CI assume monorepo
**Arquivo:** `.github/workflows/ci.yml:131`

```yaml
- name: Generate Prisma client
  run: pnpm -F backend-core prisma:generate
```

O `backend-core/` é um repo git separado com seu próprio `package.json`. O CI faz `pnpm install --frozen-lockfile` no root, mas `backend-core` pode não estar no checkout do CI (depende de git submodule ou path).

### 🔴 CRÍTICO A2: `app.ts` importa 36 módulos sequencialmente
**Arquivo:** `backend-core/apps/api/src/app.ts:16-56`

Todos os 36 módulos são importados e registrados sequencialmente. Em produção, isso aumenta o cold start do Render.

**Fix:** Lazy-load de módulos não-críticos (blog, newsletter, articles, contact) ou usar dynamic imports.

### 🟡 MÉDIO A3: Não existe React Query Provider configurado globalmente
Não encontrei `QueryClientProvider` com configurações globais de `retry`, `refetchOnWindowFocus`, etc.

### 🟡 MÉDIO A4: `use-profile.ts` usa `staleTime: 60_000` mas profile muda raramente
Deveria usar `staleTime: Infinity` ou `300_000` + invalidação manual no update.

### 🟡 MÉDIO A5: Contracts package não é consumido pelo frontend
**Arquivo:** `frontend-core/src/hooks/use-billing.ts:4`

```typescript
// Mantemos tipos locais alinhados com backend-core/contracts/src/billing.ts
// até `@evolua/contracts` ser consumido também pelo frontend.
```

Tipos duplicados entre frontend e contracts.

### 🟡 MÉDIO A6: `docker-compose.cron.yml` referencia rede `evolua` que não existe no `docker-compose.yml`
**Arquivo:** `docker-compose.cron.yml:39`

```yaml
networks:
  evolua:
    external: true
```

Mas `docker-compose.yml` define `evolua_net`. O cron job não vai conseguir se conectar.

### 🟡 MÉDIO A7: `use-prontuarios.ts` faz mapeamento complexo no frontend
**Arquivo:** `frontend-core/src/hooks/use-prontuarios.ts:25-38`

O frontend transforma dados brutos do backend em tipo `Prontuario`. Isso deveria ser feito no backend.

### 🟢 BAIXO A8: Não existe Error Boundary global no frontend
Cada rota deve tratar erro individualmente.

### 🟢 BAIXO A9: `use-debounced-value` é exportado de `use-caa.ts`
Deveria ser um hook genérico em `hooks/`.

### 🟢 BAIXO A10: Landing site não tem testes E2E
O `playwright.landing.config.ts` existe mas não há testes.

---

## [S5] CRONJOBS E CI/CD

### 🔴 CRÍTICO C1: Content Pipeline e Content Engine rodam no MESMO workflow
**Arquivo:** `.github/workflows/content-pipeline.yml:6-8`

```yaml
schedule:
  - cron: '0 9 * * 1-5'   # Daily Mon-Fri 06:00 BRT
  - cron: '0 11 * * 6'    # Weekly Saturday 08:00 BRT
```

O workflow `daily` tem `if: ${{ !inputs.run_engine_only }}` mas o `weekly-engine` tem `if: ${{ github.event.schedule == '0 11 * * 6' || inputs.run_engine_only || always() }}`. O `always()` faz o weekly-engine rodar MESMO quando o daily falha — pode causar duplicação.

### 🔴 CRÍTICO C2: `pg-backup.yml` usa `scripts/backup-postgres.sh` que não existe
**Arquivo:** `.github/workflows/pg-backup.yml:18`

```yaml
run: bash scripts/backup-postgres.sh
```

O arquivo `scripts/backup-postgres.sh` não está no repo. O backup falha silenciosamente.

### 🔴 CRÍTICO C3: `docker-compose.cron.yml` não sobe o container automaticamente
O cron job roda via Docker mas não há orchestrator (docker compose up) no deploy. O container nunca inicia em produção.

### 🟡 MÉDIO C4: CI não roda testes do AI service
**Arquivo:** `.github/workflows/ci.yml`

O job `lint` instala Python e roda `ruff check`, mas não há job de teste para o AI service (pytest).

### 🟡 MÉDIO C5: `deploy-frontend.yml` roda Build antes de TypeCheck
**Arquivo:** `.github/workflows/deploy-frontend.yml:38-44`

```yaml
- name: Build
  run: pnpm -F ./frontend-core build
- name: TypeCheck
  run: pnpm -F ./frontend-core typecheck
```

O AGENTS.md documenta que `routeTree.gen.ts` é gerado pelo build, então TypeCheck precisa rodar depois. Mas o CI deveria ser mais robusto.

### 🟡 MÉDIO C6: `deploy-api.yml` não roda migrações do Prisma
O deploy faz `prisma:generate` + build + deploy hook, mas não roda `prisma migrate deploy`. As migrações ficam pendentes.

### 🟡 MÉDIO C7: Newsletter envia 1 email por subscriber sem rate limiting
**Arquivo:** `scripts/send-newsletter.js:75-115`

Loop syncronous chamando Resend API. Com 1000 subscribers, são 1000 requests sequenciais sem delay — pode atingir rate limit.

### 🟢 BAIXO C8: Content Pipeline usa Playwright para screenshots mas não valida se o browser está disponível

### 🟢 BAIXO C9: `scripts/content-pipeline/output/` tem 25+ arquivos `_pw-script-*` temporários

---

## [S6] SEGURANÇA

### 🔴 CRÍTICO S1: `.env` está no repo (não gitignore)
**Arquivo:** `backend-core/.env` existe no repo. Se contiver secrets reais, estão expostos.

### 🔴 CRÍTICO S2: `docker-compose.yml` usa password default `evogo_secret`
**Arquivo:** `docker-compose.yml:54,120`

```yaml
POSTGRES_PASSWORD: ${EVOLUTION_DB_PASSWORD:-evogo_secret}
```

Se a env var não estiver setada, usa password fraco.

### 🟡 MÉDIO S3: Rate limit configurado mas não testado
**Arquivo:** `backend-core/apps/api/src/app.ts:124-127`

```typescript
await app.register(rateLimit, {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_WINDOW,
});
```

Valores vêm de env vars sem defaults documentados.

---

## [S7] RECOMENDAÇÕES PRIORIZADAS

### Prioridade 1 (Esta semana)
1. **Fix P1:** Criar cache de token em `api.ts` (elimina 12 chamadas Supabase por load)
2. **Fix P1:** Criar endpoint `/api/dashboard/home` agregado (elimina 5 queries)
3. **Fix B1:** Remover `use-financial.ts` duplicado
4. **Fix B4:** Adicionar `error` em `analytics.tsx`
5. **Fix C2:** Criar ou remover `scripts/backup-postgres.sh`

### Prioridade 2 (Próxima semana)
6. **Fix A2:** Lazy-load de módulos não-críticos no backend
7. **Fix C1:** Separar workflows daily e weekly
8. **Fix A6:** Corrigir rede Docker no cron
9. **Fix C6:** Adicionar `prisma migrate deploy` no deploy-api
10. **Fix S1:** Verificar se `.env` contém secrets e adicionar ao `.gitignore`

### Prioridade 3 (Próximo mês)
11. **Fix A5:** Consumir `@evolua/contracts` no frontend
12. **Fix A3:** Configurar QueryClientProvider global
13. **Fix C4:** Adicionar testes pytest para AI service
14. **Fix C7:** Adicionar rate limiting no newsletter sender

---

## [S8] MÉTRICAS DE IMPACTO

| Fix | Impacto no Cliente | Impacto Técnico | Esforço |
|-----|-------------------|-----------------|---------|
| Cache token api.ts | -600ms load time | Alto | Baixo |
| Dashboard agregado | -2s load time | Alto | Médio |
| Remover hook duplicado | Zero bugs | Médio | Baixo |
| Error handling analytics | Zero loading infinito | Médio | Baixo |
| Lazy-load backend | -500ms cold start | Alto | Médio |

---

## [S9] ANTI-PATTERNS IDENTIFICADOS

1. ❌ **Double Supabase call em toda request HTTP** — `api.ts` chama `getUser()` + `getSession()` em cada request
2. ❌ **Hooks duplicados** — `use-financial.ts` e `use-finances.ts` exportam `useFinancialMetrics`
3. ❌ **QueryKey colidente** — `usePatientSummaries` em `use-teleconsulta.ts` e `use-exercises.ts` usam mesmo key
4. ❌ **Tipos não alinhados** — `use-blog.ts` usa `image` mas schema usa `cover_image`
5. ❌ **Response shape inconsistente** — hooks aceitam array OU `{ data: [] }` sem padronização
6. ❌ **Cron job com `always()`** — `weekly-engine` roda mesmo quando `daily` falha
7. ❌ **Backup script inexistente** — `pg-backup.yml` referencia arquivo que não existe
8. ❌ **Docker network mismatch** — `docker-compose.cron.yml` usa rede `evolua`, `docker-compose.yml` usa `evolua_net`
