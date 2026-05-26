# Tasks — P0 Critical Fixes

## AI Service
- [x] Model change: Llama-3.1-8B → zephyr-7b-beta (commit 129ad49)
- [x] Retry logic: 10s + 20s with fallback
- [ ] Add startup warmup handler in main.py
- [ ] Fix /readyz to check DB + warmup state

## Patient State
- [x] Fix `.length(2)` → `.max(2)` in Prisma schema (commit 0cb931c)
- [ ] Run data cleanup on dirty patient records in prod

## CSP
- [x] Fix vercel.json with supabase.co connect-src (commit dfbe62a)
- [ ] Trigger Vercel redeploy or wait for auto-deploy
