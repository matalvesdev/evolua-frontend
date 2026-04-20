// Package api wires together the HTTP layer of the RAG microservice.
package api

import (
	"encoding/json"
	"net/http"

	"github.com/evolua/rag-service/internal/config"
	"github.com/evolua/rag-service/internal/ingestion"
	"github.com/evolua/rag-service/internal/rag"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog/log"
	"golang.org/x/time/rate"
)

// Handler holds all HTTP handlers.
type Handler struct {
	engine   *rag.Engine
	pipeline *ingestion.Pipeline
	cfg      *config.Config
}

func NewHandler(engine *rag.Engine, pipeline *ingestion.Pipeline, cfg *config.Config) *Handler {
	return &Handler{engine: engine, pipeline: pipeline, cfg: cfg}
}

// NewRouter builds the Chi router with all routes and middleware.
func NewRouter(h *Handler) http.Handler {
	r := chi.NewRouter()

	// ---- global middleware ----
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(LoggingMiddleware)
	r.Use(middleware.Recoverer)

	// CORS — allows requests from frontend and NestJS proxy
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{h.cfg.AllowedOrigins, "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	// Rate limit: 20 req/s burst 40 globally (unauthenticated routes)
	r.Use(RateLimitMiddleware(rate.Limit(20), 40))

	// ---- public routes ----
	r.Get("/v1/health", h.handleHealth)

	// ---- protected routes (JWT required) ----
	r.Group(func(r chi.Router) {
		r.Use(JWTMiddleware(h.cfg.JWTSecret))

		// Chat — main RAG endpoint
		r.Post("/v1/chat", h.handleChat)

		// Semantic search (no LLM, raw chunks)
		r.Post("/v1/search", h.handleSearch)

		// Ingest a user's anonymized prontuário (LGPD consent required)
		r.Post("/v1/ingest/prontuario", h.handleIngestProntuario)

		// Trigger manual re-seed (admin only — checked inside handler)
		r.Post("/v1/ingest/seed", h.handleIngestSeed)
	})

	return r
}

// ---- handlers ---------------------------------------------------------------

func (h *Handler) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "rag-service"})
}

// POST /v1/chat
func (h *Handler) handleChat(w http.ResponseWriter, r *http.Request) {
	var req rag.ChatRequest
	if err := decodeJSON(r, &req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	// Inject authenticated user ID
	req.UserID = UserIDFromContext(r.Context())

	if len(req.Messages) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "messages array is required"})
		return
	}

	resp, err := h.engine.Chat(r.Context(), req)
	if err != nil {
		log.Error().Err(err).Str("user_id", req.UserID).Msg("chat error")
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, resp)
}

// POST /v1/search
func (h *Handler) handleSearch(w http.ResponseWriter, r *http.Request) {
	var req rag.SearchRequest
	if err := decodeJSON(r, &req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if req.Query == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "query is required"})
		return
	}

	results, err := h.engine.Search(r.Context(), req)
	if err != nil {
		log.Error().Err(err).Msg("search error")
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{"results": results})
}

// POST /v1/ingest/prontuario
// Body: { "content": "...", "specialty": "voz", "consent": true }
func (h *Handler) handleIngestProntuario(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Content   string `json:"content"`
		Specialty string `json:"specialty"`
		Consent   bool   `json:"consent"`
	}
	if err := decodeJSON(r, &body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if !body.Consent {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "explicit consent (consent: true) is required — LGPD Art. 11"})
		return
	}
	if body.Content == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "content is required"})
		return
	}

	userID := UserIDFromContext(r.Context())
	if err := h.pipeline.IngestProntuario(r.Context(), body.Content, userID, body.Specialty); err != nil {
		log.Error().Err(err).Str("user_id", userID).Msg("ingest prontuario error")
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "ingestion failed"})
		return
	}

	writeJSON(w, http.StatusAccepted, map[string]string{"status": "queued"})
}

// POST /v1/ingest/seed
// Triggers a full re-seed of the corpus (manual seed + optional scraping).
func (h *Handler) handleIngestSeed(w http.ResponseWriter, r *http.Request) {
	// Run in background — returns 202 immediately
	go func() {
		if err := h.pipeline.IngestManualSeed(r.Context()); err != nil {
			log.Error().Err(err).Msg("seed ingestion error")
		}
	}()
	writeJSON(w, http.StatusAccepted, map[string]string{"status": "seed ingestion started"})
}

// ---- helpers ----------------------------------------------------------------

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Error().Err(err).Msg("writeJSON encode error")
	}
}

func decodeJSON(r *http.Request, v interface{}) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(v)
}
