-- =============================================================================
-- 20260511000002_contact_messages.sql
-- Tabela de mensagens enviadas pelo formulário de contato da landing.
-- RLS: anon pode INSERT (com rate limit por IP em camada superior se preciso).
-- Leitura somente service_role / staff autenticado com role 'admin' ou 'staff'.
-- =============================================================================

create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  email         text not null,
  whatsapp      text,
  assunto       text not null default 'Geral'
                 check (assunto in ('Geral','Comercial','Suporte','Parcerias','Imprensa','Outro')),
  mensagem      text not null,
  user_agent    text,
  origem        text,                                               -- referrer ou página de origem
  status        text not null default 'novo'
                 check (status in ('novo','em-andamento','respondido','arquivado','spam')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint contact_messages_nome_min      check (char_length(nome) between 2 and 120),
  constraint contact_messages_mensagem_min  check (char_length(mensagem) between 10 and 4000),
  constraint contact_messages_email_format  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_status_idx  on public.contact_messages (status) where status = 'novo';

alter table public.contact_messages enable row level security;

-- INSERT público (anon + authenticated). Nenhuma política de SELECT/UPDATE/DELETE,
-- então apenas service_role (BYPASSRLS) consegue ler/alterar/remover.
drop policy if exists contact_messages_insert_public on public.contact_messages;
create policy contact_messages_insert_public
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    char_length(nome) between 2 and 120
    and char_length(mensagem) between 10 and 4000
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- Trigger updated_at
create or replace function public.contact_messages_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.contact_messages_set_updated_at();
