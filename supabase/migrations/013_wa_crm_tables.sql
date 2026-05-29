-- ==========================================
-- WhatsApp CRM — Conversas por paciente
-- ==========================================
CREATE TABLE IF NOT EXISTS public.wa_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_conv_clinic_patient ON public.wa_conversations(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_clinic_updated ON public.wa_conversations(clinic_id, updated_at DESC);

-- ==========================================
-- WhatsApp CRM — Mensagens das conversas
-- ==========================================
CREATE TABLE IF NOT EXISTS public.wa_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.wa_conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'material', 'payment_link')),
  content text NOT NULL,
  media_url text,
  payment_link text,
  payment_amount decimal,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  evolution_id text,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conversation_sent ON public.wa_messages(conversation_id, sent_at ASC);

-- Enable RLS
ALTER TABLE public.wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Conversations: clinic access" ON public.wa_conversations
  USING (clinic_id = current_clinic_id());

CREATE POLICY "Messages: via conversation" ON public.wa_messages
  USING (
    EXISTS (
      SELECT 1 FROM public.wa_conversations c
      WHERE c.id = conversation_id
      AND c.clinic_id = current_clinic_id()
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_wa_conversation_timestamp()
RETURNS trigger AS $$
BEGIN
  UPDATE public.wa_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_wa_message_update_conversation
  AFTER INSERT ON public.wa_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wa_conversation_timestamp();
