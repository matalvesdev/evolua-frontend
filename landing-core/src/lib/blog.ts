import { supabase } from './supabase'

export interface BlogPost {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  categoria: 'Marketing' | 'Gestão' | 'Clínica' | 'Carreira' | 'Tecnologia'
  autor: string
  data: string
  tempoLeitura: number
  destaque: boolean
  imagem: string
  corpo: string
}

// Mapeia snake_case do banco → camelCase
function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titulo: String(row.titulo),
    subtitulo: String(row.subtitulo ?? ''),
    categoria: row.categoria as BlogPost['categoria'],
    autor: String(row.autor ?? 'Equipe Evolua'),
    data: String(row.data),
    tempoLeitura: Number(row.tempo_leitura ?? row.tempoLeitura ?? 5),
    destaque: Boolean(row.destaque),
    imagem: String(row.imagem ?? ''),
    corpo: String(row.corpo ?? ''),
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Segurança de imagem
// ──────────────────────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'cdn.evolua.app',
  'images.pexels.com',
]

export function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Fetchers — sem fallback de mock. Quando Supabase não responde, devolve lista
// vazia / undefined. A UI lida com estado vazio.
// ──────────────────────────────────────────────────────────────────────────────
export async function fetchPosts(categoria?: string): Promise<BlogPost[]> {
  if (!supabase) return []

  let query = supabase
    .from('blog_posts')
    .select('*')
    .order('data', { ascending: false })

  if (categoria && categoria !== 'Todos') {
    query = query.eq('categoria', categoria)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data.map(mapRow)
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!supabase) return undefined

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return undefined
  return mapRow(data as Record<string, unknown>)
}
