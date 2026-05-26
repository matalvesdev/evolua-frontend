-- Migration: Fix newsletter_subscribers RLS + missing columns
-- The 002 migration created the table with RLS + insert policy,
-- but a subsequent drop/recreate (e.g. via manual SQL editor or 005 migration)
-- likely left the table without policies.

-- 1. Ensure RLS is enabled
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (safe if they don't exist)
DROP POLICY IF EXISTS "Newsletter: insert anyone" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Newsletter: admins read" ON public.newsletter_subscribers;

-- 3. Recreate policies
CREATE POLICY "Newsletter: insert anyone" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Newsletter: admins read" ON public.newsletter_subscribers
  FOR SELECT USING (current_user_role() = 'admin');

-- 4. Ensure source + metadata columns exist (from 002, may be missing after recreates)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='newsletter_subscribers' AND column_name='source') THEN
    ALTER TABLE public.newsletter_subscribers ADD COLUMN source TEXT DEFAULT 'blog';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='newsletter_subscribers' AND column_name='metadata') THEN
    ALTER TABLE public.newsletter_subscribers ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;
