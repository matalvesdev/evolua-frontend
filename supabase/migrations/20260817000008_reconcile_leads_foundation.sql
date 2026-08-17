-- Reconcile the optional lead-capture module in environments where the
-- migration ledger was adopted before the original baseline SQL ran.
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  source text NOT NULL DEFAULT 'whatsapp',
  message text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_clinic_created_idx
  ON public.leads (clinic_id, created_at DESC);
