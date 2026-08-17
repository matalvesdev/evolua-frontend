# AI Service Domain

## Endpoints
- `POST /transcribe` — Transcribe audio from therapy sessions
- `POST /generate/evolution` — Generate clinical evolution (SOAP)
- `GET /rag/library` — RAG query over clinical library

## Model Configuration
- **Chat**: zephyr-7b-beta via Hugging Face Inference API
- **Transcription**: Whisper (Hugging Face or Render)
- **Fallback chain**: Render API → HF Inference API (if cold start 502)

## GEOS Intelligence Layer
- **Knowledge**: Ingestão de docs do projeto via GEOS (SQLite + FTS5 + RAG)
- **Research Engine**: Pesquisa automatizada de tendências e concorrentes
- **SEO Engine**: Auditoria determinística do conteúdo
- **Analytics Engine**: Métricas de crescimento + insights com evidência
- **GEO Experiment**: `.doc/geo-experiment.md` (otimização para citação por LLMs)

## Current Gaps
- RAG over clinical library: frontend wired but backend endpoint needs full RAG pipeline
- Model warmup: startup warmup added, but cold start on Render free tier may still cause delays
- GEOS knowledge ingest: precisa ser executado (`geos knowledge ingest .doc/`)
