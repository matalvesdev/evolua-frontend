-- Migration: Fix blog_posts RLS — add TO anon, authenticated
-- The landing page queries Supabase directly with anon key.
-- Without TO anon, authenticated, the anon role is blocked by RLS.

DROP POLICY IF EXISTS blog_posts_select_public ON blog_posts;

CREATE POLICY blog_posts_select_public
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
