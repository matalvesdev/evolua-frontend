import { supabase } from './supabase'

export type ChangelogTipo = 'Feature' | 'Melhoria' | 'Correção' | 'Major Release' | 'Seguranca'

export interface ChangelogEntry {
  id: string
  versao: string
  data: string
  tipo: ChangelogTipo
  titulo: string
  descricao: string
  itens: string[]
  ordem: number
}

function mapRow(row: Record<string, unknown>): ChangelogEntry {
  return {
    id: String(row.id),
    versao: String(row.versao),
    data: String(row.data),
    tipo: row.tipo as ChangelogTipo,
    titulo: String(row.titulo),
    descricao: String(row.descricao ?? ''),
    itens: Array.isArray(row.itens) ? (row.itens as string[]) : [],
    ordem: Number(row.ordem ?? 0),
  }
}

// Classe de cor por tipo (Tailwind) — mantém visual consistente com o design system.
export const CHANGELOG_TIPO_COLOR: Record<ChangelogTipo, string> = {
  'Feature': 'bg-primary text-white',
  'Melhoria': 'bg-lavender text-primary',
  'Correção': 'bg-surface border border-outline-variant text-ink-soft',
  'Major Release': 'bg-neon text-ink',
  'Seguranca': 'bg-deep text-white',
}

export async function fetchChangelogEntries(): Promise<ChangelogEntry[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('changelog_entries')
    .select('*')
    .eq('publicado', true)
    .order('data', { ascending: false })
    .order('ordem', { ascending: false })

  if (error || !data) return []
  return data.map(mapRow)
}
