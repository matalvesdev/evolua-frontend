package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	pgvector "github.com/pgvector/pgvector-go"
	"github.com/rs/zerolog/log"
)

// DB wraps pgxpool and exposes vector store operations.
type DB struct {
	pool *pgxpool.Pool
}

func New(dsn string) (*DB, error) {
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return nil, fmt.Errorf("pgxpool.New: %w", err)
	}
	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("db ping: %w", err)
	}
	log.Info().Msg("connected to PostgreSQL")
	return &DB{pool: pool}, nil
}

func (db *DB) Close() { db.pool.Close() }

// Migrate runs idempotent schema setup.
func (db *DB) Migrate(ctx context.Context) error {
	_, err := db.pool.Exec(ctx, migrations)
	return err
}

const migrations = `
-- Enable pgvector (já disponível no Supabase)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documentos do corpus (artigos, guidelines, protocolos)
CREATE TABLE IF NOT EXISTS rag_documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source      TEXT NOT NULL,           -- 'scielo' | 'cffa' | 'manual' | 'prontuario'
    source_url  TEXT,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Chunks vetorizados para busca semântica
CREATE TABLE IF NOT EXISTS rag_chunks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content     TEXT NOT NULL,
    embedding   vector(768),             -- multilingual-e5-base dimensions
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice ANN para cosine similarity (IVFFlat — gratuito, rápido)
CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx
    ON rag_chunks USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Histórico de conversas por usuário
CREATE TABLE IF NOT EXISTS rag_conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL,
    session_id  UUID NOT NULL DEFAULT uuid_generate_v4(),
    messages    JSONB DEFAULT '[]',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Prontuários anonimizados aguardando consent para treino
CREATE TABLE IF NOT EXISTS rag_training_queue (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL,
    original_hash   TEXT NOT NULL,       -- SHA256 do original (não armazena PII)
    anonymized_text TEXT NOT NULL,
    specialty       TEXT,
    consented_at    TIMESTAMPTZ NOT NULL,
    ingested_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índice de deduplicação
CREATE UNIQUE INDEX IF NOT EXISTS rag_documents_url_idx ON rag_documents(source_url)
    WHERE source_url IS NOT NULL;
`

// Document represents a source document.
type Document struct {
	ID        string
	Source    string
	SourceURL string
	Title     string
	Content   string
	Metadata  map[string]interface{}
}

// Chunk represents a vectorized text chunk.
type Chunk struct {
	ID         string
	DocumentID string
	ChunkIndex int
	Content    string
	Embedding  []float32
	Metadata   map[string]interface{}
}

// UpsertDocument inserts or updates a document by source_url.
func (db *DB) UpsertDocument(ctx context.Context, doc Document) (string, error) {
	var id string
	err := db.pool.QueryRow(ctx, `
		INSERT INTO rag_documents (source, source_url, title, content, metadata)
		VALUES ($1, $2, $3, $4, $5::jsonb)
		ON CONFLICT (source_url) WHERE source_url IS NOT NULL
		DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content,
		              metadata=EXCLUDED.metadata, updated_at=NOW()
		RETURNING id
	`, doc.Source, doc.SourceURL, doc.Title, doc.Content, doc.Metadata).Scan(&id)
	return id, err
}

// InsertChunks bulk-inserts vectorized chunks for a document (replacing old ones).
func (db *DB) InsertChunks(ctx context.Context, chunks []Chunk) error {
	if len(chunks) == 0 {
		return nil
	}
	// Delete existing chunks for this document
	_, err := db.pool.Exec(ctx,
		`DELETE FROM rag_chunks WHERE document_id = $1`, chunks[0].DocumentID)
	if err != nil {
		return err
	}

	for _, c := range chunks {
		vec := pgvector.NewVector(c.Embedding)
		_, err := db.pool.Exec(ctx, `
			INSERT INTO rag_chunks (document_id, chunk_index, content, embedding, metadata)
			VALUES ($1, $2, $3, $4, $5::jsonb)
		`, c.DocumentID, c.ChunkIndex, c.Content, vec, c.Metadata)
		if err != nil {
			return fmt.Errorf("insert chunk %d: %w", c.ChunkIndex, err)
		}
	}
	return nil
}

// SimilaritySearch returns the top-k most similar chunks to the query embedding.
func (db *DB) SimilaritySearch(ctx context.Context, queryEmbedding []float32, k int) ([]SearchResult, error) {
	vec := pgvector.NewVector(queryEmbedding)
	rows, err := db.pool.Query(ctx, `
		SELECT
			c.id,
			c.content,
			c.metadata,
			d.title,
			d.source,
			d.source_url,
			1 - (c.embedding <=> $1) AS similarity
		FROM rag_chunks c
		JOIN rag_documents d ON d.id = c.document_id
		ORDER BY c.embedding <=> $1
		LIMIT $2
	`, vec, k)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var r SearchResult
		if err := rows.Scan(
			&r.ChunkID, &r.Content, &r.Metadata,
			&r.Title, &r.Source, &r.SourceURL, &r.Similarity,
		); err != nil {
			return nil, err
		}
		results = append(results, r)
	}
	return results, nil
}

type SearchResult struct {
	ChunkID    string
	Content    string
	Metadata   map[string]interface{}
	Title      string
	Source     string
	SourceURL  string
	Similarity float64
}
