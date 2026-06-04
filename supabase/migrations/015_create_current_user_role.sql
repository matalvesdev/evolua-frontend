-- Migration: Create current_user_role() function for RLS policies
-- As políticas de RLS em 002_leads_onboarding_newsletter.sql referenciam
-- current_user_role() mas a função nunca foi criada. Isso causa falha
-- silenciosa em todas as queries contra leads, newsletter_subscribers
-- (admin SELECT) e content_drafts.

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select coalesce(
    (select raw_user_meta_data->>'role' from auth.users where id = auth.uid()),
    'user'
  );
$$;

-- Garantir que a função seja acessível via RLS
-- (funções em public são acessíveis por padrão, mas reforçamos)
grant execute on function public.current_user_role() to anon, authenticated;
