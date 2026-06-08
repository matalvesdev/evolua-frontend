-- Migration: Fix cover_image for 3 blog posts published by content pipeline without cover_image
-- Os posts foram publicados pelo pipeline de conteúdo que não incluía cover_image no prompt da IA
-- Todas as 3 são da categoria Carreira

UPDATE blog_posts
SET cover_image = 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800&q=80'
WHERE slug IN (
  'gestao-consultorio-fonoaudiologas-guia-pratico',
  'beneficios-teleconsulta-fonoaudiologia',
  '5-erros-whatsapp-profissional-fonoaudiologas'
)
AND (cover_image IS NULL OR cover_image = '');

-- Reset updated_at para posts alterados
UPDATE blog_posts
SET updated_at = NOW()
WHERE slug IN (
  'gestao-consultorio-fonoaudiologas-guia-pratico',
  'beneficios-teleconsulta-fonoaudiologia',
  '5-erros-whatsapp-profissional-fonoaudiologas'
)
AND (cover_image IS NULL OR cover_image = '');
