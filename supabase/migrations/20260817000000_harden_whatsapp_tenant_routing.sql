-- WhatsApp inbound must resolve its tenant from an Evolution instance registered
-- server-side; a sender phone number is never a tenant authority.

CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  instance text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_connections_clinic_active_idx
  ON public.whatsapp_connections (clinic_id, is_active);

-- Some staging environments predate the optional lead-capture module. Do not
-- prevent tenant isolation for WhatsApp from being deployed there; lead routing
-- remains unavailable until that module's base table is installed.
DO $$
BEGIN
  IF to_regclass('public.leads') IS NULL THEN
    RAISE NOTICE 'Skipping leads tenant routing: public.leads is not installed';
  ELSE
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS clinic_id uuid;
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_clinic_id_fkey;
    ALTER TABLE public.leads ADD CONSTRAINT leads_clinic_id_fkey
      FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS leads_clinic_created_idx
      ON public.leads (clinic_id, created_at DESC);
  END IF;
END $$;

-- NULL remains valid for legacy/outbound records, but every provider message ID
-- may be recorded once only. This makes inbound handling race-safe.
CREATE UNIQUE INDEX IF NOT EXISTS wa_messages_evolution_id_unique_idx
  ON public.wa_messages (evolution_id)
  WHERE evolution_id IS NOT NULL;

ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "whatsapp_connections_clinic_isolation" ON public.whatsapp_connections;
CREATE POLICY "whatsapp_connections_clinic_isolation"
  ON public.whatsapp_connections
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));
