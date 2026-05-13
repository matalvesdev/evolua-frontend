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
3. Campos obrigatórios:
   - `versao` (text, UNIQUE) — ex: `v2.6.0`
   - `data_lancamento` (date)
   - `tipo` — um de: `Feature`, `Melhoria`, `Correção`, `Major Release`, `Seguranca`
   - `titulo` (text)
   - `descricao` (text)
   - `destaques` (text[]) — lista de bullets curtos
   - `ordem` (int) — usar timestamp epoch ou contador crescente para ordenar
4. Rodar `supabase db push` (ou aplicar via CI) para enviar a migration.

## Exemplo

```sql
insert into public.changelog_entries
  (versao, data_lancamento, tipo, titulo, descricao, destaques, ordem)
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
  data_lancamento = excluded.data_lancamento,
  tipo            = excluded.tipo,
  titulo          = excluded.titulo,
  descricao       = excluded.descricao,
  destaques       = excluded.destaques,
  ordem           = excluded.ordem;
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
