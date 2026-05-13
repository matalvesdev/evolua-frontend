-- =============================================================================
-- 20260511000003_faq_items.sql
-- Central de ajuda / FAQ — itens organizados por categoria.
-- Lida pela anon key. Escrita só via service_role.
-- =============================================================================

create table if not exists public.faq_items (
  id            uuid primary key default gen_random_uuid(),
  categoria     text not null check (categoria in ('Conta','Planos','Pagamento','Clínica','Pacientes','Segurança','IA','Integrações','Outros')),
  pergunta      text not null,
  resposta      text not null,                                      -- HTML simples permitido (renderizado via dompurify)
  ordem         int not null default 0,
  publicado     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists faq_items_categoria_idx on public.faq_items (categoria, ordem);
create index if not exists faq_items_publicado_idx on public.faq_items (publicado) where publicado = true;

alter table public.faq_items enable row level security;

drop policy if exists faq_items_select_public on public.faq_items;
create policy faq_items_select_public
  on public.faq_items
  for select
  to anon, authenticated
  using (publicado = true);

create or replace function public.faq_items_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists faq_items_updated_at on public.faq_items;
create trigger faq_items_updated_at
  before update on public.faq_items
  for each row execute function public.faq_items_set_updated_at();

-- =============================================================================
-- Seed inicial — perguntas mais frequentes da fase atual
-- =============================================================================

insert into public.faq_items (categoria, pergunta, resposta, ordem) values
  ('Conta',     'Como faço para criar minha conta no Evolua?',
                '<p>Acesse <strong>/cadastro</strong>, preencha seus dados profissionais e seu CRFa. A conta entra em modo trial automaticamente por 14 dias, sem cartão de crédito.</p>', 0),
  ('Conta',     'Esqueci minha senha. Como recupero?',
                '<p>Na tela de login, clique em "Esqueci minha senha". Você recebe um link por e-mail e o redefine em segundos.</p>', 1),
  ('Planos',    'Posso trocar de plano depois?',
                '<p>Sim. Você pode subir ou descer de plano a qualquer momento direto pelo painel, em <em>Configurações → Plano</em>. A cobrança é proporcional ao período usado.</p>', 0),
  ('Planos',    'O trial de 14 dias é gratuito mesmo?',
                '<p>Sim, totalmente. Sem cartão, sem cobrança automática no fim. Quando o trial acaba, você decide se assina ou não.</p>', 1),
  ('Pagamento', 'Quais formas de pagamento vocês aceitam?',
                '<p>Cartão de crédito (todas as bandeiras), Pix e boleto. A cobrança recorrente é feita via gateway certificado PCI-DSS — não armazenamos dados de cartão.</p>', 0),
  ('Pagamento', 'Recebo nota fiscal?',
                '<p>Sim, automaticamente. A nota fiscal eletrônica é emitida no dia do pagamento e enviada para o e-mail da titular.</p>', 1),
  ('Clínica',   'Quantas terapeutas podem usar a mesma conta?',
                '<p>Depende do plano. O <strong>Solo</strong> é individual. O <strong>Galera</strong> permite até 5 terapeutas. O <strong>Gigante</strong> não tem limite.</p>', 0),
  ('Pacientes', 'Como meu paciente acessa o app?',
                '<p>Você convida o paciente pelo WhatsApp ou e-mail direto pelo Evolua. Ele recebe um link, instala o app (iOS/Android) e tem acesso aos exercícios que você prescreveu.</p>', 0),
  ('Segurança', 'Os dados ficam armazenados onde?',
                '<p>Em servidores no Brasil, com criptografia em repouso (AES-256) e em trânsito (TLS 1.3). Veja detalhes em <a href="/seguranca" class="text-primary underline">/seguranca</a>.</p>', 0),
  ('Segurança', 'O Evolua é compatível com a LGPD?',
                '<p>Sim. Operamos como operador de dados em relação aos dados clínicos, com termo de consentimento eletrônico, log de auditoria e DPO designada. Detalhes na <a href="/privacidade" class="text-primary underline">Política de Privacidade</a>.</p>', 1),
  ('IA',        'A IA do Evolua substitui meu trabalho clínico?',
                '<p>Não. A IA gera <strong>rascunhos</strong> (de evolução, relatório, sumário pra cuidador) a partir do que você gravou ou digitou. <em>Você</em> revisa, ajusta e assina. O ato clínico continua sendo seu.</p>', 0),
  ('IA',        'Meus dados são usados para treinar modelos de IA públicos?',
                '<p>Nunca. Temos acordo contratual com nossos provedores de IA que proíbe esse uso. Dados clínicos ficam isolados em ambiente próprio.</p>', 1),
  ('Integrações','Posso conectar com Google Calendar?',
                '<p>Sim, com sincronização bidirecional. Configure em <em>Integrações → Google Calendar</em>.</p>', 0),
  ('Integrações','O WhatsApp do paciente fica integrado?',
                '<p>Sim. Usamos a API oficial do WhatsApp Business para confirmação de sessões, lembretes e remarcação — tudo logado no prontuário.</p>', 1),
  ('Outros',    'Como cancelo minha assinatura?',
                '<p>Em <em>Configurações → Plano → Cancelar assinatura</em>. Sem ligação, sem retenção forçada. Você mantém acesso até o fim do ciclo já pago e pode exportar todos os dados em PDF/CSV.</p>', 0)
on conflict do nothing;
