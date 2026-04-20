// Package embedding wraps Hugging Face Inference API for text embeddings.
// Modelo padrão: intfloat/multilingual-e5-base (768 dims, suporta PT-BR nativamente).
// Fallback: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (384 dims).
package embedding

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

const (
	hfInferenceURL = "https://api-inference.huggingface.co/pipeline/feature-extraction/%s"
	defaultTimeout = 30 * time.Second
)

type Client struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewClient(apiKey, model string) *Client {
	if model == "" {
		model = "intfloat/multilingual-e5-base"
	}
	return &Client{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: defaultTimeout,
		},
	}
}

type hfRequest struct {
	Inputs []string `json:"inputs"`
	Options struct {
		WaitForModel bool `json:"wait_for_model"`
		UseCache     bool `json:"use_cache"`
	} `json:"options"`
}

// EmbedBatch returns embeddings for a batch of texts.
// For multilingual-e5-base, prefix "query: " for queries and "passage: " for documents.
func (c *Client) EmbedBatch(ctx context.Context, texts []string) ([][]float32, error) {
	body := hfRequest{}
	body.Inputs = texts
	body.Options.WaitForModel = true
	body.Options.UseCache = true

	payload, _ := json.Marshal(body)
	url := fmt.Sprintf(hfInferenceURL, c.model)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("hf request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hf API status %d", resp.StatusCode)
	}

	// HF returns [][]float32 for feature-extraction with batch inputs
	var embeddings [][]float32
	if err := json.NewDecoder(resp.Body).Decode(&embeddings); err != nil {
		return nil, fmt.Errorf("decode embeddings: %w", err)
	}

	log.Debug().
		Int("batch_size", len(texts)).
		Int("dims", len(embeddings[0])).
		Str("model", c.model).
		Msg("embeddings generated")

	return embeddings, nil
}

// EmbedQuery embeds a single query string with the "query: " prefix (e5 convention).
func (c *Client) EmbedQuery(ctx context.Context, query string) ([]float32, error) {
	prefixed := "query: " + query
	batch, err := c.EmbedBatch(ctx, []string{prefixed})
	if err != nil {
		return nil, err
	}
	return batch[0], nil
}

// EmbedPassage embeds a single passage with the "passage: " prefix.
func (c *Client) EmbedPassage(ctx context.Context, passage string) ([]float32, error) {
	prefixed := "passage: " + passage
	batch, err := c.EmbedBatch(ctx, []string{prefixed})
	if err != nil {
		return nil, err
	}
	return batch[0], nil
}

// EmbedPassages embeds multiple passages in batches of 32.
func (c *Client) EmbedPassages(ctx context.Context, passages []string) ([][]float32, error) {
	const batchSize = 32
	var all [][]float32

	for i := 0; i < len(passages); i += batchSize {
		end := i + batchSize
		if end > len(passages) {
			end = len(passages)
		}
		batch := passages[i:end]
		prefixed := make([]string, len(batch))
		for j, p := range batch {
			prefixed[j] = "passage: " + p
		}
		embs, err := c.EmbedBatch(ctx, prefixed)
		if err != nil {
			return nil, fmt.Errorf("batch %d-%d: %w", i, end, err)
		}
		all = append(all, embs...)
	}
	return all, nil
}
