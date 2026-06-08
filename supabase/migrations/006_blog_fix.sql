-- Migration: Adiciona colunas de categoria, tempo de leitura e destaque na blog_posts
-- Corrige o schema para corresponder ao que o blog.service.ts espera

DO $$
BEGIN
  -- Categoria do post (ex: "Fonoaudiologia", "Produtividade", "Tecnologia")
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='category') THEN
    ALTER TABLE blog_posts ADD COLUMN category TEXT;
  END IF;

  -- Tempo estimado de leitura em minutos
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='read_time') THEN
    ALTER TABLE blog_posts ADD COLUMN read_time INTEGER DEFAULT 5;
  END IF;

  -- Post em destaque (para aparecer no hero do blog)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='featured') THEN
    ALTER TABLE blog_posts ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Seed: primeiro post do blog
INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
VALUES (
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

### Por que o Evolua é diferente

Não é um CRM genérico adaptado para fonoaudiologia. Foi construído por pessoas que entendem a realidade das clínicas brasileiras. Cada funcionalidade pensada para reduzir o tempo gasto com burocracia e aumentar o tempo que você passa com seus pacientes.

### Comece agora

O Evolua está em fase de lançamento e você pode testar gratuitamente. Crie sua conta em [useevolua.com.br](https://useevolua.com.br) e descubra como a tecnologia pode transformar sua clínica.',
  'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=1200&q=80',
  'Equipe Evolua',
  'Fonoaudiologia',
  4,
  true,
  'published',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = EXCLUDED.cover_image,
  author = EXCLUDED.author,
  category = EXCLUDED.category,
  read_time = EXCLUDED.read_time,
  featured = EXCLUDED.featured,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at;
