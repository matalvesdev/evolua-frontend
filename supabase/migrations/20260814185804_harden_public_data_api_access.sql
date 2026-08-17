-- Harden authorization claims and make the landing's intended Data API
-- surface explicit. New Supabase projects no longer expose public tables to
-- anon/authenticated automatically, so RLS policies alone are insufficient.

create or replace function public.current_user_role()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'user');
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to anon, authenticated;

-- Tabelas de conteúdo podem estar ausentes em staging durante a migração
-- incremental. Conceder privilégios apenas à superfície que existe, sem
-- criar tabelas silenciosamente nem abrir acesso a dados clínicos.
do $$
begin
  if to_regclass('public.blog_posts') is not null then
    grant select on table public.blog_posts to anon, authenticated;
    grant all privileges on table public.blog_posts to service_role;
  end if;

  if to_regclass('public.changelog_entries') is not null then
    grant select on table public.changelog_entries to anon, authenticated;
    grant all privileges on table public.changelog_entries to service_role;
  end if;

  if to_regclass('public.faq_items') is not null then
    grant select on table public.faq_items to anon, authenticated;
    grant all privileges on table public.faq_items to service_role;
  end if;

  if to_regclass('public.contact_messages') is not null then
    grant insert on table public.contact_messages to anon, authenticated;
    grant all privileges on table public.contact_messages to service_role;
  end if;

  if to_regclass('public.newsletter_subscribers') is not null then
    -- Unsubscribe links use an unguessable identifier instead of exposing the
    -- subscriber email. Only the backend service role can resolve this token.
    alter table public.newsletter_subscribers
      add column if not exists unsubscribe_token uuid;

    update public.newsletter_subscribers
    set unsubscribe_token = gen_random_uuid()
    where unsubscribe_token is null;

    alter table public.newsletter_subscribers
      alter column unsubscribe_token set default gen_random_uuid(),
      alter column unsubscribe_token set not null;

    execute 'create unique index if not exists newsletter_subscribers_unsubscribe_token_idx on public.newsletter_subscribers (unsubscribe_token)';
    grant insert on table public.newsletter_subscribers to anon, authenticated;
    grant all privileges on table public.newsletter_subscribers to service_role;
  end if;
end
$$;
