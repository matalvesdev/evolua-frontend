-- =============================================================================
-- 20260511000001_changelog_entries.sql
-- Tabela do changelog público (rodapé da landing).
-- Lida pela anon key — RLS permite SELECT para qualquer um. Escrita só via
-- service_role (admin) ou painel do Supabase. Cada nova feature do produto
-- DEVE virar uma nova entrada aqui (manualmente ou via release script).
-- =============================================================================

create table if not exists public.changelog_entries (
  id            uuid primary key default gen_random_uuid(),
  versao        text not null,                                     -- ex: "v2.5"
  data          date not null default current_date,
  tipo          text not null check (tipo in ('Feature','Melhoria','Correção','Major Release','Seguranca')),
  titulo        text not null,
  descricao     text not null default '',
  itens         text[] not null default '{}',                       -- bullet points
  publicado     boolean not null default true,
  ordem         int not null default 0,                             -- desempate quando data igual
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint changelog_entries_versao_unica unique (versao)
);

create index if not exists changelog_entries_data_idx       on public.changelog_entries (data desc, ordem desc);
create index if not exists changelog_entries_publicado_idx  on public.changelog_entries (publicado) where publicado = true;

alter table public.changelog_entries enable row level security;

-- Leitura pública (anon + authenticated), apenas entradas publicadas.
drop policy if exists changelog_entries_select_public on public.changelog_entries;
create policy changelog_entries_select_public
  on public.changelog_entries
  for select
  to anon, authenticated
  using (publicado = true);

-- Trigger updated_at
create or replace function public.changelog_entries_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists changelog_entries_updated_at on public.changelog_entries;
create trigger changelog_entries_updated_at
  before update on public.changelog_entries
  for each row execute function public.changelog_entries_set_updated_at();

-- =============================================================================
-- Seed inicial: lançamento das novas páginas do rodapé
-- =============================================================================

insert into public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) values
(
  'v2.5.0',
  current_date,
  'Feature',
  'Rodapé expandido + base do changelog público',
  'Lançamos a base de páginas públicas que documentam o produto e dão canais de contato para usuárias. Daqui em diante, toda nova feature do Evolua vira uma entrada aqui no changelog — não importa o tamanho.',
  array[
    'Página de Changelog conectada ao banco (sem dados mockados)',
    'Página de Contato com formulário salvo direto no Supabase',
    'Central de Ajuda (FAQ) gerenciada por categoria',
    'Página de Segurança & LGPD com práticas e contato do DPO',
    'Política de Cookies dedicada',
    'Blog 100% baseado em dados reais — fim do fallback de mock'
  ],
  0
)
on conflict (versao) do update set
  data       = excluded.data,
  tipo       = excluded.tipo,
  titulo     = excluded.titulo,
  descricao  = excluded.descricao,
  itens      = excluded.itens,
  ordem      = excluded.ordem,
  publicado  = true;
