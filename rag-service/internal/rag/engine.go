// Package rag implements the Retrieval-Augmented Generation engine.
// Flow: query → embed (HF) → similarity search (pgvector) → build prompt → LLM (Groq) → response.
package rag

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/evolua/rag-service/internal/config"
	"github.com/evolua/rag-service/internal/embedding"
	"github.com/evolua/rag-service/internal/store"
	"github.com/rs/zerolog/log"
)

const (
	groqChatURL    = "https://api.groq.com/openai/v1/chat/completions"
	topK           = 6
	maxContextLen  = 3000 // chars per chunk * topK before truncation
	groqTimeout    = 45 * time.Second
)

// Engine orchestrates RAG: embed → retrieve → generate.
type Engine struct {
	cfg    *config.Config
	db     *store.DB
	embed  *embedding.Client
	http   *http.Client
}

func NewEngine(cfg *config.Config, db *store.DB, embed *embedding.Client) *Engine {
	return &Engine{
		cfg:   cfg,
		db:    db,
		embed: embed,
		http:  &http.Client{Timeout: groqTimeout},
	}
}

// Message represents a chat message.
type Message struct {
	Role    string `json:"role"`    // "user" | "assistant" | "system"
	Content string `json:"content"`
}

// ChatRequest is the input to Engine.Chat.
type ChatRequest struct {
	SessionID string    `json:"session_id"`
	UserID    string    `json:"user_id"`
	Messages  []Message `json:"messages"` // full history including latest user message
	Specialty string    `json:"specialty"` // e.g. "voz", "linguagem", "disfagia"
}

// ChatResponse is the output of Engine.Chat.
type ChatResponse struct {
	Answer    string         `json:"answer"`
	Sources   []SourceRef    `json:"sources"`
	SessionID string         `json:"session_id"`
	Model     string         `json:"model"`
	LatencyMs int64          `json:"latency_ms"`
}

// SourceRef is a citation returned alongside the answer.
type SourceRef struct {
	Title     string  `json:"title"`
	Source    string  `json:"source"`
	SourceURL string  `json:"source_url,omitempty"`
	Similarity float64 `json:"similarity"`
}

// SearchRequest is the input to Engine.Search.
type SearchRequest struct {
	Query string `json:"query"`
	K     int    `json:"k"`
}

// Chat performs a full RAG chat turn.
func (e *Engine) Chat(ctx context.Context, req ChatRequest) (*ChatResponse, error) {
	start := time.Now()

	// Extract the latest user message for retrieval
	userQuery := latestUserMessage(req.Messages)
	if userQuery == "" {
		return nil, fmt.Errorf("no user message found")
	}

	// 1. Embed query
	qEmbedding, err := e.embed.EmbedQuery(ctx, userQuery)
	if err != nil {
		return nil, fmt.Errorf("embed query: %w", err)
	}

	// 2. Retrieve relevant chunks
	results, err := e.db.SimilaritySearch(ctx, qEmbedding, topK)
	if err != nil {
		log.Warn().Err(err).Msg("similarity search failed, continuing without context")
		results = nil
	}

	// 3. Build system prompt with retrieved context
	systemPrompt := buildSystemPrompt(req.Specialty, results)

	// 4. Assemble messages for Groq
	groqMessages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}
	for _, m := range req.Messages {
		groqMessages = append(groqMessages, map[string]string{
			"role":    m.Role,
			"content": m.Content,
		})
	}

	// 5. Call Groq API
	answer, model, err := e.callGroq(ctx, groqMessages)
	if err != nil {
		return nil, fmt.Errorf("groq call: %w", err)
	}

	// 6. Build source references
	sources := deduplicateSources(results)

	return &ChatResponse{
		Answer:    answer,
		Sources:   sources,
		SessionID: req.SessionID,
		Model:     model,
		LatencyMs: time.Since(start).Milliseconds(),
	}, nil
}

