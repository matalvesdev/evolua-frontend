# AI Service — Critical Fixes

## ADDED
- AI service MUST warm up on startup before accepting requests
- `/readyz` endpoint MUST verify DB connectivity and warmup status  
- Transcription retry MUST use exponential backoff (10s, 20s, 40s max)
- Patient state enum MUST use `.max(2)` constraint

## MODIFIED
- HF model: Llama-3.1-8B → zephyr-7b-beta
- Fallback chain: Render API → HF Inference API with 2 retries
