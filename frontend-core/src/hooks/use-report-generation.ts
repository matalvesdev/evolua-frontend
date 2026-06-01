import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Alinhado a backend-core/contracts/src/ai.ts (ReportTemplateEnum)
export type ReportTemplate =
  | 'resumo'
  | 'evolucao-mensal'
  | 'encaminhamento'
  | 'avaliacao-inicial'
  | 'alta'

export interface GeneratedReportSection {
  id: string
  label: string
  content: string
  isAIGenerated?: boolean
  hasHighlights?: boolean
}

interface GenerateReportResponse {
  success: boolean
  sections?: GeneratedReportSection[]
  error?: string
}

export const REPORT_TEMPLATES: { id: ReportTemplate; label: string; description: string; icon: string }[] = [
  { id: 'resumo',            label: 'Resumo',             description: 'Síntese objetiva da sessão',            icon: 'subject' },
  { id: 'evolucao-mensal',   label: 'Evolução Mensal',    description: 'Acompanhamento do período',             icon: 'trending_up' },
  { id: 'avaliacao-inicial', label: 'Avaliação Inicial',  description: 'Anamnese e diagnóstico funcional',      icon: 'assignment' },
  { id: 'encaminhamento',    label: 'Encaminhamento',     description: 'Para outro profissional/especialidade', icon: 'forward_to_inbox' },
  { id: 'alta',              label: 'Alta',               description: 'Fechamento do tratamento',              icon: 'task_alt' },
]

/** Gera um relatório estruturado a partir de uma transcrição + template. */
export function useGenerateReport() {
  return useMutation<
    GenerateReportResponse,
    Error,
    { transcription: string; template: ReportTemplate; patientName?: string }
  >({
    mutationFn: (body) =>
      api.post<GenerateReportResponse>('/api/ai/reports/generate', body),
  })
}

/** Converte as seções geradas em um documento de texto editável. */
export function sectionsToText(
  sections: GeneratedReportSection[],
  patientName?: string,
): string {
  const header = patientName ? `# Relatório — ${patientName}\n\n` : ''
  const body = sections
    .map((s) => `## ${s.label}\n${s.content}`)
    .join('\n\n')
  return header + body
}
