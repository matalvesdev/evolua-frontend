-- CreateTable: tele_sessions
CREATE TABLE IF NOT EXISTS "tele_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clinic_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "patient_name" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "sent_via_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tele_sessions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "tele_sessions_clinic_id_idx" ON "tele_sessions"("clinic_id");
CREATE INDEX IF NOT EXISTS "tele_sessions_status_idx" ON "tele_sessions"("status");

-- Foreign Keys
ALTER TABLE "tele_sessions" DROP CONSTRAINT IF EXISTS "tele_sessions_clinic_id_fkey";
ALTER TABLE "tele_sessions" ADD CONSTRAINT "tele_sessions_clinic_id_fkey"
    FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tele_sessions" DROP CONSTRAINT IF EXISTS "tele_sessions_patient_id_fkey";
ALTER TABLE "tele_sessions" ADD CONSTRAINT "tele_sessions_patient_id_fkey"
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tele_sessions_updated_at ON "tele_sessions";
CREATE TRIGGER update_tele_sessions_updated_at
    BEFORE UPDATE ON "tele_sessions"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE "tele_sessions" ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "tele_sessions_clinic_isolation"
    ON "tele_sessions"
    USING (clinic_id IN (
        SELECT clinic_id FROM users WHERE id = auth.uid()
    ));
