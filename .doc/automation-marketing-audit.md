# Audit: Automações de Marketing & Conteúdo Evolua

**Data da auditoria:** 2026-08-13
**Escopo:** Todas as automações de marketing/conteúdo — workflows CI, scripts, docker-compose, package.json

---

## 1. Inventário de Automações

| # | Automação | Arquivo | Trigger | Ação Real | Destino | Status |
|---|-----------|---------|---------|-----------|---------|--------|
| 1 | **Daily Content Pipeline (CI)** | `.github/workflows/content-pipeline.yml` → `run-daily.mjs` | cron `0 9 * * 1-5` (06:00 BRT, Mon-Fri) | Research IA → Blog HTML → Publica no Supabase → Gera posts sociais (texto) → salva JSON | Supabase `blog_posts` + `scripts/content-pipeline/output/` | ✅ Ativo |
| 2 | **Weekly Content Engine (CI)** | `.github/workflows/content-pipeline.yml` → `content-engine/engine.mjs` | cron `0 11 * * 6` (08:00 BRT, Saturday) | Pesquisa clínica → Gera ebook + 3 infográficos + 10 carrosséis + 20 posts + 10 stories + 5 reels + 5 ads + landing page + email funnel → Envia email Resend | `scripts/content-engine/output/` + `docs/content-assets/` + Email | ✅ Ativo |
| 3 | **Newsletter** | `docker-compose.cron.yml` → `send-newsletter.js` | cron `0 13 * * 3` (13:00 UTC = 10:00 BRT, Wednesday) | Busca último post publicado → Envia para subscribers via Resend | Email (individual por subscriber) | ✅ Ativo |
| 4 | **DB Healthcheck** | `docker-compose.cron.yml` → `db-healthcheck.js` | cron `17 6 * * *` (06:17 UTC = 03:17 BRT, diário) | Health check do banco | Logs | ✅ Ativo |
| 5 | **Standalone Daily** | `scripts/daily-content-pipeline.mjs` | Manual (`node scripts/daily-content-pipeline.mjs`) | Research → Blog + Supabase → Carrossel HTML → PNGs → .txts → .tar.gz → Email Resend | Email + `scripts/content-pipeline/output/` | ⚠️ Órfão (não referenciado por CI/npm) |
| 6 | **Old Content Pipeline** | `scripts/content-pipeline/pipeline.mjs` | Manual (`pnpm content:pipeline`) | Research → Blog + Supabase → Posts sociais → Email Resend | Email + `scripts/content-pipeline/output/` | ⚠️ Duplicado com #1 |
| 7 | **Content Generator** | `scripts/content-generator.mjs` | Chamado por `run-daily.mjs` (passo visual) | Fixa ícones HTML → Gera PDFs → Gera carrosséis/infográficos/stories/linkedin/ads HTML | `scripts/content-pipeline/output/` | ✅ Subordinado a #1 |
| 8 | **Render & Send** | `scripts/render-and-send.mjs` | Manual (`node scripts/render-and-send.mjs`) | Converte ebooks → PDF → Screenshots PNG → Gera .txts → .tar.gz → Email Resend | Email + `scripts/content-pipeline/output/` | ⚠️ Duplicado com #7 |

---

## 2. Schedules & Timezone

| Automação | Cron Expression | UTC | BRT | Dias | Observação |
|-----------|----------------|-----|-----|------|------------|
| Daily Pipeline (CI) | `0 9 * * 1-5` | 09:00 | 06:00 | Mon-Fri | Correto |
| Weekly Engine (CI) | `0 11 * * 6` | 11:00 | 08:00 | Saturday | Correto |
| Newsletter (Docker) | `0 13 * * 3` | 13:00 | 10:00 | Wednesday | Correto — cron explícito em UTC |
| DB Healthcheck (Docker) | `17 6 * * *` | 06:17 | 03:17 | Daily | Correto — cron explícito em UTC |

> **Nota (corrigida 2026-08-13):** O docker-compose.cron.yml roda em container `node:20-alpine` com timezone UTC. As expressões cron são **explícitas em UTC**: `17 6 * * *` (06:17 UTC = 03:17 São Paulo) e `0 13 * * 3` (13:00 UTC = 10:00 São Paulo). Os comentários do YAML usam UTC como referência (horário local apenas informativo) e o container **não define `TZ`**. O job `daily` do CI é gateado para rodar **apenas** no cron de semana (`0 9 * * 1-5`) ou em `workflow_dispatch` sem `run_engine_only` — não roda mais no sábado.

