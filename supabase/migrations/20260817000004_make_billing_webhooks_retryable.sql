-- A unique provider event prevents duplicates, but must not turn a transient
-- handler failure into permanent data loss. Claim retries atomically.
ALTER TABLE public.billing_events
  ADD COLUMN IF NOT EXISTS processing_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_billing_events_retryable
  ON public.billing_events (provider, external_id)
  WHERE processed_at IS NULL;
