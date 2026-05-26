-- ==========================================
-- Leads (WhatsApp inbound desconhecido)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  source text NOT NULL DEFAULT 'whatsapp',
  message text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source ON public.leads(source);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- ==========================================
-- Newsletter Subscribers
-- ==========================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  source text DEFAULT 'blog',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribed ON public.newsletter_subscribers(subscribed_at DESC);

-- ==========================================
-- Onboarding Progress
-- ==========================================
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step text NOT NULL DEFAULT 'empresa',
  completed_steps jsonb DEFAULT '[]',
  data jsonb DEFAULT '{}',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_onboarding_user ON public.onboarding_progress(user_id);

-- ==========================================
-- Content Drafts (for marketing pipeline)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.content_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  format text NOT NULL DEFAULT 'feed',
  platform text NOT NULL DEFAULT 'instagram',
  category text,
  status text NOT NULL DEFAULT 'rascunho',
  scheduled_for timestamptz,
  published_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_drafts_status ON public.content_drafts(status);
CREATE INDEX idx_drafts_scheduled ON public.content_drafts(scheduled_for);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Leads: admins full access" ON public.leads
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "Newsletter: insert anyone" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletter: admins read" ON public.newsletter_subscribers
  FOR SELECT USING (current_user_role() = 'admin');

CREATE POLICY "Onboarding: user own progress" ON public.onboarding_progress
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Drafts: clinic admins" ON public.content_drafts
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');
