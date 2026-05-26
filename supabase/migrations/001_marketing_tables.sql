CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  titulo text NOT NULL,
  subtitulo text,
  categoria text NOT NULL DEFAULT 'Gestão',
  autor text NOT NULL DEFAULT 'Equipe Evolua',
  data date NOT NULL DEFAULT CURRENT_DATE,
  tempo_leitura int DEFAULT 5,
  destaque boolean DEFAULT false,
  imagem text,
  corpo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.semanas_conteudo (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  semana text NOT NULL,
  gerado_em timestamptz DEFAULT now(),
  posts jsonb,
  blog jsonb,
  status text DEFAULT 'gerado',
  created_at timestamptz DEFAULT now()
);
