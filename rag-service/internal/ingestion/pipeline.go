// Package ingestion orchestrates the document ingestion pipeline:
// 1. Fetch raw text from sources (SciELO, CFFa, manual seed)
// 2. Chunk text into ~512-token windows with overlap
// 3. Generate embeddings via HF Inference API
// 4. Store in pgvector (Supabase)
package ingestion

import (
	"context"
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/evolua/rag-service/internal/embedding"
	"github.com/evolua/rag-service/internal/scraper"
	"github.com/evolua/rag-service/internal/store"
	"github.com/rs/zerolog/log"
)

const (
	chunkSize    = 512  // chars (aproximadamente 128-150 tokens)
	chunkOverlap = 128  // overlap between chunks for context continuity
)

// Pipeline manages the ingestion flow.
type Pipeline struct {
	store     *store.DB
	embedder  *embedding.Client
}

func New(db *store.DB, embedder *embedding.Client) *Pipeline {
	return &Pipeline{store: db, embedder: embedder}
}

// IngestManualSeed ingests all hand-crafted clinical seed articles.
func (p *Pipeline) IngestManualSeed(ctx context.Context) error {
	log.Info().Int("articles", len(scraper.ManualSeed)).Msg("ingesting manual seed")
	for _, article := range scraper.ManualSeed {
		if err := p.ingestArticle(ctx, article); err != nil {
			log.Warn().Str("title", article.Title).Err(err).Msg("failed to ingest article")
		}
	}
	return nil
}

// IngestProntuario ingests an anonymized prontuário after user consent.
func (p *Pipeline) IngestProntuario(ctx context.Context, userID, anonymizedText, specialty string) error {
	article := scraper.Article{
		Title:    fmt.Sprintf("Prontuário clínico — especialidade: %s", specialty),
		URL:      fmt.Sprintf("prontuario://%s", userID),
		Source:   "prontuario",
		FullText: anonymizedText,
		Lang:     "pt",
	}
	return p.ingestArticle(ctx, article)
}

func (p *Pipeline) ingestArticle(ctx context.Context, article scraper.Article) error {
	text := article.FullText
	if text == "" {
		text = article.Abstract
	}
	if text == "" {
		return nil
	}

	// Upsert document
	docID, err := p.store.UpsertDocument(ctx, store.Document{
		Source:    article.Source,
		SourceURL: article.URL,
		Title:     article.Title,
		Content:   text,
		Metadata: map[string]interface{}{
			"keywords": article.Keywords,
			"lang":     article.Lang,
		},
	})
	if err != nil {
		return fmt.Errorf("upsert document: %w", err)
	}

	// Chunk
	chunks := chunkText(text, chunkSize, chunkOverlap)

	// Embed passages
	embeddings, err := p.embedder.EmbedPassages(ctx, chunks)
	if err != nil {
		return fmt.Errorf("embed passages: %w", err)
	}

	// Build chunk records
	storeChunks := make([]store.Chunk, len(chunks))
	for i, chunk := range chunks {
		storeChunks[i] = store.Chunk{
			DocumentID: docID,
			ChunkIndex: i,
			Content:    chunk,
			Embedding:  embeddings[i],
			Metadata: map[string]interface{}{
				"source": article.Source,
				"title":  article.Title,
				"lang":   article.Lang,
			},
		}
	}

	if err := p.store.InsertChunks(ctx, storeChunks); err != nil {
		return fmt.Errorf("insert chunks: %w", err)
	}

	log.Info().
		Str("title", article.Title).
		Int("chunks", len(chunks)).
		Msg("document ingested")

	return nil
}

// chunkText splits text into overlapping windows.
func chunkText(text string, size, overlap int) []string {
	// Normalize whitespace
	text = strings.Join(strings.Fields(text), " ")

	if utf8.RuneCountInString(text) <= size {
		return []string{text}
	}

	runes := []rune(text)
	var chunks []string
	step := size - overlap
	if step <= 0 {
		step = size / 2
	}

	for i := 0; i < len(runes); i += step {
		end := i + size
		if end > len(runes) {
			end = len(runes)
		}
		chunk := string(runes[i:end])

		// Try to end at sentence boundary
		if end < len(runes) {
			for j := end - 1; j > i+step; j-- {
				if runes[j] == '.' || runes[j] == '\n' {
					chunk = string(runes[i : j+1])
					break
				}
			}
		}

		chunks = append(chunks, strings.TrimSpace(chunk))
		if end >= len(runes) {
			break
		}
	}
	return chunks
}
