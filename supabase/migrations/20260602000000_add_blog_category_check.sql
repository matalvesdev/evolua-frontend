-- Migration: Add check constraint on blog_posts.category
-- The original check constraint was on 'categoria' (Portuguese) but the column
-- was renamed to 'category' (English) in migration 008_fix_blog_columns.sql.
-- This migration adds the check constraint to the renamed column.

DO $$
BEGIN
  -- Drop the old constraint if it still exists (on the old column name)
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_categoria_check' 
    AND conrelid = 'blog_posts'::regclass
  ) THEN
    ALTER TABLE blog_posts DROP CONSTRAINT blog_posts_categoria_check;
  END IF;

  -- Add check constraint on the 'category' column
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_category_check' 
    AND conrelid = 'blog_posts'::regclass
  ) THEN
    ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_category_check 
      CHECK (category IN ('Marketing', 'Gestão', 'Clínica', 'Carreira', 'Tecnologia', 'Fonoaudiologia'));
  END IF;
END $$;