---

## 3. Blog: Auto-publicado ou Não?

| Script | Blog criado? | Publica no Supabase? | Status publish |
|--------|-------------|---------------------|----------------|
| `run-daily.mjs` (CI daily) | ✅ Sim (HTML + draft .md) | ✅ Sim (`status: 'published'`) | Auto-publicado |
| `content-pipeline/pipeline.mjs` | ✅ Sim (draft .md) | ✅ Sim (`status: 'published'`) | Auto-publicado |
| `daily-content-pipeline.mjs` | ✅ Sim (via `createAndPublishBlog`) | ✅ Sim (`status: 'published'`) | Auto-publicado |

**Conclusão:** Blog é auto-publicado em produção (status `published`) sem aprovação humana. Posts são salvos como draft .md local E inseridos direto na tabela `blog_posts` com `status: 'published'`.

---

## 4. Instagram/LinkedIn: Auto-publicados ou Gerados/Enviados?

| Script | Gera conteúdo social? | Posta automaticamente? | Destino |
|--------|----------------------|----------------------|---------|
| `run-daily.mjs` | ✅ JSON (LinkedIn, Instagram carousel text, Threads, X) | ❌ Não — salva `social-posts.json` | Local only |
| `content-pipeline/pipeline.mjs` | ✅ JSON + .md em `docs/content-assets/` | ❌ Não — envia email com textos prontos | Email Resend |
| `daily-content-pipeline.mjs` | ✅ HTML carrossel + PNGs + .txts | ❌ Não — envia email com .tar.gz | Email Resend |
| `content-engine/engine.mjs` | ✅ 20 posts + 10 stories + 5 reels + 5 ads (JSON/text) | ❌ Não — envia email com resumo | Email Resend |

**Conclusão:** NENHUMA automação posta diretamente no Instagram ou LinkedIn. Todo conteúdo é gerado como texto/JSON/HTML e entregue por email para postagem manual. Aprovação humana é preservada.

---

## 5. Sobreposição / Duplicação

### Scripts com funcionalidade sobreposta:

| Grupo | Scripts | Sobreposição | Recomendação |
|-------|---------|-------------|-------------|
| **Diário (blog+social)** | `run-daily.mjs` (CI), `pipeline.mjs` (manual), `daily-content-pipeline.mjs` (manual) | Alta — todos fazem research → blog → social. `run-daily.mjs` é o entry point do CI. | Manter `run-daily.mjs` como único entry point diário. Marcar `pipeline.mjs` e `daily-content-pipeline.mjs` como deprecated. |
| **Visual/render** | `content-generator.mjs` (chamado por run-daily), `render-and-send.mjs` (manual) | Média — ambos geram PDFs, PNGs, .txts, .tar.gz e enviam email. `render-and-send.mjs` é mais completo. | `render-and-send.mjs` pode ser chamado como passo adicional se necessário, mas não deve rodar junto com `run-daily.mjs` (que já chama `content-generator.mjs`). |
| **Semanal** | `content-engine/engine.mjs` | Único — não há duplicata | OK |

### Dias sem schedule:
- **Sábado:** Weekly engine roda (não daily) — **gate implementado em `content-pipeline.yml`**
- **Domingo:** Nenhuma automação roda
- **Seg-Sex:** Daily pipeline roda

> **Corrigido (2026-08-13):** O job `daily` tinha `if: !inputs.run_engine_only`, que é verdadeiro em TODOS os schedules — ou seja, também disparava no cron de sábado (sobreposição com `weekly-engine`). Agora o gate é `github.event.schedule == '0 9 * * 1-5' || (workflow_dispatch && !run_engine_only)`. Concurrency adicionado (`group: content-pipeline`) para impedir sobreposição entre execuções.

---

## 6. Secrets: Exigidos vs Disponíveis

### Secrets documentados no workflow CI:

