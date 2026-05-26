# Design — P0 Critical Fixes

## 1. AI Service Warmup
- Add startup event handler in `main.py` that pings HF Inference API
- `/readyz` should return 200 only after warmup complete + DB reachable
- Add retry interceptor with exponential backoff (already partially done)

## 2. Patient State Validation
- In Prisma schema: ensure `PatientState` enum values have `.max(2)` constraint
- Run migration + cleanup script for dirty data in prod

## 3. CSP Fix Deployment
- The code fix is in `landing-core/vercel.json` (commit `dfbe62a`)
- Trigger: merge to main → Vercel auto-deploy. If stuck, manual deploy in Vercel dashboard
