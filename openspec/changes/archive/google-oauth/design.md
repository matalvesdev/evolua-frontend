# Design — Google OAuth

## Approach
1. Use `supabase.auth.signInWithOAuth({ provider: 'google' })` — already handled by Supabase
2. The OAuth redirect goes to Supabase → user authorizes → redirect back to app
3. On redirect, Supabase JS client auto-recovers the session
4. Need to configure redirect URL in Supabase dashboard (already done for email)

## Implementation
- In `cadastro.tsx`, replace `onGoogle={() => { ... }}` with actual call
- Add loading indicator during OAuth flow
- On error, show error message in the existing error UI

## Files Changed
- `frontend-core/src/routes/cadastro.tsx` — wire up `onGoogle` callback
- No backend changes needed (Supabase handles the OAuth flow)