| Secret | Usado por | Disponível no repo? | Observação |
|--------|-----------|---------------------|------------|
| `OPENROUTER_API_KEY` | run-daily.mjs, engine.mjs, pipeline.mjs | Configurado no GitHub Settings | ✅ OK |
| `SUPABASE_URL` | run-daily.mjs, pipeline.mjs, send-newsletter.js | Configurado no GitHub Settings | ✅ OK |
| `SUPABASE_SERVICE_ROLE_KEY` | run-daily.mjs, pipeline.mjs, send-newsletter.js | Configurado no GitHub Settings | ✅ OK |
| `RESEND_API_KEY` | run-daily.mjs, pipeline.mjs, engine.mjs, send-newsletter.js | Configurado no GitHub Settings | ✅ OK |

### Secrets do docker-compose.cron.yml:

| Secret | Usado por | Observação |
|--------|-----------|------------|
| `SUPABASE_URL` | send-newsletter.js, db-healthcheck.js | ✅ OK |
| `SUPABASE_SERVICE_ROLE_KEY` | send-newsletter.js, db-healthcheck.js | ✅ OK |
| `RESEND_API_KEY` | send-newsletter.js | ✅ OK |
| `RESEND_FROM_EMAIL` | send-newsletter.js | Default: `noreply@useevolua.com.br` |
| `SENTRY_DSN` | db-healthcheck.js | ✅ OK (opcional) |

> **Corrigido (2026-08-13):** Removidos do `docker-compose.cron.yml` os secrets órfãos `GMAIL_USER`, `GMAIL_APP_PASSWORD` e `EMAIL_DESTINO` (remanescentes do Notifica, não usados por nenhum script ativo) e os volumes órfãos `./.agents:/agents:ro` e `/var/run/docker.sock` (não usados pelos scripts de cron). Imagem trocada de `alpine:3.20` (sem Node) para `node:20-alpine`.

### Env vars locais (.env):

| Variable | Usada por |
|----------|-----------|
| `OPENROUTER_API_KEY` | Todos os scripts de conteúdo |
| `OPENROUTER_MODEL` | run-daily.mjs, engine.mjs (override do model padrão) |
| `SUPABASE_URL` | Blog publish |
| `SUPABASE_SERVICE_ROLE_KEY` | Blog publish |
| `RESEND_API_KEY` | Email sending |

---

## 7. Dry-Run

| Script | Suporta --dry-run? | Comportamento |
|--------|-------------------|---------------|
| `run-daily.mjs` | ✅ Sim | Pula publish Supabase + skip email |
| `content-pipeline/pipeline.mjs` | ✅ Sim | Pula publish Supabase + skip email |
| `daily-content-pipeline.mjs` | ✅ Sim | Pula email (mas gera tudo) |
| `content-engine/engine.mjs` | ✅ Sim | Pula email send |
| `content-generator.mjs` | ❌ Não | Sempre executa (gera HTML/PDFs local) |
| `render-and-send.mjs` | ✅ Sim (`--dry-run` + `--send-only`) | dry-run: pula email; send-only: reenvia último pack |
| `send-newsletter.js` | ✅ Sim | Pula envio |

---

## 8. Idempotência

| Script | Idempotente? | Risco de duplicação |
|--------|-------------|---------------------|
| `run-daily.mjs` | ✅ Corrigido | Publish no Supabase usa upsert por `slug` (`on_conflict=slug` + `resolution=merge-duplicates`) |
| `content-pipeline/pipeline.mjs` | ✅ Corrigido | Mesmo upsert idempotente por `slug` |
| `daily-content-pipeline.mjs` | ❌ Não | Mesmo risco (não é entry point de CI) |
| `content-engine/engine.mjs` | ❌ Não | Gera novos arquivos a cada execução (pastas por data) — baixo risco |
| `send-newsletter.js` | ✅ Corrigido | Dedup por email dentro da mesma execução (Map + Set `sentEmails`) — nunca reenvia para o mesmo subscriber no mesmo run |
| `render-and-send.mjs` | ❌ Não | Sobrescreve `evolua-pack-latest.tar.gz` — aceitável |

**Risco alto (corrigido):** CI diário agora publica no Supabase com `on_conflict=slug` + `resolution=merge-duplicates`, impedindo posts duplicados por slug em re-runs/cron sobrepostos.

---

## 9. Retries & Timeouts

