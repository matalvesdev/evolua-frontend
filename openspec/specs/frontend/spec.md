# Frontend Domain

## Key Pages
- `/dashboard` — Main dashboard with analytics, quick actions
- `/dashboard/pacientes` — Patient management
- `/dashboard/sessoes` — Session management + clinical reports
- `/dashboard/agenda` — Appointment calendar
- `/dashboard/biblioteca` — Clinical library with AI RAG
- `/dashboard/exercicios` — Exercise library with WhatsApp sharing
- `/dashboard/analytics` — Business analytics
- `/billing` — Subscription management (AbacatePay + Stripe)

## Current Gaps
- **Agenda useEffect**: eslint-disable react-hooks/exhaustive-deps suppressed (`agenda.tsx:307`)
- **Google OAuth**: ✅ Implemented via `supabase.auth.signInWithOAuth`
- **Report persistence**: ✅ Reports persist via `POST /api/reports`
- **IA integration**: ✅ Biblioteca, Marketing, QuickActions, Analytics wired to API
- **WhatsApp sharing**: ✅ Exercise prescription via `/api/messages/batch`
- **ErrorBoundary**: ✅ Sentry integrated
