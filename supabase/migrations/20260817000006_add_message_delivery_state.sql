-- Expand-only state for provider delivery. The Fastify API is the only writer;
-- existing RLS on messages remains in force.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_error TEXT,
  ADD COLUMN IF NOT EXISTS delivery_attempted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS messages_clinic_idempotency_key_unique
  ON public.messages (clinic_id, idempotency_key);
