-- Migration: RLS policies for blog_posts and changelog_entries
-- Landing page queries Supabase directly with anon key — needs public read access.

-- blog_posts: any authenticated/anonymous user can read published posts
CREATE POLICY blog_posts_select_public ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- If the table has RLS enabled but no policy, queries return empty.
-- This is the missing piece that makes the landing page blog work.
