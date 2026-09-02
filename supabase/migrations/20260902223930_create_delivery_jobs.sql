-- Transactional outbox for provider effects (email, WhatsApp, push and future
-- report delivery). This table is server-only: clients must never inspect its
-- payload, which can contain contact or clinical metadata.
CREATE TABLE IF NOT EXISTS public.delivery_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
  kind text NOT NULL,
  channel text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT delivery_jobs_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS delivery_jobs_claimable_idx
  ON public.delivery_jobs (status, next_attempt_at, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS delivery_jobs_clinic_created_idx
  ON public.delivery_jobs (clinic_id, created_at DESC)
  WHERE clinic_id IS NOT NULL;

ALTER TABLE public.delivery_jobs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.delivery_jobs FROM anon, authenticated;

COMMENT ON TABLE public.delivery_jobs IS
  'Server-only transactional outbox. The API/worker owns claims and provider effects.';
