-- =============================================================================
-- 20260601000000_changelog_v2_7_0.sql
-- Changelog entry: v2.7.0 — features liberadas em produção neste release.
-- Idempotente: INSERT ... ON CONFLICT (versao) DO UPDATE.
-- =============================================================================

insert into public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) values
(
  'v2.7.0',
  '2026-06-01',
  'Feature',
  'Gravação de sessão, Biblioteca com IA e Teleconsulta',
  'Liberamos em produção um conjunto de recursos que aproximam o atendimento e o registro clínico: gravação de áudio direto na sessão, uma biblioteca de conhecimento com busca por IA e teleconsulta integrada ao prontuário.',
  array[
    'Gravação de áudio na sessão corrigida — microfone liberado no navegador',
    'Biblioteca de conhecimento com busca por IA (RAG): ingestão por URL e chat com citações',
    'Geração de relatórios clínicos por IA a partir de transcrição e modelos',
    'Teleconsulta integrada — sessões de vídeo registradas no prontuário',
    'Correções de estabilidade e estados de carregamento/erro em vários módulos do painel'
  ],
  2026060100
)
on conflict (versao) do update set
  data       = excluded.data,
  tipo       = excluded.tipo,
  titulo     = excluded.titulo,
  descricao  = excluded.descricao,
  itens      = excluded.itens,
  ordem      = excluded.ordem,
  publicado  = true;