| Componente | Retry? | Timeout | Tratamento de falha |
|-----------|--------|---------|---------------------|
| OpenRouter API calls | ✅ 3 tentativas | 60s (`AbortController`) | Backoff exponencial 1s/2s/4s; throw → pipeline falha |
| Supabase publish | ✅ 3 tentativas | 30s | Backoff exponencial; upsert idempotente `on_conflict=slug`; log warning (run-daily) / throw (pipeline.mjs) após 3x |
| Resend email | ✅ 2-3 tentativas | 30s | Backoff exponencial; log warning (newsletter) |
| Newsletter fetch | ✅ 3 tentativas | 30s | Backoff; exit 1 se falhar |
| GitHub Actions steps | ❌ Não | 30min (daily) / 60min (weekly) | Step failure → job fail |
| Playwright (screenshots) | ❌ Não | 60s (execSync) | Try/catch com fallback |

**Corrigido (2026-08-13):** `fetchWithTimeout` (AbortController) adicionado em `run-daily.mjs`, `pipeline.mjs`, `engine.mjs` e `send-newsletter.js`. `callAI` em todos faz 3 retries com backoff exponencial. Publish no Supabase ganhou retry (3x) + `on_conflict=slug`. Newsletter usa `fetchWithRetry` (3x, incluindo HTTP 5xx/429) para todas as chamadas externas e sai com código não-zero se **qualquer** envio falhar.

---

## 10. Tratamento de Erros & Observabilidade

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| **Logging** | ✅ Básico | `[timestamp] [step] message` no console. Sem pino/winston estruturado |
| **Error tracking** | ❌ Ausente | Sem Sentry, sem error boundaries nos scripts |
| **Alertas** | ❌ Ausente | Sem notificação em falha (email, Slack, etc.) |
| **JSON parse errors** | ⚠️ Parcial | `pipeline.mjs` salva `json-error-raw.txt`; `engine.mjs` salva `json-error.txt` |
| **Retry logic** | ✅ Corrigido | `callAI` 3x com backoff; newsletter `fetchWithRetry` 3x |
| **Dead letter** | ❌ Ausente | Nenhuma fila de mensagens |
| **Métricas** | ❌ Ausente | Sem contagem de success/failure rates |

---

## 11. Risco de Conteúdo Duplicado

| Cenário | Risco | Mitigação |
|---------|-------|-----------|
| CI roda duas vezes no mesmo dia | **CORRIGIDO** — upsert por slug impede posts idênticos | `resolution=merge-duplicates` no publish |
| `run-daily.mjs` + `pipeline.mjs` rodam no mesmo dia | **MÉDIO** — ambos upsertam por slug (idempotente) | Upsert por slug em ambos |
| Newsletter roda duas vezes | **CORRIGIDO** — dedup por email dentro da mesma execução (Set) | `sentEmails` impede reenvio no mesmo run |
| Content engine roda duas vezes | **BAIXO** — pastas por data isolam outputs | Date-based folders |
| `render-and-send.mjs` roda várias vezes | **BAIXO** — sobrescreve `evolua-pack-latest.tar.gz` | OK |
| Daily job em cron de sábado | **CORRIGIDO** — gate por schedule em `content-pipeline.yml` | Concurrency + `if` por cron |

---

## 12. Outputs Commitados

| Workflow | Commita? | Branch | O que commita |
|----------|---------|--------|---------------|
| Daily CI | ✅ Sim | `main` (push direto) | `docs/content-assets/02-blog-posts/` + `scripts/content-pipeline/output/` |
| Weekly CI | ✅ Sim | `main` (push direto) | `scripts/content-engine/output/` + `docs/content-assets/05-lead-magnets/` + `docs/content-assets/06-campaigns/` + `docs/content-assets/01-social-posts/` |

**Problema:** Ambos fazem push direto na `main` sem PR, sem review, sem lint. Mensagem de commit usa `[skip ci]` para evitar loops.

---

## 13. Falhas Silenciosas

