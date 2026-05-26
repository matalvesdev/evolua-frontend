# Auth Domain

## Requirements
1. Users authenticate via Supabase Auth
2. JWT verification uses ES256 via JWKS endpoint
3. Session managed via Supabase JS client with cookie storage
4. Protected routes redirect to `/entrar` if unauthenticated
5. Auth routes redirect to `/dashboard` if authenticated

## Endpoints
- `POST /auth/signup` — Email/password registration
- `POST /auth/login` — Email/password login
- `POST /auth/logout` — Destroy session
- `POST /auth/reset-password` — Send reset email
- **TODO**: `POST /auth/google` — Google OAuth (not implemented)

## Current Gaps
- Google OAuth button is a no-op stub (`cadastro.tsx:788`)
- ErrorBoundary not integrated with Sentry
