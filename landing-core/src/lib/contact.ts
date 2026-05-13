import { z } from 'zod'
import { supabase } from './supabase'

export const ASSUNTOS = ['Geral', 'Comercial', 'Suporte', 'Parcerias', 'Imprensa', 'Outro'] as const
export type ContactAssunto = (typeof ASSUNTOS)[number]

export const contactSchema = z.object({
  nome: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  email: z.string().trim().email('E-mail inválido'),
  whatsapp: z
    .string()
    .trim()
    .max(40, 'WhatsApp inválido')
    .optional()
    .or(z.literal('')),
  assunto: z.enum(ASSUNTOS).default('Geral'),
  mensagem: z
    .string()
    .trim()
    .min(10, 'Conte um pouco mais (mínimo 10 caracteres)')
    .max(4000, 'Máximo 4000 caracteres'),
})

export type ContactInput = z.infer<typeof contactSchema>

export async function submitContactMessage(input: ContactInput): Promise<void> {
  if (!supabase) {
    throw new Error('Serviço de contato indisponível. Tente novamente em instantes.')
  }

  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos')
  }

  const payload = {
    nome: parsed.data.nome,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp || null,
    assunto: parsed.data.assunto,
    mensagem: parsed.data.mensagem,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    origem: typeof document !== 'undefined' ? document.referrer || window.location.href : null,
  }

  const { error } = await supabase.from('contact_messages').insert(payload)
  if (error) {
    throw new Error('Não conseguimos enviar sua mensagem. Tente novamente.')
  }
}