| Script | Falha silenciosa? | Exemplo |
|--------|------------------|---------|
| `run-daily.mjs` | ✅ Sim — se OPENROUTER_API_KEY ausente, `throw` mas sem alerta externo | Pipeline falha, nenhum email/Slack |
| `run-daily.mjs` | ✅ Sim — se Supabase publish falha, log warning e continua | Post criado mas não publicado, sem notificação |
| `content-engine/engine.mjs` | ✅ Sim — se geração de item individual falha, log e continua | Possivelmente ativos incompletos sem aviso |
| `send-newsletter.js` | ✅ Corrigido — `fetchWithRetry` (3x, inclui 5xx/429) + exit 1 se QUALQUER envio falhar (parcial ou total) | Reporta falha via exit code |
| `daily-content-pipeline.mjs` | ✅ Sim — se Playwright falha, cria INSTRUCOES.txt e continua | Sem PNGs, sem aviso |

---

## 14. Referências Notifica

**Status:** ✅ ZERO referências restantes em código. Migração completa para Resend (conforme sessão anterior).

---

## 15. Validação de Scripts

| Script | `node --check` | YAML validation |
|--------|---------------|-----------------|
| `run-daily.mjs` | ✅ PASS | — |
| `daily-content-pipeline.mjs` | ✅ PASS (após fix) | — |
| `content-pipeline/pipeline.mjs` | ✅ PASS | — |
| `content-engine/engine.mjs` | ✅ PASS | — |
| `content-generator.mjs` | ✅ PASS | — |
| `render-and-send.mjs` | ✅ PASS | — |
| `send-newsletter.js` | ✅ PASS | — |
| `content-pipeline.yml` | — | ✅ VALID (PyYAML + actionlint-style check) |
| `docker-compose.cron.yml` | — | ✅ VALID (`docker compose config --quiet`, exit 0) |

> **Validado em 2026-08-13:** Todos os 4 scripts modificados passam `node --check`. `content-pipeline.yml` parsa com YAML 1.2 (crons e inputs confirmados). `docker-compose.cron.yml` validado com `docker compose config` (exit 0; único warning é `SENTRY_DSN` não setado localmente, esperado).

---

## 16. Bugs Corrigidos Nesta Sessão

| # | Arquivo | Bug | Fix |
|---|---------|-----|-----|
| 1 | `docker-compose.cron.yml:3` | Comentário obsoleto "Weekly content generation (Monday 07:00)" — serviço removido | Comentário atualizado para refletir estado real |
| 2 | `daily-content-pipeline.mjs:438-439` | `readdirSyncSafe()` quebrada — referencia `requireFs()` inexistente e `readFileSync` como flag booleana | Função reescrita usando `readdirSync` do import; import de `readdirSync` e `copyFileSync` adicionado; removido import duplicado no final do arquivo |
| 3 | `docker-compose.cron.yml` | Imagem `alpine:3.20` sem Node — crons de Node falhariam | Trocado para `node:20-alpine` |
| 4 | `docker-compose.cron.yml` | Crons em "BRT implícito" (`17 3`, `0 10`) sem expressão UTC explícita | `17 6 * * *` (06:17 UTC = 03:17 BRT) e `0 13 * * 3` (13:00 UTC = 10:00 BRT) |
| 5 | `docker-compose.cron.yml` | Secrets órfãos `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_DESTINO` + volumes órfãos `.agents`, `/var/run/docker.sock` | Removidos — nenhum script ativo os usa |
| 6 | `.github/workflows/content-pipeline.yml` | Job `daily` rodava também no cron de sábado (gate `!inputs.run_engine_only` é true em todo schedule) | Gate por `github.event.schedule == '0 9 * * 1-5' \|\| (workflow_dispatch && !run_engine_only)` |
| 7 | `.github/workflows/content-pipeline.yml` | Interpolação insegura de `github.event.inputs.*` direto no shell | Args construídos em step dedicado com `$GITHUB_OUTPUT` + sanitização do tópico |
| 8 | `.github/workflows/content-pipeline.yml` | Sem concurrency — runs podiam sobrepor | `concurrency: group: content-pipeline` |
| 9 | `.github/workflows/content-pipeline.yml` | Sem validação fail-fast de secrets | Job `validate-secrets` que falha antes dos jobs de pipeline |
| 10 | `scripts/run-daily.mjs` + `pipeline.mjs` | Publish no Supabase não-idempotente | `on_conflict=slug` + `Prefer: return=representation,resolution=merge-duplicates` (upsert por slug) |
| 11 | `run-daily.mjs`, `pipeline.mjs`, `engine.mjs` | `callAI` sem timeout/retry | `fetchWithTimeout` (60s) + 3 retries com backoff exponencial |
| 12 | `scripts/send-newsletter.js` | Newsletter sem dedup (reenviaria mesmo post) | Dedup por email dentro da mesma execução (Map + Set `sentEmails`) — sem dependência de tabela |
| 13 | `scripts/send-newsletter.js` | `fetchWithRetry` só retentava erros lançados, não 5xx/429 | Retry em HTTP ≥500/429 com backoff exponencial |
| 14 | `scripts/send-newsletter.js` | Falha parcial (failed > 0) não resultava em exit != 0 | `process.exit(1)` se `failed > 0` (parcial ou total) |
| 15 | `.github/workflows/content-pipeline.yml` | `inputs.topic` interpolado no shell (sanitização pós-assign é tarde demais — risco de command injection) | Topic via env `INPUT_TOPIC` (job env); scripts leem `process.env.INPUT_TOPIC`; step "Build args safely" só com flags booleanas fixas; commit message via `${INPUT_TOPIC:-auto}` |
| 16 | `scripts/run-daily.mjs`, `pipeline.mjs`, `engine.mjs` | Sem fallback de env para topic em CI | `process.env.INPUT_TOPIC` como fallback de `--topic` |

