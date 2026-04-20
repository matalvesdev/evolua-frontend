package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/evolua/rag-service/internal/api"
	"github.com/evolua/rag-service/internal/config"
	"github.com/evolua/rag-service/internal/embedding"
	"github.com/evolua/rag-service/internal/ingestion"
	"github.com/evolua/rag-service/internal/rag"
	"github.com/evolua/rag-service/internal/store"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// Logger
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("ENV") != "production" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	// Config
	cfg := config.Load()

	// Database / vector store
	db, err := store.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(context.Background()); err != nil {
		log.Fatal().Err(err).Msg("failed to run migrations")
	}

	// Embedding client (Hugging Face Inference API)
	embedClient := embedding.NewClient(cfg.HFAPIKey, cfg.HFEmbedModel)

	// RAG engine
	engine := rag.NewEngine(cfg, db, embedClient)

	// Ingestion pipeline
	pipeline := ingestion.NewPipeline(db, embedClient)

	// Seed corpus on startup (non-blocking)
	go func() {
		log.Info().Msg("starting corpus seed ingestion...")
		if err := pipeline.IngestManualSeed(context.Background()); err != nil {
			log.Warn().Err(err).Msg("seed ingestion failed (non-fatal)")
		} else {
			log.Info().Msg("corpus seed ingestion complete")
		}
	}()

	// HTTP handler
	handler := api.NewHandler(engine, pipeline, cfg)
	router := api.NewRouter(handler)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Graceful shutdown
	go func() {
		log.Info().Str("port", cfg.Port).Msg("Evolua RAG Service started")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server error")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("shutting down gracefully...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("shutdown error")
	}
}
