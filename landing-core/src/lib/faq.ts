import { supabase } from './supabase'

export type FaqCategoria =
  | 'Conta'
  | 'Planos'
  | 'Pagamento'
  | 'Clínica'
  | 'Pacientes'
  | 'Segurança'
  | 'IA'
  | 'Integrações'
  | 'Outros'

export interface FaqItem {
  id: string
  categoria: FaqCategoria
  pergunta: string
  resposta: string // HTML simples; sanitizar antes de renderizar
  ordem: number
}

function mapRow(row: Record<string, unknown>): FaqItem {
  return {
    id: String(row.id),
    categoria: row.categoria as FaqCategoria,
    pergunta: String(row.pergunta),
    resposta: String(row.resposta ?? ''),
    ordem: Number(row.ordem ?? 0),
  }
}

export async function fetchFaqItems(): Promise<FaqItem[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('publicado', true)
    .order('categoria', { ascending: true })
    .order('ordem', { ascending: true })

  if (error || !data) return []
  return data.map(mapRow)
}

export function groupByCategoria(items: FaqItem[]): Array<{ categoria: FaqCategoria; itens: FaqItem[] }> {
  const map = new Map<FaqCategoria, FaqItem[]>()
  for (const item of items) {
    const arr = map.get(item.categoria) ?? []
    arr.push(item)
    map.set(item.categoria, arr)
  }
  return Array.from(map.entries()).map(([categoria, itens]) => ({ categoria, itens }))
}
