-- ============================================================================
-- Migration: CAA Boards, Materiais Terapêuticos, Sessões Terapêuticas
-- Date: 2025-04-19
-- ============================================================================

-- CAA Boards
CREATE TABLE IF NOT EXISTS caa_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  rows INT NOT NULL DEFAULT 3 CHECK (rows BETWEEN 1 AND 8),
  cols INT NOT NULL DEFAULT 5 CHECK (cols BETWEEN 1 AND 10),
  cells JSONB NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT 'Personalizado',
  therapeutic_objective TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE caa_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists manage own CAA boards"
  ON caa_boards FOR ALL
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()))
  WITH CHECK (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Materiais Terapêuticos
CREATE TABLE IF NOT EXISTS therapeutic_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'outro',
  therapeutic_area TEXT NOT NULL DEFAULT 'geral',
  therapeutic_objective TEXT NOT NULL,
  age_group TEXT NOT NULL DEFAULT 'todos',
  instructions TEXT,
  adaptations TEXT,
  content JSONB NOT NULL DEFAULT '{"pages": [], "orientation": "portrait", "paperSize": "A4"}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_print_ready BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE therapeutic_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists manage own materials"
  ON therapeutic_materials FOR ALL
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()))
  WITH CHECK (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Sessões Terapêuticas (gravações)
CREATE TABLE IF NOT EXISTS therapeutic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('recording','processing','transcribed','report_generated')),
  video_url TEXT,
  audio_url TEXT,
  transcription TEXT,
  report_draft TEXT,
  duration INT, -- seconds
  objectives TEXT[],
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE therapeutic_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists manage own sessions"
  ON therapeutic_sessions FOR ALL
  USING (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()))
  WITH CHECK (therapist_id IN (SELECT id FROM therapists WHERE user_id = auth.uid()));

-- Storage bucket for session recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'session-recordings',
  'session-recordings',
  FALSE,
  524288000, -- 500MB limit
  ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mpeg']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload session recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'session-recordings');

CREATE POLICY "Authenticated users can read own session recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'session-recordings');

CREATE POLICY "Authenticated users can delete own session recordings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'session-recordings');

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_caa_boards_updated_at
  BEFORE UPDATE ON caa_boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapeutic_materials_updated_at
  BEFORE UPDATE ON therapeutic_materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapeutic_sessions_updated_at
  BEFORE UPDATE ON therapeutic_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
