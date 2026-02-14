-- ============================================================================
-- EVOLUA CRM - Script Consolidado para Banco de Desenvolvimento
-- Supabase: evlohetuccnojduobtxy
-- Execute no SQL Editor: https://supabase.com/dashboard/project/evlohetuccnojduobtxy/sql
-- ============================================================================

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- CLINICS
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  crfa TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  crfa TEXT,
  role TEXT NOT NULL DEFAULT 'therapist',
  avatar_url TEXT,
  areas_atuacao TEXT[] DEFAULT '{}',
  objetivos TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  cpf TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_relationship TEXT,
  address JSONB,
  medical_history JSONB,
  start_date TIMESTAMPTZ,
  discharge_date TIMESTAMPTZ,
  discharge_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  therapist_name TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  cancellation_reason TEXT,
  cancellation_notes TEXT,
  cancelled_by TEXT,
  cancelled_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  session_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  therapist_name TEXT NOT NULL,
  therapist_crfa TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  period_start_date DATE,
  period_end_date DATE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_to TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDIO_SESSIONS
CREATE TABLE IF NOT EXISTS public.audio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  audio_url TEXT NOT NULL,
  audio_duration INTEGER,
  file_size INTEGER,
  transcription TEXT,
  transcription_status TEXT DEFAULT 'pending',
  transcription_error TEXT,
  transcribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRANSACTION_CATEGORIES
