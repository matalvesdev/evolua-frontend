-- Migration: Adicionar coluna updated_by à tabela patient_goals
-- Data: 2024-03-18
-- Descrição: Adiciona coluna updated_by se não existir (necessária para o trigger de snapshots)

-- Adicionar coluna updated_by se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patient_goals' 
    AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE patient_goals 
    ADD COLUMN updated_by UUID REFERENCES therapists(id);
    
    COMMENT ON COLUMN patient_goals.updated_by IS 'Terapeuta que fez a última atualização';
  END IF;
END $$;

-- Verificar se a tabela patient_goals existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_goals') THEN
    RAISE EXCEPTION 'Tabela patient_goals não existe. Por favor, crie-a primeiro.';
  END IF;
END $$;
