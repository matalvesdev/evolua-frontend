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

## Dashboard Visual System

- The dashboard MUST use the shared shell, tokens, navigation and surface patterns
  documented in `docs/03-product/21_DASHBOARD_VISUAL_SYSTEM.md`.
- Desktop MUST render the application as a light rounded shell over a warm neutral stage;
  mobile MUST use the full viewport without the decorative outer frame.
- Active navigation MUST use the Evolua neon color and MUST remain identifiable without
  relying on a thin side indicator.
- Dashboard KPI summaries SHOULD use one horizontal scan band on desktop and MUST remain
  usable through responsive wrapping or horizontal scrolling on narrow viewports.
- Visual redesigns MUST preserve existing data hooks and loading, error and empty states.
- No clinical, financial or operational value may be invented to fill the layout.
