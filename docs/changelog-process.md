# Processo de Manutenção do Changelog

O changelog público em `/changelog` é alimentado pela tabela
`public.changelog_entries` no Supabase. Não usamos mocks: cada entrada
representa um lançamento real do Evolua.

## Quando adicionar uma entrada

Adicionar uma nova entrada **toda vez** que uma das condições for verdadeira:

- Uma nova feature visível ao usuário foi lançada em produção
- Uma correção relevante foi publicada (impacto perceptível)
- Houve uma mudança de segurança/LGPD
- Há um release major com várias mudanças agrupadas

Não criar entrada para refactor interno, ajuste de copy minúsculo ou
mudanças invisíveis ao usuário final.

## Como adicionar uma nova entrada

1. Criar uma nova migration em `supabase/migrations/` seguindo o padrão de
   timestamp `YYYYMMDDHHMMSS_changelog_vX_Y_Z.sql`.
2. Conteúdo da migration: `INSERT ... ON CONFLICT (versao) DO UPDATE SET ...`
   na tabela `public.changelog_entries`.
3. Campos (nomes reais das colunas — ver `supabase/migrations/007_changelog.sql`):
   - `versao` (text, UNIQUE) — ex: `v2.7.0`
   - `data` (date) — data de lançamento
   - `tipo` — um de: `Feature`, `Melhoria`, `Correção`, `Major Release`, `Seguranca`
   - `titulo` (text)
   - `descricao` (text)
   - `itens` (text[]) — lista de bullets curtos
   - `ordem` (int) — desempate quando `data` igual (epoch crescente)
   - `publicado` (bool, default true)
4. Aplicar em produção: ao dar push da migration em `main`, o workflow
   **`.github/workflows/deploy-supabase-migrations.yml`** roda
   `scripts/apply-supabase-migrations.sh`, que aplica apenas migrations novas
   (ledger `public._supabase_sql_migrations`). Também é possível disparar
   manualmente via `workflow_dispatch` (input `DEPLOY`). A página `/changelog`
   lê direto do Supabase — não precisa de redeploy da landing.

## Exemplo

```sql
insert into public.changelog_entries
  (versao, data, tipo, titulo, descricao, itens, ordem)
values (
  'v2.6.0',
  '2026-05-18',
  'Feature',
  'Lembretes inteligentes por WhatsApp',
  'Lembretes automáticos 24h e 2h antes da sessão, com confirmação por SIM.',
  array[
    'Confirmação por palavra-chave',
    'Reagendamento via link curto',
    'Estatísticas de no-show no painel'
  ],
  2026051800
)
on conflict (versao) do update set
  data       = excluded.data,
  tipo       = excluded.tipo,
  titulo     = excluded.titulo,
  descricao  = excluded.descricao,
  itens      = excluded.itens,
  ordem      = excluded.ordem,
  publicado  = true;
```

## Onde aparece

- Tabela: `public.changelog_entries` (RLS: SELECT público)
- Lib: `landing-core/src/lib/changelog.ts`
- Query: `landing-core/src/queries/changelog.ts`
- Rota: `landing-core/src/routes/changelog.tsx`

## Convenções de versionamento

- **Major** (`vX.0.0`) — mudança visual ou de arquitetura grande
- **Minor** (`v2.X.0`) — nova feature visível
- **Patch** (`v2.5.X`) — correção ou melhoria pequena
