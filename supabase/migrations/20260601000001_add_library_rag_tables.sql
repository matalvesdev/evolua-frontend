-- =============================================================================
-- 20260601000001_add_library_rag_tables.sql
-- RAG da biblioteca clínica: library_documents + library_chunks (pgvector).
--
-- Usado pelo serviço Python AI (backend-core/apps/ai):
--   - routers/library_ingest.py  → INSERT em ambas as tabelas
--   - routers/library.py         → retrieval top-k por cosine distance (<=>)
--
-- Embeddings: intfloat/multilingual-e5-small → dim 384.
-- =============================================================================

-- Extensão pgvector (idempotente). No Supabase fica no schema `extensions`,
-- mas `create extension if not exists vector` resolve o tipo `vector` no search_path.
create extension if not exists vector;

-- =============================================================================
-- A. library_documents — 1 linha por documento ingerido
-- =============================================================================

create table if not exists public.library_documents (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  title       text not null,
  source      text not null,
  source_url  text,
  author      text,
  specialty   text,
  language    text not null default 'pt-BR',
  chunk_count integer not null default 0,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists idx_library_documents_clinic
  on public.library_documents(clinic_id)
  where deleted_at is null;
create index if not exists idx_library_documents_specialty
  on public.library_documents(clinic_id, specialty)
  where deleted_at is null;

-- =============================================================================
-- B. library_chunks — N chunks por documento, com embedding pgvector
-- =============================================================================

create table if not exists public.library_chunks (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.library_documents(id) on delete cascade,
  clinic_id   uuid not null references public.clinics(id) on delete cascade,
  chunk_index integer not null,
  source      text not null,
  title       text,
  source_url  text,
  page        integer,
  snippet     text not null,
  embedding   vector(384) not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_library_chunks_document
  on public.library_chunks(document_id);
create index if not exists idx_library_chunks_clinic
  on public.library_chunks(clinic_id);

-- Índice ANN (IVFFlat) para cosine distance. Requer ANALYZE após carga inicial.
-- `lists = 100` é adequado até ~100k chunks; reavaliar em escala.
create index if not exists idx_library_chunks_embedding
  on public.library_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- =============================================================================
-- C. RLS — o serviço AI usa service_role (bypassa RLS); habilitamos por defesa
--    em profundidade caso o anon/auth role tente acessar diretamente.
-- =============================================================================

alter table public.library_documents enable row level security;
alter table public.library_chunks    enable row level security;

-- Sem policies permissivas para anon/auth: acesso somente via service_role
-- (serviço AI) ou via API gateway. Frontend nunca consulta estas tabelas direto.
