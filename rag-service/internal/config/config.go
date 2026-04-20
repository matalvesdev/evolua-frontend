package config

import (
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

type Config struct {
	Port        string
	DatabaseURL string
	SupabaseURL string
	SupabaseKey string

	// LLM — Groq API (free tier, extremamente rápido)
	GroqAPIKey  string
	GroqModel   string // llama-3.3-70b-versatile | llama-3.1-8b-instant

	// Fallback LLM — OpenAI compatible
	OpenAIAPIKey  string
	OpenAIBaseURL string // permite usar Ollama local
	OpenAIModel   string

	// Embedding — Hugging Face Inference API (gratuita)
	HFAPIKey       string
	HFEmbedModel   string // intfloat/multilingual-e5-base (recomendado)

	// Auth — valida tokens vindos do NestJS (mesmo JWT secret)
	JWTSecret string

	// Ingestion
	ScrapeEnabled    bool
	ScrapeIntervalH  int
	MaxDocsPerSource int

	// CORS
	AllowedOrigins string

	ENV string
}

func Load() *Config {
	if err := godotenv.Load(".env"); err != nil {
		log.Warn().Msg(".env not found, using environment variables")
	}

	return &Config{
		Port:        getEnv("PORT", "9090"),
		DatabaseURL: mustEnv("DATABASE_URL"),
		SupabaseURL: getEnv("SUPABASE_URL", ""),
		SupabaseKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),

		GroqAPIKey: getEnv("GROQ_API_KEY", ""),
		GroqModel:  getEnv("GROQ_MODEL", "llama-3.3-70b-versatile"),

		OpenAIAPIKey:  getEnv("OPENAI_API_KEY", ""),
		OpenAIBaseURL: getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		OpenAIModel:   getEnv("OPENAI_MODEL", "gpt-4o-mini"),

		HFAPIKey:     getEnv("HF_API_KEY", ""),
		HFEmbedModel: getEnv("HF_EMBED_MODEL", "intfloat/multilingual-e5-base"),

		JWTSecret: mustEnv("JWT_SECRET"),

		ScrapeEnabled:    getEnv("SCRAPE_ENABLED", "false") == "true",
		ScrapeIntervalH:  24,
		MaxDocsPerSource: 500,

		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),

		ENV: getEnv("ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatal().Str("key", key).Msg("required environment variable not set")
	}
	return v
}
