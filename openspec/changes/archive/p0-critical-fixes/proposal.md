# P0 — Critical Fixes

## Why
Three critical bugs affect production users:
1. AI transcription cold start → 502 (retry added but needs testing)
2. CSP blocks blog + changelog on landing (fix pushed but Vercel not redeployed)
3. Evolution generation 400 from wrong HF model

## What
- Add warmup to AI service startup to prevent cold start 502
- Add `/readyz` with real DB/vector store check
- Ensure patient state validation uses `.max(2)` not `.length(2)`
- Document Vercel deploy trigger procedure for CSP fix

## Non-Goals
- Full AI service rewrite
- New features
