CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  clinical_area TEXT NOT NULL DEFAULT 'linguagem' CHECK (clinical_area IN ('linguagem','voz','disfagia','motricidade','gagueira','tea')),
  diagnosis TEXT NOT NULL DEFAULT '',
  anamnesis TEXT NOT NULL DEFAULT '',
  scales JSONB NOT NULL DEFAULT '{}'::jsonb,
  objectives TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  latest_evolution TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS medical_records_clinic_updated_idx
  ON public.medical_records (clinic_id, updated_at DESC);

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON public.medical_records;
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medical_records_clinic_isolation ON public.medical_records;
CREATE POLICY medical_records_clinic_isolation ON public.medical_records
  FOR ALL TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

REVOKE ALL ON public.medical_records FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
