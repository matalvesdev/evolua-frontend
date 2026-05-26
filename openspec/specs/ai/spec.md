# AI Service Domain

## Endpoints
- `POST /transcribe` — Transcribe audio from therapy sessions
- `POST /generate/evolution` — Generate clinical evolution (SOAP)
- `GET /rag/library` — RAG query over clinical library

## Model Configuration
- **Chat**: zephyr-7b-beta via Hugging Face Inference API
- **Transcription**: Whisper (Hugging Face or Render)
- **Fallback chain**: Render API → HF Inference API (if cold start 502)

## Current Gaps
- RAG over clinical library: frontend wired but backend endpoint needs full RAG pipeline
- Marketing content generation: frontend wired, backend endpoint needs implementation
- Model warmup: startup warmup added, but cold start on Render free tier may still cause delays
