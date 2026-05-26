-- ============================================================
-- Migração 004: Índices recomendados (complemento ao Prisma)
-- ============================================================
-- A maioria dos índices já é gerenciado pelo Prisma via schema.
-- Esta migração adiciona índices para queries analíticas
-- e de relatórios que não estão cobertos pelo schema.

-- Índice composto para busca de pacientes por clínica + nome
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_patients_clinic_name
  ON patients ("clinicId", "name" text_pattern_ops);

-- Índice para agendamentos por data (relatório diário)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_date
  ON appointments ("dateTime" DESC);

-- Índice para faturamento por mês
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_due_date
  ON financial ("clinicId", "dueDate" DESC);

-- Índice para busca de mensagens WhatsApp por conversa
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_whatsapp_messages_conversation_sent
  ON whatsapp_messages ("conversationId", "sentAt" DESC);

-- Índice para relatório de sessões por período
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_clinic_date
  ON sessions ("clinicId", "conductedAt" DESC)
  WHERE "conductedAt" IS NOT NULL;

-- Índice para busca de prontuários por paciente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_records_patient
  ON medical_records ("patientId", "createdAt" DESC);
