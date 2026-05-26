-- Migration: Corrige nomes de colunas da blog_posts (português → inglês)
-- A tabela existe com colunas em português de uma migration Prisma anterior.
-- O 005_blog_newsletter.sql não conseguiu recriar porque usou CREATE TABLE IF NOT EXISTS.
-- Esta migration renomeia as colunas para o padrão que o código espera.

DO $$
BEGIN
  -- Renomear colunas de português para inglês apenas se:
  -- 1. A coluna antiga ainda existe (não foi renomeada antes)
  -- 2. A coluna nova ainda não existe (para evitar conflito)
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='titulo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='title') THEN
    ALTER TABLE blog_posts RENAME COLUMN titulo TO title;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='subtitulo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='excerpt') THEN
    ALTER TABLE blog_posts RENAME COLUMN subtitulo TO excerpt;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='categoria')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='category') THEN
    ALTER TABLE blog_posts RENAME COLUMN categoria TO category;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='imagem')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='cover_image') THEN
    ALTER TABLE blog_posts RENAME COLUMN imagem TO cover_image;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='data')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='published_at') THEN
    ALTER TABLE blog_posts RENAME COLUMN data TO published_at;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='tempo_leitura')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='read_time') THEN
    ALTER TABLE blog_posts RENAME COLUMN tempo_leitura TO read_time;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='autor')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='author') THEN
    ALTER TABLE blog_posts RENAME COLUMN autor TO author;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='corpo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='content') THEN
    ALTER TABLE blog_posts RENAME COLUMN corpo TO content;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='destaque')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured') THEN
    ALTER TABLE blog_posts RENAME COLUMN destaque TO featured;
  END IF;

  -- Adicionar colunas que podem estar faltando
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='excerpt') THEN
    ALTER TABLE blog_posts ADD COLUMN excerpt TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='category') THEN
    ALTER TABLE blog_posts ADD COLUMN category TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='read_time') THEN
    ALTER TABLE blog_posts ADD COLUMN read_time INTEGER DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured') THEN
    ALTER TABLE blog_posts ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='cover_image') THEN
    ALTER TABLE blog_posts ADD COLUMN cover_image TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='published_at') THEN
    ALTER TABLE blog_posts ADD COLUMN published_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='status') THEN
    ALTER TABLE blog_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));
  END IF;

  -- Garantir que updated_at existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='updated_at') THEN
    ALTER TABLE blog_posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ============================================================================
-- Newsletter: adiciona coluna status (faltante na migration 005)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='newsletter_subscribers' AND column_name='status') THEN
    ALTER TABLE newsletter_subscribers ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled'));
  END IF;
END $$;

-- Seed: primeiro post do blog (INSERT ... SELECT para permitir WHERE NOT EXISTS)
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Evolua: o CRM que nasceu para a fonoaudiologia',
  'evolua-crm-fonoaudiologia',
  'Conheça o primeiro CRM inteligente desenvolvido especialmente para fonoaudiólogas brasileiras. Prontuário, agenda, WhatsApp nativo e IA em um só lugar.',
  '## Um CRM que entende sua clínica

Se você é fonoaudióloga, sabe que administrar uma clínica vai muito além do atendimento. São prontuários para organizar, agendas para conciliar, relatórios para entregar, e ainda dar conta do financeiro.

O Evolua nasceu para resolver exatamente isso.

### O que o Evolua faz

**Prontuário digital completo**
Crie e gerencie prontuários dos seus pacientes com facilidade. Tudo organizado, acessível em segundos, e dentro das normas do CFONo.

**Agenda inteligente**
Visualize sua semana de um jeito claro. Arraste e solte para reagendar. Bloqueie horários de folga. E receba lembretes automáticos.

**WhatsApp nativo**
Chega de copiar número e abrir o WhatsApp web. O Evolua se conecta diretamente com a Evolution API para enviar mensagens, lembretes e campanhas sem sair do sistema.

**IA que ajuda de verdade**
A inteligência artificial do Evolua auxilia na elaboração de relatórios, sugestões de exercícios terapêuticos e análise de evolução dos pacientes.

**Financeiro descomplicado**
Controle de mensalidades, emissão de recibos, Split de pagamento e integração com PIX e cartão de crédito via AbacatePay.

**Tudo em um só lugar**
Chega de ter um sistema para cada coisa. O Evolua unifica prontuário, agenda, WhatsApp, IA e financeiro num único login. Menos abas abertas, mais tempo para o que importa: seus pacientes.

### Por que o Evolua é diferente

Não somos mais um "CRM genérico adaptado para fono". Cada tela, cada fluxo, cada relatório foi pensado para a realidade da fonoaudiologia brasileira — incluindo integração com o CFO e planos de saúde.

E como somos brasileiros e entendemos o SUS, a ANS e a realidade dos convênios, não precisamos de gambiarras para fazer o sistema se adaptar à sua rotina.

### Teste grátis

O Evolua está disponível em **useevolua.com.br**. Crie sua conta gratuita e descubra como a tecnologia pode transformar sua clínica — sem curva de aprendizado, sem complicação.',
  'https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=1200&q=80',
  'Equipe Evolua',
  'Fonoaudiologia',
  6,
  TRUE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'evolua-crm-fonoaudiologia');
