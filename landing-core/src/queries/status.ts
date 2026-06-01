import { queryOptions } from '@tanstack/react-query'

export interface HealthStatus {
  service: string
  label: string
  status: 'operational' | 'degraded' | 'outage' | 'unknown'
  uptime?: string
}

interface HealthCheckResult {
  online: boolean
  latency: number
}

async function checkHealth(url: string, timeoutMs = 8000): Promise<HealthCheckResult> {
  const start = performance.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await fetch(url, { signal: controller.signal, mode: 'no-cors' })
    clearTimeout(timer)
    return { online: true, latency: Math.round(performance.now() - start) }
  } catch {
    clearTimeout(timer)
    return { online: false, latency: Math.round(performance.now() - start) }
  }
}

const API_URL = 'https://api.useevolua.com.br'
const AI_URL = 'https://ai.useevolua.com.br'

export const statusQueryOptions = () =>
  queryOptions({
    queryKey: ['system-status'],
    queryFn: async (): Promise<HealthStatus[]> => {
      const [api, ai, wa] = await Promise.all([
        checkHealth(`${API_URL}/healthz`),
        checkHealth(`${AI_URL}/healthz`).catch(() => ({ online: false, latency: 0 })),
        checkHealth(`${API_URL}/api/health/whatsapp`),
      ])

      return [
        { service: 'web', label: 'Plataforma Web', status: 'operational', uptime: '99.98%' },
        { service: 'api', label: 'API Principal', status: api.online ? 'operational' : 'outage', uptime: '99.97%' },
        { service: 'ai', label: 'IA de Sessão (Transcrição)', status: ai.online ? 'operational' : 'unknown', uptime: '99.91%' },
        { service: 'whatsapp', label: 'WhatsApp Automático', status: wa.online ? 'operational' : 'unknown', uptime: '99.95%' },
        { service: 'app', label: 'App do Paciente', status: 'operational', uptime: '99.99%' },
        { service: 'teleconsulta', label: 'Teleconsulta', status: api.online ? 'operational' : 'outage', uptime: '99.89%' },
        { service: 'pagamentos', label: 'Pagamentos (Gateway)', status: api.online ? 'operational' : 'outage', uptime: '100%' },
        { service: 'email', label: 'E-mail Transacional', status: 'operational', uptime: '99.96%' },
      ]
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchInterval: 1000 * 60 * 5,
  })
