import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type PostCategory = 'conscientizacao' | 'dica' | 'depoimento' | 'servico' | 'data'
export type PostFormat = 'feed' | 'stories' | 'reels' | 'carrossel'

export interface GenerateMarketingInput {
  topic: string
  platform?: 'instagram' | 'facebook' | 'linkedin' | 'tiktok'
  format?: PostFormat
}

export interface GenerateMarketingResponse {
  content: string
}

export function useGenerateMarketing() {
  return useMutation<GenerateMarketingResponse, Error, GenerateMarketingInput>({
    mutationFn: (body) =>
      api.post<GenerateMarketingResponse>('/api/ai/marketing/generate', {
        topic: body.topic,
        platform: body.platform ?? 'instagram',
        format: body.format ?? 'feed',
      }),
  })
}
