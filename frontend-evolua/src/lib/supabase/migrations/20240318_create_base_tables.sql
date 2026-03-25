-- Migration: Criar tabelas base do sistema
-- Data: 2024-03-18
-- Descrição: Cria tabelas fundamentais: therapists, patients, patient_goals

-- ============================================================================
-- Tabela: therapists
-- ============================================================================
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  specialty TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapists_user_id ON therapists(user_id);
CREATE INDEX IF NOT EXISTS idx_therapists_email ON therapists(email);

COMMENT ON TABLE therapists IS 'Terapeutas do sistema';

-- ============================================================================
-- Tabela: patients
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birth_date))) STORED,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
  specialty TEXT,
  schooling TEXT,
  image_url TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_therapist_id ON patients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);

COMMENT ON TABLE patients IS 'Pacientes cadastrados no sistema';

-- ============================================================================
-- Tabela: patient_goals
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in-progress', 'attention', 'completed')),
  icon_name TEXT DEFAULT 'target',
  color_scheme TEXT DEFAULT 'purple' CHECK (color_scheme IN ('purple', 'blue', 'pink', 'green', 'yellow')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES therapists(id)
);

CREATE INDEX IF NOT EXISTS idx_patient_goals_patient_id ON patient_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_goals_status ON patient_goals(status);
CREATE INDEX IF NOT EXISTS idx_patient_goals_progress ON patient_goals(progress);

COMMENT ON TABLE patient_goals IS 'Metas terapêuticas de curto prazo dos pacientes';
COMMENT ON COLUMN patient_goals.progress IS 'Percentual de progresso da meta (0-100)';
COMMENT ON COLUMN patient_goals.status IS 'Status da meta: started, in-progress, attention, completed';
COMMENT ON COLUMN patient_goals.updated_by IS 'Terapeuta que fez a última atualização';

-- ============================================================================
-- Tabela: therapeutic_objectives
-- ============================================================================
CREATE TABLE IF NOT EXISTS therapeutic_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  defined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_therapeutic_objectives_patient_id ON therapeutic_objectives(patient_id);

COMMENT ON TABLE therapeutic_objectives IS 'Objetivos terapêuticos de longo prazo dos pacientes';

-- ============================================================================
-- Tabela: weekly_activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES patient_goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('home', 'office', 'completed')),
  duration TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_activities_patient_id ON weekly_activities(patient_id);
CREATE INDEX IF NOT EXISTS idx_weekly_activities_goal_id ON weekly_activities(goal_id);
CREATE INDEX IF NOT EXISTS idx_weekly_activities_week_start ON weekly_activities(week_start_date DESC);

COMMENT ON TABLE weekly_activities IS 'Atividades semanais do plano terapêutico';

-- ============================================================================
-- Função: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_goals_updated_at
  BEFORE UPDATE ON patient_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapeutic_objectives_updated_at
  BEFORE UPDATE ON therapeutic_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_activities_updated_at
  BEFORE UPDATE ON weekly_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapeutic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para therapists
CREATE POLICY "Therapists can view their own data"
  ON therapists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Therapists can update their own data"
  ON therapists FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para patients
CREATE POLICY "Therapists can view their patients"
  ON patients FOR SELECT
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE POLICY "Therapists can insert their patients"
  ON patients FOR INSERT
  WITH CHECK (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE POLICY "Therapists can update their patients"
  ON patients FOR UPDATE
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

CREATE POLICY "Therapists can delete their patients"
  ON patients FOR DELETE
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Políticas para patient_goals
CREATE POLICY "Therapists can view goals of their patients"
  ON patient_goals FOR SELECT
  USING (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Therapists can insert goals for their patients"
  ON patient_goals FOR INSERT
  WITH CHECK (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Therapists can update goals of their patients"
  ON patient_goals FOR UPDATE
  USING (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Therapists can delete goals of their patients"
  ON patient_goals FOR DELETE
  USING (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));

-- Políticas similares para therapeutic_objectives e weekly_activities
CREATE POLICY "Therapists can manage therapeutic objectives"
  ON therapeutic_objectives FOR ALL
  USING (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Therapists can manage weekly activities"
  ON weekly_activities FOR ALL
  USING (patient_id IN (
    SELECT id FROM patients WHERE therapist_id IN (
      SELECT id FROM therapists WHERE user_id = auth.uid()
    )
  ));