// Search performs semantic search and returns raw chunks (no LLM).
func (e *Engine) Search(ctx context.Context, req SearchRequest) ([]store.SearchResult, error) {
	k := req.K
	if k <= 0 || k > 20 {
		k = topK
	}
	qEmbedding, err := e.embed.EmbedQuery(ctx, req.Query)
	if err != nil {
		return nil, fmt.Errorf("embed query: %w", err)
	}
	return e.db.SimilaritySearch(ctx, qEmbedding, k)
}

// ---- helpers ----------------------------------------------------------------

func latestUserMessage(messages []Message) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == "user" {
			return messages[i].Content
		}
	}
	return ""
}

func buildSystemPrompt(specialty string, results []store.SearchResult) string {
	var sb strings.Builder

	sb.WriteString(`Você é a Assistente Clínica Evolua, especializada em Fonoaudiologia.
Responda sempre em português do Brasil. Seja objetiva, clínica e didática.
Use terminologia fonoaudiológica correta (CFonoaudiologia / CFFa).
Quando citar protocolos (GRBAS, FOIS, MBGR, VHI, ABFW, SSI-4 etc.), explique o significado das siglas na primeira menção.
Se não souber a resposta com certeza, diga claramente — não invente informações clínicas.
Nunca forneça diagnóstico definitivo; oriente o fonoaudiólogo a usar seu julgamento clínico.`)

	if specialty != "" {
		sb.WriteString("\nEspecialidade do contexto atual: ")
		sb.WriteString(specialty)
	}

	if len(results) > 0 {
		sb.WriteString("\n\n--- CONTEXTO RECUPERADO DA BASE DE CONHECIMENTO ---\n")
		totalLen := 0
		for i, r := range results {
			chunk := fmt.Sprintf("\n[%d] Fonte: %s | %s\n%s\n", i+1, r.Source, r.Title, r.Content)
			if totalLen+len(chunk) > maxContextLen {
				break
			}
			sb.WriteString(chunk)
			totalLen += len(chunk)
		}
		sb.WriteString("\n--- FIM DO CONTEXTO ---\n")
		sb.WriteString("Baseie sua resposta preferencialmente no contexto acima. Cite [N] ao referenciar.")
	}

	return sb.String()
}

func deduplicateSources(results []store.SearchResult) []SourceRef {
	seen := map[string]bool{}
	var sources []SourceRef
	for _, r := range results {
		key := r.Title + r.SourceURL
		if seen[key] {
			continue
		}
		seen[key] = true
		sources = append(sources, SourceRef{
			Title:      r.Title,
			Source:     r.Source,
			SourceURL:  r.SourceURL,
			Similarity: r.Similarity,
		})
	}
	return sources
}

// ---- Groq API client --------------------------------------------------------

type groqRequest struct {
	Model       string               `json:"model"`
	Messages    []map[string]string  `json:"messages"`
	MaxTokens   int                  `json:"max_tokens"`
	Temperature float64              `json:"temperature"`
	Stream      bool                 `json:"stream"`
}

type groqResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
	} `json:"error,omitempty"`
}

func (e *Engine) callGroq(ctx context.Context, messages []map[string]string) (answer, model string, err error) {
	model = e.cfg.GroqModel
	if model == "" {
		model = "llama-3.3-70b-versatile"
	}

	payload := groqRequest{
		Model:       model,
		Messages:    messages,
		MaxTokens:   1024,
		Temperature: 0.3,
		Stream:      false,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", model, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, groqChatURL, bytes.NewReader(body))
	if err != nil {
		return "", model, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+e.cfg.GroqAPIKey)

	resp, err := e.http.Do(req)
	if err != nil {
		return "", model, fmt.Errorf("http do: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return "", model, fmt.Errorf("groq status %d: %s", resp.StatusCode, string(raw))
	}

	var gr groqResponse
	if err := json.Unmarshal(raw, &gr); err != nil {
		return "", model, fmt.Errorf("unmarshal groq: %w", err)
	}
	if gr.Error != nil {
		return "", model, fmt.Errorf("groq error [%s]: %s", gr.Error.Type, gr.Error.Message)
	}
	if len(gr.Choices) == 0 {
		return "", model, fmt.Errorf("groq returned no choices")
	}

	return gr.Choices[0].Message.Content, gr.Model, nil
}
