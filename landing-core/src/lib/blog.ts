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

function col(row: Record<string, unknown>, eng: string, pt: string): unknown {
  return row[eng] ?? row[pt]
}

function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titulo: String(col(row, 'title', 'titulo') ?? ''),
    subtitulo: String(col(row, 'excerpt', 'subtitulo') ?? ''),
    categoria: (col(row, 'category', 'categoria') as BlogPost['categoria']) ?? 'Tecnologia',
    autor: String(col(row, 'author', 'autor') ?? 'Equipe Evolua'),
    data: String(col(row, 'published_at', 'data') ?? ''),
    tempoLeitura: Number(col(row, 'read_time', 'tempo_leitura') ?? 5),
    destaque: Boolean(col(row, 'featured', 'destaque') ?? false),
    imagem: String(col(row, 'cover_image', 'imagem') ?? ''),
    corpo: String(col(row, 'content', 'corpo') ?? ''),
  }
}

const ALLOWED_IMAGE_HOSTS = [
  'cdn.evolua.app',
  'images.pexels.com',
  'diiaoaboykraaiavgdqs.supabase.co',
  'supabase.co',
]

export function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}

export async function fetchPosts(categoria?: string): Promise<BlogPost[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')

  if (error || !data) return []
  let posts = data.map((r) => mapRow(r as Record<string, unknown>))

  posts.sort((a, b) => {
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1
    return new Date(b.data).getTime() - new Date(a.data).getTime()
  })

  if (categoria && categoria !== 'Todos') {
    posts = posts.filter((p) => p.categoria === categoria)
  }

  return posts
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
