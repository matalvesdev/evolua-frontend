import { api } from "./client"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatSource {
  title: string
  source: string
  /** URL of the source document (may be undefined for manual seed entries) */
  source_url?: string
  similarity?: number
  /** @deprecated — kept for backward compat with old fallback responses */
  url?: string
  /** @deprecated */
  snippet?: string
}

export interface ChatResponse {
  answer: string
  sources: ChatSource[]
  latency_ms?: number
  model?: string
}

export async function sendChatMessage(
  question: string,
  history: ChatMessage[] = [],
  specialty?: string,
): Promise<ChatResponse> {
  return api.post<ChatResponse>("/ai-chat", { question, history, specialty })
}
