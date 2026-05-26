# Auth — Google OAuth

## ADDED
- Registration page MUST call `supabase.auth.signInWithOAuth({ provider: 'google' })` when user clicks "Google" button
- Loading state MUST be shown during OAuth redirect
- Error messages MUST be displayed if OAuth fails
- OAuth callback URL MUST be configured in Supabase dashboard
