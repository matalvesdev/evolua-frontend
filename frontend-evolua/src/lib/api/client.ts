// ============================================================================
// API CLIENT - Comunicação com o backend NestJS (Hardened)
// ============================================================================

import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = (() => {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!envApiUrl) {
    return process.env.NODE_ENV === 'production'
      ? 'https://api.useevolua.online/api'
      : 'http://localhost:3333/api';
  }

  return envApiUrl.replace('api.useevolua.com.br', 'api.useevolua.online');
})();

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// ---------------------------------------------------------------------------
// Auth Headers
// ---------------------------------------------------------------------------

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Timeout
// ---------------------------------------------------------------------------

function withTimeout<T>(
  fetchFn: (signal: AbortSignal) => Promise<T>,
  ms: number = DEFAULT_TIMEOUT
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return fetchFn(controller.signal)
    .finally(() => clearTimeout(timer))
    .catch((err) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Tempo limite da requisição excedido');
      }
      throw err;
    });
}

// ---------------------------------------------------------------------------
// Error Sanitization
// ---------------------------------------------------------------------------

const STACK_TRACE_RE = /\s+at\s+[\w$./<>]+/;
const UNIX_PATH_RE = /\/[\w.-]+\/[\w./-]+/;
const WIN_PATH_RE = /[A-Z]:\\[\w.\\-]+/;
const MODULE_RE = /\b(?:node_modules|dist|build|\.next|__dirname|__filename|internal\/)\b/;

export function sanitizeErrorMessage(error: unknown): string {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    return 'Ocorreu um erro inesperado';
  }

  if (!message || message.trim() === '') {
    return 'Ocorreu um erro inesperado';
  }

  // Split into lines and filter out technical lines
  const lines = message.split('\n').filter((line) => {
    if (STACK_TRACE_RE.test(line)) return false;
    if (UNIX_PATH_RE.test(line)) return false;
    if (WIN_PATH_RE.test(line)) return false;
    if (MODULE_RE.test(line)) return false;
    return true;
  });

  const cleaned = lines.join('\n').trim();

  if (!cleaned) {
    return 'Ocorreu um erro inesperado';
  }

  return cleaned;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(signal);
    } catch (err) {
      lastError = err;

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) break;

      // Don't retry on abort (timeout)
      if (signal.aborted) break;

      // Only retry on retryable errors
      if (!isRetryableError(err)) break;

      await delay(RETRY_DELAYS[attempt] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1]);
    }
  }

  throw lastError;
}

function isRetryableError(err: unknown): boolean {
  // Network errors
  if (err instanceof TypeError) return true;
  // Our custom ApiError with 5xx status
  if (err instanceof ApiError && err.status >= 500 && err.status <= 599) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Custom Error Class
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// 401 Handling — Token Refresh
// ---------------------------------------------------------------------------

async function handleUnauthorized<T>(path: string, options: RequestInit): Promise<T> {
  const supabase = createClient();
  const { error } = await supabase.auth.refreshSession();

  if (error) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw new ApiError('Sessão expirada', 401);
  }

  // Retry with refreshed token
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(sanitizeErrorMessage(body.message || `Erro ${res.status}`), res.status);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Core Request Function
// ---------------------------------------------------------------------------

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  return withTimeout(async (signal) => {
    return withRetry(async (retrySignal) => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: retrySignal,
      });

      if (!res.ok) {
        // 401 — try token refresh
        if (res.status === 401) {
          return handleUnauthorized<T>(path, options);
        }

        const body = await res.json().catch(() => ({}));
        const rawMessage = body.message || `Erro ${res.status}`;

        // 4xx — reject immediately (no retry)
        if (res.status >= 400 && res.status <= 499) {
          throw new ApiError(sanitizeErrorMessage(rawMessage), res.status);
        }

        // 5xx — throw ApiError so withRetry can detect it
        throw new ApiError(sanitizeErrorMessage(rawMessage), res.status);
      }

      return res.json();
    }, signal);
  });
}

// ---------------------------------------------------------------------------
// Public API (surface unchanged)
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
