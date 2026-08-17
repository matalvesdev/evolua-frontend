-- A claim prevents two API replicas from sending the same reminder. Claims
-- older than the worker timeout may be reclaimed by the scheduler.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_24h_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_claimed_at timestamptz;

CREATE INDEX IF NOT EXISTS appointments_reminder_24h_claim_idx
  ON public.appointments (reminder_24h_claimed_at)
  WHERE reminder_24h_sent_at IS NULL;
CREATE INDEX IF NOT EXISTS appointments_reminder_1h_claim_idx
  ON public.appointments (reminder_1h_claimed_at)
  WHERE reminder_1h_sent_at IS NULL;