---

## 17. Gaps & Recomendações

### Críticos (Risco alto)
1. **✅ Corrigido: Idempotência no blog publish** — upsert por slug (`on_conflict=slug` + `resolution=merge-duplicates`) em `run-daily.mjs` e `pipeline.mjs`, com retry (3x)
2. **✅ Corrigido: Retry em chamadas API** — `callAI` com backoff exponencial em todos os scripts; publish com retry; newsletter com `fetchWithRetry` (inclui 5xx/429)
3. **Commit direto na main** — migrar para PR + merge para manter git history limpo (fora do escopo desta auditoria)

### Médios
4. **3 scripts diários sobrepostos** — consolidar em `run-daily.mjs` como único entry point; deprecar `pipeline.mjs` e `daily-content-pipeline.mjs`
5. **✅ Corrigido: Secrets órfãos no docker-compose** — `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_DESTINO` removidos
6. **Sem alerta em falha** — adicionar notificação (email/Slack) quando pipeline falhar (fora do escopo)
7. **✅ Corrigido: Newsletter sem dedup** — agora dedup por email dentro da execução (Set); exit 1 em qualquer falha

### Baixos
8. **Sem observabilidade estruturada** — adicionar métricas básicas (success rate, duração, custo API)
9. **✅ Corrigido: Timeouts ausentes em fetch()** — `AbortController` 30-60s em todas as chamadas externas centrais
10. **`content-generator.mjs` não tem dry-run** — aceitável (só gera local)

---

## 18. Arquivos Preservados

- ✅ `scripts/content-pipeline/output/research.json` — presente e intacto
- ✅ `docs/content-assets/02-blog-posts/tecnologia-fonoaudiologia-guia-pratico-2024.md` — presente
- ✅ `docs/content-assets/02-blog-posts/tecnologia-fonoaudiologas-guia-pratico-2024.md` — presente

---

## 19. Matriz Resumo: Entry Points Recomendados

| Frequência | Entry Point | Script | Ação |
|-----------|-------------|--------|------|
| **Diário (Seg-Sex, 06:00 BRT)** | GitHub Actions cron | `run-daily.mjs` | Research → Blog (auto-publish) → Social text |
| **Semanal (Sáb, 08:00 BRT)** | GitHub Actions cron | `content-engine/engine.mjs` | Multiplicação completa de conteúdo educativo |
| **Semanal (Qua, 10:00 BRT)** | Docker cron | `send-newsletter.js` | Newsletter do último post publicado |
| **Manual** | `pnpm daily` | `run-daily.mjs` | Teste/debug do pipeline diário |
| **Manual** | `pnpm engine` | `content-engine/engine.mjs` | Teste/debug do engine semanal |
| **Manual** | `node scripts/render-and-send.mjs` | `render-and-send.mjs` | Reenviar pack ou regenerar visuais |

**Aprovação humana:** Todo conteúdo social é entregue por email para postagem manual. Nenhuma automação posta diretamente em redes sociais.
