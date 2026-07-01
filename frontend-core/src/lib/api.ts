import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined

// Token cache — evita chamadas Supabase repetidas por request
let cachedToken: string | null = null
let tokenExpiresAt = 0
const TOKEN_CACHE_MS = 4 * 60 * 1000 // 4 min (Supabase JWT expira em 5 min)

async function getAuthToken(): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken
  }

  const { data: { session } } = await supabase.auth.getSession()
  cachedToken = session?.access_token ?? null
  tokenExpiresAt = now + TOKEN_CACHE_MS
  return cachedToken
}

// Escuta mudanças de sessão para invalidar/atualizar cache
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    cachedToken = null
    tokenExpiresAt = 0
  } else {
    cachedToken = session.access_token
    tokenExpiresAt = Date.now() + TOKEN_CACHE_MS
  }
})

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error('[Evolua] VITE_API_URL não definido. Configure o backend para ativar esta feature.')
  }

  // getUser() valida a identidade no servidor (não pode ser forjado via storage).
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('[Evolua] Usuário não autenticado.')
  }

  // Usa cache de token (evita getSession a cada request)
  const token = await getAuthToken()

  const isFormData = init?.body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json() as { error?: string; message?: string }
      detail = body.error ?? body.message ?? detail
    } catch {
      detail = res.statusText || detail
    }
    throw new Error(detail)
  }

  // 204 No Content não tem corpo JSON.
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)               => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
}