CREATE TABLE IF NOT EXISTS public.transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_therapist_id ON public.patients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id ON public.appointments(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments(date_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_reports_clinic_id ON public.reports(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON public.reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_therapist_id ON public.reports(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

CREATE INDEX IF NOT EXISTS idx_audio_sessions_clinic_id ON public.audio_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_patient_id ON public.audio_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_audio_sessions_appointment_id ON public.audio_sessions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_tasks_clinic_id ON public.tasks(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_transactions_clinic_id ON public.transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_patient_id ON public.transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON public.transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

CREATE INDEX IF NOT EXISTS idx_transaction_categories_clinic_id ON public.transaction_categories(clinic_id);

CREATE INDEX IF NOT EXISTS idx_messages_clinic_id ON public.messages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_therapist_id ON public.messages(therapist_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at DESC);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CLINICS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own clinic" ON public.clinics;
CREATE POLICY "Users can view their own clinic"
  ON public.clinics FOR SELECT
  USING (id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own clinic" ON public.clinics;
CREATE POLICY "Users can update their own clinic"
  ON public.clinics FOR UPDATE
  USING (id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create clinics" ON public.clinics;
CREATE POLICY "Authenticated users can create clinics"
  ON public.clinics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- USERS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view themselves" ON public.users;
CREATE POLICY "Users can view themselves"
  ON public.users FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can view clinic members" ON public.users;
CREATE POLICY "Users can view clinic members"
  ON public.users FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update themselves" ON public.users;
CREATE POLICY "Users can update themselves"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert themselves" ON public.users;
CREATE POLICY "Users can insert themselves"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- PATIENTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic patients" ON public.patients;
CREATE POLICY "Users can view their clinic patients"
  ON public.patients FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert patients in their clinic" ON public.patients;
CREATE POLICY "Users can insert patients in their clinic"
  ON public.patients FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic patients" ON public.patients;
CREATE POLICY "Users can update their clinic patients"
  ON public.patients FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic patients" ON public.patients;
CREATE POLICY "Users can delete their clinic patients"
  ON public.patients FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- APPOINTMENTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic appointments" ON public.appointments;
CREATE POLICY "Users can view their clinic appointments"
  ON public.appointments FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert appointments in their clinic" ON public.appointments;
CREATE POLICY "Users can insert appointments in their clinic"
  ON public.appointments FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic appointments" ON public.appointments;
CREATE POLICY "Users can update their clinic appointments"
  ON public.appointments FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic appointments" ON public.appointments;
CREATE POLICY "Users can delete their clinic appointments"
  ON public.appointments FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- REPORTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic reports" ON public.reports;
CREATE POLICY "Users can view their clinic reports"
  ON public.reports FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert reports in their clinic" ON public.reports;
CREATE POLICY "Users can insert reports in their clinic"
  ON public.reports FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic reports" ON public.reports;
CREATE POLICY "Users can update their clinic reports"
  ON public.reports FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic reports" ON public.reports;
CREATE POLICY "Users can delete their clinic reports"
  ON public.reports FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- AUDIO_SESSIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic audio sessions" ON public.audio_sessions;
CREATE POLICY "Users can view their clinic audio sessions"
  ON public.audio_sessions FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert audio sessions in their clinic" ON public.audio_sessions;
CREATE POLICY "Users can insert audio sessions in their clinic"
  ON public.audio_sessions FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic audio sessions" ON public.audio_sessions;
CREATE POLICY "Users can update their clinic audio sessions"
  ON public.audio_sessions FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic audio sessions" ON public.audio_sessions;
CREATE POLICY "Users can delete their clinic audio sessions"
  ON public.audio_sessions FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic tasks" ON public.tasks;
CREATE POLICY "Users can view their clinic tasks"
  ON public.tasks FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert tasks in their clinic" ON public.tasks;
CREATE POLICY "Users can insert tasks in their clinic"
  ON public.tasks FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic tasks" ON public.tasks;
CREATE POLICY "Users can update their clinic tasks"
  ON public.tasks FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic tasks" ON public.tasks;
CREATE POLICY "Users can delete their clinic tasks"
  ON public.tasks FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- TRANSACTIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic transactions" ON public.transactions;
CREATE POLICY "Users can view their clinic transactions"
  ON public.transactions FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert transactions in their clinic" ON public.transactions;
CREATE POLICY "Users can insert transactions in their clinic"
  ON public.transactions FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic transactions" ON public.transactions;
CREATE POLICY "Users can update their clinic transactions"
  ON public.transactions FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic transactions" ON public.transactions;
CREATE POLICY "Users can delete their clinic transactions"
  ON public.transactions FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- TRANSACTION_CATEGORIES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic categories" ON public.transaction_categories;
CREATE POLICY "Users can view their clinic categories"
  ON public.transaction_categories FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert categories in their clinic" ON public.transaction_categories;
CREATE POLICY "Users can insert categories in their clinic"
  ON public.transaction_categories FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their clinic categories" ON public.transaction_categories;
CREATE POLICY "Users can update their clinic categories"
  ON public.transaction_categories FOR UPDATE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic categories" ON public.transaction_categories;
CREATE POLICY "Users can delete their clinic categories"
  ON public.transaction_categories FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their clinic messages" ON public.messages;
CREATE POLICY "Users can view their clinic messages"
  ON public.messages FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert messages for their clinic" ON public.messages;
CREATE POLICY "Users can insert messages for their clinic"
  ON public.messages FOR INSERT
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their clinic messages" ON public.messages;
CREATE POLICY "Users can delete their clinic messages"
  ON public.messages FOR DELETE
  USING (clinic_id IN (SELECT clinic_id FROM public.users WHERE id = auth.uid()));

-- ============================================================================
-- 4. STORAGE BUCKETS
-- ============================================================================

-- Bucket: audio-sessions (100MB, formatos de áudio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-sessions',
  'audio-sessions',
  true,
  104857600,
  ARRAY['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac'];

-- Bucket: reports (10MB, PDF)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  true,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- ============================================================================
-- 5. STORAGE POLICIES
-- ============================================================================

-- Audio Sessions Storage
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'audio-sessions');

DROP POLICY IF EXISTS "Public read access for audio" ON storage.objects;
CREATE POLICY "Public read access for audio"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'audio-sessions');

DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;
CREATE POLICY "Authenticated users can delete audio"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'audio-sessions');

-- Reports Storage
DROP POLICY IF EXISTS "Authenticated users can upload reports" ON storage.objects;
CREATE POLICY "Authenticated users can upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reports');

DROP POLICY IF EXISTS "Public read access for reports" ON storage.objects;
CREATE POLICY "Public read access for reports"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'reports');

DROP POLICY IF EXISTS "Authenticated users can delete reports" ON storage.objects;
CREATE POLICY "Authenticated users can delete reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'reports');

-- ============================================================================
-- 6. FUNÇÃO AUXILIAR: updated_at automático
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at automático
DROP TRIGGER IF EXISTS set_updated_at ON public.clinics;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.patients;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.appointments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.reports;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.audio_sessions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.audio_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- PRONTO! Banco de desenvolvimento configurado.
-- ============================================================================
