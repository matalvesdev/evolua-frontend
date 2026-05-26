-- Migration: Tabela changelog_entries + seed entries
-- Cria a tabela se não existir e insere entradas para o histórico.

CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao        TEXT NOT NULL,
  data          DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo          TEXT NOT NULL CHECK (tipo IN ('Feature','Melhoria','Correção','Major Release','Seguranca')),
  titulo        TEXT NOT NULL,
  descricao     TEXT NOT NULL DEFAULT '',
  itens         TEXT[] NOT NULL DEFAULT '{}',
  publicado     BOOLEAN NOT NULL DEFAULT true,
  ordem         INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT changelog_entries_versao_unica UNIQUE (versao)
);

CREATE INDEX IF NOT EXISTS changelog_entries_data_idx ON public.changelog_entries (data DESC, ordem DESC);
CREATE INDEX IF NOT EXISTS changelog_entries_publicado_idx ON public.changelog_entries (publicado) WHERE publicado = TRUE;

ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS changelog_entries_select_public ON public.changelog_entries;
CREATE POLICY changelog_entries_select_public
  ON public.changelog_entries
  FOR SELECT
  TO anon, authenticated
  USING (publicado = TRUE);

CREATE OR REPLACE FUNCTION public.changelog_entries_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS changelog_entries_updated_at ON public.changelog_entries;
CREATE TRIGGER changelog_entries_updated_at
  BEFORE UPDATE ON public.changelog_entries
  FOR EACH ROW EXECUTE FUNCTION public.changelog_entries_set_updated_at();

-- Seed: v2.5.0 — lançamento das páginas públicas
INSERT INTO public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) VALUES
(
  'v2.5.0',
  CURRENT_DATE,
  'Feature',
  'Rodapé expandido + base do changelog público',
  'Lançamos a base de páginas públicas que documentam o produto e dão canais de contato para usuárias.',
  ARRAY[
    'Página de Changelog conectada ao banco (sem dados mockados)',
    'Página de Contato com formulário salvo direto no Supabase',
    'Central de Ajuda (FAQ) gerenciada por categoria',
    'Página de Segurança & LGPD com práticas e contato do DPO',
    'Política de Cookies dedicada',
    'Blog 100% baseado em dados reais'
  ],
  1
)
ON CONFLICT (versao) DO UPDATE SET
  data       = EXCLUDED.data,
  tipo       = EXCLUDED.tipo,
  titulo     = EXCLUDED.titulo,
  descricao  = EXCLUDED.descricao,
  itens      = EXCLUDED.itens,
  ordem      = EXCLUDED.ordem,
  publicado  = TRUE;

-- Seed: v2.6.0 — lançamento oficial Evolua
INSERT INTO public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) VALUES
(
  'v2.6.0',
  CURRENT_DATE,
  'Major Release',
  'Lançamento oficial do Evolua CRM',
  'Primeira versão pública do Evolua — o CRM inteligente para fonoaudiólogas. WhatsApp nativo, IA, blog e muito mais.',
  ARRAY[
    'WhatsApp nativo via Evolution API — mensagens, lembretes e campanhas sem sair do sistema',
    'IA integrada para relatórios, exercícios e análise de evolução',
    'Blog com conteúdo sobre fonoaudiologia e gestão de clínicas',
    'Newsletter semanal "Fono em Foco" com as novidades do blog',
    'LGPD completo — banner de cookies, política de privacidade e DPO',
    'Analytics com GA4 e consent mode',
    'SMTP fallback para emails transacionais',
    'Rate limiting, CSP headers, error boundaries — segurança e estabilidade',
    'Sitemap + robots.txt para SEO',
    'Backup automático do banco (semanal + manual)'
  ],
  2
)
ON CONFLICT (versao) DO UPDATE SET
  data       = EXCLUDED.data,
  tipo       = EXCLUDED.tipo,
  titulo     = EXCLUDED.titulo,
  descricao  = EXCLUDED.descricao,
  itens      = EXCLUDED.itens,
  ordem      = EXCLUDED.ordem,
  publicado  = TRUE;
