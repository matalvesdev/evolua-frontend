# Google OAuth

## Why
The Google sign-in button on the registration page (`cadastro.tsx:788`) is a no-op stub. Users expect to be able to register/login with Google.

## What
- Implement Google OAuth via Supabase Auth (`supabase.auth.signInWithOAuth`)
- Wire up the `onGoogle` callback in `cadastro.tsx`
- Handle redirect back with session creation
- Add loading state during OAuth redirect

## Non-Goals
- Full SSO support (no SAML, no Apple)
- Account linking
